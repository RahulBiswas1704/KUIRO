import fs from 'fs';
import path from 'path';

export type IndicScript = 'bengali' | 'devanagari' | 'tamil' | 'latin';

export interface ScriptDetectionResult {
  script: IndicScript;
  hasIndic: boolean;
  fontFamily: string;
}

// In-memory base64 cache to avoid redundant filesystem reads
let cachedBengaliBase64: string | null = null;
let cachedDevanagariBase64: string | null = null;
let cachedTamilBase64: string | null = null;

function loadFontBase64(filename: string): string {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', filename);
    if (fs.existsSync(fontPath)) {
      const buf = fs.readFileSync(fontPath);
      return buf.toString('base64');
    }
  } catch (err) {
    console.warn(`[IndicFonts] Could not load font file ${filename}:`, err);
  }
  return '';
}

/**
 * Detects whether the given string contains Bengali, Devanagari, or Tamil characters.
 */
export function detectIndicScript(text: string): ScriptDetectionResult {
  if (!text) {
    return { script: 'latin', hasIndic: false, fontFamily: "'Sora', system-ui, sans-serif" };
  }

  // Bengali range: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    return {
      script: 'bengali',
      hasIndic: true,
      fontFamily: "'Noto Sans Bengali', 'Sora', system-ui, sans-serif",
    };
  }

  // Devanagari range: \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) {
    return {
      script: 'devanagari',
      hasIndic: true,
      fontFamily: "'Noto Sans Devanagari', 'Sora', system-ui, sans-serif",
    };
  }

  // Tamil range: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return {
      script: 'tamil',
      hasIndic: true,
      fontFamily: "'Noto Sans Tamil', 'Sora', system-ui, sans-serif",
    };
  }

  return {
    script: 'latin',
    hasIndic: false,
    fontFamily: "'Sora', system-ui, sans-serif",
  };
}

/**
 * Returns an SVG <style> block embedding the pre-shaped Google Fonts base64 data URIs
 * for the requested scripts, enabling Sharp/librsvg to render complex ligatures without broken text.
 */
export function getIndicFontFaceSvgStyle(targetScript?: IndicScript | 'all'): string {
  if (!cachedBengaliBase64) {
    cachedBengaliBase64 = loadFontBase64('noto-sans-bengali-700.ttf');
  }
  if (!cachedDevanagariBase64) {
    cachedDevanagariBase64 = loadFontBase64('noto-sans-devanagari-700.ttf');
  }
  if (!cachedTamilBase64) {
    cachedTamilBase64 = loadFontBase64('noto-sans-tamil-700.ttf');
  }

  const styles: string[] = [];

  if ((targetScript === 'bengali' || targetScript === 'all' || !targetScript) && cachedBengaliBase64) {
    styles.push(`
      @font-face {
        font-family: 'Noto Sans Bengali';
        src: url(data:font/truetype;charset=utf-8;base64,${cachedBengaliBase64}) format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    `);
  }

  if ((targetScript === 'devanagari' || targetScript === 'all' || !targetScript) && cachedDevanagariBase64) {
    styles.push(`
      @font-face {
        font-family: 'Noto Sans Devanagari';
        src: url(data:font/truetype;charset=utf-8;base64,${cachedDevanagariBase64}) format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    `);
  }

  if ((targetScript === 'tamil' || targetScript === 'all' || !targetScript) && cachedTamilBase64) {
    styles.push(`
      @font-face {
        font-family: 'Noto Sans Tamil';
        src: url(data:font/truetype;charset=utf-8;base64,${cachedTamilBase64}) format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    `);
  }

  if (styles.length === 0) return '';

  return `<style>${styles.join('\n')}</style>`;
}
