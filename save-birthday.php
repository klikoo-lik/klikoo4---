<?php
// ================================================
// KLIKOO Store — Sauvegarde anniversaires clients
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
$prenom       = isset($input['prenom']) ? trim($input['prenom']) : '';
$email        = isset($input['email']) ? trim($input['email']) : '';
$dateNaissance = isset($input['dateNaissance']) ? trim($input['dateNaissance']) : '';
$fcmToken     = isset($input['fcmToken']) ? trim($input['fcmToken']) : '';

if (empty($email) || empty($dateNaissance)) {
  http_response_code(400);
  echo json_encode(['error' => 'Données manquantes']);
  exit;
}

$file = __DIR__ . '/birthdays.json';
$birthdays = [];
if (file_exists($file)) {
  $birthdays = json_decode(file_get_contents($file), true) ?: [];
}

// Mettre à jour si email déjà existant
$found = false;
foreach ($birthdays as &$b) {
  if ($b['email'] === $email) {
    $b['dateNaissance'] = $dateNaissance;
    $b['fcmToken'] = $fcmToken;
    $b['prenom'] = $prenom;
    $found = true;
    break;
  }
}

if (!$found) {
  $birthdays[] = [
    'prenom'        => $prenom,
    'email'         => $email,
    'dateNaissance' => $dateNaissance,
    'fcmToken'      => $fcmToken,
    'createdAt'     => date('Y-m-d H:i:s')
  ];
}

file_put_contents($file, json_encode(array_values($birthdays), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
  'success' => true,
  'message' => 'Anniversaire sauvegardé',
  'total'   => count($birthdays)
]);
?>
