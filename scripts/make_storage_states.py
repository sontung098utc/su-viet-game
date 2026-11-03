import json
import os
import subprocess

ARTIFACT_DIR = r"C:\Users\sontu\.gemini\antigravity\brain\85d2f58c-e37f-4354-aa69-10b753d3bee3"
SCRATCH_DIR = os.path.join(ARTIFACT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)


def make_storage(progress_dict):
    return {
        "cookies": [],
        "origins": [
            {
                "origin": "http://localhost:5173",
                "localStorage": [
                    {
                        "name": "MAT_MA_SU_VIET_PROGRESS_V1",
                        "value": json.dumps(progress_dict, ensure_ascii=False),
                    }
                ],
            }
        ],
    }


base_progress = {
    "schemaVersion": 2,
    "playerName": "Tiểu Kỳ",
    "avatarOutfit": "brown",
    "gameMode": "GUIDED",
    "soundEnabled": True,
    "audioSettings": {
        "soundEnabled": True,
        "voiceEnabled": True,
        "voiceVolume": 0.9,
        "bgmVolume": 0.45,
        "sfxVolume": 0.7,
        "useBrowserTtsFallback": False,
    },
    "currentScreen": "GAME",
    "questStage": "STAGE_0_PROLOGUE",
    "inventory": ["order_token"],
    "riverTidePhase": "LOW_TIDE",
    "playerPosition": {"x": 480, "y": 1005, "zone": "VILLAGE"},
    "observedLowTideMarker": False,
    "observedHighTideMarker": False,
    "helpedVillagerWood": False,
    "floodedPathSolution": "NONE",
    "missions": {
        "mission-1": {"completed": False, "score": 0, "unlockedClues": [], "attempts": 0},
        "mission-2": {"completed": False, "score": 0, "unlockedClues": [], "attempts": 0},
        "mission-3": {"completed": False, "score": 0, "unlockedClues": [], "attempts": 0},
    },
    "discoveredFacts": ["fact-simulation-and-fiction-note", "fact-kieu-cong-tien-cause"],
    "chapter1Completed": False,
    "completedRecapOrder": False,
    "lastSavedAt": "2026-10-31T10:00:00.000Z",
}

# 1. Village + Voice Dialogue + Ambient Villagers
p1 = dict(base_progress)
p1["playerPosition"] = {"x": 470, "y": 995, "zone": "VILLAGE"}
s1_path = os.path.join(SCRATCH_DIR, "state1.json")
with open(s1_path, "w", encoding="utf-8") as f:
    json.dump(make_storage(p1), f, ensure_ascii=False)

# 2. Low Causeway + Boatman Nam + Audio Mixer
p2 = dict(base_progress)
p2["questStage"] = "STAGE_5_FIRST_RIVER_VISIT"
p2["inventory"] = ["order_token", "iron_bands"]
p2["playerPosition"] = {"x": 965, "y": 1055, "zone": "VILLAGE"}
s2_path = os.path.join(SCRATCH_DIR, "state2.json")
with open(s2_path, "w", encoding="utf-8") as f:
    json.dump(make_storage(p2), f, ensure_ascii=False)

# 3. High Tide Flooded Low Causeway + River Pier + 2 Solutions
p3 = dict(base_progress)
p3["questStage"] = "STAGE_6_FLOODED_PATH_CHOICE"
p3["riverTidePhase"] = "HIGH_TIDE"
p3["inventory"] = ["order_token", "tide_report"]
p3["playerPosition"] = {"x": 1220, "y": 1085, "zone": "RIVER"}
s3_path = os.path.join(SCRATCH_DIR, "state3.json")
with open(s3_path, "w", encoding="utf-8") as f:
    json.dump(make_storage(p3), f, ensure_ascii=False)

shots = [
    (
        s1_path,
        "1366,768",
        "http://localhost:5173/?demoDialogue=village_intro",
        os.path.join(ARTIFACT_DIR, "showcase_1_village_voice_dialogue.png"),
    ),
    (
        s2_path,
        "1366,768",
        "http://localhost:5173/?openAudioMixer=1",
        os.path.join(ARTIFACT_DIR, "showcase_2_audio_mixer_and_low_causeway.png"),
    ),
    (
        s3_path,
        "1366,768",
        "http://localhost:5173/",
        os.path.join(ARTIFACT_DIR, "showcase_3_pier_flooded_situation.png"),
    ),
    (
        s2_path,
        "390,844",
        "http://localhost:5173/",
        os.path.join(ARTIFACT_DIR, "showcase_4_mobile_viewport.png"),
    ),
]

for state_file, vp, url, out_png in shots:
    cmd = [
        "npx.cmd",
        "playwright",
        "screenshot",
        "--channel=msedge",
        f"--load-storage={state_file}",
        f"--viewport-size={vp}",
        "--wait-for-timeout=2200",
        url,
        out_png,
    ]
    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)
