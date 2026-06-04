export type SamPracticeParams = {
  from: "sam";
  studentId: string;
  vaultId: string;
  teacherUid: string;
  lectureId: string;
  classId: string;
};

const DEFAULT_SAM_APP_URL = "https://sam-two-tau.vercel.app";

export function getSamAppUrl(): string {
  const base = process.env.NEXT_PUBLIC_SAM_APP_URL?.trim();
  return base && base.length > 0 ? base.replace(/\/$/, "") : DEFAULT_SAM_APP_URL;
}

export function parseSamPracticeParams(
  search: string,
): SamPracticeParams | null {
  const params = new URLSearchParams(search);
  if (params.get("from") !== "sam") return null;

  const studentId = params.get("studentId")?.trim();
  const vaultId = params.get("vaultId")?.trim();
  const teacherUid = params.get("teacherUid")?.trim();
  const lectureId = params.get("lectureId")?.trim();
  const classId = params.get("classId")?.trim();

  if (!studentId || !vaultId || !teacherUid || !lectureId || !classId) {
    return null;
  }

  return {
    from: "sam",
    studentId,
    vaultId,
    teacherUid,
    lectureId,
    classId,
  };
}

export function buildSamLectureResumeUrl(
  params: Pick<SamPracticeParams, "lectureId" | "classId" | "teacherUid">,
): string {
  const url = new URL(getSamAppUrl());
  url.searchParams.set("resumeLecture", params.lectureId);
  url.searchParams.set("resumeClassId", params.classId);
  url.searchParams.set("resumeTeacherUid", params.teacherUid);
  return url.toString();
}

export function mathmonWrongProblemId(vaultProblemId: string): string {
  return `mm_${vaultProblemId}`;
}
