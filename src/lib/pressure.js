// Air pressure and height: the International Standard Atmosphere's
// troposphere (ICAO Doc 7488) for absolute height from pressure, and the
// hypsometric equation for a height difference at the air's own
// temperature. Constants: ISA sea level and lapse rate; the molar mass of
// dry air (ISA); the gas constant (CODATA 2018, exact); standard gravity.
export const P0_PA = 101325; // ISA sea-level pressure
export const T0_K = 288.15; // ISA sea-level temperature, 15 C
export const LAPSE_K_M = 0.0065; // ISA lapse rate, troposphere
export const G = 9.80665; // m/s2, standard gravity
export const M_AIR = 0.0289644; // kg/mol, dry air
export const R_GAS = 8.314462618; // J/(mol K)
export const KELVIN = 273.15;
const EXP = (G * M_AIR) / (R_GAS * LAPSE_K_M); // 5.2558

// the ISA height for a pressure, m (the troposphere's formula: to about 11 km;
// geopotential height, within 0.2 m of geometric below 1 km); with p0, the
// sea-level pressure of the day instead of the standard one: what an
// altimeter set to it reads
export const isaHeight = (pa, p0 = P0_PA) => (T0_K / LAPSE_K_M) * (1 - (pa / p0) ** (1 / EXP));

// the ISA pressure at a height, Pa
export const isaPressure = (m) => P0_PA * (1 - (LAPSE_K_M * m) / T0_K) ** EXP;

// how far above the reference p0 a pressure p is, m, the air at c degrees
// (the hypsometric equation: the air's density falls with its pressure)
export const heightAbove = (p, p0, c) => ((R_GAS * (c + KELVIN)) / (M_AIR * G)) * Math.log(p0 / p);

// the air's density, kg/m3, and so how much pressure a metre of it weighs, Pa
export const density = (pa, c) => (pa * M_AIR) / (R_GAS * (c + KELVIN));
export const pascalsPerMetre = (pa, c) => density(pa, c) * G;
