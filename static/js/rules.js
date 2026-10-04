// SOCify Rules Management JavaScript

// Global variables
let rules = [];
let filteredRules = [];

// Initialize rules page when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    initializeRules();
    setupEventListeners();
    loadRules();
});

// Initialize rules page
function initializeRules() {
    console.log('SOCify Rules Management initialized');

    // Load sample rules if none exist
    if (rules.length === 0) {
        loadSampleRules();
    }

    updateRulesStats();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('rule-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterRules);
    }

    // Filter dropdowns
    const statusFilter = document.getElementById('rule-status-filter');
    const categoryFilter = document.getElementById('rule-category-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', filterRules);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterRules);
    }

    // Create rule form
    const createRuleForm = document.getElementById('createRuleForm');
    if (createRuleForm) {
        createRuleForm.addEventListener('submit', handleCreateRule);
    }
}

// Load rules from server (mock implementation)
function loadRules() {
    // In a real implementation, this would fetch from the server
    console.log('Loading rules...');
    displayRules(rules);
}

// Load sample rules
function loadSampleRules() {
    rules = [
        {
            id: 1,
            name: 'فشل تسجيل الدخول المتكرر',
            description: 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
            category: 'authentication',
            severity: 'high',
            condition: 'failed_logins > 5 AND time_window < 600',
            action: 'alert',
            enabled: true,
            created_at: '2024-01-15',
            events_generated: 23,
            last_triggered: '2024-01-20 14:30:00'
        },
        {
            id: 2,
            name: 'فحص المنافذ المشبوه',
            description: 'كشف محاولات فحص المنافذ من عنوان واحد',
            category: 'network',
            severity: 'medium',
            condition: 'port_scan_attempts > 10 AND time_window < 300',
            action: 'log',
            enabled: true,
            created_at: '2024-01-10',
            events_generated: 8,
            last_triggered: '2024-01-19 09:15:00'
        },
        {
            id: 3,
            name: 'حقن SQL محتمل',
            description: 'كشف محاولات حقن SQL في استعلامات قاعدة البيانات',
            category: 'application',
            severity: 'critical',
            condition: 'sql_patterns_detected > 0',
            action: 'block',
            enabled: true,
            created_at: '2024-01-12',
            events_generated: 5,
            last_triggered: '2024-01-18 16:45:00'
        },
        {
            id: 4,
            name: 'هجوم DDoS محتمل',
            description: 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
            category: 'network',
            severity: 'critical',
            condition: 'requests_per_second > 1000 AND unique_ips > 100',
            action: 'escalate',
            enabled: false,
            created_at: '2024-01-08',
            events_generated: 0,
            last_triggered: null
        },
        {
            id: 5,
            name: 'وصول غير مصرح به للملفات',
            description: 'كشف محاولات الوصول لملفات حساسة',
            category: 'system',
            severity: 'high',
            condition: 'sensitive_file_access > 0',
            action: 'alert',
            enabled: true,
            created_at: '2024-01-14',
            events_generated: 12,
            last_triggered: '2024-01-17 11:20:00'
        }
    ];

    filteredRules = [...rules];
}

// Display rules in the grid
function displayRules(rulesToDisplay) {
    const rulesGrid = document.getElementById('rules-grid');
    if (!rulesGrid) return;

    rulesGrid.innerHTML = '';

    rulesToDisplay.forEach(rule => {
        const ruleCard = createRuleCard(rule);
        rulesGrid.appendChild(ruleCard);
    });
}

