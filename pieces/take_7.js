// Take 7 - 7/4 jazz jam inspired by Take Five
const swingAmt = 0.025;
const slopAmt = 0.018;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.4);
const fl = (t) => Math.floor(t);
const rnd = () => Math.random();
const pick = (arr) => arr[fl(rnd() * arr.length)];
const velHuman = (base) => base * (0.82 + rnd() * 0.36);

const BAR = 14; // 7/4 in eighth notes

// MIDI channels
const drums = 'm:1';
const bass = 'm:2';
const piano = 'm:3';

// GM drum notes
const KICK = 36, SNARE = 38, RIDE = 51, RIDE_BELL = 53;
const HH_CLOSED = 42, HH_OPEN = 46, HH_FOOT = 44, CRASH = 49;
const TOM_HIGH = 50, TOM_MID = 47, TOM_LOW = 43, TOM_FLOOR = 41;

// === ABSTRACTIONS ===

// Pattern maker: returns true if beat matches any in pattern
const inPattern = (beat, pattern) => pattern.includes(beat);

// Note builder with defaults
const note = (w, p, d, o, v, x = 0) => ({ w, p, d, o: o + slop(), v: velHuman(v), x });

// Drum hit with standard humanization
const drum = (p, d, v, o = 0, x = 0) => note(drums, p, d, swing(o) + o, v, x);

// Bass/piano note
const melodic = (ch, p, d, v, o = 0, x = 0) => ({ w: ch, id: ch === bass ? 'bass' : undefined, p, d, o: swing(o) + slop() + o, v: velHuman(v), x });

// Build scale from intervals
const buildScale = (root, intervals) => {
    let s = intervals.map(i => root + i);
    while (s[s.length - 1] < 108) s = s.concat(s.slice(-intervals.length).map(n => n + 12));
    return s;
};

// Dorian intervals
const DORIAN = [0, 2, 3, 5, 7, 9, 10];

return (t, s) => {
    let n = [];
    const bar = fl(t / BAR);
    const beat = t % BAR;
    const phrase = fl(bar / 4);

    // Eb Dorian for that blue note feel
    const scale = buildScale(39, DORIAN); // Eb = 39

    // Chord progression: i - bVII - VI - v (classic modal jazz)
    const roots = [0, 5, 4, 3];
    const root = roots[bar % roots.length];
    const rootNote = scale[root];

    // === DRUMS - sparse, syncopated ===

    // Ride: broken pattern, lots of space
    const rideCore = [0, 4, 9]; // anchor points only
    const rideMaybe = [2, 6, 11, 13]; // probabilistic

    if (inPattern(beat, rideCore)) {
        n.push(drum(RIDE, 0.12, beat === 0 ? 0.32 : 0.22, 0, 0.6));
    } else if (inPattern(beat, rideMaybe) && rnd() > 0.6) {
        n.push(drum(rnd() > 0.85 ? RIDE_BELL : RIDE, 0.08, 0.18, 0, 0.6));
    }

    // Kick: syncopated, not on 1 every bar
    const kickSynco = [3, 8, 11]; // off-beat placements
    const playKickOn1 = bar % 2 === 0; // only every other bar

    if (beat === 0 && playKickOn1) {
        n.push(drum(KICK, 0.25, 0.5, 0, 0));
    } else if (inPattern(beat, kickSynco) && rnd() > 0.55) {
        n.push(drum(KICK, 0.2, 0.35, 0, 0));
    }

    // Snare: cross-stick, sparse ghost notes
    if (beat === 6 && rnd() > 0.3) {
        n.push(drum(SNARE, 0.1, 0.45, 0, -0.2));
    }

    // rare ghost - very soft, unexpected placement
    if (inPattern(beat, [2, 9, 13]) && rnd() > 0.75) {
        n.push(drum(SNARE, 0.04, 0.08 + rnd() * 0.05, 0, -0.3));
    }

    // Hi-hat foot: sparse, breath
    if (beat === 7 && rnd() > 0.4) {
        n.push(drum(HH_FOOT, 0.03, 0.12, 0, -0.4));
    }

    // Subtle fill every 8 bars - just a nudge
    if (bar % 8 === 7 && beat === 12 && rnd() > 0.4) {
        n.push(drum(TOM_LOW, 0.08, 0.28, 0, 0));
    }

    // Crash only every 8 bars, soft
    if (beat === 0 && bar > 0 && bar % 8 === 0) {
        n.push(drum(CRASH, 0.5, 0.35, 0, 0.7));
    }

    // === PIANO - Modal voicings ===

    // Comp pattern: hits on 1, 3, 5, 7 (beats 0, 4, 8, 12)
    const pianoHits = [0, 4, 8, 12];

    if (inPattern(beat, pianoHits)) {
        // Rootless voicing: 3, 5, 7, 9
        const voicing = [2, 4, 6, 8].map(i => scale[root + i] + 24);
        const numVoices = beat === 0 ? 4 : (rnd() > 0.5 ? 3 : 2);

        for (let i = 0; i < numVoices; i++) {
            n.push(melodic(piano, voicing[i], 0.35, 0.32 - i * 0.04, i * 0.012, 0.3));
        }
    }

    // Rhythmic stabs on upbeats
    if (inPattern(beat, [3, 7, 11]) && rnd() > 0.65) {
        const stabNote = scale[root + pick([2, 4, 6])] + 36;
        n.push(melodic(piano, stabNote, 0.12, 0.25, 0, 0.3));
    }

    // === BASS - Walking/modal feel ===

    // Main hits on the 4+3 grouping
    const bassHits = [0, 4, 8, 10, 12];
    const bassNote = scale[root] + 12;

    if (inPattern(beat, bassHits)) {
        const isDown = beat === 0 || beat === 8;

        // Chromatic approach
        if (rnd() > 0.7 && beat > 0) {
            n.push(melodic(bass, bassNote - 1, 0.06, 0.32, -0.1, -0.2));
        }

        // Walking bass - move through chord tones
        const walkIdx = fl(beat / 3) % 4;
        const walkTones = [0, 2, 4, 6];
        const walkNote = scale[root + walkTones[walkIdx]] + 12;

        n.push(melodic(bass, walkNote, isDown ? 0.3 : 0.18, isDown ? 0.65 : 0.48, 0, -0.2));
    }

    // Ghost notes for groove
    const bassGhost = [2, 6, 9];
    if (inPattern(beat, bassGhost) && rnd() > 0.25) {
        const ghostTone = scale[root + pick([0, 2, 4])] + 12;
        n.push(melodic(bass, ghostTone, 0.08, 0.22, 0, -0.2));
    }

    // Pentatonic fills at phrase ends
    const penta = [0, 2, 3, 4, 6].map(i => scale[root + i] + 12);

    if (bar % 4 === 3 && beat === 10 && rnd() > 0.5) {
        for (let i = 0; i < 4; i++) {
            const runNote = penta[rnd() > 0.5 ? i : 4 - i];
            n.push(melodic(bass, runNote, 0.07, 0.38 - i * 0.04, i * 0.1, -0.2));
        }
    }

    // High melodic moment every 8 bars
    if (bar % 8 === 6 && beat === 4) {
        const highNote = scale[root + 4] + 24;
        n.push(melodic(bass, highNote - 1, 0.04, 0.28, -0.06, -0.2));
        n.push(melodic(bass, highNote, 0.25, 0.42, 0, -0.2));
    }

    return n;
};

