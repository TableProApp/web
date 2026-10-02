<?php

/*
|--------------------------------------------------------------------------
| Trang lỗi tĩnh
|--------------------------------------------------------------------------
|
| Nội dung cho resources/views/errors/{500,503}.blade.php. Giữ cùng khóa và
| cùng tham số với lang/en/errors.php (LangParityTest kiểm tra điều này).
|
*/

return [
    'home' => 'Về trang chủ TablePro',

    '500' => [
        'title' => 'Đã xảy ra lỗi',
        'body' => 'Lỗi từ phía chúng tôi. Hãy thử lại sau ít phút. Nếu lỗi vẫn tiếp diễn, hãy gửi email tới :email.',
    ],

    '503' => [
        'title' => 'Đang bảo trì',
        'body' => 'tablepro.app sẽ sớm hoạt động trở lại.',
    ],
];
