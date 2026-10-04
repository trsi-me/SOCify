// SOCify Dashboard JavaScript

let currentSection = 'dashboard';
let eventsData = [];
let rulesData = [];
let sourcesData = [];
let auditData = [];
let statsData = {};

// Make functions available globally immediately (before DOMContentLoaded)
function showProfile() {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show profile section
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
        profileSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const profileNavItem = document.querySelector('.nav-item[onclick="showProfile()"]') ||
        document.querySelector('.nav-item[data-section="profile"]');
    if (profileNavItem) {
        profileNavItem.classList.add('active');
    }
}

function showLab() {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show lab section
    const labSection = document.getElementById('lab-section');
    if (labSection) {
        labSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const labNavItem = document.querySelector('.nav-item[onclick="showLab()"]') ||
        document.querySelector('.nav-item[data-section="lab"]');
    if (labNavItem) {
        labNavItem.classList.add('active');
    }
}

// Make them available in window scope too
window.showProfile = showProfile;
window.showLab = showLab;

document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
});

function initializeDashboard() {
    // Check if we're on a page that uses dashboard functionality
    if (!document.querySelector('.nav-item')) {
        console.log('Not on a dashboard-compatible page, skipping initialization');
        return;
    }

    // Set up navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Set up filters
    setupFilters();

    // Set up modals
    setupModals();
}

function setupEventListeners() {
    // Only set up event listeners if we're on a compatible page
    if (!document.querySelector('.nav-item')) {
        return;
    }

    // Dashboard refresh
    window.refreshDashboard = refreshDashboard;
    window.refreshEvents = refreshEvents;

    // Modal functions
    window.showCreateEventModal = showCreateEventModal;
    window.showCreateRuleModal = showCreateRuleModal;
    window.closeModal = closeModal;

    // Profile and Lab functions
    window.showProfile = showProfile;
    window.showLab = showLab;
}

function switchSection(section) {
    // Check if we're on a compatible page
    if (!document.querySelector('.nav-item')) {
        return;
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(`[data-section="${section}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentSection = section;

    // Load section-specific data
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'events':
            loadEventsData();
            break;
        case 'rules':
            loadRulesData();
            break;
        case 'sources':
            loadSourcesData();
            break;
        case 'audit':
            loadAuditData();
            break;
        case 'lab':
            showLab();
            break;
        case 'profile':
            showProfile();
            break;
    }
}

function setupFilters() {
    const filters = ['severity-filter', 'status-filter', 'source-filter'];

    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

function setupModals() {
    // Close modal when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Check if we're on the dashboard page
        if (!document.getElementById('critical-count')) {
            console.log('Not on dashboard page, skipping dashboard data load');
            return;
        }

        // Load actual stats from API
        await refreshDashboardStats();

        // Load other data
        loadEventsData();
        loadRulesData();
        loadSourcesData();
        loadAuditData();

    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('فشل في تحميل بيانات لوحة التحكم', 'error');
    }
}

async function refreshDashboardStats() {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await fetch('/api/stats', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        const stats = await response.json();
        statsData = stats;
        updateDashboardStats(stats);

        // Also update recent events list
        const eventsResponse = await fetch('/api/events?limit=5', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (eventsResponse.ok) {
            const recentEvents = await eventsResponse.json();
            updateRecentEvents(recentEvents);
        }
    } catch (error) {
        console.error('Failed to refresh dashboard stats:', error);
        // Fallback to sample data
        const stats = {
            severity_stats: [
                { severity: 'critical', count: 0 },
                { severity: 'high', count: 0 },
                { severity: 'medium', count: 0 },
                { severity: 'low', count: 0 }
            ],
            status_stats: [
                { status: 'open', count: 0 },
                { status: 'investigating', count: 0 },
                { status: 'resolved', count: 0 },
                { status: 'false_positive', count: 0 }
            ]
        };
        statsData = stats;
        updateDashboardStats(stats);
    }
}

const events = [
    {
        id: 1,
        event_id: 'EVT-DDOS001',
        title: 'هجوم DDoS مكثف على خادم الويب الرئيسي',
        source: 'firewall',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        status: 'open'
    },
    {
        id: 2,
        event_id: 'EVT-BRUTE001',
        title: 'محاولات تسجيل دخول مشبوهة متكررة',
        source: 'ids',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'investigating'
    },
    {
        id: 3,
        event_id: 'EVT-SQL001',
        title: 'محاولة حقن SQL في نموذج تسجيل الدخول',
        source: 'server',
        severity: 'medium',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'open'
    }
];

function updateDashboardStats(stats) {
    // Update severity counts
    const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    stats.severity_stats.forEach(stat => {
        severityCounts[stat.severity] = stat.count;
    });

    // Check if elements exist before updating
    const criticalElement = document.getElementById('critical-count');
    const highElement = document.getElementById('high-count');
    const mediumElement = document.getElementById('medium-count');
    const lowElement = document.getElementById('low-count');

    if (criticalElement) criticalElement.textContent = severityCounts.critical;
    if (highElement) highElement.textContent = severityCounts.high;
    if (mediumElement) mediumElement.textContent = severityCounts.medium;
    if (lowElement) lowElement.textContent = severityCounts.low;

    // Update status stats
    updateStatusStats(stats.status_stats);
}

function updateStatusStats(statusStats) {
    const statusContainer = document.getElementById('status-stats');
    if (!statusContainer) return;

    statusContainer.innerHTML = '';

    statusStats.forEach(stat => {
        const statusItem = document.createElement('div');
        statusItem.className = 'status-item';
        statusItem.innerHTML = `
            <div class="status-label">${getStatusLabel(stat.status)}</div>
            <div class="status-count">${stat.count}</div>
        `;
        statusContainer.appendChild(statusItem);
    });
}

function updateRecentEvents(events) {
    const eventsContainer = document.getElementById('recent-events');
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '';

    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">لا توجد أحداث حديثة</p>';
        return;
    }

    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.severity}`;
        eventItem.innerHTML = `
            <span class="event-time">${formatTime(event.timestamp)}</span>
            <span class="event-title">${event.title}</span>
            <span class="event-source">${getSourceLabel(event.source)}</span>
        `;
        eventsContainer.appendChild(eventItem);
    });
}

