import type { Messages } from '../../types.ts';

export default {
    "macCta": "下载 Mac 版",
    "release": {
        "dated": "版本 {version}，发布于 {date}",
        "undated": "版本 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "发行说明（英语）",
        "unavailable": "无法获取版本信息。按钮会打开 GitHub 上的最新版本。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "onAnotherDevice": "要安装 Mac 应用，请在 Mac 上打开此页面。",
    "checksum": {
        "summary": "验证下载的文件",
        "body": "在终端中对该文件运行 <code>shasum -a 256</code>，结果应与下方的 SHA-256 校验和一致。"
    },
    "afterClick": {
        "title": "接下来，安装应用",
        "body": "从“下载”文件夹打开 {file}，将 TablePro 拖到“应用程序”。",
        "retry": "若下载未开始，请<link>重新下载 {file}</link>。",
        "steps": "安装与首次启动"
    },
    "homebrew": {
        "label": "Homebrew 命令",
        "terminal": "终端"
    },
    "ios": {
        "badge": "从 App Store 下载"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": "、",
            "last": " 或 "
        }
    }
} satisfies Messages['download'];
