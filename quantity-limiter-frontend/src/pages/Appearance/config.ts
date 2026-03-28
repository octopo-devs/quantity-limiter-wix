import { z } from 'zod';
import { DisplayType, TextAlign } from '@/types/enum';

export const appearanceSchema = z.object({
  displayType: z.nativeEnum(DisplayType),
  backgroundColor: z
    .string()
    .min(1, 'Background color is required')
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  textColor: z
    .string()
    .min(1, 'Text color is required')
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  fontFamily: z.string(),
  textAlign: z.nativeEnum(TextAlign),
  fontSize: z.number().min(8, 'Font size must be at least 8').max(72, 'Font size must be at most 72'),
  customCss: z.string().optional(),
});

export type AppearanceFormData = z.infer<typeof appearanceSchema>;

export const defaultFontFamilies = [
  { id: 'inherit', value: 'Inherit (from theme)' },
  { id: 'Arial, sans-serif', value: 'Arial' },
  { id: 'Helvetica, sans-serif', value: 'Helvetica' },
  { id: 'Times New Roman, serif', value: 'Times New Roman' },
  { id: 'Courier New, monospace', value: 'Courier New' },
  { id: 'Georgia, serif', value: 'Georgia' },
  { id: 'Verdana, sans-serif', value: 'Verdana' },
  { id: 'Impact, fantasy', value: 'Impact' },
  { id: 'Comic Sans MS, cursive', value: 'Comic Sans MS' },
];
