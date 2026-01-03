# Neurosymbolic Music Generation

[![Demo Video](https://img.youtube.com/vi/vkNX7z25aWg/maxresdefault.jpg)](https://www.youtube.com/watch?v=vkNX7z25aWg)

Browser-based system for AI-assisted music composition. LLMs write JavaScript that generates notes in real-time.

Clone this repo, load it into an LLM-augmented code editor, and start jamming.

## Why JavaScript

Language models understand JavaScript deeply. MIDI is a binary protocol that appears rarely in training data. This asymmetry makes JS a superior symbolic representation:

- **Native fluency** - LLMs write and debug JS naturally
- **Abstraction creation** - helper functions, chord builders, rhythm generators
- **Controllability** - communicate intent at any level, from "make it groovier" to "add triplets on beat 3"
- **Iterative refinement** - tweak code, ask for more, repeat

| Representation | Problem |
|----------------|---------|
| **MIDI** | Binary format, rare in training data. No abstraction layer. |
| **MusicXML** | Verbose XML. LLMs generate malformed structures. |
| **ABC notation** | Obscure, limited training examples, no composability. |
| **Piano roll** | Flat structure. Can't express "repeat this up a fifth." |
| **Custom DSLs** | Zero-shot performance is garbage. |

JS wins: massive training data, Turing complete, self-documenting, composable, debuggable.

## Setup

**Standalone (no server):**
Open `livecoding.html` directly in a browser. Edit `DEFAULT_CODE` to change the music.

**With server (hot-reload + samples):**
1. Configure sample directory in `server.js`
2. `node server.js`
3. Open `livecoding.html`

The server watches `music.js` and hot-reloads on save.

## API

Your code returns a function `(t, s) => notes[]` where:
- `t` = tick count (16th notes)
- `s` = time in seconds

Note properties:

| Key | Description | Default |
|-----|-------------|---------|
| `p` | MIDI pitch (0-127) | 60 |
| `d` | duration in seconds | 0.1 |
| `v` | volume (0-1+) | 0.5 |
| `x` | pan (-1 to 1) | 0 |
| `r` | reverb amount | 0 |
| `o` | offset in ticks | 0 |
| `a` | attack time | 0.01 |
| `c` | filter cutoff | 2000 |
| `w` | waveform/instrument | sine |
| `id` | exclusive note id | - |
| `start` | sample start position (0-1) | 0 |

## Instruments (`w` parameter)

**Synths:** `sine`, `sawtooth`, `square`, `triangle`

**Built-in drums:** `drums` with MIDI notes: 36=kick, 38=snare, 42=hihat, 46=open hihat, 39=clap

**Samples:** `query:index` (e.g. `kick:0`, `hat:5`). Boolean search: `acoustic & snare:0`

**MIDI output:** `m:channel` (e.g. `m:1` for channel 1)

## Example

```js
return (t, s) => {
    const n = [];
    
    // kick on 1 and 3
    if (t % 8 === 0 || t % 8 === 6) {
        n.push({ p: 36, w: 'drums', v: 0.9 });
    }
    
    // snare on 2 and 4
    if (t % 8 === 4) {
        n.push({ p: 38, w: 'drums', v: 0.8 });
    }
    
    // hi-hat 16ths
    n.push({ p: 42, w: 'drums', v: t % 2 ? 0.2 : 0.4 });
    
    // bass line using samples
    if (t % 4 === 0) {
        n.push({ w: `bass:${t % 8}`, p: 36, v: 0.7, d: 0.3 });
    }
    
    return n;
};
```

## Features

- Hot reload on file save
- Piano roll visualization
- BPM and volume controls
- MIDI output support
- Sample search with boolean operators
- Per-note exclusive IDs (retrigger/cut behavior)

## Inspirations

- [DreamCoder](https://arxiv.org/abs/2006.08381) - Kevin Ellis et al. Program synthesis through wake-sleep library learning.
- [Barbarians at the Gate](https://arxiv.org/abs/2510.06189) - AI-driven research for systems. Iterative generate-evaluate-refine loops with LLMs.
- [Barbarians at the Gate](https://www.imdb.com/title/tt0106356/) (1993) - James Garner plays Ross Johnson. Unrelated but excellent.
- [Strudel](https://strudel.cc/) - Live coding music in the browser. Major inspiration for the UI and approach.

## Cite

```bibtex
@software{livecoding-js,
  author = {Jonason, Nicolas},
  title = {Neurosymbolic Music Generation},
  url = {https://github.com/nicolasjonason/livecoding-js}
}
```

---

*Vibecoded: the human pointed, the LLM typed.*
