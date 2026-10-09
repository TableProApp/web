// Renders og-site-{locale}.html to a 1200 x 630 PNG at device scale 1 and
// audits it: which platform font drew every glyph (CDP
// CSS.getPlatformFontsForNode), each text block's line count and box.
//
//   node render.cjs <html> <png>
//
// It launches the chrome-headless-shell 149.0.7827.22 the committed cards were
// rendered with, from puppeteer's cache in the home directory, unless
// PUPPETEER_EXECUTABLE_PATH names another binary.
// Resolve from the project or NODE_PATH, without pinning one developer's machine.
const puppeteer = require('puppeteer');
const os = require('os');
const path = require('path');

const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH
    ?? path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-149.0.7827.22/chrome-headless-shell-mac-arm64/chrome-headless-shell');

(async () => {
    const [html, png] = process.argv.slice(2);
    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: 'shell',
        args: ['--force-color-profile=srgb', '--hide-scrollbars', '--disable-lcd-text'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
        await page.goto('file://' + path.resolve(html), { waitUntil: 'load' });
        await page.evaluate(async () => {
            for (const el of document.querySelectorAll('[data-audit]')) {
                const style = getComputedStyle(el);
                await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, el.textContent);
            }
            await document.fonts.ready;
        });

        const boxes = await page.evaluate(() => [...document.querySelectorAll('[data-audit]')].map((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const rects = [...range.getClientRects()].filter((r) => r.width > 0);
            const lines = new Set(rects.map((r) => Math.round(r.top))).size;
            const box = el.tagName === 'IMG' ? el.getBoundingClientRect() : range.getBoundingClientRect();

            return {
                name: el.dataset.audit,
                text: el.tagName === 'IMG' ? null : el.textContent.replace(/\s+/g, ' ').trim(),
                lines: el.tagName === 'IMG' ? null : lines,
                box: { left: Math.round(box.left), top: Math.round(box.top), right: Math.round(box.right), bottom: Math.round(box.bottom) },
                naturalWidth: el.tagName === 'IMG' ? el.naturalWidth : undefined,
            };
        }));

        const cdp = await page.createCDPSession();
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
        const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.wordmark, .sentence, .sentence .nobr, .address' });
        const fonts = [];

        for (const nodeId of nodeIds) {
            const { node } = await cdp.send('DOM.describeNode', { nodeId });
            const { fonts: used } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
            fonts.push({ node: `${node.localName}.${(node.attributes || [])[1] || ''}`, used });
        }

        await page.screenshot({ path: png, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 }, omitBackground: false });
        console.log(JSON.stringify({ png, boxes, fonts }, null, 1));
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
