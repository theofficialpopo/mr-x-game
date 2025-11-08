# 🎵 Sound MVP - Quick Start Checklist

## 🚀 Quick Setup (30 minutes)

### Step 1: Generate Sounds (15 min)
Go to **https://elevenlabs.io/sound-effects** and generate these 15 sounds:

| # | File Name | AI Prompt | Length |
|---|-----------|-----------|--------|
| 1 | `click.mp3` | "Soft digital button click, subtle, modern UI sound" | 0.3s |
| 2 | `hover.mp3` | "Very subtle whoosh, gentle air movement, barely audible" | 0.2s |
| 3 | `toggle.mp3` | "Switch flipping sound, satisfying toggle, positive tone" | 0.4s |
| 4 | `error.mp3` | "Error beep, negative tone, not harsh, apologetic notification" | 0.5s |
| 5 | `success.mp3` | "Success chime, positive ascending notes, cheerful confirmation" | 0.5s |
| 6 | `station-select.mp3` | "Map pin dropping on board, soft thud with slight echo" | 0.5s |
| 7 | `taxi.mp3` | "London black cab engine starting, classic taxi motor, short burst" | 1.5s |
| 8 | `bus.mp3` | "London double-decker bus engine, diesel motor, powerful, brief" | 1.5s |
| 9 | `underground.mp3` | "London Underground train arriving, tube station platform, brief" | 1.5s |
| 10 | `water.mp3` | "River ferry horn blast, Thames boat, London waterway" | 1.5s |
| 11 | `menu-theme.mp3` | "Dark mysterious jazz noir music, detective theme, smoky lounge, looping, 2 minutes, seamless loop" | 2-3min |
| 12 | `gameplay-calm.mp3` | "Calm detective investigation music, jazzy noir soundtrack, thinking music, seamless loop, 2 minutes" | 2-3min |
| 13 | `turn-start.mp3` | "Your turn begins, gentle chime, positive notification" | 0.8s |
| 14 | `mr-x-reveal.mp3` | "Dramatic reveal, suspenseful chord, mystery uncovered, cinematic" | 2s |
| 15 | `london-ambience.mp3` | "London city street ambience, distant traffic, urban atmosphere, loopable, 30 seconds" | 30-60s |

---

### Step 2: Create Folders (1 min)

```bash
cd /home/user/mr-x-game
mkdir -p packages/client/public/audio/{ui,stations,transport,music,ambient,game}
```

---

### Step 3: Place Downloaded Files (5 min)

Copy your downloaded MP3 files to these exact locations:

```
packages/client/public/audio/
├── ui/
│   ├── click.mp3          ← File #1
│   ├── hover.mp3          ← File #2
│   ├── toggle.mp3         ← File #3
│   ├── error.mp3          ← File #4
│   └── success.mp3        ← File #5
├── stations/
│   └── station-select.mp3 ← File #6
├── transport/
│   ├── taxi.mp3           ← File #7
│   ├── bus.mp3            ← File #8
│   ├── underground.mp3    ← File #9
│   └── water.mp3          ← File #10
├── music/
│   ├── menu-theme.mp3     ← File #11
│   └── gameplay-calm.mp3  ← File #12
├── game/
│   ├── turn-start.mp3     ← File #13
│   └── mr-x-reveal.mp3    ← File #14
└── ambient/
    └── london-ambience.mp3 ← File #15
```

**Verify:**
```bash
ls -R packages/client/public/audio/
```

You should see all 15 files!

---

### Step 4: Install Dependencies (1 min)

```bash
pnpm add howler
pnpm add -D @types/howler
```

---

### Step 5: Code Implementation (8+ hours)

Now implement the sound system. Create these files in order:

#### A. Type Definitions
```
✅ packages/client/src/types/audio.ts
```

#### B. Sound Service
```
✅ packages/client/src/services/audio/soundConfig.ts
✅ packages/client/src/services/audio/SoundManager.ts
```

#### C. React Hooks
```
✅ packages/client/src/hooks/useSoundEffect.ts
✅ packages/client/src/hooks/useBackgroundMusic.ts
✅ packages/client/src/hooks/useSoundEngine.ts
```

