<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Set a user agent to mimic a browser request
$opts = [
    'http' => [
        'method' => 'GET',
        'header' => 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n'
    ]
];

$context = stream_context_create($opts);

try {
    // Fetch the content from MMMUT website
    $content = file_get_contents('https://mmmut.ac.in/ExaminationSchedule', false, $context);
    
    if ($content === false) {
        throw new Exception('Failed to fetch content');
    }

    // Return the content as JSON
    echo json_encode([
        'success' => true,
        'data' => $content
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
