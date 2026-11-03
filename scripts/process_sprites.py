import os
from collections import deque
from PIL import Image

BRAIN_DIR = r"C:\Users\sontu\.gemini\antigravity\brain\85d2f58c-e37f-4354-aa69-10b753d3bee3"
OUT_DIR = os.path.join("public", "assets", "sprites")
os.makedirs(OUT_DIR, exist_ok=True)


def remove_white_bg_floodfill(img: Image.Image, threshold: int = 238) -> Image.Image:
    """
    Flood-fill from all 4 image borders to remove the outer white background
    without punching holes inside white clothing/highlights inside the sprite.
    Also applies soft alpha feathering on boundary pixels.
    """
    rgba = img.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    visited = [[False] * width for _ in range(height)]
    is_bg = [[False] * width for _ in range(height)]
    q = deque()

    def is_near_white(r, g, b):
        return r >= threshold and g >= threshold and b >= threshold

    # Seed from all border pixels
    for x in range(width):
        for y in (0, height - 1):
            r, g, b, _ = pixels[x, y]
            if is_near_white(r, g, b) and not visited[y][x]:
                visited[y][x] = True
                q.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            r, g, b, _ = pixels[x, y]
            if is_near_white(r, g, b) and not visited[y][x]:
                visited[y][x] = True
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        is_bg[cy][cx] = True
        pixels[cx, cy] = (255, 255, 255, 0)
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < width and 0 <= ny < height and not visited[ny][nx]:
                r, g, b, _ = pixels[nx, ny]
                if is_near_white(r, g, b):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # Feather 1px border next to background to eliminate white halo
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            if not is_bg[y][x]:
                adj_bg = sum(
                    1
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                    if is_bg[ny][nx]
                )
                if adj_bg > 0:
                    r, g, b, a = pixels[x, y]
                    brightness = (r + g + b) / 3.0
                    if brightness > 210:
                        new_a = int(max(0, min(255, (245 - brightness) * 5)))
                        pixels[x, y] = (r, g, b, new_a)

    return rgba


def crop_and_resize(rgba: Image.Image, target_height: int, pad: int = 6) -> Image.Image:
    bbox = rgba.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(rgba.width, right + pad)
        bottom = min(rgba.height, bottom + pad)
        rgba = rgba.crop((left, top, right, bottom))
    w, h = rgba.size
    if h > 0:
        scale = target_height / float(h)
        new_w = max(1, int(round(w * scale)))
        rgba = rgba.resize((new_w, target_height), Image.Resampling.LANCZOS)
    return rgba


def process_single(src_filename: str, out_filename: str, target_height: int):
    src_path = os.path.join(BRAIN_DIR, src_filename)
    img = Image.open(src_path)
    clean = remove_white_bg_floodfill(img)
    final_img = crop_and_resize(clean, target_height)
    out_path = os.path.join(OUT_DIR, out_filename)
    final_img.save(out_path, "PNG")
    print(f"Saved {out_path} ({final_img.size[0]}x{final_img.size[1]})")


def process_quad_grid(src_filename: str, outputs: list):
    """
    outputs: list of tuples (quadrant_index 0..3, out_filename, target_height)
    0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right
    """
    src_path = os.path.join(BRAIN_DIR, src_filename)
    img = Image.open(src_path)
    w, h = img.size
    mid_x, mid_y = w // 2, h // 2
    boxes = [
        (0, 0, mid_x, mid_y),
        (mid_x, 0, w, mid_y),
        (0, mid_y, mid_x, h),
        (mid_x, mid_y, w, h),
    ]
    for idx, out_filename, target_height in outputs:
        sub = img.crop(boxes[idx])
        clean = remove_white_bg_floodfill(sub)
        if out_filename == "prop_bamboo_bridge.png":
            # Also make enclosed pure-white gaps between bamboo railing bars transparent
            px = clean.load()
            cw, ch = clean.size
            for y in range(ch):
                for x in range(cw):
                    r, g, b, a = px[x, y]
                    if a > 0 and r > 236 and g > 236 and b > 236:
                        px[x, y] = (255, 255, 255, 0)
        final_img = crop_and_resize(clean, target_height)
        out_path = os.path.join(OUT_DIR, out_filename)
        final_img.save(out_path, "PNG")
        print(f"Saved {out_path} ({final_img.size[0]}x{final_img.size[1]})")


def main():
    process_single("house_village_1793440469536.jpg", "house_village.png", 230)
    process_single("boat_sampan_1793440490226.jpg", "boat_sampan.png", 125)
    process_single("banyan_tree_1793440548612.jpg", "banyan_tree.png", 270)

    process_quad_grid(
        "characters_showcase_1793440569384.jpg",
        [
            (0, "char_messenger.png", 92),
            (1, "char_elder.png", 94),
            (2, "char_scout.png", 94),
            (3, "char_boatman.png", 92),
        ],
    )

    process_quad_grid(
        "props_and_commander_1793440738994.jpg",
        [
            (0, "char_commander.png", 96),
            (1, "prop_tide_marker.png", 110),
            (2, "prop_bamboo_bridge.png", 145),
            (3, "prop_river_stakes.png", 115),
        ],
    )


if __name__ == "__main__":
    main()
