// 13/8 Expressive Drums

// MIDI channels
const drums = 'm:1';
const bass = 'm:2';
const drums2 = 'm:3';

// Bass: E minor pentatonic (E G A B D)
const ROOT = 28; // E1
const penta = [0, 3, 5, 7, 10]; // minor pentatonic intervals

// GM drum notes
const K = 36, S = 38, SR = 37, HHC = 42, HHO = 46;
const RIDE = 51, BELL = 53, CRASH = 49;
const TF = 43, TL = 45, TM = 47, TH = 50;

// 13/8 = 13 sixteenth-note subdivisions per bar
const BAR = 13;

// Humanize
const slop = () => (Math.random() - 0.5) * 0.012;
const R = () => Math.random();

// Global dynamics (0.0 - 1.0)
const DYN = 0.65;
const V = (v) => v * DYN; // velocity scaler

// Grouping: 3+3+3+2+2 (accents on 0, 3, 6, 9, 11)
const accents = [0, 3, 6, 9, 11];

// Piece ends after this many bars
const END_BAR = 64;

return (t, s) => {
    let n = [];

    let bar = Math.floor(t / BAR);
    let bt = t % BAR;

    // Silence after end
    if (bar > END_BAR) return n;

    // === FINAL BAR - big finish ===
    if (bar === END_BAR) {
        if (bt === 0) {
            // Big hit - everyone together
            n.push({ w: drums, p: CRASH, v: V(1.0), d: 4.0, o: 0 });
            n.push({ w: drums, p: K, v: V(1.0), d: 1.0, o: 0 });
            n.push({ w: drums, p: S, v: V(0.9), d: 1.2, o: 0.01 });
            n.push({ w: drums2, p: CRASH, v: V(0.85), d: 3.5, o: 0.005 });
            n.push({ w: drums2, p: K, v: V(0.8), d: 0.8, o: 0.01 });
            n.push({ w: bass, p: ROOT, v: V(1.0), d: 0.5, o: 0 });
            n.push({ w: bass, p: ROOT - 12, v: V(0.9), d: 0.8, o: 0.02 });
        }
        // Decaying tom roll
        if (bt >= 1 && bt <= 6) {
            let decay = 1 - (bt - 1) * 0.15;
            let toms = [TH, TM, TL, TF, TL, TM];
            n.push({ w: drums, p: toms[bt - 1], v: V(0.6 * decay), d: 0.3, o: slop() });
        }
        return n;
    }
    let phrase = Math.floor(bar / 4);
    let localBar = bar % 4;
    let isFill = localBar === 3 && bt >= 7;

    let h = slop();

    // Every 8 bars = Purdie section
    let purdieSection = Math.floor(bar / 8) % 2 === 1;

    // Every 16 bars = rimshot section (bars 12-15 of each 16)
    let rimshotSection = (bar % 16) >= 12;

    // === MAIN PATTERN ===

    if (!isFill) {
        if (rimshotSection) {
            // === RIMSHOT SECTION - syncopated, stubborn ===

            // Syncopated rimshot hits - against the 13/8 grain
            let syncBeats = [1, 4, 7, 10, 12]; // off the accents
            if (syncBeats.includes(bt)) {
                n.push({ w: drums, p: SR, v: V(0.72 + R() * 0.15), d: 0.25, o: h });
            }

            // Stubborn repeating figure - same rhythm insistently
            let stubbornFig = [0, 2, 3, 5, 6, 8, 9, 11];
            if (stubbornFig.includes(bt)) {
                let accent = bt === 0 || bt === 6;
                n.push({ w: drums, p: SR, v: V(accent ? 0.85 : 0.55 + R() * 0.15), d: 0.18, o: h });
            }

            // Kick only on 1 and displaced
            if (bt === 0) {
                n.push({ w: drums, p: K, v: V(0.82 + R() * 0.1), d: 0.6, o: h });
            }
            if (bt === 7 && R() > 0.3) {
                n.push({ w: drums, p: K, v: V(0.65 + R() * 0.12), d: 0.5, o: h });
            }

            // Minimal hi-hat - just accents
            if (accents.includes(bt) && R() > 0.4) {
                n.push({ w: drums, p: HHC, v: V(0.32 + R() * 0.12), d: 0.05, o: h });
            }

            // Stubborn fills - same lick repeated, insistent
            let localBar16 = bar % 16;
            if (localBar16 >= 13 && bt >= 6) {
                // Repeating triplet-ish figure
                let stubFill = [SR, K, SR, SR, K, SR, K];
                let fillIdx = bt - 6;
                if (fillIdx < stubFill.length) {
                    let vel = 0.6 + (fillIdx % 2) * 0.15 + R() * 0.1;
                    n.push({ w: drums, p: stubFill[fillIdx], v: V(vel), d: 0.15, o: h });
                    // Double hit for emphasis
                    if (stubFill[fillIdx] === SR && R() > 0.5) {
                        n.push({ w: drums, p: SR, v: V(0.4), d: 0.1, o: h + 0.03 });
                    }
                }
            }

            // Extra syncopation layer - rimshot flams
            if ((bt === 3 || bt === 10) && R() > 0.45) {
                n.push({ w: drums, p: SR, v: V(0.35), d: 0.08, o: h - 0.015 }); // grace
                n.push({ w: drums, p: SR, v: V(0.7), d: 0.2, o: h + 0.01 }); // main
            }

        } else if (purdieSection) {
            // === BERNARD PURDIE STYLE ===
            // Open hi-hat + kick snapped together on 0, 6, 9
            let snapBeats = [0, 6, 9];
            if (snapBeats.includes(bt)) {
                n.push({ w: drums, p: K, v: V(0.88 + R() * 0.1), d: 0.7, o: h });
                n.push({ w: drums, p: HHO, v: V(0.72 + R() * 0.12), d: 0.3, o: h });
            }

            // Snares between the pairs - ghost shuffle
            let snareGhosts = [1, 2, 4, 5, 7, 8, 10, 11, 12];
            snareGhosts.forEach(g => {
                if (bt === g) {
                    // Heavier ghosts on certain beats for that Purdie roll
                    let heavy = [2, 5, 8, 11].includes(g);
                    let vel = heavy ? 0.32 + R() * 0.18 : 0.15 + R() * 0.15;
                    n.push({ w: drums, p: SR, v: V(vel), d: 0.12, o: h });
                    // Double ghost for shuffle feel
                    if (heavy && R() > 0.4) {
                        n.push({ w: drums, p: SR, v: V(0.18 + R() * 0.1), d: 0.08, o: h + 0.035 });
                    }
                }
            });

            // Main snare backbeats with accent
            if (bt === 3 || bt === 10) {
                n.push({ w: drums, p: S, v: V(0.82 + R() * 0.12), d: 0.9, o: h + 0.005 });
            }

            // Closed hi-hats filling gaps
            let hhClosed = [3, 4, 10, 11, 12];
            if (hhClosed.includes(bt)) {
                n.push({ w: drums, p: HHC, v: V(0.35 + R() * 0.15), d: 0.06, o: h });
            }

            // Purdie fills - every 2 bars in Purdie section
            if (bar % 2 === 1 && bt >= 10) {
                let fillBt = bt - 10;
                // Snare roll with kick punctuation
                n.push({ w: drums, p: S, v: V(0.55 + fillBt * 0.1 + R() * 0.1), d: 0.15, o: h });
                if (fillBt === 1) {
                    n.push({ w: drums, p: K, v: V(0.75), d: 0.5, o: h });
                }
                // Ghost flurry
                if (R() > 0.3) {
                    n.push({ w: drums, p: SR, v: V(0.25 + R() * 0.15), d: 0.06, o: h + 0.04 });
                }
            }

        } else {
            // === NORMAL PATTERN ===
            // Kick: 1 and the "4" of 13/8 (beat 9)
            if (bt === 0) {
                n.push({ w: drums, p: K, v: V(0.92 + R() * 0.08), d: 0.8, o: h });
            }
            if (bt === 9) {
                n.push({ w: drums, p: K, v: V(0.78 + R() * 0.1), d: 0.7, o: h });
            }
            // Ghost kick on beat 5
            if (bt === 5 && R() > 0.4) {
                n.push({ w: drums, p: K, v: V(0.35 + R() * 0.15), d: 0.4, o: h });
            }

            // Snare: beat 6 (middle of bar) and beat 11 (near end)
            if (bt === 6) {
                n.push({ w: drums, p: S, v: V(0.85 + R() * 0.1), d: 1.0, o: h + 0.008 });
            }
            if (bt === 11) {
                n.push({ w: drums, p: S, v: V(0.75 + R() * 0.12), d: 0.9, o: h + 0.01 });
            }

            // Ghost snares for expression
            let ghosts = [2, 4, 8, 10];
            ghosts.forEach(g => {
                if (bt === g && R() > 0.55) {
                    n.push({ w: drums, p: SR, v: V(0.18 + R() * 0.18), d: 0.15, o: h });
                }
            });

            // Hi-hat: every beat, accented on grouping
            let isAccent = accents.includes(bt);
            let open = bt === 3 || bt === 9;
            let hhVel = isAccent ? 0.55 + R() * 0.15 : 0.28 + R() * 0.12;
            n.push({ w: drums, p: open ? HHO : HHC, v: V(hhVel), d: open ? 0.25 : 0.08, o: h });

            // Ride bell on 0 every 2 bars
            if (bt === 0 && bar % 2 === 0) {
                n.push({ w: drums, p: BELL, v: V(0.48 + R() * 0.12), d: 1.2, o: h });
            }
        }
    }

    // === FILLS (every 4 bars, last 6 beats) ===

    if (isFill) {
        let fillBt = bt - 7; // 0-5 within fill

        // Tom cascade with kicks
        let fillPattern = [
            { p: K, v: 0.85 },
            { p: TH, v: 0.72 },
            { p: TM, v: 0.68 },
            { p: K, v: 0.8 },
            { p: TL, v: 0.7 },
            { p: TF, v: 0.75 },
        ];

        if (fillBt >= 0 && fillBt < fillPattern.length) {
            let hit = fillPattern[fillBt];
            let accel = 1 + fillBt * 0.03; // build intensity
            n.push({ w: drums, p: hit.p, v: V(hit.v * accel), d: 0.35, o: h });

            // Double hits on toms for expression
            if (hit.p >= TF && R() > 0.5) {
                n.push({ w: drums, p: hit.p, v: V(hit.v * 0.55), d: 0.2, o: h + 0.06 });
            }
        }

        // Crash on fill exit (beat 0 of next bar handled separately)
    }

    // Crash after fills
    if (localBar === 0 && bt === 0 && bar > 0 && bar % 4 === 0) {
        n.push({ w: drums, p: CRASH, v: V(0.88), d: 2.5, o: 0 });
    }

    // === SECOND DRUMMER (texture) ===

    // Comes in based on phrase - more likely as piece builds
    let d2Phrase = Math.floor(bar / 16);
    let d2Chance = Math.min(0.7, 0.15 + d2Phrase * 0.1);
    let d2Active = R() < d2Chance;

    // Also comes in during certain bars for density
    let densityBars = [3, 7, 11, 15];
    if (densityBars.includes(bar % 16)) d2Active = true;

    if (d2Active) {
        let h2 = slop() * 1.5; // slightly sloppier

        // Ride pattern - offbeat feel against main drummer
        if (bt % 3 === 1 && R() > 0.3) {
            n.push({ w: drums2, p: RIDE, v: V(0.38 + R() * 0.15), d: 0.9, o: h2 });
        }

        // Bell accents on odd groupings
        if ((bt === 2 || bt === 5 || bt === 8) && R() > 0.55) {
            n.push({ w: drums2, p: BELL, v: V(0.42 + R() * 0.12), d: 0.8, o: h2 });
        }

        // Cross-stick texture
        if (bt % 4 === 3 && R() > 0.6) {
            n.push({ w: drums2, p: SR, v: V(0.28 + R() * 0.15), d: 0.2, o: h2 });
        }

        // Splash/crash accents on phrase boundaries
        if (bt === 0 && localBar === 0 && R() > 0.65) {
            n.push({ w: drums2, p: CRASH, v: V(0.55 + R() * 0.2), d: 2.0, o: h2 });
        }

        // Tom conversation - responds to main drummer fills
        if (isFill && R() > 0.4) {
            let toms = [TH, TM, TL, TF];
            let tomIdx = (bt + 2) % 4; // offset from main drummer
            n.push({ w: drums2, p: toms[tomIdx], v: V(0.45 + R() * 0.2), d: 0.3, o: h2 + 0.02 });
        }

        // Ghost kick doubling - thickens the groove
        if ((bt === 0 || bt === 9) && R() > 0.5) {
            n.push({ w: drums2, p: K, v: V(0.35 + R() * 0.15), d: 0.5, o: h2 + 0.015 });
        }

        // Extra texture during Purdie sections
        if (purdieSection) {
            // Double-time hi-hat underneath
            if (R() > 0.6) {
                n.push({ w: drums2, p: HHC, v: V(0.18 + R() * 0.1), d: 0.04, o: h2 });
            }
        }
    }

    // === BASS ===

    let bassFill = localBar === 3 && bt >= 9;
    let bassPhrase = bar % 8;

    // Main notes on accents
    if (!bassFill) {
        // Root on 1
        if (bt === 0) {
            n.push({ w: bass, p: ROOT, v: V(0.88 + R() * 0.1), d: 0.12, o: h });
        }
        // Fifth (B) on beat 6
        if (bt === 6) {
            n.push({ w: bass, p: ROOT + 7, v: V(0.72 + R() * 0.1), d: 0.08, o: h });
        }
        // Octave on beat 9
        if (bt === 9) {
            n.push({ w: bass, p: ROOT + 12, v: V(0.68 + R() * 0.12), d: 0.07, o: h });
        }

        // Ghost notes - pentatonic fills between main notes
        let ghostBeats = [1, 2, 4, 5, 7, 8, 10, 11, 12];
        ghostBeats.forEach(g => {
            if (bt === g && R() > 0.45) {
                let note = ROOT + penta[Math.floor(R() * 5)];
                // Octave variation
                if (R() > 0.7) note += 12;
                n.push({ w: bass, p: note, v: V(0.15 + R() * 0.2), d: 0.03, o: h });
            }
        });

        // Extra ghost cluster before beat 6
        if (bt === 5 && R() > 0.6) {
            n.push({ w: bass, p: ROOT + penta[1], v: V(0.22), d: 0.025, o: h - 0.02 });
            n.push({ w: bass, p: ROOT + penta[2], v: V(0.18), d: 0.02, o: h + 0.03 });
        }
    }

    // Bass fills every 8 bars - ascending fourths, Cliffs of Dover style
    if (bassFill && bassPhrase === 7) {
        let fillBt = bt - 9;
        // Stacked fourths ascending: E -> A -> D -> G
        let fourths = [0, 5, 10, 15]; // intervals in fourths
        if (fillBt >= 0 && fillBt < fourths.length) {
            let note = ROOT + fourths[fillBt];
            n.push({ w: bass, p: note, v: V(0.65 + fillBt * 0.08), d: 0.05, o: h });
            // Ghost a fourth below for that cascading feel
            n.push({ w: bass, p: note - 5, v: V(0.2 + R() * 0.1), d: 0.02, o: h + 0.025 });
            // Second ghost - octave up, quick
            if (R() > 0.5) {
                n.push({ w: bass, p: note + 12, v: V(0.18), d: 0.015, o: h + 0.05 });
            }
        }
    }

    // Extra fill variation every 16 bars - longer ascending fourths run
    if (localBar === 3 && bt >= 5 && bar % 16 === 15) {
        let runBt = bt - 5;
        // Extended fourths run: E A D G C F
        let extFourths = [0, 5, 10, 15, 20, 25, 29, 34];
        if (runBt < extFourths.length) {
            let note = ROOT + extFourths[runBt];
            let vel = 0.5 + runBt * 0.06;
            n.push({ w: bass, p: note, v: V(vel), d: 0.04, o: h });
            // Hammer-on ghost a whole step up
            if (R() > 0.35) {
                n.push({ w: bass, p: note + 2, v: V(0.22), d: 0.018, o: h + 0.03 });
            }
        }
    }

    return n;
};

