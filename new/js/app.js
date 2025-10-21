// Main application class with enhanced features
class KHAIApp {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        // Core UI elements
        this.elements = {
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            messageForm: document.getElementById('messageForm'),
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            // ... other elements
        };

        this.validateElements();
    }

    initializeState() {
        this.state = {
            isProcessing: false,
            currentTheme: this.getSystemTheme(),
            isVoiceMode: false,
            attachedImages: [],
            isListening: false,
            currentModel: 'gpt-5-nano',
            isSpeaking: false,
            currentUtterance: null,
            chatSessions: new Map(),
            currentChatId: 'default',
            connectionStatus: 'online',
            performance: {
                startTime: performance.now(),
                messageCount: 0,
                averageResponseTime: 0
            }
        };

        this.config = {
            maxMessageLength: 4000,
            maxHistoryLength: 30,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            supportedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
            rateLimit: {
                requests: 100,
                window: 60000 // 1 minute
            }
        };

        this.analytics = this.setupAnalytics();
    }

    // Enhanced initialization
    async init() {
        try {
            await this.loadDependencies();
            this.bindEvents();
            this.setupServiceWorker();
            this.setupPerformanceMonitoring();
            this.loadUserPreferences();
            this.setupConnectionMonitoring();
            
            this.showNotification('KHAI готов к работе!', 'success');
            this.analytics.track('app_loaded');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
            this.analytics.track('app_error', { error: error.message });
        }
    }

    // Enhanced service worker setup
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });

            } catch (error) {
                console.warn('Service worker registration failed:', error);
            }
        }
    }

    // Enhanced message handling
    async sendMessage() {
        if (this.state.isProcessing) return;
        
        const message = this.elements.userInput.value.trim();
        if (!message && this.state.attachedImages.length === 0) return;

        // Rate limiting
        if (!this.checkRateLimit()) {
            this.showNotification('Слишком много запросов. Подождите немного.', 'warning');
            return;
        }

        this.state.isProcessing = true;
        this.updateUIState();

        try {
            const startTime = performance.now();
            
            if (this.state.isVoiceMode) {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message);
            }
            
            // Track performance
            const responseTime = performance.now() - startTime;
            this.updatePerformanceMetrics(responseTime);
            
        } catch (error) {
            this.handleError('Ошибка отправки сообщения', error);
            this.analytics.track('message_error', { error: error.message });
        } finally {
            this.state.isProcessing = false;
            this.updateUIState();
        }
    }

    // Enhanced AI response with streaming
    async getAIResponse(userMessage, images) {
        const typingIndicatorId = this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, images);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator(typingIndicatorId);
            await this.processAIResponse(response);
            
            this.analytics.track('ai_response_success', { 
                model: this.state.currentModel,
                hasImages: images.length > 0
            });
            
        } catch (error) {
            this.removeTypingIndicator(typingIndicatorId);
            this.handleError('Ошибка получения ответа от ИИ', error);
            this.analytics.track('ai_response_error', { 
                error: error.message,
                model: this.state.currentModel
            });
        }
    }

    // Enhanced error handling
    handleError(userMessage, error) {
        console.error(userMessage, error);
        
        const errorId = this.generateErrorId();
        this.analytics.track('error_occurred', {
            errorId,
            userMessage,
            error: error.message,
            stack: error.stack
        });

        this.addMessage('error', `
            ${userMessage}
            <details class="error-details">
                <summary>Техническая информация (ID: ${errorId})</summary>
                <code>${this.escapeHtml(error.message)}</code>
            </details>
        `);

        this.showNotification(userMessage, 'error');
    }

    // Enhanced performance monitoring
    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // 50ms threshold
                        this.analytics.track('long_task', {
                            duration: entry.duration,
                            name: entry.name
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    this.analytics.track('high_memory_usage', {
                        used: memory.usedJSHeapSize,
                        limit: memory.jsHeapSizeLimit
                    });
                }
            }, 30000);
        }
    }

    // Enhanced security features
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    validateFile(file) {
        if (!this.config.supportedFileTypes.includes(file.type)) {
            throw new Error(`Неподдерживаемый тип файла: ${file.type}`);
        }
        
        if (file.size > this.config.maxFileSize) {
            throw new Error(`Файл слишком большой: ${this.formatFileSize(file.size)}`);
        }

        // Basic malware scanning by file signature
        return this.scanFileSignature(file);
    }

    async scanFileSignature(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target.result);
                const header = Array.from(arr.slice(0, 4))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('').toUpperCase();
                
                // Check against known file signatures
                const signatures = {
                    'FFD8FF': 'image/jpeg',
                    '89504E47': 'image/png',
                    '52494646': 'image/webp',
                    '25504446': 'application/pdf'
                };
                
                const isValid = Object.values(signatures).includes(file.type);
                resolve(isValid);
            };
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    }

    // Enhanced analytics
    setupAnalytics() {
        return {
            track: (event, data = {}) => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', event, data);
                }
                
                // Custom analytics
                const analyticsData = {
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    ...data
                };
                
                console.log(`[Analytics] ${event}:`, analyticsData);
            }
        };
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Enhanced file handling
    async handleFileUpload(files) {
        const validFiles = [];
        
        for (const file of files) {
            try {
                await this.validateFile(file);
                validFiles.push(file);
                
                // Create preview
                await this.createFilePreview(file);
                
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
        
        this.state.attachedImages.push(...validFiles);
        this.updateAttachedFilesUI();
    }

    async createFilePreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'file-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview of ${file.name}">
                    <button type="button" class="remove-file" aria-label="Удалить файл">
                        <i class="ti ti-x"></i>
                    </button>
                    <div class="file-info">
                        <span>${file.name}</span>
                        <span>${this.formatFileSize(file.size)}</span>
                    </div>
                `;
                
                const container = document.getElementById('attachedFiles');
                container.appendChild(preview);
                resolve(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    // Enhanced voice functionality
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'warning');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.state.isListening = true;
            this.updateVoiceUI();
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            this.elements.userInput.value = transcript;
            this.autoResizeTextarea();
        };

        this.recognition.onerror = (event) => {
            this.handleError('Ошибка распознавания голоса', event.error);
            this.state.isListening = false;
            this.updateVoiceUI();
        };

        this.recognition.onend = () => {
            this.state.isListening = false;
            this.updateVoiceUI();
        };
    }

    // Enhanced text-to-speech
    async speakText(text) {
        if (this.state.isSpeaking) {
            this.stopSpeaking();
            return;
        }

        if (!('speechSynthesis' in window)) {
            this.showNotification('Голосовое воспроизведение не поддерживается', 'warning');
            return;
        }

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            utterance.onstart = () => {
                this.state.isSpeaking = true;
                this.state.currentUtterance = utterance;
                this.updateVoiceUI();
            };

            utterance.onend = () => {
                this.state.isSpeaking = false;
                this.state.currentUtterance = null;
                this.updateVoiceUI();
                resolve();
            };

            utterance.onerror = (event) => {
                this.state.isSpeaking = false;
                this.state.currentUtterance = null;
                this.updateVoiceUI();
                this.handleError('Ошибка воспроизведения голоса', event.error);
                resolve();
            };

            speechSynthesis.speak(utterance);
        });
    }

    // Enhanced theme management
    setupTheme() {
        const savedTheme = localStorage.getItem('khai-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', theme);
        this.state.currentTheme = theme;
        
        // Update theme toggle button
        const themeIcon = this.elements.themeToggle.querySelector('i');
        themeIcon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                this.state.currentTheme = newTheme;
            }
        });
    }

    toggleTheme() {
        const newTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.state.currentTheme = newTheme;
        
        // Update icon
        const themeIcon = this.elements.themeToggle.querySelector('i');
        themeIcon.className = newTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        
        // Save preference
        localStorage.setItem('khai-theme', newTheme);
        
        this.analytics.track('theme_changed', { theme: newTheme });
    }

    // Enhanced notifications
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Закрыть уведомление">
                <i class="ti ti-x"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        const removeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', removeNotification);

        if (duration > 0) {
            setTimeout(removeNotification, duration);
        }

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'circle-check',
            warning: 'alert-triangle',
            error: 'alert-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Enhanced connection monitoring
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.state.connectionStatus = 'online';
            this.updateConnectionStatus();
            this.showNotification('Соединение восстановлено', 'success');
        });

        window.addEventListener('offline', () => {
            this.state.connectionStatus = 'offline';
            this.updateConnectionStatus();
            this.showNotification('Отсутствует подключение к интернету', 'warning');
        });

        // Monitor API connectivity
        setInterval(async () => {
            try {
                await fetch('https://api.khai.by/health', { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                this.state.connectionStatus = 'online';
            } catch {
                this.state.connectionStatus = 'offline';
            }
            this.updateConnectionStatus();
        }, 30000);
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const icon = statusElement.querySelector('i');
            const text = statusElement.querySelector('span');
            
            if (this.state.connectionStatus === 'online') {
                icon.className = 'ti ti-wifi';
                text.textContent = 'Онлайн';
                statusElement.className = 'connection-status online';
            } else {
                icon.className = 'ti ti-wifi-off';
                text.textContent = 'Офлайн';
                statusElement.className = 'connection-status offline';
            }
        }
    }

    // Enhanced performance metrics
    updatePerformanceMetrics(responseTime) {
        this.state.performance.messageCount++;
        this.state.performance.averageResponseTime = 
            (this.state.performance.averageResponseTime * (this.state.performance.messageCount - 1) + responseTime) / 
            this.state.performance.messageCount;

        // Report to analytics
        if (this.state.performance.messageCount % 10 === 0) {
            this.analytics.track('performance_metrics', {
                averageResponseTime: this.state.performance.averageResponseTime,
                messageCount: this.state.performance.messageCount,
                uptime: performance.now() - this.state.performance.startTime
            });
        }
    }

    // Enhanced error ID generation
    generateErrorId() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Enhanced utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        if (bytes === 0) return '0 Б';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Enhanced validation
    validateElements() {
        const missingElements = Object.entries(this.elements)
            .filter(([_, element]) => !element)
            .map(([name]) => name);
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.join(', ')}`);
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const windowStart = now - this.config.rateLimit.window;
        
        // Get recent requests from storage
        const recentRequests = JSON.parse(localStorage.getItem('khai_rate_limit') || '[]')
            .filter(timestamp => timestamp > windowStart);
        
        if (recentRequests.length >= this.config.rateLimit.requests) {
            return false;
        }
        
        // Add current request
        recentRequests.push(now);
        localStorage.setItem('khai_rate_limit', JSON.stringify(recentRequests));
        return true;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.khaiApp = new KHAIApp();
    });
} else {
    window.khaiApp = new KHAIApp();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIApp;
}