// Create rule card element
function createRuleCard(rule) {
    const card = document.createElement('div');
    card.className = `rule-card ${rule.enabled ? 'active' : 'inactive'}`;

    const severityClass = rule.severity;
    const statusText = rule.enabled ? 'نشط' : 'غير نشط';
    const statusClass = rule.enabled ? 'active' : 'inactive';

    card.innerHTML = `
        <div class="rule-header">
            <div class="rule-info">
                <h3>${rule.name}</h3>
                <span class="rule-category">${getCategoryName(rule.category)}</span>
            </div>
            <span class="rule-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="rule-description">
            ${rule.description}
        </div>
        
        <div class="rule-details">
            <div class="rule-detail">
                <span class="rule-detail-label">الخطورة</span>
                <span class="rule-severity ${severityClass}">${getSeverityName(rule.severity)}</span>
            </div>
            <div class="rule-detail">
                <span class="rule-detail-label">الإجراء</span>
                <span class="rule-detail-value">${getActionName(rule.action)}</span>
            </div>
            <div class="rule-detail">
                <span class="rule-detail-label">الأحداث المولدة</span>
                <span class="rule-detail-value">${rule.events_generated}</span>
            </div>
            <div class="rule-detail">
                <span class="rule-detail-label">آخر تفعيل</span>
                <span class="rule-detail-value">${rule.last_triggered ? formatDate(rule.last_triggered) : 'لم يتم التفعيل'}</span>
            </div>
        </div>
        
        <div class="rule-actions">
            <button class="rule-action-btn edit" onclick="editRule(${rule.id})">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" fill="currentColor"/>
                </svg>
                تعديل
            </button>
            <button class="rule-action-btn toggle" onclick="toggleRule(${rule.id})">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" fill="currentColor"/>
                </svg>
                ${rule.enabled ? 'إيقاف' : 'تفعيل'}
            </button>
            <button class="rule-action-btn delete" onclick="deleteRule(${rule.id})">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" fill="currentColor"/>
                </svg>
                حذف
            </button>
        </div>
    `;

    return card;
}

// Filter rules based on search and filters
function filterRules() {
    const searchTerm = document.getElementById('rule-search').value.toLowerCase();
    const statusFilter = document.getElementById('rule-status-filter').value;
    const categoryFilter = document.getElementById('rule-category-filter').value;

    filteredRules = rules.filter(rule => {
        const matchesSearch = rule.name.toLowerCase().includes(searchTerm) ||
            rule.description.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter ||
            (statusFilter === 'active' && rule.enabled) ||
            (statusFilter === 'inactive' && !rule.enabled) ||
            (statusFilter === 'draft' && !rule.enabled);

        const matchesCategory = !categoryFilter || rule.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    displayRules(filteredRules);
}

// Update rules statistics
function updateRulesStats() {
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.enabled).length;
    const eventsGenerated = rules.reduce((sum, rule) => sum + rule.events_generated, 0);
    const activationRate = totalRules > 0 ? Math.round((activeRules / totalRules) * 100) : 0;

    document.getElementById('total-rules').textContent = totalRules;
    document.getElementById('active-rules').textContent = activeRules;
    document.getElementById('events-generated').textContent = eventsGenerated;
    document.getElementById('activation-rate').textContent = activationRate + '%';
}

// Show create rule modal
function showCreateRuleModal() {
    const modal = document.getElementById('createRuleModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Handle create rule form submission
function handleCreateRule(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const ruleData = {
        id: rules.length + 1,
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        severity: formData.get('severity'),
        condition: formData.get('condition'),
        action: formData.get('action'),
        enabled: formData.get('enabled') === 'on',
        created_at: new Date().toISOString().split('T')[0],
        events_generated: 0,
        last_triggered: null
    };

    // Add new rule
    rules.push(ruleData);
    filteredRules = [...rules];

    // Update display
    displayRules(filteredRules);
    updateRulesStats();

    // Close modal and reset form
    closeModal('createRuleModal');
    e.target.reset();

    // Show success message
    showNotification('تم إنشاء القاعدة بنجاح', 'success');
}

// Edit rule
function editRule(ruleId) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    // Populate form with rule data
    document.getElementById('rule-name').value = rule.name;
    document.getElementById('rule-description').value = rule.description;
    document.getElementById('rule-category').value = rule.category;
    document.getElementById('rule-severity').value = rule.severity;
    document.getElementById('rule-condition').value = rule.condition;
    document.getElementById('rule-action').value = rule.action;
    document.getElementById('rule-enabled').checked = rule.enabled;

    showCreateRuleModal();
}

// Toggle rule status
function toggleRule(ruleId) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.enabled = !rule.enabled;

    // Update display
    displayRules(filteredRules);
    updateRulesStats();

    const status = rule.enabled ? 'تم تفعيل' : 'تم إيقاف';
    showNotification(`${status} القاعدة بنجاح`, 'success');
}

// Delete rule
function deleteRule(ruleId) {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
        return;
    }

    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return;

    rules.splice(ruleIndex, 1);
    filteredRules = [...rules];

    // Update display
    displayRules(filteredRules);
    updateRulesStats();

    showNotification('تم حذف القاعدة بنجاح', 'success');
}

