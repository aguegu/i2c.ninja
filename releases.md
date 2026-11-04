# Releases

## 1.0.2

- `/setup`: the setup guide for the site's users (vue-router; `404.html` a
  copy of `index.html`, so a route opens directly on GitHub Pages). A
  Chromium browser, the dongle's jumpers (atiic's drawing), once per
  computer the permission per platform, then "Connect and scan": the CH341
  over WebUSB (atiic's `Ch341`), the addresses that answer, and each way it
  fails explained.
- Linux, tried on r8845 (Manjaro, kernel 7.2.9, Chromium): a udev rule with
  `TAG+="uaccess"` (`70-ch341.rules`, before `73-seat-late.rules`) gives the
  dongle to whoever is at the computer, no group needed; and Chrome doesn't
  detach a kernel driver, so the kernel's `spi-ch341` (it binds 1a86:5512)
  has to let go: released after each plug (`unbind`), or blocked for good
  (`blacklist spi_ch341`, at the cost of the kernel's SPI on a CH341). Found
  0x68.
- Windows (Zadig, WinUSB), macOS, Android, ChromeOS: the documented steps,
  marked not tried on our bench yet.

## 1.0.1

- Tailwind CSS 4.3.4 (`@tailwindcss/vite`), no component library: native
  controls (select, checkbox, range, button, dialog) are the most phone
  friendly, and the page stays small (the placeholder: 25 KB JS, 3 KB CSS
  gzip). Light or dark as the device is (`dark:` and `color-scheme`).
- Weighed first on the same small page: Vant 40 + 34 KB, Quasar 75 + 35 KB,
  Vuetify 119 + 44 KB (JS + CSS gzip); PrimeVue 5 dropped, its PrimeUI
  License (from 5.0.0, 2026-07) needs a key and badges the page without one.

## 1.0.0

- Started over: one public repo for the source and the site, published by a
  GitHub Actions workflow (was: the source in the private ble.i2c.ninja,
  built and force-pushed to this repo's `gh-pages`).
- Vite 8 + Vue 3, ESLint 10 (@stylistic as iap.meshmass.com, eslint-plugin-vue),
  atiic 1.0.5 from GitHub. A placeholder page: what i2c.ninja is, the bench,
  the device pages coming back one at a time (the MPU-6050 first).
