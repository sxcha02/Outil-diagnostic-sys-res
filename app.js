// ============================================
// MODULE NETWORK - Diagnostic réseau
// ============================================

async function runNetworkDiagnostics() {
    const results = {
        status: 'unknown',
        connectionStatus: navigator.onLine ? 'En ligne' : 'Hors ligne',
        connectionType: getConnectionType(),
        latency: 'Calcul...',
        downloadSpeed: 'Test...',
        publicIP: 'Récupération...',
        score: 0
    };

    try {
        results.latency = await testLatency();
    } catch (error) {
        results.latency = 'Erreur';
    }

    try {
        results.downloadSpeed = await testDownloadSpeed();
    } catch (error) {
        results.downloadSpeed = 'Erreur';
    }

    try {
        results.publicIP = await getPublicIP();
    } catch (error) {
        results.publicIP = 'Indisponible';
    }

    results.score = calculateNetworkScore(results);
    results.status = getStatusFromScore(results.score);

    return results;
}

function getConnectionType() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const type = connection.effectiveType || connection.type || 'unknown';
            const typeMap = {
                'slow-2g': '2G (lent)',
                '2g': '2G',
                '3g': '3G',
                '4g': '4G',
                '5g': '5G',
                'wifi': 'WiFi',
                'ethernet': 'Ethernet',
                'unknown': 'Inconnu'
            };
            return typeMap[type] || type.toUpperCase();
        }
    }
    return 'Non détecté';
}

async function testLatency() {
    const testURL = 'https://www.google.com/favicon.ico';
    const iterations = 3;
    let totalTime = 0;

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        try {
            await fetch(testURL, { 
                method: 'HEAD', 
                cache: 'no-cache',
                mode: 'no-cors'
            });
            const endTime = performance.now();
            totalTime += (endTime - startTime);
        } catch (error) {
            // Si une requête échoue, on continue
        }
    }

    const avgLatency = Math.round(totalTime / iterations);
    return `${avgLatency} ms`;
}

async function testDownloadSpeed() {
    const testURL = 'https://via.placeholder.com/500';
    const fileSize = 20 * 1024;
    
    const startTime = performance.now();
    try {
        const response = await fetch(testURL + '?cache=' + Date.now(), { cache: 'no-cache' });
        await response.blob();
        const endTime = performance.now();
        
        const durationInSeconds = (endTime - startTime) / 1000;
        const speedBps = fileSize / durationInSeconds;
        const speedKbps = speedBps / 1024;
        const speedMbps = speedKbps / 1024;

        if (speedMbps >= 1) {
            return `${speedMbps.toFixed(2)} Mbps`;
        } else {
            return `${speedKbps.toFixed(0)} Kbps`;
        }
    } catch (error) {
        return 'Test échoué';
    }
}

async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json', {
            timeout: 5000
        });
        const data = await response.json();
        return data.ip || 'Indisponible';
    } catch (error) {
        return 'Indisponible';
    }
}

function calculateNetworkScore(results) {
    let score = 0;

    if (results.connectionStatus.includes('En ligne')) {
        score += 30;
    }

    const connectionType = results.connectionType.toLowerCase();
    if (connectionType.includes('5g') || connectionType.includes('ethernet')) {
        score += 20;
    } else if (connectionType.includes('4g') || connectionType.includes('wifi')) {
        score += 15;
    } else if (connectionType.includes('3g')) {
        score += 10;
    }

    // Latence
    if (results.latency.includes('ms')) {
        const latencyValue = parseInt(results.latency);
        if (latencyValue < 50) {
            score += 30;
        } else if (latencyValue < 150) {
            score += 25;
        } else if (latencyValue < 300) {
            score += 15;
        } else {
            score += 5;
        }
    }

    if (results.downloadSpeed.includes('Mbps')) {
        const mbps = parseFloat(results.downloadSpeed);
        if (mbps >= 10) {
            score += 20;
        } else if (mbps >= 5) {
            score += 15;
        } else {
            score += 10;
        }
    } else if (results.downloadSpeed.includes('Kbps')) {
        score += 5;
    }

    return Math.min(score, 100);
}

