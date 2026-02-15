import { type ClassValue, clsx } from "clsx";

// Lightweight className merge utility (no tailwind-merge dependency needed yet)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
