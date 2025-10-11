export default function getError<T extends Error>(fn: () => unknown): T {
  try {
    fn();
  } catch (e) {
    return e as T;
  }
  throw new Error("Expected function to throw");
}
