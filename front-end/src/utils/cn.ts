/**
 * Utility to combine class names conditionally (no external dep)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
