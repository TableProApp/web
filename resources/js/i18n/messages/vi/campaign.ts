import type { Messages } from '../../types.ts';

export default {
    name: 'Black Friday',
    banner: {
        label: 'Ưu đãi Black Friday',
        message: 'Giảm {percent}% gói Pro mua một lần và theo năm.',
        short: 'Giảm {percent}% Pro',
        cta: 'Xem ưu đãi',
        close: 'Đóng thông báo Black Friday',
    },
    offer: {
        tag: 'Black Friday: giảm {percent}%',
        firstYear: 'Cho năm đầu tiên, sau đó {price} mỗi năm.',
        listPrice: 'Giá gốc {price}',
    },
    code: {
        label: 'Mã',
        applied: 'Được áp dụng sẵn khi bạn mua trên website này.',
        copyLabel: 'mã giảm giá',
    },
    countdown: {
        endsIn: 'Kết thúc sau',
        startsIn: 'Bắt đầu sau',
        until: 'Đến {time} UTC ngày {date}',
        from: 'Từ {time} UTC ngày {date}',
        units: {
            days: { other: 'ngày' },
            hours: 'giờ',
            minutes: 'phút',
            seconds: 'giây',
        },
    },
    notice: {
        headline: 'Giảm {percent}%',
        product: 'TablePro Pro',
        window: 'Pro mua một lần và Pro theo năm, đến {endsAtTime} UTC ngày {endsOn}.',
        lifetime: 'Pro mua một lần',
        lifetimeDetail: 'Trả một lần. Mọi bản cập nhật và tính năng Pro mới.',
        yearly: 'Pro theo năm',
        buy: 'Mua gói Pro mua một lần với giá {price}',
        both: 'Xem cả hai ưu đãi',
        later: 'Để sau',
        footnote: 'Pro theo tháng và Team không được giảm giá. Giá thường áp dụng từ {listPriceSince}.',
        card: 'Black Friday: giảm {percent}% Pro',
        cardPrice: 'Pro mua một lần giá {price}.',
    },
} satisfies Messages['campaign'];
