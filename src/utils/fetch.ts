export function exclude<T extends Record<string, any>, Key extends keyof T>(
  data: T,
  keys: Key[]
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key as Key))
  ) as Omit<T, Key>;
}