// Use template
function useTemplate(templateType) {
    const templates = {
        'failed-login': {
            name: 'فشل تسجيل الدخول المتكرر',
            description: 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
            category: 'authentication',
            severity: 'high',
            condition: 'failed_logins > 5 AND time_window < 600',
            action: 'alert'
        },
        'port-scan': {
            name: 'فحص المنافذ المشبوه',
            description: 'كشف محاولات فحص المنافذ من عنوان واحد',
            category: 'network',
            severity: 'medium',
            condition: 'port_scan_attempts > 10 AND time_window < 300',
            action: 'log'
        },
        'sql-injection': {
            name: 'حقن SQL محتمل',
            description: 'كشف محاولات حقن SQL في استعلامات قاعدة البيانات',
            category: 'application',
            severity: 'critical',
            condition: 'sql_patterns_detected > 0',
            action: 'block'
        },
        'ddos': {
            name: 'هجوم DDoS محتمل',
            description: 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
            category: 'network',
            severity: 'critical',
            condition: 'requests_per_second > 1000 AND unique_ips > 100',
            action: 'escalate'
        }
    };

    const template = templates[templateType];
    if (!template) return;

    // Populate form with template data
    document.getElementById('rule-name').value = template.name;
    document.getElementById('rule-description').value = template.description;
    document.getElementById('rule-category').value = template.category;
    document.getElementById('rule-severity').value = template.severity;
    document.getElementById('rule-condition').value = template.condition;
    document.getElementById('rule-action').value = template.action;

    showCreateRuleModal();
}

// Refresh rules
function refreshRules() {
    loadRules();
    showNotification('تم تحديث القواعد', 'success');
}

// Utility functions
function getCategoryName(category) {
    const categories = {
        'authentication': 'المصادقة',
        'network': 'الشبكة',
        'application': 'التطبيقات',
        'system': 'النظام'
    };
    return categories[category] || category;
}

function getSeverityName(severity) {
    const severities = {
        'critical': 'حرج',
        'high': 'عالي',
        'medium': 'متوسط',
        'low': 'منخفض'
    };
    return severities[severity] || severity;
}

function getActionName(action) {
    const actions = {
        'alert': 'تنبيه',
        'block': 'حظر',
        'log': 'تسجيل',
        'escalate': 'تصعيد'
    };
    return actions[action] || action;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg class="notification-icon" viewBox="0 0 24 24" width="20" height="20">
                ${getNotificationIcon(type)}
            </svg>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                </svg>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(66, 66, 66, 0.3);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: 'IBM Plex Sans Arabic', sans-serif;
    `;

    // Add notification content styles
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    // Add icon styles
    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
        flex-shrink: 0;
        ${getNotificationIconColor(type)}
    `;

    // Add message styles
    const messageEl = notification.querySelector('.notification-message');
    messageEl.style.cssText = `
        flex: 1;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
    `;

    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #B0BEC5;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#FFFFFF';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#B0BEC5';
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '<path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" fill="currentColor"/>',
        error: '<path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" fill="currentColor"/>',
        warning: '<path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" fill="currentColor"/>',
        info: '<path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" fill="currentColor"/>'
    };
    return icons[type] || icons.info;
}

function getNotificationIconColor(type) {
    const colors = {
        success: 'color: #76FF03;',
        error: 'color: #FF1744;',
        warning: 'color: #FF9100;',
        info: 'color: #1565C0;'
    };
    return colors[type] || colors.info;
}

// Logout function
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        window.location.href = '/logout';
    }
}

// Export functions for global access
window.showCreateRuleModal = showCreateRuleModal;
window.closeModal = closeModal;
window.editRule = editRule;
window.toggleRule = toggleRule;
window.deleteRule = deleteRule;
window.useTemplate = useTemplate;
window.refreshRules = refreshRules;
window.logout = logout;
