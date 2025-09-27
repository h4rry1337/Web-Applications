from flask import Flask, request, render_template, jsonify, send_file
import os

app = Flask(__name__)

@app.route('/')
def index():
    """FinanceHub Dashboard - Corporate Financial Reporting System"""
    return render_template('index.html')

@app.route('/read')
def read_file():
    """
    Financial Report Retrieval API
    
    Provides access to corporate financial reports and data files
    for authorized personnel and applications.
    """
    filename = request.args.get('file')
    
    if not filename:
        return "Error: No file parameter provided", 400
    
    try:
        # Document access and retrieval
        with open(filename, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return f"Error: Report '{filename}' not found", 404
    except PermissionError:
        return f"Error: Access denied to report '{filename}'", 403
    except Exception as e:
        return f"Error accessing report '{filename}': {str(e)}", 500

@app.route('/download')
def download_file():
    """
    Financial Report Download API
    
    Provides secure download of corporate financial reports
    for authorized personnel.
    """
    filename = request.args.get('file')
    
    if not filename:
        return "Error: No file parameter provided", 400
    
    try:
        # Security check - only allow CSV files from predefined list
        allowed_files = [
            'general_ledger_2024.csv',
            'profit_loss_statement.csv', 
            'balance_sheet_2024.csv',
            'payroll_summary_2024.csv'
        ]
        
        if filename not in allowed_files:
            return "Error: File not authorized for download", 403
            
        # Check if file exists
        if not os.path.exists(filename):
            return f"Error: Report '{filename}' not found", 404
            
        # Send file as attachment
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename,
            mimetype='text/csv'
        )
    except Exception as e:
        return f"Error downloading report '{filename}': {str(e)}", 500

@app.route('/info')
def info():
    """Application information endpoint"""
    return jsonify({
        "application": "FinanceHub Corporate Dashboard",
        "version": "1.0.0",
        "description": "Corporate Financial Reporting and Analytics Platform",
        "department": "Finance & Accounting",
        "endpoints": {
            "/read": "Financial report retrieval service",
            "/download": "Financial report download service",
            "/": "Main dashboard interface",
            "/info": "System information and status"
        },
        "available_reports": [
            "general_ledger_2024.csv",
            "profit_loss_statement.csv", 
            "balance_sheet_2024.csv",
            "payroll_summary_2024.csv"
        ],
        "features": [
            "Real-time financial data access",
            "Automated report generation",
            "Compliance monitoring",
            "Multi-format export capabilities",
            "Audit trail logging",
            "SOX compliance reporting"
        ],
        "database": {
            "type": "PostgreSQL",
            "version": "13.4",
            "last_backup": "2025-01-05",
            "encryption": "AES-256"
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Document Management System - Starting Server")
    print("Platform: Cross-platform document access solution")
    print("Access URL: http://localhost:5000")
    print("API Endpoints:")
    print("  - /read?file=[document_path] (View reports)")
    print("  - /download?file=[document_path] (Download reports)")
    print("Status: Production Ready")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
