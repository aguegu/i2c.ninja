About i2c.ninja
===

i2c.ninja is a static website that aim to visualize sensor readings with [sourcekit&reg;](https://sourcekit.cc) Atiic.

It is powered by [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) and [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Due to the different develop progresses of various of web browsers on different platforms, i2c.ninja only chrome/chromium-cored browsers on some platforms.

* [Web Serial API Compatibility](https://caniuse.com/web-serial)
* [Web Bluetooth API compatibility](https://caniuse.com/web-bluetooth)

i2c.ninja is built with

* [Naive UI](https://www.naiveui.com)
* [Chart.js](https://www.chartjs.org) with [chartjs-plugin-streaming](https://nagix.github.io/chartjs-plugin-streaming)
* [Vue.js 3](https://vuejs.org/)
* [Vite](https://vitejs.dev/)
* [atiic](https://www.npmjs.com/package/atiic): i2c device library based on Sourcekit Atiic

ICON from [iconscout](https://iconscout.com/icon/usb-1476574)

Developer: [@BG5USN](https://twitter.com/BG5USN)

Sourcekit Atiic ['&aelig;ti:k]
===

Sourcekit&reg; Atiic is a simple tool that provides basic control to [i&sup2;c](https://en.wikipedia.org/wiki/I%C2%B2C) devices with AT commands in Serial Communication. It got USB-TTL chip at one side and have an I&sup2;C bus on the other side which could host multiple i&sup2;c devices.

So Users could play with i&sup2;c devices as long as there is USB port available, without the need to learn Micro controller platform, like Raspberry Pi Pico, Arduino or Micro:bit, etc. Or plug i2c devices to the GPIO on more expensive platforms, like Raspberry Pi, Nvidia Jetson or other Single board Computer.

Experienced Developers who know `high-level` programming language like Python, NodeJS, Java could interact with i2c devices if they know how to do Serial/Usart/TTY operation.

Even for unexperienced users, they could get access to i&sup2;c devices with Serial Terminals, such as Putty, Cute Com or Arduino IDE.

[i2c.ninja](https://i2c.ninja) is also a great i2c debug tool with Atiic. It uses Serial API built in browsers. Without any other software installed on O/S, you could verify the functionality of i2c modules. And it works cross-platform, on Linux, Mac OS and Windows.


### Serial Port (COM) Specification

* Baudrate: 115200
* Databits: 8
* Parity: None
* Stopbits: 1

### i2c Specification

* Speed: 100KHz
* Voltage: 3.3 V

### AT Command SET

* Request (TX)

  1. Request should always be an `one-line` string to the serial port started with `AT` and ended with `<CR><LF>`, aka `\r\n`.

  2. The maximum length of a single request is `64` charactors, including `AT` and `<CR><LF>`.

  3. Format:
    * `AT+<CMD><CR><LF>`: Command without Arguments.
    * `AT+<CMD>=<HEX><CR><LF>`: Command with Arguments got a `=` to separate `<CMD>` and `<HEX>`

  4. The `Hex` length should always be even, so it can be convert into designated bytes.

  5. Case Insensitive and Space is ignored

* Response (RX) is always a `three-liner` string, containing `Echo`, `Body` and `Result`, each line ended with `<CR><LF>`.
    1. The 1st line, `Echo<CR><LF>`, is the request it response to.
    2. The 2nd line, `Body<CR><LF>`, is always in `HEX` format.
    3. The 3rd line, `Result<CR><LF>`, is neither `OK` or `ERROR`.

* *CAUTION*: Always Send new request after last request in fully responsed with `OK\r\n` or `ERROR\r\n`.

* Commands:

  1. **AT+SC**: Scan devices for 7-bit addresses

    TX:
    ```
    AT+SC
    ```
    RX:
    ```  
    AT+SC
    4476
    OK
    ```

    It means it detect i2c devices on address `0x44` and `0x76`, all of which are 7-bit address (without W/R bit).

  2. **AT+TX=`DEVICE` `TX_PAYLOAD`**: write bytes to devices

    `DEVICE` is the 7-bit address of which Atiic send commands to.
    `TX_PAYLOAD` is the bytes you want to send to the device in `HEX` format.

    TX:
    ```
    AT+TX=760603
    ```    
    RX:
    ```
    AT+TX=760603

    OK
    ```

    In the case of sensor `SPL06` on address `0x76`, it means write `0x03` to register at address `0x06`, which is device soft reset.

    So *AT+TX=* is aim to write bytes to devices

  3. **AT+TR=`DEVICE` `TX_PAYLOAD` `RX_COUNT`**

    `DEVICE` is the 7-bit address of which Atiic send commands to.
    `TX_PAYLOAD` is the bytes you want to send to the device in `HEX` format.
    `RX_COUNT` is always 1 Byte (2 character in Hex) indicating how many bytes would be received after `TX_PAYLOAD` is transmitted.

    TX:
    ```
    AT+TR=442c0d06    
    ```
    RX:
    ```
    AT+TR=442c0d06
    68AAC492F631
    OK
    ```

    In the case of sensor `SHT30` on address `0x68`, it means read `0x06` bytes after writing `0x2c 0x2d` to it. Then the response is `0x68 0xAA 0xC4 0x92 0xF6 0x31` in hex format.

    So `AT+RX=` is aim to read registered after write the starter address to the devices.

    *CAUTION*: the last 2 hex character is always considered as `RX_COUNT`, so `TX_PAYLOAD` is the hex string between `=` and `RX_COUNT`. `TX_PAYLOAD` could be empty.
