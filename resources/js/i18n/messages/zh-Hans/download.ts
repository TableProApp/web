import type { Messages } from '../../types.ts';

export default {
    "macCta": "下载 Mac 版",
    "builds": {
        "arm64": "下载 Apple 芯片版",
        "x86_64": "下载 Intel 版"
    },
    "release": {
        "dated": "版本 {version}，发布于 {date}",
        "undated": "版本 {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "发行说明",
        "unavailable": "无法加载当前版本详情。两个按钮都会打开 GitHub 上的最新版本，您可在那里选择适合 Mac 的磁盘映像。"
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
        "body": "打开 Apple 菜单并选择“关于本机”。Apple 芯片 Mac 会显示“芯片”一栏，如 Apple M2。Intel Mac 则显示“处理器”一栏，其中标有 Intel。"
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
            "last": "或"
        }
    }
} satisfies Messages['download'];
