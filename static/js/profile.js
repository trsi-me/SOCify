// SOCify Profile Management JavaScript - Fixed Data Display

// Global variables
let userProfile = {};
let activityLog = [];

// Initialize profile page when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    initializeProfile();
    setupEventListeners();
    loadUserProfile();
    loadActivityLog();
});

// Initialize profile page
function initializeProfile() {
    console.log('SOCify Profile Management initialized');

    // Load sample data with actual values
    loadSampleProfile();
    loadSampleActivity();
}

// Setup event listeners
function setupEventListeners() {
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    // Avatar upload functionality
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarInput = document.getElementById('avatar-input');

    if (avatarUpload) {
        avatarUpload.addEventListener('click', () => {
            if (avatarInput) {
                avatarInput.click();
            }
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // Drag and drop for avatar - Removed
    const avatarCircle = document.querySelector('.avatar-circle');
    if (avatarCircle) {
        avatarCircle.addEventListener('click', () => {
            if (avatarInput) {
                avatarInput.click();
            }
        });
    }

    // Preferences
    const languageSelect = document.getElementById('language-select');
    const timezoneSelect = document.getElementById('timezone-select');
    const emailNotifications = document.getElementById('email-notifications');
    const darkMode = document.getElementById('dark-mode');

    if (languageSelect) {
        languageSelect.addEventListener('change', updateLanguage);
    }

    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', updateTimezone);
    }

    if (emailNotifications) {
        emailNotifications.addEventListener('change', updateEmailNotifications);
    }

    if (darkMode) {
        darkMode.addEventListener('change', updateDarkMode);
    }
}

// Load user profile data
function loadUserProfile() {
    // In a real implementation, this would fetch from the server
    console.log('Loading user profile...');
    displayUserProfile();
}

// Load sample profile data with actual values
function loadSampleProfile() {
    userProfile = {
        id: 1,
        name: 'أحمد المحلل الأمني',
        email: 'ahmed.analyst@socify.com',
        role: 'analyst',
        team: 'فريق الأمن السيبراني',
        bio: 'محلل أمن سيبراني متخصص في كشف التهديدات وتحليل الأحداث الأمنية',
        joinDate: '15 يناير 2024',
        lastLogin: 'اليوم 14:30',
        avatar: null,
        preferences: {
            language: 'ar',
            timezone: 'Asia/Riyadh',
            emailNotifications: true,
            darkMode: true
        }
    };
}

// Display user profile
function displayUserProfile() {
    // Update profile header
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileEmail = document.getElementById('profile-email');

    if (profileName) profileName.textContent = userProfile.name;
    if (profileRole) profileRole.textContent = getRoleName(userProfile.role);
    if (profileEmail) profileEmail.textContent = userProfile.email;

    // Update personal information section
    const fullName = document.getElementById('full-name');
    const email = document.getElementById('email');
    const team = document.getElementById('team');
    const permissions = document.getElementById('permissions');
    const joinDate = document.getElementById('join-date');
    const lastLogin = document.getElementById('last-login');

    if (fullName) fullName.textContent = userProfile.name;
    if (email) email.textContent = userProfile.email;
    if (team) team.textContent = userProfile.team;
    if (permissions) permissions.textContent = getRoleName(userProfile.role);
    if (joinDate) joinDate.textContent = userProfile.joinDate;
    if (lastLogin) lastLogin.textContent = userProfile.lastLogin;
}

// Load activity log
function loadActivityLog() {
    console.log('Loading activity log...');
    displayActivityLog();
}

// Load sample activity data
function loadSampleActivity() {
    activityLog = [
        {
            id: 1,
            type: 'login',
            title: 'تسجيل دخول ناجح',
            description: 'تم تسجيل الدخول من متصفح Chrome على Windows',
            timestamp: '2024-01-20 14:30:00',
            icon: 'login'
        },
        {
            id: 2,
            type: 'event',
            title: 'إنشاء حدث أمني',
            description: 'تم إنشاء حدث أمني جديد: محاولة تسجيل دخول مشبوهة',
            timestamp: '2024-01-20 13:45:00',
            icon: 'event'
        },
        {
            id: 3,
            type: 'rule',
            title: 'تعديل قاعدة',
            description: 'تم تعديل قاعدة كشف فشل تسجيل الدخول المتكرر',
            timestamp: '2024-01-20 12:15:00',
            icon: 'rule'
        },
        {
            id: 4,
            type: 'password',
            title: 'تغيير كلمة المرور',
            description: 'تم تغيير كلمة المرور بنجاح',
            timestamp: '2024-01-19 16:20:00',
            icon: 'password'
        },
        {
            id: 5,
            type: 'profile',
            title: 'تحديث الملف الشخصي',
            description: 'تم تحديث المعلومات الشخصية',
            timestamp: '2024-01-18 10:30:00',
            icon: 'profile'
        }
    ];
}

// Display activity log
function displayActivityLog() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    activityList.innerHTML = '';

    activityLog.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityList.appendChild(activityItem);
    });
}

// Create activity item element
function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';

    const iconSvg = getActivityIcon(activity.icon);

    item.innerHTML = `
        <div class="activity-icon">
            ${iconSvg}
        </div>
        <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-description">${activity.description}</div>
            <div class="activity-time">${formatActivityTime(activity.timestamp)}</div>
        </div>
    `;

    return item;
}

