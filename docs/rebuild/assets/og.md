# Social cards

**Current state.** One social card is bespoke artwork: `og-site` below, supplied on 2026-10-03, which every page
without a card of its own shares. Every other `og:image` is a card that `php artisan og:generate` renders from the
templates in `resources/views/og/` (architecture §1.15): the TablePro logo and the page's own title on the site
palette, set in Inter, with no screenshot and no app chrome. Those cards are committed under `public/og/`; they are
generated, not drawn, so they are not part of your work.

- The generic card, used by every page without a card of its own (the homepage, the hubs, `/pricing`, `/download`,
  `/ios`, `/faq`, the legal pages and the blog index): the bespoke `/og/bespoke/og-site-en.png` in English and
  `/og/bespoke/og-site-vi.png` in Vietnamese. The generated `/og.png` and `/og/vi/default.png` stay committed and
  current: a locale whose bespoke file is missing falls back to its generated card, and `/og.png` is the card that
  shares made before the rebuild and the platform app's default point at.
- Page cards: `/og/{feature,database,compare}/{slug}.png` in English and `/og/vi/{feature,database,compare}/{slug}.png`
  in Vietnamese. Release posts keep their English cards at `/og/blog/{slug}.png`; no post has a Vietnamese card.
- `App\Support\Seo\OgImages` picks, in order: the page's own card, the bespoke `og-site` card once supplied, the
  generated generic card for the page's language, and otherwise no `og:image` at all. A page never points at a card
  file that does not exist, and no placeholder box is ever published as a card.
- The cards are rendered with `php artisan og:generate --type=all --locale=all` (Chromium is required; locally set
  `PUPPETEER_EXECUTABLE_PATH`), or by the `og cards` workflow (`.github/workflows/og.yml`), which commits them.
  Before launch, check that every card under `public/og/` comes from the current templates: a card rendered before
  the rebuild still shows the old design and its claims.

The one bespoke card is `og-site` below. To redesign it, replace its two files with new ones of the same name and
size, and update its `alt` in `resources/data/assets.json` if the words change.

Các trang có ảnh OG riêng dùng ảnh do `og:generate` tạo từ template, nên bạn không cần vẽ các ảnh đó; trước khi ra
mắt chỉ cần chạy lại lệnh để mọi ảnh trong `public/og/` dùng template mới. Các trang còn lại dùng ảnh `og-site` (có
từ 2026-10-03). Phần dưới mô tả ảnh OG mặc định 1200 × 630 này, để bạn thiết kế lại sau nếu muốn.

## og-site

### Purpose
A designed default social card, in English and Vietnamese, that replaces the generated generic card on every page
without a card of its own.

### Scene
- Designed brand artwork, not a screenshot. Subject: the TablePro logo with its wordmark, and the identity sentence
  of positioning §6.1 (the "OG fallback" row) in the card's language, in two lines at 56 px:
  - en: "TablePro is a native, open-source database client for developers."
  - vi: "TablePro là database client native, mã nguồn mở, dành cho lập trình viên."
- The homepage H1 ("A native database client for developers.") also fits, but positioning §6.1 reserves the
  identity sentence for this card.
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
Ảnh hiện tại (2026-10-03) gồm logo, câu giới thiệu theo positioning §6.1 và địa chỉ tablepro.app; ngôn ngữ nào thiếu file thì quay
về ảnh do template tạo.
