<?php

use Illuminate\Support\Arr;

const WORDING_RESOURCES = __DIR__ . '/../../../resources';

/**
 * @return list<string>
 */
function wordingLocales(): array
{
    return array_keys(json_decode((string) file_get_contents(WORDING_RESOURCES . '/data/locales.json'), true)['supported']);
}

/**
 * @return array<string, array<string, string>>
 */
function wordingContent(string $locale): array
{
    $root = WORDING_RESOURCES . "/data/content/{$locale}";
    $files = [];

    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)) as $file) {
        $path = substr($file->getPathname(), strlen($root) + 1);
        $files[$path] = array_filter(Arr::dot(json_decode((string) file_get_contents($file->getPathname()), true, 512, JSON_THROW_ON_ERROR)), 'is_string');
    }

    ksort($files);

    return $files;
}

function wordingPlainName(string $text): string
{
    return (string) preg_replace('/[-\x{2011}\x{00A0}\x{202F}]/u', ' ', $text);
}

/**
 * The exact proper-name requirements of one source string, independent of its prose.
 *
 * @return list<string>
 */
function wordingNameContract(string $text): array
{
    static $names = null;
    $names ??= [...array_column(json_decode((string) file_get_contents(WORDING_RESOURCES . '/data/paid-features.json'), true, 512, JSON_THROW_ON_ERROR), 'name'), 'Safe Mode'];
    $required = array_values(array_filter($names, fn(string $name): bool => str_contains(wordingPlainName($text), wordingPlainName($name))));

    if (mb_stripos($text, 'merchant of record') !== false) {
        $required[] = 'merchant of record';
    }

    sort($required);

    return $required;
}

/**
 * @param  list<string>  $required
 * @return list<string>
 */
function wordingMissingNames(string $text, array $required): array
{
    return array_values(array_filter($required, fn(string $name): bool => $name === 'merchant of record'
        ? mb_stripos(wordingPlainName($text), $name) === false
        : ! str_contains(wordingPlainName($text), wordingPlainName($name))));
}

/**
 * The strings of a UI catalog file, in source order.
 *
 * @return list<string>
 */
function wordingCatalogStrings(string $path): array
{
    $code = preg_replace(['#/\*.*?\*/#s', '/^import .*;$/m'], '', (string) file_get_contents($path));
    // Every literal in order, so a key never pairs up with the quote that opens its value.
    preg_match_all('/\'((?:[^\'\\\\\n]|\\\\.)*)\'(\s*:)?|"((?:[^"\\\\\n]|\\\\.)*)"(\s*:)?/', (string) $code, $matches, PREG_SET_ORDER);
    $strings = [];

    foreach ($matches as $match) {
        $key = ($match[2] ?? '') !== '' || ($match[4] ?? '') !== '';

        if (! $key) {
            $strings[] = stripcslashes(($match[3] ?? '') !== '' ? $match[3] : $match[1]);
        }
    }

    return $strings;
}

/**
 * The lines of each legal page in one language.
 *
 * @return array<string, list<string>>
 */
function wordingLegal(string $locale): array
{
    $documents = [];

    foreach (glob(WORDING_RESOURCES . "/data/legal/{$locale}/*.md") ?: [] as $path) {
        $documents[basename($path)] = explode("\n", (string) file_get_contents($path));
    }

    return $documents;
}

/**
 * Every string a reader sees in one language, keyed by where it is, without app labels, code and URLs.
 *
 * @return array<string, string>
 */
function wordingStrings(string $locale): array
{
    $strings = [];

    foreach (wordingContent($locale) as $file => $values) {
        foreach ($values as $key => $value) {
            $strings["content/{$locale}/{$file} {$key}"] = $value;
        }
    }

    foreach (glob(WORDING_RESOURCES . "/js/i18n/messages/{$locale}/*.ts") ?: [] as $path) {
        foreach (wordingCatalogStrings($path) as $index => $value) {
            $strings["messages/{$locale}/" . basename($path) . " #{$index}"] = $value;
        }
    }

    // A legal page prints an app label in bold, where the content files use <ui>.
    $labels = array_map(fn(string $label): string => "**{$label}**", array_column(require __DIR__ . '/../../Support/app-ui-labels.php', $locale));

    foreach (wordingLegal($locale) as $file => $lines) {
        foreach ($lines as $index => $line) {
            if (trim($line) !== '') {
                $strings["legal/{$locale}/{$file}:" . ($index + 1)] = str_replace($labels, ' ', $line);
            }
        }
    }

    return array_map(
        fn(string $text): string => (string) preg_replace(['#<ui>.*?</ui>#u', '/`[^`]*`/u', '#<code>.*?</code>#u', '#https?://\S+#u'], ' ', $text),
        $strings,
    );
}

