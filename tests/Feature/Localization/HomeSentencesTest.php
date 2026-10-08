<?php

use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

// The homepage sentences that take an app name from the platforms catalog, as a reader sees them.
it('fits the app names into the homepage sentences', function (string $locale, array $sentences): void {
    $html = ssrHtml("/{$locale}");
    $text = html_entity_decode(strip_tags(str_replace('<!-- -->', '', $html)), ENT_QUOTES | ENT_HTML5);
    $text = (string) preg_replace('/[\x{00A0}\x{202F}]/u', ' ', $text);

    foreach ($sentences as $sentence) {
        expect(str_contains($text, $sentence))->toBeTrue("/{$locale} does not render: {$sentence}");
    }
})->with([
    'vi' => ['vi', [
        'Các gói trả phí bổ sung một số tính năng cho ứng dụng Mac.',
        'Một số driver có sẵn trong ứng dụng Mac.',
        'Các quy trình trong phần này đều có trong ứng dụng Mac.',
        'Import từ ứng dụng khác và Open Project Folder chỉ có trong ứng dụng Mac.',
        'Bạn tải về và dùng ứng dụng Mac miễn phí, không phải bản dùng thử và không giới hạn thời gian.',
        'Còn ứng dụng cho iPhone và iPad thì miễn phí, không có mua hàng trong ứng dụng.',
    ]],
    'es' => ['es', [
        'Los planes de pago añaden funciones opcionales a la app para Mac.',
        'Algunos controladores vienen con la app para Mac.',
        'Los flujos de trabajo de esta sección están en la app para Mac.',
        'La importación desde otras apps y Open Project Folder solo están en la app para Mac.',
        'La app para Mac se puede descargar y usar gratis, sin periodo de prueba ni límite de tiempo.',
        'La app para iPhone y iPad es gratis, sin compras dentro de la app.',
    ]],
    'de' => ['de', [
        'Bezahlte Tarife ergänzen die Mac-App um optionale Funktionen.',
        'Einige Treiber werden mit der Mac-App geliefert.',
        'Die Abläufe in diesem Abschnitt stehen in der Mac-App bereit.',
        'Der Import aus anderen Apps und Open Project Folder sind nur in der Mac-App verfügbar.',
        'Die Mac-App lässt sich kostenlos herunterladen und nutzen, ohne Testzeitraum oder Zeitlimit.',
        'Die iPhone- und iPad-App ist kostenlos, ohne In-App-Käufe.',
    ]],
    'fr' => ['fr', [
        'Les offres payantes ajoutent des fonctionnalités facultatives à l’application Mac.',
        'Certains pilotes sont fournis avec l’application Mac.',
        'Les outils de cette section sont disponibles dans l’application Mac.',
        'L’importation depuis d’autres applications et Open Project Folder sont uniquement disponibles dans l’application Mac.',
        'L’application Mac se télécharge et s’utilise gratuitement, sans période d’essai ni limite de temps.',
        'L’application iPhone et iPad est gratuite, sans achats intégrés.',
    ]],
    'ja' => ['ja', [
        '有料プランで Mac アプリに任意の機能を追加できます。',
        '一部のドライバーは Mac アプリに同梱されています。',
        'このセクションのワークフローは Mac アプリの機能です。',
        '他のアプリからのインポートと Open Project Folder は、Mac アプリのみの機能です。',
        'Mac アプリは無料でダウンロードして使え、試用期間や時間制限はありません。',
        'iPhone・iPad アプリは無料で、アプリ内課金もありません。',
    ]],
    'pt-BR' => ['pt-BR', [
        'Os planos pagos adicionam recursos opcionais ao app para Mac.',
        'Alguns drivers vêm com o app para Mac.',
        'Os fluxos de trabalho desta seção estão no app para Mac.',
        'A importação de outros apps e Open Project Folder estão disponíveis apenas no app para Mac.',
        'O app para Mac é gratuito para baixar e usar, sem período de avaliação nem limite de tempo.',
        'O app para iPhone e iPad é gratuito, sem compras no app.',
    ]],
    'zh-Hans' => ['zh-Hans', [
        '付费方案为 Mac 应用增加可选功能。',
        '部分驱动随 Mac 应用提供。',
        '本节中的工作流由 Mac 应用提供。',
        '从其他应用导入和 Open Project Folder 仅在 Mac 应用中提供。',
        'Mac 应用可免费下载使用，没有试用期或时间限制。',
        'iPhone 和 iPad 应用免费，且无应用内购买。',
    ]],
    'ko' => ['ko', [
        '유료 플랜은 Mac 앱에 선택 기능을 추가합니다.',
        '일부 드라이버는 Mac 앱에 포함되어 있습니다.',
        '이 섹션의 작업 흐름은 Mac 앱에서 제공합니다.',
        '다른 앱에서 가져오기 및 Open Project Folder는 Mac 앱에서만 제공합니다.',
        'Mac 앱은 무료로 다운로드하고 사용할 수 있으며 체험 기간이나 시간 제한이 없습니다.',
        'iPhone 및 iPad 앱은 무료이며 앱 내 구입이 없습니다.',
    ]],
    'zh-Hant' => ['zh-Hant', [
        '付費方案為 Mac App 增加選用功能。',
        '部分驅動程式隨 Mac App 提供。',
        '本節中的工作流程由 Mac App 提供。',
        '從其他 App 匯入與 Open Project Folder 僅在 Mac App 中提供。',
        'Mac App 可免費下載使用，沒有試用期或時間限制。',
        'iPhone 與 iPad App 免費，且無 App 內購買。',
    ]],
    'it' => ['it', [
        'I piani a pagamento aggiungono funzionalità opzionali all’app per Mac.',
        'Alcuni driver sono inclusi nell’app per Mac.',
        'I flussi di lavoro di questa sezione sono disponibili nell’app per Mac.',
        'L’importazione da altre app e Open Project Folder sono disponibili solo nell’app per Mac.',
        'L’app per Mac si scarica e si usa gratuitamente, senza periodo di prova né limiti di tempo.',
        'L’app per iPhone e iPad è gratuita, senza acquisti in-app.',
    ]],
    'id' => ['id', [
        'Paket berbayar menambahkan fitur opsional ke aplikasi Mac.',
        'Beberapa driver sudah disertakan dalam aplikasi Mac.',
        'Alur kerja di bagian ini tersedia dalam aplikasi Mac.',
        'Impor dari aplikasi lain dan Open Project Folder hanya tersedia dalam aplikasi Mac.',
        'Anda dapat mengunduh dan menggunakan aplikasi Mac secara gratis, tanpa masa uji coba atau batas waktu.',
        'Sementara itu, aplikasi iPhone dan iPad gratis, tanpa pembelian dalam aplikasi.',
    ]],
]);
