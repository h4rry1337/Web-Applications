<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Network Diagnostics Tool - Ping Utility</title>
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
        .info-box {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info-box h4 {
            margin-top: 0;
            color: #0c5460;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 Network Diagnostics Tool</h1>
        
        <div class="warning">
            <strong>⚠️ Network Testing Tool</strong><br>
            This tool allows you to test network connectivity by pinging remote hosts. 
            Enter a hostname or IP address to check if it's reachable from this server.
        </div>

        <form method="GET" action="">
            <div class="form-group">
                <label for="host">Enter hostname or IP address to ping:</label>
                <input type="text" id="host" name="host" value="<?php echo isset($_GET['host']) ? htmlspecialchars($_GET['host']) : ''; ?>" placeholder="Ex: google.com, 8.8.8.8, localhost">
            </div>
            <button type="submit">🔍 Test Connectivity</button>
        </form>

        <?php
        if (isset($_GET['host']) && !empty($_GET['host'])) {
            echo '<div class="output">';
            echo '<strong>Testing connectivity to:</strong> ' . htmlspecialchars($_GET['host']) . "\n\n";
            echo '<strong>Ping Results:</strong>' . "\n";
         
            $command = "ping -c 3 " . $_GET['host'];
            exec($command, $output, $return_code);
            
            if (!empty($output)) {
                foreach($output as $line) {
                    echo htmlspecialchars($line) . "\n";
                }
            } else {
                echo "Ping command executed. Return code: " . $return_code;
            }
            echo '</div>';
        }
        ?>

        <div class="examples">
            <h3>🎯 Testing Examples:</h3>
            <ul>
                <li><code>google.com</code> - Test Google's connectivity</li>
                <li><code>8.8.8.8</code> - Test Google's DNS server</li>
                <li><code>localhost</code> - Test local machine</li>
                <li><code>127.0.0.1</code> - Test loopback interface</li>
                <li><code>github.com</code> - Test GitHub's servers</li>
                <li><code>cloudflare.com</code> - Test Cloudflare's network</li>
            </ul>
            
            <h3>📊 Understanding Results:</h3>
            <ul>
                <li><strong>Reply from:</strong> Host is reachable and responding</li>
                <li><strong>Request timed out:</strong> Host may be blocking pings or unreachable</li>
                <li><strong>Could not find host:</strong> DNS resolution failed</li>
                <li><strong>TTL:</strong> Time To Live - hops the packet can make</li>
            </ul>
        </div>

        <div class="info-box">
            <h4>🔧 How This Tool Works</h4>
            <p>This network diagnostic tool uses the system's built-in <code>ping</code> command to test connectivity to remote hosts. The ping command sends ICMP Echo Request packets to the target host and measures response times.</p>
            
            <h4>📝 Technical Details</h4>
            <p>The tool executes: <code>ping -c 3 [your_input]</code></p>
            <ul>
                <li><code>-c 3</code> - Sends 3 ping packets</li>
                <li>Results show packet loss, response times, and round-trip statistics</li>
                <li>Useful for network troubleshooting and connectivity testing</li>
            </ul>
        </div>

    </div>
</body>
</html>
