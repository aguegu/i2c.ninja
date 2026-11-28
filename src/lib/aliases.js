// Other addresses of a page, one list: the router answers them with the
// page, and scripts/prerender.mjs writes each its own HTML (canonical to the
// page), so a crawler gets 200, not the 404 page. alias -> page
export const ALIASES = {
  '/mpu6500': '/mpu6050',
  '/aht21b': '/aht21',
  '/aht30': '/aht21',
  '/bh1745nuc': '/bh1745',
  '/sht30': '/sht3x',
  '/sht31': '/sht3x',
  '/sht35': '/sht3x',
  '/sht40': '/sht4x',
  '/sht41': '/sht4x',
  '/sht45': '/sht4x',
  '/htu21': '/htu21d',
  '/cht8305c': '/cht8305',
  '/lm75a': '/lm75',
  '/qmc5883': '/qmc5883l',
  '/gy-271': '/qmc5883l',
  '/ap3216': '/ap3216c',
  '/tcs34727': '/tcs34725',
  '/tcs3472': '/tcs34725',
  '/vl6180': '/vl6180x',
  '/spl06-001': '/spl06',
  '/gy-bmp280': '/bmp280',
  '/agn12': '/agr12',
  '/agp12': '/agr12',
};

// a page's aliases, for its route
export const aliasesOf = (path) => Object.keys(ALIASES).filter((a) => ALIASES[a] === path);
