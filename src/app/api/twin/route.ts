import { geminiResponseToSseStream } from "@/lib/gemini-sse";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-pro";

const SYSTEM_PROMPT = `너는 최고의 수학 강사야. 입력된 수학 문제와 완전히 동일하되, 숫자가 바뀐 '쌍둥이 문제'를 정확히 3개 만들어줘.
풀이 과정은 절대 포함하지 말고, 오직 [문제 영역]과 [정답 영역]만 작성해.
모든 수학 기호와 수식은 반드시 LaTeX로 작성하고, 인라인은 $...$, 블록은 $$...$$ 규칙을 철저히 지켜.

반드시 아래 JSON 형식만 출력해. 다른 설명, 마크다운 코드블록, 주석은 금지.

{
  "problems": "1. 첫 번째 문제 전체 텍스트\\n2. 두 번째 문제\\n3. 세 번째 문제",
  "answers": "1. [정답]\\n2. [정답]\\n3. [정답]"
}

problems 필드에는 번호 1~3이 붙은 문제 3개를 한 문자열에 넣고, answers 필드에는 각 문제의 정답만 번호와 함께 넣어.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY가 설정되지 않았습니다.", {
      status: 500,
    });
  }

  let body: { problemText?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("요청 형식이 올바르지 않습니다.", { status: 400 });
  }

  const problemText = body.problemText?.trim();
  if (!problemText) {
    return new Response("문제 텍스트가 필요합니다.", { status: 400 });
  }

  const geminiUrl = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`,
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
            { text: SYSTEM_PROMPT },
            { text: `입력된 원본 문제:\n\n${problemText}` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
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
