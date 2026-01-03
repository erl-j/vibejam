// POLYPHIA x DIRTY LOOPS - "Praise Break"
// Modern gospel meets technical virtuosity
// Shuffle feel, 2-5-1 movement, synced fills

sl = 0.018
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// GOSPEL SHUFFLE - deep pocket, laid back on upbeats
swing = 0.055
swung = (beat) => (beat % 2 == 1) ? swing * (0.85 + R() * 0.3) : 0

// GM drums
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46, HHP = 44
RIDE = 51, BELL = 53, CRASH = 49, SPLASH = 55, CHINA = 52
TF = 43, TL = 45, TM = 47, TH = 50

drums = 'm:1'
keys = 'm:4'
bass = 'm:5'

BAR = 16

// ============================================
// GOSPEL HARMONY - Db major, rich extensions
// ============================================
// Dbmaj9 -> Bbm9 -> Ebm9 -> Ab9 (clean voicings)
chords = [
    { root: 49, bass: 49, v: [53, 56, 60, 63], fifth: 56, seventh: 48 },  // Dbmaj7: F, Ab, C, Eb
    { root: 46, bass: 46, v: [49, 53, 56, 60], fifth: 53, seventh: 44 },  // Bbm7: Db, F, Ab, C
    { root: 51, bass: 51, v: [54, 58, 61, 65], fifth: 58, seventh: 49 },  // Ebm7: Gb, Bb, Db, F
    { root: 44, bass: 44, v: [48, 51, 55, 58], fifth: 51, seventh: 42 },  // Ab7: C, Eb, G, Bb
]

