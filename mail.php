<?php header("Content-Type:text/html;charset=utf-8"); ?>
<?php //error_reporting(E_ALL | E_STRICT);
##-----------------------------------------------------------------------------------------------------------------##
#
#  PHPメールプログラム　合同会社SHARE用
#
##-----------------------------------------------------------------------------------------------------------------##
if (version_compare(PHP_VERSION, '5.1.0', '>=')) {
    date_default_timezone_set('Asia/Tokyo');
}

/*-------------------------------------------------------------------------------------------------------------------
* 設定
-------------------------------------------------------------------------------------------------------------------*/

//---------------------------　必須設定　-----------------------

//サイトのトップページのURL
$site_top = "index.html";

//管理者のメールアドレス
$to = "hp@share-llc.co.jp";

//送信元メールアドレス
$from = "hp@share-llc.co.jp";

//フォームのメールアドレス入力箇所のname属性の値
$Email = "email";

//---------------------------　セキュリティ設定　------------------------------------

//リファラチェック(する=1, しない=0)
$Referer_check = 0;

//リファラチェックを「する」場合のドメイン
$Referer_check_domain = "share-llc.jp";

//セッションによるワンタイムトークン（CSRF対策）(する=1, しない=0)
$useToken = 1;

//---------------------------　任意設定　------------------------

// Bccで送るメールアドレス
$BccMail = "";

// 管理者宛に送信されるメールのタイトル（件名）
$subject = "【お問い合わせ】合同会社SHARE ウェブサイトより";

// 送信確認画面の表示(する=1, しない=0)
$confirmDsp = 1;

// 送信完了後に自動的に指定のページに移動する(する=1, しない=0)
$jumpPage = 1;

// 送信完了後に表示するページURL
$thanksPage = "thanks.html";

// 必須入力項目を設定する(する=1, しない=0)
$requireCheck = 1;

// 必須入力項目
$require = array('お名前','email','お問い合わせ内容');

//----------------------------------------------------------------------
//  自動返信メール設定(START)
//----------------------------------------------------------------------

// 差出人に送信内容確認メール（自動返信メール）を送る(送る=1, 送らない=0)
$remail = 1;

//自動返信メールの送信者欄に表示される名前
$refrom_name = "合同会社SHARE";

// 差出人に送信確認メールを送る場合のメールのタイトル
$re_subject = "【自動返信】お問い合わせありがとうございます - 合同会社SHARE";

//フォーム側の「名前」箇所のname属性の値
$dsp_name = 'お名前';

//自動返信メールの冒頭の文言
$remail_text = <<< TEXT

この度は、合同会社SHAREへお問い合わせいただき誠にありがとうございます。

以下の内容でお問い合わせを承りました。
担当者より2営業日以内にご返信させていただきますので、
今しばらくお待ちくださいますようお願い申し上げます。

なお、このメールは自動返信メールです。
このメールに返信されても対応できませんのでご了承ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━

TEXT;

//自動返信メールに署名（フッター）を表示(する=1, しない=0)
$mailFooterDsp = 1;

//署名（フッター）
$mailSignature = <<< FOOTER


━━━━━━━━━━━━━━━━━━━━━━━━━━
合同会社SHARE
〒110-0015
東京都台東区東上野6-23-5 第二雨宮ビル1002
TEL: 090-1828-5970
E-mail: hp@share-llc.co.jp
URL: https://share-llc.jp
━━━━━━━━━━━━━━━━━━━━━━━━━━

FOOTER;

//----------------------------------------------------------------------
//  自動返信メール設定(END)
//----------------------------------------------------------------------

//メールアドレスの形式チェックを行うかどうか。(する=1, しない=0)
$mail_check = 1;

//全角英数字→半角変換を行うかどうか。(する=1, しない=0)
$hankaku = 1;

//全角英数字→半角変換を行う項目のname属性の値
$hankaku_array = array('電話番号');

//-fオプションによるエンベロープFrom（Return-Path）の設定(する=1, しない=0)
$use_envelope = 0;

//機種依存文字の変換
$replaceStr['before'] = array('①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','№','㈲','㈱','髙');
$replaceStr['after'] = array('(1)','(2)','(3)','(4)','(5)','(6)','(7)','(8)','(9)','(10)','No.','（有）','（株）','高');

