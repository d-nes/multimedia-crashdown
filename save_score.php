<?php
$data = json_decode(file_get_contents('php://input'), true);
if ($data && isset($data['name']) && isset($data['score'])) {
    $entry = ['name' => $data['name'], 'score' => $data['score']];
    $file = 'scores.json';

    $scores = [];
    if (file_exists($file)) {
        $scores = json_decode(file_get_contents($file), true);
    }

    $scores[] = $entry;
    usort($scores, fn($a, $b) => $b['score'] - $a['score']);
    $scores = array_slice($scores, 0, 10);

    file_put_contents($file, json_encode($scores));
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>
