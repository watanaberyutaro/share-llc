<?php
header('Content-Type: application/json; charset=utf-8');

// CORSヘッダー
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// パスワード認証
$password = $_POST['password'] ?? '';
if ($password !== 'admin2017') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid password']);
    exit;
}

$jsonFile = '../data/news.json';

// JSONファイルを読み込む
if (!file_exists($jsonFile)) {
    $data = ['articles' => []];
} else {
    $jsonContent = file_get_contents($jsonFile);
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        $data = ['articles' => []];
    }
}

// POSTデータを取得
$id = $_POST['id'] ?? null;
$category = $_POST['category'] ?? '';
$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';
$image = $_POST['image'] ?? '';

// 現在時刻を取得
$now = new DateTime('now', new DateTimeZone('Asia/Tokyo'));
$date = $now->format('Y.m.d');
$timestamp = $now->format('Y-m-d\TH:i:s');

if ($id) {
    // 編集モード：既存記事を更新
    $found = false;
    foreach ($data['articles'] as &$article) {
        if ($article['id'] == $id) {
            $article['category'] = $category;
            $article['title'] = $title;
            $article['content'] = $content;
            $article['image'] = $image;
            // 日付は更新しない（元の日付を保持）
            $found = true;
            break;
        }
    }
    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'Article not found']);
        exit;
    }
} else {
    // 新規作成モード
    // 新しいIDを生成（最大ID + 1）
    $maxId = 0;
    foreach ($data['articles'] as $article) {
        if ($article['id'] > $maxId) {
            $maxId = $article['id'];
        }
    }
    $newId = $maxId + 1;

    // 新しい記事を追加
    $newArticle = [
        'id' => $newId,
        'date' => $date,
        'timestamp' => $timestamp,
        'category' => $category,
        'title' => $title,
        'content' => $content,
        'image' => $image,
        'isNew' => true
    ];

    // 配列の先頭に追加（最新記事が最初）
    array_unshift($data['articles'], $newArticle);
}

// isNewフラグを更新（最新3件のみtrueにする）
foreach ($data['articles'] as $index => &$article) {
    $article['isNew'] = ($index < 3);
}

// JSONファイルに保存
$jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if (file_put_contents($jsonFile, $jsonData)) {
    echo json_encode(['success' => true, 'message' => 'News saved successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save news']);
}
?>
