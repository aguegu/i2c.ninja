# Releases

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
