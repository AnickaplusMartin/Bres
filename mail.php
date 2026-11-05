<?php
// Kontaktní formulář webu BRES. Nastavte adresy níže. Vyžaduje PHP 7.2+.
const TO   = 'bres@bres.cz';   // kam zprávy chodí
const FROM = 'web@bres.cz';    // odesílatel; použijte schránku na doméně hostingu, jinak zprávy končí ve spamu

header('X-Robots-Tag: noindex');
$json = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
function out($ok, $msg, $json) {
    if ($json) { header('Content-Type: application/json; charset=utf-8'); echo json_encode(['ok' => $ok, 'msg' => $msg], JSON_UNESCAPED_UNICODE); }
    else { header('Location: /kontakt/?' . ($ok ? 'odeslano=1' : 'chyba=1')); }
    exit;
}
function clean($s, $max) { return mb_substr(trim(preg_replace('/[\r\n]+/', ' ', (string)$s)), 0, $max); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Neplatný požadavek.', $json);
// Past na spamboty: skryté pole musí zůstat prázdné, formulář nesmí být odeslán do 3 s od načtení
if (!empty($_POST['website'])) out(true, 'Děkujeme, zpráva byla odeslána.', $json);
if (isset($_POST['t']) && ctype_digit((string)$_POST['t']) && (time() * 1000 - (int)$_POST['t']) < 3000) out(true, 'Děkujeme, zpráva byla odeslána.', $json);

$name = clean($_POST['name'] ?? '', 100);
$email = clean($_POST['email'] ?? '', 150);
$phone = clean($_POST['phone'] ?? '', 40);
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 5000);
if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($message) < 10 || empty($_POST['consent'])) {
    out(false, 'Vyplňte prosím jméno, platný e-mail, zprávu (alespoň 10 znaků) a potvrďte seznámení se zásadami.', $json);
}
$subject = '=?UTF-8?B?' . base64_encode('Dotaz z webu bres.cz') . '?=';
$body = "Jméno: $name\nE-mail: $email\nTelefon: " . ($phone ?: '-') . "\n\n$message\n";
$headers = ['From' => FROM, 'Reply-To' => $email, 'MIME-Version' => '1.0', 'Content-Type' => 'text/plain; charset=UTF-8'];
if (mail(TO, $subject, $body, $headers)) out(true, 'Děkujeme, zpráva byla odeslána. Ozveme se vám.', $json);
out(false, 'Zprávu se nepodařilo odeslat. Napište nám prosím na ' . TO . '.', $json);
