import type { Messages } from '../../types.ts';

export default {
    "status": "오류 {status}",
    "notFound": {
        "title": "페이지를 찾을 수 없습니다",
        "body": "주소가 잘못 입력되었거나 페이지가 이동했을 수 있습니다. 아래 페이지에서 시작해 보세요."
    },
    "gone": {
        "title": "이 페이지는 삭제되었습니다",
        "body": "이 페이지는 더 이상 tablepro.app에 없으며 대체 페이지도 없습니다."
    },
    "serverError": {
        "title": "문제가 발생했습니다",
        "body": "저희 측에서 문제가 발생했습니다. 잠시 후 다시 시도하세요. 문제가 계속되면 {email} 주소로 이메일을 보내주세요."
    },
    "unavailable": {
        "title": "점검 중",
        "body": "tablepro.app이 곧 다시 운영됩니다."
    },
    "translation": {
        "title": "이 페이지는 {language}로만 제공됩니다",
        "body": "아직 번역되지 않았습니다.",
        "link": "{language}로 읽기"
    },
    "account": {
        "body": "계정 주소는 모든 언어에서 동일합니다. 여기서 선택한 언어로 여세요.",
        "link": "계정 열기"
    },
    "languages": {
        "en": "영어",
        "vi": "베트남어",
        "es": "스페인어",
        "de": "독일어",
        "fr": "프랑스어",
        "ja": "일본어",
        "pt-BR": "포르투갈어 (브라질)",
        "zh-Hans": "중국어 간체",
        "ko": "한국어",
        "zh-Hant": "중국어 번체",
        "it": "이탈리아어",
        "id": "인도네시아어"
    },
    "linksLabel": "시작할 페이지",
    "links": {
        "home": "홈",
        "features": "기능",
        "databases": "데이터베이스",
        "download": "다운로드",
        "blog": "블로그"
    }
} satisfies Messages['errors'];
