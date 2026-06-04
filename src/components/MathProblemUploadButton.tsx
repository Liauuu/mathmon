"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import MathProblemPreview from "@/components/MathProblemPreview";

async function parseExtractStream(
  response: Response,
  onChunk: (text: string) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload) as {
          text?: string;
          error?: string;
        };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) onChunk(parsed.text);
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

export default function MathProblemUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setExtractedText("");
    setIsProcessing(true);

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
      await parseExtractStream(response, (chunk) => {
        accumulated += chunk;
        setExtractedText(accumulated);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsProcessing(false);
    }
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
        disabled={isProcessing}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isProcessing}
        className="flex h-14 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/40 bg-[#84cc16] px-6 text-base font-bold text-[#111827] shadow-lg shadow-[#84cc16]/20 transition-all hover:bg-[#a3e635] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? "AI가 문제를 읽는 중..." : "수학 문제 사진 업로드"}
      </button>

      {error ? (
        <p className="w-full text-center text-sm text-red-400">{error}</p>
      ) : null}

      <MathProblemPreview
        content={extractedText}
        isProcessing={isProcessing}
      />
    </div>
  );
}
