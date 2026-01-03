// Sigma grind phonk - dark, aggressive, cowbell-driven.
const swingAmt = 0.008;
const slopAmt = 0.004;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.3);

const BAR = 16;

// Samples
const kick = 'kick:3';
const kickHard = 'kick:7';
const snare = 'snare:4';
const clap = 'clap:2';
const hat = 'hat:1';
const openHat = 'hat:8';
const bass808 = '808 && bass:2';
const cowbell = 'cowbell:15';
const crash = 'crash:5';
const vox = 'vocal || shout:3';
const darkPad = 'pad || dark || synth:0';
const riser = 'rise || sweep:0';
const tomHi = 'tom:0';
const tomMid = 'tom:3';
const tomLow = 'tom:6';
const tomFloor = 'tom:9';

// Key: C minor (C Eb F G Ab Bb)
// Progression: i - i - bVI - bVII - i - i - iv - v
// C minor = dark, aggressive sigma energy

// Bass roots (octave up: C3 = 48)
const bassRoots = [48, 48, 44, 46, 48, 48, 41, 43]; // Cm Cm Ab Bb Cm Cm Fm Gm

// Chord tones for each chord (for cowbell arpeggios)
const chordTones = [
    [48, 51, 55],  // Cm: C Eb G
    [48, 51, 55],  // Cm
    [44, 48, 51],  // Ab: Ab C Eb
    [46, 50, 53],  // Bb: Bb D F
    [48, 51, 55],  // Cm
    [48, 51, 55],  // Cm
    [41, 44, 48],  // Fm: F Ab C
    [43, 46, 50],  // Gm: G Bb D
];

// Tension notes (add color - 7ths and 9ths)
const tensions = [
    [50, 58],  // Cm: Bb7, D9
    [50, 58],  // Cm
    [43, 51],  // Ab: G7, Eb9
    [45, 53],  // Bb: A7, F9
    [50, 58],  // Cm
    [50, 58],  // Cm
    [39, 48],  // Fm: Eb7, C9
    [41, 50],  // Gm: F7, D9
];

