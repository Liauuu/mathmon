import { geminiResponseToSseStream } from "@/lib/gemini-sse";
import {
  getGeminiModelForTwin,
  shouldUseProModel,
  type ExtractDifficulty,
} from "@/lib/gemini-models";
import { getTwinResponseSchema } from "@/lib/twin-schemas";
import {
  getProblemVisualType,
  type ProblemVisualFlags,
} from "@/lib/twin-problem-type";

export const runtime = "nodejs";

const LATEX_RULES = `LaTeX·수식 규칙 (반드시 준수, 정답란 특히 엄격):
- 모든 수식·기호는 LaTeX로만 작성해.
- JSON 문자열 안에서는 백슬래시를 반드시 이중으로 써. 예: \\\\frac{1}{2}, \\\\sqrt{3}, a_n
- 인라인 수식은 반드시 달러 한 쌍으로 감싸고, 달러 바로 안쪽에 공백 한 칸을 둬:  $ 수식 $  (예:  $ a_n = \\\\frac{5}{9}(10^n - 1) $ )
- \\\\frac{}, 거듭제곱 ^, 첨자 _ 등이 들어간 수식은 한 글자도 빼지 말고 전부  $ ... $  안에 넣어. 달러 기호를 빼먹거나 한쪽만 쓰지 마.
- 정답이 수식 하나뿐이어도 반드시  $ ... $  로 감싸.
- 긴 식·여러 줄 식은 $$ ... $$ 블록을 써도 됨.`;

const FORMAT_RULES = `표기 규칙:
- 문제·정답 본문은 큰 문제 번호(01, 1., 매쓰몬👾 등)나 '문제 1' 같은 UI 라벨을 붙이지 말고, 바로 지문·정답 내용으로 시작해.
- 원본에 소문항이 있을 때만 소문항 앞에 (1), (2), (3)을 붙여. 소문항이 없으면 (1) 같은 번호를 쓰지 마.
- 소문항 줄바꿈 (매우 중요): (1), (2), (3)을 절대 한 줄에 이어 쓰지 마. (2)와 (3) 앞에는 반드시 \\n\\n(빈 줄)을 넣어 각 소문항이 새 단락에서 시작하게 해. 정답란도 (1) 답 \\n\\n (2) 답 \\n\\n (3) 답 형태로 세로로 나열해.
- 그 외 단락 구분에도 \\n\\n을 써서 읽기 쉽게 포맷해.`;

function buildSystemPrompt(visualType: ReturnType<typeof getProblemVisualType>) {
  const base = `너는 최고의 수학 강사야. 입력된 수학 문제와 완전히 동일한 유형·난이도이되, 숫자와 조건만 바뀐 '연습문제'를 정확히 3개 만들어줘.
풀이 과정은 절대 포함하지 말고, 오직 [문제]와 [정답]만 작성해.

${FORMAT_RULES}

${LATEX_RULES}`;

  const jsonFooter = `반드시 아래 JSON 형식만 출력해. 다른 설명, 마크다운 코드블록, 주석은 금지.
items 배열에 연습문제 3개를 위→아래 순서로 넣어라.`;

  if (visualType === "text") {
    return `${base}

${jsonFooter}

{
  "items": [
    { "question": "첫 번째 문제 지문", "solution": " $ 첫 번째 정답 $ " },
    { "question": "두 번째 문제 지문", "solution": " $ 두 번째 정답 $ " },
    { "question": "세 번째 문제 지문", "solution": " $ 세 번째 정답 $ " }
  ]
}`;
  }

  if (visualType === "geometry") {
    return `${base}

원본 문제에 도형/기하 그림이 포함되어 있다. 각 연습문제마다 문제 지문에 필요한 도형을 svg_code에 완전한 SVG(<svg>...</svg>)로 그려라.
- 원본 사진의 도형 스타일(점, 선, 각 표시, 라벨 위치)을 최대한 비슷하게 재현해.
- SVG는 viewBox를 명시하고, 선·점·텍스트 라벨을 포함해 문제를 풀 수 있을 정도로 충분한 정보를 담아.
- svg_code 안의 따옴표는 JSON escape 규칙을 지켜.

${jsonFooter}

{
  "items": [
    { "question": "...", "solution": "...", "svg_code": "<svg viewBox=\\"...\\">...</svg>" }
  ]
}`;
  }

  if (visualType === "graph") {
    return `${base}

원본 문제에 함수 그래프/좌표 그래프가 포함되어 있다. 각 연습문제마다 graph_data에 function-plot(JavaScript) 라이브러리에 바로 넣을 수 있는 JSON을 작성해.
- graph_data.data 배열의 각 항목은 fn(수식 문자열), range([xMin, xMax]), 필요 시 color, fnType, graphType을 포함해.
- xDomain, yDomain, grid, width, height를 적절히 설정해 문제에 맞는 축 범위를 지정해.
- 예: data: [{ "fn": "x^2 - 2*x", "range": [-2, 4], "color": "#84cc16" }]

${jsonFooter}

{
  "items": [
    { "question": "...", "solution": "...", "graph_data": { "width": 400, "height": 300, "grid": true, "xDomain": [-5, 5], "yDomain": [-5, 5], "data": [{ "fn": "x^2", "range": [-3, 3] }] } }
  ]
}`;
  }

  return `${base}

원본 문제에 도형과 그래프가 모두 포함되어 있다. 각 연습문제마다 svg_code(도형 SVG)와 graph_data(function-plot용 JSON)를 모두 작성해.

${jsonFooter}

{
  "items": [
    { "question": "...", "solution": "...", "svg_code": "<svg>...</svg>", "graph_data": { "data": [{ "fn": "x^2", "range": [-3, 3] }] } }
  ]
}`;
}

