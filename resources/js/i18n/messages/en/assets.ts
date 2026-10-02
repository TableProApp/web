/**
 * The `assets` namespace: the visible labels of `<AssetSlot>` placeholders.
 *
 * The type vocabulary is design-system §6.2's. Labels live here, never in
 * resources/data/assets.json, which holds only the per-asset descriptions.
 */
export default {
    types: {
        screenshot: 'Screenshot placeholder',
        detail: 'Detail crop placeholder',
        'screenshot-phone': 'iPhone screenshot placeholder',
        'screenshot-ipad': 'iPad screenshot placeholder',
        diagram: 'Diagram placeholder',
        illustration: 'Illustration placeholder',
    },
    /** The placeholder's accessible name. The asset id is left out: it is for the owner, not for a screen reader. */
    accessibleName: '{type}: {description}',
};