return (t, s) => {
    const n = [];
    const bar = Math.floor(t / BAR);
    const bt = t % BAR;
    const phrase = bar % 8;
    const section = Math.floor(bar / 8) % 4;
    const fillBar = bar % 4 === 3;
    const dropBar = bar % 8 === 0;

    // Intensity ramps up across sections
    const intensity = 0.9 + section * 0.08;

    // === KICK PATTERN - half time feel ===
    if (bt === 0 || bt === 10) {
        n.push({ w: kick, v: 1.4 * intensity, d: 0.5, o: slop() });
    }
    // Extra kick hits for aggression
    if (bt === 6 && phrase >= 4) {
        n.push({ w: kickHard, v: 1.2, d: 0.4, o: slop() });
    }

    // === SNARE/CLAP on 8 - half time backbeat ===
    if (bt === 8) {
        n.push({ w: snare, v: 1.3 * intensity, d: 0.35, r: 0.15, o: slop() });
        n.push({ w: clap, v: 1.1, d: 0.28, r: 0.2, o: slop() + 0.005 });
    }

    // === HI-HATS - trap rolls ===
    // Base 8th note hats
    if (bt % 2 === 0) {
        n.push({ w: hat, v: 0.45 * intensity, d: 0.05, o: swing(bt) + slop() });
    }
    // 16th note rolls on certain beats
    if ((bt >= 4 && bt <= 7) || (bt >= 12 && bt <= 15)) {
        n.push({ w: hat, v: 0.32, d: 0.04, o: swing(bt) + slop() });
    }
    // Triple hi-hat roll before snare
    if (bt === 7) {
        n.push({ w: hat, v: 0.5, d: 0.03, o: -0.02 });
        n.push({ w: hat, v: 0.55, d: 0.03, o: 0.15 });
        n.push({ w: hat, v: 0.6, d: 0.03, o: 0.32 });
    }
    // Open hat accent
    if (bt === 4 || bt === 12) {
        n.push({ w: openHat, v: 0.65, d: 0.2, o: swing(bt) });
    }

    // === 808 BASS - chord root based ===
    const chordIdx = bar % 8;
    const root = bassRoots[chordIdx];
    const chord = chordTones[chordIdx];
    const tens = tensions[chordIdx];

    if (bt === 0) {
        n.push({ w: bass808, v: 5.5 * intensity, d: 0.8, o: 0.02, p: root, start: 0 });
    }
    // Fifth on beat 6, third on beat 10 (proper voice leading)
    if (bt === 6) {
        n.push({ w: bass808, v: 4.8, d: 0.5, o: 0.01, p: chord[2] - 12, start: 0.05 }); // 5th below
    }
    if (bt === 10) {
        n.push({ w: bass808, v: 4.6, d: 0.45, o: 0.01, p: chord[1] - 12, start: 0.05 }); // 3rd below
    }
    // Chromatic approach on phrase endings
    if (bt === 14 && phrase % 2 === 1) {
        const nextRoot = bassRoots[(chordIdx + 1) % 8];
        const approach = nextRoot > root ? nextRoot - 1 : nextRoot + 1; // half step below/above
        n.push({ w: bass808, v: 4.2, d: 0.35, o: -0.01, p: approach, start: 0.08 });
    }

    // === COWBELL - arpeggiated chord tones ===
    // Root on 2, fifth on 6, third on 10, tension on 14
    if (bt === 2) {
        n.push({ w: cowbell, v: 0.9 * intensity, d: 0.22, o: swing(bt) + 0.015, p: chord[0] + 12 }); // root up octave
    }
    if (bt === 6) {
        n.push({ w: cowbell, v: 0.75, d: 0.18, o: swing(bt), p: chord[2] + 12 }); // fifth
    }
    if (bt === 10) {
        n.push({ w: cowbell, v: 0.85, d: 0.2, o: swing(bt) + 0.01, p: chord[1] + 12 }); // third (minor!)
    }
    if (bt === 14) {
        n.push({ w: cowbell, v: 0.7, d: 0.16, o: swing(bt), p: tens[0] + 12 }); // 7th tension
    }
    // Extra cowbell stabs in the drop - upper extensions
    if (section >= 2 && (bt === 4 || bt === 12)) {
        n.push({ w: cowbell, v: 0.6, d: 0.15, o: 0.02, p: tens[1] + 12 }); // 9th for color
    }

    // === DARK PAD - plays the minor third for darkness ===
    if (bt === 0 && bar % 4 === 0) {
        n.push({ w: darkPad, v: 0.4, d: 3.5, r: 0.6, o: 0, p: chord[1] + 12, start: (bar % 6) * 0.1 });
    }

    // === CRASH on phrase starts ===
    if (bt === 0 && dropBar) {
        n.push({ w: crash, v: 1.0, d: 2.0, r: 0.35, o: 0 });
    }

    // === VOCAL CHOPS - aggression ===
    if (bt === 0 && bar % 4 === 2) {
        n.push({ w: vox, v: 0.7, d: 0.4, o: 0, start: (bar % 5) * 0.15 });
    }
    if (bt === 8 && phrase === 7) {
        n.push({ w: vox, v: 0.85, d: 0.5, o: 0.02, start: 0.3 });
    }

    // === FILLS ===
    // Snare roll fill
    if (fillBar && bt >= 12) {
        const step = bt - 12;
        n.push({ w: snare, v: 0.5 + step * 0.18, d: 0.15, o: swing(bt) * 0.4 });
    }
    // Rising tension before drop
    if (bar % 8 === 7 && bt === 0) {
        n.push({ w: riser, v: 0.55, d: 3.8, r: 0.4, o: 0 });
    }

    // === EPIC TOM FILLS ===
    const preDropBar = bar % 8 === 7;
    const bigFillBar = bar % 16 === 15;

    // Descending tom cascade before drops (bar 7 of each 8)
    if (preDropBar) {
        const toms = [tomHi, tomHi, tomMid, tomMid, tomLow, tomLow, tomFloor, tomFloor];
        if (bt >= 8) {
            const tomIdx = bt - 8;
            const vol = 0.7 + (tomIdx * 0.08);
            n.push({ w: toms[tomIdx], v: vol * intensity, d: 0.25, r: 0.12, o: slop() });
        }
    }

    // Epic 16th note tom roll on every 16th bar (big moments)
    if (bigFillBar && bt >= 4) {
        const pattern = [tomHi, tomHi, tomMid, tomMid, tomMid, tomLow, tomLow, tomFloor, tomFloor, tomFloor, tomFloor, tomFloor];
        const tomIdx = bt - 4;
        if (tomIdx < pattern.length) {
            const vol = 0.6 + (tomIdx * 0.06);
            n.push({ w: pattern[tomIdx], v: vol, d: 0.22, r: 0.15, o: slop() * 0.5 });
        }
    }

    // Accent tom hits on beat 4 every other bar for groove
    if (bt === 4 && bar % 2 === 1 && !fillBar) {
        n.push({ w: tomMid, v: 0.55, d: 0.3, r: 0.1, o: swing(bt) });
    }

    // Floor tom boom on the drop
    if (dropBar && bt === 0) {
        n.push({ w: tomFloor, v: 1.1, d: 0.6, r: 0.25, o: 0.01 });
    }

    // Triplet tom stutter (beat 15 of fill bars)
    if (fillBar && bt === 15) {
        n.push({ w: tomLow, v: 0.8, d: 0.15, o: 0 });
        n.push({ w: tomLow, v: 0.85, d: 0.15, o: 0.18 });
        n.push({ w: tomFloor, v: 0.95, d: 0.2, o: 0.36 });
    }

    return n;
};

