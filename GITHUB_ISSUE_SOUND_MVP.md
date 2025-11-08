# 🔊 Implement Sound System - MVP (Phase 1)

## 📋 Description

Implement a complete sound system for the Mr. X game including UI feedback sounds, station interactions, transport type sounds, and background music. This is the MVP (Minimum Viable Product) implementation with 15 essential sound files.

## 🎯 Goals

- Add audio feedback to all user interactions
- Enhance immersion with background music and ambient sounds
- Create a polished, professional feel to the game
- Prepare foundation for future game logic sounds

## 🎵 Sound Files Needed (15 Total)

### Step 1: Generate Sounds with AI

Use **Elevenlabs Sound Effects** (https://elevenlabs.io/sound-effects) or **Suno AI** to generate these sounds.

<details>
<summary><strong>UI Sounds (5 files)</strong></summary>

#### 1. `click.mp3`
- **Prompt:** `"Soft digital button click, subtle, modern UI sound"`
- **Length:** 0.3 seconds
- **Save as:** `packages/client/public/audio/ui/click.mp3`

#### 2. `hover.mp3`
- **Prompt:** `"Very subtle whoosh, gentle air movement, barely audible"`
- **Length:** 0.2 seconds
- **Save as:** `packages/client/public/audio/ui/hover.mp3`

#### 3. `toggle.mp3`
- **Prompt:** `"Switch flipping sound, satisfying toggle, positive tone"`
- **Length:** 0.4 seconds
- **Save as:** `packages/client/public/audio/ui/toggle.mp3`

#### 4. `error.mp3`
- **Prompt:** `"Error beep, negative tone, not harsh, apologetic notification"`
- **Length:** 0.5 seconds
- **Save as:** `packages/client/public/audio/ui/error.mp3`

#### 5. `success.mp3`
- **Prompt:** `"Success chime, positive ascending notes, cheerful confirmation"`
- **Length:** 0.5 seconds
- **Save as:** `packages/client/public/audio/ui/success.mp3`

</details>

<details>
<summary><strong>Station Sounds (1 file)</strong></summary>

#### 6. `station-select.mp3`
- **Prompt:** `"Map pin dropping on board, soft thud with slight echo, game piece placement"`
- **Length:** 0.5 seconds
- **Save as:** `packages/client/public/audio/stations/station-select.mp3`

</details>

<details>
<summary><strong>Transport Sounds (4 files)</strong></summary>

#### 7. `taxi.mp3`
- **Prompt:** `"London black cab engine starting, classic taxi motor, short burst"`
- **Length:** 1.5 seconds
- **Save as:** `packages/client/public/audio/transport/taxi.mp3`

#### 8. `bus.mp3`
- **Prompt:** `"London double-decker bus engine, diesel motor, powerful, brief"`
- **Length:** 1.5 seconds
- **Save as:** `packages/client/public/audio/transport/bus.mp3`

#### 9. `underground.mp3`
- **Prompt:** `"London Underground train arriving, tube station platform, brief"`
- **Length:** 1.5 seconds
- **Save as:** `packages/client/public/audio/transport/underground.mp3`

#### 10. `water.mp3`
- **Prompt:** `"River ferry horn blast, Thames boat, London waterway"`
- **Length:** 1.5 seconds
- **Save as:** `packages/client/public/audio/transport/water.mp3`

</details>

<details>
<summary><strong>Background Music (2 files)</strong></summary>

#### 11. `menu-theme.mp3`
- **Prompt:** `"Dark mysterious jazz noir music, detective theme, smoky lounge atmosphere, sophisticated, looping background music, 2 minutes, seamless loop"`
- **Length:** 2-3 minutes
- **Save as:** `packages/client/public/audio/music/menu-theme.mp3`

#### 12. `gameplay-calm.mp3`
- **Prompt:** `"Calm detective investigation music, jazzy noir soundtrack, thinking music, sophisticated background, seamless loop, 2 minutes"`
- **Length:** 2-3 minutes
- **Save as:** `packages/client/public/audio/music/gameplay-calm.mp3`

</details>

<details>
<summary><strong>Game Event Sounds (2 files)</strong></summary>

#### 13. `turn-start.mp3`
- **Prompt:** `"Your turn begins, gentle chime, positive notification, game turn indicator"`
- **Length:** 0.8 seconds
- **Save as:** `packages/client/public/audio/game/turn-start.mp3`

#### 14. `mr-x-reveal.mp3`
- **Prompt:** `"Dramatic reveal, suspenseful chord, mystery uncovered, cinematic, thriller moment"`
- **Length:** 2 seconds
- **Save as:** `packages/client/public/audio/game/mr-x-reveal.mp3`

</details>

<details>
<summary><strong>Ambient Sounds (1 file) - OPTIONAL</strong></summary>

#### 15. `london-ambience.mp3` *(Optional)*
- **Prompt:** `"London city street ambience, distant traffic, footsteps, urban atmosphere, loopable background, 30 seconds"`
- **Length:** 30-60 seconds
- **Save as:** `packages/client/public/audio/ambient/london-ambience.mp3`

</details>

---

## 📂 Step 2: Create Directory Structure

Run these commands to create the audio directories:

```bash
mkdir -p packages/client/public/audio/ui
mkdir -p packages/client/public/audio/stations
mkdir -p packages/client/public/audio/transport
mkdir -p packages/client/public/audio/music
mkdir -p packages/client/public/audio/ambient
mkdir -p packages/client/public/audio/game
```

**Expected structure:**
```
packages/client/public/audio/
├── ui/
├── stations/
├── transport/
├── music/
├── ambient/
└── game/
```

---

## 📥 Step 3: Download & Place Audio Files

After generating sounds, place them in these **exact locations**:

```
✅ packages/client/public/audio/ui/click.mp3
✅ packages/client/public/audio/ui/hover.mp3
✅ packages/client/public/audio/ui/toggle.mp3
✅ packages/client/public/audio/ui/error.mp3
✅ packages/client/public/audio/ui/success.mp3
✅ packages/client/public/audio/stations/station-select.mp3
✅ packages/client/public/audio/transport/taxi.mp3
✅ packages/client/public/audio/transport/bus.mp3
✅ packages/client/public/audio/transport/underground.mp3
✅ packages/client/public/audio/transport/water.mp3
✅ packages/client/public/audio/music/menu-theme.mp3
✅ packages/client/public/audio/music/gameplay-calm.mp3
✅ packages/client/public/audio/ambient/london-ambience.mp3 (optional)
✅ packages/client/public/audio/game/turn-start.mp3
✅ packages/client/public/audio/game/mr-x-reveal.mp3
```

**Verification command:**
```bash
ls -R packages/client/public/audio/
```

---

## 🛠️ Step 4: Install Dependencies

```bash
pnpm add howler
pnpm add -D @types/howler
```

---

## 💻 Step 5: Implementation Tasks

### 5.1 Create Type Definitions

**File:** `packages/client/src/types/audio.ts`

<details>
<summary>View code template</summary>

```typescript
export type SoundCategory = 'ui' | 'station' | 'transport' | 'game' | 'ambient' | 'music';
export type SoundId =
  // UI
  | 'ui.click'
  | 'ui.hover'
  | 'ui.toggle'
  | 'ui.error'
  | 'ui.success'
  // Stations
  | 'station.select'
  // Transport
  | 'transport.taxi'
  | 'transport.bus'
  | 'transport.underground'
  | 'transport.water'
  // Music
  | 'music.menu'
  | 'music.gameplay'
  // Game
  | 'game.turn-start'
  | 'game.mr-x-reveal'
  // Ambient
  | 'ambient.london';

export interface SoundDefinition {
  id: SoundId;
  category: SoundCategory;
  src: string | string[];
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}
```

</details>

---

### 5.2 Create Sound Configuration

**File:** `packages/client/src/services/audio/soundConfig.ts`

Define all sound file paths and settings.

---

### 5.3 Create Sound Manager Service

**File:** `packages/client/src/services/audio/SoundManager.ts`

Implement the core sound engine using Howler.js with:
- Sound loading and caching
- Volume controls (master, per-category)
- Mute functionality
- localStorage persistence for settings

---

### 5.4 Create React Hooks

**Files:**
- `packages/client/src/hooks/useSoundEffect.ts` - Play sound effects
- `packages/client/src/hooks/useBackgroundMusic.ts` - Control music
- `packages/client/src/hooks/useSoundEngine.ts` - Initialize sound system

---

### 5.5 Create Zustand Store

**File:** `packages/client/src/stores/soundStore.ts`

State management for:
- Master volume
- Music volume
- SFX volume
- Mute state
- Music enabled/disabled
- SFX enabled/disabled

---

### 5.6 Create Sound Controls UI

**File:** `packages/client/src/components/Sound/SoundControls.tsx`

Create a UI component with:
- Master volume slider (0-100%)
- Music volume slider (0-100%)
- SFX volume slider (0-100%)
- Mute toggle button
- Visual feedback (icons, colors)

---

### 5.7 Integrate into Existing Components

#### Update `App.tsx`
- Initialize sound system on mount
- Add background music
- Add toggle sound when switching views
- Add sound controls to header

#### Update `SVGBoard.tsx`
- Add `station-select.mp3` on station click
- Add hover sounds (optional)

#### Update `MapboxBoard.tsx`
- Add `station-select.mp3` on station click
- Add hover sounds (optional)

#### Update Error/Success States
- Play `error.mp3` on errors
- Play `success.mp3` on successful actions

---

## ✅ Acceptance Criteria

- [ ] All 15 sound files are generated and placed in correct directories
- [ ] Dependencies installed (`howler`, `@types/howler`)
- [ ] Sound system initializes without errors
- [ ] Clicking a station plays `station-select.mp3`
- [ ] Toggling view mode plays `toggle.mp3`
- [ ] Background music plays and loops correctly
- [ ] Volume controls adjust sound levels
- [ ] Mute button silences all sounds
- [ ] Settings persist after page reload (localStorage)
- [ ] No console errors related to audio
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Sound controls are accessible via UI

---

## 🧪 Testing Checklist

**Functional Tests:**
- [ ] All UI sounds play when triggered
- [ ] Station click sound plays
- [ ] Background music loops seamlessly
- [ ] Volume sliders adjust audio levels
- [ ] Mute toggle silences/enables all audio
- [ ] Settings persist after refresh

**Browser Tests:**
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] iOS Safari (mobile)
- [ ] Android Chrome (mobile)

