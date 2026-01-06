# User Preferences - Musical Techniques I Like

## Piano Line - Flowing Looped Arpeggios (from 98_piano_flow.js)

### What I Like About It
- **Flowing melody that loops seamlessly** - creates a hypnotic, circular feel
- **Leads nicely back into itself** - the 4-bar structure resolves perfectly at the loop point
- **Beautiful chord progression** - D minor 9 → G minor 9 → F major 9 → E half-dim

---

## How It's Made

### 1. **Time Signature & Loop Structure**
- **9/8 time signature** (9 eighth-note subdivisions per bar)
- **4-bar loop** that repeats (total of 36 ticks: 9 × 4)
- Piano time wraps independently: `pianoT = t % (9 * 4)`
- This creates a consistent, predictable loop that the ear can latch onto

### 2. **Chord Progression (2 bars per chord)**
```javascript
chords = [
    [50, 53, 57, 60, 64, 67],  // D minor 9 (low voicing)
    [55, 58, 62, 65, 69, 72],  // G minor 9 
    [53, 57, 60, 64, 67, 72],  // F major 9
    [52, 55, 59, 62, 65, 69],  // E half-dim
]
```
- Each chord has **6 notes** available for arpeggiation
- Changes every **2 bars** for harmonic movement
- Rich extended chords (9ths, half-diminished) create sophisticated color

### 3. **Four Pattern Variations** (one per bar)
The patterns rotate through the 4-bar loop, creating variety while maintaining unity:

#### **Pattern 0 & 2: Rising Arpeggios**
- Steps through chord tones sequentially: `chord[pianoBt % chord.length]`
- **Octave jump** at beat 6 for melodic contour: `octaveShift = pianoBt >= 6 ? 12 : 0`
- Accents on beats 0, 3, 6 (the 3+3+3 grouping of 9/8)
- Accented notes get:
  - Higher velocity (0.72 vs 0.38)
  - Longer duration (0.4 vs 0.18)
  - Sometimes a bass note doubling an octave below

#### **Pattern 1: Descending/Reversed Arpeggio**
- Reverses the chord array: `[...chord].reverse()`
- Different accent pattern: beats 0, 2, 4, 6 (more syncopated)
- High octave accent on beat 6 for lift

#### **Pattern 3: Sparse Chords + Melodic Fills**
- **Chordal hits** on beats 0 and 4: plays bottom 3 notes as rolled chord
  - Staggered timing: `o: h + i * 0.012` creates natural chord roll
- **Single melody notes** on beats 5, 7, 8 (upper chord tones, octave up)
- **Ghost notes** sprinkled randomly on beats 1, 2, 3, 6 for texture
- Creates breathing room and rhythmic variety

### 4. **Bass Anchors** (grounding the harmony)
- **Root note** on beat 0 of every bar (one octave below chord root)
  - Strong velocity (0.75) and longer duration (0.8)
- **Fifth** on beat 6 of even bars: `chord[0] - 5`
  - Adds harmonic movement within the bar

### 5. **Melodic Fills** (adding forward motion)
- On bar 3 (the last bar of each 4-bar loop), beats 6-8
- Plays specific upper extensions: `[chord[4], chord[5], chord[3] + 12]`
- **Ascending velocity** to build into the loop restart
- Creates anticipation and smooth return to the top

### 6. **Humanization** (making it feel alive)
- **Timing slop**: `slop = () => (Math.random() - 0.5) * 0.08`
  - Each note slightly early or late (±0.04 seconds)
- **Velocity randomization**: `0.38 + R() * 0.15`
  - Natural dynamic variation within a range
- Prevents mechanical, robotic feel

---

## Key Principles

### ✨ **Looping Melodies Should:**
1. **Use a clear time structure** (4 bars, 8 bars, etc.)
2. **Cycle through patterns** for variety within unity
3. **End on a note/chord that leads back to the beginning**
4. **Have clear bass anchors** to ground the harmony
5. **Use fills before the loop restart** to signal the return

### ✨ **Arpeggios Should:**
1. **Step through chord tones methodically** (not random)
2. **Use octave shifts** to create melodic contour
3. **Have accent patterns** that emphasize the time signature
4. **Mix directions** (ascending, descending, sparse)

### ✨ **Chords I Like:**
- **Extended chords** (9ths, 11ths, 13ths) for richness
- **Modal progressions** (not just I-IV-V)
- **Chord voicings with 5-6 notes** give lots of arpeggio material
- **Half-diminished chords** for tension and sophistication

### ✨ **Rhythm & Feel:**
- **9/8 time** grouped as 3+3+3 creates flowing, lilting feel
- **Humanization is essential** - timing and velocity randomness
- **Ghost notes** add texture without crowding
- **Staggered chord rolls** sound more natural than block chords

---

## Technical Implementation Notes

```javascript
// Loop structure
pianoT = t % (9 * 4)           // 4 bars in 9/8
pianoBar = Math.floor(pianoT / BAR)
pianoBt = pianoT % BAR

// Pattern selection
pattern = pianoBar % 4          // Cycles 0→1→2→3

// Chord progression (2 bars per chord)
chordIdx = Math.floor(pianoBar / 2) % chords.length

// Accent system
accents = [0, 3, 6]             // Natural 9/8 grouping
isAccent = accents.includes(pianoBt)
vel = isAccent ? 0.72 : 0.38
```

---

## Future Variations to Try

- **Try 7/8 or 5/4 time** for different feels
- **Experiment with different pattern orders** (not just 0-1-2-3)
- **Add more pattern types**: broken chords, contrary motion, pedal points
- **Try chord progressions with more/fewer changes**
- **Use different accent patterns** per variation for polyrhythmic feel
- **Add chromatic passing tones** between chord tones for jazz flavor

