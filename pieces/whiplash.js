// WHIPLASH DRUM SOLO - 128 bars of fury
// Inspired by Buddy Rich, Art Blakey, and pure adrenaline

sl = 0.025
slop = () => (Math.random() - 0.5) * sl
R = () => Math.random()

// Swing - deep pocket shuffle
swing = 0.065
swung = (beat) => (beat % 2 == 1) ? swing * (0.8 + R() * 0.4) : 0

// GM drums
K = 36, S = 38, SR = 37, HHC = 42, HHO = 46, HHP = 44
RIDE = 51, BELL = 53, CRASH = 49, SPLASH = 55, CHINA = 52
TF2 = 41, TF = 43, TL = 45, TM = 47, TH = 50

drums = 'm:1'

BAR = 16  // 4/4 time

// Human timing variation based on intensity
humanize = (intensity) => slop() * (1.2 - intensity * 0.4)

// Velocity curves for rolls
rollAccel = (i, len) => 0.3 + (i / len) * 0.6
rollDecel = (i, len) => 0.8 - (i / len) * 0.4
rollCresc = (i, len, start, end) => start + (i / len) * (end - start)

return (t, s) => {
    n = []

    bar = Math.floor(t / BAR)
    bt = t % BAR

    // 128 bar structure
    section = Math.floor(bar / 16)  // 8 sections of 16 bars
    phrase = Math.floor(bar / 4)    // 32 phrases
    localBar = bar % 16
    phraseBar = bar % 4

    // Global intensity curve - builds through the solo
    globalIntensity = Math.min(1, bar / 100)

    // Section intensity - each 16-bar section has its own arc
    sectionIntensity = (localBar / 15) * 0.4 + 0.3

    // Combined intensity
    intensity = globalIntensity * 0.6 + sectionIntensity * 0.4

    sw = swung(bt)
    h = humanize(intensity)

    // ====== SECTION 0: THE HOOK (bars 0-15) ======
    // Buddy Rich open - sparse, swinging, building tension
    if (section == 0) {
        // Classic jazz ride pattern
        if (bt == 0) n.push({ w: drums, p: RIDE, v: .55, d: 1.5, o: h })
        if (bt == 4) n.push({ w: drums, p: RIDE, v: .35, d: 1.0, o: sw + h })
        if (bt == 6) n.push({ w: drums, p: RIDE, v: .45, d: 1.0, o: sw + h })
        if (bt == 8) n.push({ w: drums, p: RIDE, v: .5, d: 1.5, o: h })
        if (bt == 10) n.push({ w: drums, p: RIDE, v: .3, d: 0.8, o: sw + h })
        if (bt == 12) n.push({ w: drums, p: RIDE, v: .4, d: 1.0, o: sw + h })
        if (bt == 14) n.push({ w: drums, p: RIDE, v: .35, d: 0.8, o: sw + h })

        // Hi-hat foot - swung 2 and 4
        if (bt == 4 || bt == 12) n.push({ w: drums, p: HHP, v: .4, d: .3, o: sw + h })

        // Kick - sparse, conversational
        if (bt == 0) n.push({ w: drums, p: K, v: .6, d: 1.0, o: h * 0.5 })
        if (bt == 10 && localBar % 2 == 1) n.push({ w: drums, p: K, v: .45, d: 0.8, o: sw + h })

        // Snare answers - building
        if (localBar >= 4) {
            if (bt == 4) n.push({ w: drums, p: S, v: .3 + localBar * .02, d: 0.8, o: sw + h })
            if (bt == 12 && localBar >= 8) n.push({ w: drums, p: S, v: .4 + localBar * .02, d: 0.9, o: sw + h })
        }

        // Ghost notes creeping in
        if (localBar >= 8 && (bt == 3 || bt == 7 || bt == 11) && R() > 0.4) {
            n.push({ w: drums, p: SR, v: .1 + R() * .08, d: .25, o: sw + h })
        }

        // First fill at bar 15
        if (localBar == 15 && bt >= 12) {
            fillV = 0.4 + (bt - 12) * 0.15
            n.push({ w: drums, p: S, v: fillV, d: 0.4, o: sw + h })
            if (bt == 15) n.push({ w: drums, p: CRASH, v: .7, d: 3.0, o: h })
        }
    }

    // ====== SECTION 1: SNARE SHOWCASE (bars 16-31) ======
    // Single stroke rolls, drags, flams, accents
    if (section == 1) {
        // Ride continues
        if (bt % 4 == 0) n.push({ w: drums, p: RIDE, v: .4 + (bt == 0 ? .2 : 0), d: 1.2, o: h })
        if (bt % 4 == 2 && bt < 14) n.push({ w: drums, p: RIDE, v: .3, d: 0.8, o: sw + h })

        // Snare patterns - alternating techniques
        pattern = localBar % 4

        // Pattern A: Accented singles (paradiddle feel)
        if (pattern == 0) {
            accents = [0, 3, 4, 7, 8, 11, 12, 15]
            taps = [1, 2, 5, 6, 9, 10, 13, 14]
            if (accents.includes(bt)) n.push({ w: drums, p: S, v: .65 + R() * .1, d: 0.6, o: sw + h })
            if (taps.includes(bt)) n.push({ w: drums, p: SR, v: .15 + R() * .08, d: 0.25, o: sw + h })
        }

        // Pattern B: Drags and ruffs
        if (pattern == 1) {
            if (bt == 0 || bt == 8) {
                // Drag (grace notes before)
                n.push({ w: drums, p: SR, v: .2, d: .08, o: -0.04 + h })
                n.push({ w: drums, p: SR, v: .22, d: .08, o: -0.02 + h })
                n.push({ w: drums, p: S, v: .7, d: 0.7, o: h })
            }
            if (bt == 4 || bt == 12) {
                n.push({ w: drums, p: S, v: .6, d: 0.6, o: sw + h })
            }
            // Ghost pattern
            ghosts = [2, 3, 6, 7, 10, 11, 14, 15]
            if (ghosts.includes(bt) && R() > 0.3) {
                n.push({ w: drums, p: SR, v: .08 + R() * .08, d: .2, o: sw + h })
            }
        }

        // Pattern C: Double stroke roll excerpt
        if (pattern == 2 && bt >= 8) {
            rollIdx = bt - 8
            v = rollCresc(rollIdx, 8, 0.15, 0.8)
            n.push({ w: drums, p: S, v: v, d: 0.2, o: sw + h })
            // Double on each 16th
            n.push({ w: drums, p: S, v: v * 0.75, d: 0.15, o: sw + h + 0.03 })
        }
        if (pattern == 2 && bt < 8) {
            if (bt % 4 == 0) n.push({ w: drums, p: S, v: .5, d: 0.5, o: h })
            if (bt % 4 == 2) n.push({ w: drums, p: SR, v: .2, d: 0.3, o: sw + h })
        }

        // Pattern D: Flams and buzz
        if (pattern == 3) {
            flamBeats = [0, 4, 8, 12]
            if (flamBeats.includes(bt)) {
                n.push({ w: drums, p: SR, v: .25, d: .1, o: -0.025 + h })  // grace
                n.push({ w: drums, p: S, v: .75, d: 0.7, o: h })           // main
            }
            if ((bt == 2 || bt == 6 || bt == 10 || bt == 14) && R() > 0.2) {
                n.push({ w: drums, p: SR, v: .12, d: .2, o: sw + h })
            }
        }

        // Kick support
        if (bt == 0) n.push({ w: drums, p: K, v: .65, d: 1.0, o: h * 0.5 })
        if (bt == 8 && localBar % 2 == 1) n.push({ w: drums, p: K, v: .5, d: 0.8, o: h })
        if (bt == 6 && R() > 0.6) n.push({ w: drums, p: K, v: .4, d: 0.6, o: sw + h })

        // Section ending crash
        if (localBar == 15 && bt == 0) {
            n.push({ w: drums, p: CRASH, v: .8, d: 3.5, o: 0 })
            n.push({ w: drums, p: K, v: .85, d: 1.2, o: 0 })
        }
    }

    // ====== SECTION 2: KICK DRUM FURY (bars 32-47) ======
    // Bass drum feature - syncopation, double kicks, independence
    if (section == 2) {
        // Ride - broken up
        if (bt == 0 || bt == 6 || bt == 10) {
            n.push({ w: drums, p: BELL, v: .5, d: 1.5, o: h })
        }
        if (bt == 4 || bt == 12) {
            n.push({ w: drums, p: RIDE, v: .35, d: 1.0, o: sw + h })
        }

        // Kick patterns - increasing complexity
        kickPattern = localBar % 4

        if (kickPattern == 0) {
            // Syncopated funk kicks
            kicks = [0, 3, 6, 10, 13]
            kicks.forEach(k => {
                if (bt == k) n.push({ w: drums, p: K, v: .7 + R() * .1, d: 0.9, o: sw + h * 0.3 })
            })
        }

        if (kickPattern == 1) {
            // Double kicks
            if (bt == 0) {
                n.push({ w: drums, p: K, v: .75, d: 0.5, o: h * 0.3 })
                n.push({ w: drums, p: K, v: .6, d: 0.5, o: 0.06 + h * 0.3 })
            }
            if (bt == 6) {
                n.push({ w: drums, p: K, v: .7, d: 0.5, o: sw + h * 0.3 })
                n.push({ w: drums, p: K, v: .55, d: 0.5, o: sw + 0.06 + h * 0.3 })
            }
            if (bt == 10 || bt == 14) n.push({ w: drums, p: K, v: .6, d: 0.7, o: sw + h * 0.3 })
        }

        if (kickPattern == 2) {
            // Bebop independence
            kicks = [0, 2, 5, 7, 9, 11, 14]
            kicks.forEach(k => {
                if (bt == k) n.push({ w: drums, p: K, v: .5 + R() * .2, d: 0.6, o: sw + h * 0.3 })
            })
        }

        if (kickPattern == 3) {
            // Machine gun 16ths (every other bar)
            if (localBar % 2 == 1 && bt >= 8) {
                n.push({ w: drums, p: K, v: .55 + (bt - 8) * .04, d: 0.4, o: sw + h * 0.2 })
            } else {
                if (bt == 0 || bt == 6 || bt == 12) n.push({ w: drums, p: K, v: .7, d: 0.8, o: sw + h * 0.3 })
            }
        }

        // Snare on 4 only - sparse contrast
        if (bt == 12) n.push({ w: drums, p: S, v: .55, d: 0.8, o: sw + h })

        // Occasional ghost
        if ((bt == 11 || bt == 15) && R() > 0.5) {
            n.push({ w: drums, p: SR, v: .1, d: .2, o: sw + h })
        }

        // Crash accents
        if (bt == 0 && localBar % 4 == 0) {
            n.push({ w: drums, p: CRASH, v: .6 + localBar * .01, d: 2.5, o: 0 })
        }
    }

    // ====== SECTION 3: TOM ODYSSEY (bars 48-63) ======
    // Melodic tom work - around the kit
    if (section == 3) {
        // Ride sparse
        if (bt == 0) n.push({ w: drums, p: BELL, v: .55, d: 2.0, o: h })
        if (bt == 8 && localBar % 2 == 0) n.push({ w: drums, p: RIDE, v: .4, d: 1.5, o: h })

        tomPattern = localBar % 8

        // Descending tom runs
        if (tomPattern == 0 || tomPattern == 4) {
            toms = [TH, TH, TM, TM, TL, TL, TF, TF, TH, TH, TM, TM, TL, TL, TF, TF]
            n.push({ w: drums, p: toms[bt], v: .5 + (bt % 4) * .08, d: 0.6, o: sw + h })
        }

        // Ascending with accents
        if (tomPattern == 1 || tomPattern == 5) {
            toms = [TF, TL, TM, TH, TF, TL, TM, TH, TF, TL, TM, TH, TF, TL, TM, TH]
            accent = bt % 4 == 0
            n.push({ w: drums, p: toms[bt], v: accent ? .75 : .4, d: accent ? 0.8 : 0.5, o: sw + h })
        }

        // Paradiddle around toms
        if (tomPattern == 2 || tomPattern == 6) {
            // R L R R L R L L pattern across toms
            pattern = [TH, TM, TH, TH, TL, TF, TL, TL, TM, TH, TM, TM, TF, TL, TF, TF]
            accents = [0, 4, 8, 12]
            v = accents.includes(bt) ? .7 : .35
            n.push({ w: drums, p: pattern[bt], v: v, d: 0.5, o: sw + h })
        }

        // Double stroke on toms
        if (tomPattern == 3 || tomPattern == 7) {
            tomSeq = [TH, TM, TL, TF]
            tomIdx = Math.floor(bt / 4)
            n.push({ w: drums, p: tomSeq[tomIdx], v: .55 + (bt % 4) * .05, d: 0.4, o: sw + h })
            n.push({ w: drums, p: tomSeq[tomIdx], v: .4 + (bt % 4) * .04, d: 0.3, o: sw + h + 0.035 })
        }

        // Kick anchors
        if (bt == 0 || bt == 8) n.push({ w: drums, p: K, v: .65, d: 0.9, o: h * 0.4 })
        if (bt == 4 && R() > 0.5) n.push({ w: drums, p: K, v: .5, d: 0.7, o: sw + h * 0.4 })

        // Crashes on phrases
        if (bt == 0 && localBar % 4 == 0) {
            n.push({ w: drums, p: localBar < 8 ? CRASH : CHINA, v: .7, d: 3.0, o: 0 })
        }
    }

    // ====== SECTION 4: TRADING FOURS (bars 64-79) ======
    // Call and response - snare vs toms, ride vs hats
    if (section == 4) {
        tradePart = Math.floor(localBar / 2) % 4

        // Part A: Snare statement
        if (tradePart == 0) {
            if (bt == 0) n.push({ w: drums, p: S, v: .75, d: 0.8, o: h })
            if (bt == 2) n.push({ w: drums, p: SR, v: .2, d: 0.3, o: sw + h })
            if (bt == 3) n.push({ w: drums, p: SR, v: .18, d: 0.25, o: sw + h })
            if (bt == 4) n.push({ w: drums, p: S, v: .7, d: 0.7, o: sw + h })
            if (bt == 6) n.push({ w: drums, p: S, v: .6, d: 0.6, o: sw + h })
            if (bt == 7) n.push({ w: drums, p: S, v: .5, d: 0.5, o: sw + h })
            if (bt >= 8 && bt <= 11) {
                v = rollCresc(bt - 8, 4, 0.3, 0.8)
                n.push({ w: drums, p: S, v: v, d: 0.35, o: sw + h })
            }
            if (bt >= 12) {
                n.push({ w: drums, p: SR, v: .15 + (bt - 12) * .05, d: 0.2, o: sw + h })
            }
        }

        // Part B: Tom answer
        if (tradePart == 1) {
            toms = [TH, TH, TM, TM, TL, TL, TF, TF]
            if (bt < 8) {
                n.push({ w: drums, p: toms[bt], v: .55 + (bt % 2) * .15, d: 0.5, o: sw + h })
            }
            if (bt >= 8 && bt < 12) {
                n.push({ w: drums, p: TF, v: .6, d: 0.4, o: sw + h })
                n.push({ w: drums, p: TL, v: .5, d: 0.35, o: sw + h + 0.04 })
            }
            if (bt >= 12) {
                n.push({ w: drums, p: [TF, TL, TM, TH][bt - 12], v: .7, d: 0.6, o: sw + h })
            }
        }

        // Part C: Hi-hat burst
        if (tradePart == 2) {
            if (bt % 2 == 0) {
                open = bt == 2 || bt == 6 || bt == 10 || bt == 14
                n.push({ w: drums, p: open ? HHO : HHC, v: .5 + (bt == 0 ? .2 : 0), d: open ? 0.6 : 0.25, o: sw + h })
            }
            if (bt % 2 == 1 && R() > 0.3) {
                n.push({ w: drums, p: HHC, v: .25, d: 0.15, o: sw + h })
            }
            // Kick pattern underneath
            if (bt == 0 || bt == 6 || bt == 10) n.push({ w: drums, p: K, v: .6, d: 0.8, o: h * 0.4 })
        }

        // Part D: Ride explosion
        if (tradePart == 3) {
            if (bt % 2 == 0) {
                bell = bt == 0 || bt == 8
                n.push({ w: drums, p: bell ? BELL : RIDE, v: bell ? .7 : .45, d: 1.2, o: sw + h })
            }
            if (bt % 4 == 3) n.push({ w: drums, p: RIDE, v: .35, d: 0.8, o: sw + h })
            // Snare shots
            if (bt == 4 || bt == 12) n.push({ w: drums, p: S, v: .65, d: 0.7, o: sw + h })
        }

        // Crashes between phrases
        if (bt == 0 && localBar % 4 == 0) {
            n.push({ w: drums, p: CRASH, v: .75, d: 3.0, o: 0 })
            n.push({ w: drums, p: K, v: .8, d: 1.0, o: 0 })
        }
    }

    // ====== SECTION 5: THE BURN (bars 80-95) ======
    // Full intensity swing - everything at once
    if (section == 5) {
        // Relentless ride
        if (bt == 0 || bt == 8) n.push({ w: drums, p: BELL, v: .7, d: 1.5, o: h })
        if (bt == 4 || bt == 12) n.push({ w: drums, p: RIDE, v: .5, d: 1.0, o: sw + h })
        if (bt == 2 || bt == 6 || bt == 10 || bt == 14) n.push({ w: drums, p: RIDE, v: .4, d: 0.9, o: sw + h })
        if (bt % 4 == 3) n.push({ w: drums, p: RIDE, v: .35, d: 0.7, o: sw + h })

        // Heavy kick
        kicks = [0, 3, 6, 8, 10, 14]
        if (kicks.includes(bt)) n.push({ w: drums, p: K, v: .75 + R() * .1, d: 0.9, o: sw + h * 0.3 })

        // Double kick runs every other bar
        if (localBar % 2 == 1 && bt >= 12) {
            n.push({ w: drums, p: K, v: .65 + (bt - 12) * .05, d: 0.4, o: sw + h * 0.2 })
        }

        // Snare backbeat plus ghosts
        if (bt == 4 || bt == 12) n.push({ w: drums, p: S, v: .85, d: 0.9, o: sw + h })
        ghosts = [1, 3, 5, 7, 9, 11, 13, 15]
        if (ghosts.includes(bt) && R() > 0.35) {
            n.push({ w: drums, p: SR, v: .1 + R() * .1, d: 0.2, o: sw + h })
        }

        // Tom accents
        if (bt == 6 && localBar % 2 == 0) n.push({ w: drums, p: TH, v: .5, d: 0.5, o: sw + h })
        if (bt == 10 && localBar % 2 == 1) n.push({ w: drums, p: TM, v: .45, d: 0.5, o: sw + h })

        // Crashes
        if (bt == 0 && localBar % 2 == 0) n.push({ w: drums, p: CRASH, v: .7, d: 2.5, o: 0 })
        if (bt == 8 && localBar % 4 == 2) n.push({ w: drums, p: SPLASH, v: .5, d: 1.5, o: h })

        // 4-bar fill
        if (localBar == 15) {
            if (bt < 8) {
                toms = [S, S, TH, TH, TM, TM, TL, TL]
                n.push({ w: drums, p: toms[bt], v: .6 + bt * .03, d: 0.4, o: sw + h })
            } else {
                // Blazing singles to crash
                n.push({ w: drums, p: S, v: .7 + (bt - 8) * .04, d: 0.3, o: sw + h * 0.5 })
                n.push({ w: drums, p: S, v: .5 + (bt - 8) * .03, d: 0.25, o: sw + h * 0.5 + 0.03 })
            }
            if (bt == 15) n.push({ w: drums, p: CRASH, v: .95, d: 4.0, o: 0 })
        }
    }

    // ====== SECTION 6: POLYRHYTHMIC CHAOS (bars 96-111) ======
    // 3 over 4, 5 over 4, hemiola madness
    if (section == 6) {
        // 3-over-4 ride
        ride3 = (bt * 3) % 16
        if (ride3 < 4 || bt == 0 || bt == 8) {
            bell = bt == 0
            n.push({ w: drums, p: bell ? BELL : RIDE, v: .55 + (bell ? .2 : 0), d: 1.2, o: h })
        }

        // 5-over-4 kick pattern
        kick5 = (bt * 5) % 20
        if (kick5 < 5 || bt == 0) {
            n.push({ w: drums, p: K, v: .65 + R() * .15, d: 0.8, o: h * 0.4 })
        }

        // 7-over-4 snare ghosts
        snare7 = (bt * 7) % 28
        if (snare7 < 5) {
            accent = snare7 == 0
            n.push({ w: drums, p: accent ? S : SR, v: accent ? .65 : .18, d: accent ? 0.6 : 0.2, o: sw + h })
        }

        // Regular backbeat for grounding
        if (bt == 4 || bt == 12) n.push({ w: drums, p: S, v: .7, d: 0.8, o: sw + h })

        // Tom hemiola - groups of 3 against 4
        hemiola = bt % 3
        if (hemiola == 0 && localBar >= 8) {
            tomSeq = [TH, TM, TL, TF, TL, TM]
            tomIdx = Math.floor(bt / 3) % 6
            n.push({ w: drums, p: tomSeq[tomIdx], v: .5, d: 0.5, o: sw + h })
        }

        // Metric modulation feel on fills
        if (localBar % 4 == 3 && bt >= 8) {
            // Triplet feel superimposed
            tripletPos = (bt - 8) % 3
            if (tripletPos == 0) {
                n.push({ w: drums, p: S, v: .7, d: 0.4, o: sw + h })
            }
        }

        // Crashes on downbeats
        if (bt == 0 && localBar % 4 == 0) {
            n.push({ w: drums, p: CRASH, v: .8, d: 3.0, o: 0 })
        }
        if (bt == 0 && localBar % 4 == 2) {
            n.push({ w: drums, p: CHINA, v: .6, d: 2.5, o: 0 })
        }
    }

    // ====== SECTION 7: THE CLIMAX (bars 112-127) ======
    // Everything at maximum - 16 bars of pure fire
    if (section == 7) {
        climaxIntensity = localBar / 15  // 0 to 1 across section

        // Ride bell fury
        if (bt % 2 == 0) n.push({ w: drums, p: BELL, v: .6 + climaxIntensity * .2, d: 1.0, o: h })
        if (bt % 2 == 1) n.push({ w: drums, p: RIDE, v: .4 + climaxIntensity * .15, d: 0.8, o: sw + h })

        // Kick on every beat, doubles on upbeats
        if (bt % 4 == 0) {
            n.push({ w: drums, p: K, v: .85 + climaxIntensity * .1, d: 0.9, o: h * 0.3 })
        }
        if (bt % 4 == 2) {
            n.push({ w: drums, p: K, v: .7 + climaxIntensity * .1, d: 0.7, o: sw + h * 0.3 })
        }
        if (localBar >= 8 && bt % 2 == 1) {
            n.push({ w: drums, p: K, v: .55 + climaxIntensity * .15, d: 0.5, o: sw + h * 0.3 })
        }

        // Snare - constant stream
        if (bt == 4 || bt == 12) {
            // Backbeat with flam
            n.push({ w: drums, p: SR, v: .3, d: 0.1, o: sw + h - 0.02 })
            n.push({ w: drums, p: S, v: .9 + climaxIntensity * .05, d: 0.9, o: sw + h })
        }

        // Ghost blizzard
        if ((bt % 4 == 1 || bt % 4 == 3) && R() > 0.2) {
            n.push({ w: drums, p: SR, v: .12 + R() * .1, d: 0.2, o: sw + h })
        }

        // Constant snare rolls on last 4 bars
        if (localBar >= 12 && bt != 4 && bt != 12) {
            rollV = 0.4 + (localBar - 12) * 0.1 + bt * 0.02
            n.push({ w: drums, p: S, v: rollV, d: 0.25, o: sw + h })
        }

        // Tom bursts
        if (localBar % 2 == 1 && (bt == 6 || bt == 7 || bt == 14 || bt == 15)) {
            tom = [TH, TM, TL, TF][bt % 4]
            n.push({ w: drums, p: tom, v: .6 + climaxIntensity * .2, d: 0.5, o: sw + h })
        }

        // Crashes building
        if (bt == 0 && localBar % 2 == 0) {
            n.push({ w: drums, p: CRASH, v: .75 + localBar * .015, d: 3.0, o: 0 })
        }
        if (bt == 8 && localBar >= 12) {
            n.push({ w: drums, p: CHINA, v: .7, d: 2.0, o: 0 })
        }

        // Final 4 bars - THE ENDING
        if (localBar >= 12) {
            if (localBar == 12 && bt >= 8) {
                // Triplet pull-back
                if (bt % 3 == 0) n.push({ w: drums, p: S, v: .8, d: 0.5, o: sw + h })
            }
            if (localBar == 13) {
                // Snare roll crescendo
                rollV = 0.5 + bt * 0.03
                n.push({ w: drums, p: S, v: rollV, d: 0.25, o: sw + h * 0.5 })
                if (bt % 2 == 0) n.push({ w: drums, p: K, v: .7, d: 0.6, o: h * 0.3 })
            }
            if (localBar == 14) {
                // Tom cascade
                tomSeq = [TH, TH, TM, TM, TL, TL, TF, TF, TF, TL, TM, TH, S, S, S, S]
                n.push({ w: drums, p: tomSeq[bt], v: .7 + bt * 0.015, d: 0.4, o: sw + h * 0.5 })
                if (bt >= 12) n.push({ w: drums, p: K, v: .8, d: 0.5, o: h * 0.3 })
            }
            if (localBar == 15) {
                // FINAL BAR - building to the hit
                if (bt < 12) {
                    // Blazing roll
                    n.push({ w: drums, p: S, v: .6 + bt * 0.025, d: 0.2, o: sw + h * 0.3 })
                    n.push({ w: drums, p: S, v: .45 + bt * 0.02, d: 0.15, o: sw + h * 0.3 + 0.025 })
                    if (bt % 4 == 0) n.push({ w: drums, p: K, v: .8, d: 0.6, o: h * 0.2 })
                }
                if (bt >= 12 && bt < 15) {
                    // Final triplet wind-up
                    n.push({ w: drums, p: S, v: .85, d: 0.3, o: h * 0.2 })
                    n.push({ w: drums, p: K, v: .9, d: 0.5, o: h * 0.2 })
                }
                if (bt == 15) {
                    // THE FINAL HIT
                    n.push({ w: drums, p: CRASH, v: 1.0, d: 5.0, o: 0 })
                    n.push({ w: drums, p: CHINA, v: .85, d: 4.5, o: 0.01 })
                    n.push({ w: drums, p: K, v: 1.0, d: 2.0, o: 0 })
                    n.push({ w: drums, p: S, v: .95, d: 1.5, o: 0 })
                    n.push({ w: drums, p: TF, v: .8, d: 1.2, o: 0.02 })
                }
            }
        }
    }

    // ====== GLOBAL FILLS - signature licks every 8 bars ======
    if (bar % 8 == 7 && section < 7) {
        fillType = Math.floor(bar / 8) % 6

        // Fill starts at beat 12
        if (bt >= 12) {
            fillBt = bt - 12

            if (fillType == 0) {
                // Single stroke descent
                toms = [S, TH, TM, TL]
                n.push({ w: drums, p: toms[fillBt], v: .6 + fillBt * .1, d: 0.4, o: sw + h })
            }

            if (fillType == 1) {
                // Doubles on snare
                n.push({ w: drums, p: S, v: .5 + fillBt * .12, d: 0.25, o: sw + h })
                n.push({ w: drums, p: S, v: .4 + fillBt * .1, d: 0.2, o: sw + h + 0.03 })
            }

            if (fillType == 2) {
                // Paradiddle
                pattern = [S, TH, S, S, TM, S, TL, TL]
                accents = [0, 4]
                inst = pattern[fillBt % 8]
                v = accents.includes(fillBt) ? .75 : .4
                n.push({ w: drums, p: inst, v: v, d: 0.4, o: sw + h })
            }

            if (fillType == 3) {
                // Flam accent
                if (fillBt % 2 == 0) {
                    n.push({ w: drums, p: SR, v: .25, d: 0.08, o: sw + h - 0.02 })
                    n.push({ w: drums, p: S, v: .7 + fillBt * .05, d: 0.5, o: sw + h })
                }
            }

            if (fillType == 4) {
                // Linear kick-snare
                if (fillBt % 2 == 0) n.push({ w: drums, p: K, v: .7, d: 0.5, o: sw + h })
                if (fillBt % 2 == 1) n.push({ w: drums, p: S, v: .65, d: 0.4, o: sw + h })
            }

            if (fillType == 5) {
                // Ascending tom flurry
                toms = [TF, TL, TM, TH]
                n.push({ w: drums, p: toms[fillBt], v: .55 + fillBt * .12, d: 0.5, o: sw + h })
            }
        }

        // Crash on next downbeat
        if (bt == 15) {
            n.push({ w: drums, p: CRASH, v: .8 + globalIntensity * .15, d: 3.5, o: 0.06 })
        }
    }

    // ====== DYNAMICS - breathing room ======
    // Every 16 bars, brief dynamic dip in bar 8
    if (localBar == 8 && bt == 0 && section < 6) {
        // Replace whatever's happening with a spacious moment
        n = n.filter(note => note.p == RIDE || note.p == BELL)
        n.push({ w: drums, p: HHP, v: .35, d: 0.3, o: 0 })
    }

    return n
}