// ============================================
// MODULE BROWSER - Information navigateur
// ============================================

async function runBrowserDiagnostics() {
    const results = {
        status: 'unknown',
        browserName: getBrowserName(),
        browserVersion: getBrowserVersion(),
        osName: getOSName(),
        screenResolution: getScreenResolution(),
        cookiesEnabled: navigator.cookieEnabled ? 'Oui' : 'Non',
        score: 0
    };

    results.score = calculateBrowserScore(results);
    results.status = getStatusFromScore(results.score);

    return results;
}

function getBrowserName() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Firefox')) {
        return 'Firefox';
    } else if (userAgent.includes('Edg')) {
        return 'Edge';
    } else if (userAgent.includes('Chrome')) {
        return 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return 'Safari';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        return 'Opera';
    }

    return 'Inconnu';
}

function getBrowserVersion() {
    const userAgent = navigator.userAgent;
    let version = 'Inconnue';

    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch) {
        version = chromeMatch[1];
    }

    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
    if (firefoxMatch) {
        version = firefoxMatch[1];
    }

    const safariMatch = userAgent.match(/Version\/(\d+)/);
    if (safariMatch && userAgent.includes('Safari')) {
        version = safariMatch[1];
    }

    const edgeMatch = userAgent.match(/Edg\/(\d+)/);
    if (edgeMatch) {
        version = edgeMatch[1];
    }

    return `v${version}`;
}

function getOSName() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    if (userAgent.includes('Win')) {
        return 'Windows';
    } else if (userAgent.includes('Mac')) {
        return 'macOS';
    } else if (userAgent.includes('Linux')) {
        return 'Linux';
    } else if (userAgent.includes('Android')) {
        return 'Android';
    } else if (userAgent.includes('iOS') || platform.includes('iPhone') || platform.includes('iPad')) {
        return 'iOS';
    }

    return 'Inconnu';
}

function getScreenResolution() {
    const width = screen.width;
    const height = screen.height;
    const dpr = window.devicePixelRatio || 1;
    
    let quality = '';
    const totalPixels = width * height;
    
    if (totalPixels >= 3840 * 2160) {
        quality = ' (4K)';
    } else if (totalPixels >= 2560 * 1440) {
        quality = ' (QHD)';
    } else if (totalPixels >= 1920 * 1080) {
        quality = ' (FHD)';
    } else if (totalPixels >= 1366 * 768) {
        quality = ' (HD)';
    }

    return `${width}×${height}${quality}`;
}

function calculateBrowserScore(results) {
    let score = 0;

    const browserName = results.browserName.toLowerCase();
    if (browserName.includes('chrome') || browserName.includes('firefox') || 
        browserName.includes('edge') || browserName.includes('safari')) {
        score += 30;
    } else {
        score += 15;
    }

    const version = parseInt(results.browserVersion.replace('v', ''));
    if (!isNaN(version)) {
        if (version >= 100) {
            score += 20;
        } else if (version >= 80) {
            score += 15;
        } else if (version >= 60) {
            score += 10;
        } else {
            score += 5;
        }
    } else {
        score += 10;
    }

    const osName = results.osName.toLowerCase();
    if (osName.includes('windows') || osName.includes('macos') || 
        osName.includes('linux') || osName.includes('android') || 
        osName.includes('ios')) {
        score += 20;
    } else {
        score += 10;
    }

    if (results.screenResolution.includes('4K') || results.screenResolution.includes('QHD')) {
        score += 20;
    } else if (results.screenResolution.includes('FHD')) {
        score += 18;
    } else if (results.screenResolution.includes('HD')) {
        score += 15;
    } else {
        score += 10;
    }

    if (results.cookiesEnabled === 'Oui') {
        score += 10;
    }

    return Math.min(score, 100);
}

