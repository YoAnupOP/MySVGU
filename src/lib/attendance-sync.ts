import { decryptErpPassword } from "@/lib/erpCrypto";
import {
  ErpWorkerError,
  fetchErpAttendance,
  type ErpAttendanceResponse,
  type ErpAttendanceSubject,
} from "@/lib/erpWorker";
import prisma from "@/lib/prisma";

/** Cache TTL — attendance snapshots older than this trigger a fresh ERP scrape. */
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export interface CachedAttendanceResponse {
  student: { classId: string; studentId: string; name: string };
  overall: { present: number; total: number; percentage: number };
  subjects: ErpAttendanceSubject[];
  fetchedAt: string;
  lastSyncedAt: string;
  source: "cache" | "erp-live";
}

/**
 * Per-student in-memory lock.
 * If a scrape is already running for a given userId, subsequent callers
 * await the same promise instead of launching parallel Puppeteer instances.
 */
const inflightScrapes = new Map<string, Promise<CachedAttendanceResponse>>();

/**
 * Retrieve attendance for a student — cache-first unless `forceRefresh` is set.
 *
 * @param userId  The authenticated user's id (not studentId).
 * @param forceRefresh  When true, skips the cache and triggers a live ERP scrape.
 */
export async function getAttendance(
  userId: string,
  forceRefresh: boolean,
): Promise<CachedAttendanceResponse> {
  // ── 1. Try cache (unless force-refresh) ──────────────────────────────
  if (!forceRefresh) {
    const snapshot = await prisma.attendanceSnapshot.findUnique({
      where: { userId },
      include: {
        user: {
          select: { classId: true, studentId: true, name: true },
        },
      },
    });

    if (snapshot) {
      const ageMs = Date.now() - snapshot.lastSyncedAt.getTime();

      if (ageMs < CACHE_MAX_AGE_MS) {
        const subjects: ErpAttendanceSubject[] = JSON.parse(snapshot.subjectsJson);
        return {
          student: {
            classId: snapshot.user.classId,
            studentId: snapshot.user.studentId,
            name: snapshot.studentName || snapshot.user.name,
          },
          overall: {
            present: snapshot.attended,
            total: snapshot.total,
            percentage: snapshot.attendancePct,
          },
          subjects,
          fetchedAt: snapshot.lastSyncedAt.toISOString(),
          lastSyncedAt: snapshot.lastSyncedAt.toISOString(),
          source: "cache",
        };
      }
    }
  }

  // ── 2. Coalesce concurrent scrapes for the same student ──────────────
  const existing = inflightScrapes.get(userId);
  if (existing) {
    return existing;
  }

  const scrapePromise = performScrapeAndCache(userId);
  inflightScrapes.set(userId, scrapePromise);

  try {
    return await scrapePromise;
  } finally {
    inflightScrapes.delete(userId);
  }
}

/**
 * Actually scrape ERP attendance & persist the snapshot.
 * This function is never called directly — always go through `getAttendance`.
 */
async function performScrapeAndCache(
  userId: string,
): Promise<CachedAttendanceResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      classId: true,
      studentId: true,
      name: true,
      erpCredential: { select: { passwordCiphertext: true } },
    },
  });

  if (!user || !user.erpCredential) {
    throw new Error("User or ERP credentials not found.");
  }

  const password = decryptErpPassword(user.erpCredential.passwordCiphertext);

  const attendance: ErpAttendanceResponse = await fetchErpAttendance({
    classId: user.classId,
    studentId: user.studentId,
    password,
  });

  const now = new Date();

  // Persist the snapshot (upsert — one row per student).
  await prisma.attendanceSnapshot.upsert({
    where: { userId },
    update: {
      attendancePct: attendance.overall.percentage,
      attended: attendance.overall.present,
      total: attendance.overall.total,
      subjectsJson: JSON.stringify(attendance.subjects),
      studentName: attendance.student.name || null,
      lastSyncedAt: now,
    },
    create: {
      userId,
      attendancePct: attendance.overall.percentage,
      attended: attendance.overall.present,
      total: attendance.overall.total,
      subjectsJson: JSON.stringify(attendance.subjects),
      studentName: attendance.student.name || null,
      lastSyncedAt: now,
    },
  });

  // Update ERP credential health.
  await prisma.erpCredential.update({
    where: { userId },
    data: { lastVerifiedAt: now, lastError: null },
  });

  // Sync student name if ERP returned one.
  if (attendance.student.name) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: attendance.student.name,
        profile: {
          upsert: {
            update: { classId: user.classId },
            create: { classId: user.classId },
          },
        },
      },
    });
  }

  return {
    student: {
      classId: user.classId,
      studentId: user.studentId,
      name: attendance.student.name || user.name,
    },
    overall: attendance.overall,
    subjects: attendance.subjects,
    fetchedAt: now.toISOString(),
    lastSyncedAt: now.toISOString(),
    source: "erp-live",
  };
}
