<?php

/*
 * Shared with TableProApp/web and TableProApp/license at tests/Support/vi-forbidden-variants.php. Change both in the same release. See docs/shared-files.md.
 *
 * Wording the glossary rules out (positioning §11, sitemap §E.10), checked by
 * Localization/ContentParityTest here and Localization/LangParityTest in the
 * account app. A variant found in review is added here, never fixed only in
 * place.
 *
 * Each row: `pattern` (a PCRE with the `u` flag, matched against NFC text),
 * `use` (what to write instead), `applies` (`vi` for Vietnamese strings, `en`
 * for English ones). Values that are URLs or paths, and code spans, are
 * skipped before matching.
 */

return [
    [
        'pattern' => '/(?<![qQ])(o[àáảãạ]|o[èéẻẽẹ]|u[ỳýỷỹỵ])(?!\p{L})/u',
        'use' => 'the tone mark on the first vowel: khóa, xóa, hóa, họa, tùy, hủy',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/lưới dữ liệu/iu',
        'use' => 'data grid',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/\b(foreign|primary) key\b/u',
        'use' => 'khóa ngoại, khóa chính',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/Tải xuống/iu',
        'use' => 'Tải về',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/Bỏ qua đến nội dung/iu',
        'use' => 'Chuyển đến nội dung chính',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/Bài viết tiếng Anh|^\s*Tiếng Anh\s*$/u',
        'use' => '(tiếng Anh)',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/\bteam\b/u',
        'use' => 'nhóm, thành viên nhóm (the tier "Team" and names such as Team Library keep their capital)',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/(?<!\()\bSettings\s*[›>→]/u',
        'use' => 'the app\'s Vietnamese label first: Cài đặt > Giấy phép (Settings > License)',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/giấy phép(?!\s*AGPL)/u',
        'use' => 'license',
        'applies' => 'vi',
    ],
    [
        'pattern' => '/Billing and invoices/iu',
        'use' => 'Billing & invoices',
        'applies' => 'en',
    ],
];
