
const transpose = 0; // global transpose

return (t, s) => {
    let n = [];
    const T = transpose; // shorthand

    if (t % 32 === 0) n.push({ p: 60 + T, d: 8, w: 'rain:0', v: 0.5 });

    const chords = [
        [48, 51, 55, 58, 62, 51], // Cm9
        [48, 51, 55, 58, 62, 51], // Cm9
        [48, 51, 55, 58, 62, 51], // Cm9
        [48, 51, 55, 58, 62, 51], // Cm9
        [41, 50, 53, 55, 58, 62], // Gm7
        [41, 50, 53, 55, 58, 62], // Gm7
        [44, 48, 51, 55, 60, 51], // Abmaj7 (resolves home)
        [41, 48, 51, 57, 60, 51], // F7 (smooth back to Cm)
    ];

    const arp = chords[Math.floor(t / 16) % chords.length].map(p => p + T);
    const pat = [1, 0, 1, 2, 0, 3, 0, 1, 1, 0, 1, 0, 1, 3, 0, 2];

    const fx = (note) => {
        const out = [
            { ...note, p: note.p - 0.08, x: -0.5, v: note.v * 0.5 },
            note,
            { ...note, p: note.p + 0.08, x: 0.5, v: note.v * 0.5 },
        ];
        // delay taps
        out.push({ ...note, o: (note.o || 0) + 4, v: note.v * 0.4, x: -0.7 });
        out.push({ ...note, o: (note.o || 0) + 8, v: note.v * 0.2, x: 0.7 });
        return out;
    };

    const p = pat[t % 16];
    const breath = 0.5 + 0.5 * Math.sin(s * 0.3); // slow swell
    const cutoffMod = 600 + 800 * Math.sin(s * 0.2); // filter breathes
    const base = { p: arp[(t * 2) % 8], w: 'sawtooth', v: 0.2 + 0.15 * breath };

    if (p === 1) fx({ ...base, d: 4.0, c: cutoffMod }).forEach(x => n.push(x));
    if (p === 2) for (let i = 0; i < 2; i++) fx({ ...base, d: 0.1, c: cutoffMod * 0.7, o: i * 0.5 }).forEach(x => n.push(x));
    if (p === 3) for (let i = 0; i < 3; i++) fx({ ...base, d: 0.1, c: cutoffMod * 1.5, o: i / 3 }).forEach(x => n.push(x));

    // pad enters after 2 cycles, holds chord tones
    if (t >= 128 && t % 16 === 0) {
        const padVol = Math.min(0.15, (t - 128) / 500); // slow fade in
        n.push({ p: arp[0], d: 4, w: 'sine', v: padVol, r: 0.6, a: 0.5 });
        n.push({ p: arp[2], d: 4, w: 'sine', v: padVol * 0.8, r: 0.6, a: 0.5 });
        n.push({ p: arp[4] + 12, d: 4, w: 'sine', v: padVol * 0.6, r: 0.6, a: 0.5 });
    }

    const p2 = [
        0, 2, 1, 1,
        0, 1, 1, 0,
        0, 0, 1, 2,
        1, 0, 1, 5
    ];
    const deg = p2[t % 16];
    if (deg) n.push({ p: arp[(deg - 1) % arp.length] - 12, d: deg === 1 ? 1.1 : 0.2, w: 'sawtooth', c: 2000, v: 1.0, id: "bass" });

    // ballad rock drums - human microtiming and dynamics
    const bar = t % 32;
    const swing = 0.03 * Math.sin(t * 0.7); // subtle push/pull
    const velVar = () => 0.9 + 0.2 * Math.random(); // slight velocity variation

    if (bar === 0) n.push({ w: 'gate & kick:4', v: 0.75 * velVar(), d: 10 });
    if (bar === 12) n.push({ w: 'gate & kick:4', v: 0.5 * velVar(), d: 10, o: 0.05 }); // pushed slightly late
    if (bar === 8) n.push({ p: 60, d: 0.3, w: 'gated snare:0', v: 1.0 * velVar(), r: 6, o: swing });
    if (bar === 24) n.push({ p: 60, d: 0.3, w: 'gated snare:0', v: 1.15 * velVar(), r: 6, o: -0.02 }); // slightly early, stronger
    if (bar === 20) n.push({ p: 38, w: 'drums', v: 0.25 * velVar(), o: 0.04 }); // ghost snare
    if (bar === 4) n.push({ p: 46, w: 'drums', v: 0.2 * velVar(), o: swing }); // open hat breathes

    // counter arp - offbeat, descending, opposite pan
    const p3 = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0];
    if (p3[t % 16]) {
        const idx = (7 - t) % 6; // descends while main ascends
        n.push({ p: arp[idx] + 12, d: 0.4, w: 'triangle', v: 0.2, x: -Math.sin(s * 0.5), c: 1500 });
    }

    // sparse fill - just 3 intentional hits
    const toms = [67, 60, 52];
    if (t % 64 === 56) n.push({ p: toms[0], d: 0.4, w: 'gate & tom:0', v: 0.6, x: -0.5, r: 0.4 });
    if (t % 64 === 60) n.push({ p: toms[1], d: 0.4, w: 'gate & tom:0', v: 0.7, x: 0, r: 0.4 });
    if (t % 64 === 62) n.push({ p: toms[2], d: 0.5, w: 'gate & tom:0', v: 0.8, x: 0.5, r: 0.4 });

    return n;
};
