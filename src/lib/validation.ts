import { z } from 'zod';

export const LeadOrigins = [
  'TikTok',
  'Instagram',
  'WhatsApp',
  'LinkedIn',
  'Google',
  'SEO',
  'Site',
] as const;

export const LeadIngestionSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no minimo 2 caracteres')
    .max(100, 'Nome deve ter no maximo 100 caracteres'),
  email: z.string().email('Email invalido'),
  phone: z
    .string()
    .regex(
      /^(\+\d{1,3}[\s-]?)?(\(?\d{2,3}\)?[\s-]?)?\d{4,5}[-.\s]?\d{4}$/,
      'Telefone invalido (use formato: (11) 99999-9999 ou similar)'
    ),
  document: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(
          value
        ),
      'CPF ou CNPJ em formato invalido'
    ),
  segment: z.string().max(100, 'Segmento deve ter no maximo 100 caracteres').optional().nullable(),
  notes: z.string().max(1000, 'Observacoes devem ter no maximo 1000 caracteres').optional().nullable(),
  tags: z.array(z.string().max(50)).optional().default([]),
  origin: z.enum(LeadOrigins).default('Site'),
});

export type LeadIngestionPayload = z.infer<typeof LeadIngestionSchema>;
