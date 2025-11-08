# Sound System Implementation Guide - MVP

## Overview
This guide walks you through implementing the core sound system for the Mr. X (Scotland Yard) game. This is a Minimum Viable Product (MVP) implementation focusing on essential sounds only.

---

## Phase 1: Generate & Download Sound Files

### Required Sounds (15 files)

Use **Elevenlabs Sound Effects** (https://elevenlabs.io/sound-effects) or **Suno AI** to generate these sounds using the prompts below.

#### 1. UI Sounds (5 files)

**File: `click.mp3`**
- **Prompt:** `"Soft digital button click, subtle, modern UI sound"`
- **Length:** 0.3 seconds
- **Destination:** `packages/client/public/audio/ui/click.mp3`

**File: `hover.mp3`**
- **Prompt:** `"Very subtle whoosh, gentle air movement, barely audible"`
- **Length:** 0.2 seconds
- **Destination:** `packages/client/public/audio/ui/hover.mp3`

**File: `toggle.mp3`**
- **Prompt:** `"Switch flipping sound, satisfying toggle, positive tone"`
- **Length:** 0.4 seconds
- **Destination:** `packages/client/public/audio/ui/toggle.mp3`

**File: `error.mp3`**
- **Prompt:** `"Error beep, negative tone, not harsh, apologetic notification"`
- **Length:** 0.5 seconds
- **Destination:** `packages/client/public/audio/ui/error.mp3`

**File: `success.mp3`**
- **Prompt:** `"Success chime, positive ascending notes, cheerful confirmation"`
- **Length:** 0.5 seconds
- **Destination:** `packages/client/public/audio/ui/success.mp3`

---

#### 2. Station Sounds (1 file)

**File: `station-select.mp3`**
- **Prompt:** `"Map pin dropping on board, soft thud with slight echo, game piece placement"`
- **Length:** 0.5 seconds
- **Destination:** `packages/client/public/audio/stations/station-select.mp3`

---

#### 3. Transport Sounds (4 files)

**File: `taxi.mp3`**
- **Prompt:** `"London black cab engine starting, classic taxi motor, short burst"`
- **Length:** 1.5 seconds
- **Destination:** `packages/client/public/audio/transport/taxi.mp3`

**File: `bus.mp3`**
- **Prompt:** `"London double-decker bus engine, diesel motor, powerful, brief"`
- **Length:** 1.5 seconds
- **Destination:** `packages/client/public/audio/transport/bus.mp3`

**File: `underground.mp3`**
- **Prompt:** `"London Underground train arriving, tube station platform, brief"`
- **Length:** 1.5 seconds
- **Destination:** `packages/client/public/audio/transport/underground.mp3`

**File: `water.mp3`**
- **Prompt:** `"River ferry horn blast, Thames boat, London waterway"`
- **Length:** 1.5 seconds
- **Destination:** `packages/client/public/audio/transport/water.mp3`

---

#### 4. Background Music (2 files)

**File: `menu-theme.mp3`**
- **Prompt:** `"Dark mysterious jazz noir music, detective theme, smoky lounge atmosphere, sophisticated, looping background music, 2 minutes, seamless loop"`
- **Length:** 2-3 minutes
- **Destination:** `packages/client/public/audio/music/menu-theme.mp3`

**File: `gameplay-calm.mp3`**
- **Prompt:** `"Calm detective investigation music, jazzy noir soundtrack, thinking music, sophisticated background, seamless loop, 2 minutes"`
- **Length:** 2-3 minutes
- **Destination:** `packages/client/public/audio/music/gameplay-calm.mp3`

---

#### 5. Ambient Sounds (1 file) - OPTIONAL

**File: `london-ambience.mp3`**
- **Prompt:** `"London city street ambience, distant traffic, footsteps, urban atmosphere, loopable background, 30 seconds"`
- **Length:** 30-60 seconds
- **Destination:** `packages/client/public/audio/ambient/london-ambience.mp3`

---

#### 6. Game Event Sounds (2 files)

**File: `turn-start.mp3`**
- **Prompt:** `"Your turn begins, gentle chime, positive notification, game turn indicator"`
- **Length:** 0.8 seconds
- **Destination:** `packages/client/public/audio/game/turn-start.mp3`

**File: `mr-x-reveal.mp3`**
- **Prompt:** `"Dramatic reveal, suspenseful chord, mystery uncovered, cinematic, thriller moment"`
- **Length:** 2 seconds
- **Destination:** `packages/client/public/audio/game/mr-x-reveal.mp3`

---

## Phase 2: Setup Directory Structure

Create the following directory structure in your project:

```bash
packages/client/public/audio/
├── ui/
├── stations/
├── transport/
├── music/
├── ambient/
└── game/
```

**Run these commands:**

```bash
mkdir -p packages/client/public/audio/ui
mkdir -p packages/client/public/audio/stations
mkdir -p packages/client/public/audio/transport
mkdir -p packages/client/public/audio/music
mkdir -p packages/client/public/audio/ambient
mkdir -p packages/client/public/audio/game
```

---

## Phase 3: Install Dependencies

```bash
pnpm add howler
pnpm add -D @types/howler
```

---

## Phase 4: Implementation Checklist

### Step 1: Create Type Definitions
- [ ] Create `packages/client/src/types/audio.ts`
- [ ] Define sound types and categories

### Step 2: Create Sound Configuration
- [ ] Create `packages/client/src/services/audio/soundConfig.ts`
- [ ] Add all 15 MVP sound definitions

### Step 3: Create Sound Manager Service
- [ ] Create `packages/client/src/services/audio/SoundManager.ts`
- [ ] Implement Howler.js integration
- [ ] Add volume controls
- [ ] Add localStorage persistence

### Step 4: Create React Hooks
- [ ] Create `packages/client/src/hooks/useSoundEffect.ts`
- [ ] Create `packages/client/src/hooks/useBackgroundMusic.ts`
- [ ] Create `packages/client/src/hooks/useSoundEngine.ts`

### Step 5: Create Zustand Store
- [ ] Create `packages/client/src/stores/soundStore.ts`
- [ ] Add sound settings state management

### Step 6: Create UI Components
- [ ] Create `packages/client/src/components/Sound/SoundControls.tsx`
- [ ] Add volume sliders (Master, Music, SFX)
- [ ] Add mute toggle button

### Step 7: Integrate into Existing Components
- [ ] Update `App.tsx` - Initialize sound system
- [ ] Update `App.tsx` - Add toggle sound on view switch
- [ ] Update `SVGBoard.tsx` - Add station click sounds
- [ ] Update `MapboxBoard.tsx` - Add station click sounds
- [ ] Add error sounds to error states
- [ ] Add success sounds to success states

### Step 8: Testing
- [ ] Test all UI sounds trigger correctly
- [ ] Test station click sounds
- [ ] Test transport sounds (prepare for future use)
- [ ] Test background music loops correctly
- [ ] Test volume controls work
- [ ] Test mute toggle works
- [ ] Test settings persist in localStorage
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile (iOS Safari)
- [ ] Test on mobile (Android Chrome)

---

## Phase 5: File Download Checklist

After generating sounds with AI, download and place them in these exact locations:

```
✓ packages/client/public/audio/ui/click.mp3
✓ packages/client/public/audio/ui/hover.mp3
✓ packages/client/public/audio/ui/toggle.mp3
✓ packages/client/public/audio/ui/error.mp3
✓ packages/client/public/audio/ui/success.mp3
✓ packages/client/public/audio/stations/station-select.mp3
✓ packages/client/public/audio/transport/taxi.mp3
✓ packages/client/public/audio/transport/bus.mp3
✓ packages/client/public/audio/transport/underground.mp3
✓ packages/client/public/audio/transport/water.mp3
✓ packages/client/public/audio/music/menu-theme.mp3
✓ packages/client/public/audio/music/gameplay-calm.mp3
✓ packages/client/public/audio/ambient/london-ambience.mp3 (optional)
✓ packages/client/public/audio/game/turn-start.mp3
✓ packages/client/public/audio/game/mr-x-reveal.mp3
```

---

## Quick Start Commands

```bash
# 1. Create directories
mkdir -p packages/client/public/audio/{ui,stations,transport,music,ambient,game}

# 2. Install dependencies
pnpm add howler
pnpm add -D @types/howler

# 3. Verify structure
ls -R packages/client/public/audio/

# 4. After adding audio files, start dev server
pnpm dev
```

---

## Testing the Implementation

Once implemented, you should hear:
- **Click sound** when clicking buttons or stations
- **Hover sound** when hovering over interactive elements (optional, can be disabled)
- **Toggle sound** when switching between SVG and Mapbox views
- **Background music** playing on loop (can be muted)
- **Station select** sound when clicking any station on the board

---

## Volume Recommendations

These will be set in code:
- **UI sounds:** 30-40% volume
- **Station sounds:** 40-50% volume
- **Transport sounds:** 50-60% volume
- **Background music:** 25-35% volume
- **Ambient sounds:** 20-30% volume

---

## Browser Compatibility Notes

- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** May require user interaction before playing audio
- **Mobile Safari (iOS):** Requires user tap to initialize audio context
- **Android Chrome:** Generally works well

**Solution:** We'll add a "Enable Sound" button that appears on first load for mobile users.

---

## Future Enhancements (Post-MVP)

After MVP is working, you can add:
- [ ] Multiple variations per sound (2-4 each)
- [ ] Audio sprites for performance
- [ ] Spatial audio (stereo panning based on station position)
- [ ] More music tracks (tense, victory, defeat)
- [ ] Game event sounds (tickets, Mr. X spotted, etc.)
- [ ] Visual sound indicators for accessibility
- [ ] Sound effect randomization to avoid repetition

---

## Troubleshooting

**Problem: No sound playing**
- Check browser console for errors
- Verify audio files are in correct directories
- Check if user has muted site in browser settings
- Try clicking anywhere first (mobile requirement)

**Problem: Music not looping**
- Verify music files are seamless loops
- Check `loop: true` in sound configuration

**Problem: Sounds too loud/quiet**
- Adjust volume settings in `soundConfig.ts`
- Use volume controls in UI

---

## Resources

- **Elevenlabs Sound Effects:** https://elevenlabs.io/sound-effects
- **Suno AI:** https://suno.ai/
- **Howler.js Docs:** https://howlerjs.com/
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify file paths match exactly
3. Test with placeholder sounds first
4. Check network tab to see if files are loading

---

**Ready to implement? Start with Phase 1: Generate the sounds!**
