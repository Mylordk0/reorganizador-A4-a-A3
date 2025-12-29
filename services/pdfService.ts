import { PDFDocument, PageSizes, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { ImpositionSettings } from '../types';
import { MM_TO_PT } from '../constants';

// Helper to draw a page in a specific slot
const drawPageInSlot = (
  targetPage: PDFPage,
  sourcePage: PDFPage | null,
  slot: 'left' | 'right',
  settings: ImpositionSettings,
  isBackSide: boolean
) => {
  if (!sourcePage) return;

  const { width: A3Width, height: A3Height } = targetPage.getSize();
  const halfWidth = A3Width / 2;
  
  // Calculate slot center
  const slotCenterX = slot === 'left' ? halfWidth / 2 : halfWidth + (halfWidth / 2);
  const slotCenterY = A3Height / 2;

  const scale = settings.scale;
  const dims = sourcePage.scale(scale);

  // Base Offsets
  let xOffsetPt = settings.xOffsetMm * MM_TO_PT;
  const yOffsetPt = settings.yOffsetMm * MM_TO_PT;
  const gutterPt = settings.gutterMm * MM_TO_PT;

  // Duplex Correction (only applied to back side pages)
  if (isBackSide) {
    xOffsetPt += (settings.duplexCorrection * MM_TO_PT);
  }

  // Calculate draw position (centered in slot + offsets)
  // Gutter logic: pushing away from center line
  let gutterShift = 0;
  if (slot === 'left') gutterShift = -(gutterPt / 2);
  else gutterShift = (gutterPt / 2);

  const drawX = slotCenterX - (dims.width / 2) + xOffsetPt + gutterShift;
  const drawY = slotCenterY - (dims.height / 2) + yOffsetPt;

  targetPage.drawPage(sourcePage, {
    x: drawX,
    y: drawY,
    width: dims.width,
    height: dims.height,
  });
};

export const processPdf = async (
  fileBytes: Uint8Array,
  settings: ImpositionSettings
): Promise<Uint8Array> => {
  const srcDoc = await PDFDocument.load(fileBytes);
  const outDoc = await PDFDocument.create();
  
  const embeddedPages = await outDoc.embedPages(srcDoc.getPages());
  
  // Process in batches of 4 input pages (A4) -> to produce 1 A3 Sheet (Front & Back)
  // Expected Input Order: Front 1, Back 1, Front 2, Back 2
  // Output A3 Front: Left=[Front 1], Right=[Front 2]
  // Output A3 Back:  Left=[Back 2], Right=[Back 1]  <-- Swapped for duplex alignment
  
  for (let i = 0; i < embeddedPages.length; i += 4) {
    const p1 = embeddedPages[i];     // Front A
    const p2 = embeddedPages[i + 1]; // Back A
    const p3 = embeddedPages[i + 2]; // Front B
    const p4 = embeddedPages[i + 3]; // Back B

    // --- Create A3 Front Page ---
    const pageFront = outDoc.addPage([PageSizes.A3[1], PageSizes.A3[0]]); // Landscape
    
    // Draw Fronts
    drawPageInSlot(pageFront, p1, 'left', settings, false);
    if (p3) drawPageInSlot(pageFront, p3, 'right', settings, false);

    // Draw Guides on Front
    if (settings.drawCenterLine) {
        const { width, height } = pageFront.getSize();
        pageFront.drawLine({
            start: { x: width / 2 + (settings.xOffsetMm * MM_TO_PT), y: 0 },
            end: { x: width / 2 + (settings.xOffsetMm * MM_TO_PT), y: height },
            thickness: 1,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.5,
            dashArray: [5, 5]
        });
        // Label
        pageFront.drawText('FRENTE', { x: 10, y: 10, size: 8, color: rgb(0.5,0.5,0.5) });
    }

    // --- Create A3 Back Page (only if we have back content) ---
    if (p2 || p4) {
      const pageBack = outDoc.addPage([PageSizes.A3[1], PageSizes.A3[0]]); // Landscape
      
      // Draw Backs (Swapped positions for alignment)
      // If Front A is on Left, Back A must be on Right of the back sheet
      // If Front B is on Right, Back B must be on Left of the back sheet
      
      if (p4) drawPageInSlot(pageBack, p4, 'left', settings, true);  // Backs p3
      if (p2) drawPageInSlot(pageBack, p2, 'right', settings, true); // Backs p1

      // Draw Guides on Back
      if (settings.drawCenterLine) {
        const { width, height } = pageBack.getSize();
        // Note: X offset moves the center line too
        const backXOffset = (settings.xOffsetMm + settings.duplexCorrection) * MM_TO_PT;
        
        pageBack.drawLine({
            start: { x: width / 2 + backXOffset, y: 0 },
            end: { x: width / 2 + backXOffset, y: height },
            thickness: 1,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.5,
            dashArray: [5, 5]
        });
        pageBack.drawText('DORSO', { x: 10, y: 10, size: 8, color: rgb(0.5,0.5,0.5) });
      }
    }
  }

  const pdfBytes = await outDoc.save();
  return pdfBytes;
};