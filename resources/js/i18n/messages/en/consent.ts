/**
 * The `consent` namespace: the analytics consent bar.
 *
 * One short question, a Privacy link and two equal buttons, so the bar stays
 * within 120px on a 375px phone and 96px at 1440px (design-system §5.3.17).
 * Measured with Inter's own advance widths at 14px: the English question and
 * its link take one line of the 382px the bar has at 1440px, and two at 375px.
 * A longer sentence costs a line, about 22px, at both widths.
 *
 * Declining must be as easy as allowing, so the buttons are a plain pair.
 */
export default {
    label: 'Analytics cookies',
    body: 'Allow Google Analytics cookies to measure visits?',
    privacy: 'Privacy',
    allow: 'Allow',
    decline: 'Decline',
};
