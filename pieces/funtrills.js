// Trip hop - dark, moody, ghost note heavy - MIDI output
const swingAmt = 0.018;
const slopAmt = 0.008;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.6);
const fl = (t) => Math.floor(t)
const sin = (t) => Math.sin(t)

const BAR = 16;


// MIDI channels
const drums = 'm:1';  // GM drums on ch 10
const bass = 'm:1';    // bass on ch 1
const pad = 'm:2';     // pad on ch 2
const strings = 'm:3'; // strings on ch 3
const piano = 'm:4';   // piano on ch 4

// GM drum notes
const KICK = 36;
const SNARE = 38;
const RIMSHOT = 37;
const HAT = 42;
const OPEN_HAT = 46;
const CRASH = 49;


return (t, s) => {

    const sl = (x) => ((t % x) / x)
    n = []

    cmajor_scale = [0, 2, 4, 5, 7, 9, 11];
    // ADD 40
    cmajor_scale = cmajor_scale.map(note => note + 30);

    // extend across all octaves
    while (cmajor_scale[cmajor_scale.length - 1] < 128) {
        cmajor_scale = cmajor_scale.concat(cmajor_scale.map(note => note + 12));
    }

    roots = [
        3, 4, 5, 4,
        // 5, 5, 5, 5,
        // 3, 3, 3, 3,
    ]; // I - IV - V - I
    root = roots[fl(t / BAR) % roots.length];
    triad = [0, 2, 4].map(i => cmajor_scale[root + i]);
    // expand to 24 notes
    triad = triad.concat(triad.map(note => note + 12));
    triad = triad.concat(triad.map(note => note + 12));
    triad = triad.concat(triad.map(note => note + 12));

    p = triad[fl(t * 1.5) % 16];

    drag = (((1 / 8) * t) % 1) * 0.01

    sound = "piano:19"
    // sound = "pluck:40"

    start = 0.5

    d = 0.01

    pattern = [
        0, 0, 1, 0,
        1, 0, 1, 0,
        0, 0, 0, 0,
        0, 1, 0, 1,
    ];

    if (pattern[t % pattern.length]) {
        nhits = pattern[t % pattern.length];
        for (let i = 0; i < nhits; i++) {
            for (let j = 0; j < 4; j++) {
                n.push({
                    w: sound, v: ((t % 3) / 7), d: (1 - i / nhits) * d, o: i / nhits, p: triad[j] + 24 + sin(s) * 0.05 + slop() * 5.0, v: 1, x: sin(t % 16) * 0.0, start: start,
                    c: 1000 * (i / nhits) + 500
                });
            }
        }
    }

    // if (t % 2 == 0) {
    //     n.push({
    //         w: sound, d: d, o: slop() + drag, p: p + 24, v: 1, x: sin(t % 16) * 0.2, start: start
    //     });
    // }

    if (t % 16 % 3 == 0) {
        n.push({
            w: sound, d: 1.0, o: slop() + 1 - drag, p: p + 12, v: 1, x: sin(t % 16) * 0.2, start: start
        });
    }

    kd = [
        0, 1, 0, 0, 1, 0, 2, 1,
        0, 1, 0, 0, 1, 0, 0, 1,
        0, 1, 0, 0, 1, 0, 2, 1,
        0, 3, 1, 0, 4, 2, 1, 8,
    ]

    // play once cycle every bar
    if (kd[(t) % kd.length] > 0) {
        nhits = kd[(t) % kd.length];
        for (let i = 0; i < nhits; i++) {
            n.push({
                w: "tabla:4",
                p: 50,
                d: 1.0,
                o: i / nhits,
                v: 0.5 * (i + 1) / nhits,
                x: sin(i / nhits),
                r: nhits * 0.01

            });
        }
    }


    sd = [
        0, 0, 4, 0, 1, 0, 2, 1,
        0, 0, 0, 0, 1, 0, 0, 1,
        0, 0, 0, 0, 1, 0, 2, 1,
        0, 0, 1, 0, 4, 2, 1, 0,
    ]
    if (sd[(t) % sd.length] > 0) {
        nhits = sd[(t) % sd.length];
        for (let i = 0; i < nhits; i++) {
            n.push({
                w: `hat:${t % 16 % 4}`,
                p: 0,
                d: 1.0,
                o: i / nhits,
                v: (i + 1) / nhits,
                x: sin(t % 16) * 0.2
            });
        }
    }

    return n;
};

