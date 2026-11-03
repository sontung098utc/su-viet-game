import asyncio
import os
import edge_tts

OUTPUT_DIR = os.path.join("public", "audio", "vo")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE_BY_SPEAKER = {
    "messenger": "vi-VN-HoaiMyNeural",
    "elder": "en-US-AndrewMultilingualNeural",
    "boatman": "vi-VN-NamMinhNeural",
    "scout": "en-US-BrianMultilingualNeural",
    "commander": "de-DE-FlorianMultilingualNeural",
    "blacksmith": "it-IT-GiuseppeMultilingualNeural",
    "villager": "fr-FR-RemyMultilingualNeural",
    "ngo_quyen": "fr-FR-RemyMultilingualNeural",
}

FALLBACK_VOICES = [
    "vi-VN-NamMinhNeural",
    "en-US-BrianMultilingualNeural",
    "en-US-AndrewMultilingualNeural",
]

ALL_LINES = [
    # 1. Mở đầu & Thử thách A (Giải mã điểm hẹn)
    {
        "id": "dlg_village_intro_01",
        "speaker": "elder",
        "force": True,
        "text": "Cháu đến rồi đó ư! Nghe tiếng trống hiệu dồn dập ngoài doanh trại chưa, giặc Nam Hán sắp tràn vào cửa biển rồi đấy.",
    },
    {
        "id": "dlg_village_intro_02",
        "speaker": "messenger",
        "force": False,
        "text": "Dạ thưa cụ! Sao quân Nam Hán lại kéo sang gấp gáp thế ạ? Cháu thấy dân làng mình ai cũng tất tả chuẩn bị.",
    },
    {
        "id": "dlg_village_intro_03",
        "speaker": "elder",
        "force": False,
        "text": "Tại tên Kiều Công Tiễn làm phản, hại chủ tướng Dương Đình Nghệ rồi rước giặc ngoài vào. May mà Ngô Vương đã từ Ái Châu tiến ra trừ xong tên phản tặc ấy rồi!",
    },
    {
        "id": "dlg_village_intro_04",
        "speaker": "elder",
        "force": True,
        "text": "Để giữ bí mật trước tai mắt do thám, người giữ Thẻ Lệnh đang đợi cháu ở Điểm Hẹn trong làng: hãy tìm ngôi nhà tranh có khói bếp trắng, đôi chum sành trước hiên và cột cờ buộc dải lụa đỏ!",
    },
    {
        "id": "dlg_village_intro_05",
        "speaker": "messenger",
        "force": True,
        "text": "Dạ rõ ạ! Cháu sẽ quan sát kỹ từng ngôi nhà quanh sân làng để tìm đúng nơi có đủ ba dấu hiệu ấy ngay!",
    },
    {
        "id": "dlg_cha_wrong_sw_01",
        "speaker": "messenger",
        "force": True,
        "text": "Ngôi nhà này có đôi chum sành trước hiên, nhưng mái nhà không có khói bếp và cột tre lại buộc dải vải chàm xanh. Chưa đúng với mật tín rồi, mình phải tìm ngôi nhà khác!",
    },
    {
        "id": "dlg_cha_wrong_ban_01",
        "speaker": "messenger",
        "force": True,
        "text": "Dưới gốc đa cổ thụ có dải lụa đỏ và khói hương, nhưng đây là miếu đá chứ không phải ngôi nhà tranh có đặt đôi chum sành trước hiên. Mình hãy nhìn lên hai nếp nhà phía bắc sân làng xem!",
    },
    {
        "id": "dlg_cha_success_01",
        "speaker": "villager",
        "force": True,
        "text": "Chính xác! Em đã quan sát rất tinh tường cả ba dấu hiệu mật tín: khói bếp trắng, đôi chum sành và cột cờ dải lụa đỏ.",
    },
    {
        "id": "dlg_cha_success_02",
        "speaker": "villager",
        "force": True,
        "text": "Hãy cầm lấy Thẻ Lệnh Doanh Trại này rồi đi theo con đường đất hướng Đông Bắc lên Khu Chuẩn Bị trình diện Đội trưởng Lê ngay nhé!",
    },
    # 2. Thử thách B (Ghép thông tin từ nhiều người ở Khu Chuẩn Bị)
    {
        "id": "dlg_cmd_init_01",
        "speaker": "commander",
        "force": True,
        "text": "Em đến đúng lúc lắm! Quân Nam Hán cậy có thuyền to sắp tiến vào cửa biển, nên Ngô Vương đã truyền lệnh chuẩn bị trận địa cọc ngầm dưới sông.",
    },
    {
        "id": "dlg_cmd_init_02",
        "speaker": "messenger",
        "force": True,
        "text": "Dạ thưa Đội trưởng, trong bãi tập kết có nhiều kiện gỗ và tre khác nhau, em cần chọn kiện hàng nào để chuyển xuống bến sông ạ?",
    },
    {
        "id": "dlg_cmd_init_03",
        "speaker": "commander",
        "force": True,
        "text": "Hãy hỏi Quân Sĩ Vạt Cọc và Bác Thợ Rèn Tạo, đồng thời xem Bàn Bản Đồ Thủy Văn ở sân trại. Ghép đủ thông tin rồi chọn đúng Giá Cọc đạt chuẩn để mang đai sắt xuống bến cho Trinh sát Hải nhé!",
    },
    {
        "id": "dlg_wood_01",
        "speaker": "villager",
        "force": True,
        "text": "Bọn anh đang vạt nhọn đầu những thân cọc gỗ lớn. Thuyền giặc Nam Hán rất to và nặng, phải dùng thân gỗ lớn vạt nhọn chứ tre nứa mảnh sẽ gãy vụn ngay!",
    },
    {
        "id": "dlg_smith_01",
        "speaker": "blacksmith",
        "force": True,
        "text": "Cháu hỏi quy cách mũi cọc hả? Cọc gỗ vạt nhọn mà để đầu gỗ trần thì đóng xuống lòng sông sẽ tước mũi mất, bắt buộc phải bọc Đai Sắt vừa tôi cứng ở đầu cọc!",
    },
    {
        "id": "dlg_smith_02",
        "speaker": "messenger",
        "force": True,
        "text": "Thì ra vậy! Phải kết hợp cả thân cọc gỗ lớn vạt nhọn lẫn đầu bịt sắt của bác thì mới xuyên thủng được chiến thuyền lớn của giặc.",
    },
    {
        "id": "dlg_map_01",
        "speaker": "messenger",
        "force": True,
        "text": "Trên sa bàn ghi rõ: Cọc lớn vạt nhọn bịt sắt được tập kết ở giá phía Đông lò rèn để chuyển thẳng xuống cửa biển lúc nước ròng!",
    },
    {
        "id": "dlg_chb_need_clues_01",
        "speaker": "messenger",
        "force": True,
        "text": "Mình chưa nắm đủ quy cách cọc để phân biệt các kiện hàng này. Hãy trò chuyện với Quân Sĩ Vạt Cọc và Bác Thợ Rèn Tạo ngay gần đây trước đã!",
    },
    {
        "id": "dlg_chb_wrong_bamboo_01",
        "speaker": "messenger",
        "force": True,
        "text": "Đây chỉ là những bó tre nứa nhỏ dùng dựng rào trại. Quân sĩ vạt cọc đã dặn phải dùng thân gỗ lớn vạt nhọn mới cản nổi thuyền chiến Nam Hán!",
    },
    {
        "id": "dlg_chb_wrong_unbanded_01",
        "speaker": "messenger",
        "force": True,
        "text": "Đống cọc gỗ này đã vạt nhọn nhưng mũi gỗ còn để trần, chưa hề bọc đai sắt. Bác Tạo dặn phải lấy lô cọc đã bịt đầu sắt ở phía Đông lò rèn cơ!",
    },
    {
        "id": "dlg_smith_deliver_01",
        "speaker": "blacksmith",
        "force": True,
        "text": "Cháu chọn chuẩn xác lắm! Đúng là lô cọc gỗ lớn vạt nhọn đã bọc đầu sắt tôi cứng này rồi. Cháu mang Bó Đai Sắt dự phòng đi qua lối đá thấp xuống Bến Quan Sát giao cho Trinh sát Hải nhé!",
    },
    {
        "id": "dlg_vil_charcoal_01",
        "speaker": "villager",
        "force": True,
        "text": "Bà con trong làng ai cũng căm giận tên Kiều Công Tiễn rước giặc về nhà, nên thức trắng đêm đốt than củi già tiếp sức cho lò rèn của bác Tạo đấy!",
    },
    {
        "id": "dlg_boatman_warn_01",
        "speaker": "boatman",
        "force": True,
        "text": "Này cháu đưa tin! Có ra bến sông thì đi qua lối đá thấp ngay bây giờ đi, kẻo lát nữa nước triều dâng lên là ngập sâu mất lối đấy!",
    },
    # 3. Thử thách C (Con nước thủy triều, địa hình lạch ngập & thời điểm phát cờ)
    {
        "id": "dlg_pier_low_01",
        "speaker": "scout",
        "force": False,
        "text": "Em ra đúng lúc lắm! Nhìn xuống chân cột mốc đá và lòng sông kìa, đang lúc nước ròng nên hàng cọc vạt nhọn bịt sắt còn lộ rõ mồn một.",
    },
    {
        "id": "dlg_pier_low_02",
        "speaker": "messenger",
        "force": True,
        "text": "Em thấy rồi! Cọc gỗ đóng dày dưới bùn, đầu bọc sắt sáng loáng. Nhưng nếu cọc lộ thế này thì thuyền giặc nhìn thấy mất anh Trinh sát Hải nhỉ?",
    },
    {
        "id": "dlg_pier_low_03",
        "speaker": "scout",
        "force": False,
        "text": "Chính vì thế ta mới đợi con nước! Kìa, nghe tiếng sóng rì rầm không? Nước triều bắt đầu dâng lên nhanh rồi đấy!",
    },
    {
        "id": "dlg_pier_flood_01",
        "speaker": "messenger",
        "force": False,
        "text": "Ôi! Nước triều dâng nhanh quá, vừa che kín hết bãi cọc ngoài sông, lại làm ngập luôn cả lối đá thấp quay về làng rồi!",
    },
    {
        "id": "dlg_pier_flood_02",
        "speaker": "scout",
        "force": False,
        "text": "Lối thấp ngập sâu không lội qua được nữa đâu! Em phải mang báo cáo về cho Đội trưởng Lê ngay: một là tìm đường vòng qua cầu tre trên gò cao, hai là nhờ bác Năm chèo đò đưa qua lạch nước!",
    },
    {
        "id": "dlg_chc_wrong_flood_01",
        "speaker": "messenger",
        "force": True,
        "text": "Nước triều ở lối đá thấp đang chảy xiết và ngập quá ngực! Nếu cố lội qua đây sẽ bị cuốn trôi mất báo cáo. Mình phải đi vòng lên Cầu Tre Gò Cao phía Bắc hoặc gọi đò bác Năm ở phía Nam!",
    },
    {
        "id": "dlg_boatman_help_01",
        "speaker": "boatman",
        "force": False,
        "text": "Lối đá thấp ngập trắng nước rồi phải không? Lên thuyền đi cháu, bác vừa trét lại dầu rái xong, bác chống sào đưa cháu sang bờ làng ngay!",
    },
    {
        "id": "dlg_boatman_help_02",
        "speaker": "messenger",
        "force": True,
        "text": "May quá có chiếc thuyền của bác Năm. Nước lên nhanh thế này thảo nào ngoài sông lớn không còn thấy mũi cọc nào nữa.",
    },
    {
        "id": "dlg_bridge_help_01",
        "speaker": "messenger",
        "force": False,
        "text": "May quá, trên gò cao có cây cầu tre bắc qua lạch nước! Đi đường vòng này hơi xa một chút nhưng khô ráo và an toàn.",
    },
    {
        "id": "dlg_commander_report_01",
        "speaker": "commander",
        "force": False,
        "text": "Khá lắm! Chính nhờ con nước triều dâng làm ngập lối đi của em mà toàn bộ bãi cọc bịt sắt ngoài cửa biển cũng đã được giấu kín dưới mặt sông.",
    },
    {
        "id": "dlg_commander_report_02",
        "speaker": "commander",
        "force": True,
        "text": "Hãy cầm lấy Cờ Hiệu Xuất Kích này quay lại Bến Quan Sát! Nhớ kỹ: phải quan sát Cột Mốc Đá chờ đúng thời điểm nước triều bắt đầu rút mạnh mới phát cờ tổng phản công nhé!",
    },
    {
        "id": "dlg_chc_wrong_early_01",
        "speaker": "scout",
        "force": True,
        "text": "Khoan phất cờ tổng phản công đã em ơi! Nhìn Cột Mốc Đá bên phải kìa: nước triều vẫn đang ở đỉnh vạch đỏ, cọc còn chìm sâu nên nếu đánh ép ngay bây giờ thuyền giặc sẽ rút thoát ra biển mất!",
    },
    {
        "id": "dlg_marker_ebb_01",
        "speaker": "messenger",
        "force": True,
        "text": "Nhìn vạch nước trên Cột Mốc Đá kìa! Thuyền nhẹ của ta đã nhử đoàn thuyền Hoằng Tháo vượt qua vùng cọc ngầm, và mực nước đang bắt đầu rút xuống nhanh!",
    },
    {
        "id": "dlg_marker_ebb_02",
        "speaker": "scout",
        "force": True,
        "text": "Đúng thời khắc vàng rồi! Mau sang cầu tàu trao Cờ Hiệu Xuất Kích cho anh để phát hiệu lệnh tổng phản công ngay lập tức!",
    },
    {
        "id": "dlg_climax_01",
        "speaker": "scout",
        "force": False,
        "text": "Nhìn ra cửa sông kìa! Nước triều rút mạnh cuốn thuyền lớn của Hoằng Tháo va thẳng vào hàng cọc bịt sắt đang nhô lên!",
    },
    {
        "id": "dlg_climax_02",
        "speaker": "ngo_quyen",
        "force": False,
        "text": "Nước triều đã rút, thế giặc đã tan! Toàn quân thừa thắng tiến lên giữ vững bờ cõi giang sơn!",
    },
]