//----------------------------------------------------------------------
//  関数実行、変数初期化
//----------------------------------------------------------------------
if($useToken == 1 && $confirmDsp == 1){
    session_name('PHPMAILFORMSYSTEM');
    session_start();
}
$encode = "UTF-8";
if(isset($_GET)) $_GET = sanitize($_GET);
if(isset($_POST)) $_POST = sanitize($_POST);
if(isset($_COOKIE)) $_COOKIE = sanitize($_COOKIE);
if($encode == 'SJIS') $_POST = sjisReplace($_POST,$encode);
$funcRefererCheck = refererCheck($Referer_check,$Referer_check_domain);

//変数初期化
$sendmail = 0;
$empty_flag = 0;
$post_mail = '';
$errm ='';
$header ='';

if($requireCheck == 1) {
    $requireResArray = requireCheck($require);
    $errm = $requireResArray['errm'];
    $empty_flag = $requireResArray['empty_flag'];
}

//メールアドレスチェック
if(empty($errm)){
    foreach($_POST as $key=>$val) {
        if($val == "confirm_submit") $sendmail = 1;
        if($key == $Email) $post_mail = h($val);
        if($key == $Email && $mail_check == 1 && !empty($val)){
            if(!checkMail($val)){
                $errm .= "<p class=\"error_messe\">【".$key."】はメールアドレスの形式が正しくありません。</p>\n";
                $empty_flag = 1;
            }
        }
    }
}

if(($confirmDsp == 0 || $sendmail == 1) && $empty_flag != 1){
    //トークンチェック
    if($useToken == 1 && $confirmDsp == 1){
        if(empty($_SESSION['mailform_token']) || ($_SESSION['mailform_token'] !== $_POST['mailform_token'])){
            exit('ページ遷移が不正です');
        }
        if(isset($_SESSION['mailform_token'])) unset($_SESSION['mailform_token']);
        if(isset($_POST['mailform_token'])) unset($_POST['mailform_token']);
    }

    //差出人に届くメールをセット
    if($remail == 1) {
        $userBody = mailToUser($_POST,$dsp_name,$remail_text,$mailFooterDsp,$mailSignature,$encode);
        $reheader = userHeader($refrom_name,$from,$encode);
        $re_subject = "=?iso-2022-jp?B?".base64_encode(mb_convert_encoding($re_subject,"JIS",$encode))."?=";
    }

    //管理者宛に届くメールをセット
    $adminBody = mailToAdmin($_POST,$subject,$mailFooterDsp,$mailSignature,$encode,$confirmDsp);
    $header = adminHeader($post_mail,$BccMail);
    $subject = "=?iso-2022-jp?B?".base64_encode(mb_convert_encoding($subject,"JIS",$encode))."?=";

    if($use_envelope == 0){
        mail($to,$subject,$adminBody,$header);
        if($remail == 1 && !empty($post_mail)) mail($post_mail,$re_subject,$userBody,$reheader);
    }else{
        mail($to,$subject,$adminBody,$header,'-f'.$from);
        if($remail == 1 && !empty($post_mail)) mail($post_mail,$re_subject,$userBody,$reheader,'-f'.$from);
    }
}
else if($confirmDsp == 1){
?>
<!DOCTYPE HTML>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="format-detection" content="telephone=no">
<title>確認画面 - 合同会社SHARE</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<style type="text/css">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: 'Noto Sans JP', sans-serif;
    color: #333;
    line-height: 1.6;
    background: #f8f9fa;
}
#formWrap {
    max-width: 800px;
    margin: 60px auto;
    padding: 20px;
}
.page-title {
    font-size: 36px;
    font-weight: 900;
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}
.form-container {
    background: white;
    padding: 50px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.message {
    text-align: center;
    margin-bottom: 40px;
    font-size: 16px;
    line-height: 1.8;
}
table.formTable{
    width: 100%;
    margin: 0 auto 40px;
    border-collapse: collapse;
}
table.formTable td, table.formTable th{
    border: 1px solid #e0e0e0;
    padding: 20px;
}
table.formTable th{
    width: 35%;
    font-weight: 700;
    background: #f8f9fa;
    text-align: left;
    color: #333;
}
table.formTable td {
    background: #fff;
}
p.error_messe{
    margin: 10px 0;
    color: #e74c3c;
    font-weight: 700;
    padding: 15px;
    background: #fde8e8;
    border-radius: 8px;
}
.button-group {
    text-align: center;
    margin-top: 30px;
}
.button-group input[type="submit"],
.button-group input[type="button"] {
    display: inline-block;
    padding: 18px 45px;
    margin: 0 10px;
    font-size: 18px;
    font-weight: 700;
    border: 2px solid #333;
    border-radius: 30px;
    background: #333;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Noto Sans JP', sans-serif;
}
.button-group input[type="button"] {
    background: white;
    color: #333;
}
.button-group input[type="submit"]:hover {
    background: #000;
    border-color: #000;
}
.button-group input[type="button"]:hover {
    background: #f8f9fa;
}
@media screen and (max-width: 768px) {
    #formWrap {
        width: 95%;
        margin: 30px auto;
        padding: 10px;
    }
    .form-container {
        padding: 30px 20px;
    }
    .page-title {
        font-size: 28px;
    }
    table.formTable th, table.formTable td {
        width: auto;
        display: block;
    }
    table.formTable th {
        border-bottom: 0;
        padding-bottom: 10px;
    }
    table.formTable td {
        border-top: 0;
        padding-top: 10px;
    }
    .button-group input[type="submit"],
    .button-group input[type="button"] {
        display: block;
        width: 100%;
        margin: 10px 0;
    }
}
</style>
</head>
<body>
<div id="formWrap">
<?php if($empty_flag == 1){ ?>
<div class="form-container">
<h1 class="page-title">入力エラー</h1>
<div class="message">
<p>入力にエラーがあります。下記をご確認の上、<br>「戻る」ボタンにて修正をお願い致します。</p>
</div>
<?php echo $errm; ?>
<div class="button-group">
<input type="button" value="前画面に戻る" onClick="history.back()">
</div>
</div>
<?php }else{ ?>
<h1 class="page-title">入力内容の確認</h1>
<div class="form-container">
<p class="message">以下の内容で間違いがなければ、<br>「送信する」ボタンを押してください。</p>
<form action="<?php echo h($_SERVER['SCRIPT_NAME']); ?>" method="POST">
<table class="formTable">
<?php echo confirmOutput($_POST); ?>
</table>
<input type="hidden" name="mail_set" value="confirm_submit">
<input type="hidden" name="httpReferer" value="<?php echo h($_SERVER['HTTP_REFERER']);?>">
<div class="button-group">
<input type="submit" value="送信する">
<input type="button" value="前画面に戻る" onClick="history.back()">
</div>
</form>
</div>
<?php } ?>
</div>
</body>
</html>
<?php
}

