<?php
header('Content-Type: application/json; charset=utf-8');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['inquiryType', 'name', 'email', 'message'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '必須項目を全て入力してください。']);
        exit;
    }
}

// Sanitize inputs
$inquiryType = htmlspecialchars($data['inquiryType'], ENT_QUOTES, 'UTF-8');
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$company = isset($data['company']) ? htmlspecialchars($data['company'], ENT_QUOTES, 'UTF-8') : '';
$phone = isset($data['phone']) ? htmlspecialchars($data['phone'], ENT_QUOTES, 'UTF-8') : '';
$message = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '正しいメールアドレスを入力してください。']);
    exit;
}

// Email settings
$to = 'hp@share-llc.co.jp';
$subject = '[お問い合わせ] ' . $inquiryType . ' - ' . $name;

// Email body
$body = "■ お問い合わせ内容\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$body .= "【お問い合わせ種別】\n";
$body .= $inquiryType . "\n\n";
$body .= "【お名前】\n";
$body .= $name . "\n\n";
$body .= "【メールアドレス】\n";
$body .= $email . "\n\n";
if (!empty($company)) {
    $body .= "【会社名】\n";
    $body .= $company . "\n\n";
}
if (!empty($phone)) {
    $body .= "【電話番号】\n";
    $body .= $phone . "\n\n";
}
$body .= "【お問い合わせ内容】\n";
$body .= $message . "\n\n";
$body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$body .= "送信日時: " . date('Y年m月d日 H:i:s') . "\n";

// Email headers
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$success = mb_send_mail($to, $subject, $body, $headers);

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'お問い合わせを送信しました。担当者より折り返しご連絡させていただきます。'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'メールの送信に失敗しました。しばらく時間をおいて再度お試しください。'
    ]);
}
