import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";

export type ProblemVault = {
  id: string;
  name: string;
  problemIds: string[];
  createdAt: number;
};

function vaultsCollection(userId: string) {
  return collection(getFirebaseFirestore(), "users", userId, "vaults");
}

function vaultDoc(userId: string, vaultId: string) {
  return doc(getFirebaseFirestore(), "users", userId, "vaults", vaultId);
}

function vaultProblemsCollection(userId: string, vaultId: string) {
  return collection(
    getFirebaseFirestore(),
    "users",
    userId,
    "vaults",
    vaultId,
    "problems",
  );
}

function vaultFromDoc(id: string, data: DocumentData): ProblemVault {
  const createdAt = data.createdAt;
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    problemIds: Array.isArray(data.problemIds)
      ? (data.problemIds as string[])
      : [],
    createdAt:
      typeof createdAt === "number"
        ? createdAt
        : createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function loadVaults(userId: string): Promise<ProblemVault[]> {
  const q = query(vaultsCollection(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => vaultFromDoc(d.id, d.data()));
}

export async function createVault(
  userId: string,
  name: string,
): Promise<ProblemVault> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("저장소 이름을 입력해 주세요.");
  }

  const createdAt = Date.now();
  const ref = await addDoc(vaultsCollection(userId), {
    name: trimmed,
    problemIds: [],
    createdAt,
  });

  return {
    id: ref.id,
    name: trimmed,
    problemIds: [],
    createdAt,
  };
}

export function getVaultItemCount(vault: ProblemVault): number {
  return vault.problemIds.length;
}

export type SaveTwinProblemsInput = {
  originalExtractedText: string;
  problems: string;
  answers: string;
  problemParts: string[];
  answerParts: string[];
};

export async function saveTwinProblemsToVault(
  userId: string,
  vaultId: string,
  input: SaveTwinProblemsInput,
): Promise<void> {
  const parts = input.problemParts;
  const answers = input.answerParts;
  if (parts.length !== 3 || answers.length !== 3) {
    throw new Error("저장할 연습문제가 3개가 아닙니다.");
  }

  const db = getFirebaseFirestore();
  const vaultRef = vaultDoc(userId, vaultId);

  await runTransaction(db, async (transaction) => {
    const vaultSnap = await transaction.get(vaultRef);
    if (!vaultSnap.exists()) {
      throw new Error("저장소를 찾을 수 없습니다.");
    }

    const currentIds = vaultFromDoc(vaultId, vaultSnap.data()).problemIds;
    const newProblemIds: string[] = [];

    for (let i = 0; i < 3; i += 1) {
      const problemRef = doc(vaultProblemsCollection(userId, vaultId));
      newProblemIds.push(problemRef.id);
      transaction.set(problemRef, {
        problem: parts[i],
        answer: answers[i],
        index: i,
        savedAt: serverTimestamp(),
      });
    }

    transaction.update(vaultRef, {
      problemIds: [...currentIds, ...newProblemIds],
    });

    const trainingRef = doc(collection(db, "ai_training_data"));
    transaction.set(trainingRef, {
      original_extracted_text: input.originalExtractedText,
      generated_twin_problems: {
        problems: input.problems,
        answers: input.answers,
      },
      saved_at: serverTimestamp(),
      userId,
      vaultId,
    });
  });
}
