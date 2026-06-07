function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-200">{title}</h3>
      <div className="mt-2 space-y-2 pl-0.5">{children}</div>
    </div>
  );
}

export default function TermsContent() {
  return (
    <>
      <Section title="제1조 (목적)">
        <p>
          본 약관은 핑코(상호: 핑코, 이하 &quot;회사&quot;)가 운영하는 교육
          플랫폼 서비스 <strong className="text-gray-100">쌤(SAM)</strong> 및{" "}
          <strong className="text-gray-100">매스몬(MathMon)</strong>(이하
          통칭하여 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의
          권리·의무 및 책임사항, 환불·청약철회 등 소비자 보호에 관한 사항을
          규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (정의)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            &quot;이용자&quot;란 본 약관에 동의하고 회사가 제공하는 서비스를
            이용하는 회원 및 비회원을 말합니다.
          </li>
          <li>
            &quot;회원&quot;이란 Google 등 소셜 로그인을 통해 가입하여 지속적으로
            서비스를 이용할 수 있는 자를 말합니다.
          </li>
          <li>
            &quot;선생님(강사)&quot;이란 SAM에서 교실·수업을 개설하고 학생에게
            판매하는 회원을 말합니다.
          </li>
          <li>
            &quot;학생&quot;이란 SAM에서 수업을 수강하거나 MathMon에서 AI
            기능을 이용하는 회원을 말합니다.
          </li>
          <li>
            &quot;코인&quot;이란 MathMon에서 AI 호출(사진 분석 및 문제 생성) 시
            차감되는 선불 충전형 이용권을 말합니다.
          </li>
          <li>
            &quot;유료서비스&quot;란 회사가 유료로 제공하는 SAM 정기 이용료,
            수업 중개 결제, MathMon 코인 충전 등을 말합니다.
          </li>
        </ul>
      </Section>

      <Section title="제3조 (약관의 게시 및 개정)">
        <p>
          회사는 본 약관의 내용을 서비스 초기 화면 또는 연결 화면(이용약관
          페이지)에 게시합니다. 회사는 관련 법령을 위반하지 않는 범위에서 본
          약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여
          적용일 7일 전부터 공지합니다. 이용자에게 불리한 변경의 경우 30일
          전부터 공지합니다.
        </p>
      </Section>

      <Section title="제4조 (회원가입 및 계정)">
        <p>
          회원가입은 Google OAuth 등 회사가 제공하는 인증 수단을 통해
          이루어지며, 이용자는 정확한 정보를 제공해야 합니다. SAM 이용 시
          역할(선생님·학생·학부모)에 따라 추가 프로필 정보(이름, 학년, 생년월일,
          담당 과목 등)를 입력할 수 있습니다.
        </p>
        <p>
          회원은 언제든지 서비스 내 설정 또는 고객센터를 통해 탈퇴를 요청할 수
          있으며, 탈퇴 시 관련 법령 및 개인정보처리방침에 따라 정보가
          처리됩니다.
        </p>
      </Section>

      <Section title="제5조 (서비스의 제공)">
        <SubSection title="1. 쌤(SAM)">
          <p>
            스케줄·출결·과제·메시지·학습 콘텐츠 판매 등 교육 관리 기능을
            제공합니다. 선생님은 교실 및 수업을 등록하고, 학생은 이를 구매하여
            수강할 수 있습니다.
          </p>
        </SubSection>
        <SubSection title="2. 매스몬(MathMon)">
          <p>
            AI 기반 수학 문제 사진 분석 및 연습문제 생성 기능을 제공합니다.
            이용은 선불 코인 충전 후 1회 AI 호출당 1코인이 차감되는 방식으로
            운영됩니다.
          </p>
        </SubSection>
      </Section>

      <Section title="제6조 (서비스별 요금 정책)">
        <SubSection title="1. 쌤(SAM) 요금">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-gray-100">시스템 정기 이용 기본료:</strong>{" "}
              월 4,900원(부가가치세 포함 여부는 결제 화면에 표시)
            </li>
            <li>
              <strong className="text-gray-100">플랫폼 중개 수수료:</strong>{" "}
              선생님이 학생에게 수업을 판매할 때 결제 금액의 3.5%
            </li>
          </ul>
          <p className="text-gray-400">
            수업 판매 가격은 선생님이 직접 설정하며, 결제·정산은 회사가 지정한
            PG(포트원/KG이니시스 등)를 통해 처리됩니다.
          </p>
        </SubSection>

        <SubSection title="2. 매스몬(MathMon) 코인 충전">
          <p>선불 코인 충전 패키지는 아래와 같습니다.</p>
          <div className="overflow-x-auto rounded-xl border border-gray-700/60">
            <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
              <thead className="bg-gray-800/80 text-gray-200">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">충전 금액</th>
                  <th className="px-3 py-2.5 font-semibold">지급 코인</th>
                  <th className="px-3 py-2.5 font-semibold">코인당 단가</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="px-3 py-2.5">1,500원</td>
                  <td className="px-3 py-2.5">60코인</td>
                  <td className="px-3 py-2.5">25원</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5">3,000원</td>
                  <td className="px-3 py-2.5">
                    135코인 <span className="text-gray-500">(15코인 보너스)</span>
                  </td>
                  <td className="px-3 py-2.5">약 22.2원</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5">5,000원</td>
                  <td className="px-3 py-2.5">
                    250코인 <span className="text-gray-500">(50코인 보너스)</span>
                  </td>
                  <td className="px-3 py-2.5">20원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>AI 호출(사진 분석 및 문제 생성) 1회당 1코인이 실시간 차감됩니다.</p>
        </SubSection>
      </Section>

      <Section title="제7조 (결제)">
        <p>
          유료서비스 결제는 신용카드 등 회사가 제공하는 결제 수단을 통해
          이루어지며, 결제 대행은 포트원(PortOne) 및 KG이니시스 등 제휴 PG사가
          처리합니다. 회원은 결제 전 상품명, 금액, 환불 조건을 확인해야
          합니다.
        </p>
      </Section>

      <Section title="제8조 (환불 및 청약철회)">
        <p>
          「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령이 정하는
          바에 따라 아래와 같이 환불을 처리합니다.
        </p>

        <SubSection title="1. [쌤] 선생님 서비스 이용료(정기 기본료) 환불">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              기본료 결제 후 <strong className="text-gray-100">7일 이내</strong>{" "}
              환불 요청 시 <strong className="text-gray-100">100% 전액 환불</strong>
              합니다.
            </li>
            <li>
              환불 완료 즉시 해당 계정은 무료 등급으로 강등되며, 개설된 수업 및
              교실은 자동으로 비활성화(판매 중단) 처리됩니다.
            </li>
            <li>결제 7일 이후에는 환불이 불가능합니다.</li>
          </ul>
        </SubSection>

        <SubSection title="2. [쌤] 선생님–학생 간 수업료 환불">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>수강 시작 전 요청 시 전액 환불합니다.</li>
            <li>
              수강률이 50% 이하인 경우 &quot;수강하지 않은 잔여 비율&quot;만큼
              부분 환불합니다. (예: 30% 수강 시 70% 환불)
            </li>
            <li>
              부분 환불 시 중개 및 결제 수수료는 환불 금액의 3.5%로 산정하여
              정산합니다.
            </li>
            <li>
              수강률이 50% 이상인 경우 디지털 콘텐츠 이용 특성상 환불이 전면
              불가능합니다.
            </li>
          </ul>
          <p className="text-gray-400">
            수강률은 회사 시스템상 제공·열람·학습 진행 기록을 기준으로
            산정합니다.
          </p>
        </SubSection>

        <SubSection title="3. [매스몬] 선불 코인 환불">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              결제 후 7일 이내이며 코인을 단 1개도 사용하지 않은 경우에만 전액
              환불이 가능합니다.
            </li>
            <li>
              일부라도 코인을 사용한 경우 환불 금액은{" "}
              <strong className="text-gray-100">
                남은 코인 수 × 해당 충전 패키지의 코인 단가
              </strong>
              로 산정합니다.
            </li>
            <li>
              위 산정 금액에서 행정 처리비 및 카드 결제 수수료 명목으로 최소
              실비인 500원을 제외하고 환불합니다.
            </li>
            <li>
              수수료 차감 후 남은 금액이 500원 이하일 경우 환불이 불가능합니다.
            </li>
          </ul>
        </SubSection>

        <SubSection title="4. 환불 신청 방법">
          <p>
            환불은 고객센터(전화, 이메일) 또는 서비스 내 문의·건의 채널을 통해
            신청할 수 있으며, 회사는 접수 후 관련 법령 및 본 조항에 따라
            영업일 기준 3~7일 이내 처리합니다.
          </p>
        </SubSection>
      </Section>

      <Section title="제9조 (면책 및 AI 서비스 고지)">
        <p>
          본 서비스는 생성형 AI 인프라를 연동하므로 기술적 특성상 일부 수식
          오류, 부정확한 풀이, 부자연스러운 문장이 포함될 수 있습니다. AI
          결과물은 참고용이며, 최종 학습 판단과 책임은 이용자에게 있습니다.
        </p>
        <p>
          시스템 오류·버그 발견 시 건의 게시판 및 고객센터를 통해 제보해 주시면
          신속히 조치합니다. 천재지변, 통신 장애, AI API 장애 등 회사의
          규책적 통제를 벗어난 사유로 인한 손해에 대해서는 관련 법령이 허용하는
          범위 내에서 책임을 제한할 수 있습니다.
        </p>
      </Section>

      <Section title="제10조 (회사의 의무)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>관련 법령과 본 약관이 정하는 바에 따라 지속적·안정적으로 서비스를 제공합니다.</li>
          <li>이용자의 개인정보를 개인정보처리방침에 따라 보호합니다.</li>
          <li>유료서비스 이용과 관련한 이용자의 불만·피해 구제를 위해 노력합니다.</li>
        </ul>
      </Section>

      <Section title="제11조 (이용자의 의무)">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
          <li>서비스를 통해 불법·음란·저작권 침해 콘텐츠를 유통해서는 안 됩니다.</li>
          <li>회사 및 제3자의 지식재산권을 침해해서는 안 됩니다.</li>
          <li>서비스 운영을 방해하는 행위를 해서는 안 됩니다.</li>
        </ul>
      </Section>

      <Section title="제12조 (분쟁 해결 및 관할)">
        <p>
          회사와 이용자 간 분쟁이 발생한 경우 상호 협의하여 해결하며, 협의가
          이루어지지 않을 경우 「전자상거래 등에서의 소비자보호에 관한 법률」
          등에 따른 분쟁조정기관의 조정을 신청할 수 있습니다. 소송이 제기될
          경우 회사 본점 소재지를 관할하는 법원을 전속 관할로 합니다.
        </p>
      </Section>

      <Section title="부칙 · 사업자 정보 및 고객센터">
        <ul className="space-y-1 text-gray-400">
          <li>상호명: 핑코</li>
          <li>대표자: 유연서</li>
          <li>사업자등록번호: 265-17-02807</li>
          <li>주소: 제주특별자치도 제주시 애월읍 하귀로 134, 205호</li>
          <li>
            전화번호:{" "}
            <a href="tel:010-2300-3955" className="text-gray-300 hover:text-white">
              010-2300-3955
            </a>
          </li>
          <li>
            이메일:{" "}
            <a
              href="mailto:lialytics@gmail.com"
              className="text-gray-300 hover:text-white"
            >
              lialytics@gmail.com
            </a>
          </li>
          <li>통신판매업신고: 신고 준비 중</li>
        </ul>
        <p className="mt-4 text-gray-400">
          본 약관은 2026년 6월 7일부터 시행합니다.
        </p>
      </Section>
    </>
  );
}
