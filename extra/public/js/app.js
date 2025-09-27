// TechSupport Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeTicketFilters();
    initializeFileUploads();
    initializeNotifications();
    initializeCharts();
    initializeRealTimeUpdates();
    
    console.log('TechSupport system initialized');
});

// Ticket filtering functionality
function initializeTicketFilters() {
    const statusFilters = document.querySelectorAll('input[name="statusFilter"]');
    const priorityFilters = document.querySelectorAll('input[name="priorityFilter"]');
    const tableRows = document.querySelectorAll('tbody tr[data-status]');
    
    statusFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterTickets();
        });
    });
    
    priorityFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterTickets();
        });
    });
    
    function filterTickets() {
        const selectedStatus = document.querySelector('input[name="statusFilter"]:checked')?.id;
        const selectedPriority = document.querySelector('input[name="priorityFilter"]:checked')?.id;
        
        tableRows.forEach(row => {
            const rowStatus = row.getAttribute('data-status');
            const rowPriority = row.getAttribute('data-priority');
            let showRow = true;
            
            // Filter by status
            if (selectedStatus && selectedStatus !== 'all') {
                if (selectedStatus === 'open' && rowStatus !== 'Open') showRow = false;
                if (selectedStatus === 'progress' && rowStatus !== 'In Progress') showRow = false;
                if (selectedStatus === 'resolved' && rowStatus !== 'Resolved') showRow = false;
            }
            
            // Filter by priority
            if (selectedPriority && selectedPriority !== 'all-priority') {
                if (selectedPriority === 'high' && rowPriority !== 'High') showRow = false;
                if (selectedPriority === 'medium' && rowPriority !== 'Medium') showRow = false;
                if (selectedPriority === 'low' && rowPriority !== 'Low') showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
        
        updateFilterCounts();
    }
    
    function updateFilterCounts() {
        const visibleRows = document.querySelectorAll('tbody tr[data-status]:not([style*="display: none"])');
        const countElement = document.querySelector('#filtered-count');
        if (countElement) {
            countElement.textContent = `Showing ${visibleRows.length} tickets`;
        }
    }
}

// File upload handling
function initializeFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleFileSelection(this);
        });
    });
    
    // Drag and drop support
    const dropZones = document.querySelectorAll('.file-upload-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        zone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            const fileInput = this.querySelector('input[type="file"]');
            if (fileInput && files.length > 0) {
                fileInput.files = files;
                handleFileSelection(fileInput);
            }
        });
    });
    
    function handleFileSelection(input) {
        const files = input.files;
        const preview = input.parentNode.querySelector('.file-preview');
        
        if (preview) {
            preview.innerHTML = '';
            
            Array.from(files).forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item d-flex justify-content-between align-items-center p-2 border rounded mb-2';
                fileItem.innerHTML = `
                    <div>
                        <i class="fas fa-file me-2"></i>
                        <span>${file.name}</span>
                        <small class="text-muted ms-2">(${formatFileSize(file.size)})</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile(this, '${file.name}')">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(fileItem);
            });
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Notification system
function initializeNotifications() {
    window.showNotification = function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    };
}

// Chart initialization
function initializeCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        return;
    }
    
    // Initialize dashboard charts
    const dailyChartCanvas = document.getElementById('dailyChart');
    if (dailyChartCanvas) {
        initializeDailyChart(dailyChartCanvas);
    }
    
    const statusChartCanvas = document.getElementById('statusChart');
    if (statusChartCanvas) {
        initializeStatusChart(statusChartCanvas);
    }
}

function initializeDailyChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Sample data - in real app this would come from the server
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Tickets Created',
            data: [12, 19, 8, 15, 23, 6, 10],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeStatusChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    const data = {
        labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
        datasets: [{
            data: [15, 8, 12, 5],
            backgroundColor: [
                '#ffc107',
                '#0d6efd',
                '#198754',
                '#6c757d'
            ]
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Real-time updates
function initializeRealTimeUpdates() {
    // Check for new tickets or updates every 30 seconds
    setInterval(checkForUpdates, 30000);
    
    function checkForUpdates() {
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                updateDashboardStats(data);
            })
            .catch(error => {
                console.error('Error checking for updates:', error);
            });
    }
    
    function updateDashboardStats(stats) {
        // Update stat cards if they exist
        const totalElement = document.querySelector('[data-stat="total"]');
        if (totalElement) {
            totalElement.textContent = stats.totalTickets;
        }
        
        const openElement = document.querySelector('[data-stat="open"]');
        if (openElement) {
            openElement.textContent = stats.openTickets;
        }
        
        const progressElement = document.querySelector('[data-stat="progress"]');
        if (progressElement) {
            progressElement.textContent = stats.inProgressTickets;
        }
        
        const resolvedElement = document.querySelector('[data-stat="resolved"]');
        if (resolvedElement) {
            resolvedElement.textContent = stats.resolvedTickets;
        }
    }
}

// Utility functions
function removeFile(button, filename) {
    const fileItem = button.closest('.file-item');
    if (fileItem) {
        fileItem.remove();
    }
    
    // Also remove from file input (requires recreation of input)
    const fileInput = button.closest('.file-preview').parentNode.querySelector('input[type="file"]');
    if (fileInput) {
        // Create new FileList without the removed file
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.forEach(file => {
            if (file.name !== filename) {
                dt.items.add(file);
            }
        });
        
        fileInput.files = dt.files;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Copied to clipboard!', 'success');
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard', 'danger');
    });
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function formatRelativeTime(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Export functions for global use
window.TechSupport = {
    showNotification,
    copyToClipboard,
    formatTimestamp,
    formatRelativeTime,
    removeFile
};

// Form validation
function validateTicketForm() {
    const form = document.querySelector('#ticketForm');
    if (!form) return true;
    
    const title = form.querySelector('#title');
    const description = form.querySelector('#description');
    const category = form.querySelector('#category');
    const priority = form.querySelector('#priority');
    
    let isValid = true;
    
    // Clear previous validation
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    
    if (!title.value.trim()) {
        showFieldError(title, 'Title is required');
        isValid = false;
    }
    
    if (!description.value.trim()) {
        showFieldError(description, 'Description is required');
        isValid = false;
    }
    
    if (!category.value) {
        showFieldError(category, 'Please select a category');
        isValid = false;
    }
    
    if (!priority.value) {
        showFieldError(priority, 'Please select a priority');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    
    field.parentNode.appendChild(feedback);
}

// Auto-save functionality for forms
function initializeAutoSave() {
    const forms = document.querySelectorAll('[data-autosave]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                saveFormData(form.id, this.name, this.value);
            });
        });
        
        // Load saved data on page load
        loadFormData(form.id);
    });
}

function saveFormData(formId, fieldName, value) {
    const key = `techsupport_${formId}_${fieldName}`;
    localStorage.setItem(key, value);
}

function loadFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        const key = `techsupport_${formId}_${input.name}`;
        const savedValue = localStorage.getItem(key);
        
        if (savedValue && input.value === '') {
            input.value = savedValue;
        }
    });
}

function clearFormData(formId) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(`techsupport_${formId}_`));
    keys.forEach(key => localStorage.removeItem(key));
}

// Initialize auto-save when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoSave();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+N for new ticket
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const newTicketLink = document.querySelector('a[href="/tickets/new"]');
        if (newTicketLink) {
            window.location.href = newTicketLink.href;
        }
    }
    
    // Ctrl+D for dashboard
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const dashboardLink = document.querySelector('a[href="/dashboard"]');
        if (dashboardLink) {
            window.location.href = dashboardLink.href;
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});

// Performance monitoring
function logPageLoadTime() {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page loaded in ${Math.round(loadTime)}ms`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                value: Math.round(loadTime),
                custom_parameter: window.location.pathname
            });
        }
    });
}

logPageLoadTime();
