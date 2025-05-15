import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária para combinar classes Tailwind de forma inteligente,
 * evitando conflitos e sobrescrevendo corretamente.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
