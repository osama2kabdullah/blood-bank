/**
 * Type-safe localStorage wrapper
 */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  },
  remove(key: string): void {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
  clear(): void {
    try { localStorage.clear() } catch { /* ignore */ }
  },
}
