Author: Weihong Guan [Github](https://github.com/aguegu/) [X(Twitter)](https://x.com/BG5USN) [email](mailto:support@meshmass.com)

About i2c.ninja
---

i2c.ninja shows I2C devices live in the browser: a CH341 USB-to-I2C dongle reached over [WebUSB](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API), the device drivers from [atiic](https://github.com/aguegu/atiic), each tested on a real device before its page goes up. It needs a Chromium browser ([WebUSB support](https://caniuse.com/webusb)); the [setup](/setup) says what the dongle and your computer need.

There is no backend: the site runs entirely in your browser, and nothing about your devices or their readings leaves it.

Built with [Vue](https://vuejs.org), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com) and [atiic](https://github.com/aguegu/atiic). The source: [github.com/aguegu/i2c.ninja](https://github.com/aguegu/i2c.ninja), MIT.

Legal disclaimer
---

This site talks, from your browser, to USB devices you choose: a CH341 dongle and the I2C devices wired to it. Wiring, powering and driving such hardware can damage it, the computer it is plugged into, or anything it controls. The setup steps change your system's settings (udev rules, kernel modules, USB drivers); you apply them at your own risk.

The site, its device pages and the drivers behind them are experimental. They are provided **as is**, without warranty of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, correctness, or safety. They are intended for hobby, educational, and prototyping use only and are **not** suitable for life-critical, medical, or otherwise safety-critical applications.

You are solely responsible for how you use the site and the hardware connected to it. Neither the author nor Fuzhou Sourcekit electronics Ltd accept liability for any damage, injury, loss, or regulatory infraction arising from its use.

**USE AT YOUR OWN RISK.**

&copy; Fuzhou Sourcekit electronics Ltd
