type ErrorLike = unknown;

export const extractErrorMessage = (err: ErrorLike, fallback = 'Что-то пошло не так'): string => {
  if (!err) return fallback;

  if (typeof err === 'string') return err;

  if (err instanceof Error && err.message) return err.message;

  if (typeof err === 'object') {
    const anyErr = err as Record<string, unknown>;

    const directMessage = typeof anyErr.message === 'string' ? anyErr.message : null;
    if (directMessage) return directMessage;

    const data = anyErr.data as unknown;
    if (data) {
      if (typeof data === 'string') return data;

      if (typeof data === 'object') {
        const dataRecord = data as Record<string, unknown>;
        if (typeof dataRecord.message === 'string') return dataRecord.message;
        if (typeof dataRecord.error === 'string') return dataRecord.error;
        if (Array.isArray(dataRecord.errors) && dataRecord.errors.length > 0) {
          const first = dataRecord.errors[0];
          if (typeof first === 'string') return first;
          if (first && typeof first === 'object' && 'message' in first && typeof (first as any).message === 'string') {
            return (first as any).message;
          }
        }
      }
    }

    if (typeof anyErr.error === 'string') return anyErr.error;
  }

  return fallback;
};
