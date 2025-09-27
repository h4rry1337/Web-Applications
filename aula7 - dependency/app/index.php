<?php
require_once 'vendor/autoload.php';

$smarty = new SmartyBC();
$smarty->setTemplateDir('./templates/');
$smarty->setCompileDir('./templates_c/');
$smarty->setCacheDir('./cache/');

$message = "";
$files = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'render_template') {
        $template = $_POST['template'];
        try {
            $smarty->assign('title', 'File Manager');
            $smarty->assign('user', 'admin');
            $result = $smarty->fetch($template);
            $message = "Template rendered successfully: " . $result;
        } catch (Exception $e) {
            $message = "Error: " . $e->getMessage();
        }
    }
}

$currentDir = __DIR__;
$dirHandle = opendir($currentDir);
while (($file = readdir($dirHandle)) !== false) {
    if ($file !== '.' && $file !== '..') {
        $files[] = $file;
    }
}
closedir($dirHandle);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Template Renderer</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container {
            padding-top: 2rem;
        }
        
        .card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .card-header {
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px 15px 0 0 !important;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            border-radius: 25px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-danger {
            background: linear-gradient(45deg, #dc3545, #c82333);
            border: none;
            border-radius: 25px;
            padding: 0.5rem 1.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
        }
        
        .form-control {
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        
        .form-control:focus {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
            color: white;
        }
        
        .file-item {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .file-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
        }
        
        .text-white {
            color: white !important;
        }
        
        .alert {
            border-radius: 10px;
            border: none;
        }
        
        .alert-info {
            background: rgba(13, 202, 240, 0.1);
            border: 1px solid rgba(13, 202, 240, 0.3);
            color: #0dcaf0;
        }
        
        .alert-danger {
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid rgba(220, 53, 69, 0.3);
            color: #dc3545;
        }
        
        .navbar {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .navbar-brand {
            color: white !important;
            font-weight: 700;
        }
        
        .text-muted {
            color: rgba(255, 255, 255, 0.6) !important;
        }
        
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="#">Template Renderer</a>
        </div>
    </nav>

    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title text-white mb-0">Template Renderer</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST">
                            <input type="hidden" name="action" value="render_template">
                            <div class="mb-3">
                                <label for="template" class="form-label text-white">Template Resource</label>
                                <input type="text" class="form-control" id="template" name="template" placeholder="template.tpl">
                            </div>
                            <button type="submit" class="btn btn-primary">Render Template</button>
                        </form>
                        
                        <?php if ($message): ?>
                            <div class="alert alert-info mt-3">
                                <pre><?php echo htmlspecialchars($message); ?></pre>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script>
        function setPayload(payload) {
            document.getElementById('template').value = payload;
        }
    </script>
</body>
</html>