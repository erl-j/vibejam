// Steve Reich inspired 13/8 - open, hopeful, still
// Quartal harmonies (4ths and 5ths), spacious drums

const fl = (t) => Math.floor(t);
const rnd = () => Math.random();
const pick = (arr) => arr[fl(rnd() * arr.length)];

// More human timing - wider variance, breathing
const slop = () => (Math.random() - 0.5) * 0.022;
const breath = () => (Math.random() - 0.3) * 0.035; // tends to push slightly
const velHuman = (base) => {
    const variance = 0.18 + rnd() * 0.15;
    return base * (0.82 + variance);
};

// Dynamic swell over phrases
const swell = (bar, beat, period = 16) => {
    const pos = ((bar % period) * 13 + beat) / (period * 13);
    return 0.85 + Math.sin(pos * Math.PI) * 0.15;
};

const BAR_LENGTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const CYCLE_LEN = 32; // sum of bar lengths

// MIDI channels
const drums = 'm:1';
const bass = 'm:2';
const piano = 'm:3';

// GM drum notes
const KICK = 36, SNARE = 38, RIDE = 51;
const HH_CLOSED = 42, HH_OPEN = 46, CRASH = 49;
const TOM_HIGH = 50, TOM_MID = 47, TOM_LOW = 43, TOM_FLOOR = 41;

// Sparse melody pattern - more space, 3+3+3+2+2 grouping
const MELODY_PATTERN = [
    0, null, null,     // beat 0-2: root, breathe
    3, null, null,     // beat 3-5: 4th above
    0, null, null,     // beat 6-8: return
    4, null,           // beat 9-10: 5th
    null, 3            // beat 11-12: resolve to 4th
];

// Counter melody - even sparser
const MELODY_B = [
    null, null, 4,     // answer
    null, null, null,
    null, 3, null,
    null, null,
    0, null
];

// Build scale - Lydian for hopeful, open sound
const buildScale = (root, intervals) => {
    let s = intervals.map(i => root + i);
    while (s[s.length - 1] < 108) s = s.concat(s.slice(-intervals.length).map(n => n + 12));
    return s;
};

const LYDIAN = [0, 2, 4, 6, 7, 9, 11]; // raised 4th = hopeful

