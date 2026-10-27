/** Bounds SDK initialization as well as network waits; late resolutions are ignored. */
export async function withAuthTimeout<T>(operation: PromiseLike<T>, milliseconds = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([Promise.resolve(operation), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('La validación demoró demasiado. Verificá tu conexión e intentá nuevamente.')), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}
