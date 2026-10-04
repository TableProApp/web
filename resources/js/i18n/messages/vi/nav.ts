import type { Messages } from '../../types.ts';

export default {
    label: 'Điều hướng chính',
    features: 'Tính năng',
    featureLinks: {
        all: 'Tất cả tính năng',
        querying: 'Query',
        dataEditing: 'Chỉnh sửa dữ liệu',
        schema: 'Schema',
        importExport: 'Import và export',
        aiMcp: 'AI và MCP',
        connections: 'Kết nối',
        syncTeams: 'Đồng bộ và làm việc nhóm',
    },
    databases: 'Cơ sở dữ liệu',
    pricing: 'Bảng giá',
    docs: 'Tài liệu',
    docsLabel: 'Tài liệu (tiếng Anh)',
    blog: 'Blog',
    faq: 'Câu hỏi thường gặp',
    account: 'Tài khoản',
    download: 'Tải về',
    menu: 'Menu',
    closeMenu: 'Đóng menu',
} satisfies Messages['nav'];
