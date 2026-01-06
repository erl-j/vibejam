// 9/8 Piano Arpeggio Loop
// Grouping: 3+3+3 with accent variations

piano = 'm:3'
drums = 'm:1'
bass = 'm:2'
guitar = 'm:6'

// GM drum notes
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46
TF = 41, TL = 45, TM = 47, TH = 50
CRASH = 49, RIDE = 51, BELL = 53

// Flam helper - grace note before main hit
flam = (n, inst, note, vel, dur, offset) => {
    n.push({ w: inst, p: note, v: vel * 0.35, d: dur * 0.4, o: offset - 0.025 })  // grace
    n.push({ w: inst, p: note, v: vel, d: dur, o: offset })  // main
}



// Humanization
sl = 0.08
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// 9/8 = 9 eighth-note subdivisions per bar
BAR = 9

// D minor 9 chord tones for arpeggios
// D F A C E = 62 65 69 72 76
chords = [
    [50, 53, 57, 60, 64, 67],  // D minor 9 (low voicing)
    [55, 58, 62, 65, 69, 72],  // G minor 9 
    [53, 57, 60, 64, 67, 72],  // F major 9
    [52, 55, 59, 62, 65, 69],  // E half-dim
]

// Accent groupings for 9/8: beats 0, 3, 6 (3+3+3)
accents = [0, 3, 6]

