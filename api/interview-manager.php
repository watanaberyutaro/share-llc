<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// データファイルのパス
$dataFile = '../data/interviews.json';
$uploadDir = '../assets/uploads/';

// リクエストメソッドを取得
$method = $_SERVER['REQUEST_METHOD'];

// OPTIONS リクエストに対応（CORS対策）
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// アクションを取得
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        case 'save':
            saveInterview();
            break;
        case 'delete':
            deleteInterview();
            break;
        case 'upload':
            uploadImage();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// インタビューを保存
function saveInterview() {
    global $dataFile;

    // JSONファイルを読み込む
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, json_encode([]));
    }

    $interviews = json_decode(file_get_contents($dataFile), true);
    if ($interviews === null) {
        $interviews = [];
    }

    // POSTデータを取得
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'データが不正です']);
        return;
    }

    // 必須フィールドのチェック
    $requiredFields = ['title', 'staffName', 'position', 'joinDate', 'labels', 'content'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "$field は必須です"]);
            return;
        }
    }

    if (isset($data['id']) && $data['id']) {
        // 編集
        $id = intval($data['id']);
        $index = array_search($id, array_column($interviews, 'id'));

        if ($index !== false) {
            $interviews[$index]['title'] = $data['title'];
            $interviews[$index]['staffName'] = $data['staffName'];
            $interviews[$index]['position'] = $data['position'];
            $interviews[$index]['joinDate'] = $data['joinDate'];
            $interviews[$index]['labels'] = $data['labels'];
            $interviews[$index]['content'] = $data['content'];

            if (isset($data['image']) && !empty($data['image'])) {
                $interviews[$index]['image'] = $data['image'];
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'インタビューが見つかりません']);
            return;
        }
    } else {
        // 新規作成
        $newId = count($interviews) > 0 ? max(array_column($interviews, 'id')) + 1 : 1;

        $newInterview = [
            'id' => $newId,
            'title' => $data['title'],
            'staffName' => $data['staffName'],
            'position' => $data['position'],
            'joinDate' => $data['joinDate'],
            'labels' => $data['labels'],
            'content' => $data['content'],
            'image' => isset($data['image']) ? $data['image'] : '',
            'createdAt' => date('c')
        ];

        array_unshift($interviews, $newInterview);
    }

    // JSONファイルに保存
    if (file_put_contents($dataFile, json_encode($interviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => '保存しました', 'data' => $interviews]);
    } else {
        echo json_encode(['success' => false, 'message' => '保存に失敗しました']);
    }
}

// インタビューを削除
function deleteInterview() {
    global $dataFile;

    if (!file_exists($dataFile)) {
        echo json_encode(['success' => false, 'message' => 'データファイルが見つかりません']);
        return;
    }

    $interviews = json_decode(file_get_contents($dataFile), true);

    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? intval($data['id']) : 0;

    if ($id === 0) {
        echo json_encode(['success' => false, 'message' => 'IDが不正です']);
        return;
    }

    // IDで検索して削除
    $filteredInterviews = array_filter($interviews, function($interview) use ($id) {
        return $interview['id'] !== $id;
    });

    // 配列のインデックスを振り直す
    $filteredInterviews = array_values($filteredInterviews);

    // JSONファイルに保存
    if (file_put_contents($dataFile, json_encode($filteredInterviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => '削除しました', 'data' => $filteredInterviews]);
    } else {
        echo json_encode(['success' => false, 'message' => '削除に失敗しました']);
    }
}

// 画像をアップロード
function uploadImage() {
    global $uploadDir;

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => '画像がアップロードされていません']);
        return;
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    // ファイルタイプをチェック
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => '許可されていないファイル形式です']);
        return;
    }

    // ファイルサイズをチェック
    if ($file['size'] > $maxSize) {
        echo json_encode(['success' => false, 'message' => 'ファイルサイズが大きすぎます（最大5MB）']);
        return;
    }

    // アップロード先ディレクトリを作成
    $year = date('Y');
    $month = date('m');
    $targetDir = $uploadDir . $year . '/' . $month . '/';

    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // ファイル名を生成（重複を避けるためにタイムスタンプを追加）
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $extension;
    $targetPath = $targetDir . $filename;

    // ファイルを移動
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $relativePath = './assets/uploads/' . $year . '/' . $month . '/' . $filename;
        echo json_encode(['success' => true, 'message' => 'アップロードしました', 'path' => $relativePath]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
    }
}
?>
