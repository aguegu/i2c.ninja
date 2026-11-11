<!-- A draft post, not published: back to src/blog/ and src/lib/blog.js when its turn comes (the user, 2026-11-11: "we would draft another blog for it. let's finished the science one first"). -->

"Another tech stack" came up in [the last post](/blog/the-science-first) as the thing a student shouldn't need. That phrase has a history. Long before coding agents, Weihong went through most of the mainstream devkits, and every one of them came to the same point:

> I have played with most mainstream devkits, and it always comes to a point where I need some sensors attached.

A trail across a decade, and only part of it:

- **[Arduino](https://www.arduino.cc)**, C++ (from 2013)
- **[STM32](https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html)** on ST's standard peripheral library, C++ (from 2013)
- **[Raspberry Pi](https://www.raspberrypi.com)**, Python (2014)
- **[NodeMCU](https://nodemcu.readthedocs.io)**, Lua (2017)
- **[STM8](https://www.st.com/en/microcontrollers-microprocessors/stm8-8-bit-mcus.html)** with [SDCC](https://sdcc.sourceforge.net) on Linux, C (2018)
- **[micro:bit](https://makecode.microbit.org)** in MakeCode, TypeScript (2024)
- **[WCH](https://www.wch-ic.com)'s RISC-V chips**, the CH5xx with Bluetooth and the CH32V, C (2026): the newest, an open instruction set

Seven stacks, five languages, and each time the sensors had to come along, their drivers written again for the new board.

## Porting isn't copying

It sounds like a copy and a few renames. It never is:

> Changing stacks and migrating code is not as easy as it looks, because different platforms run at different speeds. Some sensors need a delay or a wait, some don't. Some chips simply run slower than the sensors, by their nature.

Two examples, both from their datasheets. A DS18B20 needs up to 750 ms to convert a temperature at its full 12-bit resolution: ask too soon and it hands back the old one, so the code has to wait, and how it waits is different on every platform. An HX711 is clocked by the host pin by pin, and a clock held high for more than 60 µs puts it to sleep. A fast board has to slow down for it; on a slow one, or one interrupted at the wrong moment, the pulse may stretch past the limit on its own.

None of that shows when the code compiles. It shows on the bench, and only there:

> And each time, field-testing it, it would take a while.

## The datasheet first

Out of those years came one rule:

> Always respect the datasheets as the first-hand material, not the libraries.

A library is somebody's reading of the datasheet, made for their board and their needs. Some grow, as Weihong puts it, "too complicated, with features nobody needs". And most sit on top of something bigger still:

> Most libraries rely on lower layers that have grown too heavy to explore.

When a reading is wrong, the answer is somewhere in those layers, and the deeper they go the harder it is to find. The datasheet is shorter. It says what the chip does, and nothing about anyone's board.

## Why atiic looks the way it does

That's the reason for atiic's shape. Its drivers are [the datasheet in code](/blog/reloaded): registers, timings and conversions as the chip's makers wrote them, bound to no board. The bus underneath is a small interface, a few calls to write and read, so the same driver runs over a USB-to-I²C bridge in a browser or in Node, and each driver is field-tested here, on these pages, with a real module. Three choices hold it up: a PC, Linux and JavaScript.

### Why a PC

> A PC is supposed to run way faster than the sensors' communication buses, so a delay can be well measured.

On a small board, the board's own speed is part of the puzzle: a wait that works on one chip is too short on a faster one and too long on a slower one. A PC is never the slow side of an I²C bus. The waits a datasheet asks for become plain numbers in the driver, there because the chip needs them and not because of whatever the host happened to be doing. The USB bridge adds a round trip of its own, but that's the same on every PC.

### Why Linux

> On Linux the USB interface is much easier to manage. And the foundation is the Linux kernel, which we can have much more confidence in than a hobbyist's sharing.

atiic's board tests run on Linux, talking to the bridge through the kernel's own USB stack: no vendor driver to install, nothing between the code and the wire that thousands of people don't already depend on. The site itself runs wherever a Chromium browser does, Windows and Android included; Linux is the bench where each driver is proved first.

### Why JavaScript

> JS is a high-level language that is easy for humans to understand. I personally like its syntax very much. With the built-in buffers, the code looks very similar to the C written for most embedded systems. And it runs both on the system, in Node.js, and in the browser.

The buffers are the language's own: [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) and [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), raw bytes in every browser, and Node's [`Buffer`](https://nodejs.org/api/buffer.html), itself a `Uint8Array`. Bytes in, bytes out, as on a microcontroller. Here is atiic's SHT20 turning its two data bytes into a temperature, the formula straight from its datasheet, T = -46.85 + 175.72 · S / 2¹⁶:

```js
const s = ((d[0] << 8) | d[1]) & ~STATUS_BITS;
const t = -46.85 + (175.72 * s) / 65536;
```

and the same two lines in C:

```c
uint16_t s = ((d[0] << 8) | d[1]) & ~STATUS_BITS;
float t = -46.85f + (175.72f * s) / 65536;
```

Only the types differ. A driver reads line by line against its datasheet, or against a C driver someone wrote for a board. And since atiic keeps its bytes in `Uint8Array`s, the same file runs in Node for the board tests and in the browser for these pages, unchanged.

The other half of JavaScript is everything around it. Backend and frontend development have built every wheel a driver needs, and testing is one of them. Node ships its own test runner, so each atiic driver has two kinds of test: one on the desk, against a fake chip that answers the datasheet's bytes (the SHT20's checksum is tested on the datasheet's own example, 0x63 0x52 giving 0x64), and one on the bench, against the real module over a real bridge. The site's pages get the same care from a headless browser. On a microcontroller, each of those would be a project of its own.

And it's the reason i2c.ninja asks for no stack at all. A decade of porting the same sensors from board to board is a good teacher, but it's a long way round to the physics. Here the stack is a bridge and a browser, and the sensor is the lesson.
