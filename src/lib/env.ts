export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getRequiredEnv("JWT_SECRET"));
}

export function getErpWorkerUrl(): string {
  return getRequiredEnv("ERP_WORKER_URL").replace(/\/+$/, "");
}
