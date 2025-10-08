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
$id = $_POST['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID is required']);
    exit;
}

// JSONファイルを読み込む
if (!file_exists($jsonFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'News data not found']);
    exit;
}

$jsonContent = file_get_contents($jsonFile);
$data = json_decode($jsonContent, true);

if ($data === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// 指定されたIDの記事を削除
$newArticles = [];
$found = false;
foreach ($data['articles'] as $article) {
    if ($article['id'] != $id) {
        $newArticles[] = $article;
    } else {
        $found = true;
        // 画像ファイルがあれば削除
        if (!empty($article['image']) && file_exists('..' . $article['image'])) {
            unlink('..' . $article['image']);
        }
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Article not found']);
    exit;
}

$data['articles'] = $newArticles;

// isNewフラグを更新（最新3件のみtrueにする）
foreach ($data['articles'] as $index => &$article) {
    $article['isNew'] = ($index < 3);
}

// JSONファイルに保存
$jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if (file_put_contents($jsonFile, $jsonData)) {
    echo json_encode(['success' => true, 'message' => 'News deleted successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete news']);
}
?>
