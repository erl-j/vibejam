m = 4.5
sl = 0.08

slop = () => (Math.random() - 0.5) * sl

// GM drum pitches
KICK = 36
SNARE = 38
SNARE_RIM = 37
HH_CLOSED = 42
HH_OPEN = 46
HH_PEDAL = 44
RIDE = 51
RIDE_BELL = 53
CRASH = 49
TOM_LOW = 45
TOM_MID = 47
TOM_HIGH = 50
TOM_FLOOR = 41
TOM_FLOOR_LOW = 43

toms = [TOM_FLOOR_LOW, TOM_FLOOR, TOM_LOW, TOM_MID, TOM_HIGH]

// prog rock in 7/8 (14 sixteenths per bar)
BAR = 14

return (t, s) => {
    const n = []
    limbs = { lf: null, rf: null, lh: null, rh: null }

    bar = Math.floor(t / BAR)
    section = Math.floor(bar / 8) % 4
    bt = t % BAR
    phrase = Math.floor(bar / 4)

    // tom fill every 8 bars
    tomFill = bar % 8 == 7 && bt >= 10

    // drums - channel 1
    if (tomFill) {
        ti = Math.floor((bt - 10) / 1) % toms.length
        fv = .55 + (bt - 10) * .08
        h = bt % 2 ? 'rh' : 'lh'
        limbs[h] = { w: 'm:1', p: toms[ti], v: fv, d: 1.5, o: slop() }
        if (bt == 13) limbs.rf = { w: 'm:1', p: KICK, v: .95, d: 1.0, o: slop() }
    } else {
        // 7/8 pattern: accent on 1, 4, 6 (in eighths: 0, 3, 5)
        // in sixteenths: 0, 6, 10
        kicks = [0, 6, 10]
        snares = [4, 8, 12]

        if (section >= 2) {
            // heavier pattern
            kicks = [0, 3, 6, 10]
            snares = [4, 12]
        }

        if (kicks.includes(bt)) {
            limbs.rf = { w: 'm:1', p: KICK, v: bt == 0 ? .9 : .7, d: 1.0, o: -.005 * m + slop() }
        }
        if (snares.includes(bt)) {
            limbs.lh = { w: 'm:1', p: SNARE, v: .75, d: 1.5, o: .01 * m + slop() }
        }

        // ride pattern with bell accents
        if (bt % 2 == 0) {
            bell = bt == 0 || bt == 6
            limbs.rh = { w: 'm:1', p: bell ? RIDE_BELL : RIDE, v: bell ? .7 : .45, d: 1.2, o: slop() }
        }

        // hihat pedal on offbeats
        if (bt % 4 == 2) {
            limbs.lf = { w: 'm:1', p: HH_PEDAL, v: .35, d: 0.5, o: slop() }
        }

        // crash on section changes
        if (bt == 0 && bar % 8 == 0) {
            limbs.rh = { w: 'm:1', p: CRASH, v: .85, d: 3.0, o: slop() }
        }
    }

    // --- electric bass - channel 2 ---
    // mixolydian mode for that prog feel
    mixo = [0, 2, 4, 5, 7, 9, 10]
    roots = [40, 43, 45, 38]  // E, G, A, D - classic prog progression
    root = roots[bar % 4]

    // syncopated bass in 7/8
    bassPattern = [0, 3, 4, 6, 8, 10, 12]
    bassAccent = [1, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6]

    bassIdx = bassPattern.indexOf(bt)
    if (bassIdx >= 0 && !tomFill) {
        deg = [0, 4, 2, 0, 4, 6, 4][bassIdx]
        oct = deg >= 7 ? 1 : 0
        deg = deg % 7
        pitch = root + mixo[deg] + oct * 12

        // occasional octave jumps
        if (bar % 3 == 2 && bassIdx == 2) pitch += 12

        dur = bassIdx == 0 ? 2.5 : 1.2
        n.push({ w: 'm:2', p: pitch, v: bassAccent[bassIdx], d: dur, o: slop() })
    }

    // --- electric guitar - channel 3 ---
    // arpeggios and power chords

    if (section == 0 || section == 2) {
        // arpeggiated section
        arpPattern = [0, 2, 4, 6, 7, 9, 11]
        if (arpPattern.includes(bt)) {
            arpIdx = arpPattern.indexOf(bt)
            deg = [0, 2, 4, 2, 4, 6, 4][arpIdx]
            pitch = root + 12 + mixo[deg % 7]
            vel = bt == 0 ? .75 : .55

            // add fifth for thickness
            n.push({ w: 'm:3', p: pitch, v: vel, d: 2.0, o: slop() })
            if (bt == 0 || bt == 7) {
                n.push({ w: 'm:3', p: pitch + 7, v: vel * .7, d: 2.0, o: slop() })
            }
        }
    } else {
        // power chord stabs
        chordHits = [0, 6, 10]
        if (section == 3) chordHits = [0, 3, 6, 10]

        if (chordHits.includes(bt)) {
            vel = bt == 0 ? .9 : .7
            dur = bt == 0 ? 3.0 : 1.8
            // power chord: root + fifth + octave
            n.push({ w: 'm:3', p: root + 12, v: vel, d: dur, o: slop() })
            n.push({ w: 'm:3', p: root + 19, v: vel * .85, d: dur, o: slop() })
            n.push({ w: 'm:3', p: root + 24, v: vel * .7, d: dur, o: slop() })
        }

        // melodic fills between chords
        if (section == 3 && bt == 8) {
            fillDeg = (bar % 7)
            n.push({ w: 'm:3', p: root + 24 + mixo[fillDeg], v: .6, d: 1.5, o: slop() })
        }
    }

    return [...Object.values(limbs).filter(x => x), ...n]
}

