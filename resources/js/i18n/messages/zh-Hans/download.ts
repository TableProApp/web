import type { Messages } from '../../types.ts';

export default {
    "macCta": "下载 Mac 版",
    "builds": {
        "arm64": "下载 Apple silicon 版",
        "x86_64": "下载 Intel 版"
    },
    "release": {
        "dated": "版本 {version}，发布于 {date}",
        "undated": "版本 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "发行说明（英语）",
        "unavailable": "无法获取版本信息。两个按钮都会打开 GitHub 上的最新版本，请在那里选择安装包。"
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ".",
            "group": ","
        }
    },
    "detected": "浏览器显示您的 Mac 使用 {chip}。",
    "onAnotherDevice": "要安装 Mac 应用，请在 Mac 上打开此页面。",
    "whichMac": {
        "summary": "我的 Mac 是哪种型号？",
        "body": "在 Apple 菜单中选择“关于本机”。显示“芯片”一栏的是 Apple 芯片 Mac；“处理器”一栏显示 Intel 的是 Intel Mac。"
    },
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
