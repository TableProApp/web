import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac 版をダウンロード",
    "builds": {
        "arm64": "Apple silicon 版をダウンロード",
        "x86_64": "Intel 版をダウンロード"
    },
    "release": {
        "dated": "バージョン {version}、{date} リリース",
        "undated": "バージョン {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "リリースノート（英語）",
        "unavailable": "最新リリースの詳細を読み込めませんでした。どちらのボタンも GitHub の最新リリースを開きます。そこでお使いの Mac に合うディスクイメージを選べます。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "detected": "ブラウザーによると、お使いの Mac は {chip} 搭載です。",
    "onAnotherDevice": "Mac アプリをインストールするには、Mac でこのページを開いてください。",
    "whichMac": {
        "summary": "自分の Mac の種類を確認する",
        "body": "Apple メニューから「この Mac について」を開きます。Apple silicon 搭載 Mac には「チップ」欄があり、Apple M2 などと表示されます。Intel Mac には「プロセッサ」欄があり、Intel と表示されます。"
    },
    "checksum": {
        "summary": "ダウンロードを検証する",
        "body": "ターミナルでファイルに対して <code>shasum -a 256</code> を実行します。結果が下の SHA-256 チェックサムと一致することを確認してください。"
    },
    "afterClick": {
        "title": "次はインストール",
        "body": "ダウンロードフォルダーの {file} を開き、TablePro をアプリケーションフォルダーにドラッグします。",
        "retry": "ダウンロードが始まらない場合は、<link>{file} をもう一度ダウンロード</link>してください。",
        "steps": "インストールと初回起動"
    },
    "homebrew": {
        "label": "Homebrew コマンド",
        "terminal": "ターミナル"
    },
    "ios": {
        "badge": "App Store からダウンロード"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": "、",
            "last": " または "
        }
    }
} satisfies Messages['download'];
