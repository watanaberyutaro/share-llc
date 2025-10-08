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

// ファイルがアップロードされているか確認
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['image'];
$uploadDir = '../assets/uploads/';

// アップロード先ディレクトリを作成（年/月のサブディレクトリ）
$year = date('Y');
$month = date('m');
$targetDir = $uploadDir . $year . '/' . $month . '/';

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// ファイル拡張子を取得
$fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

// 許可する拡張子
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp']);
    exit;
}

// ファイルサイズチェック（5MB以下）
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File size must be less than 5MB']);
    exit;
}

// ユニークなファイル名を生成
$fileName = time() . '_' . uniqid() . '.' . $fileExtension;
$filePath = $targetDir . $fileName;

// ファイルを移動
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    // 相対パスを返す
    $relativePath = './assets/uploads/' . $year . '/' . $month . '/' . $fileName;
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'path' => $relativePath
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>