return (t, s) => {
    n = []

    bar = Math.floor(t / BAR)
    bt = t % BAR
    phrase = Math.floor(bar / 8)
    section = phrase % 3
    localBar = bar % 8

    sw = swung(bt)
    h = slop()

    // Chord changes every 2 bars
    chordIdx = Math.floor(bar / 2) % 4
    chord = chords[chordIdx]
    voicing = chord.v
    root = chord.bass
    fifth = chord.fifth
    seventh = chord.seventh
    octave = root + 12

    // ============================================
    // SYNCED FILL PATTERNS - everyone together
    // ============================================

    // FILL TYPE A: Every 4 bars, beat 4 (bar 3 of each 4)
    isFillA = (bar % 4 == 3) && bt >= 12
    // FILL TYPE B: Every 2 bars on "a of 3" 
    isFillB = (bar % 2 == 1) && bt == 11
    // FILL TYPE C: Big fill every 8 bars
    isFillC = (localBar == 7) && bt >= 8

    // ============================================
    // DRUMS - Modern Gospel Shuffle
    // ============================================

    // Hi-hat (skip during fills)
    if (!isFillC) {
        if (bt % 2 == 0) {
            open = (bt == 6 || bt == 14)
            v = (bt == 0 || bt == 8) ? 0.55 : (open ? 0.52 : 0.35)
            n.push({ w: drums, p: open ? HHO : HHC, v: v, d: open ? 0.45 : 0.15, o: sw + h })
        }
        if (bt % 4 == 3 && !isFillB) {
            n.push({ w: drums, p: HHC, v: 0.22 + R() * 0.1, d: 0.10, o: sw + h })
        }
    }

    // Kick pattern (skip during fills)
    if (!isFillA && !isFillC) {
        kickHits = [0, 3, 6, 8, 9, 14]
        if (kickHits.includes(bt)) {
            kV = (bt == 0 || bt == 8) ? 0.82 : 0.62 + R() * 0.12
            n.push({ w: drums, p: K, v: kV, d: 0.9, o: sw * 0.4 + h * 0.3 })
        }
    }

    // Snare backbeat (skip during fills)
    if (!isFillA && !isFillC) {
        if (bt == 4 || bt == 12) {
            n.push({ w: drums, p: S, v: 0.88, d: 1.2, o: sw + h + 0.015 })
        }
        if (bt == 2) n.push({ w: drums, p: SR, v: 0.08, d: 0.10, o: sw + h })
        if (bt == 3) n.push({ w: drums, p: SR, v: 0.15, d: 0.12, o: sw + h })
        if (bt == 10) n.push({ w: drums, p: SR, v: 0.10, d: 0.10, o: sw + h })
        if (!isFillB && bt == 11) n.push({ w: drums, p: SR, v: 0.18, d: 0.12, o: sw + h })
    }

    // Splashes
    if (bt == 6 && bar % 2 == 0) n.push({ w: drums, p: SPLASH, v: 0.45, d: 1.2, o: sw + h })
    if (bt == 0 && bar % 4 == 2) n.push({ w: drums, p: SPLASH, v: 0.50, d: 1.5, o: h })
    if (bt == 0 && bar % 4 == 0) n.push({ w: drums, p: CRASH, v: 0.72, d: 3.0, o: 0 })

    // ============================================
    // FILL A: Synced 16th note hits (everyone)
    // ============================================
    if (isFillA) {
        fillBt = bt - 12
        fillPattern = [
            { drums: K, tom: null, v: 0.80 },
            { drums: S, tom: TH, v: 0.65 },
            { drums: K, tom: null, v: 0.75 },
            { drums: S, tom: TL, v: 0.70 }
        ]
        fp = fillPattern[fillBt]

        // Drums
        n.push({ w: drums, p: fp.drums, v: fp.v, d: 0.35, o: sw + h })
        if (fp.tom) n.push({ w: drums, p: fp.tom, v: fp.v * 0.8, d: 0.3, o: sw + h })

        // Keys - staccato chord hits synced
        voicing.forEach((note, i) => {
            n.push({ w: keys, p: note, v: fp.v * 0.7, d: 0.08, o: sw + h + i * 0.002 })
        })

        // Bass - octave pops synced
        bassNotes = [root, octave, fifth, octave]
        n.push({ w: bass, p: bassNotes[fillBt], v: fp.v * 0.85, d: 0.05, o: sw + h })

        if (fillBt == 3) n.push({ w: drums, p: CRASH, v: 0.78, d: 3.0, o: 0.03 })
    }

    // ============================================
    // FILL B: Quick synced hit on "a of 3"
    // ============================================
    if (isFillB) {
        // Everyone hits together
        n.push({ w: drums, p: K, v: 0.72, d: 0.6, o: sw + h })
        n.push({ w: drums, p: S, v: 0.55, d: 0.4, o: sw + h })
        voicing.slice(-2).forEach(note => {
            n.push({ w: keys, p: note, v: 0.48, d: 0.08, o: sw + h })
        })
        n.push({ w: bass, p: octave, v: 0.70, d: 0.05, o: sw + h })
    }

    // ============================================
    // FILL C: Big 8-beat synced fill
    // ============================================
    if (isFillC) {
        fillBt = bt - 8

        // SYNCED PATTERN: drums + bass + keys together
        fillSync = [
            { drum: S, bass: root, key: true, v: 0.60 },
            { drum: TH, bass: fifth, key: false, v: 0.55 },
            { drum: S, bass: octave, key: true, v: 0.65 },
            { drum: TM, bass: fifth, key: false, v: 0.58 },
            { drum: K, bass: root, key: true, v: 0.72 },
            { drum: TL, bass: seventh + 12, key: false, v: 0.60 },
            { drum: S, bass: octave, key: true, v: 0.75 },
            { drum: TF, bass: fifth, key: false, v: 0.68 }
        ]

        fs = fillSync[fillBt]
        n.push({ w: drums, p: fs.drum, v: fs.v, d: 0.3, o: sw + h })
        n.push({ w: bass, p: fs.bass, v: fs.v * 0.9, d: 0.06, o: sw + h })

        if (fs.key) {
            voicing.slice(-3).forEach((note, i) => {
                n.push({ w: keys, p: note, v: fs.v * 0.75, d: 0.10, o: sw + h + i * 0.002 })
            })
        }

        // Double stroke roll feel on snare hits
        if (fs.drum == S) {
            n.push({ w: drums, p: S, v: fs.v * 0.5, d: 0.2, o: sw + h + 0.028 })
        }

        if (fillBt == 7) {
            n.push({ w: drums, p: CRASH, v: 0.88, d: 4.0, o: 0.03 })
            n.push({ w: drums, p: K, v: 0.85, d: 0.8, o: 0.03 })
        }
    }

    // ============================================
    // KEYS - Gospel Stabs (when not in fills)
    // ============================================

    if (!isFillA && !isFillC) {
        gospelStabs = [0, 6, 12]
        if (gospelStabs.includes(bt)) {
            dur = (bt == 0 || bt == 12) ? 0.22 : 0.12
            vel = (bt == 0) ? 0.58 : (bt == 12 ? 0.55 : 0.48)
            voicing.forEach((note, i) => {
                n.push({ w: keys, p: note, v: vel - i * 0.02, d: dur, o: sw + h + i * 0.003 })
            })
        }

        // Anticipation into next chord
        if (bt == 14 && bar % 2 == 1 && !isFillA) {
            nextChord = chords[(chordIdx + 1) % 4]
            nextChord.v.forEach((note, i) => {
                n.push({ w: keys, p: note, v: 0.52, d: 0.18, o: sw + h + i * 0.002 })
            })
        }
    }

    // Gospel run (using chord tones only)
    if (bt == 8 && bar % 4 == 1 && !isFillC) {
        runNotes = [voicing[3] + 12, voicing[2] + 12, voicing[1] + 12, voicing[0] + 12]
        runNotes.forEach((note, i) => {
            n.push({ w: keys, p: note, v: 0.42 - i * 0.03, d: 0.06, o: sw + h + i * 0.028 })
        })
    }

    // ============================================
    // BASS - Gospel Pocket (when not in fills)
    // ============================================

    if (!isFillA && !isFillB && !isFillC) {
        isOddBar = bar % 2 == 1

        if (!isOddBar) {
            if (bt == 0) n.push({ w: bass, p: root, v: 0.90, d: 0.12, o: h * 0.3 })
            if (bt == 1) n.push({ w: bass, p: root, v: 0.12, d: 0.015, o: sw + h })
            if (bt == 3) n.push({ w: bass, p: root, v: 0.15, d: 0.015, o: sw + h })
            if (bt == 4) n.push({ w: bass, p: octave, v: 0.78, d: 0.08, o: sw + h })
            if (bt == 6) n.push({ w: bass, p: fifth + 12, v: 0.62, d: 0.06, o: sw + h })
            if (bt == 7) n.push({ w: bass, p: voicing[0] + 12, v: 0.55, d: 0.05, o: sw + h })
            if (bt == 8) n.push({ w: bass, p: root, v: 0.75, d: 0.10, o: sw + h })
            if (bt == 10) n.push({ w: bass, p: fifth, v: 0.58, d: 0.06, o: sw + h })
            if (bt == 12) n.push({ w: bass, p: octave, v: 0.80, d: 0.08, o: sw + h })
            if (bt == 14) n.push({ w: bass, p: seventh + 12, v: 0.52, d: 0.05, o: sw + h })
        }

        if (isOddBar && localBar != 7) {
            if (bt == 0) n.push({ w: bass, p: root, v: 0.88, d: 0.12, o: h * 0.3 })
            if (bt == 1) n.push({ w: bass, p: root, v: 0.12, d: 0.015, o: sw + h })
            if (bt == 3) n.push({ w: bass, p: voicing[0], v: 0.55, d: 0.05, o: sw + h })
            if (bt == 4) n.push({ w: bass, p: fifth, v: 0.72, d: 0.08, o: sw + h })
            if (bt == 6) n.push({ w: bass, p: octave, v: 0.68, d: 0.06, o: sw + h })
            if (bt == 7) n.push({ w: bass, p: fifth + 12, v: 0.55, d: 0.05, o: sw + h })
            if (bt == 8) n.push({ w: bass, p: root, v: 0.78, d: 0.10, o: sw + h })

            // Walk to next chord using chord tones
            nextRoot = chords[(chordIdx + 1) % 4].bass
            if (bt == 10) n.push({ w: bass, p: seventh + 12, v: 0.58, d: 0.05, o: sw + h })
            if (bt == 12) n.push({ w: bass, p: fifth + 12, v: 0.60, d: 0.05, o: sw + h })
            if (bt == 14) n.push({ w: bass, p: nextRoot + 12, v: 0.70, d: 0.08, o: sw + h })
        }
    }

    // Sub thump
    if (bt == 0 && bar % 4 == 0 && !isFillC) {
        n.push({ w: bass, p: root - 12, v: 0.95, d: 0.20, o: 0 })
    }

    // Double thumb
    if (section >= 1 && bt == 0 && !isFillC) {
        n.push({ w: bass, p: root, v: 0.58, d: 0.04, o: 0.032 + h })
    }

    // ============================================
    // EXTRA SYNCED MOMENTS
    // ============================================

    // Big hit on phrase start
    if (bar % 8 == 0 && bt == 0) {
        n.push({ w: drums, p: CRASH, v: 0.90, d: 4.0, o: 0 })
        n.push({ w: drums, p: K, v: 0.95, d: 1.5, o: 0 })
        voicing.forEach((note, i) => {
            n.push({ w: keys, p: note, v: 0.72, d: 0.7, o: h + i * 0.003 })
            n.push({ w: keys, p: note + 12, v: 0.52, d: 0.5, o: h + 0.008 })
        })
        n.push({ w: bass, p: root - 12, v: 1.0, d: 0.25, o: 0 })
    }

    // Praise break hit
    if (bar % 8 == 6 && bt == 8 && !isFillC) {
        n.push({ w: drums, p: K, v: 0.85, d: 0.7, o: 0 })
        n.push({ w: drums, p: SPLASH, v: 0.60, d: 1.8, o: 0 })
        voicing.slice(-2).forEach(note => {
            n.push({ w: keys, p: note + 12, v: 0.55, d: 0.15, o: 0 })
        })
        n.push({ w: bass, p: octave, v: 0.75, d: 0.08, o: 0 })
    }

    // Synced stab every 4 bars on beat 3
    if (bar % 4 == 2 && bt == 8) {
        n.push({ w: drums, p: K, v: 0.78, d: 0.7, o: sw + h })
        n.push({ w: drums, p: HHO, v: 0.50, d: 0.4, o: sw + h })
        voicing.forEach((note, i) => {
            n.push({ w: keys, p: note, v: 0.55, d: 0.15, o: sw + h + i * 0.002 })
        })
        n.push({ w: bass, p: root, v: 0.80, d: 0.10, o: sw + h })
    }

    return n
}
