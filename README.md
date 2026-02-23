# Fourtune Frontend (Auction Service)

이 프로젝트는 6팀 포츈(Fourtune)의 경매 서비스 'CLOV4R' 프론트엔드 레포지토리입니다.
React + TypeScript + Vite 환경으로 구성되어 있습니다.

## 🛠 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하기 위한 가이드입니다.

### 1. 필수 요구사항
- Node.js (v18.0.0 이상 권장)
- npm

### 2. 설치 (Installation)

프로젝트 디렉토리로 이동하여 의존성 패키지를 설치합니다.

```bash
cd fourtune
npm install
```

### 3. 환경 변수 설정 (Configuration)

이 프로젝트는 환경 변수를 통해 **Mock API**(가상 데이터)와 **Real API**(백엔드 서버) 모드를 전환할 수 있습니다.

1. `env.example` 파일을 복사하여 `.env` 파일을 생성합니다.

```bash
cp env.example .env
```

2. `.env` 파일을 열어 설정을 확인하거나 수정합니다.

```ini
# .env 파일 예시

# 백엔드 서버 주소
# 로컬 개발 시(Proxy 사용): 비워두세요 (권장)
# VITE_BACKEND_URL=

# 배포 환경 또는 직접 연결 시: 주소 입력
# VITE_BACKEND_URL=http://localhost:8080

# Mock API 모드 사용 여부
# true: 백엔드 서버 없이 프론트엔드 내부 가상 데이터 사용 (테스트용)
# false: 실제 백엔드 API와 통신
VITE_USE_MOCK=false

# PG 결제 (토스페이먼츠)
# Toss Developers > API 키 > 클라이언트 키
VITE_TOSS_CLIENT_KEY=test_ck_YOUR_CLIENT_KEY
```

> **Tip**: 백엔드 서버가 아직 준비되지 않았거나 프론트엔드 UI 작업만 할 때는 `VITE_USE_MOCK=true`로 설정하세요.

### 4. 실행 (Run)

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속하여 확인합니다.

## 📂 주요 기능

- **회원가입/로그인**: JWT 기반 인증
- **경매 리스트**: 카테고리별 필터, 상태별(진행중/예정/종료) 필터, 검색 기능
- **상세 페이지**: 상품 상세 정보, 이미지 갤러리, 입찰/즉시구매 기능
- **마이페이지**: 내 정보, 관심 상품 관리 (Wishlist)

## 📁 프로젝트 구조

```
src/
├── assets/         # 정적 자원 (이미지, 아이콘 등)
├── components/     # 재사용 가능한 컴포넌트
│   ├── common/     # 레이아웃, 헤더 등 공통 컴포넌트
│   └── features/   # 특정 기능과 관련된 컴포넌트
├── constants/      # 상수 데이터 (번역 등)
├── pages/          # 페이지 단위 컴포넌트 (Routing)
│   ├── Auth/       # 로그인, 회원가입
│   ├── AuctionList/# 경매 리스트
│   ├── AuctionDetail/# 경매 상세 페이지
│   ├── Cart/       # 장바구니
│   ├── CreateAuction/# 경매 생성
│   ├── Home/       # 메인 홈페이지
│   ├── MyPage/     # 마이페이지
│   ├── Order/      # 주문서 작성
│   ├── Payment/    # 결제 결과 처리
│   └── Settlement/ # 정산 관리
├── services/       # API 통신 로직
│   ├── api.interface.ts # API 인터페이스 정의
│   ├── api.ts      # API 진입점 (Mock/Real 분기 처리)
│   ├── mockApi.ts  # 가상 API 구현
│   ├── realApi.ts  # 실제 백엔드 통신 구현
│   └── mockData.ts # 가상 데이터 정의
└── types/          # TypeScript 타입 정의
```
