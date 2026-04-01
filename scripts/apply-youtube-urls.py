import json, sys

urls = {
    "travel": {
        "music": {
            "Tunnel Crawl": "https://www.youtube.com/watch?v=wScEFaoqwPM",
            "Magma Depths": "https://www.youtube.com/watch?v=b9xUoHavp34",
            "Tunnel Ambush": "https://www.youtube.com/watch?v=sd1Otp7s1Fk"
        },
        "sounds": {
            "Volcanic Rumbling": "https://www.youtube.com/watch?v=0bJZaxHcyWE",
            "Echoing Footsteps": "https://www.youtube.com/watch?v=3Hwr_BaekgM",
            "Sulfur Wind": "https://www.youtube.com/watch?v=Xi4DZOhHkI4",
            "Dripping Condensation": "https://www.youtube.com/watch?v=1nS7vjVUjBg"
        }
    },
    "overview": {
        "music": {
            "Fortress of Fire": "https://www.youtube.com/watch?v=6AlsnSQZP8I",
            "Legion March": "https://www.youtube.com/watch?v=V_FimUxIhSg",
            "Enclave Battle": "https://www.youtube.com/watch?v=HpZR2dK0mAI"
        },
        "sounds": {
            "Lava Flow": "https://www.youtube.com/watch?v=kTpglKDyn4s",
            "Distant Hammering": "https://www.youtube.com/watch?v=gS0sNL82Tvk",
            "Giant Footsteps": "https://www.youtube.com/watch?v=_1MnWDNc3uA",
            "Mountain Groaning": "https://www.youtube.com/watch?v=9ta0_OKYADg"
        }
    },
    "z1": {
        "music": {
            "Echoing Descent": "https://www.youtube.com/watch?v=W2NAblVD70Q",
            "Stair Guard Clash": "https://www.youtube.com/watch?v=fq8OSrIUST4",
            "Careful Approach": "https://www.youtube.com/watch?v=fv_7EurNAss"
        },
        "sounds": {
            "Stairwell Wind": "https://www.youtube.com/watch?v=Xi4DZOhHkI4",
            "Distant Forge Echoes": "https://www.youtube.com/watch?v=gS0sNL82Tvk",
            "Stone Crumbling": "https://www.youtube.com/watch?v=eqG-MeeCP4M"
        }
    },
    "z2": {
        "music": {
            "Held Breath": "https://www.youtube.com/watch?v=EApZmmYg_oQ",
            "Atrium Ambush": "https://www.youtube.com/watch?v=fq8OSrIUST4"
        },
        "sounds": {
            "Dripping Condensation": "https://www.youtube.com/watch?v=1nS7vjVUjBg",
            "Settling Stone": "https://www.youtube.com/watch?v=eqG-MeeCP4M",
            "Faint Wire Hum": "https://www.youtube.com/watch?v=EWmuR-IDSi4"
        }
    },
    "z3": {
        "music": {
            "Arena Energy": "https://www.youtube.com/watch?v=v5c0zLmVZR4",
            "Champion's Trial": "https://www.youtube.com/watch?v=3YO67uD8TAo",
            "Crucible Tension": "https://www.youtube.com/watch?v=YJp31PhwxYM"
        },
        "sounds": {
            "Roaring Crowd": "https://www.youtube.com/watch?v=plUgICpVAoc",
            "Combat Impacts": "https://www.youtube.com/watch?v=xyNMNnB6hpg",
            "Iron Railing Percussion": "https://www.youtube.com/watch?v=jtryyOoJROY"
        }
    },
    "z4": {
        "music": {
            "Military Discipline": "https://www.youtube.com/watch?v=V_FimUxIhSg",
            "Training Grounds Combat": "https://www.youtube.com/watch?v=BWoGeXrNs_g"
        },
        "sounds": {
            "Rhythmic Drilling": "https://www.youtube.com/watch?v=JQlwfPtgE0Y",
            "Training Cadence": "https://www.youtube.com/watch?v=EeZeFgA1iEE",
            "Weapon Impacts": "https://www.youtube.com/watch?v=nJTyTFi9Tho"
        }
    },
    "z5": {
        "music": {
            "Heart of the Forge": "https://www.youtube.com/watch?v=gS0sNL82Tvk",
            "Forge Fight": "https://www.youtube.com/watch?v=HpZR2dK0mAI"
        },
        "sounds": {
            "Anvil Hammering": "https://www.youtube.com/watch?v=jtryyOoJROY",
            "Bellows Breathing": "https://www.youtube.com/watch?v=pRkFl9j3NLk",
            "Quenching Hiss": "https://www.youtube.com/watch?v=4LXZlwhOLpU",
            "Crackling Forge Fire": "https://www.youtube.com/watch?v=UgHKb_7884o"
        }
    },
    "z6": {
        "music": {
            "Hearth and Hall": "https://www.youtube.com/watch?v=u2jLHdpo2AQ",
            "Under the Table": "https://www.youtube.com/watch?v=orgikrTCKTc"
        },
        "sounds": {
            "Giant Conversation": "https://www.youtube.com/watch?v=KecVJnJcSI4",
            "Eating and Drinking": "https://www.youtube.com/watch?v=x3skYa2i6Bg",
            "Cooking Fires": "https://www.youtube.com/watch?v=rv3Nl-Od9YU",
            "Barking Laughter": "https://www.youtube.com/watch?v=aismlmjx_dU"
        }
    },
    "z7": {
        "music": {
            "Quiet Refuge": "https://www.youtube.com/watch?v=205meIww0zg",
            "Something Stirs": "https://www.youtube.com/watch?v=KZNoPUbaVnk"
        },
        "sounds": {
            "Muffled Enclave": "https://www.youtube.com/watch?v=bxoRRobHtGM",
            "Creaking Crates": "https://www.youtube.com/watch?v=UIILo99ynsA",
            "Dripping Water": "https://www.youtube.com/watch?v=1fubiyN7fz0"
        }
    },
    "z8": {
        "music": {
            "Sleeping Giants": "https://www.youtube.com/watch?v=EApZmmYg_oQ",
            "They Wake": "https://www.youtube.com/watch?v=sd1Otp7s1Fk"
        },
        "sounds": {
            "Deep Rumbling Snores": "https://www.youtube.com/watch?v=vtbPDI1elI8",
            "Shifting Giants": "https://www.youtube.com/watch?v=_1MnWDNc3uA",
            "Pebble Rain": "https://www.youtube.com/watch?v=aicf1XwW0rg"
        }
    },
    "z9": {
        "music": {
            "Meditation at the Core": "https://www.youtube.com/watch?v=WEEltzTwbE4",
            "Volcano's Wrath": "https://www.youtube.com/watch?v=HpZR2dK0mAI",
            "Sacred Ground": "https://www.youtube.com/watch?v=5Y7oXb_Vmsc"
        },
        "sounds": {
            "Bubbling Lava Core": "https://www.youtube.com/watch?v=lxNvXSpvc3s",
            "Meditative Chanting": "https://www.youtube.com/watch?v=rrE1EFE5MqI",
            "Brazier Flames": "https://www.youtube.com/watch?v=pKawKRacplM",
            "Volcanic Updraft": "https://www.youtube.com/watch?v=0bJZaxHcyWE"
        }
    },
    "z10": {
        "music": {
            "Hidden Wonder": "https://www.youtube.com/watch?v=TfdXgKdogTM",
            "Sanctum Silence": "https://www.youtube.com/watch?v=2m5QCnQV70k"
        },
        "sounds": {
            "Eerie Silence": "https://www.youtube.com/watch?v=Jh9E7Cus7JA",
            "Lava Glow Hum": "https://www.youtube.com/watch?v=i56VB6j6kHE",
            "Mineral Water Drip": "https://www.youtube.com/watch?v=1nS7vjVUjBg",
            "Treasure Glitter": "https://www.youtube.com/watch?v=TfdXgKdogTM"
        }
    }
}

with open("data/adventures/molten-enclave/zones.json", "r", encoding="utf-8") as f:
    data = json.load(f)

all_zones = []
if data.get("travelSection"):
    all_zones.append(("travel", data["travelSection"]))
if data.get("zoneOverview"):
    all_zones.append(("overview", data["zoneOverview"]))
for z in data.get("zones", []):
    all_zones.append((z["id"], z))

updated = 0
skipped = 0

for zone_key, zone in all_zones:
    if zone_key not in urls:
        continue
    ambiance = zone.get("ambiance")
    if not ambiance:
        continue
    zone_urls = urls[zone_key]
    for track in ambiance.get("music", []):
        if track["name"] in zone_urls.get("music", {}):
            track["youtubeUrl"] = zone_urls["music"][track["name"]]
            updated += 1
        else:
            skipped += 1
    for track in ambiance.get("sounds", []):
        if track["name"] in zone_urls.get("sounds", {}):
            track["youtubeUrl"] = zone_urls["sounds"][track["name"]]
            updated += 1
        else:
            skipped += 1

with open("data/adventures/molten-enclave/zones.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated: {updated} tracks with YouTube URLs")
print(f"Skipped: {skipped} tracks (no URL match)")
