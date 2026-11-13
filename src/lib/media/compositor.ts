import sharp from 'sharp';
import { uploadToR2 } from '../storage/r2';
import { detectIndicScript, getIndicFontFaceSvgStyle, IndicScript } from './indic-fonts';

export interface OverlayOptions {
  backgroundBuffer?: Buffer;
  headline: string;
  subheadline: string;
  brandName: string;
  primaryColor?: string; // e.g. KUIRO Orange #FF7A00 or client primary
  logoUrl?: string;
  phone?: string;
  website?: string;
  width?: number; // 1080 for Instagram 4:5
  height?: number; // 1350
  aspectRatio?: '4:5' | '1:1' | '16:9' | '9:16';
  uploadKey?: string;
}

export interface ContactSheetCard {
  title: string;
  platform: 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'facebook';
  captionSnippet: string;
  criticScore: number;
  imageBuffer?: Buffer;
}

/**
 * Checks if text contains Indic scripts (Hindi/Devanagari, Bengali, Tamil, etc.)
 * that require complex ligature shaping.
 */
export function containsIndicScript(text: string): boolean {
  return detectIndicScript(text).hasIndic;
}

/**
 * Escapes special XML characters to prevent SVG parser failures in Sharp/librsvg
 */
export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Programmatic Brand Compositor (Satori / Sharp Hybrid)
 * Overlays high-DPI Sora/Inter & bundled Google Fonts (Noto Sans Bengali, Devanagari, Tamil)
 * with pre-shaped ligatures onto AI-generated background canvases.
 */