// Events Functions
async function loadEventsData() {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch('/api/events', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load events');
        }

        const apiEvents = await response.json();

        // Use API events if available, otherwise use sample data
        eventsData = apiEvents.length > 0 ? apiEvents : [
            {
                id: 1,
                event_id: 'EVT-DDOS001',
                title: 'هجوم DDoS مكثف على خادم الويب الرئيسي',
                source: 'firewall',
                severity: 'critical',
                category: 'DDoS Attack',
                timestamp: new Date().toISOString(),
                status: 'open',
                description: 'تم رصد زيادة غير طبيعية في الطلبات من عناوين IP متعددة تستهدف خادم الويب الرئيسي',
                assigned_to: 1,
                created_by: 1
            },
            {
                id: 2,
                event_id: 'EVT-BRUTE001',
                title: 'محاولات تسجيل دخول مشبوهة متكررة',
                source: 'ids',
                severity: 'high',
                category: 'Brute Force',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                status: 'investigating',
                description: 'تم رصد 25 محاولة تسجيل دخول فاشلة من عنوان IP واحد خلال 10 دقائق',
                assigned_to: 2,
                created_by: 1
            },
            {
                id: 3,
                event_id: 'EVT-SQL001',
                title: 'محاولة حقن SQL في نموذج تسجيل الدخول',
                source: 'server',
                severity: 'medium',
                category: 'SQL Injection',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                status: 'open',
                description: 'تم رصد محاولة حقن SQL في نموذج تسجيل الدخول',
                assigned_to: 1,
                created_by: 1
            },
            {
                id: 4,
                event_id: 'EVT-SCAN001',
                title: 'فحص منافذ مشبوه من عنوان خارجي',
                source: 'firewall',
                severity: 'high',
                category: 'Port Scan',
                timestamp: new Date(Date.now() - 900000).toISOString(),
                status: 'open',
                description: 'تم رصد محاولة فحص المنافذ من عنوان IP خارجي',
                assigned_to: 2,
                created_by: 1
            },
            {
                id: 5,
                event_id: 'EVT-MAL001',
                title: 'رصد برنامج ضار في خادم قاعدة البيانات',
                source: 'ids',
                severity: 'critical',
                category: 'Malware',
                timestamp: new Date(Date.now() - 1200000).toISOString(),
                status: 'investigating',
                description: 'تم رصد نشاط مشبوه يشير إلى وجود برنامج ضار في خادم قاعدة البيانات',
                assigned_to: 1,
                created_by: 1
            }
        ];

        updateEventsTable(eventsData);

    } catch (error) {
        console.error('Failed to load events:', error);
        showNotification('فشل في تحميل الأحداث', 'error');

        // Fallback to sample data
        eventsData = [
            {
                id: 1,
                event_id: 'EVT-DDOS001',
                title: 'هجوم DDoS مكثف على خادم الويب الرئيسي',
                source: 'firewall',
                severity: 'critical',
                category: 'DDoS Attack',
                timestamp: new Date().toISOString(),
                status: 'open',
                description: 'تم رصد زيادة غير طبيعية في الطلبات من عناوين IP متعددة تستهدف خادم الويب الرئيسي',
                assigned_to: 1,
                created_by: 1
            },
            {
                id: 2,
                event_id: 'EVT-BRUTE001',
                title: 'محاولات تسجيل دخول مشبوهة متكررة',
                source: 'ids',
                severity: 'high',
                category: 'Brute Force',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                status: 'investigating',
                description: 'تم رصد 25 محاولة تسجيل دخول فاشلة من عنوان IP واحد خلال 10 دقائق',
                assigned_to: 2,
                created_by: 1
            },
            {
                id: 3,
                event_id: 'EVT-SQL001',
                title: 'محاولة حقن SQL في نموذج تسجيل الدخول',
                source: 'server',
                severity: 'medium',
                category: 'SQL Injection',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                status: 'open',
                description: 'تم رصد محاولة حقن SQL في نموذج تسجيل الدخول',
                assigned_to: 1,
                created_by: 1
            },
            {
                id: 4,
                event_id: 'EVT-SCAN001',
                title: 'فحص منافذ مشبوه من عنوان خارجي',
                source: 'firewall',
                severity: 'high',
                category: 'Port Scan',
                timestamp: new Date(Date.now() - 900000).toISOString(),
                status: 'open',
                description: 'تم رصد محاولة فحص المنافذ من عنوان IP خارجي',
                assigned_to: 2,
                created_by: 1
            },
            {
                id: 5,
                event_id: 'EVT-MAL001',
                title: 'رصد برنامج ضار في خادم قاعدة البيانات',
                source: 'ids',
                severity: 'critical',
                category: 'Malware',
                timestamp: new Date(Date.now() - 1200000).toISOString(),
                status: 'investigating',
                description: 'تم رصد نشاط مشبوه يشير إلى وجود برنامج ضار في خادم قاعدة البيانات',
                assigned_to: 1,
                created_by: 1
            }
        ];
        updateEventsTable(eventsData);
    }
}

