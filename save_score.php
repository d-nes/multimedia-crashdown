<?php
$db = new SQLite3('scores.db');

// Tábla létrehozása, ha nem létezik
$db->exec("CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$data = json_decode(file_get_contents("php://input"), true);
$name = $db->escapeString($data['name']);
$score = (int)$data['score'];

$db->exec("INSERT INTO scores (name, score) VALUES ('$name', $score)");

echo json_encode(['status' => 'success']);
?>