/**
 * @return array<string, list<array{string, string}>>
 */
function wordingRuledOut(): array
{
    return require __DIR__ . '/../../Support/locale-forbidden-variants.php';
}

it('uses none of the wording ruled out for the language', function (string $locale): void {
    $offences = [];

    foreach (wordingStrings($locale) as $where => $text) {
        foreach (wordingRuledOut()[$locale] as [$pattern, $use]) {
            if (preg_match($pattern, $text, $match) === 1) {
                $offences[] = "{$where}: \"{$match[0]}\" (use {$use})";
            }
        }
    }

    expect($offences)->toBe([], "Ruled-out wording:\n  " . implode("\n  ", $offences));
})->with(array_keys(wordingRuledOut()));

it('catches the wording it rules out', function (string $locale, string $text, bool $flagged): void {
    $hit = collect(wordingRuledOut()[$locale])->contains(fn(array $rule): bool => preg_match($rule[0], $text) === 1);

    expect($hit)->toBe($flagged);
})->with([
    ['es', 'Cada conexión tiene un nivel de Modo seguro.', true],
    ['es', 'Cada conexión tiene un nivel de Safe Mode.', false],
    ['es', 'Comparte conexiones con tu equipo.', false],
    ['de', 'Der sichere Modus fragt vor jedem Schreibvorgang.', true],
    ['de', 'Die Safe-Mode-Stufe gilt pro Verbindung.', false],
    ['fr', 'Une licence Équipe est facturée par poste.', true],
    ['fr', 'Partagez des connexions avec votre équipe.', false],
    ['ja', 'セーフモードは接続ごとに設定します。', true],
    ['ja', 'フォルダを追加します。', true],
    ['ja', 'フォルダーを追加します。', false],
    ['pt-BR', 'A Recuperação de Dados restaura os valores.', true],
    ['zh-Hans', '如果你通过 Setapp 获取', true],
    ['zh-Hans', 'TablePro 尚未支持 Windows，发布日期未定。', true],
    ['ko', '안전 모드는 연결마다 설정합니다.', true],
    ['zh-Hant', '每席次每月', true],
    ['it', 'Ripristino dati conserva i valori sostituiti.', true],
    ['id', 'Pemulihan Data menyimpan nilai yang diganti.', true],
    ['vi', 'Vẽ biểu đồ điểm từ kết quả query.', true],
    ['vi', 'Vẽ biểu đồ phân tán (scatter) từ kết quả query.', false],
    ['vi', 'TablePro cho Windows chưa có ngày phát hành.', true],
    ['vi', 'TablePro cho Windows không có ngày phát hành.', false],
    ['es', 'Ejecuta comandos en la pestaña Consulta.', true],
    ['es', 'Ejecuta comandos en la pestaña Query.', false],
    ['es', 'La app es gratis, sin compras integradas.', true],
    ['es', 'La app es gratis, sin compras dentro de la app.', false],
    ['es', 'Elige Ayuda > Abrir base de datos de ejemplo.', true],
    ['es', 'Activa Usar ~/.pgpass en el formulario.', true],
    ['pt-BR', 'As senhas ficam no Chaves do macOS.', true],
    ['pt-BR', 'As senhas ficam nas Chaves do macOS.', false],
    ['pt-BR', 'É gratuito para usar.', true],
    ['pt-BR', 'É de uso gratuito.', false],
    ['pt-BR', 'Abra a visualização Map.', true],
    ['pt-BR', 'Abra a visualização Mapa.', false],
    ['it', 'Apri la vista Map.', true],
    ['it', 'Apri la vista Mappa.', false],
    ['it', 'L’assistente AI scrive SQL.', true],
    ['it', 'L’assistente IA scrive SQL.', false],
    ['id', 'Edit tertunda disimpan sampai Anda menyimpannya.', true],
    ['id', 'Perubahan tertunda disimpan sampai Anda menyimpannya.', false],
]);

