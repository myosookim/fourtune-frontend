import { AuctionCategory, AuctionStatus, type AuctionItem } from '../types';



const CATEGORY_ITEMS: Record<AuctionCategory, { title: string; keyword: string }[]> = {
    ELECTRONICS: [
        { title: "빈티지 소니 워크맨 TPS-L2", keyword: "walkman" },
        { title: "라이카 M6 레인지파인더 카메라", keyword: "leica,camera" },
        { title: "닌텐도 게임보이 컬러 (박스 풀셋)", keyword: "gameboy" },
        { title: "매킨토시 클래식 II 컴퓨터", keyword: "macintosh,computer" },
        { title: "뱅앤올룹슨 베오플레이 A9", keyword: "speaker,bangandolufsen" },
        { title: "아이폰 1세대 미개봉", keyword: "iphone,firstgen" },
        { title: "소니 a7m4 미러리스 카메라", keyword: "camera,sony" },
        { title: "LG 울트라기어 게이밍 모니터", keyword: "monitor,gaming" },
        { title: "맥북 프로 16인치 M1 Max", keyword: "macbook" },
        { title: "삼성 갤럭시 Z 플립5 톰브라운 에디션", keyword: "galaxy,flip" }
    ],
    CLOTHING: [
        { title: "슈프림 박스 로고 후드티", keyword: "hoodie,supreme" },
        { title: "1960년대 리바이스 501 Big E", keyword: "jeans,levus" },
        { title: "나이키 조던 1 하이 시카고", keyword: "sneakers,jordan" },
        { title: "폴로 랄프로렌 베어 니트", keyword: "sweater,polo" },
        { title: "버버리 빈티지 트렌치 코트", keyword: "trenchcoat,burberry" },
        { title: "스톤아일랜드 크링클 랩스 패딩", keyword: "jacket,stoneisland" },
        { title: "아크테릭스 알파 SV 자켓", keyword: "jacket,arcteryx" },
        { title: "꼼데가르송 가디건", keyword: "cardigan" },
        { title: "메종키츠네 폭스헤드 맨투맨", keyword: "sweatshirt" },
        { title: "샤넬 클래식 미디움 백", keyword: "handbag,chanel" }
    ],
    POTTERY: [
        { title: "백자 달항아리 (권대섭 작)", keyword: "moonjar,porcelain" },
        { title: "고려청자 운학문 매병 재현작", keyword: "celadon,vase" },
        { title: "분청사기 박지문 호", keyword: "pottery,korean" },
        { title: "이조백자 철화 끈무늬 병", keyword: "ceramic,vase" },
        { title: "전통 옹기 항아리 50년산", keyword: "onggi,jar" },
        { title: "영국 웨지우드 퀸즈웨어 세트", keyword: "wedgwood,plate" },
        { title: "로얄 코펜하겐 풀레이스 접시", keyword: "royalcopenhagen,dish" },
        { title: "에르메스 샹달 블루 머그컵", keyword: "hermes,mug" },
        { title: "광주요 헤리티지 라인 식기", keyword: "bowl,ceramic" },
        { title: "김환기 화백 그림이 들어간 도자기", keyword: "art,pottery" }
    ],
    APPLIANCES: [
        { title: "스메그 레트로 토스터 (크림)", keyword: "smeg,toaster" },
        { title: "다이슨 에어랩 컴플리트 롱", keyword: "dyson,airwrap" },
        { title: "발뮤다 더 토스터 프로", keyword: "balmuda,toaster" },
        { title: "LG 오브제컬렉션 냉장고", keyword: "refrigerator,lg" },
        { title: "삼성 비스포크 큐브 에어 공기청정기", keyword: "airpurifier,samsung" },
        { title: "로보락 S8 Pro Ultra", keyword: "robot,vacuum" },
        { title: "네스프레소 버추오 팝", keyword: "nespresso,coffee" },
        { title: "드롱기 아이코나 빈티지 커피머신", keyword: "delonghi,coffee" },
        { title: "키친에이드 반죽기", keyword: "standmixer" },
        { title: "브레빌 870 에스프레소 머신", keyword: "espresso,machine" }
    ],
    BEDDING: [
        { title: "구스다운 호텔식 침구 세트 (킹)", keyword: "bedding,hotel" },
        { title: "템퍼페딕 오리지널 베개", keyword: "pillow,memoryfoam" },
        { title: "알레르망 프리미엄 이불", keyword: "duvet,comforter" },
        { title: "크라운구스 아이더다운 이불솜", keyword: "goosedown" },
        { title: "시몬스 뷰티레스트 매트리스", keyword: "mattress" },
        { title: "이브자리 수면 베개", keyword: "pillow" },
        { title: "헬렌스타인 60수 사틴 침구", keyword: "bedsheets,satin" },
        { title: "무인양품 오가닉 코튼 침구", keyword: "muji,bedding" },
        { title: "까사미아 린넨 이불", keyword: "linen,blanket" },
        { title: "닥스 홈 프리미엄 담요", keyword: "blanket,wool" }
    ],
    BOOKS: [
        { title: "해리포터 마법사의 돌 1판 1쇄", keyword: "harrypotter,book" },
        { title: "반지의 제왕 양장본 세트", keyword: "lotr,book" },
        { title: "슬램덩크 오리지널 전권", keyword: "slamdunk,manga" },
        { title: "민음사 세계문학전집 100권", keyword: "bookshelf" },
        { title: "김훈 친필 사인본 '칼의 노래'", keyword: "koreanNovel,book" },
        { title: "마블 코믹스 한정판 이슈", keyword: "marvel,comic" },
        { title: "디자인 매거진 B 전권 세트", keyword: "magazine,design" },
        { title: "펭귄 클래식 전집", keyword: "classics,book" },
        { title: "토지 박경리 에디션", keyword: "toji,novel" },
        { title: "무라카미 하루키 초판본 모음", keyword: "haruki,book" }
    ],
    COLLECTIBLES: [
        { title: "1980년대 스타워즈 피규어 미개봉", keyword: "starwars,figure" },
        { title: "베어브릭 1000% 한정판", keyword: "bearbrick" },
        { title: "레고 밀레니엄 팔콘 UCS", keyword: "lego,millenniumfalcon" },
        { title: "포켓몬 카드 리자몽 초판", keyword: "pokemoncard,charizard" },
        { title: "기아 타이거즈 2009 우승 사인볼", keyword: "baseball,signed" },
        { title: "마이클 조던 사인 저지", keyword: "jersey,jordan" },
        { title: "롤렉스 서브마리너 빈티지", keyword: "rolex,submariner" },
        { title: "우표 수집 앨범 (1970-1990)", keyword: "stamps,collection" },
        { title: "코카콜라 빈티지 병 세트", keyword: "cocacola,vintage" },
        { title: "영화 포스터 오리지널 (기생충 사인본)", keyword: "parasite,poster" }
    ],
    ETC: [
        { title: "마틴 D-45 어쿠스틱 기타", keyword: "martinguitar" },
        { title: "야마하 그랜드 피아노", keyword: "grandpiano" },
        { title: "펜더 스트라토캐스터 커스텀샵", keyword: "fender,stratocaster" },
        { title: "전문가용 천체 망원경", keyword: "telescope" },
        { title: "DJI 매빅 3 프로 드론", keyword: "drone,dji" },
        { title: "캠핑용 랜드로버 디펜더 다이캐스트", keyword: "diecast,landrover" },
        { title: "스노우피크 랜드락 텐트", keyword: "tent,snowpeak" },
        { title: "콜맨 빈티지 랜턴", keyword: "lantern,coleman" },
        { title: "브롬톤 자전거 P라인", keyword: "brompton,bike" },
        { title: "전동 킥보드 듀얼트론", keyword: "escooter" }
    ]
};