function updateEventsTable(events) {
    const tableBody = document.getElementById('events-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (events.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-events">لا توجد أحداث</td>
            </tr>
        `;
        return;
    }

    events.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.event_id}</td>
            <td>${getSourceLabel(event.source)}</td>
            <td><span class="severity-badge severity-${event.severity}">${getSeverityLabel(event.severity)}</span></td>
            <td>${event.category}</td>
            <td>${event.title}</td>
            <td><span class="status-badge status-${event.status}">${getStatusLabel(event.status)}</span></td>
            <td>${formatDate(event.timestamp)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewEvent(${event.id})">عرض</button>
                <button class="btn btn-sm btn-primary" onclick="editEvent(${event.id})">تعديل</button>
                <button class="btn btn-sm btn-warning" onclick="toggleEventStatus(${event.id})">${event.status === 'open' ? 'إيقاف' : 'تفعيل'}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">حذف</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function applyFilters() {
    const severityFilter = document.getElementById('severity-filter');
    const statusFilter = document.getElementById('status-filter');
    const sourceFilter = document.getElementById('source-filter');

    let filteredEvents = [...eventsData];

    if (severityFilter && severityFilter.value) {
        filteredEvents = filteredEvents.filter(event => event.severity === severityFilter.value);
    }

    if (statusFilter && statusFilter.value) {
        filteredEvents = filteredEvents.filter(event => event.status === statusFilter.value);
    }

    if (sourceFilter && sourceFilter.value) {
        filteredEvents = filteredEvents.filter(event => event.source === sourceFilter.value);
    }

    updateEventsTable(filteredEvents);
}

// Rules Functions
async function loadRulesData() {
    try {
        const rules = [
            {
                id: 1,
                name: 'كشف فشل تسجيل الدخول المتكرر',
                description: 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
                category: 'authentication',
                severity: 'high',
                is_active: true
            },
            {
                id: 2,
                name: 'كشف فحص المنافذ',
                description: 'كشف محاولات فحص المنافذ من عنوان واحد',
                category: 'network',
                severity: 'medium',
                is_active: true
            },
            {
                id: 3,
                name: 'كشف هجوم DDoS',
                description: 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
                category: 'network',
                severity: 'critical',
                is_active: true
            }
        ];
        rulesData = rules;
        updateRulesGrid(rules);
    } catch (error) {
        console.error('Failed to load rules:', error);
        showNotification('فشل في تحميل القواعد', 'error');
    }
}

function updateRulesGrid(rules) {
    const rulesContainer = document.getElementById('rules-grid');
    if (!rulesContainer) return;

    rulesContainer.innerHTML = '';

    if (rules.length === 0) {
        rulesContainer.innerHTML = '<p class="no-rules">لا توجد قواعد</p>';
        return;
    }

    rules.forEach(rule => {
        const ruleCard = document.createElement('div');
        ruleCard.className = 'rule-card';
        ruleCard.innerHTML = `
            <div class="rule-header">
                <h3 class="rule-title">${rule.name}</h3>
                <span class="rule-status ${rule.is_active ? 'active' : 'inactive'}">
                    ${rule.is_active ? 'نشط' : 'غير نشط'}
                </span>
            </div>
            <p class="rule-description">${rule.description}</p>
            <div class="rule-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewRule(${rule.id})">عرض</button>
                <button class="btn btn-sm btn-primary" onclick="editRule(${rule.id})">تعديل</button>
                <button class="btn btn-sm btn-warning" onclick="toggleRule(${rule.id})">
                    ${rule.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRule(${rule.id})">حذف</button>
            </div>
        `;
        rulesContainer.appendChild(ruleCard);
    });
}

// Modal Functions
function showCreateEventModal() {
    const modal = document.getElementById('createEventModal');
    modal.classList.add('active');
}

function showCreateRuleModal() {
    // Implementation for rule creation modal
    showNotification('قريباً: إضافة قاعدة جديدة', 'info');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');

        // Reset form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Event Creation
document.addEventListener('DOMContentLoaded', function () {
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }
});

async function handleCreateEvent(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const eventData = {
        source: formData.get('source'),
        severity: formData.get('severity'),
        category: formData.get('category'),
        title: formData.get('title'),
        description: formData.get('description'),
        raw_data: formData.get('raw_data')
    };

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        submitButton.textContent = 'جاري الإنشاء...';
        submitButton.disabled = true;

        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call to create event
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'فشل في إنشاء الحدث');
        }

        const result = await response.json();
        showNotification('تم إنشاء الحدث بنجاح', 'success');
        closeModal('createEventModal');

        // Refresh events data from server
        await loadEventsData();

        // Always refresh dashboard stats when creating events
        await refreshDashboardStats();

        // Also refresh dashboard if we're on dashboard section
        if (currentSection === 'dashboard') {
            await loadDashboardData();
        }

    } catch (error) {
        console.error('Error creating event:', error);
        showNotification(error.message || 'فشل في إنشاء الحدث', 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Utility Functions
function getSeverityLabel(severity) {
    const labels = {
        critical: 'حرج',
        high: 'عالي',
        medium: 'متوسط',
        low: 'منخفض'
    };
    return labels[severity] || severity;
}

function getStatusLabel(status) {
    const labels = {
        open: 'مفتوح',
        investigating: 'قيد التحقيق',
        resolved: 'محلول',
        false_positive: 'إنذار كاذب'
    };
    return labels[status] || status;
}

function getSourceLabel(source) {
    const labels = {
        firewall: 'جدار الحماية',
        ids: 'نظام كشف التسلل',
        server: 'الخادم',
        manual: 'يدوي'
    };
    return labels[source] || source;
}

// Utility Functions for date/time formatting
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const typeIcons = {
        success: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" fill="currentColor"/></svg>`,
        error: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/></svg>`,
        info: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" fill="currentColor"/></svg>`
    };

    notification.innerHTML = `
        <div class="notification-icon">${typeIcons[type]}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button type="button" class="notification-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
            </svg>
        </button>
    `;

    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 300px;
                z-index: 10000;
                border-left: 4px solid var(--primary);
                animation: slideIn 0.3s ease-out;
            }
            .notification-success { border-left-color: #76FF03; }
            .notification-error { border-left-color: #FF1744; }
            .notification-warning { border-left-color: #FF9100; }
            .notification-info { border-left-color: #00E5FF; }
            .notification-icon { color: var(--primary); }
            .notification-success .notification-icon { color: #76FF03; }
            .notification-error .notification-icon { color: #FF1744; }
            .notification-warning .notification-icon { color: #FF9100; }
            .notification-info .notification-icon { color: #00E5FF; }
            .notification-content { flex: 1; }
            .notification-message { font-weight: 500; }
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            .notification-close:hover { background: rgba(255, 255, 255, 0.1); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Refresh Functions
async function refreshDashboard() {
    await loadDashboardData();
    showNotification('تم تحديث لوحة التحكم', 'success');
}

function refreshEvents() {
    loadEventsData();
    showNotification('تم تحديث الأحداث', 'success');
}

// Event Management Functions
function viewEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
        showNotification('الحدث غير موجود', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'viewEventModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تفاصيل الحدث</h3>
                <button type="button" class="modal-close" onclick="closeModal('viewEventModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="event-details">
                    <div class="detail-row">
                        <label>معرف الحدث:</label>
                        <span>${event.event_id}</span>
                    </div>
                    <div class="detail-row">
                        <label>العنوان:</label>
                        <span>${event.title}</span>
                    </div>
                    <div class="detail-row">
                        <label>المصدر:</label>
                        <span>${getSourceLabel(event.source)}</span>
                    </div>
                    <div class="detail-row">
                        <label>الخطورة:</label>
                        <span class="severity-badge severity-${event.severity}">${getSeverityLabel(event.severity)}</span>
                    </div>
                    <div class="detail-row">
                        <label>الفئة:</label>
                        <span>${event.category}</span>
                    </div>
                    <div class="detail-row">
                        <label>الحالة:</label>
                        <span class="status-badge status-${event.status}">${getStatusLabel(event.status)}</span>
                    </div>
                    <div class="detail-row">
                        <label>التاريخ والوقت:</label>
                        <span>${formatDate(event.timestamp)}</span>
                    </div>
                    <div class="detail-row">
                        <label>الوصف:</label>
                        <span>${event.description || 'لا يوجد وصف'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('viewEventModal')">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="editEvent(${eventId})">تعديل</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
        showNotification('الحدث غير موجود', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editEventModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل الحدث</h3>
                <button type="button" class="modal-close" onclick="closeModal('editEventModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="editEventForm">
                    <div class="form-group">
                        <label for="edit-title">العنوان:</label>
                        <input type="text" id="edit-title" name="title" value="${event.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-severity">الخطورة:</label>
                        <select id="edit-severity" name="severity" required>
                            <option value="critical" ${event.severity === 'critical' ? 'selected' : ''}>حرج</option>
                            <option value="high" ${event.severity === 'high' ? 'selected' : ''}>عالي</option>
                            <option value="medium" ${event.severity === 'medium' ? 'selected' : ''}>متوسط</option>
                            <option value="low" ${event.severity === 'low' ? 'selected' : ''}>منخفض</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-status">الحالة:</label>
                        <select id="edit-status" name="status" required>
                            <option value="open" ${event.status === 'open' ? 'selected' : ''}>مفتوح</option>
                            <option value="investigating" ${event.status === 'investigating' ? 'selected' : ''}>قيد التحقيق</option>
                            <option value="resolved" ${event.status === 'resolved' ? 'selected' : ''}>محلول</option>
                            <option value="false_positive" ${event.status === 'false_positive' ? 'selected' : ''}>إنذار كاذب</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-description">الوصف:</label>
                        <textarea id="edit-description" name="description" rows="4">${event.description || ''}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editEventModal')">إلغاء</button>
                <button type="button" class="btn btn-primary" onclick="saveEventEdit(${eventId})">حفظ التغييرات</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveEventEdit(eventId) {
    const form = document.getElementById('editEventForm');
    const formData = new FormData(form);

    const eventData = {
        status: formData.get('status'),
        assigned_to: formData.get('assigned_to') ? parseInt(formData.get('assigned_to')) : null
    };

    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error('Failed to update event');
        }

        showNotification('تم تحديث الحدث بنجاح', 'success');
        closeModal('editEventModal');

        // Reload events data from server
        await loadEventsData();
        updateEventsTable(eventsData);

    } catch (error) {
        console.error('Error updating event:', error);
        showNotification('فشل في تحديث الحدث', 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) {
        return;
    }

    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call to delete event
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'فشل في حذف الحدث');
        }

        showNotification('تم حذف الحدث بنجاح', 'success');

        // Reload events data from server
        await loadEventsData();

        // Also refresh dashboard if we're on dashboard section
        if (currentSection === 'dashboard') {
            await loadDashboardData();
        }

    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification(error.message || 'فشل في حذف الحدث', 'error');
    }
}

function toggleEventStatus(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (event) {
        event.status = event.status === 'open' ? 'investigating' : 'open';
        showNotification(`تم تغيير حالة الحدث إلى ${getStatusLabel(event.status)}`, 'success');
        updateEventsTable(eventsData);
    }
}

// Rules Functions
async function loadRulesData() {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch('/api/rules', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load rules');
        }

        rulesData = await response.json();

        // If no data from API, use fallback data
        if (rulesData.length === 0) {
            rulesData = [
                {
                    id: 1,
                    name: 'كشف فشل تسجيل الدخول المتكرر',
                    description: 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
                    condition_type: 'authentication',
                    condition_value: '{"failed_logins": 5}',
                    action_type: 'alert',
                    action_value: '{"type": "email"}',
                    is_active: 1,
                    created_by: 1
                },
                {
                    id: 2,
                    name: 'كشف فحص المنافذ',
                    description: 'كشف محاولات فحص المنافذ من عنوان واحد',
                    condition_type: 'network',
                    condition_value: '{"port_scan": 10}',
                    action_type: 'log',
                    action_value: '{"level": "warning"}',
                    is_active: 1,
                    created_by: 1
                },
                {
                    id: 3,
                    name: 'كشف هجوم DDoS',
                    description: 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
                    condition_type: 'network',
                    condition_value: '{"requests": 1000}',
                    action_type: 'escalate',
                    action_value: '{"level": "critical"}',
                    is_active: 1,
                    created_by: 1
                }
            ];
        }

        updateRulesGrid(rulesData);

    } catch (error) {
        console.error('Error loading rules:', error);
        showNotification('فشل في تحميل القواعد', 'error');

        // Fallback to sample data
        rulesData = [
            {
                id: 1,
                name: 'كشف فشل تسجيل الدخول المتكرر',
                description: 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
                condition_type: 'authentication',
                condition_value: '{"failed_logins": 5}',
                action_type: 'alert',
                action_value: '{"type": "email"}',
                is_active: 1,
                created_by: 1
            },
            {
                id: 2,
                name: 'كشف فحص المنافذ',
                description: 'كشف محاولات فحص المنافذ من عنوان واحد',
                condition_type: 'network',
                condition_value: '{"port_scan": 10}',
                action_type: 'log',
                action_value: '{"level": "warning"}',
                is_active: 1,
                created_by: 1
            },
            {
                id: 3,
                name: 'كشف هجوم DDoS',
                description: 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
                condition_type: 'network',
                condition_value: '{"requests": 1000}',
                action_type: 'escalate',
                action_value: '{"level": "critical"}',
                is_active: 1,
                created_by: 1
            }
        ];
        updateRulesGrid(rulesData);
    }
}

// Rule Management Functions
function viewRule(ruleId) {
    const rule = rulesData.find(r => r.id === ruleId);
    if (!rule) {
        showNotification('القاعدة غير موجودة', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'viewRuleModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تفاصيل القاعدة</h3>
                <button type="button" class="modal-close" onclick="closeModal('viewRuleModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="rule-details">
                    <div class="detail-row">
                        <label>اسم القاعدة:</label>
                        <span>${rule.name}</span>
                    </div>
                    <div class="detail-row">
                        <label>الوصف:</label>
                        <span>${rule.description}</span>
                    </div>
                    <div class="detail-row">
                        <label>الفئة:</label>
                        <span>${rule.condition_type || 'غير محدد'}</span>
                    </div>
                    <div class="detail-row">
                        <label>الخطورة:</label>
                        <span class="severity-badge severity-${rule.condition_type || 'medium'}">${getSeverityLabel(rule.condition_type || 'medium')}</span>
                    </div>
                    <div class="detail-row">
                        <label>الحالة:</label>
                        <span class="rule-status ${rule.is_active ? 'active' : 'inactive'}">
                            ${rule.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('viewRuleModal')">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="editRule(${ruleId})">تعديل</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editRule(ruleId) {
    const rule = rulesData.find(r => r.id === ruleId);
    if (!rule) {
        showNotification('القاعدة غير موجودة', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editRuleModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل القاعدة</h3>
                <button type="button" class="modal-close" onclick="closeModal('editRuleModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="editRuleForm">
                    <div class="form-group">
                        <label for="edit-rule-name">اسم القاعدة:</label>
                        <input type="text" id="edit-rule-name" name="name" value="${rule.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-rule-description">الوصف:</label>
                        <textarea id="edit-rule-description" name="description" rows="3" required>${rule.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-rule-category">الفئة:</label>
                        <select id="edit-rule-category" name="category" required>
                            <option value="authentication" ${rule.category === 'authentication' ? 'selected' : ''}>المصادقة</option>
                            <option value="network" ${rule.category === 'network' ? 'selected' : ''}>الشبكة</option>
                            <option value="malware" ${rule.category === 'malware' ? 'selected' : ''}>البرامج الضارة</option>
                            <option value="data" ${rule.category === 'data' ? 'selected' : ''}>البيانات</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-rule-severity">الخطورة:</label>
                        <select id="edit-rule-severity" name="severity" required>
                            <option value="critical" ${rule.severity === 'critical' ? 'selected' : ''}>حرج</option>
                            <option value="high" ${rule.severity === 'high' ? 'selected' : ''}>عالي</option>
                            <option value="medium" ${rule.severity === 'medium' ? 'selected' : ''}>متوسط</option>
                            <option value="low" ${rule.severity === 'low' ? 'selected' : ''}>منخفض</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-rule-active">الحالة:</label>
                        <select id="edit-rule-active" name="is_active" required>
                            <option value="true" ${rule.is_active ? 'selected' : ''}>نشط</option>
                            <option value="false" ${!rule.is_active ? 'selected' : ''}>غير نشط</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editRuleModal')">إلغاء</button>
                <button type="button" class="btn btn-primary" onclick="saveRuleEdit(${ruleId})">حفظ التغييرات</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveRuleEdit(ruleId) {
    const form = document.getElementById('editRuleForm');
    const formData = new FormData(form);

    const ruleData = {
        name: formData.get('name'),
        description: formData.get('description'),
        condition_type: formData.get('category'),
        condition_value: formData.get('severity'),
        action_type: 'alert',
        action_value: 'create_event',
        is_active: formData.get('is_active') === 'true'
    };

    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch(`/api/rules/${ruleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(ruleData)
        });

        if (!response.ok) {
            throw new Error('Failed to update rule');
        }

        showNotification('تم تحديث القاعدة بنجاح', 'success');
        closeModal('editRuleModal');

        // Reload rules data from server
        await loadRulesData();
        updateRulesGrid(rulesData);

    } catch (error) {
        console.error('Error updating rule:', error);
        showNotification('فشل في تحديث القاعدة', 'error');
    }
}

function deleteRule(ruleId) {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
        return;
    }

    const ruleIndex = rulesData.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
        rulesData.splice(ruleIndex, 1);
        showNotification('تم حذف القاعدة بنجاح', 'success');
        updateRulesGrid(rulesData);
    }
}

function toggleRule(ruleId) {
    const rule = rulesData.find(r => r.id === ruleId);
    if (rule) {
        rule.is_active = !rule.is_active;
        showNotification(`تم ${rule.is_active ? 'تفعيل' : 'إيقاف'} القاعدة`, 'success');
        updateRulesGrid(rulesData);
    }
}

// Functions are already defined in window scope above

async function loadSourcesData() {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch('/api/sources', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load sources');
        }

        sourcesData = await response.json();

        // If no data from API, use fallback data
        if (sourcesData.length === 0) {
            sourcesData = [
                {
                    id: 1,
                    name: 'Server-Web-01',
                    type: 'server',
                    endpoint: 'http://192.168.1.10:80',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 45,
                    description: 'خادم الويب الرئيسي'
                },
                {
                    id: 2,
                    name: 'IDS-01',
                    type: 'ids',
                    endpoint: 'https://192.168.1.2:443',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 23,
                    description: 'نظام كشف التسلل للشبكة'
                },
                {
                    id: 3,
                    name: 'Firewall-01',
                    type: 'firewall',
                    endpoint: 'https://192.168.1.1:443',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 67,
                    description: 'جدار الحماية الرئيسي للشبكة الداخلية'
                },
                {
                    id: 4,
                    name: 'Server-DB-01',
                    type: 'database',
                    endpoint: 'mysql://192.168.1.20:3306',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 12,
                    description: 'خادم قاعدة البيانات MySQL'
                },
                {
                    id: 5,
                    name: 'Mail-Server-01',
                    type: 'mail',
                    endpoint: 'smtp://192.168.1.30:25',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 8,
                    description: 'خادم البريد الإلكتروني'
                },
                {
                    id: 6,
                    name: 'Monitoring-System',
                    type: 'monitoring',
                    endpoint: 'http://192.168.1.40:8080',
                    is_active: 1,
                    last_sync: new Date().toISOString(),
                    events_count: 34,
                    description: 'نظام مراقبة الشبكة'
                }
            ];
        }

        updateSourcesGrid(sourcesData);

    } catch (error) {
        console.error('Error loading sources:', error);
        showNotification('فشل في تحميل مصادر البيانات', 'error');

        // Fallback to sample data
        sourcesData = [
            {
                id: 1,
                name: 'Server-Web-01',
                type: 'server',
                endpoint: 'http://192.168.1.10:80',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 45,
                description: 'خادم الويب الرئيسي'
            },
            {
                id: 2,
                name: 'IDS-01',
                type: 'ids',
                endpoint: 'https://192.168.1.2:443',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 23,
                description: 'نظام كشف التسلل للشبكة'
            },
            {
                id: 3,
                name: 'Firewall-01',
                type: 'firewall',
                endpoint: 'https://192.168.1.1:443',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 67,
                description: 'جدار الحماية الرئيسي للشبكة الداخلية'
            },
            {
                id: 4,
                name: 'Server-DB-01',
                type: 'database',
                endpoint: 'mysql://192.168.1.20:3306',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 12,
                description: 'خادم قاعدة البيانات MySQL'
            },
            {
                id: 5,
                name: 'Mail-Server-01',
                type: 'mail',
                endpoint: 'smtp://192.168.1.30:25',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 8,
                description: 'خادم البريد الإلكتروني'
            },
            {
                id: 6,
                name: 'Monitoring-System',
                type: 'monitoring',
                endpoint: 'http://192.168.1.40:8080',
                is_active: 1,
                last_sync: new Date().toISOString(),
                events_count: 34,
                description: 'نظام مراقبة الشبكة'
            }
        ];
        updateSourcesGrid(sourcesData);
    }
}

function updateSourcesGrid(sourcesData) {
    const sourcesContainer = document.getElementById('sources-grid');
    if (!sourcesContainer) return;

    sourcesContainer.innerHTML = '';

    if (sourcesData.length === 0) {
        sourcesContainer.innerHTML = '<p class="no-sources">لا توجد مصادر بيانات</p>';
        return;
    }

    sourcesData.forEach(source => {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'source-card';
        sourceCard.innerHTML = `
            <div class="source-header">
                <div class="source-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="source-info">
                    <h3 class="source-name">${source.name}</h3>
                    <p class="source-type">${getSourceTypeLabel(source.type)}</p>
                </div>
                <div class="source-status">
                    <span class="status-indicator status-${source.is_active ? 'active' : 'inactive'}"></span>
                    <span class="status-text">${source.is_active ? 'نشط' : 'غير نشط'}</span>
                </div>
            </div>
            <div class="source-details">
                <div class="detail-row">
                    <span class="detail-label">عنوان IP:</span>
                    <span class="detail-value">${extractIPFromEndpoint(source.endpoint)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">المنفذ:</span>
                    <span class="detail-value">${extractPortFromEndpoint(source.endpoint)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">آخر نشاط:</span>
                    <span class="detail-value">${source.last_sync ? formatTime(source.last_sync) : 'غير محدد'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">الحالة:</span>
                    <span class="detail-value">${source.is_active ? 'نشط' : 'غير نشط'}</span>
                </div>
            </div>
            <div class="source-description">
                <p>${source.endpoint || 'لا يوجد وصف'}</p>
            </div>
            <div class="source-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewSource(${source.id})">عرض</button>
                <button class="btn btn-sm btn-primary" onclick="editSource(${source.id})">تعديل</button>
                <button class="btn btn-sm btn-warning" onclick="testConnection(${source.id})">اختبار</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSource(${source.id})">حذف</button>
            </div>
        `;
        sourcesContainer.appendChild(sourceCard);
    });
}

function getSourceTypeLabel(type) {
    const labels = {
        firewall: 'جدار الحماية',
        ids: 'نظام كشف التسلل',
        server: 'خادم',
        database: 'قاعدة البيانات',
        mail: 'خادم البريد',
        monitoring: 'نظام المراقبة',
        backup: 'النسخ الاحتياطي',
        analytics: 'نظام التحليل'
    };
    return labels[type] || type;
}

function extractIPFromEndpoint(endpoint) {
    if (!endpoint) return 'غير محدد';
    const ipMatch = endpoint.match(/(\d+\.\d+\.\d+\.\d+)/);
    return ipMatch ? ipMatch[1] : 'غير محدد';
}

function extractPortFromEndpoint(endpoint) {
    if (!endpoint) return 'غير محدد';
    const portMatch = endpoint.match(/:(\d+)/);
    return portMatch ? portMatch[1] : 'غير محدد';
}

function getStatusText(status) {
    const texts = {
        active: 'نشط',
        warning: 'تحذير',
        inactive: 'غير نشط',
        error: 'خطأ'
    };
    return texts[status] || status;
}

function viewSource(sourceId) {
    const source = sourcesData.find(s => s.id === sourceId);
    if (!source) {
        showNotification('المصدر غير موجود', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'viewSourceModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تفاصيل المصدر</h3>
                <button type="button" class="modal-close" onclick="closeModal('viewSourceModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="source-details">
                    <div class="detail-row">
                        <label>اسم المصدر:</label>
                        <span>${source.name}</span>
                    </div>
                    <div class="detail-row">
                        <label>نوع المصدر:</label>
                        <span>${getSourceTypeLabel(source.type)}</span>
                    </div>
                    <div class="detail-row">
                        <label>عنوان IP:</label>
                        <span>${extractIPFromEndpoint(source.endpoint)}</span>
                    </div>
                    <div class="detail-row">
                        <label>المنفذ:</label>
                        <span>${extractPortFromEndpoint(source.endpoint)}</span>
                    </div>
                    <div class="detail-row">
                        <label>الحالة:</label>
                        <span class="status-indicator status-${source.is_active ? 'active' : 'inactive'}">${source.is_active ? 'نشط' : 'غير نشط'}</span>
                    </div>
                    <div class="detail-row">
                        <label>آخر نشاط:</label>
                        <span>${source.last_sync ? formatTime(source.last_sync) : 'غير محدد'}</span>
                    </div>
                    <div class="detail-row">
                        <label>عدد الأحداث:</label>
                        <span>${source.events_count || '0'}</span>
                    </div>
                    <div class="detail-row">
                        <label>الوصف:</label>
                        <span>${source.endpoint || 'لا يوجد وصف'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('viewSourceModal')">إغلاق</button>
                <button type="button" class="btn btn-primary" onclick="editSource(${sourceId})">تعديل</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editSource(sourceId) {
    const source = sourcesData.find(s => s.id === sourceId);
    if (!source) {
        showNotification('المصدر غير موجود', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editSourceModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل المصدر</h3>
                <button type="button" class="modal-close" onclick="closeModal('editSourceModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="editSourceForm">
                    <div class="form-group">
                        <label for="edit-source-name">اسم المصدر:</label>
                        <input type="text" id="edit-source-name" name="name" value="${source.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-source-type">نوع المصدر:</label>
                        <select id="edit-source-type" name="type" required>
                            <option value="firewall" ${source.type === 'firewall' ? 'selected' : ''}>جدار الحماية</option>
                            <option value="ids" ${source.type === 'ids' ? 'selected' : ''}>نظام كشف التسلل</option>
                            <option value="server" ${source.type === 'server' ? 'selected' : ''}>خادم</option>
                            <option value="database" ${source.type === 'database' ? 'selected' : ''}>قاعدة البيانات</option>
                            <option value="mail" ${source.type === 'mail' ? 'selected' : ''}>خادم البريد</option>
                            <option value="monitoring" ${source.type === 'monitoring' ? 'selected' : ''}>نظام المراقبة</option>
                            <option value="backup" ${source.type === 'backup' ? 'selected' : ''}>النسخ الاحتياطي</option>
                            <option value="analytics" ${source.type === 'analytics' ? 'selected' : ''}>نظام التحليل</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-source-ip">عنوان IP:</label>
                        <input type="text" id="edit-source-ip" name="ip_address" value="${source.ip_address}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-source-port">المنفذ:</label>
                        <input type="number" id="edit-source-port" name="port" value="${source.port}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-source-status">الحالة:</label>
                        <select id="edit-source-status" name="status" required>
                            <option value="active" ${source.status === 'active' ? 'selected' : ''}>نشط</option>
                            <option value="warning" ${source.status === 'warning' ? 'selected' : ''}>تحذير</option>
                            <option value="inactive" ${source.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                            <option value="error" ${source.status === 'error' ? 'selected' : ''}>خطأ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-source-description">الوصف:</label>
                        <textarea id="edit-source-description" name="description" rows="3">${source.description}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editSourceModal')">إلغاء</button>
                <button type="button" class="btn btn-primary" onclick="saveSourceEdit(${sourceId})">حفظ التغييرات</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveSourceEdit(sourceId) {
    const form = document.getElementById('editSourceForm');
    const formData = new FormData(form);

    const sourceData = {
        name: formData.get('name'),
        type: formData.get('type'),
        ip_address: formData.get('ip_address'),
        port: parseInt(formData.get('port')),
        status: formData.get('status'),
        description: formData.get('description')
    };

    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch(`/api/sources/${sourceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(sourceData)
        });

        if (!response.ok) {
            throw new Error('Failed to update source');
        }

        showNotification('تم تحديث المصدر بنجاح', 'success');
        closeModal('editSourceModal');

        // Reload sources data from server
        await loadSourcesData();
        updateSourcesGrid(sourcesData);

    } catch (error) {
        console.error('Error updating source:', error);
        showNotification('فشل في تحديث المصدر', 'error');
    }
}

function deleteSource(sourceId) {
    if (!confirm('هل أنت متأكد من حذف هذا المصدر؟')) {
        return;
    }

    const sourceIndex = sourcesData.findIndex(s => s.id === sourceId);
    if (sourceIndex !== -1) {
        sourcesData.splice(sourceIndex, 1);
        showNotification('تم حذف المصدر بنجاح', 'success');
        updateSourcesGrid(sourcesData);
    }
}

function testConnection(sourceId) {
    const source = sourcesData.find(s => s.id === sourceId);
    if (!source) {
        showNotification('المصدر غير موجود', 'error');
        return;
    }

    showNotification('جاري اختبار الاتصال...', 'info');

    // Simulate connection test
    setTimeout(() => {
        const isConnected = Math.random() > 0.3; // 70% success rate
        if (isConnected) {
            showNotification(`تم الاتصال بنجاح مع ${source.name}`, 'success');
            // Update last activity
            source.last_activity = new Date().toISOString();
            updateSourcesGrid(sourcesData);
        } else {
            showNotification(`فشل الاتصال مع ${source.name}`, 'error');
        }
    }, 2000);
}

function addDataSource() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addSourceModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>إضافة مصدر بيانات جديد</h3>
                <button type="button" class="modal-close" onclick="closeModal('addSourceModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="addSourceForm">
                    <div class="form-group">
                        <label for="add-source-name">اسم المصدر:</label>
                        <input type="text" id="add-source-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="add-source-type">نوع المصدر:</label>
                        <select id="add-source-type" name="type" required>
                            <option value="">اختر نوع المصدر</option>
                            <option value="firewall">جدار الحماية</option>
                            <option value="ids">نظام كشف التسلل</option>
                            <option value="server">خادم</option>
                            <option value="database">قاعدة البيانات</option>
                            <option value="mail">خادم البريد</option>
                            <option value="monitoring">نظام المراقبة</option>
                            <option value="backup">النسخ الاحتياطي</option>
                            <option value="analytics">نظام التحليل</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-source-ip">عنوان IP:</label>
                        <input type="text" id="add-source-ip" name="ip_address" placeholder="192.168.1.100" required>
                    </div>
                    <div class="form-group">
                        <label for="add-source-port">المنفذ:</label>
                        <input type="number" id="add-source-port" name="port" placeholder="80" required>
                    </div>
                    <div class="form-group">
                        <label for="add-source-description">الوصف:</label>
                        <textarea id="add-source-description" name="description" rows="3" placeholder="وصف المصدر..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('addSourceModal')">إلغاء</button>
                <button type="button" class="btn btn-primary" onclick="saveNewSource()">إضافة المصدر</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveNewSource() {
    const form = document.getElementById('addSourceForm');
    const formData = new FormData(form);

    const newSource = {
        id: sourcesData.length + 1,
        name: formData.get('name'),
        type: formData.get('type'),
        ip_address: formData.get('ip_address'),
        port: parseInt(formData.get('port')),
        status: 'active',
        last_activity: new Date().toISOString(),
        events_count: 0,
        description: formData.get('description')
    };

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add to local data
        sourcesData.push(newSource);

        showNotification('تم إضافة المصدر بنجاح', 'success');
        closeModal('addSourceModal');

        // Refresh sources grid
        updateSourcesGrid(sourcesData);

    } catch (error) {
        showNotification('فشل في إضافة المصدر', 'error');
    }
}

function refreshSources() {
    loadSourcesData();
    showNotification('تم تحديث مصادر البيانات', 'success');
}

function refreshAudit() {
    loadAuditData();
    showNotification('تم تحديث سجل التدقيق', 'success');
}

function exportAudit() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'exportAuditModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تصدير سجل التدقيق</h3>
                <button type="button" class="modal-close" onclick="closeModal('exportAuditModal')">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <h4>اختر صيغة التصدير:</h4>
                    <div class="export-buttons">
                        <button class="btn btn-primary" onclick="exportAuditFormat('json')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
                            </svg>
                            JSON
                        </button>
                        <button class="btn btn-secondary" onclick="exportAuditFormat('csv')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
                            </svg>
                            CSV
                        </button>
                        <button class="btn btn-warning" onclick="exportAuditFormat('xml')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
                            </svg>
                            XML
                        </button>
                        <button class="btn btn-info" onclick="exportAuditFormat('txt')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
                            </svg>
                            TXT
                        </button>
                    </div>
                </div>
                <div class="export-filters">
                    <h4>فلترة البيانات:</h4>
                    <div class="filter-group">
                        <label>من تاريخ:</label>
                        <input type="date" id="export-from-date" class="form-input">
                    </div>
                    <div class="filter-group">
                        <label>إلى تاريخ:</label>
                        <input type="date" id="export-to-date" class="form-input">
                    </div>
                    <div class="filter-group">
                        <label>نوع الإجراء:</label>
                        <select id="export-action-filter" class="form-select">
                            <option value="">الكل</option>
                            <option value="تسجيل دخول">تسجيل دخول</option>
                            <option value="إنشاء حدث أمني">إنشاء حدث أمني</option>
                            <option value="تعديل قاعدة">تعديل قاعدة</option>
                            <option value="إنشاء مستخدم">إنشاء مستخدم</option>
                            <option value="تغيير كلمة المرور">تغيير كلمة المرور</option>
                            <option value="حذف حدث">حذف حدث</option>
                            <option value="تفعيل قاعدة">تفعيل قاعدة</option>
                            <option value="تسجيل خروج">تسجيل خروج</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('exportAuditModal')">إلغاء</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function exportAuditFormat(format) {
    const fromDate = document.getElementById('export-from-date')?.value;
    const toDate = document.getElementById('export-to-date')?.value;
    const actionFilter = document.getElementById('export-action-filter')?.value;

    // Filter audit data
    let filteredData = auditData;

    if (fromDate) {
        filteredData = filteredData.filter(item => new Date(item.timestamp) >= new Date(fromDate));
    }

    if (toDate) {
        filteredData = filteredData.filter(item => new Date(item.timestamp) <= new Date(toDate));
    }

    if (actionFilter) {
        filteredData = filteredData.filter(item => item.action === actionFilter);
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
        case 'json':
            content = JSON.stringify(filteredData, null, 2);
            filename = `audit_log_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
            break;

        case 'csv':
            const csvHeaders = 'التاريخ والوقت,المستخدم,الإجراء,المورد,التفاصيل,عنوان IP,المتصفح\n';
            const csvRows = filteredData.map(item =>
                `"${formatDate(item.timestamp)}","${item.user}","${item.action}","${item.resource}","${item.details}","${item.ip_address}","${item.user_agent.split(' ')[0]}"`
            ).join('\n');
            content = csvHeaders + csvRows;
            filename = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
            break;

        case 'xml':
            content = `<?xml version="1.0" encoding="UTF-8"?>
<audit_log>
    <export_info>
        <export_date>${new Date().toISOString()}</export_date>
        <total_records>${filteredData.length}</total_records>
    </export_info>
    <records>
${filteredData.map(item => `        <record>
            <timestamp>${item.timestamp}</timestamp>
            <user>${item.user}</user>
            <action>${item.action}</action>
            <resource>${item.resource}</resource>
            <details>${item.details}</details>
            <ip_address>${item.ip_address}</ip_address>
            <user_agent>${item.user_agent}</user_agent>
        </record>`).join('\n')}
    </records>
</audit_log>`;
            filename = `audit_log_${new Date().toISOString().split('T')[0]}.xml`;
            mimeType = 'application/xml';
            break;

        case 'txt':
            content = `سجل التدقيق - SOCify
تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}
إجمالي السجلات: ${filteredData.length}

${filteredData.map((item, index) => `
${index + 1}. التاريخ: ${formatDate(item.timestamp)}
   المستخدم: ${item.user}
   الإجراء: ${item.action}
   المورد: ${item.resource}
   التفاصيل: ${item.details}
   عنوان IP: ${item.ip_address}
   المتصفح: ${item.user_agent.split(' ')[0]}
   ${'='.repeat(50)}`).join('')}`;
            filename = `audit_log_${new Date().toISOString().split('T')[0]}.txt`;
            mimeType = 'text/plain';
            break;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    closeModal('exportAuditModal');
    showNotification(`تم تصدير سجل التدقيق بصيغة ${format.toUpperCase()} بنجاح`, 'success');
}

async function loadAuditData() {
    try {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Make actual API call
        const response = await fetch('/api/audit?limit=100', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load audit logs');
        }

        auditData = await response.json();
        updateAuditTable(auditData);

    } catch (error) {
        console.error('Failed to load audit logs:', error);
        // Fallback to sample data - keep sample data for testing
        auditData = [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                user: 'أحمد المحلل',
                action: 'تسجيل دخول',
                resource: 'نظام SOCify',
                details: 'تسجيل دخول ناجح من IP: 192.168.1.100',
                ip_address: '192.168.1.100',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 300000).toISOString(),
                user: 'فاطمة الأمنية',
                action: 'إنشاء حدث أمني',
                resource: 'الأحداث الأمنية',
                details: 'تم إنشاء حدث جديد: EVT-DDOS001 - هجوم DDoS مكثف',
                ip_address: '192.168.1.101',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 600000).toISOString(),
                user: 'أحمد المحلل',
                action: 'تعديل قاعدة',
                resource: 'قواعد الكشف',
                details: 'تم تعديل قاعدة: كشف فشل تسجيل الدخول المتكرر',
                ip_address: '192.168.1.100',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 4,
                timestamp: new Date(Date.now() - 900000).toISOString(),
                user: 'مدير النظام',
                action: 'إنشاء مستخدم',
                resource: 'إدارة المستخدمين',
                details: 'تم إنشاء مستخدم جديد: analyst2@socify.com',
                ip_address: '192.168.1.102',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 5,
                timestamp: new Date(Date.now() - 1200000).toISOString(),
                user: 'فاطمة الأمنية',
                action: 'تغيير كلمة المرور',
                resource: 'الملف الشخصي',
                details: 'تم تغيير كلمة المرور بنجاح',
                ip_address: '192.168.1.101',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 6,
                timestamp: new Date(Date.now() - 1500000).toISOString(),
                user: 'أحمد المحلل',
                action: 'حذف حدث',
                resource: 'الأحداث الأمنية',
                details: 'تم حذف حدث: EVT-SCAN001 - فحص منافذ مشبوه',
                ip_address: '192.168.1.100',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 7,
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                user: 'مدير النظام',
                action: 'تفعيل قاعدة',
                resource: 'قواعد الكشف',
                details: 'تم تفعيل قاعدة: كشف هجوم DDoS',
                ip_address: '192.168.1.102',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 8,
                timestamp: new Date(Date.now() - 2100000).toISOString(),
                user: 'فاطمة الأمنية',
                action: 'تسجيل خروج',
                resource: 'نظام SOCify',
                details: 'تسجيل خروج من الجلسة',
                ip_address: '192.168.1.101',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        ];
        updateAuditTable(auditData);
    }
}

function updateAuditTable(auditData) {
    const tableBody = document.getElementById('audit-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (auditData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">لا توجد سجلات تدقيق</td>
            </tr>
        `;
        return;
    }

    auditData.forEach(audit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(audit.timestamp)}</td>
            <td>${audit.user}</td>
            <td><span class="action-badge action-${audit.action.toLowerCase().replace(/\s+/g, '-')}">${audit.action}</span></td>
            <td>${audit.resource}</td>
            <td>${audit.details}</td>
            <td>
                <div class="audit-details">
                    <div class="detail-item">
                        <span class="detail-label">IP:</span>
                        <span class="detail-value">${audit.ip_address}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">المتصفح:</span>
                        <span class="detail-value">${audit.user_agent.split(' ')[0]}</span>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
