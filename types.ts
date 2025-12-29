export interface ImpositionSettings {
  outputSize: 'A3';
  orientation: 'Landscape'; // A3 is usually landscape to fit 2 A4s
  xOffsetMm: number;
  yOffsetMm: number;
  gutterMm: number; // Space between the two pages
  drawCenterLine: boolean;
  scale: number; // 1.0 = 100%
  duplexCorrection: number; // mm to shift even pages for back alignment
}

export interface ProcessedFile {
  originalName: string;
  pdfBytes: Uint8Array;
  pageCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}