return (t, s) => {
    let n = []

    // Piano loops first 4 bars only
    let pianoT = t % (9 * 4)
    let pianoBar = Math.floor(pianoT / BAR)
    let pianoBt = pianoT % BAR

    // Drums use full time
    let bar = Math.floor(t / BAR)
    let bt = t % BAR
    let h = slop()

    // Chord changes every 2 bars (for piano, loops with pianoBar)
    let chordIdx = Math.floor(pianoBar / 2) % chords.length
    let chord = chords[chordIdx]

    // Pattern variation every 4 bars
    let pattern = pianoBar % 4

    // === PIANO === loops first 4 bars (36 ticks)
    if (pattern === 0 || pattern === 2) {
        // Rising arpeggio through the chord
        let noteIdx = pianoBt % chord.length
        let octaveShift = pianoBt >= 6 ? 12 : 0
        let note = chord[noteIdx] + octaveShift

        let isAccent = accents.includes(pianoBt)
        let vel = isAccent ? 0.72 + R() * 0.12 : 0.38 + R() * 0.15
        let dur = isAccent ? 0.4 : 0.18

        n.push({ w: piano, p: note, v: vel, d: dur, o: h })

        if (isAccent && R() > 0.5) {
            n.push({ w: piano, p: note - 12, v: 0.22 + R() * 0.1, d: 0.25, o: h + 0.02 })
        }
    }

    if (pattern === 1) {
        let reversed = [...chord].reverse()
        let noteIdx = pianoBt % reversed.length
        let note = reversed[noteIdx]

        let syncAccents = [0, 2, 4, 6]
        let isAccent = syncAccents.includes(pianoBt)
        let vel = isAccent ? 0.68 + R() * 0.15 : 0.35 + R() * 0.12
        let dur = isAccent ? 0.35 : 0.15

        n.push({ w: piano, p: note, v: vel, d: dur, o: h })

        if (pianoBt === 6) {
            n.push({ w: piano, p: note + 12, v: 0.55 + R() * 0.1, d: 0.5, o: h + 0.01 })
        }
    }

    if (pattern === 3) {
        let sparseBeats = [0, 4, 5, 7, 8]

        if (sparseBeats.includes(pianoBt)) {
            if (pianoBt === 0 || pianoBt === 4) {
                chord.slice(0, 3).forEach((note, i) => {
                    let vel = 0.6 - i * 0.08 + R() * 0.1
                    n.push({ w: piano, p: note, v: vel, d: 0.6, o: h + i * 0.012 })
                })
            } else {
                let melodicIdx = pianoBt === 5 ? 3 : pianoBt === 7 ? 4 : 5
                let note = chord[melodicIdx % chord.length]
                n.push({ w: piano, p: note + 12, v: 0.52 + R() * 0.12, d: 0.25, o: h })
            }
        }

        let ghostBeats = [1, 2, 3, 6]
        if (ghostBeats.includes(pianoBt) && R() > 0.4) {
            let ghostNote = chord[Math.floor(R() * chord.length)]
            n.push({ w: piano, p: ghostNote, v: 0.18 + R() * 0.12, d: 0.08, o: h })
        }
    }

    // Bass anchors
    if (pianoBt === 0) {
        let root = chord[0] - 12
        n.push({ w: piano, p: root, v: 0.75 + R() * 0.1, d: 0.8, o: h })
    }

    if (pianoBt === 6 && pianoBar % 2 === 0) {
        let fifth = chord[0] - 5
        n.push({ w: piano, p: fifth, v: 0.48 + R() * 0.12, d: 0.5, o: h })
    }

    // Melodic fills
    if (pianoBar % 4 === 3 && pianoBt >= 6) {
        let fillBt = pianoBt - 6
        let fillNotes = [chord[4], chord[5], chord[3] + 12]
        if (fillBt < fillNotes.length) {
            let vel = 0.5 + fillBt * 0.1 + R() * 0.08
            n.push({ w: piano, p: fillNotes[fillBt], v: vel, d: 0.2, o: h })
        }
    }

    // === GUITAR === slow sparse picked pattern on chord tones
    // [bar, beat, chordToneIndex] - loops with piano (4 bars)
    let guitarPattern = [
        [0, 0, 0],   // bar 0, beat 0: root
        [0, 6, 2],   // bar 0, beat 6: fifth
        [1, 3, 1],   // bar 1, beat 3: third
        [2, 0, 0],   // bar 2, beat 0: root
        [2, 6, 3],   // bar 2, beat 6: seventh
        [3, 3, 2],   // bar 3, beat 3: fifth
    ]

    guitarPattern.forEach(([gBar, gBeat, toneIdx]) => {
        if (pianoBar === gBar && pianoBt === gBeat) {
            let note = chord[toneIdx % chord.length] + 12  // octave up
            let vel = 0.55 + R() * 0.12
            let dur = 2.0 + R() * 0.5  // long ring
            n.push({ w: guitar, p: note, v: vel, d: dur, o: h + R() * 0.008 })
        }
    })

    // === BASS === 4 different roots over 4 bars
    // D, G, F, E progression (one root per bar)
    let bassRoots = [38, 43, 41, 40]  // D2, G2, F2, E2
    let bassRoot = bassRoots[pianoBar]
    let bass5th = bassRoot + 7  // perfect fifth up

    // Main pattern: root on beat 0, fifth on beat 6, ghost on beat 3
    if (pianoBt === 0) {
        // Strong root
        n.push({ w: bass, p: bassRoot, v: 0.75 + R() * 0.1, d: 0.4, o: h })
    }
    if (pianoBt === 6) {
        // Fifth
        n.push({ w: bass, p: bass5th, v: 0.6 + R() * 0.1, d: 0.3, o: h })
    }
    if (pianoBt === 3 && R() < 0.6) {
        // Ghost note - approach tone or root octave
        let ghostNote = R() > 0.5 ? bassRoot + 12 : bassRoot - 1
        n.push({ w: bass, p: ghostNote, v: 0.35 + R() * 0.1, d: 0.15, o: h })
    }
    // Occasional fill on beat 8 leading to next bar
    if (pianoBt === 8 && R() < 0.4) {
        let nextRoot = bassRoots[(pianoBar + 1) % 4]
        let approach = nextRoot + 1  // half step below next root
        n.push({ w: bass, p: approach, v: 0.45 + R() * 0.1, d: 0.12, o: h })
    }

    // === DRUMS === ULTRA INTENSE - DIZZYING METRIC CHAOS

    let localBar = bar % 4
    let inRideGroove = bar >= 256
    let toms = [TH, TM, TL, TF]

    // Metric displacement patterns - groupings that fight 9/8
    // Standard 9/8: 3+3+3
    // We'll use: 2+2+2+3, 4+5, 5+4, 2+3+2+2, 7+2, etc.
    let groupings = [
        [0, 2, 4, 6],       // 2+2+2+3 - feels like 4/4 trying to escape
        [0, 4],             // 4+5 - brutal asymmetry  
        [0, 5],             // 5+4 - the inverse
        [0, 2, 5, 7],       // 2+3+2+2 - polymetric chaos
        [0, 7],             // 7+2 - almost the whole bar then a stutter
        [0, 3, 5, 7],       // 3+2+2+2 - stumbling forward
        [0, 2, 3, 5, 6, 8], // nested 2+1+2+1+2+1 - machine gun
        [0, 1, 3, 4, 6, 7], // pairs - displaced 3+3+3
    ]

    if (!inRideGroove) {
        // === BUILDUP PHASE (bars 0-255) ===
        let intensity = Math.min(1, bar / 256)
        let velScale = 0.4 + intensity * 0.6

        // Always play: sparse accent on beat 6 of bar 3 end
        if (localBar === 3 && bt === 6 && intensity > 0.05) {
            n.push({ w: drums, p: K, v: (0.5 + intensity * 0.4) * velScale, d: 0.6, o: h })
        }

        // Bar 1: Scattered tom accents (starts at 25%)
        if (localBar === 1 && intensity > 0.25) {
            if (bt === 3 && R() < intensity) {
                flam(n, drums, TH, (0.5 + R() * 0.1) * velScale, 0.35, h)
            }
            if (bt === 6 && R() < intensity) {
                n.push({ w: drums, p: K, v: (0.55 + R() * 0.1) * velScale, d: 0.5, o: h })
                if (intensity > 0.4) {
                    n.push({ w: drums, p: TM, v: (0.4 + R() * 0.1) * velScale, d: 0.3, o: h + 0.015 })
                }
            }
        }

        // Bar 2: More active fills (starts at 50%)
        if (localBar === 2 && intensity > 0.5) {
            let bar2Int = (intensity - 0.5) * 2
            if (bt === 0 && R() < bar2Int) flam(n, drums, K, (0.6 + R() * 0.1) * velScale, 0.6, h)
            if (bt === 3 && R() < bar2Int) n.push({ w: drums, p: TH, v: (0.5 + R() * 0.1) * velScale, d: 0.28, o: h })
            if (bt === 5 && intensity > 0.6 && R() < bar2Int) {
                flam(n, drums, TM, (0.5 + R() * 0.1) * velScale, 0.25, h)
                n.push({ w: drums, p: K, v: (0.4 + R() * 0.1) * velScale, d: 0.4, o: h + 0.08 })
            }
            if (bt === 6 && intensity > 0.65 && R() < bar2Int) {
                n.push({ w: drums, p: TL, v: (0.55 + R() * 0.1) * velScale, d: 0.35, o: h })
            }
            if (bt === 8 && intensity > 0.7 && R() < bar2Int) flam(n, drums, TF, (0.55 + R() * 0.1) * velScale, 0.4, h)
        }

        // Bar 3: Build tension (starts at 75%)
        if (localBar === 3 && bt < 6 && intensity > 0.75) {
            let bar3Int = (intensity - 0.75) * 4
            if (bt === 0 && R() < bar3Int) n.push({ w: drums, p: K, v: (0.6 + R() * 0.1) * velScale, d: 0.5, o: h })
            if (bt === 2 && intensity > 0.8 && R() < bar3Int) flam(n, drums, S, (0.5 + R() * 0.1) * velScale, 0.4, h)
            if (bt === 3 && intensity > 0.85 && R() < bar3Int) {
                n.push({ w: drums, p: TH, v: (0.45 + R() * 0.1) * velScale, d: 0.25, o: h })
                n.push({ w: drums, p: K, v: (0.4 + R() * 0.1) * velScale, d: 0.35, o: h + 0.05 })
            }
            if (bt === 5 && intensity > 0.9 && R() < bar3Int) {
                flam(n, drums, TM, (0.5 + R() * 0.1) * velScale, 0.28, h)
                n.push({ w: drums, p: TL, v: (0.4 + R() * 0.1) * velScale, d: 0.3, o: h + 0.07 })
            }
        }

        // Bar 3 ending
        if (localBar === 3 && bt >= 6) {
            if (bt === 6 && intensity > 0.15) {
                flam(n, drums, S, (0.6 + intensity * 0.3) * velScale, 0.8, h)
                n.push({ w: drums, p: K, v: (0.65 + intensity * 0.25) * velScale, d: 0.6, o: h - 0.01 })
            }
            if (bt === 7 && intensity > 0.35) flam(n, drums, TH, (0.5 + intensity * 0.25) * velScale, 0.3, h)
            if (bt === 8 && intensity > 0.45) flam(n, drums, TF, (0.55 + intensity * 0.25) * velScale, 0.4, h)
        }

        if (localBar === 0 && bar > 0 && bt === 0 && intensity > 0.2) {
            n.push({ w: drums, p: CRASH, v: (0.5 + intensity * 0.4) * velScale, d: 2.0, o: 0 })
            n.push({ w: drums, p: K, v: (0.6 + intensity * 0.35) * velScale, d: 0.7, o: h })
        }

    } else {
        // === ULTRA INTENSE GROOVE - SINGLE DRUMMER, TECHNICAL AS HELL ===

        let grooveBar = bar - 256
        let phrase = Math.floor(grooveBar / 4) % 8

        // Pick a metric grouping - changes every 4 bars
        let grouping = groupings[phrase]
        let isGroupAccent = grouping.includes(bt)

        // Track what limbs are doing this 8th note
        // A real drummer: 2 hands, 1 kick foot, 1 hi-hat foot
        let handUsed = false
        let kickUsed = false

        // === KICK FOOT ===
        // Displaced accents on the grouping pattern
        if (isGroupAccent && !kickUsed) {
            let kickVel = 0.75 + R() * 0.2
            // Sometimes delay by 16th or 32nd for displacement
            let delay = R() < 0.25 ? 0.125 : R() < 0.4 ? 0.0625 : 0
            n.push({ w: drums, p: K, v: kickVel, d: 0.35, o: h + delay })
            kickUsed = true

            // Quick double only occasionally
            if (R() < 0.2) {
                n.push({ w: drums, p: K, v: kickVel * 0.65, d: 0.18, o: h + delay + 0.09 })
            }
        }

        // Off-beat kick for polymetric feel (4 against 9)
        let poly4Beat = Math.floor(t * 4 / 9 * 4) % 4
        if (!kickUsed && poly4Beat === 0 && R() < 0.3) {
            n.push({ w: drums, p: K, v: 0.6 + R() * 0.15, d: 0.3, o: h })
            kickUsed = true
        }

        // === RIGHT HAND - hi-hat/ride pattern ===
        // Broken 8th note pattern with intentional gaps
        let hatPattern = [0.9, 0.3, 0.7, 0.25, 0.85, 0.2, 0.6, 0.35, 0.8]
        let playHat = R() < hatPattern[bt]

        if (playHat && !handUsed) {
            // Alternate between closed hat, open hat, and bell
            let isOpen = bt === 3 || bt === 6
            let isBell = isGroupAccent && R() < 0.4

            if (isBell) {
                n.push({ w: drums, p: BELL, v: 0.55 + R() * 0.2, d: 0.5, o: h })
            } else if (isOpen) {
                n.push({ w: drums, p: HHO, v: 0.5 + R() * 0.2, d: 0.3, o: h })
            } else {
                n.push({ w: drums, p: HHC, v: 0.4 + R() * 0.25, d: 0.08, o: h })
            }
            handUsed = true
        }

        // === LEFT HAND - snare/toms ===
        // Ghost notes and accents on displaced beats
        let antiGroup = [1, 4, 7].filter(x => !grouping.includes(x))
        let isAntiAccent = antiGroup.includes(bt)

        // Snare accent on anti-beats (fighting the grouping)
        if (isAntiAccent && R() < 0.7) {
            flam(n, drums, S, 0.7 + R() * 0.2, 0.4, h)
            handUsed = true
        }
        // Ghost notes between accents
        else if (!isGroupAccent && R() < 0.35) {
            n.push({ w: drums, p: SR, v: 0.18 + R() * 0.15, d: 0.08, o: h + R() * 0.02 })
        }

        // === FILLS - one hand moving around toms ===
        // Every 4 bars, fill on last 2 beats
        let isFillBar = grooveBar % 4 === 3
        let isFillZone = bt >= 7

        if (isFillBar && isFillZone) {
            // Sequential tom fill - one note at a time!
            let fillBeat = bt - 7  // 0 or 1
            let fillType = phrase % 4

            if (fillType === 0) {
                // Descending: TH -> TM -> TL -> TF
                let tomIdx = fillBeat * 2
                n.push({ w: drums, p: toms[tomIdx], v: 0.6 + R() * 0.15, d: 0.15, o: h })
                n.push({ w: drums, p: toms[tomIdx + 1], v: 0.55 + R() * 0.15, d: 0.15, o: h + 0.12 })
            }
            else if (fillType === 1) {
                // Ascending: TF -> TL -> TM -> TH
                let tomIdx = 3 - fillBeat * 2
                n.push({ w: drums, p: toms[tomIdx], v: 0.55 + R() * 0.15, d: 0.15, o: h })
                n.push({ w: drums, p: toms[tomIdx - 1], v: 0.6 + R() * 0.15, d: 0.15, o: h + 0.12 })
            }
            else if (fillType === 2) {
                // Snare roll into tom
                if (fillBeat === 0) {
                    // Quick snare doubles
                    n.push({ w: drums, p: S, v: 0.5, d: 0.1, o: h })
                    n.push({ w: drums, p: S, v: 0.55, d: 0.1, o: h + 0.08 })
                    n.push({ w: drums, p: S, v: 0.6, d: 0.1, o: h + 0.16 })
                } else {
                    flam(n, drums, TF, 0.7, 0.3, h)
                }
            }
            else {
                // Paradiddle fragment: R L R R or L R L L
                let surfaces = fillBeat === 0 ? [TH, TM, TH, TH] : [TL, TF, TL, TL]
                surfaces.forEach((tom, i) => {
                    n.push({ w: drums, p: tom, v: 0.45 + (i === 0 ? 0.15 : 0), d: 0.08, o: h + i * 0.055 })
                })
            }

            // Kick anchors the fill
            if (bt === 8) {
                n.push({ w: drums, p: K, v: 0.8, d: 0.4, o: h })
            }
        }

        // === LONGER FILLS every 8 bars ===
        let isLongFillBar = grooveBar % 8 === 7
        let isLongFillZone = bt >= 5

        if (isLongFillBar && isLongFillZone && !isFillZone) {
            let fillBeat = bt - 5  // 0, 1, 2

            // Metric modulation fill: triplets feel
            let tomIdx = fillBeat % 4

            // Single alternating strokes with accents
            n.push({ w: drums, p: toms[tomIdx], v: 0.55 + R() * 0.15, d: 0.12, o: h })
            if (R() < 0.6) {
                n.push({ w: drums, p: toms[(tomIdx + 1) % 4], v: 0.45 + R() * 0.1, d: 0.1, o: h + 0.11 })
            }
        }

        // === CRASHES ===
        // Only on phrase boundaries
        if (grooveBar % 4 === 0 && bt === 0) {
            n.push({ w: drums, p: CRASH, v: 0.65 + R() * 0.2, d: 2.5, o: h })
            n.push({ w: drums, p: K, v: 0.85, d: 0.5, o: h })  // kick with crash
        }
    }

    // === PHRASE MARKER (every 8 bars) ===

    if (bar % 8 === 0 && bt === 0) {
        // High bell tone
        n.push({ w: piano, p: chord[5] + 12, v: 0.62, d: 1.5, o: h + 0.005 })
    }

    return n
}

