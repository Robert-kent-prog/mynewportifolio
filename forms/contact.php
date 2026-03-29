<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");

$receiving_email_address = "robertmuendo23@gmail.com";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "result" => "error",
        "message" => "Method not allowed.",
    ]);
    exit;
}

function field_value(array $source, array $keys): string
{
    foreach ($keys as $key) {
        if (isset($source[$key])) {
            return trim((string) $source[$key]);
        }
    }

    return "";
}

$name = field_value($_POST, ["your-name", "name"]);
$email = field_value($_POST, ["your-email", "email"]);
$subject = field_value($_POST, ["your-subject", "subject"]);
$message = field_value($_POST, ["your-message", "message"]);

if ($name === "" || $email === "" || $subject === "" || $message === "") {
    http_response_code(422);
    echo json_encode([
        "result" => "error",
        "message" => "All fields are required.",
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        "result" => "error",
        "message" => "Please provide a valid email address.",
    ]);
    exit;
}

$cleanName = preg_replace("/[\r\n]+/", " ", $name) ?? $name;
$cleanSubject = preg_replace("/[\r\n]+/", " ", $subject) ?? $subject;
$cleanMessage = trim(str_replace(["\r\n", "\r"], "\n", $message));

$body = implode("\n", [
    "Name: {$cleanName}",
    "Email: {$email}",
    "",
    "Message:",
    $cleanMessage,
]);

$headers = implode("\r\n", [
    "From: Portfolio Contact <{$receiving_email_address}>",
    "Reply-To: {$email}",
    "Content-Type: text/plain; charset=UTF-8",
]);

$mail_sent = @mail($receiving_email_address, $cleanSubject, $body, $headers);

if (!$mail_sent) {
    http_response_code(500);
    echo json_encode([
        "result" => "error",
        "message" => "Unable to send the message right now.",
    ]);
    exit;
}

echo json_encode([
    "result" => "success",
    "message" => "Message sent successfully.",
]);
