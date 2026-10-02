# Social cards

**Current state (temporary).** Every page's `og:image` is a card that `php artisan og:generate` renders from the
templates in `resources/views/og/` (architecture §1.15): the TablePro logo and the page's own title on the site
palette, set in Inter, with no screenshot and no app chrome.

- The generic card, used by every page without a card of its own (the homepage, the hubs, `/pricing`, `/download`,
  `/ios`, `/faq`, the legal pages and the blog index): `/og.png` in English and `/og/vi/default.png` in Vietnamese.
- Page cards: `/og/{feature,database,compare}/{slug}.png` in English and `/og/vi/{feature,database,compare}/{slug}.png`
  in Vietnamese. Release posts keep their English cards at `/og/blog/{slug}.png`; no post has a Vietnamese card.
- A page never points at a card file that does not exist, and no placeholder box is ever published as a card.

The one bespoke card planned is `og-site` below. Until you supply it, the generated generic card stays in use.

Hiện tại mọi trang dùng ảnh OG do `og:generate` tạo từ template, nên bạn không cần làm gì với các ảnh đó. Phần dưới
chỉ mô tả ảnh OG mặc định mà bạn có thể thiết kế lại sau.

## og-site

### Purpose
A designed default social card, in English and Vietnamese, that replaces the generated generic card on every page
without a card of its own.

### Scene
- Designed brand artwork, not a screenshot. Subject: the TablePro logo with its wordmark, and the identity sentence in
  the card's language (positioning §6.1, the same sentence the generated card takes from `content/{locale}/home.json`):
  - en: "TablePro is a native, open-source database client for developers."
  - vi: "TablePro là database client native, mã nguồn mở, dành cho lập trình viên."
- Optional: one crop of a real Mac capture made for this handoff with sample data (for example from the
  `mac-hero-window` capture once it exists). Never drawn UI, a mock-up or the placeholder box.
- Leave out anything that goes stale or is banned site-wide (positioning §12): platform or device lists, version
  numbers, engine or feature counts, prices, speed or size claims, "for Mac" as the identity, "coming soon".
- Palette and type: the brand orange (hue 55) as the accent on the light page background, Inter for the text. The
  Vietnamese card must render every diacritic in Inter, not in a fallback font.

### Framing
- Exactly 1200 × 630 px, opaque PNG in sRGB, at most 300 KB.
- Safe area: the logo and all text at least 64 px from every edge. X crops the card to 2:1, and small link previews
  scale it to about 500 px wide, so the sentence must stay legible at that width: about 52 px type or larger, at most
  three lines in either language (the Vietnamese sentence is longer; check it).
- Some messengers show only a centred square; keep the logo inside the central 630 × 630.
- No arrows, no fine print, no URL other than an optional `tablepro.app`.

### Light and dark
One light image. Link previews have no theme and sit on the host app's own background, so do not rely on transparency.

### Locale
Two files with the same layout, one per locale: `og-site-en.png` and `og-site-vi.png`. Only the sentence changes. The
English card carries only English and the Vietnamese card only Vietnamese.

### Open evidence
None. The page head already reads this entry: `App\Support\Seo\OgImages` asks
`AssetManifest::ogCard('og-site', $locale)` before it falls back to the generated card. Setting the entry to `supplied`
(with its `src`) and adding `public/og/bespoke/og-site-{en,vi}.png` switches every page without a card of its own to
the bespoke card. Each locale switches only once its own file exists, so a missing Vietnamese file leaves
`/og/vi/default.png` in use.

### Manifest changes
None.

### Tóm tắt cho chủ sở hữu
Hãy thiết kế một ảnh chia sẻ 1200 × 630 thay cho ảnh OG mặc định do `og:generate` tạo, dùng cho các trang không có ảnh
riêng (trang chủ, các trang tổng hợp, Bảng giá, Tải về, trang iPhone và iPad, Câu hỏi thường gặp, các trang pháp lý và
trang danh sách bài blog). Nội dung chỉ gồm logo TablePro và câu giới thiệu sản phẩm, làm hai bản tiếng Anh và tiếng
Việt với cùng bố cục. Giữ logo và chữ cách mép ít nhất 64 px; không ghi nền tảng, phiên bản, số lượng, giá hay tốc độ.
Trong lúc chờ, các trang vẫn dùng ảnh do template tạo.
