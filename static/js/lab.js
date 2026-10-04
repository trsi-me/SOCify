// SOCify Lab JavaScript - Professional Implementation

// Global variables
let simulations = {
    sql: { running: false, interval: null },
    ddos: { running: false, interval: null },
    xss: { running: false, interval: null },
    brute: { running: false, interval: null },
    ssrf: { running: false, interval: null },
    dos: { running: false, interval: null },
    phishing: { running: false, interval: null },
    mitm: { running: false, interval: null },
    csrf: { running: false, interval: null },
    dirTraversal: { running: false, interval: null },
    cmdInjection: { running: false, interval: null }
};

// Initialize lab when page loads
document.addEventListener('DOMContentLoaded', function () {
    initializeLab();
    addLogEntry('تم تحميل مختبر المحاكاة الأمنية بنجاح');
});

// Initialize lab components
function initializeLab() {
    setupSimulationCards();
    updateAllMetrics();
    setupRealTimeMonitoring();
    updateStatistics();
}

// Setup simulation cards
function setupSimulationCards() {
    const cards = document.querySelectorAll('.simulation-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Setup real-time monitoring
function setupRealTimeMonitoring() {
    setInterval(updateAllMetrics, 1000);
    setInterval(addRandomLogEntry, 5000);
}

// Add log entry
function addLogEntry(message, createEvent = false, eventData = null) {
    const log = document.getElementById('eventLog');
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${timestamp}] ${message}`;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;

    totalEvents++;
    updateStatistics();

    // Create event in main system if requested
    if (createEvent && eventData) {
        createLabEvent(eventData);
    }

    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}

// Create event from lab simulation
async function createLabEvent(eventData) {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const response = await fetch('/api/lab/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to create lab event:', errorData);
            return;
        }

        const result = await response.json();
        console.log('Lab event created:', result.event_id);
        
        // Refresh dashboard if it's open
        if (typeof refreshDashboard === 'function') {
            refreshDashboard();
        }
    } catch (error) {
        console.error('Error creating lab event:', error);
    }
}

// Add random log entry for demonstration
function addRandomLogEntry() {
    const messages = [
        'تم رصد نشاط مشبوه في الشبكة',
        'تم تحديث قاعدة كشف التسلل',
        'تم إرسال تنبيه أمني',
        'تم فحص الثغرات الأمنية',
        'تم تحديث نظام المراقبة'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    addLogEntry(randomMessage);
}

// Clear log
function clearLog() {
    const log = document.getElementById('eventLog');
    log.innerHTML = '';
    addLogEntry('تم مسح سجل الأحداث');
}

// Update all metrics
function updateAllMetrics() {
    updateSQLMetrics();
    updateDDoSMetrics();
    updateXSSMetrics();
    updateBruteMetrics();
    updateSSRFMetrics();
    updateDoSMetrics();
}

// SQL Injection Attack Functions
function startSQLAttack() {
    if (simulations.sql.running) return;

    simulations.sql.running = true;
    const card = document.getElementById('sqlCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic SQL injection simulation
    simulations.sql.interval = setInterval(() => {
        updateSQLMetrics();
    }, 2000); // Slower, more realistic timing

    const dbType = document.getElementById('sqlDbType').value;
    const attackType = document.getElementById('sqlAttackType').value;
    const target = document.getElementById('sqlTarget').value;

    addLogEntry(`بدء هجوم حقن SQL - نوع قاعدة البيانات: ${dbType}, نوع الهجوم: ${attackType}`);
    addLogEntry(`الهدف: ${target}`);
    addLogEntry('جاري فحص الثغرات المحتملة...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'SQL Injection',
        title: `محاولة حقن SQL - ${attackType}`,
        description: `تم رصد محاولة حقن SQL من نوع ${attackType} على ${target} (نوع قاعدة البيانات: ${dbType})`,
        raw_data: JSON.stringify({ dbType, attackType, target, timestamp: new Date().toISOString() })
    });
}

function stopSQLAttack() {
    if (!simulations.sql.running) return;

    simulations.sql.running = false;
    const card = document.getElementById('sqlCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.sql.interval);
    addLogEntry('تم إيقاف هجوم حقن SQL');
}

function updateSQLMetrics() {
    if (!simulations.sql.running) return;

    const queriesElement = document.getElementById('sqlQueries');
    const dataElement = document.getElementById('sqlData');

    let queries = parseInt(queriesElement.textContent) || 0;
    let data = parseInt(dataElement.textContent) || 0;

    // Realistic SQL injection progression
    const attackType = document.getElementById('sqlAttackType').value;
    const dbType = document.getElementById('sqlDbType').value;

    // Different attack patterns based on type
    if (attackType === 'union') {
        queries += Math.floor(Math.random() * 2) + 1; // Slower for UNION
        if (Math.random() < 0.3) {
            data += Math.floor(Math.random() * 3) + 1;
            addLogEntry(`تم استخراج ${Math.floor(Math.random() * 3) + 1} سجل من قاعدة البيانات`);
        }
    } else if (attackType === 'boolean') {
        queries += Math.floor(Math.random() * 4) + 2; // Faster for Boolean
        if (Math.random() < 0.2) {
            data += Math.floor(Math.random() * 2) + 1;
            addLogEntry('تم اكتشاف بنية قاعدة البيانات');
        }
    } else if (attackType === 'time') {
        queries += Math.floor(Math.random() * 3) + 1; // Medium speed for Time-based
        if (Math.random() < 0.15) {
            data += Math.floor(Math.random() * 4) + 2;
            addLogEntry('تم تأكيد وجود الثغرة عبر Time-based injection');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --"
        ];
        const payload = payloads[Math.floor(Math.random() * payloads.length)];
        addLogEntry(`إرسال payload: ${payload}`);
    }

    queriesElement.textContent = queries;
    dataElement.textContent = data;
}

// DDoS Attack Functions
function startDDoSAttack() {
    if (simulations.ddos.running) return;

    simulations.ddos.running = true;
    const card = document.getElementById('ddosCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic DDoS simulation
    simulations.ddos.interval = setInterval(() => {
        updateDDoSMetrics();
    }, 1000); // More realistic timing

    const attackers = document.getElementById('ddosAttackers').value;
    const rate = document.getElementById('ddosRate').value;
    const target = document.getElementById('ddosTarget').value;

    addLogEntry(`بدء هجوم DDoS - عدد المهاجمين: ${attackers}, معدل الطلبات: ${rate}/ثانية`);
    addLogEntry(`الهدف: ${target}`);
    addLogEntry('جاري تجنيد البوتات...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'critical',
        category: 'DDoS Attack',
        title: `هجوم DDoS محاكى - ${target}`,
        description: `تم رصد هجوم DDoS محاكى من ${attackers} مهاجم بمعدل ${rate} طلب/ثانية على ${target}`,
        raw_data: JSON.stringify({ attackers, rate, target, timestamp: new Date().toISOString() })
    });
}

function stopDDoSAttack() {
    if (!simulations.ddos.running) return;

    simulations.ddos.running = false;
    const card = document.getElementById('ddosCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.ddos.interval);
    addLogEntry('تم إيقاف هجوم DDoS');
}

function updateDDoSMetrics() {
    if (!simulations.ddos.running) return;

    const requestsElement = document.getElementById('ddosRequests');
    const responseElement = document.getElementById('ddosResponse');

    let requests = parseInt(requestsElement.textContent) || 0;
    const attackers = parseInt(document.getElementById('ddosAttackers').value) || 100;
    const rate = parseInt(document.getElementById('ddosRate').value) || 1000;

    // Realistic DDoS progression
    const requestsPerSecond = Math.floor((attackers * rate) / 1000); // Scale down for simulation
    requests += Math.floor(Math.random() * requestsPerSecond) + Math.floor(requestsPerSecond / 2);

    // Response time increases as attack progresses
    const baseResponseTime = 100;
    const maxResponseTime = 10000;
    const responseTimeIncrease = Math.min(requests / 100, 50); // Gradual increase
    const responseTime = baseResponseTime + (responseTimeIncrease * 200) + Math.floor(Math.random() * 1000);

    // Add realistic log messages
    if (Math.random() < 0.15) {
        const messages = [
            `تم إرسال ${Math.floor(Math.random() * 50) + 10} طلب من البوت ${Math.floor(Math.random() * attackers) + 1}`,
            'تم اكتشاف محاولة حجب الخدمة',
            'الخادم يظهر علامات الإجهاد',
            'تم تفعيل نظام الحماية من DDoS'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    requestsElement.textContent = requests;
    responseElement.textContent = Math.min(responseTime, maxResponseTime) + 'ms';
}

// XSS Attack Functions
function startXSSAttack() {
    if (simulations.xss.running) return;

    simulations.xss.running = true;
    const card = document.getElementById('xssCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic XSS simulation
    simulations.xss.interval = setInterval(() => {
        updateXSSMetrics();
    }, 1500); // More realistic timing

    const xssType = document.getElementById('xssType').value;
    const payload = document.getElementById('xssPayload').value;
    const target = document.getElementById('xssTarget').value;

    addLogEntry(`بدء هجوم XSS - النوع: ${xssType}, الهدف: ${target}`);
    addLogEntry(`Payload: ${payload}`);
    addLogEntry('جاري فحص نقاط الضعف...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'XSS Attack',
        title: `هجوم XSS محاكى - ${xssType}`,
        description: `تم رصد محاولة هجوم XSS من نوع ${xssType} على ${target}`,
        raw_data: JSON.stringify({ xssType, payload, target, timestamp: new Date().toISOString() })
    });
}

function stopXSSAttack() {
    if (!simulations.xss.running) return;

    simulations.xss.running = false;
    const card = document.getElementById('xssCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.xss.interval);
    addLogEntry('تم إيقاف هجوم XSS');
}

function updateXSSMetrics() {
    if (!simulations.xss.running) return;

    const requestsElement = document.getElementById('xssRequests');
    const victimsElement = document.getElementById('xssVictims');

    let requests = parseInt(requestsElement.textContent) || 0;
    let victims = parseInt(victimsElement.textContent) || 0;

    const xssType = document.getElementById('xssType').value;

    // Different behavior based on XSS type
    if (xssType === 'reflected') {
        requests += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.2) {
            victims += 1;
            addLogEntry('تم تنفيذ Reflected XSS بنجاح');
        }
    } else if (xssType === 'stored') {
        requests += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.3) {
            victims += Math.floor(Math.random() * 3) + 1;
            addLogEntry('تم تخزين XSS payload في قاعدة البيانات');
        }
    } else if (xssType === 'dom') {
        requests += Math.floor(Math.random() * 4) + 2;
        if (Math.random() < 0.15) {
            victims += 1;
            addLogEntry('تم تنفيذ DOM-based XSS');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.12) {
        const messages = [
            'تم اكتشاف ثغرة XSS في حقل البحث',
            'تم تنفيذ JavaScript في المتصفح',
            'تم سرقة session cookie',
            'تم إرسال بيانات حساسة إلى الخادم المهاجم'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    requestsElement.textContent = requests;
    victimsElement.textContent = victims;
}

// Brute Force Attack Functions
function startBruteAttack() {
    if (simulations.brute.running) return;

    simulations.brute.running = true;
    const card = document.getElementById('bruteCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic brute force simulation
    simulations.brute.interval = setInterval(() => {
        updateBruteMetrics();
    }, 800); // More realistic timing

    const username = document.getElementById('bruteUsername').value;
    const passwordList = document.getElementById('brutePasswordList').value;
    const rate = document.getElementById('bruteRate').value;

    addLogEntry(`بدء هجوم القوة الغاشمة - المستخدم: ${username}, قائمة كلمات المرور: ${passwordList}`);
    addLogEntry(`معدل المحاولات: ${rate}/ثانية`);
    addLogEntry('جاري تحميل قائمة كلمات المرور...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'Brute Force',
        title: `هجوم القوة الغاشمة محاكى - ${username}`,
        description: `تم رصد محاولة هجوم القوة الغاشمة على حساب ${username} باستخدام قائمة ${passwordList} بمعدل ${rate} محاولة/ثانية`,
        raw_data: JSON.stringify({ username, passwordList, rate, timestamp: new Date().toISOString() })
    });
}

function stopBruteAttack() {
    if (!simulations.brute.running) return;

    simulations.brute.running = false;
    const card = document.getElementById('bruteCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.brute.interval);
    addLogEntry('تم إيقاف هجوم القوة الغاشمة');
}

function updateBruteMetrics() {
    if (!simulations.brute.running) return;

    const attemptsElement = document.getElementById('bruteAttempts');
    const currentElement = document.getElementById('bruteCurrent');

    let attempts = parseInt(attemptsElement.textContent) || 0;
    const rate = parseInt(document.getElementById('bruteRate').value) || 10;
    const passwordList = document.getElementById('brutePasswordList').value;

    // Different password lists based on selection
    let passwords = [];
    if (passwordList === 'common') {
        passwords = ['password', '123456', 'admin', 'qwerty', 'letmein', 'welcome', 'monkey', 'dragon', 'password123', '123456789'];
    } else if (passwordList === 'dictionary') {
        passwords = ['password', 'admin', 'root', 'user', 'test', 'guest', 'demo', 'sample', 'default', 'login'];
    } else {
        passwords = ['admin123', 'password1', '12345', 'abc123', 'qwerty123', 'letmein123', 'welcome123'];
    }

    // Realistic brute force progression
    const attemptsPerInterval = Math.floor(Math.random() * Math.floor(rate / 2)) + 1;
    attempts += attemptsPerInterval;

    const currentPassword = passwords[attempts % passwords.length];

    // Add realistic log messages
    if (Math.random() < 0.2) {
        const messages = [
            `محاولة تسجيل دخول فاشلة للمستخدم: ${document.getElementById('bruteUsername').value}`,
            `تم اكتشاف محاولة تسجيل دخول مشبوهة`,
            `تم حظر IP مؤقتاً بسبب محاولات متكررة`,
            `تم تفعيل نظام الحماية من Brute Force`
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    // Simulate account lockout after many attempts
    if (attempts > 50 && Math.random() < 0.1) {
        addLogEntry('تم قفل الحساب بسبب محاولات متكررة');
    }

    attemptsElement.textContent = attempts;
    currentElement.textContent = currentPassword;
}

// SSRF Attack Functions
function startSSRFAttack() {
    if (simulations.ssrf.running) return;

    simulations.ssrf.running = true;
    const card = document.getElementById('ssrfCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic SSRF simulation
    simulations.ssrf.interval = setInterval(() => {
        updateSSRFMetrics();
    }, 1200); // More realistic timing

    const ssrfType = document.getElementById('ssrfType').value;
    const internalTarget = document.getElementById('ssrfInternal').value;
    const externalTarget = document.getElementById('ssrfExternal').value;

    addLogEntry(`بدء هجوم SSRF - النوع: ${ssrfType}`);
    addLogEntry(`الهدف الداخلي: ${internalTarget}`);
    addLogEntry(`الهدف الخارجي: ${externalTarget}`);
    addLogEntry('جاري فحص الشبكة الداخلية...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'SSRF Attack',
        title: `هجوم SSRF محاكى - ${ssrfType}`,
        description: `تم رصد محاولة هجوم SSRF من نوع ${ssrfType} - الهدف الداخلي: ${internalTarget}, الهدف الخارجي: ${externalTarget}`,
        raw_data: JSON.stringify({ ssrfType, internalTarget, externalTarget, timestamp: new Date().toISOString() })
    });
}

function stopSSRFAttack() {
    if (!simulations.ssrf.running) return;

    simulations.ssrf.running = false;
    const card = document.getElementById('ssrfCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.ssrf.interval);
    addLogEntry('تم إيقاف هجوم SSRF');
}

function updateSSRFMetrics() {
    if (!simulations.ssrf.running) return;

    const requestsElement = document.getElementById('ssrfRequests');
    const dataElement = document.getElementById('ssrfData');

    let requests = parseInt(requestsElement.textContent) || 0;
    let data = parseInt(dataElement.textContent) || 0;

    const ssrfType = document.getElementById('ssrfType').value;

    // Different behavior based on SSRF type
    if (ssrfType === 'internal') {
        requests += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.25) {
            data += Math.floor(Math.random() * 200) + 50;
            addLogEntry('تم الوصول إلى خدمة داخلية');
        }
    } else if (ssrfType === 'external') {
        requests += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.2) {
            data += Math.floor(Math.random() * 500) + 100;
            addLogEntry('تم إرسال بيانات إلى خادم خارجي');
        }
    } else if (ssrfType === 'blind') {
        requests += Math.floor(Math.random() * 4) + 2;
        if (Math.random() < 0.15) {
            data += Math.floor(Math.random() * 100) + 25;
            addLogEntry('تم اكتشاف Blind SSRF');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.18) {
        const messages = [
            'تم الوصول إلى ملفات النظام الداخلية',
            'تم اكتشاف خدمة Redis غير محمية',
            'تم الوصول إلى قاعدة البيانات الداخلية',
            'تم إرسال بيانات حساسة إلى خادم مهاجم',
            'تم اكتشاف خدمة Elasticsearch مكشوفة'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    requestsElement.textContent = requests;
    dataElement.textContent = data + ' bytes';
}

// DoS Attack Functions
function startDoSAttack() {
    if (simulations.dos.running) return;

    simulations.dos.running = true;
    const card = document.getElementById('dosCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic DoS simulation
    simulations.dos.interval = setInterval(() => {
        updateDoSMetrics();
    }, 600); // More realistic timing

    const dosType = document.getElementById('dosType').value;
    const rate = document.getElementById('dosRate').value;
    const size = document.getElementById('dosSize').value;

    addLogEntry(`بدء هجوم DoS - النوع: ${dosType}, معدل الحزم: ${rate}/ثانية`);
    addLogEntry(`حجم الحزمة: ${size} bytes`);
    addLogEntry('جاري إرسال حزم البيانات...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'critical',
        category: 'DoS Attack',
        title: `هجوم DoS محاكى - ${dosType}`,
        description: `تم رصد هجوم DoS محاكى من نوع ${dosType} بمعدل ${rate} حزمة/ثانية بحجم ${size} bytes`,
        raw_data: JSON.stringify({ dosType, rate, size, timestamp: new Date().toISOString() })
    });
}

function stopDoSAttack() {
    if (!simulations.dos.running) return;

    simulations.dos.running = false;
    const card = document.getElementById('dosCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.dos.interval);
    addLogEntry('تم إيقاف هجوم DoS');
}

function updateDoSMetrics() {
    if (!simulations.dos.running) return;

    const packetsElement = document.getElementById('dosPackets');
    const bandwidthElement = document.getElementById('dosBandwidth');

    let packets = parseInt(packetsElement.textContent) || 0;
    let bandwidth = parseInt(bandwidthElement.textContent) || 0;

    const dosType = document.getElementById('dosType').value;
    const rate = parseInt(document.getElementById('dosRate').value) || 1000;
    const size = parseInt(document.getElementById('dosSize').value) || 1024;

    // Different behavior based on DoS type
    if (dosType === 'syn') {
        packets += Math.floor(Math.random() * 50) + 25; // SYN flood
        bandwidth += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.2) {
            addLogEntry('تم إرسال SYN packets لاستنزاف اتصالات الخادم');
        }
    } else if (dosType === 'udp') {
        packets += Math.floor(Math.random() * 100) + 50; // UDP flood
        bandwidth += Math.floor(Math.random() * 5) + 2;
        if (Math.random() < 0.15) {
            addLogEntry('تم إرسال UDP packets لاستنزاف عرض النطاق');
        }
    } else if (dosType === 'http') {
        packets += Math.floor(Math.random() * 30) + 15; // HTTP flood
        bandwidth += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.25) {
            addLogEntry('تم إرسال HTTP requests لاستنزاف موارد الخادم');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.12) {
        const messages = [
            'تم اكتشاف محاولة حجب الخدمة',
            'الخادم يظهر علامات الإجهاد',
            'تم تفعيل نظام الحماية من DoS',
            'تم حظر IP المشبوه مؤقتاً',
            'تم إعادة توجيه حركة المرور إلى خادم احتياطي'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    packetsElement.textContent = packets;
    bandwidthElement.textContent = bandwidth + ' Mbps';
}

// Statistics tracking
let totalEvents = 0;

function updateStatistics() {
    const activeSimulations = Object.values(simulations).filter(sim => sim.running).length;
    document.getElementById('totalSimulations').textContent = activeSimulations;
    document.getElementById('totalEvents').textContent = totalEvents;
}

// Phishing Attack Functions
function startPhishingAttack() {
    if (simulations.phishing.running) return;

    simulations.phishing.running = true;
    const card = document.getElementById('phishingCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic phishing simulation
    simulations.phishing.interval = setInterval(() => {
        updatePhishingMetrics();
    }, 1500);

    const phishingType = document.getElementById('phishingType').value;
    const targets = document.getElementById('phishingTargets').value;
    const template = document.getElementById('phishingTemplate').value;

    addLogEntry(`بدء حملة التصيد الاحتيالي - النوع: ${phishingType}, الأهداف: ${targets}`);
    addLogEntry(`قالب الرسالة: ${template}`);
    addLogEntry('جاري إرسال الرسائل المزيفة...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'medium',
        category: 'Phishing Attack',
        title: `حملة تصيد احتيالي محاكاة - ${phishingType}`,
        description: `تم رصد حملة تصيد احتيالي محاكاة من نوع ${phishingType} تستهدف ${targets} مستخدم`,
        raw_data: JSON.stringify({ phishingType, targets, template, timestamp: new Date().toISOString() })
    });
}

function stopPhishingAttack() {
    if (!simulations.phishing.running) return;

    simulations.phishing.running = false;
    const card = document.getElementById('phishingCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.phishing.interval);
    addLogEntry('تم إيقاف حملة التصيد الاحتيالي');
}

function updatePhishingMetrics() {
    if (!simulations.phishing.running) return;

    const sentElement = document.getElementById('phishingSent');
    const clickedElement = document.getElementById('phishingClicked');

    let sent = parseInt(sentElement.textContent) || 0;
    let clicked = parseInt(clickedElement.textContent) || 0;

    const phishingType = document.getElementById('phishingType').value;
    const template = document.getElementById('phishingTemplate').value;

    // Different phishing patterns
    if (phishingType === 'email') {
        sent += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.15) {
            clicked += 1;
            addLogEntry('تم النقر على رابط التصيد من رسالة بريد إلكتروني');
        }
    } else if (phishingType === 'sms') {
        sent += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.25) {
            clicked += 1;
            addLogEntry('تم النقر على رابط التصيد من رسالة نصية');
        }
    } else if (phishingType === 'social') {
        sent += Math.floor(Math.random() * 4) + 2;
        if (Math.random() < 0.1) {
            clicked += 1;
            addLogEntry('تم النقر على رابط التصيد من وسائل التواصل');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const messages = [
            'تم إرسال رسالة تصيد جديدة',
            'تم اكتشاف محاولة تصيد من قبل المستخدم',
            'تم حظر عنوان IP مشبوه',
            'تم إرسال تنبيه أمني للمستخدم'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    sentElement.textContent = sent;
    clickedElement.textContent = clicked;
}

// MITM Attack Functions
function startMITMAttack() {
    if (simulations.mitm.running) return;

    simulations.mitm.running = true;
    const card = document.getElementById('mitmCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic MITM simulation
    simulations.mitm.interval = setInterval(() => {
        updateMITMMetrics();
    }, 800);

    const protocol = document.getElementById('mitmProtocol').value;
    const target = document.getElementById('mitmTarget').value;
    const duration = document.getElementById('mitmDuration').value;

    addLogEntry(`بدء هجوم MITM - البروتوكول: ${protocol}, الهدف: ${target}`);
    addLogEntry(`مدة الهجوم: ${duration} دقيقة`);
    addLogEntry('جاري اعتراض الاتصالات...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'MITM Attack',
        title: `هجوم MITM محاكى - ${protocol}`,
        description: `تم رصد هجوم MITM محاكى على بروتوكول ${protocol} يستهدف ${target}`,
        raw_data: JSON.stringify({ protocol, target, duration, timestamp: new Date().toISOString() })
    });
}

function stopMITMAttack() {
    if (!simulations.mitm.running) return;

    simulations.mitm.running = false;
    const card = document.getElementById('mitmCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.mitm.interval);
    addLogEntry('تم إيقاف هجوم MITM');
}

function updateMITMMetrics() {
    if (!simulations.mitm.running) return;

    const packetsElement = document.getElementById('mitmPackets');
    const dataElement = document.getElementById('mitmData');

    let packets = parseInt(packetsElement.textContent) || 0;
    let data = parseInt(dataElement.textContent) || 0;

    const protocol = document.getElementById('mitmProtocol').value;

    // Different MITM patterns based on protocol
    if (protocol === 'http') {
        packets += Math.floor(Math.random() * 5) + 3;
        if (Math.random() < 0.3) {
            data += Math.floor(Math.random() * 2) + 1;
            addLogEntry('تم اعتراض بيانات HTTP');
        }
    } else if (protocol === 'https') {
        packets += Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.1) {
            data += Math.floor(Math.random() * 1) + 1;
            addLogEntry('تم اعتراض بيانات HTTPS (مشفرة)');
        }
    } else if (protocol === 'ftp') {
        packets += Math.floor(Math.random() * 4) + 2;
        if (Math.random() < 0.2) {
            data += Math.floor(Math.random() * 3) + 1;
            addLogEntry('تم اعتراض بيانات FTP');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const messages = [
            'تم اكتشاف محاولة MITM',
            'تم تفعيل الحماية من MITM',
            'تم إعادة توجيه الاتصال',
            'تم تشفير الاتصال'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    packetsElement.textContent = packets;
    dataElement.textContent = data;
}

// CSRF Attack Functions
function startCSRFAttack() {
    if (simulations.csrf.running) return;

    simulations.csrf.running = true;
    const card = document.getElementById('csrfCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic CSRF simulation
    simulations.csrf.interval = setInterval(() => {
        updateCSRFMetrics();
    }, 2000);

    const method = document.getElementById('csrfMethod').value;
    const action = document.getElementById('csrfAction').value;
    const target = document.getElementById('csrfTarget').value;

    addLogEntry(`بدء هجوم CSRF - الطريقة: ${method}, الإجراء: ${action}`);
    addLogEntry(`الهدف: ${target}`);
    addLogEntry('جاري إرسال طلبات CSRF...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'high',
        category: 'CSRF Attack',
        title: `هجوم CSRF محاكى - ${method}`,
        description: `تم رصد هجوم CSRF محاكى باستخدام طريقة ${method} لتنفيذ إجراء ${action} على ${target}`,
        raw_data: JSON.stringify({ method, action, target, timestamp: new Date().toISOString() })
    });
}

function stopCSRFAttack() {
    if (!simulations.csrf.running) return;

    simulations.csrf.running = false;
    const card = document.getElementById('csrfCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.csrf.interval);
    addLogEntry('تم إيقاف هجوم CSRF');
}

function updateCSRFMetrics() {
    if (!simulations.csrf.running) return;

    const requestsElement = document.getElementById('csrfRequests');
    const successElement = document.getElementById('csrfSuccess');

    let requests = parseInt(requestsElement.textContent) || 0;
    let success = parseInt(successElement.textContent) || 0;

    const method = document.getElementById('csrfMethod').value;
    const action = document.getElementById('csrfAction').value;

    // Different CSRF patterns
    if (method === 'post') {
        requests += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.2) {
            success += 1;
            addLogEntry(`تم تنفيذ إجراء ${action} بنجاح عبر CSRF`);
        }
    } else if (method === 'get') {
        requests += Math.floor(Math.random() * 3) + 2;
        if (Math.random() < 0.15) {
            success += 1;
            addLogEntry(`تم تنفيذ إجراء ${action} عبر GET request`);
        }
    } else if (method === 'put') {
        requests += Math.floor(Math.random() * 1) + 1;
        if (Math.random() < 0.1) {
            success += 1;
            addLogEntry(`تم تنفيذ إجراء ${action} عبر PUT request`);
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const messages = [
            'تم اكتشاف محاولة CSRF',
            'تم رفض الطلب بسبب CSRF token مفقود',
            'تم تفعيل حماية CSRF',
            'تم تسجيل محاولة CSRF في السجل'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    requestsElement.textContent = requests;
    successElement.textContent = success;
}

// Directory Traversal Attack Functions
function startDirTraversalAttack() {
    if (simulations.dirTraversal.running) return;

    simulations.dirTraversal.running = true;
    const card = document.getElementById('dirTraversalCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic Directory Traversal simulation
    simulations.dirTraversal.interval = setInterval(() => {
        updateDirTraversalMetrics();
    }, 1800);

    const os = document.getElementById('dirTraversalOS').value;
    const file = document.getElementById('dirTraversalFile').value;
    const depth = document.getElementById('dirTraversalDepth').value;

    addLogEntry(`بدء هجوم Directory Traversal - النظام: ${os}, الملف: ${file}`);
    addLogEntry(`عمق التنقل: ${depth} مستويات`);
    addLogEntry('جاري محاولة الوصول للملفات...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'medium',
        category: 'Directory Traversal',
        title: `هجوم Directory Traversal محاكى - ${os}`,
        description: `تم رصد محاولة Directory Traversal محاكاة على نظام ${os} للوصول إلى ${file}`,
        raw_data: JSON.stringify({ os, file, depth, timestamp: new Date().toISOString() })
    });
}

function stopDirTraversalAttack() {
    if (!simulations.dirTraversal.running) return;

    simulations.dirTraversal.running = false;
    const card = document.getElementById('dirTraversalCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.dirTraversal.interval);
    addLogEntry('تم إيقاف هجوم Directory Traversal');
}

function updateDirTraversalMetrics() {
    if (!simulations.dirTraversal.running) return;

    const attemptsElement = document.getElementById('dirTraversalAttempts');
    const filesElement = document.getElementById('dirTraversalFiles');

    let attempts = parseInt(attemptsElement.textContent) || 0;
    let files = parseInt(filesElement.textContent) || 0;

    const os = document.getElementById('dirTraversalOS').value;

    // Different Directory Traversal patterns
    if (os === 'linux') {
        attempts += Math.floor(Math.random() * 3) + 2;
        if (Math.random() < 0.2) {
            files += 1;
            addLogEntry('تم الوصول لملف Linux حساس');
        }
    } else if (os === 'windows') {
        attempts += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.15) {
            files += 1;
            addLogEntry('تم الوصول لملف Windows حساس');
        }
    } else if (os === 'mixed') {
        attempts += Math.floor(Math.random() * 4) + 3;
        if (Math.random() < 0.25) {
            files += 1;
            addLogEntry('تم الوصول لملف مختلط');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const messages = [
            'تم اكتشاف محاولة Directory Traversal',
            'تم حظر مسار غير مصرح به',
            'تم تفعيل حماية Directory Traversal',
            'تم تسجيل محاولة وصول غير مصرح'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    attemptsElement.textContent = attempts;
    filesElement.textContent = files;
}

// Command Injection Attack Functions
function startCmdInjectionAttack() {
    if (simulations.cmdInjection.running) return;

    simulations.cmdInjection.running = true;
    const card = document.getElementById('cmdInjectionCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.add('running');
    statusIndicator.classList.remove('stopped');
    statusIndicator.classList.add('running');
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Realistic Command Injection simulation
    simulations.cmdInjection.interval = setInterval(() => {
        updateCmdInjectionMetrics();
    }, 1200);

    const os = document.getElementById('cmdInjectionOS').value;
    const command = document.getElementById('cmdInjectionCommand').value;
    const payload = document.getElementById('cmdInjectionPayload').value;

    addLogEntry(`بدء هجوم Command Injection - النظام: ${os}, الأمر: ${command}`);
    addLogEntry(`Payload: ${payload}`);
    addLogEntry('جاري تنفيذ الأوامر...');
    
    // Create event in main system
    createLabEvent({
        source: 'lab',
        severity: 'critical',
        category: 'Command Injection',
        title: `هجوم Command Injection محاكى - ${os}`,
        description: `تم رصد محاولة Command Injection محاكاة على نظام ${os} لتنفيذ أمر ${command}`,
        raw_data: JSON.stringify({ os, command, payload, timestamp: new Date().toISOString() })
    });
}

function stopCmdInjectionAttack() {
    if (!simulations.cmdInjection.running) return;

    simulations.cmdInjection.running = false;
    const card = document.getElementById('cmdInjectionCard');
    const statusIndicator = card.querySelector('.status-indicator');
    const startBtn = card.querySelector('.btn-start');
    const stopBtn = card.querySelector('.btn-stop');

    card.classList.remove('running');
    statusIndicator.classList.remove('running');
    statusIndicator.classList.add('stopped');
    startBtn.disabled = false;
    stopBtn.disabled = true;

    clearInterval(simulations.cmdInjection.interval);
    addLogEntry('تم إيقاف هجوم Command Injection');
}

function updateCmdInjectionMetrics() {
    if (!simulations.cmdInjection.running) return;

    const attemptsElement = document.getElementById('cmdInjectionAttempts');
    const outputElement = document.getElementById('cmdInjectionOutput');

    let attempts = parseInt(attemptsElement.textContent) || 0;
    let output = parseInt(outputElement.textContent) || 0;

    const os = document.getElementById('cmdInjectionOS').value;

    // Different Command Injection patterns
    if (os === 'linux') {
        attempts += Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.3) {
            output += Math.floor(Math.random() * 2) + 1;
            addLogEntry('تم تنفيذ أمر Linux بنجاح');
        }
    } else if (os === 'windows') {
        attempts += Math.floor(Math.random() * 1) + 1;
        if (Math.random() < 0.2) {
            output += Math.floor(Math.random() * 1) + 1;
            addLogEntry('تم تنفيذ أمر Windows بنجاح');
        }
    } else if (os === 'unix') {
        attempts += Math.floor(Math.random() * 3) + 2;
        if (Math.random() < 0.25) {
            output += Math.floor(Math.random() * 2) + 1;
            addLogEntry('تم تنفيذ أمر Unix بنجاح');
        }
    }

    // Add realistic log messages
    if (Math.random() < 0.1) {
        const messages = [
            'تم اكتشاف محاولة Command Injection',
            'تم حظر الأمر المشبوه',
            'تم تفعيل حماية Command Injection',
            'تم تسجيل محاولة تنفيذ أمر غير مصرح'
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(message);
    }

    attemptsElement.textContent = attempts;
    outputElement.textContent = output;
}

// Export functions for global access
window.startSQLAttack = startSQLAttack;
window.stopSQLAttack = stopSQLAttack;
window.startDDoSAttack = startDDoSAttack;
window.stopDDoSAttack = stopDDoSAttack;
window.startXSSAttack = startXSSAttack;
window.stopXSSAttack = stopXSSAttack;
window.startBruteAttack = startBruteAttack;
window.stopBruteAttack = stopBruteAttack;
window.startSSRFAttack = startSSRFAttack;
window.stopSSRFAttack = stopSSRFAttack;
window.startDoSAttack = startDoSAttack;
window.stopDoSAttack = stopDoSAttack;
window.startPhishingAttack = startPhishingAttack;
window.stopPhishingAttack = stopPhishingAttack;
window.startMITMAttack = startMITMAttack;
window.stopMITMAttack = stopMITMAttack;
window.startCSRFAttack = startCSRFAttack;
window.stopCSRFAttack = stopCSRFAttack;
window.startDirTraversalAttack = startDirTraversalAttack;
window.stopDirTraversalAttack = stopDirTraversalAttack;
window.startCmdInjectionAttack = startCmdInjectionAttack;
window.stopCmdInjectionAttack = stopCmdInjectionAttack;
window.clearLog = clearLog;
