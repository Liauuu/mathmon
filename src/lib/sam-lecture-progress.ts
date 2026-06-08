import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { mathmonWrongProblemId, type SamPracticeParams } from "@/lib/sam-integration";
import type { ProblemGradeStatus } from "@/lib/problem-vaults";

export async function syncSamLectureProgressFromVault(input: {
  sam: SamPracticeParams;
  vaultProblemId: string;
  status: ProblemGradeStatus;
}): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user || user.uid !== input.sam.studentId) {
    throw new Error("쌤 진행도 연동을 위해 로그인이 필요합니다.");
  }

  const problemId = mathmonWrongProblemId(input.vaultProblemId);
  const progressId = `${input.sam.studentId}_${input.sam.lectureId}`;

  await setDoc(
    doc(getFirebaseFirestore(), "student_lecture_progress", progressId),
    {
      progressId,
      studentUid: input.sam.studentId,
      lectureId: input.sam.lectureId,
      classId: input.sam.classId,
      teacherUid: input.sam.teacherUid,
      attempts: { [problemId]: input.status },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
