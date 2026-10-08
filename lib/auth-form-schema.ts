import { z } from "@/lib/zod";

const emailSchema = z
  .string({ error: 'O e-mail é obrigatório.' })
  .trim()
  .toLowerCase()
  .min(1, { error: 'O e-mail é obrigatório.' })
  .pipe(z.email({ error: 'Informe um e-mail válido.' }));

const nameSchema = z
  .string({ error: 'O nome é obrigatório.' })
  .trim()
  .min(1, { error: 'O nome é obrigatório.' })
  .min(2, { error: 'O nome deve ter pelo menos 2 caracteres.' })
  .max(120, { error: 'O nome deve ter no máximo 120 caracteres.' });

const registrationPasswordSchema = z
  .string({ error: 'A senha é obrigatória.' })
  .min(1, { error: 'A senha é obrigatória.' })
  .min(12, { error: 'A senha deve ter pelo menos 12 caracteres.' })
  .max(128, { error: 'A senha deve ter no máximo 128 caracteres.' });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'A senha é obrigatória.' })
    .min(1, { error: 'A senha é obrigatória.' })
    .max(128, { error: 'A senha deve ter no máximo 128 caracteres.' }),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: registrationPasswordSchema,
});

export const profileSchema = z.object({
  name: nameSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const linkTokenSchema = z
  .string({ error: 'Token inválido.' })
  .regex(/^[0-9a-f]{64}$/i, { error: 'Token inválido.' });

export const resetPasswordSchema = z.object({
  token: linkTokenSchema,
  password: registrationPasswordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
