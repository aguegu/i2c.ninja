# i2c.ninja

Sensors live and explained in the browser, for STEM lessons, digital
experiments and smoke-testing modules: a CH341 USB-to-I2C dongle over
WebUSB, the device drivers from [atiic](https://github.com/aguegu/atiic),
each sensor's readings charted live and how it measures explained. Nothing
to install. Served at <https://i2c.ninja>.

## Devices

Each page goes up once its driver and the page itself have run on a real
device.

| Device | What it measures |
|---|---|
| [MPU-6050 / MPU-6500](https://i2c.ninja/mpu6050) | accelerometer and gyro (IMU) |
| [ADXL345](https://i2c.ninja/adxl345) | accelerometer, with its self test |
| [ITG-3200](https://i2c.ninja/itg3200) | gyroscope |
| [HMC5883L](https://i2c.ninja/hmc5883l) | magnetometer (compass) |
| [VL53L1X](https://i2c.ninja/vl53l1x) | time-of-flight distance |
| [MAX30102](https://i2c.ninja/max30102) | heart rate and pulse oximetry (PPG) |
| [MLX90614](https://i2c.ninja/mlx90614) | infrared thermometer |
| [SHT20](https://i2c.ninja/sht20), [AHT21B](https://i2c.ninja/aht21) | humidity and temperature |
| [INA231](https://i2c.ninja/ina231) | current, voltage and power |

And a guide: [Learn the IMU](https://i2c.ninja/learn/imu), from raw counts
to sensor fusion and calibration.

Questions, ideas, a sensor you'd like to see, or what you built:
[Discussions](https://github.com/aguegu/i2c.ninja/discussions). Bugs:
[issues](https://github.com/aguegu/i2c.ninja/issues).

1.0.0 starts over on atiic 1.0 (Vite + Vue). Before it:

- the Vue source up to 0.4.3: the private aguegu/ble.i2c.ninja, tag `0.4.3`
- the site served until 2026-11-04: tag `site-2024-08-09` here (the built
  pages, from the `gh-pages` branch)

## Develop

```
npm install
npm run dev     # http://localhost:5173
npm run lint
npm run build   # dist/: vite, then scripts/prerender.mjs (a page's own
                #   HTML a route), then scripts/sw.mjs (the service worker)
```

It's a PWA: installable, with offline as a failsafe. Pages go to the
network first (through Cloudflare, so its Web Analytics counts returning
visits too), a copy kept as they pass; offline, a page comes from its copy
or the precached app shell. Scripts, styles and drawings are precached
(Workbox); a new release waits for the page's Reload.

Every push to `main` builds and publishes the site
(`.github/workflows/pages.yml`).

Releases: [releases.md](releases.md).

## License

[PolyForm Noncommercial 1.0.0](LICENSE): free for any noncommercial use:
personal study, hobby projects, research, and use by schools, universities
and other educational institutions, charities and public bodies, with the
copyright notice kept. Commercial use (selling it, building it into a
product or a paid service) needs a commercial license: write to
<support@meshmass.com>.

Releases up to 1.0.22 were published under the MIT license, and stay so for
copies taken from them. [atiic](https://github.com/aguegu/atiic), the
drivers the site runs on, stays MIT.
