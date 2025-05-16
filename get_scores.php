<?php
$db = new SQLite3('scores.db');
$result = $db->query("SELECT name, score FROM scores ORDER BY score DESC LIMIT 10");

$scores = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $scores[] = $row;
}

header('Content-Type: application/json');
echo json_encode($scores);
?>
