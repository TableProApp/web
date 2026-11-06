import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac 版をダウンロード",
    "release": {
        "dated": "バージョン {version}、{date} リリース",
        "undated": "バージョン {version}",
        "notes": "リリースノート（英語）",
        "unavailable": "リリース情報を取得できません。ボタンは GitHub の最新リリースを開きます。"
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "checksum": {
        "summary": "ダウンロードを検証する",
        "body": "ターミナルでファイルに対して <code>shasum -a 256</code> を実行します。結果が下の SHA-256 チェックサムと一致することを確認してください。"
    },
    "afterClick": {
        "title": "次はインストール",
        "body": "ダウンロードフォルダーの {file} を開き、TablePro をアプリケーションフォルダーにドラッグします。",
        "retry": "ダウンロードが始まらない場合は、<link>{file} をもう一度ダウンロード</link>してください。"
    },
    "homebrew": {
        "label": "Homebrew コマンド",
        "terminal": "ターミナル"
    },
    "ios": {
        "badge": "App Store からダウンロード"
    },
    "orList": {
        "separator": "、",
        "last": " または "
    },
    "card": {
        "yourSystem": "お使いのシステム",
        "beta": "ベータ版",
        "dmg": ".dmg をダウンロード",
        "linux": "Linux にインストール",
        "updates": {
            "mac": "バックグラウンドで自動アップデート",
            "ios": "App Store からアップデート",
            "linux": "パッケージマネージャーでアップデート"
        }
    },
    "linux": {
        "title": "Linux にインストール",
        "beta": "Linux アプリはベータ版です。まだ初期段階のため、リリースごとに変わる可能性があります。<link>不具合は GitHub で報告</link>してください。",
        "methods": "インストール方法",
        "floor": "{name} {version}+",
        "anyDistribution": "Flatpak で任意のディストリビューション",
        "flatpak": "Flatpak",
        "files": "ファイル",
        "commands": "{method} のコマンド",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Flatpak が使えるすべてのディストリビューション · {architectures} · GNOME {version} ランタイムを同梱",
        "update": "<code>{command}</code> でアップデートできます",
        "table": {
            "caption": "Linux 版 TablePro {version} のパッケージ",
            "package": "パッケージ",
            "bundle": "Flatpak バンドル"
        },
        "checksums": "全ファイルのチェックサム：<link>{file}</link>",
        "release": "GitHub の Linux 版 TablePro {version}",
        "verify": {
            "summary": "ファイルを検証する",
            "body": "ファイルがあるフォルダーで、どちらかのコマンドを実行します。1 つ目は GitHub のビルド構成証明を確認するもので、GitHub CLI が必要です。2 つ目はファイルを {file} と照合します。",
            "label": "検証コマンド"
        }
    },
    "platforms": {
        "title": "プラットフォームごとの対応状況",
        "lead": "機能ページにあるすべての機能を並べて比較します。",
        "databases": {
            "one": "{count} 種類のデータベース",
            "other": "{count} 種類のデータベース"
        },
        "capability": "機能",
        "covers": "{platform} {total} 件中 {count} 件",
        "available": "対応",
        "page": "機能ページ",
        "pageLabel": "{page} の機能ページ"
    },
    "updates": {
        "ios": "ほかのアプリと同じく、App Store がアップデートをインストールします。",
        "linux": "パッケージマネージャーが、システムのほかの部分と一緒にアップデートをインストールします。アプリ自身は確認しません。"
    },
    "faq": {
        "title": "よくある質問",
        "free": {
            "question": "Linux 版 TablePro は無料ですか？",
            "answer": "はい、無料で使えます。有料プランは Mac アプリに機能を追加するもので、どれもまだ Linux にはありません。"
        },
        "license": {
            "question": "ライセンスは Linux でも使えますか？",
            "answer": {
                "one": "はい。1 つのライセンスで Mac または Linux のコンピューター {count} 台を有効化できます。有料機能は今のところ Mac のみです。",
                "other": "はい。1 つのライセンスで Mac または Linux のコンピューターを最大 {count} 台まで有効化できます。有料機能は今のところ Mac のみです。"
            }
        },
        "other": {
            "question": "{platforms} 版はありますか？"
        },
        "verify": {
            "question": "ダウンロードを検証するには？",
            "mac": "Mac では、ダウンロードボタンの下にある<ui>ダウンロードを検証する</ui>を開き、SHA-256 チェックサムを比較します。",
            "linux": "Linux では、Linux セクションの「ファイル」タブにある<ui>ファイルを検証する</ui>を開きます。"
        }
    }
} satisfies Messages['download'];
