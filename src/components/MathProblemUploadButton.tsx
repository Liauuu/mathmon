"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import MathProblemPreview from "@/components/MathProblemPreview";
import TwinResultSection from "@/components/TwinResultSection";
import { parseTextSseStream } from "@/lib/gemini-sse";
import { parseTwinJson } from "@/lib/parse-twin-json";

const TWIN_CONFIRM_MESSAGE =
  "기존 사진 문제는 저작권 문제 위험이 있어 삭제되며, 새로 생성된 3개의 쌍둥이 문제만 화면에 남게 됩니다. 진행하시겠습니까?";

type Phase = "upload" | "twins";

export default function MathProblemUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("upload");
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTwinProcessing, setIsTwinProcessing] = useState(false);
  const [twinProblems, setTwinProblems] = useState("");
  const [twinAnswers, setTwinAnswers] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasExtracted =
    phase === "upload" && extractedText.trim().length > 0 && !isExtracting;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setExtractedText("");
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
        setExtractedText(accumulated);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleTwinGenerate() {
    if (!extractedText.trim()) return;

    const confirmed = window.confirm(TWIN_CONFIRM_MESSAGE);
    if (!confirmed) return;

    const problemText = extractedText;

    setPhase("twins");
    setExtractedText("");
    setTwinProblems("");
    setTwinAnswers("");
    setError(null);
    setIsTwinProcessing(true);

    try {
      const response = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemText }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || "쌍둥이 문제 생성에 실패했습니다.");
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
        throw new Error("쌍둥이 문제 응답 형식을 해석하지 못했습니다.");
      }
      setTwinProblems(final.problems);
      setTwinAnswers(final.answers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "쌍둥이 문제 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsTwinProcessing(false);
    }
  }

  if (phase === "twins") {
    return (
      <TwinResultSection
        problems={twinProblems}
        answers={twinAnswers}
        isProcessing={isTwinProcessing}
        error={error}
      />
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <p
        role="note"
        className="w-full rounded-2xl border-2 border-[#84cc16]/60 bg-[#84cc16]/15 px-4 py-3 text-center text-sm font-semibold leading-relaxed text-[#d9f99d] shadow-[0_0_24px_rgba(132,204,22,0.25)]"
      >
        <span className="text-[#a3e635]">⚠️</span> 사진에 텍스트가 최대한 정확하고
        선명하게 보이도록 찍어주세요! 글자가 흐리거나 깨지면 AI 문제 생성이 원활하지
        않을 수 있습니다. <span className="text-[#84cc16]">👾</span>
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
          쌍둥이 문제 3개 만들기
        </button>
      ) : null}
    </div>
  );
}
