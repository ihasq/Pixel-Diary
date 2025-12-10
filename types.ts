export enum Tool {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
  BUCKET = 'BUCKET',
  DROPPER = 'DROPPER'
}

export type GridState = string[]; // Array of 16 hex strings

export interface GenerationResponse {
  colors: string[];
}