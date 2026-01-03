// Trip hop - dark, moody, ghost note heavy
const swingAmt = 0.018;
const slopAmt = 0.008;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.6);

const BAR = 16;

// Samples
const kick = 'kick:2';
const kickSub = 'kick && sub:0';
const snare = 'snare:5';
const snareGhost = 'snare:1';
const rimshot = 'rim || rimshot:0';
const hat = 'hat:3';
const openHat = 'hat:7';
const shaker = 'shaker:0';
const bass = 'bass && sub:1';
const darkPad = 'pad && dark:0';
const vinyl = 'vinyl || crackle || noise:0';
const strings = 'strings || string:2';
const piano = 'piano && dark:0';
const crash = 'crash:2';

// Cm - Fm - Ab - Gm (dark minor progression)
const roots = [36, 36, 41, 41, 44, 44, 43, 43]; // C2 C2 F2 F2 Ab2 Ab2 G2 G2
const chords = [
    [48, 51, 55],  // Cm
    [48, 51, 55],  // Cm  
    [41, 44, 48],  // Fm
    [41, 44, 48],  // Fm
    [44, 48, 51],  // Ab
    [44, 48, 51],  // Ab
    [43, 46, 50],  // Gm
    [43, 46, 50],  // Gm
];

return (t, s) => {
    const n = [];
    const bar = Math.floor(t / BAR);
    const bt = t % BAR;
    const phrase = bar % 8;
    const section = Math.floor(bar / 16) % 3;
    const chordIdx = bar % 8;
    const root = roots[chordIdx];
    const chord = chords[chordIdx];

    const darkness = 0.85 + section * 0.05;

    // === VINYL CRACKLE - constant atmosphere ===
    if (bt === 0 && bar % 2 === 0) {
        n.push({ w: vinyl, v: 0.18, d: 4.0, r: 0.1, o: 0, start: (bar % 10) * 0.08 });
    }

    // === KICK - half time feel ===
    if (bt === 0) {
        n.push({ w: kick, v: 1.2 * darkness, d: 0.55, o: slop() });
        n.push({ w: kickSub, v: 0.8, d: 0.7, o: 0.02 });
    }
    // lazy kick on 10 (pushed late)
    if (bt === 10) {
        n.push({ w: kick, v: 1.0, d: 0.45, o: 0.04 + slop() });
    }
    // occasional ghost kick
    if (bt === 6 && phrase % 4 === 3) {
        n.push({ w: kick, v: 0.5, d: 0.35, o: slop() });
    }

    // === SNARE - main hit on 8 (half time) ===
    if (bt === 8) {
        n.push({ w: snare, v: 1.25 * darkness, d: 0.38, r: 0.22, o: slop() });
    }

    // === GHOST NOTES - the heart of trip hop ===
    // soft ghost before the one
    if (bt === 15) {
        n.push({ w: snareGhost, v: 0.18 + Math.random() * 0.08, d: 0.12, r: 0.35, o: swing(bt) + slop() });
    }
    // drag ghost after the one  
    if (bt === 2) {
        n.push({ w: snareGhost, v: 0.22 + Math.random() * 0.06, d: 0.14, r: 0.3, o: 0.03 + slop() });
    }
    // cluster before snare hit
    if (bt === 6) {
        n.push({ w: snareGhost, v: 0.15 + Math.random() * 0.1, d: 0.1, r: 0.28, o: swing(bt) + slop() });
    }
    if (bt === 7) {
        n.push({ w: snareGhost, v: 0.25 + Math.random() * 0.08, d: 0.13, r: 0.25, o: slop() });
    }
    // drag after main snare
    if (bt === 9) {
        n.push({ w: snareGhost, v: 0.2 + Math.random() * 0.05, d: 0.11, r: 0.32, o: 0.025 + slop() });
    }
    // late phrase ghosts
    if (bt === 11) {
        n.push({ w: snareGhost, v: 0.16 + Math.random() * 0.08, d: 0.1, r: 0.3, o: swing(bt) + slop() });
    }
    if (bt === 13) {
        n.push({ w: snareGhost, v: 0.19 + Math.random() * 0.07, d: 0.12, r: 0.28, o: slop() });
    }
    // extra ghost density in later sections
    if (section >= 1 && bt === 4) {
        n.push({ w: snareGhost, v: 0.14 + Math.random() * 0.06, d: 0.1, r: 0.35, o: slop() });
    }
    if (section >= 2 && bt === 3) {
        n.push({ w: rimshot, v: 0.2, d: 0.08, r: 0.2, o: swing(bt) + slop() });
    }

    // === HI-HATS - sparse, moody ===
    if (bt % 4 === 2) {
        n.push({ w: hat, v: 0.28 + Math.random() * 0.1, d: 0.06, o: swing(bt) + slop() });
    }
    if (bt === 6 || bt === 14) {
        n.push({ w: openHat, v: 0.35, d: 0.25, o: swing(bt) });
    }
    // occasional shaker texture
    if (bt % 2 === 1 && phrase >= 4) {
        n.push({ w: shaker, v: 0.12, d: 0.08, o: slop() });
    }

    // === BASS - dark, subby ===
    if (bt === 0) {
        n.push({ w: bass, v: 4.2 * darkness, d: 1.2, o: 0.03, p: root, start: 0 });
    }
    if (bt === 10) {
        n.push({ w: bass, v: 3.6, d: 0.7, o: 0.05, p: root + 7, start: 0.02 }); // fifth
    }
    // chromatic walk on phrase end
    if (bt === 14 && phrase % 2 === 1) {
        const nextRoot = roots[(chordIdx + 1) % 8];
        n.push({ w: bass, v: 3.0, d: 0.4, o: slop(), p: nextRoot - 1, start: 0.05 });
    }

    // === DARK PAD - sustained atmosphere ===
    if (bt === 0 && bar % 4 === 0) {
        n.push({ w: darkPad, v: 0.35, d: 4.5, r: 0.55, o: 0, p: chord[1], start: (bar % 8) * 0.08 });
    }

    // === STRINGS - tension ===
    if (bt === 0 && bar % 8 === 4) {
        n.push({ w: strings, v: 0.28, d: 5.5, r: 0.5, o: 0, p: chord[0] + 12, start: 0.1 });
    }

    // === PIANO - sparse, haunting ===
    if (bt === 0 && bar % 4 === 2) {
        n.push({ w: piano, v: 0.4, d: 1.8, r: 0.45, o: slop(), p: chord[2] + 12 });
    }
    if (bt === 8 && bar % 8 === 5) {
        n.push({ w: piano, v: 0.32, d: 1.2, r: 0.4, o: 0.02, p: chord[0] + 24 });
    }

    // === CRASH on long phrases ===
    if (bt === 0 && bar % 16 === 0) {
        n.push({ w: crash, v: 0.7, d: 2.5, r: 0.45, o: 0 });
    }

    // === SNARE ROLL for transitions ===
    if (bar % 8 === 7 && bt >= 12) {
        const step = bt - 12;
        n.push({ w: snareGhost, v: 0.3 + step * 0.12, d: 0.14, r: 0.2, o: swing(bt) * 0.5 });
    }

    return n;
};

