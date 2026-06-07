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

export default function PrivacyContent() {
  return (
    <>
      <p>
        핑코(상호: 핑코, 이하 &quot;회사&quot;)는 「개인정보 보호법」
        등 관련 법령에 따라 이용자의 개인정보를 보호하고, 개인정보와 관련한
        이용자의 고충을 신속·원활하게 처리하기 위하여 다음과 같이
        개인정보처리방침을 수립·공개합니다. 본 방침은{" "}
        <strong className="text-gray-100">쌤(SAM)</strong> 및{" "}
        <strong className="text-gray-100">매스몬(MathMon)</strong> 서비스에
        공통 적용됩니다.
      </p>

      <Section title="1. 개인정보의 처리 목적">
        <p>회사는 다음 목적을 위해 개인정보를 처리합니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-gray-100">회원 가입 및 관리:</strong>{" "}
            본인 확인, 회원 식별, 부정 이용 방지, 가입·탈퇴 의사 확인
          </li>
          <li>
            <strong className="text-gray-100">서비스 제공:</strong> 교육
            콘텐츠 제공, 스케줄·출결·메시지 기능, AI 문제 생성, 학습 데이터
            저장
          </li>
          <li>
            <strong className="text-gray-100">고객 관리:</strong> 문의·불만
            처리, 공지사항 전달, 서비스 품질 개선
          </li>
          <li>
            <strong className="text-gray-100">과금 및 정산:</strong> 유료
            서비스 결제, 환불, 정기 결제, 거래 기록 보관
          </li>
          <li>
            <strong className="text-gray-100">마케팅 및 알림(선택):</strong>{" "}
            푸시 알림(FCM), 서비스 관련 안내
          </li>
        </ul>
      </Section>

      <Section title="2. 처리하는 개인정보 항목">
        <p className="font-semibold text-gray-200">① 필수 수집 항목</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-gray-100">공통(회원가입):</strong> 이메일,
            이름(닉네임), Google 등 소셜 로그인 프로필 정보(프로필 사진 URL,
            제공자 식별자)
          </li>
          <li>
            <strong className="text-gray-100">SAM – 선생님:</strong> 담당 과목,
            프로필 사진(선택 업로드 시)
          </li>
          <li>
            <strong className="text-gray-100">SAM – 학생:</strong> 생년월일,
            학년, 프로필 사진(선택 업로드 시)
          </li>
          <li>
            <strong className="text-gray-100">SAM – 학부모:</strong> 자녀(학생)
            계정 연동 정보
          </li>
          <li>
            <strong className="text-gray-100">결제 시:</strong> 결제 수단 정보,
            PG사(포트원/KG이니시스)를 통해 처리되는{" "}
            <strong className="text-gray-100">빌링 토큰·결제 승인 데이터</strong>
            (카드번호 전체는 회사가 직접 저장하지 않음)
          </li>
        </ul>

        <p className="font-semibold text-gray-200">② 자동 수집 항목</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>서비스 이용 기록, 접속 로그, 기기 정보, IP 주소, 쿠키</li>
          <li>FCM 웹 푸시 토큰(SAM 알림 수신 시)</li>
          <li>MathMon: 생성·저장한 문제 및 학습 기록(Firebase 저장 데이터)</li>
        </ul>

        <p className="font-semibold text-gray-200">③ 수집 방법</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>회원가입·프로필 입력, Google OAuth 연동, 서비스 이용 과정, 결제 시</li>
        </ul>
      </Section>

      <Section title="3. 개인정보의 보유 및 이용 기간">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            원칙적으로 <strong className="text-gray-100">회원 탈퇴 시 지체 없이
            파기</strong>합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당
            기간 동안 보관합니다.
          </li>
          <li>
            <strong className="text-gray-100">전자상거래 등에서의 소비자보호에
            관한 법률:</strong> 계약·청약철회 기록 5년, 대금결제·재화 공급
            기록 5년, 소비자 불만·분쟁 처리 기록 3년
          </li>
          <li>
            <strong className="text-gray-100">통신비밀보호법:</strong> 접속
            로그 등 3개월
          </li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          다만, 이용자의 사전 동의가 있거나 법령에 근거한 경우에 한하여
          제공할 수 있습니다.
        </p>
      </Section>

      <Section title="5. 개인정보 처리 위탁">
        <p>원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-700/60">
          <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
            <thead className="bg-gray-800/80 text-gray-200">
              <tr>
                <th className="px-3 py-2.5 font-semibold">수탁업체</th>
                <th className="px-3 py-2.5 font-semibold">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-3 py-2.5">Google LLC</td>
                <td className="px-3 py-2.5">Firebase 인증·DB·Storage, OAuth</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5">포트원(PortOne) / KG이니시스</td>
                <td className="px-3 py-2.5">결제 처리 및 빌링</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5">AI API 제공사</td>
                <td className="px-3 py-2.5">MathMon AI 문제 생성(업로드 이미지 처리)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="6. 정보주체의 권리·의무 및 행사 방법">
        <p>
          이용자는 언제든지 개인정보 열람·정정·삭제·처리정지·동의 철회를 요청할
          수 있습니다. 서비스 내 설정, 회원 탈퇴, 또는 아래 고객센터를 통해
          요청하실 수 있으며, 회사는 지체 없이 조치합니다.
        </p>
      </Section>

      <Section title="7. 개인정보의 파기 절차 및 방법">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
          <li>종이 문서: 분쇄 또는 소각</li>
        </ul>
      </Section>

      <Section title="8. 개인정보의 안전성 확보 조치">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>접근 권한 관리 및 최소화</li>
          <li>Firebase 보안 규칙 및 SSL/TLS 암호화 통신</li>
          <li>결제 정보는 PG사 토큰화 방식으로 처리</li>
          <li>내부 관리 계획 수립 및 임직원 교육</li>
        </ul>
      </Section>

      <Section title="9. 개인정보 보호책임자">
        <ul className="space-y-1 text-gray-400">
          <li>성명: 유연서 (대표)</li>
          <li>
            연락처:{" "}
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
        </ul>
        <p className="text-gray-400">
          개인정보 침해 신고: 개인정보침해신고센터(privacy.kisa.or.kr /
          118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)
        </p>
      </Section>

      <Section title="10. 개인정보처리방침의 변경">
        <p>
          본 방침의 내용 추가·삭제·수정이 있을 경우 변경 최소 7일 전부터
          서비스 내 공지사항 또는 본 페이지를 통해 고지합니다. 본 방침은 2026년
          6월 7일부터 적용됩니다.
        </p>
      </Section>
    </>
  );
}
