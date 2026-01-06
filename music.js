
hats = ['hat:0', 'hat:3', 'hat:7', 'hat:7']
chordRoots = [28.5, 26.5, 31.5, 29.5]  // down one octave

// global settings
sawDur = 0.05
sawCut = 200
detune = 0.02
globalRev = 200.5
drumVol = 0.5

// ending settings - cycles every 128 bars
endingCycle = 128  // ending triggers every N bars
endingLength = 8  // bars

// supersaw: 4 detuned saws with stereo spread
supersaw = (p, v, d, c, x = 0, o = 0, r = 0) => {
    notes = []
    for (i = 0; i < 4; i++) {
        dt = (Math.random() - 0.5) * detune
        px = x + (i - 1.5) * 0.3  // spread across stereo
        notes.push({ w: 'sawtooth', p: p + dt, v: v * 0.3, d: d, c: c, x: Math.max(-1, Math.min(1, px)), o: o, r: r + globalRev })
    }
    return notes
}

return (t, s) => {
    n = []
    bar = Math.floor(t / 16)
    chordIdx = Math.floor(bar / 2) % 4
    root = chordRoots[chordIdx]

    // ending calculations - cycles every 128 bars
    barInCycle = bar % endingCycle
    endingStart = endingCycle - endingLength
    inEnding = barInCycle >= endingStart
    endProgress = inEnding ? (barInCycle - endingStart) / endingLength : 0
    fade = 1 - endProgress
    endCut = inEnding ? sawCut * (1 - endProgress * 0.8) : sawCut
    endRev = inEnding ? globalRev + endProgress * 3 : globalRev

    kickOn = (bar % 8) >= 2  // kick drops for 2 bars every 8
    if (t % 4 === 0 && kickOn && endProgress < 0.5) n.push({ p: 36, w: 'drums', v: drumVol * fade, r: endRev })
    if ((t % 16 === 0 || t % 16 === 8) && endProgress < 0.6) n.push({ w: 'clap:0', v: drumVol * 0.6 * fade, d: 0.3, r: endRev })

    // open hats on upbeats, cycling through samples
    if (t % 4 === 2 && endProgress < 0.7) {
        n.push({ w: hats[Math.floor(t / 4) % 4], v: drumVol * 0.5 * fade, d: 0.2, r: endRev * 0.5 })
    }

    seq = [
        0, 0, 1, 1,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 1, 2,
    ]

    // supersaw stab from seq (1 = hit, 2 = 32nd double)
    seqVal = seq[t % 16]
    if (seqVal) {
        stabCut = 800 + (t % 16) * 100
        n.push(...supersaw(root + 12 + 12, 0.8, 0.5, stabCut, 0, 0, 0.2))
        if (seqVal === 2) {
            n.push(...supersaw(root + 7 + 12, 0.45, 0.08, stabCut + 200, 0, 0.5, 0.15))
        }
    }

    // bass on second upbeat - 2 wet, 2 dry, follows chord
    // if (t % 16 === 6) {
    //     rev = (bar % 4 < 2) ? 8 : 0.15
    //     n.push({ w: 'bass:0', v: 0.7, d: 0.4, r: rev, p: root - 12 })
    // }

    // wind 16ths - velocity mod, stereo, microtiming, deep
    vel = 0.15 + 0.12 * Math.sin(t * 0.4) + 0.08 * Math.sin(t * 1.1)
    pan = Math.sin(t * 0.23) * 0.7
    micro = (Math.random() - 0.5) * 0.08
    n.push({ w: 'wind:0', v: vel, d: 0.22, x: pan, o: micro, p: 36, r: globalRev })

    // supersaw 16ths - cutoff automation, follows chord
    sweep = (t % 64) / 64  // slow rise over 4 bars
    wobble = Math.sin(t * 0.8) * 0.3 + 0.7
    cutoff = endCut + sweep * 1200 * wobble * fade
    if (endProgress < 0.9) {
        n.push(...supersaw(root, 0.3 * fade, sawDur, cutoff))
        if ((t + 1) % 2 == 0) {
            n.push(...supersaw(root + 24, 0.3 * fade, sawDur * 3, cutoff))
        } else {
            n.push(...supersaw(root + 12, 0.3 * fade, sawDur * 2, cutoff, 1.0))
        }
    }

    // triple kick every 4 bars with stereo panning
    if (t % 64 === 14) {
        n.push({ p: 36, w: 'drums', v: drumVol * 0.7, x: -0.6, r: globalRev })
        n.push({ p: 36, w: 'drums', v: drumVol * 0.75, x: 0, o: 0.5, r: globalRev })
        n.push({ p: 36, w: 'drums', v: drumVol * 0.8, x: 0.6, o: 1, r: globalRev })
    }

    // ping pong supersaw fill every 8 bars - rising reverb
    if (t % 128 === 120) {
        for (j = 0; j < 6; j++) {
            px = (j % 2 === 0) ? -0.8 : 0.8
            n.push(...supersaw(root + 24 + (j % 2) * 7, 0.4 * Math.pow(0.75, j), sawDur, sawCut + 600, px, j * 1.5, 0.1 + j * 5))
        }
    }

    // syncopated voice chops
    bt = t % 16
    starts = [0, 0.15, 0.3, 0.45]
    if (bt === 3 || bt === 6 || bt === 11 || bt === 14) {
        n.push({ w: 'voice:0', v: 0.05, d: 0.08, start: starts[Math.floor(t / 16) % 4], r: 20.0, p: 50 })
    }

    // simple 5th and 9th arp - stereo motion, follows chord
    arpNotes = [root, root + 7, root + 19, root + 26]  // root, 5th, 9th+oct, 12th+oct
    if (t % 1 === 0) {
        arpPitch = arpNotes[Math.floor(t) % 3]
        arpPan = Math.sin(t * 0.15) * 0.4
        n.push({ w: 'triangle', p: arpPitch, v: 0.25, d: 0.25, r: globalRev, x: arpPan, c: sawCut })
    }

    // taiko flams - massive stereo, on the beat
    if (t % 16 === 0) {
        // flam: tight grace note, wide stereo
        n.push({ w: 'taiko:2', v: 0.6, d: 0.8, x: -0.9, o: -0.05, r: 0.8 })
        n.push({ w: 'taiko:0', v: 1.0, d: 1.2, x: 0.9, r: 1.2 })
    }
    if (t % 16 === 8) {
        // beat 3 hit
        n.push({ w: 'taiko:1', v: 0.8, d: 1.0, x: -0.7, o: -0.05, r: 0.9 })
        n.push({ w: 'taiko:1', v: 1.0, d: 1.2, x: 0.7, r: 1.0 })
    }
    if (t % 64 === 0) {
        // big downbeat every 4 bars - double layer
        n.push({ w: 'taiko:2', v: 1.2, d: 1.4, x: 0, r: 1.5 })
    }

    // taiko rainbow roll - sweeping stereo cascade every 4 bars
    if (t % 64 >= 56 && t % 64 < 64) {
        rollIdx = t % 64 - 56
        rainbowPan = -1 + (rollIdx / 4)  // sweep left to right
        taikoSample = `taiko:${rollIdx % 4}`
        vel = 0.5 + rollIdx * 0.08
        n.push({ w: taikoSample, v: vel, d: 0.6, x: rainbowPan, r: 0.4 + rollIdx * 0.15, p: 55 + rollIdx * 2 })
    }

    // syncopated taiko accents with pitch variety
    if ((t % 32 === 5 || t % 32 === 13 || t % 32 === 21) && endProgress < 0.8) {
        accIdx = Math.floor(t / 32) % 4
        accPan = Math.sin(t * 0.3) * 0.9
        n.push({ w: `taiko:${accIdx}`, v: 0.7 * fade, d: 0.9, x: accPan, r: endRev, p: 50 + accIdx * 5 })
    }

    // final hit at end of each cycle
    if (barInCycle === 0 && bar > 0 && t % 16 === 0) {
        n.push({ w: 'taiko:0', v: 1.5, d: 3, x: 0, r: 8, p: 40 })
        n.push({ w: 'taiko:2', v: 1.2, d: 3, x: -0.5, r: 8, p: 45 })
        n.push({ w: 'taiko:2', v: 1.2, d: 3, x: 0.5, r: 8, p: 45 })
        n.push(...supersaw(root, 0.6, 4, 200, 0, 0, 10))
    }

    return n
}