<?php

use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

// Each sentence takes its app name from the platforms catalog, so only the render shows it.
it('fits the app names into the homepage sentences', function (string $locale, array $sentences): void {
    $html = ssrHtml("/{$locale}");
    $text = html_entity_decode(strip_tags(str_replace('<!-- -->', '', $html)), ENT_QUOTES | ENT_HTML5);
    $text = (string) preg_replace('/[\x{00A0}\x{202F}]/u', ' ', $text);

    foreach ($sentences as $sentence) {
        expect(str_contains($text, $sentence))->toBeTrue("/{$locale} does not render: {$sentence}");
    }
})->with([
    'vi' => ['vi', [
        'Các gói trả phí bổ sung tính năng cho ứng dụng Mac.',
        'Driver phổ biến có sẵn trong ứng dụng Mac; driver khác tải vào lần đầu sử dụng.',
        'Import từ ứng dụng khác và Open Project Folder chỉ có trong ứng dụng Mac.',
        'Dùng ứng dụng Mac miễn phí, không có thời gian dùng thử.',
        'Còn ứng dụng cho iPhone và iPad miễn phí, không có mua hàng trong ứng dụng.',
    ]],
    'es' => ['es', [
        'Funciones de pago opcionales: app para Mac.',
        'La app para Mac incluye controladores habituales y descarga los demás la primera vez que los usas.',
        'La importación desde otras apps y Open Project Folder solo están en la app para Mac.',
        'Usa la app para Mac gratis, sin periodo de prueba.',
        'La app para iPhone y iPad es gratis, sin compras dentro de la app.',
    ]],
    'de' => ['de', [
        'Optionale Bezahlfunktionen: Mac-App.',
        'Die Mac-App enthält gängige Treiber und lädt weitere bei der ersten Nutzung herunter.',
        'Der Import aus anderen Apps und Open Project Folder sind nur in der Mac-App verfügbar.',
        'Nutze die Mac-App kostenlos, ohne Testzeitraum.',
        'Die iPhone- und iPad-App ist kostenlos, ohne In-App-Käufe.',
    ]],
    'fr' => ['fr', [
        'Fonctions payantes facultatives : application Mac.',
        'L’application Mac inclut les pilotes courants et télécharge les autres à la première utilisation.',
        'L’importation depuis d’autres applications et Open Project Folder sont uniquement disponibles dans l’application Mac.',
        'Utilisez l’application Mac gratuitement, sans période d’essai.',
        'L’application iPhone et iPad est gratuite, sans achats intégrés.',
    ]],
    'ja' => ['ja', [
        '有料プランで Mac アプリに機能を追加できます。',
        'Mac アプリは一般的なドライバーを同梱し、その他は初めて使うときにダウンロードします。',
        '他のアプリからのインポートと Open Project Folder は、Mac アプリのみの機能です。',
        'Mac アプリは試用期限なしで無料で使えます。',
        'iPhone・iPad アプリは無料で、アプリ内課金はありません。',
    ]],
    'pt-BR' => ['pt-BR', [
        'Os planos pagos adicionam recursos ao app para Mac.',
        'O app para Mac inclui drivers comuns e baixa outros quando você os usa pela primeira vez.',
        'A importação de outros apps e Open Project Folder estão disponíveis apenas no app para Mac.',
        'Use o app para Mac gratuitamente, sem período de teste.',
        'O app para iPhone e iPad é gratuito, sem compras no aplicativo.',
    ]],
    'zh-Hans' => ['zh-Hans', [
        '付费方案为 Mac 应用添加功能。',
        'Mac 应用内置常用驱动，其他驱动在首次使用时下载。',
        '从其他应用导入和 Open Project Folder 仅在 Mac 应用中提供。',
        'Mac 应用可免费使用，没有试用期。',
        'iPhone 和 iPad 应用免费，无 App 内购买。',
    ]],
    'ko' => ['ko', [
        '유료 플랜은 Mac 앱에 기능을 추가합니다.',
        'Mac 앱에는 일반적인 드라이버가 포함되어 있으며 나머지는 첫 사용 시 다운로드합니다.',
        '다른 앱에서 가져오기 및 Open Project Folder는 Mac 앱에서만 제공합니다.',
        'Mac 앱을 체험 기간 없이 무료로 사용하세요.',
        'iPhone 및 iPad 앱은 무료이며 앱 내 구입이 없습니다.',
    ]],
    'zh-Hant' => ['zh-Hant', [
        '付費方案為 Mac App 加入功能。',
        'Mac App 內建常用驅動程式，其他驅動程式在首次使用時下載。',
        '從其他 App 匯入與 Open Project Folder 僅在 Mac App 中提供。',
        'Mac App 可免費使用，沒有試用期。',
        'iPhone 與 iPad App 免費，無 App 內購買。',
    ]],
    'it' => ['it', [
        'I piani a pagamento aggiungono funzionalità all’app per Mac.',
        'L’app per Mac include i driver comuni e ne scarica altri al primo utilizzo.',
        'L’importazione da altre app e Open Project Folder sono disponibili solo nell’app per Mac.',
        'Utilizza l’app per Mac gratuitamente, senza periodo di prova.',
        'L’app per iPhone e iPad è gratuita, senza acquisti in-app.',
    ]],
    'id' => ['id', [
        'Paket berbayar menambahkan fitur ke aplikasi Mac.',
        'Di aplikasi Mac, driver umum sudah disertakan dan driver lainnya diunduh saat Anda pertama kali menggunakannya.',
        'Impor dari aplikasi lain dan Open Project Folder hanya tersedia dalam aplikasi Mac.',
        'Gunakan aplikasi Mac secara gratis, tanpa masa uji coba.',
        'Untuk aplikasi iPhone dan iPad, tidak ada biaya atau pembelian dalam aplikasi.',
    ]],
])->group('ssr');
