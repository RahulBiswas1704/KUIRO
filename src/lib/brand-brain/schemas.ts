import { z } from 'zod';

export const VisualIdentitySchema = z.object({
  primary_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  secondary_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  accent_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  font_family: z.string().default('Inter'),
  logo_url: z.string().url().nullable().optional(),
  watermark_opacity: z.number().min(0.1).max(1.0).default(0.95),
});

export const ToneOfVoiceSchema = z.object({
  style: z.enum([
    'professional_warm',
    'clinical_empathetic',
    'witty_energetic',
    'authoritative_thought_leader',
  ]),
  formality: z.enum(['casual', 'semi-formal', 'formal']),
  archetype: z.string().default('trusted_expert'),
  sample_phrases: z.array(z.string()).optional(),
});

export const ContentPillarSchema = z.object({
  name: z.string().min(3),
  weight: z.number().min(1).max(100),
});

export const BrandProfileSchema = z.object({
  industry: z.string().min(2, 'Industry is required'),
  website_url: z.string().url().optional().or(z.literal('')),
  google_business_url: z.string().url().optional().or(z.literal('')),
  tagline: z.string().optional(),
  core_offerings: z.array(z.string()).min(1, 'At least one core service/product is required'),
  tone_of_voice: ToneOfVoiceSchema,
  visual_identity: VisualIdentitySchema,
  content_pillars: z.array(ContentPillarSchema).min(1),
  negative_constraints: z.array(z.string()).default([]),
  target_audience_description: z.string().optional(),
});

export type BrandProfileInput = z.infer<typeof BrandProfileSchema>;
