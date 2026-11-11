<!-- A draft post, not published: back to src/blog/ and src/lib/blog.js when its turn comes (the user, 2026-11-11: "we would draft another blog for it. let's finished the science one first"). -->

"Another tech stack" came up in [the last post](/blog/the-science-first) as the thing a student shouldn't need. That phrase has a history. Long before coding agents, Weihong went through most of the mainstream devkits, and every one of them came to the same point:

> I have played with most mainstream devkits, it all comes to a point that I would need some sensors attached.

A trail across a decade, and only part of it:

- **[Arduino](https://www.arduino.cc)**, C++ (from 2013)
- **[STM32](https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html)** on ST's standard peripheral library, C++ (from 2013)
- **[Raspberry Pi](https://www.raspberrypi.com)**, Python (2014)
- **[NodeMCU](https://nodemcu.readthedocs.io)**, Lua (2017)
- **[STM8](https://www.st.com/en/microcontrollers-microprocessors/stm8-8-bit-mcus.html)** with [SDCC](https://sdcc.sourceforge.net) on Linux, C (2018)
- **[micro:bit](https://makecode.microbit.org)** in MakeCode, TypeScript (2024)

Six stacks, six languages, and each time the sensors had to come along, their drivers written again for the new board.

## Porting isn't copying

It sounds like a copy and a few renames. It never is:

> changing 'stack', migrating code is not easy as i looks. because different platform running at various speed. some senors would need a delay/waiting, some do not. some chips may just run slower than the sensors by its nature.

Two examples, both from their datasheets. A DS18B20 needs up to 750 ms to convert a temperature at its full 12-bit resolution: ask too soon and it hands back the old one, so the code has to wait, and how it waits is different on every platform. An HX711 is clocked by the host pin by pin, and a clock held high for more than 60 µs puts it to sleep. A fast board has to slow down for it; on a slow one, or one interrupted at the wrong moment, the pulse may stretch past the limit on its own.

None of that shows when the code compiles. It shows on the bench, and only there:

> And each time by the 'field test' style, it wound take a while.

## The datasheet first

Out of those years came one rule:

> always respect the datasheets as the first hand material, not libraries.

A library is somebody's reading of the datasheet, made for their board and their needs. Some grow, as Weihong puts it, "too complicated with the feature not needed". And most sit on top of something bigger still:

> most libraries rely on lower layers that have grown too heavy to explore.

When a reading is wrong, the answer is somewhere in those layers, and the deeper they go the harder it is to find. The datasheet is shorter. It says what the chip does, and nothing about anyone's board.

## Why atiic looks the way it does

That's the reason for atiic's shape. Its drivers are [the datasheet in code](/blog/reloaded): registers, timings and conversions as the chip's makers wrote them, bound to no board. The bus underneath is a small interface, a few calls to write and read, so the same driver runs over a USB-to-I²C bridge in a browser or in Node, and each driver is field-tested here, on these pages, with a real module.

And it's the reason i2c.ninja asks for no stack at all. A decade of porting the same sensors from board to board is a good teacher, but it's a long way round to the physics. Here the stack is a bridge and a browser, and the sensor is the lesson.
