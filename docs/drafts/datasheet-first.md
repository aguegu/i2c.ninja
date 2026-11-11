<!-- A draft post, not published: cut from another-tech-stack.md (the user, 2026-11-11: "This blog is supposed to be pitfall story about 'another stack' at the first place. I think we can cut from the datasheet first to another blog"). For students and teachers without EE or CS training. It needs its own opening, linking back to the tech-stack post. -->

## The datasheet first

Every chip comes with a datasheet: its makers' own description of how it works, what to send it and what it answers. Out of those years came one rule:

> Always respect the datasheets as the first-hand material, not the libraries.

A library is ready-made code someone shared for a sensor. It's that person's reading of the datasheet, written for their board and their needs. Some grow, as Weihong puts it, "too complicated, with features nobody needs". And most are built on top of other code, layer upon layer:

> Most libraries rely on lower layers that have grown too heavy to explore.

When a reading comes out wrong, the mistake is hiding somewhere in those layers, and the more layers there are, the harder it is to find. The datasheet is shorter. It says what the chip does, and nothing about anyone's board.

## Why atiic is built the way it is

[atiic](https://github.com/aguegu/atiic) is the collection of sensor drivers behind every page of this site, each one [the datasheet in code](/blog/reloaded), tied to no board. Three choices shape it: a PC, Linux and JavaScript.

### Why a PC

> A PC is supposed to run way faster than the sensors' communication buses, so a delay can be well measured.

The wires a sensor talks over are slow compared with a computer. On a small board, the board's own speed gets mixed into the problem: a wait that works on one board is too short on a faster one and too long on a slower one. A PC is always the quick one in the conversation, so every wait in a driver is there because the sensor's datasheet asks for it, written down as a plain number.

### Why Linux

> On Linux the USB interface is much easier to manage. And the foundation is the Linux kernel, which we can have much more confidence in than a hobbyist's sharing.

The kernel is the heart of the Linux system, the part that talks to hardware like USB, used and checked by millions of people. Building on it means trusting something tested far more than any one person's shared code. Linux is where each driver is proven first; the site itself then runs in a browser, on Linux, Windows and Android so far.

### Why JavaScript

> JS is a high-level language that is easy for humans to understand. I personally like its syntax very much. With the built-in buffers, the code looks very similar to the C written for most embedded systems. And it runs both on the system, in Node.js, and in the browser.

A sensor answers in bytes, small numbers from 0 to 255. JavaScript has built-in ways to hold them, [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) in the browser and [`Buffer`](https://nodejs.org/api/buffer.html) in Node.js, so the code that turns bytes into a reading looks almost the same as C, the language most chips are programmed in. Here is a temperature sensor, the SHT20, turning its answer into degrees Celsius with the formula from its datasheet, T = -46.85 + 175.72 × S / 2¹⁶. In JavaScript, from atiic:

```js
const t = -46.85 + (175.72 * s) / 65536;
```

and in C:

```c
float t = -46.85f + (175.72f * s) / 65536;
```

Only the first word changes. Anyone can hold the code next to the datasheet and check it, line by line. And the very same JavaScript runs in Node.js, on a computer, and in the browser, on these pages.

The other half of JavaScript is everything that comes with it. Websites and servers are built with it every day, so the tools are already there, ready to use. Testing is one of them: each atiic driver is tested twice, once on the desk against a pretend sensor that answers exactly as its datasheet says (the SHT20's check on its data is tested with the datasheet's own example), and once on the workbench with the real sensor wired up. On a small board, either of those would be a project of its own.