const generateItems = (): AuctionItem[] => {
    const items: AuctionItem[] = [];
    let idCounter = 1;

    Object.entries(CATEGORY_ITEMS).forEach(([cat, dataList]) => {
        const categoryName = cat as AuctionCategory;

        dataList.forEach((itemData, index) => {
            // Determine status based on index to ensure variety
            // Mix of ACTIVE (Running), SCHEDULED (Ready), ENDED/SOLD (Closed)
            let status: AuctionStatus = AuctionStatus.ACTIVE;
            if (index % 5 === 0) status = AuctionStatus.ENDED;
            else if (index % 4 === 0) status = AuctionStatus.SCHEDULED;
            else if (index % 7 === 0) status = AuctionStatus.SOLD;

            // Price variation
            const basePrice = (Math.floor(Math.random() * 90) + 10) * 10000; // 100,000 ~ 1,000,000

            // Time variation
            const now = Date.now();
            const day = 86400000;
            let startAt = new Date(now - day).toISOString();
            let endAt = new Date(now + day * 3).toISOString();

            if (status === AuctionStatus.SCHEDULED) {
                startAt = new Date(now + day).toISOString();
                endAt = new Date(now + day * 5).toISOString();
            } else if (status === AuctionStatus.ENDED || status === AuctionStatus.SOLD) {
                startAt = new Date(now - day * 5).toISOString();
                endAt = new Date(now - day).toISOString();
            }

            // Add a random lock ID to image URL to prevent caching and ensure unique visuals even if keyword is same
            const lockId = idCounter;

            items.push({
                auctionItemId: idCounter++,
                title: itemData.title,
                description: `이 상품은 ${categoryName} 카테고리의 상품입니다. [${itemData.title}] - 모델명/품번 확인 완료. 상태: A급. 직거래 및 택배 거래 모두 가능합니다. 상세 문의는 메시지 주세요.`,
                category: categoryName,
                status: status,
                startPrice: basePrice,
                currentPrice: status === AuctionStatus.SCHEDULED ? basePrice : basePrice + (Math.floor(Math.random() * 20) * 5000),
                startAt,
                endAt,
                imageUrls: [
                    `https://loremflickr.com/400/300/${itemData.keyword}?lock=${lockId}`,
                    `https://loremflickr.com/400/300/${itemData.keyword},detail?lock=${lockId + 1000}`
                ],
                // Randomize createdAt to mix up the timeline (1 to 30 days ago)
                createdAt: new Date(now - (Math.random() * 30 * day)).toISOString(),
                updatedAt: new Date(now - day * 1).toISOString(),
                sellerName: `User${Math.floor(Math.random() * 1000)}`,
                bidUnit: index % 3 === 0 ? 5000 : 1000,
            });
        });
    });

    return items;
};

export const MOCK_AUCTIONS: AuctionItem[] = generateItems();
