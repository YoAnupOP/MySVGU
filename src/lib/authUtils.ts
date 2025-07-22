export function isUnauthorizedError(error: any): boolean {
  // Placeholder function - replace with actual error checking logic
  return error?.status === 401 || error?.response?.status === 401;
} 