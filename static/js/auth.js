// SOCify Authentication JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordValidation();
    }
});

async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showError('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        submitButton.textContent = 'جاري تسجيل الدخول...';
        submitButton.disabled = true;

        // Get CSRF token
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value ||
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            let errorMessage = 'خطأ في تسجيل الدخول';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // If response is not JSON, try to get text
                const text = await response.text();
                if (text.includes('CSRF')) {
                    errorMessage = 'خطأ في الأمان - يرجى إعادة تحميل الصفحة';
                }
            }
            showError(errorMessage);
            return;
        }

        const data = await response.json();

        if (data.message === 'Login successful') {
            showSuccess('تم تسجيل الدخول بنجاح');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showError(data.error || 'خطأ في تسجيل الدخول');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.message) {
            showError(error.message);
        } else {
            showError('خطأ في تسجيل الدخول. تحقق من البيانات المدخلة.');
        }
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    const team = formData.get('team');
    const terms = formData.get('terms');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    if (password !== confirmPassword) {
        showError('كلمات المرور غير متطابقة');
        return;
    }

    if (password.length < 8) {
        showError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
    }

    if (!terms) {
        showError('يجب الموافقة على شروط الاستخدام');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        submitButton.textContent = 'جاري إنشاء الحساب...';
        submitButton.disabled = true;

        // Get CSRF token
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value ||
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                name,
                email,
                password,
                team: team || ''
            })
        });

        if (!response.ok) {
            let errorMessage = 'خطأ في إنشاء الحساب';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // If response is not JSON, try to get text
                const text = await response.text();
                if (text.includes('CSRF')) {
                    errorMessage = 'خطأ في الأمان - يرجى إعادة تحميل الصفحة';
                }
            }
            showError(errorMessage);
            return;
        }

        const data = await response.json();

        if (data.message === 'Registration successful') {
            showSuccess('تم إنشاء الحساب بنجاح');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showError(data.error || 'خطأ في إنشاء الحساب');
        }
    } catch (error) {
        showError('خطأ في إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً بالفعل.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');

    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }
}

function validatePassword() {
    const password = this.value;
    const hint = document.querySelector('.form-hint');

    if (password.length > 0 && password.length < 8) {
        hint.style.color = '#F44336';
        hint.textContent = 'كلمة المرور قصيرة جداً (8 أحرف على الأقل)';
    } else if (password.length >= 8) {
        hint.style.color = '#4CAF50';
        hint.textContent = 'كلمة المرور قوية';
    } else {
        hint.style.color = '#B0BEC5';
        hint.textContent = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    }
}

function validatePasswordConfirmation() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#F44336';
        showFieldError(this, 'كلمات المرور غير متطابقة');
    } else if (confirmPassword && password === confirmPassword) {
        this.style.borderColor = '#4CAF50';
        hideFieldError(this);
    } else {
        this.style.borderColor = '#424242';
        hideFieldError(this);
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
    switch (type) {
        case 'success':
            return '<path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" fill="currentColor"/>';
        case 'error':
            return '<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>';
        case 'warning':
            return '<path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/>';
        default:
            return '<path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/>';
    }
}

function getNotificationIconColor(type) {
    switch (type) {
        case 'success':
            return 'color: #4CAF50;';
        case 'error':
            return 'color: #F44336;';
        case 'warning':
            return 'color: #FFC107;';
        default:
            return 'color: #2196F3;';
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showFieldError(field, message) {
    hideFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#F44336';
    errorDiv.style.fontSize = '0.75rem';
    errorDiv.style.marginTop = '0.25rem';

    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        background-color: #4CAF50;
    }
    
    .notification-error {
        background-color: #F44336;
    }
    
    .notification-warning {
        background-color: #FF9800;
    }
    
    .notification-info {
        background-color: #2196F3;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" fill="currentColor"/>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" fill="currentColor"/>
            </svg>
        `;
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById('confirm_password');
    const toggleButton = document.querySelectorAll('.password-toggle')[1];

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" fill="currentColor"/>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" fill="currentColor"/>
            </svg>
        `;
    }
}
