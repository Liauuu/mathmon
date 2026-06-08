import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase";
import type { GraphData, TwinProblemItem } from "@/lib/parse-twin-json";

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

export async function loadVaultById(
  userId: string,
  vaultId: string,
): Promise<ProblemVault | null> {
  const snap = await getDoc(vaultDoc(userId, vaultId));
  if (!snap.exists()) return null;
  return vaultFromDoc(snap.id, snap.data());
}

export async function createVault(
  userId: string,
  name: string,
): Promise<ProblemVault> {
  const trimmed = assertVaultName(name);

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

export type ProblemGradeStatus = "correct" | "incorrect";

export type VaultProblem = {
  id: string;
  problem: string;
  answer: string;
  svg_code?: string;
  graph_data?: GraphData;
  /** 쌍둥이 3문항 세트 안의 위치(0–2). 전역 표시 순서는 vault.problemIds 로 관리 */
  index: number;
  savedAt: number;
  gradeStatus?: ProblemGradeStatus;
};

function parseGradeStatus(data: DocumentData): ProblemGradeStatus | undefined {
  const g = data.gradeStatus;
  if (g === "correct" || g === "incorrect") return g;
  return undefined;
}

function parseGraphData(value: unknown): GraphData | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Partial<GraphData>;
  if (!Array.isArray(data.data) || data.data.length === 0) return undefined;
  return data as GraphData;
}

function problemFromDoc(id: string, data: DocumentData): VaultProblem {
  const savedAt = data.savedAt;
  const svgCode =
    typeof data.svg_code === "string" && data.svg_code.trim()
      ? data.svg_code
      : undefined;
  const graphData = parseGraphData(data.graph_data);

  return {
    id,
    problem: typeof data.problem === "string" ? data.problem : "",
    answer: typeof data.answer === "string" ? data.answer : "",
    svg_code: svgCode,
    graph_data: graphData,
    index: typeof data.index === "number" ? data.index : 0,
    savedAt:
      typeof savedAt === "number"
        ? savedAt
        : savedAt?.toMillis?.() ?? 0,
    gradeStatus: parseGradeStatus(data),
  };
}

export async function saveVaultProblemGrade(
  userId: string,
  vaultId: string,
  problemId: string,
  gradeStatus: ProblemGradeStatus,
): Promise<void> {
  await updateDoc(
    doc(vaultProblemsCollection(userId, vaultId), problemId),
    { gradeStatus },
  );
}

/** vault.problemIds 끝이 최신 저장 → 표시는 역순(최신이 위) */
export function vaultProblemIdsNewestFirst(problemIds: string[]): string[] {
  return [...problemIds].reverse();
}

export async function loadVaultProblems(
  userId: string,
  vaultId: string,
  problemIds: string[],
): Promise<VaultProblem[]> {
  if (problemIds.length === 0) return [];

  const orderedIds = vaultProblemIdsNewestFirst(problemIds);
  const snapshot = await getDocs(vaultProblemsCollection(userId, vaultId));
  const byId = new Map(
    snapshot.docs.map((d) => [d.id, problemFromDoc(d.id, d.data())]),
  );

  return orderedIds
    .map((id) => byId.get(id))
    .filter((p): p is VaultProblem => p !== undefined);
}

/**
 * 표시 목록(최신순)에서 인접 문항 순서를 바꾸고 vault.problemIds 에 반영.
 * Firestore `index`(0–2)는 세트 내부용이라 건드리지 않음.
 */
export async function swapVaultProblemsInDisplayOrder(
  userId: string,
  vaultId: string,
  problemIds: string[],
  displayIndex: number,
  direction: "up" | "down",
): Promise<string[]> {
  const displayIds = vaultProblemIdsNewestFirst(problemIds);
  const swapWith = direction === "up" ? displayIndex - 1 : displayIndex + 1;
  if (swapWith < 0 || swapWith >= displayIds.length) {
    return problemIds;
  }

  [displayIds[displayIndex], displayIds[swapWith]] = [
    displayIds[swapWith],
    displayIds[displayIndex],
  ];

  const newProblemIds = [...displayIds].reverse();
  await updateDoc(vaultDoc(userId, vaultId), { problemIds: newProblemIds });
  return newProblemIds;
}

function assertVaultName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("저장소 이름을 입력해 주세요.");
  }
  return trimmed;
}

export async function updateVaultName(
  userId: string,
  vaultId: string,
  name: string,
): Promise<void> {
  const trimmed = assertVaultName(name);
  await updateDoc(vaultDoc(userId, vaultId), { name: trimmed });
}

/** 유저 vault·하위 problems만 삭제. ai_training_data는 건드리지 않음. */
export async function deleteVault(
  userId: string,
  vaultId: string,
): Promise<void> {
  const db = getFirebaseFirestore();
  const problemsSnap = await getDocs(
    vaultProblemsCollection(userId, vaultId),
  );

  const BATCH_LIMIT = 500;
  for (let i = 0; i < problemsSnap.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const problemDoc of problemsSnap.docs.slice(i, i + BATCH_LIMIT)) {
      batch.delete(problemDoc.ref);
    }
    await batch.commit();
  }

  await deleteDoc(vaultDoc(userId, vaultId));
}

export type SaveTwinProblemsInput = {
  originalExtractedText: string;
  items: TwinProblemItem[];
};

export async function saveTwinProblemsToVault(
  userId: string,
  vaultId: string,
  input: SaveTwinProblemsInput,
): Promise<void> {
  const items = input.items;
  if (items.length !== 3) {
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
      const item = items[i];
      const problemRef = doc(vaultProblemsCollection(userId, vaultId));
      newProblemIds.push(problemRef.id);

      const payload: Record<string, unknown> = {
        problem: item.question,
        answer: item.solution,
        index: i,
        savedAt: serverTimestamp(),
      };
      if (item.svg_code) payload.svg_code = item.svg_code;
      if (item.graph_data) payload.graph_data = item.graph_data;

      transaction.set(problemRef, payload);
    }

    transaction.update(vaultRef, {
      problemIds: [...currentIds, ...newProblemIds],
    });

    const trainingRef = doc(collection(db, "ai_training_data"));
    transaction.set(trainingRef, {
      original_extracted_text: input.originalExtractedText,
      generated_twin_problems: {
        items,
      },
      saved_at: serverTimestamp(),
      userId,
      vaultId,
    });
  });
}