#### D. State Management
```
✅ packages/client/src/stores/soundStore.ts
```

#### E. UI Components
```
✅ packages/client/src/components/Sound/SoundControls.tsx
```

#### F. Integration
```
✅ Update: packages/client/src/App.tsx
✅ Update: packages/client/src/components/Board/SVGBoard.tsx
✅ Update: packages/client/src/components/Board/MapboxBoard.tsx
```

---

## 🎯 Expected Behavior After Implementation

When you run `pnpm dev`, you should experience:

✅ **Background music** plays when app loads (jazz noir theme)
✅ **Click sound** plays when clicking stations
✅ **Toggle sound** plays when switching SVG ↔ Mapbox views
✅ **Volume controls** appear in UI (sliders for Master/Music/SFX)
✅ **Mute button** silences all audio
✅ **Settings persist** after page reload

---

## 🧪 Quick Test

After implementation, test these:

```bash
# Start dev server
pnpm dev

# Open browser: http://localhost:3000
# Then test:
```

1. ✅ Music should auto-play (or show "Enable Sound" button on mobile)
2. ✅ Click any station → hear `station-select.mp3`
3. ✅ Toggle SVG/Mapbox → hear `toggle.mp3`
4. ✅ Open sound controls → adjust volume
5. ✅ Click mute → all sounds stop
6. ✅ Reload page → settings should be remembered

---

## 📋 File Checklist

Print this and check off as you go:

### Audio Files Generated & Placed:
- [ ] `ui/click.mp3`
- [ ] `ui/hover.mp3`
- [ ] `ui/toggle.mp3`
- [ ] `ui/error.mp3`
- [ ] `ui/success.mp3`
- [ ] `stations/station-select.mp3`
- [ ] `transport/taxi.mp3`
- [ ] `transport/bus.mp3`
- [ ] `transport/underground.mp3`
- [ ] `transport/water.mp3`
- [ ] `music/menu-theme.mp3`
- [ ] `music/gameplay-calm.mp3`
- [ ] `game/turn-start.mp3`
- [ ] `game/mr-x-reveal.mp3`
- [ ] `ambient/london-ambience.mp3` (optional)

### Code Files Created:
- [ ] `src/types/audio.ts`
- [ ] `src/services/audio/soundConfig.ts`
- [ ] `src/services/audio/SoundManager.ts`
- [ ] `src/hooks/useSoundEffect.ts`
- [ ] `src/hooks/useBackgroundMusic.ts`
- [ ] `src/hooks/useSoundEngine.ts`
- [ ] `src/stores/soundStore.ts`
- [ ] `src/components/Sound/SoundControls.tsx`

### Integrations:
- [ ] Updated `App.tsx` with sound initialization
- [ ] Updated `SVGBoard.tsx` with station sounds
- [ ] Updated `MapboxBoard.tsx` with station sounds
- [ ] Added sound controls to UI
- [ ] Added error/success sounds

### Dependencies:
- [ ] Installed `howler`
- [ ] Installed `@types/howler`

### Testing:
- [ ] All sounds play correctly
- [ ] Volume controls work
- [ ] Mute toggle works
- [ ] Settings persist
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile

---

## 🆘 Troubleshooting

**No sound?**
```bash
# Check files exist
ls -R packages/client/public/audio/

# Check browser console for errors
# Open DevTools → Console tab

# Check if browser has muted the site
# Look for speaker icon in browser tab
```

**Music won't loop?**
- Make sure music files are seamless loops
- Check `loop: true` in soundConfig.ts

**Too loud/quiet?**
- Adjust volume in `soundConfig.ts`
- Or use volume controls in UI

---

## 🎉 You're Done!

Once all checkboxes are ticked, your game will have:
- ✨ Professional sound effects
- 🎵 Atmospheric background music
- 🎚️ User-controllable volume
- 💾 Persistent settings
- 📱 Mobile support

**Next:** Add more sound variations, implement game logic sounds, create audio sprites for optimization!

---

**Need detailed implementation code?** See `SOUND_IMPLEMENTATION_GUIDE.md`

**Need full GitHub issue?** See `GITHUB_ISSUE_SOUND_MVP.md`