export async function compositeBrandOverlay({
  backgroundBuffer,
  headline,
  subheadline,
  brandName,
  primaryColor = '#FF7A00',
  phone = '+91 98765 43210',
  website = 'kuiro.in',
  width = 1080,
  height = 1350,
  uploadKey,
}: OverlayOptions): Promise<{ buffer: Buffer; publicUrl: string }> {
  // Detect Indic scripts in headline, subheadline, and brand
  const fullText = `${headline || ''} ${subheadline || ''} ${brandName || ''}`;
  const scriptDetection = detectIndicScript(fullText);
  const headlineFontFamily = detectIndicScript(headline).fontFamily;
  const subheadlineFontFamily = detectIndicScript(subheadline).fontFamily;
  const brandFontFamily = detectIndicScript(brandName).fontFamily;

  // Generate SVG embedded @font-face style block with base64 TTF fonts
  const fontFaceStyle = getIndicFontFaceSvgStyle(scriptDetection.script);

  // If backgroundBuffer is not provided, generate a sleek luxury dark gradient canvas
  const baseCanvas = backgroundBuffer
    ? sharp(backgroundBuffer).resize(width, height, { fit: 'cover' })
    : sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 11, g: 15, b: 20, alpha: 1 }, // Charcoal #0B0F14
        },
      });

  // Programmatic crisp SVG overlay using KUIRO design tokens & pre-shaped Indic Google Fonts
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${fontFaceStyle}
        <linearGradient id="scrim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0B0F14" stop-opacity="0.85" />
          <stop offset="35%" stop-color="#0B0F14" stop-opacity="0.20" />
          <stop offset="70%" stop-color="#0B0F14" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#0B0F14" stop-opacity="0.98" />
        </linearGradient>
      </defs>

      <!-- Scrim background gradient for maximum typographic contrast -->
      <rect width="100%" height="100%" fill="url(#scrim)" />

      <!-- Top Header / Verified Brand Badge -->
      <g transform="translate(64, 72)">
        <rect x="0" y="0" width="${Math.min(420, (brandName || '').length * 20 + 50)}" height="54" rx="12" fill="#0B0F14" stroke="${primaryColor}" stroke-width="2" />
        <circle cx="28" cy="27" r="10" fill="${primaryColor}" />
        <text x="52" y="34" fill="#FFFFFF" font-family="${brandFontFamily}" font-size="20" font-weight="700" letter-spacing="0.04em">
          ${escapeXml((brandName || '').toUpperCase())}
        </text>
      </g>

      <!-- Center Headline & Subheadline (With Noto Sans Bengali/Devanagari/Tamil ligature shaping) -->
      <g transform="translate(64, ${height - 480})">
        <text x="0" y="0" fill="#FFFFFF" font-family="${headlineFontFamily}" font-size="54" font-weight="700" letter-spacing="-0.01em">
          ${escapeXml((headline || '').slice(0, 48))}
        </text>
        <text x="0" y="70" fill="#D1D5DB" font-family="${subheadlineFontFamily}" font-size="28" font-weight="400">
          ${escapeXml((subheadline || '').slice(0, 72))}
        </text>
      </g>

      <!-- Bottom Footer / Contact Details & Verified Publisher Mark -->
      <g transform="translate(64, ${height - 130})">
        <line x1="0" y1="0" x2="${width - 128}" y2="0" stroke="rgba(209, 213, 219, 0.2)" stroke-width="1.5" />
        <text x="0" y="48" fill="${primaryColor}" font-family="'Sora', system-ui, sans-serif" font-size="24" font-weight="600">
          📞 ${escapeXml(phone)}
        </text>
        <text x="${width - 128}" y="48" fill="#D1D5DB" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="500" text-anchor="end">
          🌐 ${escapeXml(website)}
        </text>
      </g>
    </svg>
  `;

  const finalBuffer = await baseCanvas
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .webp({ quality: 92 })
    .toBuffer();

  const key = uploadKey || `campaigns/${Date.now()}-composed.webp`;
  const publicUrl = await uploadToR2(finalBuffer, key, 'image/webp');

  return { buffer: finalBuffer, publicUrl };
}

/**
 * Generates a 2x2 or 3x2 Contact-Sheet Grid Preview Image
 * Combines multi-platform variations or carousel slides into a single header image
 * for deliverability inside a single Meta WhatsApp Interactive Utility Template.
 */
export async function generateContactSheetGrid(
  cards: ContactSheetCard[],
  brandName: string
): Promise<{ buffer: Buffer; publicUrl: string }> {
  const sheetWidth = 1200;
  const sheetHeight = 800;
  const fontFaceStyle = getIndicFontFaceSvgStyle('all');
  const brandFontFamily = detectIndicScript(brandName).fontFamily;

  const cardSvgBlocks = cards.slice(0, 4).map((card, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 50 + col * 560;
    const y = 140 + row * 300;
    const titleFontFamily = detectIndicScript(card.title).fontFamily;

    return `
      <g transform="translate(${x}, ${y})">
        <!-- Card Container with 12px radius & 1px subtle border -->
        <rect width="530" height="270" rx="12" fill="#11141A" stroke="rgba(209, 213, 219, 0.16)" stroke-width="1" />
        
        <!-- Platform Badge -->
        <rect x="20" y="20" width="100" height="28" rx="6" fill="#0B0F14" stroke="#FF7A00" stroke-width="1" />
        <text x="70" y="38" fill="#FF7A00" font-family="'Sora', sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.08em">
          ${escapeXml(card.platform.toUpperCase())}
        </text>

        <!-- Critic Score Badge -->
        <rect x="420" y="20" width="90" height="28" rx="6" fill="#0B0F14" stroke="#10B981" stroke-width="1" />
        <text x="465" y="38" fill="#10B981" font-family="'Inter', sans-serif" font-size="11" font-weight="600" text-anchor="middle">
          ★ ${card.criticScore}/100
        </text>

        <!-- Card Title -->
        <text x="20" y="85" fill="#FFFFFF" font-family="${titleFontFamily}" font-size="17" font-weight="700">
          ${escapeXml(card.title.slice(0, 36))}
        </text>

        <!-- Caption Snippet -->
        <text x="20" y="125" fill="#D1D5DB" font-family="'Inter', sans-serif" font-size="13" font-weight="400">
          ${escapeXml(card.captionSnippet.slice(0, 60))}...
        </text>

        <!-- Verified Status Pill -->
        <g transform="translate(20, 215)">
          <circle cx="6" cy="6" r="4" fill="#10B981" />
          <text x="18" y="10" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="11" font-weight="500">
            Brand Safe • Auto-Commit T-48h
          </text>
        </g>
      </g>
    `;
  }).join('\n');

  const sheetSvg = `
    <svg width="${sheetWidth}" height="${sheetHeight}" viewBox="0 0 ${sheetWidth} ${sheetHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${fontFaceStyle}
      </defs>
      <!-- Background Charcoal #0B0F14 -->
      <rect width="100%" height="100%" fill="#0B0F14" />
      
      <!-- Top WhatsApp Header Bar -->
      <g transform="translate(50, 40)">
        <text x="0" y="36" fill="#FFFFFF" font-family="'Sora', sans-serif" font-size="30" font-weight="700">
          KUIRO 48-Hour Campaign Grid
        </text>
        <text x="0" y="68" fill="#D1D5DB" font-family="${brandFontFamily}" font-size="15">
          ${escapeXml(brandName)} • Multi-Channel Payloads Ready for Review
        </text>
        <rect x="${sheetWidth - 260}" y="10" width="160" height="34" rx="8" fill="#FF7A00" />
        <text x="${sheetWidth - 180}" y="32" fill="#FFFFFF" font-family="'Sora', sans-serif" font-size="13" font-weight="600" text-anchor="middle">
          T-48H QUEUED
        </text>
      </g>

      <!-- 2x2 Cards Grid -->
      ${cardSvgBlocks}
    </svg>
  `;

  const sheetBuffer = await sharp(Buffer.from(sheetSvg))
    .webp({ quality: 90 })
    .toBuffer();

  const key = `contact-sheets/${Date.now()}-whatsapp-grid.webp`;
  const publicUrl = await uploadToR2(sheetBuffer, key, 'image/webp');

  return { buffer: sheetBuffer, publicUrl };
}
