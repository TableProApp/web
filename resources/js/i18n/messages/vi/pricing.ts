import type { Messages } from '../../types.ts';

export default {
    currency: {
        pattern: '{amount} US$',
        decimal: ',',
        group: '.',
    },
    cycles: {
        legend: 'Chu kỳ thanh toán',
        monthly: 'Theo tháng',
        yearly: 'Theo năm',
        lifetime: 'Mua một lần',
    },
    captions: {
        monthly: 'Tự động gia hạn mỗi tháng cho tới khi bạn hủy.',
        yearly: 'Tự động gia hạn mỗi năm cho tới khi bạn hủy. Rẻ hơn {percent}% so với trả theo tháng trong một năm.',
        yearlyByTier: 'Tự động gia hạn mỗi năm cho tới khi bạn hủy. So với trả theo tháng trong một năm, gói Starter rẻ hơn {starterPercent}%, gói Team rẻ hơn {teamPercent}%.',
        lifetime: 'Trả một lần, không có ngày hết hạn.',
    },
    tiers: {
        free: {
            name: 'Miễn phí',
            description: 'Công cụ cơ sở dữ liệu cơ bản, không có thời gian dùng thử.',
            activation: 'Không cần đăng ký để dùng ứng dụng.',
            includesTitle: 'Bao gồm',
            includes: [
                'Kết nối tới bất kỳ engine nào được hỗ trợ',
                'SQL editor và data grid',
                'Trợ lý AI và MCP server',
                'Safe Mode',
                'Ứng dụng cho iPhone và iPad',
            ],
        },
        starter: {
            name: 'Starter',
            description: 'Bổ sung cho ứng dụng Mac các tính năng như {examples}.',
            activation: {
                other: 'Một người, tối đa {count} máy Mac.',
            },
            includesTitle: 'Mọi thứ trong gói Miễn phí, cộng thêm',
            cta: 'Mua gói Starter',
        },
        team: {
            name: 'Team',
            description: 'Chia sẻ connection và query đã lưu với nhóm.',
            activation: 'Một máy Mac đã kích hoạt cho mỗi seat.',
            includesTitle: 'Mọi thứ trong gói Starter, cộng thêm',
            cta: 'Mua gói Team',
        },
    },
    units: {
        starter: {
            monthly: 'mỗi tháng',
            yearly: 'mỗi năm',
            lifetime: 'trả một lần',
        },
        team: {
            monthly: 'mỗi seat, mỗi tháng',
            yearly: 'mỗi seat, mỗi năm',
            lifetime: 'mỗi seat, trả một lần',
        },
    },
    seats: {
        label: 'Số seat',
        noun: 'số seat',
        bounds: 'Tối thiểu {min} seat, tối đa {max} seat.',
        clamped: {
            min: 'Đã đổi thành mức tối thiểu là {min} seat.',
            max: 'Đã đổi thành mức tối đa là {max} seat.',
        },
        total: {
            monthly: { other: '{count} seat: {total} mỗi tháng' },
            yearly: { other: '{count} seat: {total} mỗi năm' },
            lifetime: { other: '{count} seat: {total}, trả một lần' },
        },
    },
    prioritySupport: {
        name: 'Hỗ trợ ưu tiên',
        detail: {
            other: 'Email của khách hàng gói Team được trả lời trước, trong vòng {count} ngày làm việc.',
        },
    },
    allFeatures: 'Tất cả tính năng trả phí',
    refund: {
        other: 'Mọi gói trả phí đều được hoàn tiền trong vòng {count} ngày kể từ ngày mua, và mỗi lần gia hạn theo tháng hoặc theo năm trong vòng {count} ngày kể từ ngày tính phí. Xem <link>chính sách hoàn tiền</link>.',
    },
    finePrint: 'Giá tính bằng USD. {merchant} xử lý thanh toán và tính thuế bán hàng hoặc VAT tại checkout với vai trò merchant of record.',
    finePrintCurrency: 'Giá tính bằng USD.',
    comparePlans: 'So sánh các gói',
    section: {
        title: 'Bảng giá',
        lead: 'TablePro là phần mềm mã nguồn mở, dùng miễn phí. Các gói trả phí bổ sung một số tính năng cho ứng dụng Mac.',
    },
    matrix: {
        caption: 'Những gì mỗi gói có trong ứng dụng Mac',
        feature: 'Tính năng',
        macs: 'Số máy Mac',
        macsFree: 'Không cần license',
        macsStarter: { other: 'Tối đa {count}' },
        macsTeam: 'Một máy mỗi seat',
        everythingElse: 'Mọi phần còn lại của ứng dụng',
        everythingElseDetail: 'Mọi engine được hỗ trợ, SQL editor, trợ lý AI, MCP server và Safe Mode',
        iphoneNote: 'Ứng dụng cho iPhone và iPad không có tính năng trả phí. Trên iPhone và iPad, iCloud Sync miễn phí; muốn đồng bộ với máy Mac thì máy Mac cần gói Starter hoặc Team.',
    },
    regional: {
        note: 'Giá cho quốc gia của bạn ({country}): giảm {percent}%, áp dụng khi thanh toán.',
        listPrice: 'Giá gốc {price}',
    },
    discount: {
        atCheckout: 'Có mã giảm giá? Bạn nhập mã ở bước thanh toán.',
        summary: 'Có mã giảm giá?',
        label: 'Mã giảm giá',
        apply: 'Áp dụng mã',
        checking: 'Đang kiểm tra mã…',
        percent: 'Mã hợp lệ: giảm {amount}%, áp dụng khi thanh toán.',
        fixed: 'Mã hợp lệ: giảm {amount}, áp dụng khi thanh toán.',
        invalid: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
    },
    checkout: {
        failed: 'Không mở được trang thanh toán. Hãy thử lại.',
    },
    offers: {
        name: '{plan}, {cycle}',
        seat: 'seat',
    },
} satisfies Messages['pricing'];
