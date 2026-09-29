import { z } from "zod";
import { MAX_CENTS, MIN_CENTS } from "@/lib/limits";

export const giftSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  description: z.string().trim().max(400).default(""),
  imageUrl: z.string().trim().max(600).refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "URL inválida.").default(""),
  amountCents: z.number().int().min(MIN_CENTS).max(MAX_CENTS).nullable(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});
