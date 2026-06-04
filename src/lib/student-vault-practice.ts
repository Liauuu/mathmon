import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { ProblemGradeStatus } from "@/lib/problem-vaults";

function gradeDocId(studentUid: string, vaultProblemId: string): string {
  return `${studentUid}_${vaultProblemId}`;
}

export async function loadStudentVaultProblemGrade(
  studentUid: string,
  vaultProblemId: string,
): Promise<ProblemGradeStatus | undefined> {
  const snap = await getDoc(
    doc(
      getFirebaseFirestore(),
      "student_vault_practice_grades",
      gradeDocId(studentUid, vaultProblemId),
    ),
  );
  if (!snap.exists()) return undefined;
  const status = snap.data().gradeStatus;
  return status === "correct" || status === "incorrect" ? status : undefined;
}

export async function saveStudentVaultProblemGrade(
  studentUid: string,
  teacherUid: string,
  vaultId: string,
  vaultProblemId: string,
  gradeStatus: ProblemGradeStatus,
): Promise<void> {
  const gradeId = gradeDocId(studentUid, vaultProblemId);
  await setDoc(
    doc(getFirebaseFirestore(), "student_vault_practice_grades", gradeId),
    {
      gradeId,
      studentUid,
      teacherUid,
      vaultId,
      vaultProblemId,
      gradeStatus,
      gradedAt: Date.now(),
    },
    { merge: true },
  );
}

export async function loadStudentVaultGrades(
  studentUid: string,
  problemIds: string[],
): Promise<Record<string, ProblemGradeStatus>> {
  const grades: Record<string, ProblemGradeStatus> = {};
  await Promise.all(
    problemIds.map(async (problemId) => {
      const status = await loadStudentVaultProblemGrade(studentUid, problemId);
      if (status) grades[problemId] = status;
    }),
  );
  return grades;
}