**Performance Tests:**
- [ ] No memory leaks (check DevTools)
- [ ] Smooth playback without stuttering
- [ ] Fast sound loading times
- [ ] No impact on game performance

---

## 📚 Resources

- **AI Sound Generation:**
  - Elevenlabs: https://elevenlabs.io/sound-effects
  - Suno AI: https://suno.ai/

- **Documentation:**
  - Howler.js: https://howlerjs.com/
  - Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

- **Implementation Guide:**
  - See `SOUND_IMPLEMENTATION_GUIDE.md` in project root

---

## 🔄 Future Enhancements (Post-MVP)

After MVP is complete, consider:
- [ ] Add 2-4 variations per sound to avoid repetition
- [ ] Implement audio sprites for better performance
- [ ] Add spatial audio (stereo panning based on position)
- [ ] Add more music tracks (tense, victory, defeat)
- [ ] Add visual sound indicators for accessibility
- [ ] Add sound effect randomization
- [ ] Implement dynamic music based on game state

---

## 📝 Notes

- **File Format:** Use MP3 for maximum browser compatibility
- **Bitrate:** 128-192 kbps for SFX, 256-320 kbps for music
- **Volume Levels:** Set in code, adjustable by user
- **Mobile:** May require user interaction to enable audio (add "Enable Sound" button)
- **Accessibility:** Consider users who are deaf/hard of hearing (visual feedback)

---

## 🎬 Getting Started

1. Generate sounds using AI prompts above
2. Create directory structure with `mkdir` commands
3. Download and place sound files
4. Install dependencies: `pnpm add howler @types/howler`
5. Implement sound system following Step 5
6. Test thoroughly across browsers
7. Commit and push changes

**Estimated Time:** 6-8 hours (including sound generation)

---

## 🏷️ Labels

`enhancement` `audio` `mvp` `phase-1` `user-experience`

---

## 👤 Assignee

Assign to developer implementing sound system

---

## 🔗 Related Issues

- #1 - Main implementation roadmap
- Future: Sound system Phase 2 (variations and optimization)
