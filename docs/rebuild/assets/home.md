# Homepage

The homepage owns sixteen slots, all captured on 2026-11-07 for the redesign (sitemap §D):

- **The hero's four devices** (`home-hero-*`, kind `device`): one real capture per released platform, each inside its
  device's frame, cut to the device with a transparent edge. The hero layers them on one baseline.
- **The feature tabs' twelve windows** (`{mac,linux}-home-*`, kind `window-whole`): one capture per tab and
  platform, shown whole at every width; the owner does not want phone crops here.

Every capture uses the `shop` sample database on PostgreSQL (fictional data, emails on example.com; the seed lives
outside the repositories with the capture masters), in light and dark from the same scene.

Trang chủ có 16 ảnh riêng: bốn thiết bị ở phần đầu trang (Mac, Linux, iPad, iPhone, mỗi thiết bị một ảnh chụp app
thật trong khung máy) và 12 cửa sổ cho các tab tính năng (6 tab × Mac và Linux), hiện nguyên cửa sổ trên mọi màn hình.

## home-hero-mac, home-hero-linux, home-hero-ipad, home-hero-iphone

### Purpose
Show at first glance every platform TablePro runs on, as the real apps, not as a list.

### Scene
- Mac: TablePro (latest release) in a macOS VM at the MacBook Pro 14" screen size (3024 × 1986), the SQL editor with
  a revenue-by-month query on `orders` and its results, inside Apple's MacBook Pro product bezel.
- Linux: TablePro for Linux (latest beta) maximised on GNOME at the Framework Laptop 13 Pro screen size
  (2880 × 1920), `orders` filtered with a WHERE clause, placed on Framework's front product photo (black ground
  removed).
- iPad and iPhone: the iPhone and iPad app on the newest iPad Pro 13" and iPhone Pro simulators, `products` on the
  iPad and the connection list on the iPhone, status bar at 9:41 with full signal and battery, inside Apple's bezels.

### Framing
Each layer is cut to its device. 2× its desktop width: Mac 1280, Linux 1040, iPad 640, iPhone 208. Bezels follow the
theme: silver in light, Space Black in dark; the Framework photo has one colour.

### Light and dark
Both, from the same scene (macOS appearance, GNOME colour scheme, simulator appearance).

## {mac,linux}-home-{querying,data-editing,schema,import-export,ai-mcp,connections}

### Purpose
One window per feature tab and platform, so a reader sees the feature as it looks on their system.

### Scene (both platforms unless noted)
- querying: a query joining `orders` and `users`, the column completion list open after `o.`, results below.
- data-editing: three edited prices in `products`, not yet saved.
- schema: a new `verified boolean NOT NULL DEFAULT false` column on `reviews`, staged (the Mac shows the SQL Preview
  sheet).
- import-export: the Export dialog (Mac: three tables, CSV; Linux: Export Rows, CSV).
- ai-mcp: the AI chat answering with SQL, through a local model (Ollama), so the model name shows in the panel.
- connections: Mac, the connection switcher with five saved connections; Linux, the connection form with an SSH
  tunnel through a bastion host and SSH agent authentication.

### Framing
The window alone at 1216 × 684 pt (2432 × 1368 px). Mac: captured from a macOS VM and cut at the window's frame with
its 50px squircle; Linux: GNOME at scale 2 on a flat grey background, cut at the window with its 24px corners.

### Light and dark
Both, from the same scene.