// ============================================
// MODULE PERFORMANCE - Tests de performance
// ============================================

async function runPerformanceDiagnostics() {
    const results = {
        status: 'unknown',
        cpuScore: 'Test...',
        memoryUsage: getMemoryUsage(),
        batteryLevel: 'Détection...',
        batteryCharging: 'Détection...',
        score: 0
    };

    try {
        results.cpuScore = await testCPU();
    } catch (error) {
        results.cpuScore = 'Erreur ❌';
    }

    try {
        const batteryInfo = await getBatteryInfo();
        results.batteryLevel = batteryInfo.level;
        results.batteryCharging = batteryInfo.charging;
    } catch (error) {
        results.batteryLevel = 'Non supporté';
        results.batteryCharging = 'N/A';
    }

    results.score = calculatePerformanceScore(results);
    results.status = getStatusFromScore(results.score);

    return results;
}

async function testCPU() {
    const startTime = performance.now();
    
    let count = 0;
    const limit = 100000;
    
    for (let i = 2; i < limit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) count++;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    let score = 0;
    
    if (duration < 500) {
        score = 100;
    } else if (duration < 1000) {
        score = 85;
    } else if (duration < 2000) {
        score = 70;
    } else if (duration < 4000) {
        score = 50;
    } else {
        score = 30;
    }
    
    return `${score}/100 (${Math.round(duration)}ms)`;
}

function getMemoryUsage() {
    if (performance.memory) {
        const usedMemory = performance.memory.usedJSHeapSize;
        const totalMemory = performance.memory.jsHeapSizeLimit;
        const usedMB = (usedMemory / 1048576).toFixed(2);
        const totalMB = (totalMemory / 1048576).toFixed(2);
        const percentage = ((usedMemory / totalMemory) * 100).toFixed(1);
        
        return `${usedMB}/${totalMB} MB (${percentage}%)`;
    }
    return 'Non supporté';
}

async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            const level = (battery.level * 100).toFixed(0);
            const charging = battery.charging;
            
            return {
                level: `${level}%`,
                charging: charging ? 'En charge' : 'Sur batterie'
            };
        } catch (error) {
            return {
                level: 'Erreur',
                charging: 'Erreur'
            };
        }
    }
    return {
        level: 'Non supporté',
        charging: 'Non supporté'
    };
}

function calculatePerformanceScore(results) {
    let score = 0;

    if (results.cpuScore.includes('/100')) {
        const cpuScore = parseInt(results.cpuScore.split('/')[0]);
        score += (cpuScore * 0.4);
    } else if (!results.cpuScore.includes('Erreur')) {
        score += 20;
    }

    if (results.memoryUsage !== 'Non supporté' && !results.memoryUsage.includes('Erreur')) {
        const memoryMatch = results.memoryUsage.match(/\((\d+\.?\d*)%\)/);
        if (memoryMatch) {
            const memoryPercent = parseFloat(memoryMatch[1]);
            if (memoryPercent < 60) {
                score += 30;
            } else if (memoryPercent < 80) {
                score += 20;
            } else if (memoryPercent < 90) {
                score += 10;
            } else {
                score += 5;
            }
        }
    } else {
        score += 15;
    }

    if (results.batteryLevel !== 'Non supporté' && !results.batteryLevel.includes('Erreur')) {
        const batteryMatch = results.batteryLevel.match(/(\d+)%/);
        if (batteryMatch) {
            const batteryPercent = parseInt(batteryMatch[1]);
            if (batteryPercent > 50) {
                score += 20;
            } else if (batteryPercent > 20) {
                score += 15;
            } else {
                score += 5;
            }
        }
        
        if (results.batteryCharging.includes('En charge')) {
            score += 10;
        } else {
            score += 10;
        }
    } else {
        score += 15;
    }

    return Math.min(score, 100);
}

