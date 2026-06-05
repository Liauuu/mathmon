"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import MathProblemPreview from "@/components/MathProblemPreview";
import TwinResultSection from "@/components/TwinResultSection";
import { parseTextSseStream } from "@/lib/gemini-sse";
import { parseTwinJson } from "@/lib/parse-twin-json";
import { parseExtractJson, type ExtractDifficulty } from "@/lib/parse-extract-json";

const TWIN_CONFIRM_MESSAGE =
  "연습문제 생성 후에는 새로 생성된 문제만 화면에 보이고, 기존에 올린 사진 문제는 지워집니다. 진행하시겠습니까?";

type Phase = "upload" | "twins";

type MathProblemUploadButtonProps = {
  userId: string;
};

export default function MathProblemUploadButton({
  userId,
}: MathProblemUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("upload");
  const [extractedText, setExtractedText] = useState("");
  const [extractedDifficulty, setExtractedDifficulty] = useState<ExtractDifficulty | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTwinProcessing, setIsTwinProcessing] = useState(false);
  const [twinProblems, setTwinProblems] = useState("");
  const [twinAnswers, setTwinAnswers] = useState("");
  const [twinSourceText, setTwinSourceText] = useState("");
  const [isTwinError, setIsTwinError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExtracted =
    phase === "upload" &&
    extractedDifficulty !== null &&
    extractedText.trim().length > 0 &&
    !isExtracting;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setExtractedText("");
    setExtractedDifficulty(null);
    setIsExtracting(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
      });

      const formData = new FormData();
      formData.append("image", compressed, compressed.name || "problem.webp");

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || "수식 추출에 실패했습니다.");
      }

      let accumulated = "";
      await parseTextSseStream(response, (chunk) => {
        accumulated += chunk;
      });

      const parsed = parseExtractJson(accumulated);
      if (!parsed?.text?.trim()) {
        throw new Error("수식/난이도 응답 형식을 해석하지 못했습니다.");
      }

      setExtractedText(parsed.text);
      setExtractedDifficulty(parsed.difficulty);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function runTwinGeneration(
    problemText: string,
    excludeProblems?: string,
  ) {
    setIsTwinError(false);
    setTwinProblems("");
    setTwinAnswers("");
    setIsTwinProcessing(true);

    try {
      const difficultyToUse: ExtractDifficulty = extractedDifficulty ?? "high";

      const payload: {
        problemText: string;
        excludeProblems?: string;
        difficulty?: ExtractDifficulty;
      } = { problemText, difficulty: difficultyToUse };
      const trimmedExclude = excludeProblems?.trim();
      if (trimmedExclude) {
        payload.excludeProblems = trimmedExclude;
      }

      const response = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || "연습문제 생성에 실패했습니다.");
      }

      let accumulated = "";
      await parseTextSseStream(response, (chunk) => {
        accumulated += chunk;
        const parsed = parseTwinJson(accumulated);
        if (parsed) {
          setTwinProblems(parsed.problems);
          setTwinAnswers(parsed.answers);
        }
      });

      const final = parseTwinJson(accumulated);
      if (!final?.problems.trim() || !final?.answers.trim()) {
        throw new Error("연습문제 응답 형식을 해석하지 못했습니다.");
      }
      setTwinProblems(final.problems);
      setTwinAnswers(final.answers);
    } catch {
      setIsTwinError(true);
    } finally {
      setIsTwinProcessing(false);
    }
  }

  async function handleTwinGenerate() {
    if (!extractedText.trim() || extractedDifficulty === null) return;

    const confirmed = window.confirm(TWIN_CONFIRM_MESSAGE);
    if (!confirmed) return;

    const problemText = extractedText;
    setTwinSourceText(problemText);
    setPhase("twins");
    setError(null);
    await runTwinGeneration(problemText);
  }

  async function handleTwinRetry() {
    if (!twinSourceText.trim() || isTwinProcessing) return;
    await runTwinGeneration(twinSourceText);
  }

  async function handleTwinMore() {
    if (!twinSourceText.trim() || !twinProblems.trim() || isTwinProcessing) {
      return;
    }
    await runTwinGeneration(twinSourceText, twinProblems);
  }

  function handleResetToUpload() {
    setPhase("upload");
    setExtractedText("");
    setExtractedDifficulty(null);
    setTwinProblems("");
    setTwinAnswers("");
    setTwinSourceText("");
    setIsTwinError(false);
    setIsExtracting(false);
    setIsTwinProcessing(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  if (phase === "twins") {
    return (
      <TwinResultSection
        userId={userId}
        originalExtractedText={twinSourceText}
        problems={twinProblems}
        answers={twinAnswers}
        isProcessing={isTwinProcessing}
        isTwinError={isTwinError}
        onRetry={handleTwinRetry}
        onGenerateMore={handleTwinMore}
        onResetToHome={handleResetToUpload}
      />
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <p
        role="note"
        className="w-full rounded-2xl border border-[#84cc16]/50 bg-[#1f2937]/90 px-4 py-3.5 text-center text-sm leading-relaxed text-gray-200 shadow-lg shadow-[#84cc16]/10"
      >
        AI가 정확히 문제를 만들 수 있게{" "}
        <span className="font-bold text-[#fde047]">&apos;한 문항&apos;</span>만{" "}
        <span className="font-bold text-[#a3e635]">&apos;선명히&apos;</span> 찍힌
        사진을 올려주세요.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isExtracting}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isExtracting}
        className="flex h-14 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/40 bg-[#84cc16] px-6 text-base font-bold text-[#111827] shadow-lg shadow-[#84cc16]/20 transition-all hover:bg-[#a3e635] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExtracting ? "AI가 문제를 읽는 중..." : "수학 문제 사진 업로드"}
      </button>

      {error ? (
        <p className="w-full text-center text-sm text-red-400">{error}</p>
      ) : null}

      <MathProblemPreview
        content={extractedText}
        isProcessing={isExtracting}
      />

      {hasExtracted ? (
        <button
          type="button"
          onClick={handleTwinGenerate}
          disabled={isExtracting}
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/50 bg-[#84cc16]/90 px-5 text-sm font-bold text-[#111827] shadow-md shadow-[#84cc16]/25 transition-all hover:bg-[#a3e635] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          연습문제 3개 생성하기 👾
        </button>
      ) : null}
    </div>
  );
}
