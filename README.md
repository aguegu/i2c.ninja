# i2c.ninja

I2C devices live in the browser: a CH341 USB-to-I2C dongle over WebUSB
(Chromium), the device drivers from [atiic](https://github.com/aguegu/atiic),
their readings charted. Served at <https://i2c.ninja>.

1.0.0 starts over on atiic 1.0 (Vite + Vue). Before it:

- the Vue source up to 0.4.3: the private aguegu/ble.i2c.ninja, tag `0.4.3`
- the site served until 2026-11-04: tag `site-2024-08-09` here (the built
  pages, from the `gh-pages` branch)

## Develop

```
npm install
npm run dev     # http://localhost:5173
npm run lint
npm run build   # dist/
```

Every push to `main` builds and publishes the site
(`.github/workflows/pages.yml`).

Releases: [releases.md](releases.md).

## License

[PolyForm Noncommercial 1.0.0](LICENSE): free for any noncommercial use:
personal study, hobby projects, research, and use by schools, universities
and other educational institutions, charities and public bodies, with the
copyright notice kept. Commercial use (selling it, building it into a
product or a paid service) needs a commercial license: ask by opening an
issue on [GitHub](https://github.com/aguegu/i2c.ninja/issues).

Releases up to 1.0.22 were published under the MIT license, and stay so for
copies taken from them. [atiic](https://github.com/aguegu/atiic), the
drivers the site runs on, stays MIT.