it('keeps the names of paid features, Safe Mode and the merchant of record where the English copy uses them', function (string $locale): void {
    $names = [...array_column(json_decode((string) file_get_contents(WORDING_RESOURCES . '/data/paid-features.json'), true), 'name'), 'Safe Mode'];
    // "Safe-Mode-Stufe" and "Safe Mode" on a no-break space are the same name.
    $plain = fn(string $text): string => (string) preg_replace('/[-\x{2011}\x{00A0}\x{202F}]/u', ' ', $text);
    $translated = wordingContent($locale);
    $offences = [];

    foreach (wordingContent('en') as $file => $values) {
        foreach ($values as $key => $value) {
            $checks = wordingMissingNames($translated[$file][$key] ?? '', wordingNameContract($value));
            if ($checks !== []) {
                $offences[] = "content/{$locale}/{$file} {$key}: " . implode(', ', $checks);
            }
        }
    }

    // The legal pages also name the plans and two parts of the Mac app. A translation has the same lines as its original.
    $legalNames = [...$names, 'Tunnel Command', 'Starter', 'Team', 'Favorites', 'Sync Categories'];
    $legal = wordingLegal($locale);

    foreach (wordingLegal('en') as $file => $lines) {
        foreach ($lines as $index => $line) {
            $target = $plain($legal[$file][$index] ?? '');
            $where = "legal/{$locale}/{$file}:" . ($index + 1);

            foreach ($legalNames as $name) {
                if (str_contains($plain($line), $plain($name)) && ! str_contains($target, $plain($name))) {
                    $offences[] = "{$where}: {$name}";
                }
            }

            if (str_contains($line, 'merchant of record') && mb_stripos($target, 'merchant of record') === false) {
                $offences[] = "{$where}: merchant of record";
            }
        }
    }

    expect($offences)->toBe([], "Names the English copy uses and the translation does not:\n  " . implode("\n  ", $offences));
})->with(array_values(array_diff(wordingLocales(), ['en'])));

it('retains proper-name and merchant requirements independently of translated prose', function (): void {
    $required = wordingNameContract('Data Rewind, Safe Mode and our merchant of record.');

    expect($required)->toBe(['Data Rewind', 'Safe Mode', 'merchant of record'])
        ->and(wordingMissingNames('Data Rewind / Safe-Mode / Merchant of Record', $required))->toBe([])
        ->and(wordingMissingNames('Data Rewind / Safe Mode', $required))->toBe(['merchant of record'])
        ->and(wordingMissingNames('Data Recovery / Safe Mode / merchant of record', $required))->toBe(['Data Rewind']);
});

it('puts a no-break space before French double punctuation and inside guillemets', function (): void {
    $offences = [];

    foreach (wordingStrings('fr') as $where => $text) {
        if (preg_match('/\S [;:!?»](?=\s|<|$)|« |[\d}]%/u', $text, $match) === 1) {
            $offences[] = "{$where}: \"{$match[0]}\" in \"{$text}\"";
        }
    }

    expect($offences)->toBe([], "Ordinary spaces a line can break at:\n  " . implode("\n  ", $offences));
});

it('writes Simplified Chinese with no Traditional character', function (): void {
    $toSimplified = Transliterator::create('Traditional-Simplified');

    if ($toSimplified === null) {
        $this->markTestSkipped('ICU has no Traditional-Simplified transform here.');
    }

    foreach (wordingStrings('zh-Hans') as $where => $text) {
        expect($toSimplified->transliterate($text))->toBe($text, "{$where} has a Traditional character");
    }
});

/**
 * @return array<string, string>
 */
function wordingCategories(): array
{
    return [
        'en' => 'database client',
        'vi' => 'database client',
        'es' => 'cliente de bases de datos',
        'de' => 'Datenbankclient',
        'fr' => 'client de bases de données',
        'ja' => 'データベースクライアント',
        'pt-BR' => 'cliente de banco de dados',
        'zh-Hans' => '数据库客户端',
        'ko' => '데이터베이스 클라이언트',
        'zh-Hant' => '資料庫用戶端',
        'it' => 'client database',
        'id' => 'klien database',
    ];
}

it('names the database category in every homepage title and description', function (): void {
    expect(array_keys(wordingCategories()))->toEqualCanonicalizing(wordingLocales());

    foreach (wordingCategories() as $locale => $category) {
        $seo = json_decode((string) file_get_contents(WORDING_RESOURCES . "/data/content/{$locale}/home.json"), true)['seo'];

        foreach (['title', 'titleFallback', 'description'] as $key) {
            expect(mb_stripos($seo[$key], $category))->not->toBeFalse("content/{$locale}/home.json seo.{$key} does not say \"{$category}\": {$seo[$key]}");
        }

        expect(mb_strlen($seo['titleFallback']))->toBeLessThanOrEqual(60, "content/{$locale}/home.json seo.titleFallback is too long");
    }
});
