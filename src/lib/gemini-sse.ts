export function extractTextFromGeminiChunk(line: string): string {
  if (!line.startsWith("data: ")) return "";
  const payload = line.slice(6).trim();
  if (!payload || payload === "[DONE]") return "";
  try {
    const json = JSON.parse(payload) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    return (
      json.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? ""
    );
  } catch {
    return "";
  }
}

export function geminiResponseToSseStream(
  geminiResponse: Response,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const reader = geminiResponse.body!.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = "";

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            const text = extractTextFromGeminiChunk(line);
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          }
        }

        if (sseBuffer.trim()) {
          const text = extractTextFromGeminiChunk(sseBuffer.trim());
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "스트림 처리 중 오류";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        );
        controller.close();
      }
    },
  });
}

export async function parseTextSseStream(
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
