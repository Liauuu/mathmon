import { geminiResponseToSseStream } from "@/lib/gemini-sse";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-pro";

const SYSTEM_PROMPT = `너는 최고의 수학 강사야. 입력된 수학 문제와 완전히 동일한 유형·난이도이되, 숫자와 조건만 바뀐 '연습문제'를 정확히 3개 만들어줘.
풀이 과정은 절대 포함하지 말고, 오직 [문제]와 [정답]만 작성해.
모든 수학 기호와 수식은 반드시 LaTeX로 작성하고, 인라인은 $...$, 블록은 $$...$$ 규칙을 철저히 지켜.

문제 번호·표기 규칙 (반드시 준수):
1) 각 연습문제의 큰 문제 시작은 반드시 고정 텍스트 '매쓰몬👾'로 시작해. 시험지 번호(01, 02, 01-1 등)나 '1.', '2.' 같은 큰 문제 번호는 쓰지 마.
2) 큰 문제 아래에 딸린 소문항이 있을 때만 소문항 앞에 (1), (2), (3) 형식의 번호를 붙여. 소문항이 없으면 (1) 같은 번호를 붙이지 마.
3) 문제·정답 본문은 \\n 줄바꿈으로 단락을 나눠 읽기 쉽게 포맷해. 조건·보기·식 사이에도 필요하면 빈 줄(\\n\\n)을 넣어.

반드시 아래 JSON 형식만 출력해. 다른 설명, 마크다운 코드블록, 주석은 금지.

{
  "problems": "매쓰몬👾 첫 번째 문제 전체\\n\\n---\\n\\n매쓰몬👾 두 번째 문제\\n\\n---\\n\\n매쓰몬👾 세 번째 문제",
  "answers": "첫 번째 정답만 (풀이 없음)\\n\\n---\\n\\n두 번째 정답\\n\\n---\\n\\n세 번째 정답"
}

problems 필드: 연습문제 3개를 위에서 아래 순서로 한 문자열에 넣고, 문제와 문제 사이는 반드시 \\n\\n---\\n\\n 로만 구분해.
answers 필드: 각 연습문제의 정답만 같은 순서로 넣고, 정답과 정답 사이도 \\n\\n---\\n\\n 로만 구분해. 정답 앞에 1., 2. 같은 번호나 '매쓰몬👾'는 붙이지 마.`;

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
