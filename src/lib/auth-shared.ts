export interface AuthUser {
  id: string;
  name: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  classId: string;
  studentId: string;
  profile?: {
    enrollmentNo?: string;
    classId?: string;
    semester?: string;
    course?: string;
    avatarUrl?: string;
  };
}