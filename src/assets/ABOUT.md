Author: Weihong Guan [Github](https://github.com/aguegu/) [X(Twitter)](https://x.com/BG5USN) [email](mailto:support@meshmass.com)

About i2c.ninja
---

i2c.ninja shows I2C devices live in the browser: a CH341 USB-to-I2C dongle reached over [WebUSB](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API), the device drivers from [atiic](https://github.com/aguegu/atiic), each tested on a real device before its page goes up. It needs a Chromium browser ([WebUSB support](https://caniuse.com/webusb)); the [setup](/get-started) says what the dongle and your computer need.

It's made for teaching and tinkering: **STEM lessons** where the physics happens on the desk, **digital experiments** with real data from real sensors, and a quick **smoke test** for a module before it goes into a project. Schools, universities and other educational institutions may use it freely (see the license below).

Questions, ideas, a sensor you'd like to see here, or what you built with it: the [Discussions](https://github.com/aguegu/i2c.ninja/discussions) on GitHub are the forum. Bugs go to the [issues](https://github.com/aguegu/i2c.ninja/issues).

Install it as an app (the install button in Chrome's or Edge's address bar, or "Add to Home screen" on Android) and, once visited, it works offline: a classroom needs the dongle on USB, not the internet.

There is no backend: the site runs entirely in your browser, and nothing about your devices or their readings leaves it. The little it remembers (the device pages you opened last, your light or dark choice) stays in this browser's storage; clearing the site's data forgets it. Page visits are counted anonymously with [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/): no cookies, no tracking across sites, and visitors in the EU aren't counted at all; it tells us which pages are read, so we know what to improve.

Built with [Vue](https://vuejs.org), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com) and [atiic](https://github.com/aguegu/atiic). The source: [github.com/aguegu/i2c.ninja](https://github.com/aguegu/i2c.ninja). **Using i2c.ninja is free for anyone, with any dongle, paid courses and workshops included, and a course may put its drawings and text in its own slides and handouts, with credit.** Beyond that, the licenses are about copying it. The code is under the [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) license; the content (the text of the pages, the drawings, the blog) under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): both free for noncommercial use, schools and universities included, and the content yours to adapt for a class, with credit. A copy of the site, its code in your product, or its drawings and text in material sold on its own (a book, a course pack) take a commercial license: write to [support@meshmass.com](mailto:support@meshmass.com). atiic stays MIT.

Commercial
---

i2c.ninja is vendor and dealer neutral: no shop, brand or seller is favoured, and the boards on its pages are the ones we ran, not ones anyone paid for. A sponsor's link, if there is one, is marked as a sponsor's.

Commercial opportunities are welcome:

- **Vendors**: a sponsored link on a device's page to where to buy that sensor, the dongle or a kit, marked as such.
- **Your sensor here**: a page for your module, once its driver has run on a real one on the bench.
- **Kits and teaching**: dongle-and-sensor kits around these pages, for workshops, schools and labs.
- **Commercial use** of i2c.ninja's code or content, under a license of its own.

Write to [support@meshmass.com](mailto:support@meshmass.com).

Legal disclaimer
---

This site talks, from your browser, to USB devices you choose: a USB dongle (a CH347 or a CH341) and the I2C devices wired to it. Wiring, powering and driving such hardware can damage it, the computer it is plugged into, or anything it controls. The setup steps change your system's settings (udev rules, kernel modules, USB drivers); you apply them at your own risk.

**The readings are the sensor's, not ours.** i2c.ninja presents what each sensor offers, read and converted as its datasheet describes, and nothing more. It doesn't certify or endorse them, and a calibration a page offers is one you run yourself: a reading is only as good as the module it comes from, its wiring and its surroundings. The code and the drivers are open source, so how every number is made can be checked.

The site, its device pages and the drivers behind them are experimental. They are provided **as is**, without warranty of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, correctness, or safety. They are intended for hobby, educational, and prototyping use only and are **not** suitable for life-critical, medical, or otherwise safety-critical applications.

You are solely responsible for how you use the site and the hardware connected to it. The author accepts no liability for any damage, injury, loss, or regulatory infraction arising from its use.

**USE AT YOUR OWN RISK.**

&copy; 2026 Weihong Guan (aGuegu)
