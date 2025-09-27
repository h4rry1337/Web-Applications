// FinanceHub Corporate Dashboard JavaScript

let currentReportFile = '';

document.addEventListener('DOMContentLoaded', function() {
    console.log('FinanceHub Dashboard Loaded');
});

// Function to load report when card is clicked
function loadReport(filename) {
    currentReportFile = filename; // Store current file for download
    const reportViewer = document.getElementById('report-viewer');
    const reportTitle = document.getElementById('report-title');
    const reportContent = document.getElementById('report-content');
    
    // Show the report viewer
    reportViewer.style.display = 'block';
    reportViewer.scrollIntoView({ behavior: 'smooth' });
    
    // Set loading state
    reportTitle.textContent = 'Loading Report...';
    reportContent.innerHTML = '<div class="loading"></div>';
    
    // Get display name for the report
    const displayNames = {
        'general_ledger_2024.csv': 'General Ledger Report 2024',
        'profit_loss_statement.csv': 'Profit & Loss Statement',
        'balance_sheet_2024.csv': 'Balance Sheet 2024',
        'payroll_summary_2024.csv': 'Payroll Summary 2024'
    };
    
    // Make AJAX request to load the report
    fetch('/read?file=' + encodeURIComponent(filename))
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load report: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            // Update the report viewer with the data
            reportTitle.textContent = displayNames[filename] || 'Financial Report';
            reportContent.textContent = data;
        })
        .catch(error => {
            reportTitle.textContent = 'Report Error';
            reportContent.innerHTML = `<div style="color: #e74c3c; padding: 20px; text-align: center;">
                <strong>Error loading report:</strong><br>
                ${error.message}<br><br>
                <small>Please contact IT support if this problem persists.</small>
            </div>`;
        });
}

// Function to download the currently viewed report
function downloadReport() {
    if (!currentReportFile) {
        alert('No report currently loaded');
        return;
    }
    
    // Create download link and trigger download
    const downloadUrl = '/download?file=' + encodeURIComponent(currentReportFile);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = currentReportFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to close the report viewer
function closeReport() {
    const reportViewer = document.getElementById('report-viewer');
    reportViewer.style.display = 'none';
}

// Add some interactive effects to cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.report-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Optional: Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeReport();
    }
});