// ============================================
// MODULE STORAGE - Vérification stockage
// ============================================

async function runStorageDiagnostics() {
    const results = {
        status: 'unknown',
        localStorageStatus: checkLocalStorage(),
        localStorageSize: getLocalStorageSize(),
        sessionStorageStatus: checkSessionStorage(),
        indexedDBStatus: await checkIndexedDB(),
        cacheAPIStatus: checkCacheAPI(),
        score: 0
    };

    results.score = calculateStorageScore(results);
    results.status = getStatusFromScore(results.score);

    return results;
}

function checkLocalStorage() {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return 'Disponible';
    } catch (e) {
        return 'Non disponible';
    }
}

function getLocalStorageSize() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const sizeKB = (total / 1024).toFixed(2);
        
        return `${sizeKB} KB`;
    } catch (e) {
        return 'Erreur de calcul';
    }
}

function checkSessionStorage() {
    try {
        const testKey = '__test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        return 'Disponible';
    } catch (e) {
        return 'Non disponible';
    }
}

async function checkIndexedDB() {
    if (!('indexedDB' in window)) {
        return 'Non supporté';
    }

    try {
        const testDBName = '__test_db__';
        const request = indexedDB.open(testDBName, 1);
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const db = request.result;
                db.close();
                indexedDB.deleteDatabase(testDBName);
                resolve('Disponible');
            };
            
            request.onerror = () => {
                resolve('Erreur');
            };
            
            request.onblocked = () => {
                resolve('Bloqué');
            };
            
            setTimeout(() => {
                resolve('Timeout');
            }, 2000);
        });
    } catch (e) {
        return 'Erreur';
    }
}

function checkCacheAPI() {
    if ('caches' in window) {
        return 'Disponible';
    }
    return 'Non supporté';
}

function calculateStorageScore(results) {
    let score = 0;

    if (results.localStorageStatus === 'Disponible') {
        score += 25;
    }

    if (results.localStorageSize.includes('KB')) {
        const sizeKB = parseFloat(results.localStorageSize);
        if (sizeKB < 3500) {
            score += 10;
        } else if (sizeKB < 4500) {
            score += 5;
        }
    }

    if (results.sessionStorageStatus === 'Disponible') {
        score += 20;
    }

    if (results.indexedDBStatus === 'Disponible') {
        score += 25;
    } else if (results.indexedDBStatus === 'Bloqué') {
        score += 15;
    }

    if (results.cacheAPIStatus === 'Disponible') {
        score += 20;
    }

    return Math.min(score, 100);
}

// ============================================
// FONCTION COMMUNE - Statut depuis score
// ============================================

function getStatusFromScore(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
}

// ============================================
// APPLICATION PRINCIPALE - Orchestration
// ============================================

let diagnosticResults = {
    network: null,
    browser: null,
    performance: null,
    storage: null,
    timestamp: null
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    updateTimestamp();
    runAllDiagnostics();
}

function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', handleRefresh);

    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', handleExport);
}

async function runAllDiagnostics() {
    console.log('🚀 Lancement des diagnostics...');
    
    setButtonsEnabled(false);
    
    try {
        const [networkResults, browserResults, performanceResults, storageResults] = await Promise.all([
            runNetworkDiagnostics(),
            runBrowserDiagnostics(),
            runPerformanceDiagnostics(),
            runStorageDiagnostics()
        ]);

        diagnosticResults = {
            network: networkResults,
            browser: browserResults,
            performance: performanceResults,
            storage: storageResults,
            timestamp: new Date().toISOString()
        };

        displayResults();
        
        console.log('✅ Diagnostics terminés', diagnosticResults);
    } catch (error) {
        console.error('❌ Erreur lors des diagnostics:', error);
    } finally {
        setButtonsEnabled(true);
    }
}

function displayResults() {
    updateCard('network', diagnosticResults.network);
    updateCard('browser', diagnosticResults.browser);
    updateCard('performance', diagnosticResults.performance);
    updateCard('storage', diagnosticResults.storage);
    updateGlobalScore();
    updateTimestamp();
}

