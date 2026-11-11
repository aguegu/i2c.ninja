# Ideas

Pages and experiments not built yet, parked until their turn. Each says
what it would show, how, and what to check first.

## Physics: fit the fall, and measure g

On [Distance and time of flight](https://i2c.ninja/physics/distance)
(2026-11-10, the user: "the 'fit and fall' could be physics ideas. we can
doc them for now"). Its "Drop it" step shows a jump in the moving
acceleration chart, but a classic mechanics lab ends with a number for g.

- **A "Fit the fall" button.** Drop a book under the sensor (taped to a
  table's edge, looking down). The page looks back over the last few
  seconds, finds the fall, fits one parabola to all of its readings,
  x(t) = x0 + v0 t + ½ g t², and shows g with its uncertainty, beside
  9.81 m/s².
- **Finding the fall.** Before the drop x sits still; in free fall x grows
  faster and faster; at the floor it stops. The fall is the stretch between
  the moving fits' acceleration leaving 0 and the first reading past the
  floor (or the valid readings ending). Mark it on the position chart, so
  the reader sees which readings were used.
- **Why one fit beats the moving chart.** The moving fits take 9 readings
  (0.3 s) each; one fit over the whole fall (0.4 s from a metre, about 12
  readings at 33 ms) uses all of them at once, so its g is far steadier.
  Its uncertainty from the fit's residuals: least squares gives each
  coefficient's standard error.
- **Check first:** what a real drop gives at 30 readings a second in short
  mode (to 1.3 m): how many readings a fall leaves, whether the first
  readings of the fall lag (the timing budget averages over 33 ms), and
  whether a flat book or a ball reads cleaner. Then the lesson: repeat it
  ten times and see the spread, a measurement with its error bar.
- **Later:** air drag on a light object (a sheet of paper, a coffee filter):
  a fall that stops speeding up, the terminal speed read off the v chart.

## Physics: light falls with the square of the distance

The VL53L1X page says its signal "falls with the square of the distance".
A page (or a section) that measures it: walk a white card away from the
sensor, plot signal against distance on log-log axes, and read the slope
(−2 for a card filling the view; flatter while the card is smaller than the
beam). The numbers are there already (`signal`, `spads`, distance). Check
first: whether the sensor's own SPAD selection (fewer SPADs when the light
is strong) bends the curve; per SPAD may be the cleaner quantity.

## Physics: distance by sound

Light or sound on the distance page compares the two, but the site reads
no ultrasonic sensor: most hobby modules use a trigger and an echo pin, not
I2C. If an I2C ultrasonic module turns up (or dart grows a timed pin), a
page measuring the speed of sound: a target at a known distance, the echo
time, and the speed's change with the room's temperature (an SHT20 or
AHT21B beside it), 0.6 m/s a degree.

## Blog: the other tech stack

Stories parked from "The science first, programming optional" (1.8.8;
the user: "we can save some for later blogs. I think we have many stories
to share about the 'another tech stack'"). A post each, short:

- **Optional, not later.** The home card's title went from "no
  programming" to "programming optional" in an afternoon (the user: "we
  can say programming later, or optional, even 'ai would take care of the
  programming part'"): why "later" and the AI forecast stayed out.
- **Check it before it goes in.** For makers who do program: a minute on a
  device page shows whether a module answers and reads sane, before it's
  three layers deep in a project; atiic's drivers, field-tested here, as a
  reference (the user: "it could be good reference if they would just use
  it or write their own driver").
- **Play, experiment, report.** The recorder (1.8.0): one button, a raw
  CSV, the charts the student's own (the user: "That would be great for a
  A+ home assignment I think"); full screen for the projector.
- **The hour before the first number.** What a sensor lesson costs on a
  microcontroller board (board, IDE, USB driver, library, language), told
  from a real first try, not guessed.

## Blog: why the everyday bridges

The user, 2026-11-11, on atiic: "why we are compatible with built-in
usb-to-i2c bridges. Simply because they have been heavily test and
improved over the years. and millions have been made and distributed
already. Maybe it can be another blog." For students and teachers: why
atiic and the site work with the common USB-to-I²C bridges (the CH341,
the CH347) instead of a board of their own: years of use and fixes, made
in huge numbers, on sale everywhere, cheap to replace in a classroom.
Check first: any number for how many were made needs a source (WCH's own,
a teardown, a market report), else say "widely used" without a figure.
Vendor-neutral, as the site is: no shop, no recommendation beyond what
Bridges already measures.

## Blog: words lost in translation

The user, 2026-11-11, on the science-first post's "not by 'bus'": "the bus
translation could be another blog". A post on the site's own words and
what a browser's translator makes of them: "dongle" became 加密狗 (a
copy-protection key; the reason the site says bridge, 1.7.0), and "bus"
may come out as the vehicle. What a bus is (two wires shared by many
chips, each answering its address), told so the word lands in any
language. Check first: what the translators really give for "bus" and
"I²C bus" (Chrome's, others), no guessed outputs.

## Machine translation (parked 2026-11-11: "I do not want to over engineer these yet")

"Dongle" became 加密狗 in a browser's translator, so the page text says bridge
since 1.7.0. Words that may mistranslate the same way, counted in the page
text then: header(s) 6 (标题 for 排针: "pin header"), breakout 2 (突破:
"breakout board"), bus alone 18 ("I²C bus"), "CH341T stick" 1, "our bench" 9
("test bench"). (The stick became a devkit, 1.7.0.) Further steps, smallest first: `translate="no"` on chip, pin
and header names; the cheatsheets' notes out of the SVGs into the page's
HTML (images aren't translated); a short EN/中文 glossary (I²C 总线, 排针,
跳线帽, 上拉电阻, 桥接器); a check page on desktop Chrome's Translator API; a
/zh edition with hreflang. Wait for a real reader's stumble first.