async def generate_one(item):
    out_path = os.path.join(OUTPUT_DIR, f"{item['id']}.mp3")
    regen_only = {"dlg_chb_wrong_unbanded_01"}
    if item["id"] not in regen_only and os.path.exists(out_path) and os.path.getsize(out_path) > 2000:
        print(f"OK (cached): {item['id']}.mp3 ({os.path.getsize(out_path)} bytes)")
        return True

    primary_voice = VOICE_BY_SPEAKER[item["speaker"]]
    candidate_voices = [primary_voice] + ([] if item["speaker"] == "messenger" else [v for v in FALLBACK_VOICES if v != primary_voice])

    for voice in candidate_voices:
        for attempt in range(5):
            try:
                communicate = edge_tts.Communicate(item["text"], voice)
                await communicate.save(out_path)
                if os.path.exists(out_path) and os.path.getsize(out_path) > 2000:
                    print(f"Generated: {item['id']}.mp3 [{voice}] ({os.path.getsize(out_path)} bytes)")
                    return True
            except Exception as e:
                print(f"Retry {attempt + 1} for {item['id']} [{voice}]: {e}")
                await asyncio.sleep(0.9)
    print(f"ERROR: Failed to generate {item['id']}")
    return False


async def main():
    success_count = 0
    for item in ALL_LINES:
        ok = await generate_one(item)
        if ok:
            success_count += 1
        await asyncio.sleep(0.25)
    print(f"\nSummary: {success_count}/{len(ALL_LINES)} audio files ready in {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
