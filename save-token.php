<?php
// ================================================
// KLIKOO Store — Sauvegarde tokens FCM
// Fichier: save-token.php (dans public_html)
// ================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://klikoo.ma');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = isset($input['token']) ? trim($input['token']) : '';

if (empty($token) || strlen($token) < 20) {
  http_response_code(400);
  echo json_encode(['error' => 'Token invalide']);
  exit;
}

// Fichier de stockage des tokens (hors public_html idéalement)
$tokensFile = __DIR__ . '/tokens.json';

// Charger tokens existants
$tokens = [];
if (file_exists($tokensFile)) {
  $content = file_get_contents($tokensFile);
  $tokens = json_decode($content, true) ?: [];
}

// Ajouter seulement si nouveau
if (!in_array($token, $tokens)) {
  $tokens[] = $token;
  file_put_contents($tokensFile, json_encode(array_values($tokens), JSON_PRETTY_PRINT));
  echo json_encode(['success' => true, 'message' => 'Token sauvegardé', 'total' => count($tokens)]);
} else {
  echo json_encode(['success' => true, 'message' => 'Token déjà existant', 'total' => count($tokens)]);
}
?>
