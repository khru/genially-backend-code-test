export function getError<T extends Error>(fn: () => unknown): T {
  try {
    fn();
  } catch (e) {
    return e as T;
  }
  throw new Error('Expected function to throw');
}

export async function getAsyncError<T extends Error>(fn: () => Promise<unknown>): Promise<T> {
  try {
    await fn();
  } catch (e) {
    return e as T;
  }
  throw new Error('Expected function to throw');
}
