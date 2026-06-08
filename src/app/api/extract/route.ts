import { geminiResponseToSseStream } from "@/lib/gemini-sse";
import { GEMINI_FLASH_MODEL } from "@/lib/gemini-models";

export const runtime = "nodejs";

const PROMPT = `너는 최고의 수학 문제 OCR AI야.

이미지에서 수학 문제의 텍스트와 수식을 정확하게 추출해줘.
모든 수학 기호와 수식은 반드시 LaTeX 문법을 사용해 $ 기호로 감싸줘 (예: $y = ax + b$).
불필요한 설명 없이 문제 내용만 추출해 "text"에 넣어라.

동시에 아래 항목을 판정해라.

1) 난이도 (difficulty)
너의 난이도 판정 결과에 따라 시스템은 다음 단계에서 비용이 저렴한 Flash 모델을 계속 쓸지,
혹은 비용이 훨씬 비싼 프리미엄 Pro 모델을 깨워서 풀릴 것이다.
단순 연산이나 개념 문제는 반드시 'low_mid'로 판정하여 비용을 아끼고,
추론이 필요한 복잡한 심화/수능 4점 문항은 'high'로 판정해라.

2) 도형 유무 (has_geometry)
문제에 삼각형, 원, 다각형, 좌표평면 위의 도형, 각도 표시, 길이/넓이를 나타내는 기하 도형 그림이 있으면 true.
순수 수식·문장만 있으면 false.

3) 그래프 유무 (has_graph)
문제에 함수 그래프, 좌표평면 위의 곡선/직선, 포물선·삼각함수 그래프, (x,y) 축이 있는 좌표 그래프가 있으면 true.
도형만 있고 함수 그래프가 없으면 false.

반드시 아래 JSON 형식만 출력해. 다른 설명, 마크다운 코드블록, 주석은 금지.

{
  "text": "추출된 문제 지문 전체(문자열)",
  "difficulty": "low_mid" | "high",
  "has_geometry": true | false,
  "has_graph": true | false
}

주의:
- JSON 문자열 안의 백슬래시(예: \\frac, \\sqrt)는 JSON escape 규칙에 맞게 반드시 이스케이프(\\\\)해서 출력해라.
- "text"에는 UI 라벨/문제 번호 같은 접두어를 붙이지 마라. 바로 지문 내용부터 시작해라.
- has_geometry, has_graph는 반드시 boolean(true/false)으로 출력해라.`;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY가 설정되지 않았습니다.", {
      status: 500,
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("요청 형식이 올바르지 않습니다.", { status: 400 });
  }

  const file = formData.get("image");
  if (!file || !(file instanceof Blob)) {
    return new Response("이미지 파일이 필요합니다.", { status: 400 });
  }

  const mimeType = file.type || "image/webp";
  const base64 = arrayBufferToBase64(await file.arrayBuffer());

  const geminiUrl = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASH_MODEL}:streamGenerateContent`,
  );
  geminiUrl.searchParams.set("alt", "sse");
  geminiUrl.searchParams.set("key", apiKey);

  const geminiResponse = await fetch(geminiUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    return new Response(errText || "Gemini API 호출에 실패했습니다.", {
      status: geminiResponse.status,
    });
  }

  if (!geminiResponse.body) {
    return new Response("스트림 응답을 받지 못했습니다.", { status: 502 });
  }

  return new Response(geminiResponseToSseStream(geminiResponse), {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
