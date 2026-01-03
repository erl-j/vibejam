// DRUM SHED - 3 drummers, Berklee meets King Crimson
// Drummer A: "Jazz Monster" - Bruford-style melodic chaos, odd groupings
// Drummer B: "Groove Architect" - Colaiuta pocket, explosive fills, ghost notes  
// Drummer C: "Chaos Agent" - Mastelotto tribal aggression, electronic edge

sl = 0.06
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// GM drums
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46, HHP = 44
RIDE = 51, BELL = 53, CRASH = 49, SPLASH = 55, CHINA = 52
TF2 = 41, TF = 43, TL = 45, TM = 47, TH = 50

dA = 'm:1'  // Drummer A - Jazz Monster
dB = 'm:2'  // Drummer B - Groove Architect
dC = 'm:3'  // Drummer C - Chaos Agent
syn = 'm:4' // Synth arp - harmonic frame

// 13/16 time - 13 sixteenths per bar for that Crimson feel
BAR = 13

// E phrygian - dark Crimson vibe
arp = [40, 43, 47, 52, 55, 59, 64]  // E G B E G B E (octaves)

return (t, s) => {
    n = []

    bar = Math.floor(t / BAR)
    bt = t % BAR
    phrase = Math.floor(bar / 8)
    section = phrase % 6  // 6 sections for variety

    // drummer activation based on section
    // 0: A solo, 1: B solo, 2: C solo, 3: A+B, 4: B+C, 5: ALL
    drummerA = section == 0 || section == 3 || section == 5
    drummerB = section == 1 || section == 3 || section == 4 || section == 5
    drummerC = section == 2 || section == 4 || section == 5

    // intensity builds through bar cycle
    intensity = (bar % 8) / 8

    // ====== DRUMMER A: "THE JAZZ MONSTER" ======
    // Bruford-style: melodic toms, ride finesse, 5-against-4 polyrhythms
    if (drummerA) {
        // 5-note grouping over 13 creates beautiful tension
        group5 = bt % 5

        // Ride pattern - broken, melodic
        if (bt % 3 == 0 || bt == 5 || bt == 11) {
            bell = bt == 0 || bt == 8
            n.push({ w: dA, p: bell ? BELL : RIDE, v: bell ? .7 : .4 + R() * .15, d: 1.2, o: slop() })
        }

        // Snare - unexpected placements
        snareHits = [4, 9]  // off-grid accents
        if (snareHits.includes(bt)) {
            n.push({ w: dA, p: S, v: .65 + R() * .15, d: 1.0, o: slop() * 1.5 })
        }

        // Ghost notes - the secret sauce
        if (bt % 2 == 1 && R() > .4) {
            n.push({ w: dA, p: SR, v: .15 + R() * .1, d: .5, o: slop() })
        }

        // Kick - syncopated, conversational
        kickHits = [0, 6, 10]
        if (kickHits.includes(bt)) {
            n.push({ w: dA, p: K, v: .7 + R() * .1, d: 1.0, o: slop() * .5 })
        }

        // Melodic tom runs on fills (every 4 bars)
        if (bar % 4 == 3 && bt >= 9) {
            tomIdx = bt - 9  // 0-3
            toms = [TH, TM, TL, TF]
            n.push({ w: dA, p: toms[tomIdx % 4], v: .6 + tomIdx * .08, d: 1.5, o: slop() })
        }

        // Splash accents
        if (bt == 0 && bar % 4 == 0 && section != 5) {
            n.push({ w: dA, p: SPLASH, v: .5, d: 2.0, o: slop() })
        }
    }

    // ====== DRUMMER B: "THE GROOVE ARCHITECT" ======
    // Colaiuta pocket: deep kick, snare variations, hi-hat sizzle
    if (drummerB) {
        // 7-over-13 polyrhythm for the hat
        hat7 = (bt * 7) % BAR

        // Hi-hat - machine-like but human, alternating open/closed
        if (bt % 2 == 0 || bt == 5 || bt == 11) {
            open = bt == 5 || bt == 11
            accent = bt == 0 || bt == 6
            n.push({ w: dB, p: open ? HHO : HHC, v: accent ? .55 : .25 + R() * .1, d: open ? .8 : .3, o: slop() })
        }

        // Hi-hat foot on offbeats
        if (bt % 4 == 2) {
            n.push({ w: dB, p: HHP, v: .3, d: .3, o: slop() })
        }

        // Kick - deep pocket, displaced accents
        kickPattern = [0, 3, 7, 10]
        if (kickPattern.includes(bt)) {
            // double kick on heavy sections
            v = bt == 0 ? .85 : .65 + R() * .1
            n.push({ w: dB, p: K, v: v, d: 1.2, o: -.003 + slop() * .5 })  // slightly ahead
            if (section >= 4 && bt == 7) {
                n.push({ w: dB, p: K, v: .55, d: .8, o: slop() + 0.5 })  // flam kick
            }
        }

        // Snare - backbeat variations
        snarePattern = [4, 10]
        if (snarePattern.includes(bt)) {
            n.push({ w: dB, p: S, v: .75, d: 1.0, o: .002 + slop() })  // slightly behind
        }

        // Ghost notes - the Colaiuta special
        ghostPattern = [1, 3, 6, 8, 12]
        ghostPattern.forEach(g => {
            if (bt == g && R() > .35) {
                n.push({ w: dB, p: SR, v: .12 + R() * .08, d: .4, o: slop() })
            }
        })

        // Tom bomb fills
        if (bar % 8 == 7 && bt >= 8) {
            fillToms = [TF2, TF, TL, TM, TH]
            idx = bt - 8
            if (idx < 5) {
                n.push({ w: dB, p: fillToms[idx], v: .7 + idx * .05, d: 1.0, o: slop() })
            }
        }
    }

    // ====== DRUMMER C: "THE CHAOS AGENT" ======
    // Mastelotto tribal: odd accents, china crashes, relentless 16ths
    if (drummerC) {
        // 11-over-13 creates maximum tension
        pulse11 = (bt * 11) % BAR

        // China cymbal chaos
        if (pulse11 < 3 || bt == 0 || bt == 6) {
            n.push({ w: dC, p: CHINA, v: .35 + R() * .2, d: 2.0, o: slop() })
        }

        // Kick - tribal, insistent
        kickTribal = [0, 2, 4, 6, 9, 11]
        if (kickTribal.includes(bt)) {
            n.push({ w: dC, p: K, v: .6 + R() * .2, d: .8, o: slop() * .3 })
        }

        // Snare bursts
        if (bt >= 8 && bt <= 12) {
            if (R() > .3) {
                n.push({ w: dC, p: S, v: .5 + R() * .3, d: .6, o: slop() })
            }
        }

        // Tom ostinato - relentless
        tomOstinato = [TM, TL, TF, TL]
        if (bt % 3 != 1) {  // creates a 2+1 pattern
            n.push({ w: dC, p: tomOstinato[bt % 4], v: .35 + R() * .15, d: .8, o: slop() })
        }

        // Rim click polyrhythm
        if (bt % 5 == 3) {
            n.push({ w: dC, p: SR, v: .4, d: .5, o: slop() })
        }

        // Crash on phrase boundaries
        if (bt == 0 && bar % 4 == 0) {
            n.push({ w: dC, p: CRASH, v: .8, d: 3.0, o: slop() })
        }
    }

    // ====== COLLECTIVE MOMENTS ======

    // All drummers hit together on major phrase starts
    if (section == 5 && bt == 0 && bar % 8 == 0) {
        n.push({ w: dA, p: CRASH, v: .9, d: 4.0, o: 0 })
        n.push({ w: dC, p: CHINA, v: .7, d: 3.5, o: slop() })
        n.push({ w: dB, p: K, v: 1.0, d: 1.5, o: 0 })
    }

    // Trading 4s breakdown - each drummer gets 4 sixteenths
    if (section == 5 && bar % 4 >= 2) {
        tradeBeat = bt % 4
        tradeWho = Math.floor(bt / 4) % 3  // 0, 1, 2 for each drummer

        if (tradeWho == 0 && drummerA) {
            // A's signature: melodic tom triplet feel
            if (tradeBeat != 3) {
                n.push({ w: dA, p: [TH, TM, TL][tradeBeat], v: .7, d: 1.0, o: slop() })
            }
        }
        if (tradeWho == 1 && drummerB) {
            // B's signature: snare/kick pattern
            if (tradeBeat == 0) n.push({ w: dB, p: K, v: .8, d: 1.0, o: slop() })
            if (tradeBeat == 2) n.push({ w: dB, p: S, v: .75, d: 1.0, o: slop() })
            if (tradeBeat == 1 || tradeBeat == 3) n.push({ w: dB, p: SR, v: .25, d: .4, o: slop() })
        }
        if (tradeWho == 2 && drummerC) {
            // C's signature: all attack
            n.push({ w: dC, p: K, v: .5, d: .6, o: slop() })
            if (tradeBeat % 2 == 1) n.push({ w: dC, p: CHINA, v: .4, d: 1.0, o: slop() })
        }
    }

    // Build to chaos - accelerating fills (distributed across drummers)
    if (bar % 8 == 7 && bt >= 6) {
        fillDensity = bt - 6
        if (R() < .3 + fillDensity * .1) {
            randomTom = [TF2, TF, TL, TM, TH][Math.floor(R() * 5)]
            fillDrummer = [dA, dB, dC][Math.floor(R() * 3)]
            n.push({ w: fillDrummer, p: randomTom, v: .4 + R() * .4, d: .6, o: slop() * 2 })
        }
        if (fillDensity >= 4) {
            n.push({ w: dB, p: K, v: .6, d: .5, o: slop() })
        }
    }

    // Polymetric climax - when all 3 are playing
    if (section == 5) {
        // 3-against-13 accent pattern (Drummer A)
        if (bt % 3 == 0 && R() > .5) {
            n.push({ w: dA, p: BELL, v: .5, d: 1.5, o: slop() })
        }
        // 4-against-13 (Drummer C)
        if (bt % 4 == 1 && R() > .4) {
            n.push({ w: dC, p: CRASH, v: .3, d: 2.0, o: slop() })
        }
    }

    // ====== SYNTH ARP - HARMONIC FRAME ======
    // sparse, atmospheric, stays out of the way
    arpIdx = t % arp.length
    arpHit = [0, 3, 6, 9][bar % 4]  // different start point each bar

    if (bt == arpHit || bt == (arpHit + 5) % BAR) {
        note = arp[(arpIdx + bar) % arp.length]
        // transpose down on darker sections
        if (section == 2 || section == 4) note -= 12
        n.push({ w: syn, p: note, v: .35, d: 2.5, o: slop() })
    }

    // sustained root on phrase starts
    if (bt == 0 && bar % 4 == 0) {
        n.push({ w: syn, p: 28, v: .25, d: 4.0, o: 0 })  // low E pedal
    }

    return n
}

