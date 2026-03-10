import { getErpWorkerUrl } from "@/lib/env";

export interface ErpCredentials {
  classId: string;
  studentId: string;
  password: string;
}

export interface ErpAttendanceSubject {
  name: string;
  present: number;
  total: number;
  percentage: number;
}

export interface ErpAttendanceResponse {
  student: {
    classId: string;
    studentId: string;
    name: string;
  };
  overall: {
    present: number;
    total: number;
    percentage: number;
  };
  subjects: ErpAttendanceSubject[];
  fetchedAt: string;
  source: "erp-live";
}

interface WorkerErrorPayload {
  error?: string;
  code?: string;
}

export class ErpWorkerError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function erpWorkerRequest<TResponse>(
  path: string,
  credentials: ErpCredentials,
): Promise<TResponse> {
  const response = await fetch(`${getErpWorkerUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | WorkerErrorPayload
    | TResponse
    | null;

  if (!response.ok) {
    const errorPayload = payload as WorkerErrorPayload | null;
    throw new ErpWorkerError(
      errorPayload?.error || "ERP worker request failed.",
      errorPayload?.code || "ERP_WORKER_ERROR",
      response.status,
    );
  }

  return payload as TResponse;
}

export function verifyErpCredentials(credentials: ErpCredentials) {
  return erpWorkerRequest<{
    authenticated: true;
    student: {
      classId: string;
      studentId: string;
      name: string | null;
    };
  }>("/auth/verify", credentials);
}

export function fetchErpAttendance(credentials: ErpCredentials) {
  return erpWorkerRequest<ErpAttendanceResponse>("/attendance", credentials);
}
