// GOSPEL JAM ++ — 3 drummers trading in six evolving sections
// A: The Minister (gospel chops, open hats)
// B: The Liner (linear odd-groupings)
// C: The Whisperer (dynamic shuffle / brush energy)
sl = 0.18
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// Swing offset
swing = 0.07
swung = (beat) => (beat % 2 == 1) ? swing : 0

// GM drums
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46, HHP = 44
RIDE = 51, BELL = 53, CRASH = 49, SPLASH = 55, CHINA = 52
TF2 = 41, TF = 43, TL = 45, TM = 47, TH = 50

dA = 'm:1'
dB = 'm:2'
dC = 'm:3'
keys = 'm:4'
bass = 'm:5'

// Bass roots (low octave)
bassRoots = [37, 34, 39, 41]  // Db, Bb, Eb, Ab

// 4/4 time - 16 sixteenths per bar
BAR = 16

// Gospel chords - Db major / Bbm vibe
chords = [
    [49, 53, 56, 60],  // Db maj7
    [46, 49, 53, 58],  // Bbm9
    [51, 54, 58, 61],  // Ebm7
    [53, 56, 60, 63],  // Ab7
]

sectionPlan = [
    { a: true,  b: false, c: true,  open: false, break: true,  drop: false, hype: 0.45 }, // hush intro / brush
    { a: true,  b: true,  c: false, open: true,  break: false, drop: false, hype: 0.65 }, // liner bounce
    { a: false, b: true,  c: true,  open: false, break: true,  drop: false, hype: 0.55 }, // shuffle lift
    { a: true,  b: true,  c: true,  open: true,  break: false, drop: false, hype: 0.78 }, // stacked pocket
    { a: true,  b: false, c: true,  open: false, break: true,  drop: true,  hype: 0.4  }, // breakdown / rim
    { a: true,  b: true,  c: true,  open: true,  break: false, drop: false, hype: 1.0  }, // shout / shed
]

swingMap = [.05, .07, .06, .045, .08, .075]
slopMap = [.16, .21, .18, .19, .23, .22]