const EXCLUDE_PROBLEMS_PROMPT_PREFIX = `아래는 방금 전에 생성했던 연습문제 3개(JSON)이다. 이 문제들과 숫자·조건·형태·지문이 겹치지 않는 완전히 새로운 연습문제 3개를 만들어라. 문장 구조만 살짝 바꾼 수준의 변형은 금지한다.

이전에 만든 연습문제:
`;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function parseBooleanField(value: FormDataEntryValue | null): boolean {
  if (typeof value !== "string") return false;
  return value === "true" || value === "1";
}

function parseDifficulty(
  value: FormDataEntryValue | null,
): ExtractDifficulty | undefined {
  if (value === "low_mid" || value === "high") return value;
  return undefined;
}

type TwinRequestBody = {
  problemText: string;
  excludeProblems?: string;
  difficulty?: ExtractDifficulty;
  has_geometry: boolean;
  has_graph: boolean;
  image?: { mimeType: string; base64: string };
};

async function parseTwinRequest(request: Request): Promise<TwinRequestBody | Response> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return new Response("요청 형식이 올바르지 않습니다.", { status: 400 });
    }

    const problemText = formData.get("problemText");
    if (typeof problemText !== "string" || !problemText.trim()) {
      return new Response("문제 텍스트가 필요합니다.", { status: 400 });
    }

    const excludeRaw = formData.get("excludeProblems");
    const excludeProblems =
      typeof excludeRaw === "string" && excludeRaw.trim()
        ? excludeRaw.trim()
        : undefined;

    const body: TwinRequestBody = {
      problemText: problemText.trim(),
      excludeProblems,
      difficulty: parseDifficulty(formData.get("difficulty")),
      has_geometry: parseBooleanField(formData.get("has_geometry")),
      has_graph: parseBooleanField(formData.get("has_graph")),
    };

    const file = formData.get("image");
    if (file && file instanceof Blob && file.size > 0) {
      body.image = {
        mimeType: file.type || "image/webp",
        base64: arrayBufferToBase64(await file.arrayBuffer()),
      };
    }

    return body;
  }

  let jsonBody: {
    problemText?: string;
    excludeProblems?: string;
    difficulty?: ExtractDifficulty;
    has_geometry?: boolean;
    has_graph?: boolean;
  };
  try {
    jsonBody = await request.json();
  } catch {
    return new Response("요청 형식이 올바르지 않습니다.", { status: 400 });
  }

  const problemText = jsonBody.problemText?.trim();
  if (!problemText) {
    return new Response("문제 텍스트가 필요합니다.", { status: 400 });
  }

  return {
    problemText,
    excludeProblems: jsonBody.excludeProblems?.trim() || undefined,
    difficulty: jsonBody.difficulty,
    has_geometry: jsonBody.has_geometry === true,
    has_graph: jsonBody.has_graph === true,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("GEMINI_API_KEY가 설정되지 않았습니다.", {
      status: 500,
    });
  }

  const parsed = await parseTwinRequest(request);
  if (parsed instanceof Response) return parsed;

  const flags: ProblemVisualFlags = {
    has_geometry: parsed.has_geometry,
    has_graph: parsed.has_graph,
  };
  const visualType = getProblemVisualType(flags);
  const usePro = shouldUseProModel(parsed.difficulty, flags);
  const geminiModel = getGeminiModelForTwin(parsed.difficulty, flags);

  const contentParts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
    { text: buildSystemPrompt(visualType) },
    { text: `입력된 원본 문제:\n\n${parsed.problemText}` },
  ];

  if (usePro && parsed.image) {
    contentParts.push({
      inline_data: {
        mime_type: parsed.image.mimeType,
        data: parsed.image.base64,
      },
    });
    contentParts.push({
      text: "위 이미지는 사용자가 업로드한 원본 문제 사진이다. 도형·그래프의 형태와 배치를 참고해 연습문제를 만들어라.",
    });
  }

  if (parsed.excludeProblems) {
    contentParts.push({
      text: `${EXCLUDE_PROBLEMS_PROMPT_PREFIX}\n\n${parsed.excludeProblems}`,
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
        responseSchema: getTwinResponseSchema(visualType),
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
