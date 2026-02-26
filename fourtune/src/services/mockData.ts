import { AuctionCategory, AuctionStatus, type AuctionItem } from '../types';

const CATEGORY_ITEMS: Record<AuctionCategory, { title: string; keyword: string }[]> = {
    ELECTRONICS: [
        { title: "빈티지 소니 워크맨 TPS-L2", keyword: "sony,walkman,vintage" },
        { title: "라이카 M6 레인지파인더 카메라", keyword: "leica,m6,camera" },
        { title: "닌텐도 게임보이 컬러 (박스 풀셋)", keyword: "gameboy,color,nintendo" },
        { title: "매킨토시 클래식 II 컴퓨터", keyword: "apple,macintosh,computer" },
        { title: "뱅앤올룹슨 베오플레이 A9", keyword: "bangolufsen,speaker,a9" },
        { title: "아이폰 1세대 미개봉", keyword: "iphone1,apple,unopened" },
        { title: "소니 a7m4 미러리스 카메라", keyword: "sony,a7m4,camera" },
        { title: "LG 울트라기어 게이밍 모니터", keyword: "monitor,gaming,lg" },
        { title: "맥북 프로 16인치 M1 Max", keyword: "macbookpro,laptop" },
        { title: "삼성 갤럭시 Z 플립5 톰브라운 에디션", keyword: "galaxy,zflip,thombrowne" },
        { title: "로지텍 G Pro X 슈퍼라이트 2", keyword: "logitech,mouse,gaming" },
        { title: "키크론 Q1 커스텀 기계식 키보드", keyword: "keyboard,mechanical,keychron" },
        { title: "애플워치 울트라 2 타이타늄", keyword: "applewatch,ultra" },
        { title: "보스 콰이어트컴포트 울트라 헤드폰", keyword: "bose,headphones" },
        { title: "DJI 오즈모 포켓 3 크리에이터 콤보", keyword: "dji,osmopocket" }
    ],
    CLOTHING: [
        { title: "슈프림 박스 로고 후드티", keyword: "supreme,boxlogo,hoodie" },
        { title: "1960년대 리바이스 501 Big E", keyword: "levis,501,vintage,jeans" },
        { title: "나이키 조던 1 하이 시카고", keyword: "nike,jordan1,chicago" },
        { title: "폴로 랄프로렌 베어 니트", keyword: "polo,ralphlauren,bear,knit" },
        { title: "버버리 빈티지 트렌치 코트", keyword: "burberry,trenchcoat" },
        { title: "스톤아일랜드 크링클 랩스 패딩", keyword: "stoneisland,jacket" },
        { title: "아크테릭스 알파 SV 자켓", keyword: "arcteryx,alpha,jacket" },
        { title: "꼼데가르송 가디건", keyword: "cdg,cardigan" },
        { title: "메종키츠네 폭스헤드 맨투맨", keyword: "maisonkitsune,sweatshirt" },
        { title: "샤넬 클래식 미디움 백", keyword: "chanel,handbag,luxury" },
        { title: "구찌 홀스빗 1955 숄더백", keyword: "gucci,handbag" },
        { title: "프라다 리나일론 백팩", keyword: "prada,backpack" },
        { title: "디올 오블리크 스니커즈", keyword: "dior,sneakers" },
        { title: "생로랑 모노그램 클러치", keyword: "ysl,clutch" },
        { title: "에르메스 클릭 아슈 팔찌", keyword: "hermes,bracelet" }
    ],
    POTTERY: [
        { title: "백자 달항아리 (권대섭 작)", keyword: "korean,moonjar,porcelain" },
        { title: "고려청자 운학문 매병 재현작", keyword: "korean,celadon,vase" },
        { title: "분청사기 박지문 호", keyword: "korean,pottery,jar" },
        { title: "이조백자 철화 끈무늬 병", keyword: "korean,whiteporcelain,vase" },
        { title: "전통 옹기 항아리 50년산", keyword: "korean,onggi,crock" },
        { title: "영국 웨지우드 퀸즈웨어 세트", keyword: "wedgwood,queensware,tea" },
        { title: "로얄 코펜하겐 풀레이스 접시", keyword: "royalcopenhagen,plate" },
        { title: "에르메스 샹달 블루 머그컵", keyword: "hermes,mug,blue" },
        { title: "광주요 헤리티지 라인 식기", keyword: "korean,ceramic,bowl" },
        { title: "김환기 화백 그림이 들어간 도자기", keyword: "art,pottery,abstract" },
        { title: "무형문화재 이진형 작 분청 식기세트", keyword: "korean,traditional,pottery" },
        { title: "일본 이마리 아리타 도자기 찻잔", keyword: "japanese,arita,teacup" },
        { title: "덴마크 로얄코펜하겐 빙앤그뢴달 피규어", keyword: "figurine,porcelain" },
        { title: "핀란드 이딸라 가스테헬미 볼", keyword: "iittala,glass,bowl" },
        { title: "프랑스 베르나르도 리모쥬 골드 플레이트", keyword: "limoges,porcelain,plate" }
    ],
    APPLIANCES: [
        { title: "스메그 레트로 토스터 (크림)", keyword: "smeg,toaster,retro" },
        { title: "다이슨 에어랩 컴플리트 롱", keyword: "dyson,airwrap" },
        { title: "발뮤다 더 토스터 프로", keyword: "balmuda,toaster" },
        { title: "LG 오브제컬렉션 냉장고", keyword: "refrigerator,objet" },
        { title: "삼성 비스포크 큐브 에어 공기청정기", keyword: "samsung,airpurifier" },
        { title: "로보락 S8 Pro Ultra", keyword: "roborock,vacuum" },
        { title: "네스프레소 버추오 팝", keyword: "nespresso,virtuo" },
        { title: "드롱기 아이코나 빈티지 커피머신", keyword: "delonghi,coffee,machine" },
        { title: "키친에이드 반죽기", keyword: "kitchenaid,mixer" },
        { title: "브레빌 870 에스프레소 머신", keyword: "breville,espresso" },
        { title: "일렉트로룩스 무선 청소기", keyword: "electrolux,vacuum" },
        { title: "발뮤다 더 팟 (블랙)", keyword: "balmuda,kettle" },
        { title: "에어로사이드 공기청정기 APS-200", keyword: "airocide,airfilter" },
        { title: "모닝 프레스 정수기", keyword: "waterpurifier" },
        { title: "소다스트림 탄산수 제조기", keyword: "sodastream" }
    ],
    BEDDING: [
        { title: "구스다운 호텔식 침구 세트 (킹)", keyword: "bedding,hotel,luxury" },
        { title: "템퍼페딕 오리지널 베개", keyword: "tempur,pillow" },
        { title: "알레르망 프리미엄 이불", keyword: "blanket,comforter" },
        { title: "크라운구스 아이더다운 이불솜", keyword: "goosedown,comforter" },
        { title: "시몬스 뷰티레스트 매트리스", keyword: "simmons,mattress" },
        { title: "이브자리 수면 베개", keyword: "pillow,sleeping" },
        { title: "헬렌스타인 60수 사틴 침구", keyword: "bedding,satin" },
        { title: "무인양품 오가닉 코튼 침구", keyword: "muji,bedding" },
        { title: "까사미아 린넨 이불", keyword: "linen,blanket" },
        { title: "닥스 홈 프리미엄 담요", keyword: "blanket,luxury" },
        { title: "조 말론 로얄 가든 디퓨저", keyword: "jo-malone,diffuser" },
        { title: "딥티크 베이 캔들 라지", keyword: "diptyque,candle" },
        { title: "프레떼 이탈리아 자수 침구", keyword: "frette,embroidery,bedding" },
        { title: "소프라움 헝가리 구스 이불", keyword: "goosedown" },
        { title: "자라홈 워싱 린넨 듀베 커버", keyword: "zarahome,linen" }
    ],
    BOOKS: [
        { title: "해리포터 마법사의 돌 1판 1쇄", keyword: "harrypotter,book,firstedition" },
        { title: "반지의 제왕 양장본 세트", keyword: "lotr,hardcover,books" },
        { title: "슬램덩크 오리지널 전권", keyword: "slamdunk,manga,collection" },
        { title: "민음사 세계문학전집 100권", keyword: "bookshelf,literature" },
        { title: "김훈 친필 사인본 '칼의 노래'", keyword: "novel,autograph" },
        { title: "마블 코믹스 한정판 이슈", keyword: "marvel,comics" },
        { title: "디자인 매거진 B 전권 세트", keyword: "magazine,design,collection" },
        { title: "펭귄 클래식 전집", keyword: "penguinclassics,books" },
        { title: "토지 박경리 에디션", keyword: "toji,korean,literature" },
        { title: "무라카미 하루키 초판본 모음", keyword: "haruki,firstedition" },
        { title: "나쓰메 소세키 전집", keyword: "natsumesoseki,books" },
        { title: "파울로 코엘료 '연금술사' 한정판", keyword: "alchemist,book" },
        { title: "어린왕자 일러스트 팝업북", keyword: "littleprince,popupbook" },
        { title: "킨포크 매거진 백이슈 풀세트", keyword: "kinfolk,magazine" },
        { title: "스티브 잡스 전기 양장본", keyword: "stevejobs,biography" }
    ],
    COLLECTIBLES: [
        { title: "1980년대 스타워즈 피규어 미개봉", keyword: "starwars,actionfigure,vintage" },
        { title: "베어브릭 1000% 한정판", keyword: "bearbrick,1000%" },
        { title: "레고 밀레니엄 팔콘 UCS", keyword: "lego,millenniumfalcon,ucs" },
        { title: "포켓몬 카드 리자몽 초판", keyword: "pokemon,charizard,card" },
        { title: "기아 타이거즈 2009 우승 사인볼", keyword: "kbo,baseball,signed" },
        { title: "마이클 조던 사인 저지", keyword: "jordan,jersey,signed" },
        { title: "롤렉스 서브마리너 빈티지", keyword: "rolex,submariner,vintage" },
        { title: "우표 수집 앨범 (1970-1990)", keyword: "stamps,collection" },
        { title: "코카콜라 빈티지 병 세트", keyword: "cocacola,bottle,vintage" },
        { title: "영화 포스터 오리지널 (기생충 사인본)", keyword: "movie,poster,parasite" },
        { title: "핫토이 아이언맨 마크 85", keyword: "hottoys,ironman" },
        { title: "반다이 PG 유니콘 건담", keyword: "bandai,gunpla" },
        { title: "MTG 블랙 로터스 복각판", keyword: "magicthegathering,card" },
        { title: "나이키 유니온 조던 4 레트로", keyword: "nike,union,jordan4" },
        { title: "슈프림 스케이트보드 데크 세트", keyword: "supreme,skateboard" }
    ],
    ETC: [
        { title: "마틴 D-45 어쿠스틱 기타", keyword: "martin,guitar,acoustic" },
        { title: "야마하 그랜드 피아노", keyword: "yamaha,grandpiano" },
        { title: "펜더 스트라토캐스터 커스텀샵", keyword: "fender,stratocaster,guitar" },
        { title: "전문가용 천체 망원경", keyword: "telescope,astronomy" },
        { title: "DJI 매빅 3 프로 드론", keyword: "dji,mavic,drone" },
        { title: "캠핑용 랜드로버 디펜더 다이캐스트", keyword: "landrover,diecast,car" },
        { title: "스노우피크 랜드락 텐트", keyword: "snowpeak,tent" },
        { title: "콜맨 빈티지 랜턴", keyword: "coleman,lantern,vintage" },
        { title: "브롬톤 자전거 P라인", keyword: "brompton,bike" },
        { title: "전동 킥보드 듀얼트론", keyword: "dualtron,scooter" },
        { title: "헤드 테니스 라켓 한정판", keyword: "head,tennis,racket" },
        { title: "타이틀리스트 T100 아이언 세트", keyword: "titleist,golf,clubs" },
        { title: "살로몬 트레이닝 러닝화", keyword: "salomon,shoes" },
        { title: "몰스킨 스마트 라이팅 세트", keyword: "moleskine,notebook" },
        { title: "리모와 라이트 캐빈 트롤리", keyword: "rimowa,suitcase" }
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
                viewCount: Math.floor(Math.random() * 500),
                watchlistCount: Math.floor(Math.random() * 50),
                bidCount: Math.floor(Math.random() * 20),
                buyNowEnabled: index % 2 === 1,
                buyNowPrice: index % 2 === 1 ? basePrice + (Math.floor(Math.random() * 50) + 10) * 10000 : undefined,
            });
        });
    });

    return items;
};

export const MOCK_AUCTIONS: AuctionItem[] = generateItems();
