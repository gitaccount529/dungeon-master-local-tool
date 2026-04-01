#!/bin/bash
# ============================================================
# DND Ambience Music Downloader
# Source: Soundimage.org by Eric Matyas
# License: Free to use WITH attribution (see CREDITS.txt)
# Attribution: https://soundimage.org/attribution-info/
# ============================================================

OUTPUT_DIR="./dnd-music"
mkdir -p "$OUTPUT_DIR"

# --- Track list: [filename]=[url] ---
declare -A TRACKS=(
  # --- Exploration / Overworld ---
  ["our-mountain.mp3"]="https://soundimage.org/wp-content/uploads/2014/09/Our-Mountain_v003.mp3"
  ["our-mountain-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Our-Mountain_v003_Looping.mp3"
  ["netherplace.mp3"]="https://soundimage.org/wp-content/uploads/2014/08/Netherplace.mp3"
  ["netherplace-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Netherplace_Looping.mp3"
  ["fantascape.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Fantascape.mp3"
  ["fantascape-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Fantascape_Looping.mp3"
  ["lost-jungle.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Lost-Jungle.mp3"
  ["lost-jungle-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Lost-Jungle_Looping.mp3"

  # --- Dungeon / Eerie ---
  ["misty-bog.mp3"]="https://soundimage.org/wp-content/uploads/2020/06/Misty-Bog_remixed.mp3"
  ["misty-bog-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Misty-Bog_Looping.mp3"
  ["bog-creatures.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Bog-Creatures-On-the-Move.mp3"
  ["bog-creatures-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Bog-Creatures-On-the-Move_Looping.mp3"
  ["fantasy-game-background.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Fantasy_Game_Background.mp3"
  ["city-beneath-waves.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/City-Beneath-the-Waves.mp3"

  # --- Puzzle / Town / Downtime ---
  ["puzzle-game.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Puzzle-Game.mp3"
  ["puzzle-game-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Puzzle-Game_Looping.mp3"
  ["magic-clock-shop.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Magic-Clock-Shop.mp3"
  ["magic-clock-shop-loop.mp3"]="https://soundimage.org/wp-content/uploads/2018/10/Magic-Clock-Shop_Looping.mp3"
  ["game-menu.mp3"]="https://soundimage.org/wp-content/uploads/2023/12/Game-Menu.mp3"
)

echo "Downloading DND ambience tracks to: $OUTPUT_DIR"
echo "----------------------------------------------------"

SUCCESS=0
FAILED=0

for FILENAME in "${!TRACKS[@]}"; do
  URL="${TRACKS[$FILENAME]}"
  DEST="$OUTPUT_DIR/$FILENAME"

  if [ -f "$DEST" ]; then
    echo "  [SKIP] $FILENAME (already exists)"
    continue
  fi

  echo "  [DL]   $FILENAME"
  if curl -sL --fail -o "$DEST" "$URL"; then
    echo "  [OK]   $FILENAME"
    ((SUCCESS++))
  else
    echo "  [FAIL] $FILENAME — $URL"
    rm -f "$DEST"
    ((FAILED++))
  fi
done

# --- Write credits file ---
cat > "$OUTPUT_DIR/CREDITS.txt" << 'EOF'
==============================================
  DND AMBIENCE MUSIC — ATTRIBUTION
==============================================
Music by Eric Matyas — https://soundimage.org

These tracks are free to use in personal and
commercial projects WITH proper attribution.

Required attribution text (use as-is):
  "Music by Eric Matyas — https://soundimage.org"

Full attribution guidelines:
  https://soundimage.org/attribution-info/
==============================================
EOF

echo ""
echo "----------------------------------------------------"
echo "Done! $SUCCESS downloaded, $FAILED failed."
echo "CREDITS.txt written to $OUTPUT_DIR/"
echo ""
echo "Track categories:"
echo "  Exploration/Overworld : our-mountain, netherplace, fantascape, lost-jungle"
echo "  Dungeon/Eerie         : misty-bog, bog-creatures, fantasy-game-background, city-beneath-waves"
echo "  Town/Downtime/Puzzle  : puzzle-game, magic-clock-shop, game-menu"