// Jazz prog 5/4 beat - MIDI output
const swingAmt = 0.028;
const slopAmt = 0.015;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.5);
const fl = (t) => Math.floor(t);
const sin = (t) => Math.sin(t);
const rnd = () => Math.random();
const velHuman = (base) => base * (0.85 + rnd() * 0.3); // velocity humanization

const BAR = 10; // 5/4 in eighth notes

// MIDI channels
const drums = 'm:1';
const bass = 'm:2';
const piano = 'm:3';

// GM drum notes
const KICK = 36;
const SNARE = 38;
const RIDE = 51;
const RIDE_BELL = 53;
const HH_CLOSED = 42;
const HH_OPEN = 46;
const HH_FOOT = 44;
const CRASH = 49;
const TOM_HIGH = 50;
const TOM_MID = 47;
const TOM_LOW = 43;
const TOM_FLOOR = 41;

return (t, s) => {
    let n = [];
    const bar = fl(t / BAR);
    const beat = t % BAR;
    const phrase = fl(t / (BAR * 4)); // 4-bar phrase

    // Dorian mode for jazzy feel
    const dorian = [0, 2, 3, 5, 7, 9, 10];
    let scale = dorian.map(note => note + 36 + 12);
    while (scale[scale.length - 1] < 100) {
        scale = scale.concat(scale.slice(-7).map(note => note + 12));
    }

    // Chord progression: i - IV - v - i - bVII
    const roots = [0, 3, 4, 0, 5];
    const root = roots[bar % roots.length];

    // Jazz voicing: root, 3rd, 7th, 9th
    const chord = [0, 2, 6, 8].map(i => scale[root + i]);

    // === DRUMS WITH HUMAN FEEL ===

    // Switch between ride (first 16 bars) and hi-hats (next 16)
    const useHiHats = fl(bar / 16) % 2 === 1;

    // Cymbal pattern - jazz pattern in 5/4
    const cymbalPattern = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0];

    if (useHiHats) {
        // Hi-hat section with Purdie feel
        if (cymbalPattern[beat]) {
            const isDownbeat = beat === 0;
            const accentBeat = beat === 4 || beat === 7;

            // Purdie open hat on the "and" of certain beats synced with kick
            const purdieOpen = (beat === 3 || beat === 8) && rnd() > 0.3;

            let hhVel = 0.32 + (beat / BAR) * 0.08;
            if (isDownbeat) hhVel += 0.12;
            if (accentBeat) hhVel += 0.08;

            n.push({
                w: drums,
                p: purdieOpen ? HH_OPEN : HH_CLOSED,
                d: purdieOpen ? 0.2 : 0.08,
                o: swing(t) + slop() * (isDownbeat ? 0.5 : 1.2),
                v: velHuman(purdieOpen ? hhVel + 0.1 : hhVel),
                x: -0.5
            });

            // Purdie kick sync - kick hits with open hat
            if (purdieOpen) {
                n.push({
                    w: drums,
                    p: KICK,
                    d: 0.25,
                    o: slop() * 0.5,
                    v: velHuman(0.6),
                    x: 0
                });
            }
        }

        // 32nd note hi-hat ghosts - sparse, very soft
        if (rnd() > 0.85) {
            const ghostOffset = 0.25 + rnd() * 0.5;
            n.push({
                w: drums,
                p: HH_CLOSED,
                d: 0.03,
                o: ghostOffset + slop() * 2,
                v: velHuman(0.06 + rnd() * 0.06),
                x: -0.5
            });
        }

    } else {
        // Ride cymbal section
        if (cymbalPattern[beat]) {
            const isDownbeat = beat === 0;
            const accentBeat = beat === 4 || beat === 7;
            const useBell = accentBeat && rnd() > 0.7;

            let rideVel = 0.28 + (beat / BAR) * 0.08;
            if (isDownbeat) rideVel += 0.15;
            if (accentBeat) rideVel += 0.1;

            n.push({
                w: drums,
                p: useBell ? RIDE_BELL : RIDE,
                d: 0.1,
                o: swing(t) + slop() * (isDownbeat ? 0.5 : 1.5),
                v: velHuman(rideVel),
                x: 0.6
            });
        }
    }

    // Kick - main hits plus ghost kicks (modified for Purdie sections)
    const kick = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0];
    const ghostKick = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
    // Purdie syncopation kicks in hi-hat sections
    const purdieKick = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0];

    const activeKick = useHiHats ? purdieKick : kick;

    if (activeKick[beat]) {
        n.push({
            w: drums,
            p: KICK,
            d: 0.3,
            o: slop() * 0.6,
            v: velHuman(beat === 0 ? 0.75 : 0.62),
            x: 0
        });
    } else if (ghostKick[beat] && rnd() > 0.4) {
        n.push({
            w: drums,
            p: KICK,
            d: 0.2,
            o: slop() * 2,
            v: velHuman(0.32),
            x: 0
        });
    }

    // Snare - accents and ghost notes
    const snareAccent = [0, 0, 0, 0, 2, 0, 0, 0, 0, 0];
    const snareGhost = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0];

    if (snareAccent[beat]) {
        n.push({
            w: drums,
            p: SNARE,
            d: 0.15,
            o: swing(t) + slop() * 0.7,
            v: velHuman(0.75),
            x: -0.2
        });
    }

    // ghost notes - very soft, lots of timing slop, sometimes skip
    if (snareGhost[beat] && rnd() > 0.35) {
        const ghostVel = 0.12 + rnd() * 0.12; // very soft, varied
        n.push({
            w: drums,
            p: SNARE,
            d: 0.08,
            o: swing(t) + slop() * 2.5, // looser timing
            v: ghostVel,
            x: -0.3 + rnd() * 0.2
        });
    }

    // Hi-hat foot - only when playing ride (not when playing hats with sticks)
    const hhfoot = [0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    if (!useHiHats && hhfoot[beat]) {
        n.push({
            w: drums,
            p: HH_FOOT,
            d: 0.05,
            o: slop() * 1.5,
            v: velHuman(0.18),
            x: -0.4
        });
    }

    // Small fill every 4 bars (last 3 beats)
    const isSmallFill = bar % 4 === 3 && beat >= 7;
    // Large fill every 16 bars (last bar, all beats)
    const isLargeFill = bar % 16 === 15;

    if (isLargeFill) {
        // Big fill - toms descending, snare flams, kicks
        const toms = [TOM_HIGH, TOM_HIGH, TOM_MID, TOM_MID, TOM_LOW, TOM_LOW, TOM_FLOOR, TOM_FLOOR, TOM_FLOOR, KICK];
        const fillVel = 0.5 + (beat / BAR) * 0.35; // builds to end

        n.push({
            w: drums,
            p: toms[beat],
            d: 0.12,
            o: slop(),
            v: velHuman(fillVel),
            x: -0.3 + (beat / BAR) * 0.6
        });

        // add snare hits on some beats
        if (beat === 2 || beat === 5 || beat === 8) {
            n.push({
                w: drums,
                p: SNARE,
                d: 0.1,
                o: slop(),
                v: velHuman(fillVel * 0.8),
                x: -0.2
            });
        }

        // flam on beat 9
        if (beat === 9) {
            n.push({
                w: drums,
                p: SNARE,
                d: 0.15,
                o: -0.03 + slop(), // grace note slightly before
                v: velHuman(0.5),
                x: -0.2
            });
            n.push({
                w: drums,
                p: SNARE,
                d: 0.15,
                o: slop(),
                v: velHuman(0.85),
                x: -0.2
            });
        }
    } else if (isSmallFill) {
        if (useHiHats) {
            // Purdie-style open hat + kick sync fill
            const purdiePattern = [
                { hat: HH_OPEN, kick: true },
                { hat: HH_CLOSED, kick: false },
                { hat: HH_OPEN, kick: true }
            ];
            const noteIdx = beat - 7;
            const p = purdiePattern[noteIdx];

            // Open/closed hat
            n.push({
                w: drums,
                p: p.hat,
                d: p.hat === HH_OPEN ? 0.15 : 0.05,
                o: slop(),
                v: velHuman(0.55 + noteIdx * 0.1),
                x: -0.5
            });

            // Synced kick
            if (p.kick) {
                n.push({
                    w: drums,
                    p: KICK,
                    d: 0.2,
                    o: slop() * 0.5,
                    v: velHuman(0.6 + noteIdx * 0.08),
                    x: 0
                });
            }

            // occasional 32nd hat pickup on beat 8
            if (beat === 8 && rnd() > 0.5) {
                n.push({
                    w: drums,
                    p: HH_CLOSED,
                    d: 0.02,
                    o: 0.5 + slop(),
                    v: velHuman(0.12),
                    x: -0.5
                });
            }
        } else {
            // Standard fill - snare and tom licks
            const smallFillNotes = [SNARE, TOM_HIGH, TOM_MID];
            const noteIdx = beat - 7;

            n.push({
                w: drums,
                p: smallFillNotes[noteIdx % 3],
                d: 0.1,
                o: slop(),
                v: velHuman(0.45 + noteIdx * 0.12),
                x: -0.1
            });

            // occasional double on beat 8
            if (beat === 8 && rnd() > 0.5) {
                n.push({
                    w: drums,
                    p: SNARE,
                    d: 0.08,
                    o: 0.5 + slop(),
                    v: velHuman(0.4),
                    x: -0.15
                });
            }
        }
    }

    // Crash on phrase start (every 4 bars) and bigger crash every 16
    if (beat === 0 && bar > 0) {
        if (bar % 16 === 0) {
            n.push({
                w: drums,
                p: CRASH,
                d: 0.8,
                o: slop() * 0.3,
                v: velHuman(0.75),
                x: 0.7
            });
        } else if (bar % 4 === 0) {
            n.push({
                w: drums,
                p: CRASH,
                d: 0.5,
                o: slop() * 0.3,
                v: velHuman(0.5),
                x: 0.7
            });
        }
    }

    // === PIANO (mirrors bass with improv) ===
    const bassPatternNormal = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1];
    const bassPatternHihat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0];
    const pianoPattern = useHiHats ? bassPatternHihat : bassPatternNormal;
    const pianoNote = scale[root + fl(t / 2) % 5] + 24; // same as bass but +2 octaves

    // decide improv mode for this phrase
    const improvSeed = fl(t / (BAR * 2)); // changes every 2 bars
    const improvMode = improvSeed % 4; // 0: unison, 1: harmony, 2: trill, 3: sparse harmony

    if (pianoPattern[beat]) {
        const isDownbeat = beat === 0 || beat === 6;

        if (improvMode === 0) {
            // unison with bass - simple doubling
            n.push({
                w: piano,
                p: pianoNote,
                d: isDownbeat ? 0.35 : 0.2,
                o: swing(t) + slop(),
                v: velHuman(isDownbeat ? 0.45 : 0.35),
                x: 0.2
            });
        } else if (improvMode === 1) {
            // harmonies - add 3rd and 7th above
            const voicings = [0, 2, 4, 6]; // root, 3rd, 5th, 7th in scale
            const numVoices = isDownbeat ? 3 : 2;
            for (let i = 0; i < numVoices; i++) {
                n.push({
                    w: piano,
                    p: scale[root + voicings[i]] + 24,
                    d: 0.3,
                    o: swing(t) + slop() + i * 0.015, // slight spread
                    v: velHuman(0.35 - i * 0.05),
                    x: 0.2
                });
            }
        } else if (improvMode === 2 && rnd() > 0.4) {
            // trill mode - rapid alternation between two notes
            const trillNote1 = pianoNote;
            const trillNote2 = scale[root + 1 + fl(rnd() * 3)] + 24; // neighboring scale tone
            const trillCount = 3 + fl(rnd() * 3); // 3-5 notes
            for (let i = 0; i < trillCount; i++) {
                n.push({
                    w: piano,
                    p: i % 2 === 0 ? trillNote1 : trillNote2,
                    d: 0.06,
                    o: swing(t) + i * 0.08 + slop() * 0.5,
                    v: velHuman(0.3 + (i === 0 ? 0.1 : 0)),
                    x: 0.2
                });
            }
        } else if (improvMode === 3) {
            // sparse harmony - occasional rich chords
            if (rnd() > 0.5) {
                // rootless voicing: 3rd, 5th, 7th, 9th
                const voicings = [2, 4, 6, 8];
                for (let i = 0; i < voicings.length; i++) {
                    n.push({
                        w: piano,
                        p: scale[root + voicings[i]] + 24,
                        d: 0.5,
                        o: swing(t) + slop(),
                        v: velHuman(0.28),
                        x: 0.2
                    });
                }
            }
        }
    }

    // occasional passing tone fills between bass hits
    if (!pianoPattern[beat] && rnd() > 0.8) {
        const passingNote = scale[root + 1 + fl(rnd() * 4)] + 24;
        n.push({
            w: piano,
            p: passingNote,
            d: 0.12,
            o: swing(t) + slop(),
            v: velHuman(0.2),
            x: 0.2
        });
    }

    // === BASS ===
    // Uses same patterns as piano (defined above)
    const bassGhost = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1]; // ghost notes for funk
    const bassPattern = pianoPattern; // same as piano
    const bassNote = scale[root + fl(t / 2) % 5];

    if (bassPattern[beat]) {
        // chromatic approach from below on some hits
        const doApproach = rnd() > 0.75 && beat > 0;
        if (doApproach) {
            n.push({
                w: bass,
                id: 'bass',
                p: bassNote - 13, // half step below
                d: 0.08,
                o: -0.12 + slop(),
                v: velHuman(0.35),
                x: -0.2
            });
        }

        // main bass hit with varied velocity
        const isDownbeat = beat === 0 || beat === 6;
        n.push({
            w: bass,
            id: 'bass',
            p: bassNote - 12,
            d: isDownbeat ? 0.35 : 0.2,
            o: swing(t) + slop(),
            v: velHuman(isDownbeat ? 0.7 : 0.55),
            x: -0.2
        });
    }

    // ghost notes for extra funk - steady groove (only skip occasionally)
    if (bassGhost[beat] && rnd() > 0.15) {
        // cycle through pentatonic tones for variety: root, 3rd, 5th
        const ghostTones = [0, 2, 4];
        const ghostIdx = beat % ghostTones.length;
        const ghostNote = scale[root + ghostTones[ghostIdx]] - 12;
        n.push({
            w: bass,
            id: 'bass',
            p: ghostNote,
            d: 0.1,
            o: swing(t) + slop() * 0.8,
            v: velHuman(0.28),
            x: -0.2
        });
    }

    // occasional 16th note pickup before downbeats
    if ((beat === 9 || beat === 5) && rnd() > 0.6) {
        n.push({
            w: bass,
            id: 'bass',
            p: bassNote - 11, // whole step below next root
            d: 0.08,
            o: 0.5 + slop(),
            v: velHuman(0.4),
            x: -0.2
        });
    }

    // === PENTATONIC FILLS ===
    // minor pentatonic: root, b3, 4, 5, b7 (dorian indices: 0, 2, 3, 4, 6)
    const penta = [0, 2, 3, 4, 6].map(i => scale[root + i]);

    // pentatonic run on beat 5 occasionally
    if (beat === 5 && rnd() > 0.75) {
        const runUp = rnd() > 0.5;
        const startIdx = runUp ? 0 : 4;
        for (let i = 0; i < 3; i++) {
            const idx = runUp ? startIdx + i : startIdx - i;
            n.push({
                w: bass,
                id: 'bass',
                p: penta[idx],
                d: 0.07,
                o: swing(t) + i * 0.1 + slop() * 0.4,
                v: velHuman(0.4 - i * 0.04),
                x: -0.2
            });
        }
    }

    // bluesy pentatonic lick every 8 bars on beat 2
    if (bar % 8 === 7 && beat === 2) {
        // classic gospel bass lick: 5 - b7 - root (octave up)
        const lick = [penta[3], penta[4], penta[0] + 12];
        for (let i = 0; i < 3; i++) {
            n.push({
                w: bass,
                id: 'bass',
                p: lick[i],
                d: i === 2 ? 0.2 : 0.08,
                o: swing(t) + i * 0.12 + slop() * 0.3,
                v: velHuman(0.45 + i * 0.05),
                x: -0.2
            });
        }
    }

    // quick pentatonic triplet fill
    if (beat === 8 && bar % 4 === 2 && rnd() > 0.6) {
        for (let i = 0; i < 3; i++) {
            n.push({
                w: bass,
                id: 'bass',
                p: penta[2 + i] - 12, // 4, 5, b7
                d: 0.06,
                o: swing(t) + i * 0.08 + slop() * 0.3,
                v: velHuman(0.35),
                x: -0.2
            });
        }
    }

    // === GOSPEL BASS FILLS ===
    const isPhraseFill = bar % 4 === 3 && beat >= 7; // end of 4-bar phrase
    const isMidFill = bar % 2 === 1 && beat === 4 && rnd() > 0.7; // occasional mid-phrase

    if (isPhraseFill) {
        const fillType = fl(rnd() * 4);
        const fillBeat = beat - 7; // 0, 1, or 2

        if (fillType === 0) {
            // ascending scale run into higher octave
            const runNotes = [0, 2, 4, 5, 7].map(i => scale[root + i]);
            const noteIdx = fl(fillBeat * 1.5);
            if (noteIdx < runNotes.length) {
                n.push({
                    w: bass,
                    id: 'bass',
                    p: runNotes[noteIdx], // higher octave
                    d: 0.12,
                    o: swing(t) + slop() * 0.5,
                    v: velHuman(0.5 + fillBeat * 0.08),
                    x: -0.2
                });
                // add 16th note between
                if (rnd() > 0.4 && noteIdx + 1 < runNotes.length) {
                    n.push({
                        w: bass,
                        id: 'bass',
                        p: runNotes[noteIdx + 1],
                        d: 0.08,
                        o: 0.5 + slop() * 0.5,
                        v: velHuman(0.4),
                        x: -0.2
                    });
                }
            }
        } else if (fillType === 1) {
            // octave jump fill - low to high
            const jumpPattern = [bassNote - 12, bassNote, bassNote + 2];
            n.push({
                w: bass,
                id: 'bass',
                p: jumpPattern[fillBeat],
                d: fillBeat === 2 ? 0.25 : 0.1,
                o: swing(t) + slop() * 0.5,
                v: velHuman(0.55 + fillBeat * 0.1),
                x: -0.2
            });
        } else if (fillType === 2) {
            // smooth descending run from high octave
            const descNotes = [7, 5, 4, 2, 0].map(i => scale[root + i]);
            const noteIdx = fillBeat;
            n.push({
                w: bass,
                id: 'bass',
                p: descNotes[noteIdx],
                d: 0.15,
                o: swing(t) + slop() * 0.5,
                v: velHuman(0.5 - fillBeat * 0.05),
                x: -0.2
            });
        } else {
            // chromatic slide up into next root (gospel flavor)
            const slideNotes = [bassNote - 14, bassNote - 13, bassNote - 12];
            n.push({
                w: bass,
                id: 'bass',
                p: slideNotes[fillBeat],
                d: 0.1,
                o: swing(t) + slop() * 0.3,
                v: velHuman(0.45 + fillBeat * 0.1),
                x: -0.2
            });
        }
    }

    // mid-phrase melodic fill in upper register
    if (isMidFill) {
        // gospel-style melodic moment - jump to high note and back
        const highNote = scale[root + 4] + 12; // 5th up an octave
        n.push({
            w: bass,
            id: 'bass',
            p: highNote,
            d: 0.2,
            o: swing(t) + slop(),
            v: velHuman(0.45),
            x: -0.2
        });
        // grace note slide into it
        n.push({
            w: bass,
            id: 'bass',
            p: highNote - 1,
            d: 0.05,
            o: -0.08 + slop() * 0.3,
            v: velHuman(0.3),
            x: -0.2
        });
    }

    // occasional high register lick (sparse, soulful)
    if (beat === 2 && rnd() > 0.88) {
        const lickNotes = [2, 4, 5].map(i => scale[root + i] + 12); // upper octave
        for (let i = 0; i < 3; i++) {
            n.push({
                w: bass,
                id: 'bass',
                p: lickNotes[i],
                d: 0.08,
                o: swing(t) + i * 0.12 + slop() * 0.5,
                v: velHuman(0.35 - i * 0.03),
                x: -0.2
            });
        }
    }

    return n;
};
