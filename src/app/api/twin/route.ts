import { geminiResponseToSseStream } from "@/lib/gemini-sse";

export const runtime = "nodejs";

type ExtractDifficulty = "low_mid" | "high";

function getGeminiModelByDifficulty(difficulty: ExtractDifficulty | undefined) {
  // 비용 최적화를 위해 난이도가 낮으면 flash, 높으면 pro를 사용한다.
  if (difficulty === "low_mid") return "gemini-1.5-flash";
  return "gemini-1.5-pro";
}

const SYSTEM_PROMPT = `너는 최고의 수학 강사야. 입력된 수학 문제와 완전히 동일한 유형·난이도이되, 숫자와 조건만 바뀐 '연습문제'를 정확히 3개 만들어줘.
풀이 과정은 절대 포함하지 말고, 오직 [문제]와 [정답]만 작성해.

표기 규칙:
- 문제·정답 본문은 큰 문제 번호(01, 1., 매쓰몬👾 등)나 '문제 1' 같은 UI 라벨을 붙이지 말고, 바로 지문·정답 내용으로 시작해.
- 원본에 소문항이 있을 때만 소문항 앞에 (1), (2), (3)을 붙여. 소문항이 없으면 (1) 같은 번호를 쓰지 마.
- 소문항 줄바꿈 (매우 중요): (1), (2), (3)을 절대 한 줄에 이어 쓰지 마. (2)와 (3) 앞에는 반드시 \\n\\n(빈 줄)을 넣어 각 소문항이 새 단락에서 시작하게 해. 정답란도 (1) 답 \\n\\n (2) 답 \\n\\n (3) 답 형태로 세로로 나열해.
- 그 외 단락 구분에도 \\n\\n을 써서 읽기 쉽게 포맷해.

LaTeX·수식 규칙 (반드시 준수, 정답란 특히 엄격):
- 모든 수식·기호는 LaTeX로만 작성해.
- JSON 문자열 안에서는 백슬래시를 반드시 이중으로 써. 예: \\\\frac{1}{2}, \\\\sqrt{3}, a_n
- 인라인 수식은 반드시 달러 한 쌍으로 감싸고, 달러 바로 안쪽에 공백 한 칸을 둬:  $ 수식 $  (예:  $ a_n = \\\\frac{5}{9}(10^n - 1) $ )
- \\\\frac{}, 거듭제곱 ^, 첨자 _ 등이 들어간 수식은 한 글자도 빼지 말고 전부  $ ... $  안에 넣어. 달러 기호를 빼먹거나 한쪽만 쓰지 마.
- 정답이 수식 하나뿐이어도 반드시  $ ... $  로 감싸.
- 긴 식·여러 줄 식은 $$ ... $$ 블록을 써도 됨.

반드시 아래 JSON 형식만 출력해. 다른 설명, 마크다운 코드블록, 주석은 금지.

{
  "problems": "첫 번째 문제 지문 전체\\n\\n---\\n\\n두 번째 문제\\n\\n---\\n\\n세 번째 문제",
  "answers": " $ 첫 번째 정답 $ \\n\\n---\\n\\n $ 두 번째 정답 $ \\n\\n---\\n\\n $ 세 번째 정답 $ "
}

problems·answers 필드 모두 연습문제 3개를 위→아래 순서로 한 문자열에 넣고, 항목 사이는 반드시 \\n\\n---\\n\\n 로만 구분해.`;

const EXCLUDE_PROBLEMS_PROMPT_PREFIX = `아래는 방금 전에 생성했던 연습문제 3개이다. 이 문제들과 숫자·조건·형태·지문이 겹치지 않는 완전히 새로운 연습문제 3개를 만들어라. 문장 구조만 살짝 바꾼 수준의 변형은 금지한다.

이전에 만든 연습문제:
`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY가 설정되지 않았습니다.", {
      status: 500,
    });
  }

  let body: {
    problemText?: string;
    excludeProblems?: string;
    difficulty?: ExtractDifficulty;
  };
  try {
    body = await request.json();
  } catch {
    return new Response("요청 형식이 올바르지 않습니다.", { status: 400 });
  }

  const problemText = body.problemText?.trim();
  if (!problemText) {
    return new Response("문제 텍스트가 필요합니다.", { status: 400 });
  }

  const excludeProblems = body.excludeProblems?.trim();
  const geminiModel = getGeminiModelByDifficulty(body.difficulty);
  const contentParts: { text: string }[] = [
    { text: SYSTEM_PROMPT },
    { text: `입력된 원본 문제:\n\n${problemText}` },
  ];
  if (excludeProblems) {
    contentParts.push({
      text: `${EXCLUDE_PROBLEMS_PROMPT_PREFIX}\n\n${excludeProblems}`,
    });
  }

  const geminiUrl = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent`,
  );
  geminiUrl.searchParams.set("alt", "sse");
  geminiUrl.searchParams.set("key", apiKey);

  const geminiResponse = await fetch(geminiUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: contentParts }],
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
