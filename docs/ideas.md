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

## Machine translation (parked 2026-11-11: "I do not want to over engineer these yet")

"Dongle" became 加密狗 in a browser's translator, so the page text says bridge
since 1.7.0. Words that may mistranslate the same way, counted in the page
text then: header(s) 6 (标题 for 排针: "pin header"), breakout 2 (突破:
"breakout board"), bus alone 18 ("I²C bus"), "CH341T stick" 1, "our bench" 9
("test bench"). Further steps, smallest first: `translate="no"` on chip, pin
and header names; the cheatsheets' notes out of the SVGs into the page's
HTML (images aren't translated); a short EN/中文 glossary (I²C 总线, 排针,
跳线帽, 上拉电阻, 桥接器); a check page on desktop Chrome's Translator API; a
/zh edition with hreflang. Wait for a real reader's stumble first.
