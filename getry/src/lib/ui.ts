/**
 * ui helpers — the shadcn class merger for the ui component kit
 * (this is NOT gateway logic: every gateway route is fully self-contained
 * and keeps its own inlined core — nothing lives in a utilities module)
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** cn — tailwind class merger shadcn ui */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
