// PDF Points conversion (72 DPI usually, but pdf-lib uses 72 points per inch)
// 1 inch = 25.4 mm
// 1 point = 1/72 inch
// 1 mm = 72 / 25.4 points ~= 2.83465

export const MM_TO_PT = 2.83465;

export const PAGE_SIZES = {
  A4_PORTRAIT: { width: 210 * MM_TO_PT, height: 297 * MM_TO_PT },
  A3_LANDSCAPE: { width: 420 * MM_TO_PT, height: 297 * MM_TO_PT },
};

export const INITIAL_SETTINGS = {
  outputSize: 'A3' as const,
  orientation: 'Landscape' as const,
  xOffsetMm: 0,
  yOffsetMm: 0,
  gutterMm: 0,
  drawCenterLine: true,
  scale: 1.0,
  duplexCorrection: 0
};
