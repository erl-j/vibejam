m = 4.5
sl = 0.10

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

toms = [TOM_FLOOR_LOW, TOM_FLOOR, TOM_LOW, TOM_MID, TOM_HIGH, TOM_HIGH]

return (t, s) => {
    const n = []
    limbs = { lf: null, rf: null, lh: null, rh: null }
    bar = Math.floor(t / 24); part = Math.floor(t / 64) % 2; t %= 32
    snareFill = bar % 4 == 3 && t >= 20
    tomFill = bar % 8 == 7 && t >= 18

    k = '90000060804000009500005080400000'
    g = '00029010022950012902010203902050'

    if (tomFill) {
        ti = Math.floor((t - 18) / 1) % toms.length
        fv = .6 + (t - 18) * .06
        h = t % 2 ? 'rh' : 'lh'
        limbs[h] = { w: 'm:10', p: toms[ti], v: fv, d: 2.0, o: Math.random() * .015 * m + slop() }
        if (t == 23) limbs.rf = { w: 'm:10', p: KICK, v: .9, d: 1.0, o: slop() }
    } else if (snareFill) {
        h = t % 2 ? 'rh' : 'lh'
        sn = h == 'rh' ? SNARE : SNARE_RIM
        fv = .5 + (t - 20) * .12
        limbs[h] = { w: 'm:10', p: sn, v: fv, d: 1.5, o: Math.random() * .02 * m + slop() }
        if (t % 2 == 0) limbs.rf = { w: 'm:10', p: KICK, v: .6, d: 1.0, o: slop() }
    } else {
        if (k[t] > 0) limbs.rf = { w: 'm:10', p: KICK, v: k[t] / 9, d: 1.0, o: -.01 * m + slop() }
        if (g[t] > 0) limbs.lh = { w: 'm:10', p: SNARE, v: g[t] / 9, d: 2.0, r: 1.0, o: (.02 + Math.random() * .01) * m + slop() }
        rv = t % 2 ? .1 : .5; ro = (t % 2 ? .15 : 0) * m
        limbs.rh = { w: 'm:10', p: RIDE, v: rv, d: 1.0, o: ro + slop() }
        if (t % 2 == 1) limbs.lf = { w: 'm:10', p: HH_PEDAL, v: .3, d: 0.5, o: slop() }
    }

    cmajor = [0, 2, 4, 5, 7, 9, 11];
    // // add a arp on channel 1 with aminor
    if (t % 2 == 0) {
        // n.push({ w: 'm:2', v: t % 4 == 0 ? 1.0 : 0.8, d: 1.5, p: 40 + 12 + cmajor[Math.floor(t) + 4 % cmajor.length], id: [t % 3] })
        // n.push({ w: 'm:2', v: t % 4 == 0 ? 1.0 : 0.8, d: 1.5, p: 40 + cmajor[Math.floor(t) + 4 % cmajor.length], id: [t % 3] })
        n.push({ w: 'm:2', v: t % 4 == 0 ? 1.0 : 0.8, d: 1.5, p: 45 + cmajor[(t + 7) % cmajor.length], id: [t % 1] })
        n.push({ w: 'm:2', v: t % 4 == 0 ? 1.0 : 0.8, d: 2.5, p: 45 + 7 + 12 + cmajor[(t + 7) % cmajor.length], id: [t % 10] })
    }

    // saxophone bebop improv - same root as arp
    arpDeg = (t + 7) % cmajor.length
    saxRoot = 45 + 24  // two octaves above arp root

    // phrase structure - sax breathes every 6-10 beats
    phraseLen = 6 + (bar % 5)
    phrasePos = t % phraseLen
    breathing = phrasePos >= phraseLen - 2

    // melodic contour - smooth lines
    contour = Math.sin(t * 0.4 + bar * 0.7) * 2 + Math.sin(t * 0.15) * 1.5
    deg = arpDeg + Math.round(contour)

    // wrap to scale with octave
    oct = 0
    while (deg >= cmajor.length) { deg -= cmajor.length; oct++ }
    while (deg < 0) { deg += cmajor.length; oct-- }

    pitch = saxRoot + cmajor[deg] + oct * 12

    // bebop runs on some phrases
    run = bar % 4 == 2 && phrasePos < 4
    if (run) {
        runDeg = (arpDeg + phrasePos) % cmajor.length
        pitch = saxRoot + cmajor[runDeg]
    }

    // swing feel
    swing = (t % 2 == 1) ? 0.12 * m : 0

    // sax dynamics - swell within phrases
    swell = Math.sin(phrasePos / phraseLen * Math.PI) * 0.3
    vel = 0.6 + swell

    // articulation - legato with occasional staccato
    dur = run ? 0.8 : (phrasePos == 0 ? 2.5 : 1.8)

    if (!breathing) {
        n.push({ w: 'm:3', v: vel, d: dur, p: pitch, o: swing + slop() })
    }

    return [...Object.values(limbs).filter(x => x), ...n]
}
