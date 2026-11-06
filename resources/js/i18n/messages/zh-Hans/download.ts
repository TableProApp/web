import type { Messages } from '../../types.ts';

export default {
    "macCta": "下载 Mac 版",
    "release": {
        "dated": "版本 {version}，发布于 {date}",
        "undated": "版本 {version}",
        "notes": "发行说明（英语）",
        "unavailable": "无法获取版本信息。按钮会打开 GitHub 上的最新版本。"
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "checksum": {
        "summary": "验证下载的文件",
        "body": "在终端中对该文件运行 <code>shasum -a 256</code>，结果应与下方的 SHA-256 校验和一致。"
    },
    "afterClick": {
        "title": "接下来，安装应用",
        "body": "从“下载”文件夹打开 {file}，将 TablePro 拖到“应用程序”。",
        "retry": "若下载未开始，请<link>重新下载 {file}</link>。"
    },
    "homebrew": {
        "label": "Homebrew 命令",
        "terminal": "终端"
    },
    "ios": {
        "badge": "从 App Store 下载"
    },
    "orList": {
        "separator": "、",
        "last": " 或 "
    },
    "card": {
        "yourSystem": "您的系统",
        "beta": "Beta 版",
        "dmg": "下载 .dmg",
        "linux": "在 Linux 上安装",
        "updates": {
            "mac": "在后台自动更新",
            "ios": "通过 App Store 更新",
            "linux": "通过包管理器更新"
        }
    },
    "linux": {
        "title": "在 Linux 上安装",
        "beta": "Linux 应用是 Beta 版：尚处早期，不同版本之间可能有变化，请<link>在 GitHub 上报告问题</link>。",
        "methods": "安装方式",
        "floor": "{name} {version}+",
        "anyDistribution": "通过 Flatpak 支持任意发行版",
        "flatpak": "Flatpak",
        "files": "文件",
        "commands": "{method} 命令",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "任何装有 Flatpak 的发行版 · {architectures} · 自带 GNOME {version} 运行时",
        "update": "通过 <code>{command}</code> 获取更新",
        "table": {
            "caption": "Linux 版 TablePro {version} 的软件包",
            "package": "软件包",
            "bundle": "Flatpak 捆绑包"
        },
        "checksums": "所有文件的校验和：<link>{file}</link>",
        "release": "GitHub 上的 Linux 版 TablePro {version}",
        "verify": {
            "summary": "验证文件",
            "body": "在文件所在的文件夹中运行任一命令。第一条检查 GitHub 的构建证明，需要 GitHub CLI；第二条将文件与 {file} 比对。",
            "label": "验证命令"
        }
    },
    "updates": {
        "ios": "与您的其他应用一样，由 App Store 安装更新。",
        "linux": "更新由包管理器随系统其他部分一起安装，应用本身不检查更新。"
    },
    "faq": {
        "title": "常见问题",
        "other": {
            "question": "有 {platforms} 版本吗？"
        },
        "verify": {
            "question": "如何验证下载的文件？",
            "mac": "在 Mac 上，打开下载按钮下方的<ui>验证下载的文件</ui>，比对 SHA-256 校验和。",
            "linux": "在 Linux 上，打开 Linux 部分“文件”标签页中的<ui>验证文件</ui>。"
        }
    }
} satisfies Messages['download'];