return (t, s) => {
    let n = [];

    // Variable bar length: 1->13->1
    const tInCycle = t % CYCLE_LEN;
    let cumulative = 0, barIdx = 0;
    for (let i = 0; i < BAR_LENGTHS.length; i++) {
        if (tInCycle < cumulative + BAR_LENGTHS[i]) { barIdx = i; break; }
        cumulative += BAR_LENGTHS[i];
    }
    const BAR = BAR_LENGTHS[barIdx];
    const beat = tInCycle - cumulative;
    const bar = fl(t / CYCLE_LEN) * BAR_LENGTHS.length + barIdx;

    const section = fl(bar / 32);
    const dyn = swell(bar, beat, 16);

    // G Lydian - bright, open
    const scale = buildScale(43, LYDIAN); // G = 43

    // Very slow harmonic rhythm - stays mostly on I
    const harmonyRoots = [0, 0, 0, 0, 3, 3, 0, 0]; // I, breathe to IV, back
    const root = harmonyRoots[bar % 8];

    const melodyDegree = MELODY_PATTERN[beat];
    const melodyB = MELODY_B[beat];
    const hasMelody = melodyDegree !== null;
    const hasMelodyB = melodyB !== null;

    // Subtle phase drift
    const phase = (bar % 24) * 0.002;

    // Accent pattern - sparser
    const accentBeats = [0, 6, 9];
    const isAccent = accentBeats.includes(beat);

    // === DRUMS - SPACIOUS, BREATHING ===

    // Ride - only on accents and sparse in between
    const rideBeats = [0, 3, 6, 9, 11];
    if (rideBeats.includes(beat)) {
        // Skip some hits for space
        if (beat === 0 || rnd() > 0.35) {
            n.push({
                w: drums,
                p: RIDE,
                d: 0.12,
                o: breath(),
                v: velHuman((isAccent ? 0.38 : 0.25) * dyn),
                x: 0.5
            });
        }
    }

    // === KICK - follows melody, with space ===

    // Main kick only on primary accents
    if (beat === 0) {
        n.push({
            w: drums,
            p: KICK,
            d: 0.3,
            o: slop() * 0.4,
            v: velHuman(0.62 * dyn),
            x: 0
        });
    }

    // Kick echoes melody on beat 6 and 9
    if ((beat === 6 || beat === 9) && hasMelody && rnd() > 0.4) {
        n.push({
            w: drums,
            p: KICK,
            d: 0.25,
            o: breath(),
            v: velHuman(0.45 * dyn),
            x: 0
        });
    }

    // Gentle kick fill every 8 bars - just 2-3 notes
    if (bar % 8 === 7 && beat >= 11 && rnd() > 0.3) {
        n.push({
            w: drums,
            p: KICK,
            d: 0.22,
            o: slop(),
            v: velHuman(0.42 + (beat - 11) * 0.08),
            x: 0
        });
    }

    // === TOMS - melodic, sparse, follow piano ===

    // Tom only when melody plays, and not every time
    if (hasMelody && bar % 4 >= 2 && rnd() > 0.55) {
        const tomMap = [TOM_FLOOR, TOM_LOW, TOM_MID, TOM_MID, TOM_HIGH];
        const tom = tomMap[melodyDegree] || TOM_MID;
        n.push({
            w: drums,
            p: tom,
            d: 0.14,
            o: breath() + phase,
            v: velHuman(0.32 * dyn),
            x: -0.15
        });
    }

    // Simple tom fill every 16 bars - descending, musical
    if (bar % 16 === 15 && beat >= 9) {
        const toms = [TOM_HIGH, TOM_MID, TOM_LOW, TOM_FLOOR];
        const idx = beat - 9;
        if (idx < toms.length) {
            n.push({
                w: drums,
                p: toms[idx],
                d: 0.15,
                o: slop() * 0.5,
                v: velHuman((0.38 + idx * 0.05) * dyn),
                x: -0.2 + idx * 0.1
            });
        }
    }

    // === SNARE - very sparse, ghostly ===

    // Light cross-stick on beat 5 occasionally
    if (beat === 5 && bar % 2 === 1 && rnd() > 0.6) {
        n.push({
            w: drums,
            p: SNARE,
            d: 0.08,
            o: breath(),
            v: velHuman(0.22 * dyn),
            x: -0.25
        });
    }

    // Crash - very rare, section markers only
    if (beat === 0 && bar > 0 && bar % 32 === 0) {
        n.push({
            w: drums,
            p: CRASH,
            d: 1.2,
            o: slop() * 0.1,
            v: velHuman(0.45),
            x: 0.6
        });
    }

    // === PIANO - OPEN QUARTAL VOICINGS ===

    // Primary melody - high, clear, with space
    if (hasMelody) {
        const note = scale[root + melodyDegree] + 60; // high register
        n.push({
            w: piano,
            p: note,
            d: 0.35, // longer, more sustain
            o: breath() + phase,
            v: velHuman(0.38 * dyn),
            x: 0.25
        });

        // Add a 4th above on accents - quartal voicing
        if (isAccent) {
            n.push({
                w: piano,
                p: note + 5, // perfect 4th
                d: 0.4,
                o: breath() + phase + 0.008,
                v: velHuman(0.30 * dyn),
                x: 0.35
            });
        }
    }

    // Counter melody - lower, softer
    if (hasMelodyB) {
        const noteB = scale[root + melodyB] + 48;
        n.push({
            w: piano,
            p: noteB,
            d: 0.3,
            o: breath() - phase * 0.5,
            v: velHuman(0.32 * dyn),
            x: 0.15
        });
    }

    // Open quartal chord every 8 bars - stacked 4ths
    if (bar % 8 === 0 && beat === 0) {
        // Stacked perfect 4ths from root: root, +5, +10 (4th above 4th)
        const quartalVoicing = [0, 5, 10, 17].map(i => scale[root] + 48 + i);
        for (let i = 0; i < quartalVoicing.length; i++) {
            n.push({
                w: piano,
                p: quartalVoicing[i],
                d: 0.8, // long, ringing
                o: i * 0.02 + breath(),
                v: velHuman((0.32 - i * 0.04) * dyn),
                x: 0.2
            });
        }
    }

    // Occasional open 5th dyad - very hopeful sound
    if (beat === 6 && bar % 4 === 2 && hasMelody) {
        const fifthNote = scale[root + melodyDegree] + 48;
        n.push({
            w: piano,
            p: fifthNote,
            d: 0.5,
            o: breath(),
            v: velHuman(0.28 * dyn),
            x: 0.1
        });
        n.push({
            w: piano,
            p: fifthNote + 7, // perfect 5th
            d: 0.5,
            o: breath() + 0.01,
            v: velHuman(0.25 * dyn),
            x: 0.2
        });
    }

    // === BASS - GROUNDED, SPARSE, FOLLOWS MELODY ===

    // Root on beat 0 - foundation
    if (beat === 0) {
        n.push({
            w: bass,
            id: 'bass',
            p: scale[root] + 31, // low G
            d: 0.6,
            o: slop() * 0.3,
            v: velHuman(0.65 * dyn),
            x: -0.2
        });
    }

    // Bass follows melody on key moments
    if ((beat === 6 || beat === 9) && hasMelody) {
        const bassNote = scale[root + (melodyDegree > 2 ? 4 : 0)] + 31; // root or 5th
        n.push({
            w: bass,
            id: 'bass',
            p: bassNote,
            d: 0.35,
            o: breath(),
            v: velHuman(0.48 * dyn),
            x: -0.2
        });
    }

    // Open 5th in bass register - very occasionally
    if (beat === 3 && bar % 4 === 0 && rnd() > 0.6) {
        const bassRoot = scale[root] + 31;
        n.push({
            w: bass,
            id: 'bass',
            p: bassRoot,
            d: 0.45,
            o: breath(),
            v: velHuman(0.42 * dyn),
            x: -0.3
        });
        n.push({
            w: bass,
            id: 'bass',
            p: bassRoot + 7, // 5th
            d: 0.4,
            o: breath() + 0.015,
            v: velHuman(0.35 * dyn),
            x: -0.1
        });
    }

    // Simple melodic fill at phrase end - stepwise, gentle
    if (bar % 8 === 7 && beat === 12) {
        const fillNote = scale[root + 4] + 31; // 5th
        n.push({
            w: bass,
            id: 'bass',
            p: fillNote,
            d: 0.25,
            o: breath(),
            v: velHuman(0.40 * dyn),
            x: -0.2
        });
    }

    // Ghost notes - very soft, for continuity
    if (beat === 11 && rnd() > 0.7) {
        n.push({
            w: bass,
            id: 'bass',
            p: scale[root + 3] + 31, // 4th - keeping it fourthy
            d: 0.15,
            o: breath(),
            v: velHuman(0.22 * dyn),
            x: -0.2
        });
    }

    return n;
};
