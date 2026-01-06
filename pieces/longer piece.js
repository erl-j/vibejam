
return (t, s) => {
    const n = [];
    const T = 8;
    const D = 1.0;
    const W = ['serum:40'];
    const P = ["sine"];
    const K = 'grain:0';
    const S = 'grain:2';
    const H = 'click || wood:3';
    const G = 'glitch:7';
    const R = 'ride || cymbal:0';
    const B = 'sawtooth';
    const BAR = 12;
    const LOOP = 256 * BAR;
    const b = t % LOOP;
    const bar = b / BAR | 0;
    const step = b % BAR;
    const phrase = bar % 8;
    const section = bar / 32 | 0; // 8 sections of 32 bars each

    // === MACRO STRUCTURE ===
    // 0-31:   Emergence (sparse, textural)
    // 32-63:  First Theme (melody enters)
    // 64-95:  Development (complexity builds)
    // 96-111: Breakdown 1 (strip down, tension)
    // 112-143: Drop 1 (full energy)
    // 144-175: Second Theme (new melody, counter-melodies)
    // 176-191: Breakdown 2 (drum solo, filter sweep)
    // 192-223: Final Drop (maximum chaos)
    // 224-255: Deconstruction (fade, fragments)

    const isBreakdown = (bar >= 96 && bar < 112) || (bar >= 176 && bar < 192);
    const isDrop = (bar >= 112 && bar < 144) || (bar >= 192 && bar < 224);
    const isOutro = bar >= 224;

    // Dynamic energy with section-specific curves
    const sectionEnergy = [0.2, 0.5, 0.7, 0.3, 1.0, 0.8, 0.4, 1.0][section];
    const phraseBreath = Math.sin((phrase / 8) * Math.PI);
    const energy = sectionEnergy * (0.7 + 0.3 * phraseBreath) * (isOutro ? Math.max(0, 1 - (bar - 224) / 32) : 1);

    // Filter sweep during breakdowns
    const filterMod = isBreakdown ? (0.3 + 0.7 * ((bar % 16) / 16)) : 1;
    const baseFilter = 800 + 2200 * energy * filterMod;

    // Reverb: washes at phrase ends, breakdowns
    const reverb = isBreakdown ? 0.7 : (phrase >= 6 ? 0.5 : 0.15);

    // === INSTRUMENTS ===
    const synth = (p, d = 0.8, v = 0.35, pan = 0) => W.forEach(wave =>
        n.push({
            p: p + T, d: d * D, w: wave,
            v: v * energy,
            a: 0.01, r: reverb,
            c: baseFilter,
            x: pan
        }));

    const pad = (p, d = 6, v = 0.04) => P.forEach(wave =>
        [0, 7, 12].forEach((off, i) =>
            n.push({
                p: p + T + off, d: d * D, w: wave,
                v: v * energy * (1 - i * 0.2) / P.length,
                a: 1.0, r: 0.8
            })));

    const bass = (p, v = 0.5) => n.push({
        p: p + T - 24, v: v * energy, d: 0.4 * D,
        w: B, a: 0.01, r: 0.05, c: 200 + 600 * energy
    });

    const drum = (w, v = 0.5, p = 60, d = 0.1, o = 0, x = 0, rv = 0.1) =>
        n.push({ w, v: v * energy, p, d, r: rv, o, x });

    const roll = (w, v, p, len, dir = 1) => {
        const reps = [4, 6, 8, 12, 16, 24][Math.random() * 6 | 0];
        for (let i = 0; i < reps; i++) {
            const decay = 1 - (i / reps) * 0.6;
            const pan = (i / reps - 0.5) * 2 * dir;
            drum(w, v * decay, p + i * 0.5, 0.03, (i / reps) * len, pan, 0.3);
        }
    };

    const stutter = (w, v, p, reps = 6) => {
        const slice = Math.random() * 0.8;
        for (let i = 0; i < reps; i++) drum(w, v, p, 0.015, i / (reps * 6), (Math.random() - 0.5) * 2, 0.05);
    };

    // === CHORD PROGRESSIONS ===
    const chords = {
        Am: [45, 48, 52, 57], Dm: [50, 53, 57, 62], Em: [52, 55, 59, 64],
        F: [53, 57, 60, 65], G: [55, 59, 62, 67], C: [48, 52, 55, 60],
        Am7: [45, 48, 52, 55], Fmaj7: [53, 57, 60, 64]
    };
    const prog1 = ['Am', 'F', 'C', 'G'];
    const prog2 = ['Dm', 'Am7', 'Fmaj7', 'Em'];
    const currentProg = section < 4 ? prog1 : prog2;
    const chord = chords[currentProg[(bar / 8 | 0) % 4]];
    const root = chord[0];

    // === MELODIES ===
    const melodyA = [0, 3, 5, 7, 8, 7, 5, 3, 0, -2, 0, 3];
    const melodyB = [12, 10, 8, 7, 5, 3, 5, 7, 8, 10, 12, 15];
    const counterMel = [7, 5, 3, 0, -2, 0, 3, 5, 7, 8, 7, 5];

    // === SECTION LOGIC ===

    // Section 0-1: Emergence (sparse textures, single notes)
    if (section === 0) {
        if (bar >= 8 && step === 0 && phrase % 2 === 0) synth(root + 12, 3, 0.2);
        if (bar >= 16 && b % 24 === 0) pad(root, 8, 0.02);
        if (bar >= 24 && [0, 6].includes(step)) bass(root, 0.3);
    }

    // Section 1: First Theme (melody enters gradually)
    if (section === 1) {
        const mel = melodyA[step];
        if (phrase < 4) {
            if ([0, 3, 6, 9].includes(step)) synth(root + 12 + mel, 0.4, 0.25, (step / 6 - 1) * 0.3);
        } else {
            synth(root + 12 + mel, 0.3, 0.3, (step / 6 - 1) * 0.4);
        }
        if (b % 24 === 0) pad(root, 6, 0.03);
        if ([0, 4, 7, 10].includes(step)) bass(root, 0.4);
    }

    // Section 2: Development (full melody, arpeggios)
    if (section === 2) {
        const mel = phrase % 2 === 0 ? melodyA[step] : melodyB[step];
        synth(root + 12 + mel, 0.25, 0.35, Math.sin(step * 0.5) * 0.5);

        // Arpeggio layer
        if (bar >= 72) {
            const arpNote = chord[step % 4];
            synth(arpNote + 24, 0.15, 0.15, -Math.sin(step * 0.5) * 0.5);
        }

        if (b % 24 === 0) pad(root, 6, 0.04);
        if ([0, 3, 6, 10].includes(step)) bass(root, 0.5);
    }

    // Section 3: Breakdown 1 (strip down, filter sweep, tension)
    if (section === 3) {
        // Only pads and sparse hits
        if (b % 48 === 0) pad(root, 12, 0.05);

        // Tension: rising notes
        if (bar >= 104 && step === 0) {
            const rise = (bar - 104) * 2;
            synth(root + rise, 2, 0.2 * filterMod, 0);
        }
    }

    // Section 4: Drop 1 (full energy, driving rhythm)
    if (section === 4) {
        const mel = melodyA[step];
        synth(root + 12 + mel, 0.2, 0.4, Math.sin(step * 0.8) * 0.6);

        // Counter-melody enters
        if (bar >= 120) {
            const cMel = counterMel[step];
            synth(root + 24 + cMel, 0.15, 0.2, -Math.sin(step * 0.8) * 0.6);
        }

        // Stabs on accents
        if ([0, 6].includes(step) && phrase % 2 === 0) {
            chord.forEach((p, i) => synth(p + 12, 0.1, 0.15 / (i + 1), (i - 1.5) * 0.3));
        }

        if (step % 2 === 0) bass(root, 0.6);
        if (b % 12 === 0) pad(root, 4, 0.03);
    }

    // Section 5: Second Theme (new progression, call & response)
    if (section === 5) {
        const mel = melodyB[(step + phrase) % 12];
        const call = phrase % 2 === 0;

        if (call) {
            synth(root + 12 + mel, 0.3, 0.35, -0.4);
        } else {
            // Response: inverted, delayed
            synth(root + 24 - mel / 2, 0.25, 0.25, 0.4);
        }

        // Polyrhythmic layer (5 against 12)
        if (bar >= 152 && (step * 5) % 12 < 5) {
            synth(chord[(step * 5 / 12 | 0) % 4] + 24, 0.1, 0.15, Math.sin(b * 0.2) * 0.7);
        }

        if ([0, 4, 7, 10].includes(step)) bass(root, 0.5);
        if (b % 24 === 0) pad(root, 6, 0.04);
    }

    // Section 6: Breakdown 2 (drum solo territory, filter sweep)
    if (section === 6) {
        // Sparse melodic fragments
        if (step === 0 && phrase % 4 === 0) {
            synth(root + 24, 4, 0.25 * filterMod, 0);
        }
        // Pad swells
        if (b % 48 === 0) pad(root, 12, 0.06 * filterMod);
    }

    // Section 7: Final Drop (maximum chaos, then deconstruction)
    if (section === 7) {
        if (bar < 224) {
            // Maximum intensity
            const mel = melodyA[step];
            const cMel = counterMel[(step + 3) % 12];
            synth(root + 12 + mel, 0.15, 0.45, Math.sin(step) * 0.7);
            synth(root + 24 + cMel, 0.1, 0.25, -Math.sin(step) * 0.7);

            // Chord stabs
            if (step % 3 === 0) {
                chord.forEach((p, i) => synth(p + 12, 0.08, 0.1, (Math.random() - 0.5) * 2));
            }

            if (step % 2 === 0) bass(root, 0.7);
        } else {
            // Deconstruction: fragments fade
            if (Math.random() < 0.3 * energy) {
                synth(chord[Math.random() * 4 | 0] + 24, 0.5, 0.2, (Math.random() - 0.5) * 2);
            }
            if (bar % 4 === 0 && step === 0) pad(root, 8, 0.03);
        }
    }

    // === DRUMS ===
    const drumEnergy = Math.min(1, section * 0.15 + 0.1) * (isBreakdown ? 0.5 : 1) * (isDrop ? 1.3 : 1);
    const vel = drumEnergy * (1 + 0.2 * phraseBreath);

    // Drum patterns per section
    const kickPatterns = {
        sparse: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        basic: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        driving: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        syncopated: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
        breakcore: [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1]
    };
    const snarePatterns = {
        sparse: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        basic: [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
        driving: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
        offbeat: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        chaos: [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1]
    };

    const kickPat = [
        kickPatterns.sparse, kickPatterns.basic, kickPatterns.syncopated,
        kickPatterns.sparse, kickPatterns.driving, kickPatterns.syncopated,
        kickPatterns.breakcore, kickPatterns.breakcore
    ][section];
    const snarePat = [
        snarePatterns.sparse, snarePatterns.sparse, snarePatterns.basic,
        snarePatterns.offbeat, snarePatterns.driving, snarePatterns.offbeat,
        snarePatterns.chaos, snarePatterns.chaos
    ][section];

    // Base drums
    if (bar >= 4 && kickPat[step]) {
        drum(K, 0.9 * vel, 46 + Math.random() * 4, 0.2, 0, (Math.random() - 0.5) * 0.2, reverb);
    }
    if (bar >= 16 && snarePat[step]) {
        drum(S, 0.7 * vel, 58 + Math.random() * 8, 0.1, 0, (Math.random() - 0.5) * 0.4, reverb);
    }

    // Hi-hats (evolve density)
    if (bar >= 24) {
        const hatDensity = section < 3 ? 6 : (section < 5 ? 3 : (isDrop ? 1 : 2));
        if (step % hatDensity === 0) {
            const open = step === 6 && section > 2;
            drum(H, (0.15 + Math.random() * 0.1) * vel, 72 + Math.random() * 20, open ? 0.2 : 0.05, 0, Math.random() * 2 - 1, open ? 0.4 : 0.1);
        }
    }

    // Rides (on melodic accents)
    if (bar >= 40 && section !== 3 && section !== 6) {
        if ([0, 4, 7].includes(step) && phrase % 2 === 0) {
            drum(R, 0.25 * vel, 75, 0.5, 0, 0, 0.5);
        }
    }

    // Glitch elements (increase with sections)
    const glitchChance = [0, 0.02, 0.05, 0.15, 0.1, 0.08, 0.25, 0.2][section];
    if (Math.random() < glitchChance) {
        const choice = Math.random();
        if (choice < 0.4) roll(S, 0.4 * vel, 60 + Math.random() * 30, 0.3, Math.random() > 0.5 ? 1 : -1);
        else if (choice < 0.7) stutter(G, 0.3 * vel, 80 + Math.random() * 40);
        else roll(K, 0.5 * vel, 40 + Math.random() * 20, 0.2, 0);
    }

    // Phrase-end fills
    if (phrase === 7 && step >= 9 && section > 1) {
        const fillIntensity = section / 8;
        if (Math.random() < fillIntensity) {
            roll(S, 0.5 * vel, 55 + step * 3, 0.4, step % 2 === 0 ? 1 : -1);
        }
    }

    // Breakdown solos (section 3 and 6)
    if (isBreakdown) {
        // Polyrhythmic solo patterns
        if ((step * 5) % 7 < 3) drum(S, 0.5 * vel, 60 + step * 2, 0.05, 0, Math.sin(step) * 0.8, 0.4);
        if ((step * 3) % 5 < 2) drum(G, 0.35 * vel, 80 + Math.random() * 30, 0.03, 0, -Math.sin(step) * 0.8, 0.3);

        // Crescendo rolls approaching the drop
        const barsToEnd = (section === 3 ? 112 : 192) - bar;
        if (barsToEnd <= 4 && step === 0) {
            roll(S, 0.6 * vel * (1 - barsToEnd / 8), 50, 1.5, 1);
            roll(K, 0.5 * vel * (1 - barsToEnd / 8), 40, 1.5, -1);
        }
    }

    // Drop intensifiers
    if (isDrop && phrase >= 4) {
        if (step % 2 === 1 && Math.random() < 0.3) stutter(S, 0.4 * vel, 65, 8);
        if (step === 11) roll(G, 0.4 * vel, 90, 0.5, Math.random() > 0.5 ? 1 : -1);
    }

    // Final chaos (section 7, bars 192-223)
    if (section === 7 && bar < 224) {
        if (Math.random() < 0.15) {
            const chaos = Math.random();
            if (chaos < 0.3) roll(K, 0.6 * vel, 35 + Math.random() * 15, 0.15, 0);
            else if (chaos < 0.6) stutter(S, 0.5 * vel, 55 + Math.random() * 20, 12);
            else roll(R, 0.4 * vel, 90, 0.25, Math.random() * 2 - 1);
        }
    }

    return n;
};
