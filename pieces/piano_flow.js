// 9/8 Piano Arpeggio Loop
// Grouping: 3+3+3 with accent variations

piano = 'm:3'
bass = 'm:2' // electric bass finger picked.
drums = 'm:1' // jazzy kit


// Humanization
sl = 0.018
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

        // 25% sparser: accents always play, non-accents skip ~30% of time
        let shouldPlay = isAccent || R() > 0.3

        if (shouldPlay) {
            // Really short and quiet
            let vel = isAccent ? 0.28 + R() * 0.08 : 0.15 + R() * 0.08
            let dur = isAccent ? 0.08 : 0.05
            n.push({ w: piano, p: note, v: vel, d: dur, o: h })
        }

        if (isAccent && R() > 0.6) {
            // Really short and quiet
            n.push({ w: piano, p: note - 12, v: 0.08 + R() * 0.05, d: 0.06, o: h + 0.02 })
        }
    }

    if (pattern === 1) {
        let reversed = [...chord].reverse()
        let noteIdx = pianoBt % reversed.length
        let note = reversed[noteIdx]

        let syncAccents = [0, 2, 4, 6]
        let isAccent = syncAccents.includes(pianoBt)

        // 25% sparser: accents always play, non-accents skip ~30% of time
        let shouldPlay = isAccent || R() > 0.3

        if (shouldPlay) {
            // Really short and quiet
            let vel = isAccent ? 0.26 + R() * 0.08 : 0.14 + R() * 0.07
            let dur = isAccent ? 0.07 : 0.05
            n.push({ w: piano, p: note, v: vel, d: dur, o: h })
        }

        if (pianoBt === 6 && R() > 0.25) {
            // Really short and quiet
            n.push({ w: piano, p: note + 12, v: 0.22 + R() * 0.06, d: 0.08, o: h + 0.01 })
        }
    }

    if (pattern === 3) {
        let sparseBeats = [0, 4, 5, 7, 8]

        // Voicing randomness on every 4th bar
        let voicingShift = R() > 0.5 ? 12 : R() > 0.3 ? -12 : 0

        if (sparseBeats.includes(pianoBt)) {
            if (pianoBt === 0 || pianoBt === 4) {
                // Random inversion on 4th bar
                let startIdx = R() > 0.6 ? 1 : R() > 0.3 ? 2 : 0
                chord.slice(startIdx, startIdx + 3).forEach((note, i) => {
                    // Really short and quiet
                    let vel = 0.22 - i * 0.03 + R() * 0.06
                    n.push({ w: piano, p: note + voicingShift, v: vel, d: 0.08, o: h + i * 0.012 })
                })
            } else {
                let melodicIdx = pianoBt === 5 ? 3 : pianoBt === 7 ? 4 : 5
                let note = chord[melodicIdx % chord.length]
                // Really short and quiet with voicing randomness
                n.push({ w: piano, p: note + 12 + voicingShift, v: 0.18 + R() * 0.07, d: 0.06, o: h })
            }
        }

        let ghostBeats = [1, 2, 3, 6]
        if (ghostBeats.includes(pianoBt) && R() > 0.6) {
            let ghostNote = chord[Math.floor(R() * chord.length)]
            // Really short and quiet with voicing randomness
            n.push({ w: piano, p: ghostNote + voicingShift, v: 0.09 + R() * 0.06, d: 0.04, o: h })
        }
    }

    // Bass anchors
    if (pianoBt === 0 && R() > 0.1) {  // Slightly sparser but mostly keep them
        let root = chord[0] - 12
        // Really short and quiet
        n.push({ w: piano, p: root, v: 0.28 + R() * 0.06, d: 0.08, o: h })
    }

    if (pianoBt === 6 && pianoBar % 2 === 0 && R() > 0.25) {  // Make this sparser
        let fifth = chord[0] - 5
        // Really short and quiet
        n.push({ w: piano, p: fifth, v: 0.18 + R() * 0.07, d: 0.06, o: h })
    }

    // Melodic fills
    if (pianoBar % 4 === 3 && pianoBt >= 6 && R() > 0.25) {  // 25% sparser
        let fillBt = pianoBt - 6
        let fillNotes = [chord[4], chord[5], chord[3] + 12]
        if (fillBt < fillNotes.length) {
            // Really short and quiet
            let vel = 0.18 + fillBt * 0.04 + R() * 0.05
            n.push({ w: piano, p: fillNotes[fillBt], v: vel, d: 0.05, o: h })
        }
    }

    // === PHRASE MARKER (every 8 bars) ===
    if (pianoBar % 8 === 0 && pianoBt === 0) {
        // High bell tone - really short and quiet
        n.push({ w: piano, p: chord[5] + 12, v: 0.24, d: 0.12, o: h + 0.005 })
    }

    // === CHORD TONE COUNTERMOTION === Higher register
    // Use actual chord tones (upper extensions) for consonance
    let highMelody = [
        chord[3] + 12,  // 7th, high
        chord[4] + 12,  // 9th, high
        chord[5] + 12,  // top chord tone, high
        chord[2] + 12,  // 5th, high
    ]

    // Sparse countermelody - plays opposite direction to bass movement
    if (pianoBar % 2 === 1 && R() > 0.65) {  // Every other 2-bar phrase
        if ([1, 4, 7].includes(pianoBt)) {
            // Descending when bass is on root (countermotion)
            let idx = Math.floor((pianoBt / 3)) % highMelody.length
            let note = highMelody[highMelody.length - 1 - idx]  // Reverse order
            // Really short and quiet
            let vel = 0.18 + R() * 0.08
            let dur = 0.06 + R() * 0.04
            n.push({ w: piano, p: note, v: vel, d: dur, o: h - 0.005 })
        }
    }

    // Ascending phrases on different bars
    if (pianoBar % 4 === 2 && R() > 0.7) {
        if ([2, 5, 8].includes(pianoBt)) {
            let idx = Math.floor((pianoBt / 3)) % highMelody.length
            let note = highMelody[idx]  // Ascending
            // Really short and quiet
            let vel = 0.16 + R() * 0.07
            let dur = 0.05 + R() * 0.04
            n.push({ w: piano, p: note, v: vel, d: dur, o: h - 0.005 })
        }
    }

    // === CYMBALS === Simple, dynamic, calm
    let ridePitch = 51  // Ride cymbal
    let hihatPitch = 42 // Closed hi-hat
    let openHihatPitch = 46 // Open hi-hat
    let crashPitch = 49 // Crash cymbal
    let kickPitch = 36  // Kick drum
    let highTom = 50
    let midTom = 47
    let lowTom = 43

    // Ride pattern - sparse, following the 3+3+3 feel
    if ([0, 3, 6].includes(pianoBt)) {
        // Occasional kicks with crashes on accents (kicks ALWAYS with cymbals!)
        let doKick = R() > 0.7

        if (doKick) {
            // Kick + crash + bass together
            let bassNote = chord[0] - 12
            // Short bass notes, but sometimes long on beat 0 (root emphasis)
            let bassDur = (pianoBt === 0 && R() > 0.5) ? 0.6 + R() * 0.2 : 0.15 + R() * 0.05
            n.push({ w: drums, p: kickPitch, v: 0.45 + R() * 0.1, d: 0.3, o: h })
            n.push({ w: drums, p: crashPitch, v: 0.28 + R() * 0.08, d: 0.6, o: h + 0.002 })
            // Bass root + higher octave (two octaves up for clarity)
            n.push({ w: bass, p: bassNote, v: 0.65 + R() * 0.08, d: bassDur, o: h + 0.003 })
            n.push({ w: bass, p: bassNote + 24, v: 0.48 + R() * 0.06, d: bassDur, o: h + 0.004 })
        } else {
            // Just ride on accents
            let vel = 0.25 + R() * 0.08
            n.push({ w: drums, p: ridePitch, v: vel, d: 0.4, o: h })
        }
    } else if ([1, 4, 7].includes(pianoBt) && R() > 0.3) {
        // Softer off-beats
        let vel = 0.15 + R() * 0.06
        n.push({ w: drums, p: ridePitch, v: vel, d: 0.25, o: h })
    }

    // Occasional subtle hi-hat for texture
    if ([2, 5, 8].includes(pianoBt) && R() > 0.6) {
        let vel = 0.12 + R() * 0.05
        n.push({ w: drums, p: hihatPitch, v: vel, d: 0.12, o: h })
    }

    // Phrase ending: kick + cymbal + bass swell (every 4 bars)
    if (pianoBar % 4 === 3 && pianoBt === 8) {
        let bassNote = chord[0] - 12
        // Sometimes long on phrase endings (root emphasis)
        let bassDur = R() > 0.4 ? 0.7 + R() * 0.3 : 0.2
        n.push({ w: drums, p: kickPitch, v: 0.5 + R() * 0.08, d: 0.35, o: h })
        n.push({ w: drums, p: crashPitch, v: 0.32 + R() * 0.08, d: 0.8, o: h + 0.002 })
        // Bass root + higher octave (two octaves up for clarity)
        n.push({ w: bass, p: bassNote, v: 0.7 + R() * 0.08, d: bassDur, o: h + 0.003 })
        n.push({ w: bass, p: bassNote + 24, v: 0.52 + R() * 0.06, d: bassDur, o: h + 0.004 })
    }

    // === BASS GHOST NOTE FILLS === Pentatonic, leading into bars 0 and 2
    // Minor pentatonic: root, m3, 4, 5, m7 (higher register)
    let bassRoot = chord[0]  // One octave higher than bass notes
    let pentatonicBass = [
        bassRoot,        // Root
        bassRoot + 3,    // m3
        bassRoot + 5,    // 4
        bassRoot + 7,    // 5
        bassRoot + 10    // m7
    ]

    // Leading into bar 0 (end of bar 3)
    if (pianoBar % 4 === 3 && [7, 8].includes(pianoBt) && R() > 0.5) {
        let fillIdx = pianoBt === 7 ? Math.floor(R() * 3) + 2 : Math.floor(R() * 2) + 3
        let note = pentatonicBass[fillIdx % pentatonicBass.length]
        // More in front - louder!
        n.push({ w: bass, p: note, v: 0.72 + R() * 0.14, d: 0.6, o: h + 0.002 })
    }

    // Leading into bar 2 (end of bar 1)
    if (pianoBar % 4 === 1 && [7, 8].includes(pianoBt) && R() > 0.55) {
        let fillIdx = pianoBt === 7 ? Math.floor(R() * 3) + 1 : Math.floor(R() * 2) + 3
        let note = pentatonicBass[fillIdx % pentatonicBass.length]
        // More in front - louder!
        n.push({ w: bass, p: note, v: 0.68 + R() * 0.13, d: 0.6, o: h + 0.002 })
    }

    // === TOM FILLS === Abrupt, in and out
    // Quick fills on beats 7-8, every few bars
    if (pianoBar % 3 === 2 && R() > 0.65) {
        if (pianoBt === 7) {
            // Quick high-to-low tom run (abrupt!)
            let useFlam = R() > 0.6

            if (useFlam) {
                // Flam on high tom
                n.push({ w: drums, p: highTom, v: 0.3 + R() * 0.08, d: 0.08, o: h - 0.015 })
                n.push({ w: drums, p: highTom, v: 0.5 + R() * 0.1, d: 0.08, o: h })
            } else {
                n.push({ w: drums, p: highTom, v: 0.55 + R() * 0.1, d: 0.08, o: h })
            }
        }

        if (pianoBt === 8) {
            // Finish the fill
            let endWithSnap = R() > 0.5

            if (endWithSnap) {
                // End on open hi-hat + kick snap
                n.push({ w: drums, p: lowTom, v: 0.6 + R() * 0.12, d: 0.1, o: h })
                n.push({ w: drums, p: openHihatPitch, v: 0.45 + R() * 0.1, d: 0.4, o: h + 0.01 })
                n.push({ w: drums, p: kickPitch, v: 0.55 + R() * 0.08, d: 0.2, o: h + 0.015 })
            } else {
                // Just end on floor tom
                n.push({ w: drums, p: lowTom, v: 0.62 + R() * 0.1, d: 0.12, o: h })
            }
        }
    }

    // Occasional mid-bar tom accents (very sparse, abrupt)
    if (pianoBt === 5 && pianoBar % 5 === 1 && R() > 0.75) {
        let useFlam = R() > 0.5
        if (useFlam) {
            // Flam on mid tom
            n.push({ w: drums, p: midTom, v: 0.35 + R() * 0.08, d: 0.08, o: h - 0.012 })
            n.push({ w: drums, p: midTom, v: 0.52 + R() * 0.1, d: 0.1, o: h })
        } else {
            n.push({ w: drums, p: midTom, v: 0.55 + R() * 0.12, d: 0.1, o: h })
        }
    }

    return n
}

