import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "${amount}",
        "decimal": ".",
        "group": ","
    },
    "cycles": {
        "legend": "결제 주기",
        "monthly": "월간",
        "yearly": "연간",
        "lifetime": "일회성"
    },
    "captions": {
        "monthly": "취소할 때까지 매월 갱신됩니다.",
        "yearly": "취소할 때까지 매년 갱신됩니다. 월간 결제 12회보다 {percent}% 저렴합니다.",
        "yearlyByTier": "취소할 때까지 매년 갱신됩니다. 월간 결제 12회보다 Starter는 {starterPercent}%, Team은 {teamPercent}% 저렴합니다.",
        "lifetime": "한 번 결제하며 만료일은 없습니다."
    },
    "tiers": {
        "free": {
            "name": "무료",
            "description": "유료 기능을 제외한 Mac 앱과 iPhone 및 iPad 앱.",
            "activation": "가입 없이 앱을 사용할 수 있습니다.",
            "includesTitle": "포함 기능",
            "includes": [
                "지원하는 모든 엔진 연결",
                "SQL 편집기 및 데이터 그리드",
                "AI 어시스턴트 및 MCP 서버",
                "안전 모드",
                "iPhone 및 iPad 앱"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Mac 앱에 Starter 기능을 추가합니다.",
            "activation": {
                "one": "라이선스 하나로 Mac {count}대.",
                "other": "라이선스 하나로 Mac 최대 {count}대."
            },
            "includesTitle": "무료 플랜의 모든 기능과 추가 기능",
            "cta": "Starter 구매"
        },
        "team": {
            "name": "Team",
            "description": "Starter 기능에 더해 팀과 연결 및 쿼리를 공유할 수 있습니다.",
            "activation": "좌석 하나당 Mac 한 대를 활성화합니다.",
            "includesTitle": "Starter의 모든 기능과 추가 기능",
            "cta": "Team 구매"
        }
    },
    "units": {
        "starter": {
            "monthly": "월",
            "yearly": "연",
            "lifetime": "일회 결제"
        },
        "team": {
            "monthly": "좌석당 월",
            "yearly": "좌석당 연",
            "lifetime": "좌석당 일회 결제"
        }
    },
    "seats": {
        "label": "좌석 수",
        "noun": "좌석 수",
        "bounds": "최소 {min}좌석, 최대 {max}좌석.",
        "total": {
            "monthly": {
                "one": "{count}좌석: 월 {total}",
                "other": "{count}좌석: 월 {total}"
            },
            "yearly": {
                "one": "{count}좌석: 연 {total}",
                "other": "{count}좌석: 연 {total}"
            },
            "lifetime": {
                "one": "{count}좌석: {total}, 일회 결제",
                "other": "{count}좌석: {total}, 일회 결제"
            }
        }
    },
    "prioritySupport": {
        "name": "우선 지원",
        "detail": {
            "one": "Team 고객의 이메일을 우선 처리하며 영업일 기준 1일 이내에 답변합니다.",
            "other": "Team 고객의 이메일을 우선 처리하며 영업일 기준 {count}일 이내에 답변합니다."
        }
    },
    "allFeatures": "모든 유료 기능",
    "finePrint": "가격은 미국 달러 기준입니다. {merchant}가 merchant of record로서 결제를 받고 결제 시 판매세 또는 VAT를 계산합니다.",
    "finePrintCurrency": "가격은 미국 달러 기준입니다.",
    "comparePlans": "플랜 비교",
    "section": {
        "title": "요금",
        "lead": "TablePro는 오픈 소스이며 무료로 사용할 수 있습니다. 유료 플랜은 Mac 앱에 선택 기능을 추가합니다."
    },
    "matrix": {
        "caption": "Mac 앱의 플랜별 포함 기능",
        "feature": "기능",
        "macs": "Mac 수",
        "macsFree": "라이선스 불필요",
        "macsStarter": {
            "one": "{count}",
            "other": "최대 {count}"
        },
        "macsTeam": "좌석당 한 대",
        "everythingElse": "앱의 나머지 모든 기능",
        "everythingElseDetail": "지원하는 모든 엔진, SQL 편집기, AI 어시스턴트, MCP 서버 및 안전 모드",
        "iphoneNote": "iPhone 및 iPad 앱에는 유료 기능이 없습니다. 해당 앱의 iCloud 동기화는 무료이며, Mac과 동기화하려면 Mac에 Starter 또는 Team이 필요합니다."
    },
    "discount": {
        "atCheckout": "할인 코드가 있나요? 결제 시 입력하세요.",
        "summary": "할인 코드가 있나요?",
        "label": "할인 코드",
        "apply": "코드 적용",
        "checking": "코드 확인 중…",
        "percent": "코드가 적용되었습니다. 결제 시 {amount}% 할인됩니다.",
        "fixed": "코드가 적용되었습니다. 결제 시 {amount} 할인됩니다.",
        "invalid": "할인 코드가 유효하지 않거나 만료되었습니다."
    },
    "checkout": {
        "failed": "결제를 시작하지 못했습니다. 다시 시도하세요."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "좌석"
    }
} satisfies Messages['pricing'];
