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
    band: {
        title: 'Giảm {percent}% TablePro Pro',
        lead: 'Pro mua một lần còn {lifetime} thay vì {lifetimeList}, Pro theo năm còn {yearly} thay vì {yearlyList} cho năm đầu tiên.',
        cta: 'Xem ưu đãi',
        onPricing: 'Giá Pro bên dưới đã gồm ưu đãi này.',
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
} satisfies Messages['campaign'];
