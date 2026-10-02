import type { Messages } from '../../types.ts';

/**
 * Shorter than the English question on purpose. The bar must keep the
 * question and its link on one line at 1440px (382px of text, design-system
 * §5.3.17). Measured with Inter's advance widths at 14px, "Cho phép cookie
 * Google Analytics để đo lượt truy cập? Quyền riêng tư" takes 466px, and every
 * phrasing that keeps "để đo lượt truy cập" takes 397px or more; this one
 * takes 362px. The tool's name says what the cookies are for, and the region
 * label and the privacy link carry the rest.
 */
export default {
    label: 'Cookie phân tích',
    body: 'Cho phép Google Analytics đặt cookie?',
    privacy: 'Quyền riêng tư',
    allow: 'Cho phép',
    decline: 'Từ chối',
} satisfies Messages['consent'];
