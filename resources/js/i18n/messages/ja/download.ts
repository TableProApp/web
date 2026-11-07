import type { Messages } from '../../types.ts';

export default {
    "macCta": "Mac 版をダウンロード",
    "linuxCta": "Linux にインストール",
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
    "panel": {
        "legend": "プラットフォーム",
        "beta": "ベータ版",
        "updates": {
            "mac": "バックグラウンドで自動アップデート",
            "ios": "App Store からアップデート"
        }
    },
    "linux": {
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
    "otherPlatforms": {
        "question": "{platforms} 版はありますか？"
    }
} satisfies Messages['download'];