return (t, s) => {
    n = []

    bar = Math.floor(t / BAR)
    bt = t % BAR
    phrase = Math.floor(bar / 8)
    section = phrase % sectionPlan.length
    localBar = bar % 8

    cfg = sectionPlan[section]
    swing = swingMap[section]
    sl = slopMap[section]
    sw = swung(bt)

    feel = cfg.hype + (localBar / 8) * 0.1
    drop = cfg.drop && localBar == 7 && bt < 8
    breaky = cfg.break && (localBar == 3 || localBar == 7)

    chordIdx = Math.floor(bar / 2) % 4
    chord = chords[chordIdx]
    nextChord = chords[(chordIdx + 1) % 4]

    // ====== DRUMMER A: "THE MINISTER" ======
    if (cfg.a) {
        if (bt % 2 == 0 && !drop) {
            open = cfg.open && (bt == 6 || bt == 14 || (feel > .85 && bt == 2))
            accent = bt == 0 || bt == 8
            v = accent ? .7 + feel * .2 : .42 + feel * .25 + R() * .12
            n.push({ w: dA, p: open ? HHO : HHC, v: v, d: open ? .5 : .2, o: sw + slop() })
        }
        if (breaky && bt % 4 == 3 && R() > .35) {
            n.push({ w: dA, p: HHC, v: .22 + feel * .1, d: .15, o: sw + slop() })
        }

        kickHits = [0, 3, 7, 9, 12]
        if (localBar % 2 == 1) kickHits.push(5)
        if (feel > .85) kickHits.push(15)
        if (kickHits.includes(bt) && !drop) {
            n.push({ w: dA, p: K, v: .68 + feel * .22 + R() * .12, d: .9, o: sw + slop() * .4 })
        }
        if (bt == 14 && !drop && R() > .35) {
            n.push({ w: dA, p: K, v: .62 + feel * .25, d: .6, o: sw + slop() })
        }

        if (bt == 4 || bt == 12) {
            rim = breaky && localBar % 4 == 3
            n.push({ w: dA, p: rim ? SR : S, v: .82 + feel * .15, d: rim ? .55 : 1.0, o: (rim ? 0 : .012) + sw + slop() })
        }
        ghosts = [1, 2, 10, 11, 13]
        if (ghosts.includes(bt) && !drop && R() > (breaky ? .25 : .45)) {
            n.push({ w: dA, p: SR, v: .12 + feel * .25, d: .22, o: sw + slop() })
        }

        if ((localBar == 3 || localBar == 7) && bt >= 12 && feel > .55) {
            chopIdx = bt - 12
            chop = [S, SR, S, TF]
            n.push({ w: dA, p: chop[chopIdx], v: .54 + chopIdx * .12 + feel * .2, d: .35, o: sw + slop() })
            if (chopIdx % 2 == 1) n.push({ w: dA, p: K, v: .7 + feel * .15, d: .5, o: sw + slop() * .6 })
        }

        if (bt == 0 && localBar == 0) {
            n.push({ w: dA, p: CRASH, v: .9 + feel * .08, d: 3.6, o: slop() })
        }
        if (bt == 0 && localBar == 4) {
            n.push({ w: dA, p: SPLASH, v: .62 + feel * .1, d: 1.8, o: slop() })
        }
    }

    // ====== DRUMMER B: "THE LINER" ======
    if (cfg.b) {
        linearPocket = [
            { p: K, v: .74 }, { p: HHC, v: .28 }, { p: HHC, v: .33 }, { p: SR, v: .16 },
            { p: S, v: .82 }, { p: HHO, v: .5 }, { p: K, v: .48 }, { p: SR, v: .14 },
            { p: K, v: .7 },  { p: HHC, v: .3 }, { p: TH, v: .43 }, { p: HHC, v: .32 },
            { p: S, v: .86 }, { p: HHO, v: .54 }, { p: K, v: .6 },  { p: SR, v: .18 },
        ]
        linearOdd = [
            { p: K, v: .72 }, { p: HHC, v: .25 }, { p: SR, v: .2 },  { p: TM, v: .42 },
            { p: S, v: .84 }, { p: HHO, v: .52 }, { p: K, v: .55 }, { p: BELL, v: .35 },
            { p: K, v: .7 },  { p: TL, v: .44 }, { p: HHC, v: .32 }, { p: SR, v: .18 },
            { p: S, v: .88 }, { p: HHO, v: .56 }, { p: K, v: .64 }, { p: SR, v: .22 },
        ]
        linearBell = [
            { p: K, v: .76 }, { p: BELL, v: .32 }, { p: HHC, v: .34 }, { p: SR, v: .17 },
            { p: S, v: .83 }, { p: HHO, v: .55 }, { p: K, v: .52 }, { p: SR, v: .15 },
            { p: K, v: .72 }, { p: HHC, v: .33 }, { p: TM, v: .46 }, { p: HHC, v: .34 },
            { p: S, v: .88 }, { p: HHO, v: .58 }, { p: K, v: .63 }, { p: SR, v: .22 },
        ]

        linSet = (localBar % 3 == 0) ? linearPocket : (localBar % 3 == 1 ? linearOdd : linearBell)

        if ((localBar == 3 || localBar == 7) && bt >= 12) {
            toms = [TH, TM, TL, TF]
            v = .62 + (bt - 12) * .08 + feel * .12
            n.push({ w: dB, p: toms[bt - 12], v: v, d: .7, o: sw + slop() })
        } else {
            hit = linSet[bt]
            n.push({ w: dB, p: hit.p, v: hit.v + feel * .15, d: .48, o: sw + slop() })
        }

        if (bt == 15 && feel > .65 && R() > .45) {
            n.push({ w: dB, p: HHO, v: .58 + feel * .2, d: .4, o: sw + slop() })
        }
    }

    // ====== DRUMMER C: "THE WHISPERER" ======
    if (cfg.c) {
        wave = Math.sin(bt * Math.PI / 8)
        bounce = Math.abs(Math.sin(bt * Math.PI / 4)) * .2
        baseV = .18 + wave * .55 + bounce + feel * .1

        if (bt % 2 == 0) {
            bell = bt == 0 || bt == 8
            v = Math.max(.12, Math.min(.9, baseV * (.6 + feel * .4)))
            n.push({ w: dC, p: bell ? BELL : RIDE, v: v, d: 1.2, o: sw + slop() })
        }
        if (bt % 4 == 3 && R() > .45) {
            n.push({ w: dC, p: RIDE, v: baseV * .55, d: .6, o: sw + slop() })
        }

        kicks = [0, 5, 10, 14]
        if (breaky) kicks.push(7)
        if (kicks.includes(bt) && !drop) {
            v = Math.max(.25, Math.min(.92, baseV * .9))
            n.push({ w: dC, p: K, v: v, d: .9, o: sw + slop() * .45 })
        }

        if (bt == 4 || bt == 12) {
            loud = baseV > .42
            n.push({ w: dC, p: loud ? S : SR, v: loud ? baseV * 1.05 : .3, d: .72, o: .02 + sw + slop() })
        }
        if ((bt == 3 || bt == 11) && R() > .38) {
            n.push({ w: dC, p: SR, v: baseV * .32, d: .22, o: sw + slop() })
        }

        if (localBar == 7 && bt >= 8) {
            crescIdx = bt - 8
            crescV = .18 + crescIdx * .1 + feel * .1
            toms = [SR, SR, TH, TM, TL, TL, TF, S]
            n.push({ w: dC, p: toms[crescIdx], v: crescV, d: .42, o: sw + slop() })
        }

        if (bt % 5 == 2 && R() > .5) {
            n.push({ w: dC, p: SR, v: .05 + R() * .06, d: .16, o: sw + slop() })
        }
    }

    // ====== COLLECTIVE MOMENTS ======
    if (section == 5 && bt == 0 && bar % 8 == 0) {
        n.push({ w: dA, p: CRASH, v: .96, d: 4.0, o: 0 })
        n.push({ w: dB, p: SPLASH, v: .72, d: 2.0, o: slop() })
        n.push({ w: dC, p: CRASH, v: .88, d: 3.5, o: slop() })
    }

    if (section == 5 && bar % 4 >= 2) {
        tradeBeat = bt % 8
        tradeWho = Math.floor(bt / 8) % 3

        if (tradeWho == 0) {
            if (tradeBeat == 0) n.push({ w: dA, p: K, v: .86, d: .7, o: sw + slop() })
            if (tradeBeat == 2) n.push({ w: dA, p: S, v: .64, d: .35, o: sw + slop() })
            if (tradeBeat == 3) n.push({ w: dA, p: S, v: .78, d: .35, o: sw + slop() })
            if (tradeBeat == 4) n.push({ w: dA, p: SPLASH, v: .55, d: 1.0, o: slop() })
            if (tradeBeat == 5) n.push({ w: dA, p: K, v: .72, d: .5, o: sw + slop() })
            if (tradeBeat == 7) n.push({ w: dA, p: HHO, v: .65, d: .4, o: sw + slop() })
        }
        if (tradeWho == 1) {
            linAns = [K, TH, HHO, TM, S, HHC, TL, K]
            n.push({ w: dB, p: linAns[tradeBeat], v: .57 + tradeBeat * .04, d: .5, o: sw + slop() })
        }
        if (tradeWho == 2) {
            sweepV = tradeBeat < 4 ? .2 + tradeBeat * .16 : .9 - (tradeBeat - 4) * .16
            inst = tradeBeat % 3 == 0 ? S : (tradeBeat % 3 == 1 ? SR : TH)
            n.push({ w: dC, p: inst, v: sweepV, d: .46, o: sw + slop() })
        }
    }

    // ====== KEYS - GOSPEL STABS ======
    if (bt == 0) {
        chord.forEach(note => n.push({ w: keys, p: note, v: .54 + feel * .12, d: .4, o: slop() }))
    }
    if (bt == 14) {
        chord.forEach(note => n.push({ w: keys, p: note, v: .62 + feel * .08, d: .5, o: sw + slop() }))
    }
    if (bt == 7 && bar % 2 == 0 && !drop) {
        chord.forEach(note => n.push({ w: keys, p: note, v: .42, d: .16, o: sw + slop() }))
    }
    if (bt == 9 && R() > .45) {
        chord.forEach(note => n.push({ w: keys, p: note, v: .32, d: .12, o: sw + slop() }))
    }
    if (section == 5 && bt == 0 && bar % 4 == 0) {
        chord.forEach(note => {
            n.push({ w: keys, p: note, v: .78, d: 1.2, o: slop() })
            n.push({ w: keys, p: note + 12, v: .56, d: 1.0, o: slop() })
        })
    }
    if (bt == 6 && R() > .4) {
        nextChord.forEach(note => n.push({ w: keys, p: note - 12, v: .28 + feel * .1, d: .12, o: sw + slop() }))
    }

    // ====== BASS - SLAP MONSTER ======
    root = bassRoots[chordIdx]
    octave = root + 12
    fifth = root + 7
    chromUp = root + 1
    chromDown = root - 1

    bassPattern = bar % 4

    deadBeats = [1, 3, 7, 9, 11, 15]
    if (deadBeats.includes(bt) && R() > .18 && !drop) {
        n.push({ w: bass, p: root, v: .18 + R() * .1, d: .02, o: sw + slop() })
    }

    if (bassPattern == 0) {
        if (bt == 0) n.push({ w: bass, p: root, v: .9, d: .08, o: slop() })
        if (bt == 3) n.push({ w: bass, p: root, v: .62, d: .04, o: sw + slop() })
        if (bt == 4) n.push({ w: bass, p: octave, v: .86, d: .05, o: sw + slop() })
        if (bt == 6) n.push({ w: bass, p: root, v: .58, d: .04, o: sw + slop() })
        if (bt == 10) n.push({ w: bass, p: fifth, v: .67, d: .05, o: sw + slop() })
        if (bt == 12) n.push({ w: bass, p: octave, v: .82, d: .06, o: sw + slop() })
        if (bt == 14) n.push({ w: bass, p: root, v: .63, d: .04, o: sw + slop() })
    }

    if (bassPattern == 1) {
        if (bt == 0) n.push({ w: bass, p: root, v: .86, d: .07, o: slop() })
        if (bt == 2) n.push({ w: bass, p: root, v: .52, d: .03, o: sw + slop() })
        if (bt == 4) n.push({ w: bass, p: octave, v: .92, d: .05, o: sw + slop() })
        if (bt == 5) n.push({ w: bass, p: fifth + 12, v: .72, d: .04, o: sw + slop() })
        if (bt == 8) n.push({ w: bass, p: root, v: .72, d: .06, o: slop() })
        if (bt == 11) n.push({ w: bass, p: fifth, v: .57, d: .04, o: sw + slop() })
        if (bt == 12) n.push({ w: bass, p: octave, v: .82, d: .05, o: sw + slop() })
        if (bt == 15) n.push({ w: bass, p: root, v: .67, d: .04, o: sw + slop() })
    }

    if (bassPattern == 2) {
        if (bt == 0) n.push({ w: bass, p: root, v: .92, d: .08, o: slop() })
        if (bt == 2) n.push({ w: bass, p: chromDown, v: .52, d: .03, o: sw + slop() })
        if (bt == 3) n.push({ w: bass, p: root, v: .64, d: .04, o: sw + slop() })
        if (bt == 4) n.push({ w: bass, p: octave, v: .88, d: .05, o: sw + slop() })
        if (bt == 6) n.push({ w: bass, p: fifth, v: .62, d: .04, o: sw + slop() })
        if (bt == 8) n.push({ w: bass, p: root, v: .78, d: .06, o: slop() })
        if (bt == 10) n.push({ w: bass, p: chromUp, v: .52, d: .03, o: sw + slop() })
        if (bt == 11) n.push({ w: bass, p: chromUp + 1, v: .56, d: .03, o: sw + slop() })
        if (bt == 12) n.push({ w: bass, p: octave, v: .86, d: .05, o: sw + slop() })
        if (bt == 14) n.push({ w: bass, p: fifth, v: .62, d: .04, o: sw + slop() })
    }

    if (bassPattern == 3) {
        if (bt == 0) n.push({ w: bass, p: root, v: .9, d: .07, o: slop() })
        if (bt == 4) n.push({ w: bass, p: octave, v: .86, d: .05, o: sw + slop() })
        if (bt == 6) n.push({ w: bass, p: root, v: .62, d: .04, o: sw + slop() })
        if (bt >= 8 && bt <= 11) {
            runNotes = [root, fifth, octave, fifth + 12]
            n.push({ w: bass, p: runNotes[bt - 8], v: .55 + (bt - 8) * .1, d: .04, o: sw + slop() })
        }
        if (bt == 12) n.push({ w: bass, p: octave, v: .82, d: .04, o: sw + slop() })
        if (bt == 13) n.push({ w: bass, p: octave - 1, v: .67, d: .03, o: sw + slop() })
        if (bt == 14) n.push({ w: bass, p: octave - 2, v: .6, d: .03, o: sw + slop() })
        if (bt == 15) n.push({ w: bass, p: octave - 3, v: .7, d: .04, o: sw + slop() })
    }

    if (localBar == 7 && bt >= 12) {
        hammerIdx = bt - 12
        hammer = [root, root + 2, root + 4, fifth]
        n.push({ w: bass, p: hammer[hammerIdx], v: .62 + hammerIdx * .1, d: .04, o: sw + slop() })
    }

    if (bt == 0 && bar % 4 == 0) {
        n.push({ w: bass, p: root - 12, v: .95, d: .1, o: slop() })
    }

    if (section == 5 && (bt == 0 || bt == 8)) {
        n.push({ w: bass, p: root, v: .95, d: .04, o: slop() })
        n.push({ w: bass, p: root, v: .72, d: .04, o: .03 + slop() })
    }

    return n
}

