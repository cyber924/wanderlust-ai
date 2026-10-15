/** Remove unsupported optional fields without changing Firestore Timestamp/Date values. */
export function toFirestoreData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => item === undefined ? null : toFirestoreData(item)) as T;
  }
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, item]) => item !== undefined)
          .map(([key, item]) => [key, toFirestoreData(item)])
      ) as T;
    }
  }
  return value;
}
