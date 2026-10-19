import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac 版をダウンロード",
    "release": {
        "dated": "バージョン {version}、{date} リリース",
        "undated": "バージョン {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "リリースノート（英語）",
        "unavailable": "リリース情報を取得できません。ボタンは GitHub の最新リリースを開きます。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "onAnotherDevice": "Mac アプリをインストールするには、Mac でこのページを開いてください。",
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