function updateCard(category, results) {
    const badge = document.getElementById(`${category}Badge`);
    
    badge.textContent = getStatusEmoji(results.status);
    badge.className = 'status-badge ' + results.status;

    switch(category) {
        case 'network':
            document.getElementById('connectionStatus').textContent = results.connectionStatus;
            document.getElementById('connectionType').textContent = results.connectionType;
            document.getElementById('latency').textContent = results.latency;
            document.getElementById('downloadSpeed').textContent = results.downloadSpeed;
            document.getElementById('publicIP').textContent = results.publicIP;
            break;
            
        case 'browser':
            document.getElementById('browserName').textContent = results.browserName;
            document.getElementById('browserVersion').textContent = results.browserVersion;
            document.getElementById('osName').textContent = results.osName;
            document.getElementById('screenResolution').textContent = results.screenResolution;
            document.getElementById('cookiesEnabled').textContent = results.cookiesEnabled;
            break;
            
        case 'performance':
            document.getElementById('cpuScore').textContent = results.cpuScore;
            document.getElementById('memoryUsage').textContent = results.memoryUsage;
            document.getElementById('batteryLevel').textContent = results.batteryLevel;
            document.getElementById('batteryCharging').textContent = results.batteryCharging;
            break;
            
        case 'storage':
            document.getElementById('localStorageStatus').textContent = results.localStorageStatus;
            document.getElementById('localStorageSize').textContent = results.localStorageSize;
            document.getElementById('sessionStorageStatus').textContent = results.sessionStorageStatus;
            document.getElementById('indexedDBStatus').textContent = results.indexedDBStatus;
            document.getElementById('cacheAPIStatus').textContent = results.cacheAPIStatus;
            break;
    }
}

function updateGlobalScore() {
    const scores = [
        diagnosticResults.network?.score || 0,
        diagnosticResults.browser?.score || 0,
        diagnosticResults.performance?.score || 0,
        diagnosticResults.storage?.score || 0
    ];

    const globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    const scoreCircle = document.getElementById('globalScore');
    const scoreValue = scoreCircle.querySelector('.score-value');
    const scoreStatus = document.getElementById('globalStatus');
    
    scoreValue.textContent = globalScore;
    
    let status = '';
    let statusText = '';
    
    if (globalScore >= 80) {
        status = 'excellent';
        statusText = 'Système optimal';
    } else if (globalScore >= 60) {
        status = 'good';
        statusText = 'Système stable';
    } else if (globalScore >= 40) {
        status = 'average';
        statusText = 'Performances réduites';
    } else {
        status = 'poor';
        statusText = 'Problèmes détectés';
    }
    
    scoreCircle.className = 'score-circle ' + status;
    scoreStatus.textContent = statusText;
}

function getStatusEmoji(status) {
    const statusMap = {
        excellent: 'OK',
        good: 'OK',
        average: 'WARN',
        poor: 'ERR',
        unknown: 'WAIT'
    };
    return statusMap[status] || 'N/A';
}

function updateTimestamp() {
    const timestampEl = document.getElementById('timestamp');
    const now = new Date();
    const formatted = now.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    timestampEl.textContent = `Dernière analyse : ${formatted}`;
}

async function handleRefresh() {
    console.log('🔄 Relancement des tests...');
    const refreshIcon = document.getElementById('refreshIcon');
    refreshIcon.classList.add('spinning');
    
    await runAllDiagnostics();
    
    setTimeout(() => {
        refreshIcon.classList.remove('spinning');
    }, 1000);
}

function handleExport() {
    const dataStr = JSON.stringify(diagnosticResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic-${Date.now()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('📥 Export réussi');
}

function setButtonsEnabled(enabled) {
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    refreshBtn.disabled = !enabled;
    exportBtn.disabled = !enabled;
}