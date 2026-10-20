import { brazilianStates, genderIdentities } from "@/lib/properties";
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
});

export const earliestBirthDate = '1900-01-01';

export function latestAdultBirthDate() {
  const today = new Date().toISOString().slice(0, 10);
  return `${Number(today.slice(0, 4)) - 18}${today.slice(4)}`;
}

export const profileSchema = z.object({
  name: nameSchema,
  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/.test(value.replace(/\D/g, '')),
      { error: 'Informe um telefone com DDD, como (11) 91234-5678.' },
    ),
  birthDate: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) && value >= earliestBirthDate),
      { error: 'Informe uma data de nascimento válida.' },
    )
    .refine((value) => value === '' || value <= latestAdultBirthDate(), {
      error: 'É necessário ter pelo menos 18 anos.',
    }),
  city: z
    .string()
    .trim()
    .max(120, { error: 'A cidade deve ter no máximo 120 caracteres.' }),
  state: z.union([z.literal(''), z.enum(brazilianStates)]),
});

export const guestIdentitySchema = z.object({
  genderIdentity: z
    .union([z.literal(''), z.enum(genderIdentities)])
    .refine((value) => value !== '', { error: 'Selecione uma opção.' }),
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

export const completeRegistrationSchema = resetPasswordSchema;

const currentPasswordSchema = z
  .string({ error: 'Informe sua senha atual.' })
  .min(1, { error: 'Informe sua senha atual.' })
  .max(128, { error: 'A senha deve ter no máximo 128 caracteres.' });

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordSchema,
    newPassword: registrationPasswordSchema,
    confirmPassword: z.string({ error: 'Repita a nova senha.' }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'As senhas não coincidem.',
  });

export const deactivateAccountSchema = z.object({
  currentPassword: currentPasswordSchema,
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type DeactivateAccountFormValues = z.infer<
  typeof deactivateAccountSchema
>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type GuestIdentityFormInput = z.input<typeof guestIdentitySchema>;
export type GuestIdentityFormValues = z.output<typeof guestIdentitySchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