if(($jumpPage == 0 && $sendmail == 1) || ($jumpPage == 0 && ($confirmDsp == 0 && $sendmail == 0))) {
?>
<!DOCTYPE HTML>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="format-detection" content="telephone=no">
<title>送信完了 - 合同会社SHARE</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<style>
body {
    font-family: 'Noto Sans JP', sans-serif;
    text-align: center;
    padding: 100px 20px;
    background: #f8f9fa;
}
.complete-message {
    max-width: 600px;
    margin: 0 auto;
    padding: 60px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
h1 {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 30px;
}
p {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 40px;
}
a {
    display: inline-block;
    padding: 18px 45px;
    background: #333;
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 700;
    transition: all 0.3s ease;
}
a:hover {
    background: #000;
}
</style>
</head>
<body>
<?php if($empty_flag == 1){ ?>
<div class="complete-message">
<h1>入力エラー</h1>
<div style="color:#e74c3c; margin-bottom: 30px;"><?php echo $errm; ?></div>
<input type="button" value="前画面に戻る" onClick="history.back()" style="padding: 18px 45px; background: #333; color: white; border: none; border-radius: 30px; font-size: 16px; font-weight: 700; cursor: pointer;">
</div>
<?php }else{ ?>
<div class="complete-message">
<h1>送信完了</h1>
<p>お問い合わせありがとうございました。<br>
送信は正常に完了しました。<br><br>
担当者より2営業日以内にご返信させていただきます。</p>
<a href="<?php echo $site_top ;?>">トップページへ戻る</a>
</div>
<?php } ?>
</body>
</html>
<?php
}
else if(($jumpPage == 1 && $sendmail == 1) || $confirmDsp == 0) {
    if($empty_flag == 1){ ?>
<div style="text-align:center; padding: 50px;">
<h4>入力にエラーがあります。下記をご確認の上「戻る」ボタンにて修正をお願い致します。</h4>
<div style="color:red; margin: 20px 0;"><?php echo $errm; ?></div>
<input type="button" value="前画面に戻る" onClick="history.back()" style="padding: 15px 40px; background: #333; color: white; border: none; border-radius: 25px; font-size: 16px; cursor: pointer;">
</div>
<?php
    }else{ header("Location: ".$thanksPage); }
}

//----------------------------------------------------------------------
//  関数定義
//----------------------------------------------------------------------
function checkMail($str){
    $mailaddress_array = explode('@',$str);
    if(preg_match("/^[\.!#%&\-_0-9a-zA-Z\?\/\+]+\@[!#%&\-_0-9a-zA-Z]+(\.[!#%&\-_0-9a-zA-Z]+)+$/", "$str") && count($mailaddress_array) ==2){
        return true;
    }else{
        return false;
    }
}

function h($string) {
    global $encode;
    return htmlspecialchars($string, ENT_QUOTES,$encode);
}

function sanitize($arr){
    if(is_array($arr)){
        return array_map('sanitize',$arr);
    }
    return str_replace("\0","",$arr);
}

function sjisReplace($arr,$encode){
    foreach($arr as $key => $val){
        $key = str_replace('＼','ー',$key);
        $resArray[$key] = $val;
    }
    return $resArray;
}

function postToMail($arr){
    global $hankaku,$hankaku_array;
    $resArray = '';
    foreach($arr as $key => $val) {
        $out = '';
        if(is_array($val)){
            foreach($val as $key02 => $item){
                if(is_array($item)){
                    $out .= connect2val($item);
                }else{
                    $out .= $item . ', ';
                }
            }
            $out = rtrim($out,', ');
        }else{
            $out = $val;
        }

        if (version_compare(PHP_VERSION, '5.1.0', '<=')) {
            if(get_magic_quotes_gpc()) { $out = stripslashes($out); }
        }

        if($hankaku == 1){
            $out = zenkaku2hankaku($key,$out,$hankaku_array);
        }

        if($out != "confirm_submit" && $key != "httpReferer") {
            $resArray .= "【 ".h($key)." 】 ".h($out)."\n";
        }
    }
    return $resArray;
}

function confirmOutput($arr){
    global $hankaku,$hankaku_array,$useToken,$confirmDsp,$replaceStr;
    $html = '';
    foreach($arr as $key => $val) {
        $out = '';
        if(is_array($val)){
            foreach($val as $key02 => $item){
                if(is_array($item)){
                    $out .= connect2val($item);
                }else{
                    $out .= $item . ', ';
                }
            }
            $out = rtrim($out,', ');
        }else{
            $out = $val;
        }

        if (version_compare(PHP_VERSION, '5.1.0', '<=')) {
            if(get_magic_quotes_gpc()) { $out = stripslashes($out); }
        }

        if($hankaku == 1){
            $out = zenkaku2hankaku($key,$out,$hankaku_array);
        }

        $out = nl2br(h($out));
        $key = h($key);
        $out = str_replace($replaceStr['before'], $replaceStr['after'], $out);

        $html .= "<tr><th>".$key."</th><td>".$out;
        $html .= '<input type="hidden" name="'.$key.'" value="'.str_replace(array("<br />","<br>"),"",$out).'" />';
        $html .= "</td></tr>\n";
    }

    if($useToken == 1 && $confirmDsp == 1){
        $token = sha1(uniqid(mt_rand(), true));
        $_SESSION['mailform_token'] = $token;
        $html .= '<input type="hidden" name="mailform_token" value="'.$token.'" />';
    }

    return $html;
}

function zenkaku2hankaku($key,$out,$hankaku_array){
    global $encode;
    if(is_array($hankaku_array) && function_exists('mb_convert_kana')){
        foreach($hankaku_array as $hankaku_array_val){
            if($key == $hankaku_array_val){
                $out = mb_convert_kana($out,'a',$encode);
            }
        }
    }
    return $out;
}

function connect2val($arr){
    $out = '';
    foreach($arr as $key => $val){
        if($key === 0 || $val == ''){
            $key = '';
        }elseif(strpos($key,"円") !== false && $val != '' && preg_match("/^[0-9]+$/",$val)){
            $val = number_format($val);
        }
        $out .= $val . $key;
    }
    return $out;
}

function adminHeader($post_mail,$BccMail){
    global $from;
    $header="From: $from\n";
    if($BccMail != '') {
      $header.="Bcc: $BccMail\n";
    }
    if(!empty($post_mail)) {
        $header.="Reply-To: ".$post_mail."\n";
    }
    $header.="Content-Type:text/plain;charset=iso-2022-jp\nX-Mailer: PHP/".phpversion();
    return $header;
}

function mailToAdmin($arr,$subject,$mailFooterDsp,$mailSignature,$encode,$confirmDsp){
    $adminBody="「".$subject."」からメールが届きました\n\n";
    $adminBody .="＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n";
    $adminBody.= postToMail($arr);
    $adminBody.="\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n";
    $adminBody.="送信された日時：".date( "Y/m/d (D) H:i:s", time() )."\n";
    $adminBody.="送信者のIPアドレス：".@$_SERVER["REMOTE_ADDR"]."\n";
    $adminBody.="送信者のホスト名：".getHostByAddr(getenv('REMOTE_ADDR'))."\n";
    if($confirmDsp != 1){
        $adminBody.="問い合わせのページURL：".@$_SERVER['HTTP_REFERER']."\n";
    }else{
        $adminBody.="問い合わせのページURL：".@$arr['httpReferer']."\n";
    }
    if($mailFooterDsp == 1) $adminBody.= $mailSignature;
    return mb_convert_encoding($adminBody,"JIS",$encode);
}

function userHeader($refrom_name,$to,$encode){
    $reheader = "From: ";
    if(!empty($refrom_name)){
        $default_internal_encode = mb_internal_encoding();
        if($default_internal_encode != $encode){
            mb_internal_encoding($encode);
        }
        $reheader .= mb_encode_mimeheader($refrom_name)." <".$to.">\nReply-To: ".$to;
    }else{
        $reheader .= "$to\nReply-To: ".$to;
    }
    $reheader .= "\nContent-Type: text/plain;charset=iso-2022-jp\nX-Mailer: PHP/".phpversion();
    return $reheader;
}

function mailToUser($arr,$dsp_name,$remail_text,$mailFooterDsp,$mailSignature,$encode){
    $userBody = '';
    if(isset($arr[$dsp_name])) $userBody = h($arr[$dsp_name]). " 様\n\n";
    $userBody.= $remail_text;
    $userBody.="\n";
    $userBody.= postToMail($arr);
    $userBody.="\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $userBody.="送信日時：".date( "Y/m/d (D) H:i:s", time() )."\n";
    if($mailFooterDsp == 1) $userBody.= $mailSignature;
    return mb_convert_encoding($userBody,"JIS",$encode);
}

function requireCheck($require){
    $res['errm'] = '';
    $res['empty_flag'] = 0;
    foreach($require as $requireVal){
        $existsFalg = '';
        foreach($_POST as $key => $val) {
            if($key == $requireVal) {
                if(is_array($val)){
                    $connectEmpty = 0;
                    foreach($val as $kk => $vv){
                        if(is_array($vv)){
                            foreach($vv as $kk02 => $vv02){
                                if($vv02 == ''){
                                    $connectEmpty++;
                                }
                            }
                        }
                    }
                    if($connectEmpty > 0){
                        $res['errm'] .= "<p class=\"error_messe\">【".h($key)."】は必須項目です。</p>\n";
                        $res['empty_flag'] = 1;
                    }
                }
                elseif($val == ''){
                    $res['errm'] .= "<p class=\"error_messe\">【".h($key)."】は必須項目です。</p>\n";
                    $res['empty_flag'] = 1;
                }
                $existsFalg = 1;
                break;
            }
        }
        if($existsFalg != 1){
            $res['errm'] .= "<p class=\"error_messe\">【".$requireVal."】が未選択です。</p>\n";
            $res['empty_flag'] = 1;
        }
    }
    return $res;
}

function refererCheck($Referer_check,$Referer_check_domain){
    if($Referer_check == 1 && !empty($Referer_check_domain)){
        if(strpos($_SERVER['HTTP_REFERER'],$Referer_check_domain) === false){
            return exit('<p align="center">リファラチェックエラー。フォームページのドメインとこのファイルのドメインが一致しません</p>');
        }
    }
}
?>
