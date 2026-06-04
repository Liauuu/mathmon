import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";
import { mathmonWrongProblemId, type SamPracticeParams } from "@/lib/sam-integration";

export async function syncSamWrongAnswerFromVault(input: {
  sam: SamPracticeParams;
  vaultProblemId: string;
  problemText: string;
  answerText: string;
}): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user || user.uid !== input.sam.studentId) {
    throw new Error("쌤 오답노트 연동을 위해 로그인이 필요합니다.");
  }

  const problemId = mathmonWrongProblemId(input.vaultProblemId);
  const wrongId = `${input.sam.studentId}_${problemId}`;

  await setDoc(
    doc(getFirebaseFirestore(), "student_wrong_answers", wrongId),
    {
      wrongId,
      studentUid: input.sam.studentId,
      teacherUid: input.sam.teacherUid,
      classId: input.sam.classId,
      lectureId: input.sam.lectureId,
      problemId,
      problemText: input.problemText,
      answerText: input.answerText,
      source: "mathmon",
      mathmonVaultId: input.sam.vaultId,
      mathmonVaultProblemId: input.vaultProblemId,
      wrongAt: serverTimestamp(),
    },
    { merge: true },
  );
}