// Get activity icon SVG
function getActivityIcon(iconType) {
    const icons = {
        login: '<path d="M10,17V14H3V10H10V7L15,12L10,17M11,1A10,10 0 0,1 21,11A10,10 0 0,1 11,21A10,10 0 0,1 1,11A10,10 0 0,1 11,1Z" fill="currentColor"/>',
        event: '<path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" fill="currentColor"/>',
        rule: '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>',
        password: '<path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" fill="currentColor"/>',
        profile: '<path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" fill="currentColor"/>'
    };

    return `<svg viewBox="0 0 24 24" width="20" height="20">${icons[iconType] || icons.profile}</svg>`;
}

// Profile actions
function editProfile() {
    // Populate form with current data
    const editName = document.getElementById('edit-name');
    const editTeam = document.getElementById('edit-team');
    const editBio = document.getElementById('edit-bio');

    if (editName) editName.value = userProfile.name;
    if (editTeam) editTeam.value = userProfile.team;
    if (editBio) editBio.value = userProfile.bio || '';

    showModal('editProfileModal');
}

function editPersonalInfo() {
    editProfile();
}

function uploadAvatar() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            // In a real implementation, upload to server
            showNotification('تم رفع الصورة بنجاح', 'success');
        }
    };
    input.click();
}

function changePassword() {
    showModal('changePasswordModal');
}

function enable2FA() {
    showNotification('ميزة المصادقة الثنائية قيد التطوير', 'info');
}

function manageSessions() {
    showNotification('إدارة الجلسات قيد التطوير', 'info');
}

function refreshActivity() {
    loadActivityLog();
    showNotification('تم تحديث سجل النشاط', 'success');
}

// Handle form submissions
function handleEditProfile(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Update user profile
    userProfile.name = formData.get('name');
    userProfile.team = formData.get('team');
    userProfile.bio = formData.get('bio');

    // Update display
    displayUserProfile();

    // Close modal
    closeModal('editProfileModal');

    // Add to activity log
    addActivityLog('profile', 'تحديث الملف الشخصي', 'تم تحديث المعلومات الشخصية');

    showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
}

function handleChangePassword(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const currentPassword = formData.get('current_password');
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');

    // Validate passwords
    if (newPassword !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
        return;
    }

    // In a real implementation, validate current password and update
    closeModal('changePasswordModal');

    // Add to activity log
    addActivityLog('password', 'تغيير كلمة المرور', 'تم تغيير كلمة المرور بنجاح');

    showNotification('تم تغيير كلمة المرور بنجاح', 'success');
}

// Preference updates
function updateLanguage() {
    const language = document.getElementById('language-select').value;
    userProfile.preferences.language = language;
    showNotification('تم تحديث اللغة', 'success');
}

function updateTimezone() {
    const timezone = document.getElementById('timezone-select').value;
    userProfile.preferences.timezone = timezone;
    showNotification('تم تحديث المنطقة الزمنية', 'success');
}

function updateEmailNotifications() {
    const enabled = document.getElementById('email-notifications').checked;
    userProfile.preferences.emailNotifications = enabled;
    const status = enabled ? 'تم تفعيل' : 'تم إيقاف';
    showNotification(`${status} إشعارات البريد الإلكتروني`, 'success');
}

function updateDarkMode() {
    const enabled = document.getElementById('dark-mode').checked;
    userProfile.preferences.darkMode = enabled;
    const status = enabled ? 'تم تفعيل' : 'تم إيقاف';
    showNotification(`${status} الوضع المظلم`, 'success');
}

// Utility functions
function getRoleName(role) {
    const roles = {
        'analyst': 'محلل أمني',
        'soc_manager': 'مدير SOC',
        'admin': 'مدير النظام'
    };
    return roles[role] || role;
}

function formatActivityTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // Less than 1 minute
        return 'الآن';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `منذ ${minutes} دقيقة`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `منذ ${hours} ساعة`;
    } else {
        return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
    }
}

function addActivityLog(type, title, description) {
    const newActivity = {
        id: activityLog.length + 1,
        type: type,
        title: title,
        description: description,
        timestamp: new Date().toISOString(),
        icon: type
    };

    activityLog.unshift(newActivity);

    // Keep only last 50 activities
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(0, 50);
    }

    displayActivityLog();
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
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

// Avatar Upload Functions
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('يرجى اختيار ملف صورة صالح', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
        return;
    }

    // Show preview
    showAvatarPreview(file);

    // Upload file
    uploadAvatar(file);
}

function showAvatarPreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const avatarCircle = document.querySelector('.avatar-circle');
        if (avatarCircle) {
            avatarCircle.style.backgroundImage = `url(${e.target.result})`;
            avatarCircle.style.backgroundSize = 'cover';
            avatarCircle.style.backgroundPosition = 'center';
        }
    };
    reader.readAsDataURL(file);
}

function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('user_id', userProfile.id);

    // Show loading state
    showNotification('جاري رفع الصورة...', 'info');

    // Simulate upload (replace with actual API call)
    setTimeout(() => {
        // Update user profile
        userProfile.avatar = URL.createObjectURL(file);

        // Show success message
        showNotification('تم رفع الصورة بنجاح!', 'success');

        // Add to activity log
        addActivityLog('تم تحديث الصورة الشخصية', 'success');

        console.log('Avatar uploaded successfully:', file.name);
    }, 1500);
}

// Drag and Drop Functions - Removed

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function closeNotification(closeButton) {
    const notification = closeButton.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Export functions for global access
window.editProfile = editProfile;
window.editPersonalInfo = editPersonalInfo;
window.uploadAvatar = uploadAvatar;
window.changePassword = changePassword;
window.enable2FA = enable2FA;
window.manageSessions = manageSessions;
window.refreshActivity = refreshActivity;
window.closeModal = closeModal;
window.logout = logout;
window.handleAvatarUpload = handleAvatarUpload;
window.showNotification = showNotification;
window.closeNotification = closeNotification;
