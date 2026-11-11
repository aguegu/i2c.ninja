<!-- A draft post, not published: back to src/blog/ and src/lib/blog.js when its turn comes (the user, 2026-11-11: "we would draft another blog for it. let's finished the science one first"). Written for students and teachers without EE or CS training (the user, 2026-11-11). -->

In [the last post](/blog/the-science-first), "another tech stack" was the thing a student shouldn't need. A tech stack is everything that has to be learnt and set up before a project works: a circuit board, the program that writes code for it, the language, the add-ons. That phrase has a story behind it. Long before AI could write code, Weihong tried most of the popular boards for makers, and every one of them led to the same place:

> I have played with most mainstream devkits, and it always comes to a point where I need some sensors attached.

Here are some of them, across more than a decade:

- **[Arduino](https://www.arduino.cc)**, programmed in C++ (from 2013)
- **[STM32](https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html)**, in C++ (from 2013)
- **[Raspberry Pi](https://www.raspberrypi.com)**, a small computer, in Python (2014)
- **[NodeMCU](https://nodemcu.readthedocs.io)**, a Wi-Fi board, in Lua (2017)
- **[STM8](https://www.st.com/en/microcontrollers-microprocessors/stm8-8-bit-mcus.html)**, in C (2018)
- **[micro:bit](https://makecode.microbit.org)**, the classroom board, in MakeCode and TypeScript (2024)
- **[WCH](https://www.wch-ic.com)'s RISC-V chips**, the newest, in C (2026)

Seven boards, five programming languages. And each time, the sensors came along, and the code that talks to each sensor, its driver, had to be written again for the new board.

## Moving code isn't copying it

It sounds like copy and paste. It never is:

> Changing stacks and migrating code is not as easy as it looks, because different platforms run at different speeds. Some sensors need a delay or a wait, some don't. Some chips simply run slower than the sensors, by their nature.

Think of a sensor as a person you're asking questions. Some answer at once. Some need time to think: a common thermometer chip, the DS18B20, needs up to three quarters of a second to measure a temperature properly, and if you ask again too soon it just repeats its old answer. Others are fussy about how fast you talk: a chip used in kitchen scales, the HX711, falls asleep if one of its signals is held for longer than 60 millionths of a second. A fast board has to slow down for it; a slow board may stumble past that limit without meaning to.

The boards don't make it easier by trying to be the same, either. Arduino set out to make one way of writing code work on every chip, from the smallest to the fastest. It's a generous goal, and it comes at a price Weihong knows well:

> Arduino tries to make itself work on different architectures, from the low end to the high end, with macro-defined if conditions everywhere in the core libraries.

Those conditions are lines that switch code on or off depending on the chip it's being built for. Here's how Arduino's own [Servo library](https://github.com/arduino-libraries/Servo/blob/master/src/Servo.h), the code that turns a small motor arm, picks its timing code:

```c
#if defined(ARDUINO_ARCH_AVR)
#include "avr/ServoTimers.h"
#elif defined(ARDUINO_ARCH_SAM)
#include "sam/ServoTimers.h"
#elif defined(ARDUINO_ARCH_SAMD)
#include "samd/ServoTimers.h"
...
```

and eight more chip families after those. The code reads the same on every board, but underneath it's a different program for each one. When something goes wrong, the first job is working out which of those branches is even in play.

None of this shows up while writing the code. It shows up on the workbench, with the real sensor wired up, and only there:

> And each time, field-testing it, it would take a while.

## And why this site asks for none of it

A decade of moving the same sensors from board to board is a good teacher, but it's a long way round to the science. Each new board meant learning its tools, rewriting its drivers and testing them again on the bench, before a single reading could be trusted. Here the whole stack is a bridge and a browser, and the sensor is the lesson.
