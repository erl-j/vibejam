// Justice-inspired, sample-only French house beat - heavy and compressed.
const swingAmt = 0.012;
const slopAmt = 0.006;
const slop = () => (Math.random() - 0.5) * slopAmt;
const swing = (bt) => (bt % 2 ? swingAmt : -swingAmt * 0.45);

const BAR = 16;

// Sample queries (boolean search friendly).
const kickMain = 'kick:0';
const kickDirty = 'kick:5';
const clapBig = 'clap:1';
const snareTight = 'snare:0';
const closedHat = 'hat:2';
const openHat = 'hat:9';
const ride = 'ride:0';
const crash = 'crash:0';
const bassShot = 'bass || low:0';
const chopLoop = 'disco || funk || soul:0';
const vocalHit = 'vocal || yeah || shout:0';

return (t, s) => {
    const n = [];
    const bar = Math.floor(t / BAR);
    const bt = t % BAR;
    const phrase = bar % 16;
    const fillBar = bar % 8 === 7;

    const grooveBoost = phrase >= 8 ? 1.08 : 1.0;

    // Four-on-the-floor kick with an occasional dirty layer.
    if (bt % 4 === 0) {
        const layer = phrase % 4 === 3 && bt === 0 ? kickDirty : kickMain;
        n.push({ w: layer, v: 1.35 * grooveBoost, d: 0.45, o: slop() });
    }

    // Clap + snare backbeat.
    if (bt === 4 || bt === 12) {
        const feel = swing(bt) + slop();
        n.push({ w: clapBig, v: 1.12, d: 0.32, r: 0.18, o: feel });
        n.push({ w: snareTight, v: 0.95, d: 0.26, r: 0.22, o: feel + 0.01 });
    }

    // Closed hats on 16ths; open hats on offbeats.
    if (bt % 2 === 0) {
        n.push({ w: closedHat, v: 0.38, d: 0.06, o: swing(bt) + slop() });
    }
    if (bt % 4 === 2) {
        n.push({ w: openHat, v: 0.72, d: 0.18, o: swing(bt) + 0.01 });
    }

    // Ride enters on the second half of the phrase to lift energy.
    if (phrase >= 8 && bt % 4 === 0) {
        n.push({ w: ride, v: 0.35, d: 0.6, o: swing(bt) });
    }

    // Crash at the top of each 8-bar phrase.
    if (bt === 0 && bar % 8 === 0) {
        n.push({ w: crash, v: 0.9, d: 1.6, r: 0.4, o: 0 });
    }

    // Heavy mono bass shots right after the kick for pump.
    if (bt === 1 || bt === 5 || bt === 9 || bt === 13) {
        const start = ((bar * 0.07) + (bt / 64)) % 0.5;
        n.push({ w: bassShot, v: 1.05, d: 0.42, o: 0.03, start, p: 50 });
    }

    // Chopped disco/soul loop glued to the groove; delayed to duck under kick.
    if (bt === 0 || bt === 8) {
        const st = ((bar % 8) * 0.11) % 0.8;
        const vol = bt === 0 ? 0.8 : 0.9;
        n.push({ w: chopLoop, v: vol, d: 0.9, o: 0.05, start: st, p: 60, r: 0.12 });
    }

    // Occasional vocal hit on the upbeat.
    if (bt === 6 && bar % 4 === 1) {
        n.push({ w: vocalHit, v: 0.75, d: 0.35, o: 0.02, start: (bar % 6) * 0.08 });
    }

    // Snare roll fill on the last bar of each 8.
    if (fillBar && bt >= 12) {
        const step = bt - 12;
        n.push({ w: snareTight, v: 0.4 + step * 0.15, d: 0.18, o: swing(bt) * 0.5 });
    }

    // Texture hits for grit.
    if (bt === 14 && bar % 4 === 0) {
        n.push({ w: 'scratch || noise:0', v: 0.5, d: 0.4, r: 0.3, o: 0 });
    }

    return n;
};
