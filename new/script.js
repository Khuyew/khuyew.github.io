// script.js - Полностью обновленная версия
class KHAI {
    constructor() {
        this.VERSION = '3.0.0';
        this.isSecureContext = window.isSecureContext;
        this.supportsTouch = 'ontouchstart' in window;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.initializeServiceWorker();
            this.initializeElements();
            this.initializeState();
            this.setupSecurity();
            this.bindEvents();
            this.setupPerformanceMonitoring();
            this.loadUserPreferences();
            
            await this.checkConnectivity();
            this.showWelcomeMessage();
            
            console.log('KHAI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KHAI:', error);
            this.handleCriticalError(error);
        }
    }

    initializeElements() {
        // Кэширование DOM элементов для производительности
        this.elements = {
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            themeToggle: document.getElementById('themeToggle'),
            modelSelect: document.getElementById('modelSelect'),
            menuToggle: document.getElementById('menuToggle'),
            sidebarMenu: document.getElementById('sidebarMenu'),
            currentChatName: document.getElementById('currentChatName')
        };

        this.validateElements();
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        // Оптимизация рендеринга сообщений
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            root: this.elements.messagesContainer,
            threshold: 0.1
        });
    }

    initializeState() {
        this.state = {
            isProcessing: false,
            currentTheme: this.getSystemTheme(),
            currentModel: 'gpt-4',
            conversationHistory: [],
            chatSessions: new Map(),
            currentChatId: 'default',
            isOnline: navigator.onLine,
            speechSynthesis: null,
            recognition: null
        };

        this.performance = {
            messageCount: 0,
            startTime: performance.now(),
            metrics: new Map()
        };
    }

    setupSecurity() {
        // CSP-совместимые проверки
        this.setupCSP();
        this.setupInputSanitization();
        this.setupSecureStorage();
    }

    setupCSP() {
        // Content Security Policy совместимые практики
        if (!this.isSecureContext) {
            console.warn('Running in non-secure context. Some features may be limited.');
        }
    }

    setupInputSanitization() {
        // Санитизация ввода
        this.sanitizer = new Sanitizer();
    }

    setupSecureStorage() {
        // Шифрование чувствительных данных
        this.cryptoKey = null;
        this.initEncryption();
    }

    async initEncryption() {
        if (window.crypto && window.crypto.subtle) {
            try {
                this.cryptoKey = await crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
            } catch (error) {
                console.warn('Encryption not available:', error);
            }
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registered:', registration);
                
                // Проверка обновлений
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.warn('ServiceWorker registration failed:', error);
            }
        }
    }

    bindEvents() {
        // Оптимизированные обработчики событий
        this.setupMessagePassing();
        this.setupNetworkEvents();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
    }

    setupMessagePassing() {
        // Использование MessageChannel для эффективной коммуникации
        this.messageChannel = new MessageChannel();
        this.setupBroadcastChannel();
    }

    setupBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('khai-app');
            this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage.bind(this));
        }
    }

    setupNetworkEvents() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    setupTouchEvents() {
        if (this.supportsTouch) {
            this.setupSwipeGestures();
            this.setupTouchOptimizations();
        }
    }

    setupSwipeGestures() {
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Горизонтальный свайп для открытия/закрытия меню
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.openSidebar();
                } else {
                    this.closeSidebar();
                }
            }
            
            startX = startY = null;
        }, { passive: true });
    }

    setupTouchOptimizations() {
        // Предотвращение zoom на быстрый двойной тап
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }

    setupPerformanceMonitoring() {
        // Мониторинг производительности
        this.performanceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                this.performance.metrics.set(entry.name, entry);
            });
        });

        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }

    async sendMessage() {
        if (this.state.isProcessing) return;
        
        const message = this.elements.userInput.value.trim();
        if (!message) return;

        this.state.isProcessing = true;
        this.updateUIState();

        try {
            performance.mark('message-processing-start');
            
            await this.processUserMessage(message);
            
            performance.mark('message-processing-end');
            performance.measure('message-processing', 
                'message-processing-start', 
                'message-processing-end');
                
        } catch (error) {
            this.handleError('Ошибка отправки сообщения', error);
        } finally {
            this.state.isProcessing = false;
            this.updateUIState();
        }
    }

    async processUserMessage(message) {
        // Добавление сообщения с оптимизацией
        const messageId = this.addMessage('user', message);
        
        // Очистка ввода
        this.clearInput();
        
        // Получение ответа
        await this.getAIResponse(message, messageId);
    }

    addMessage(role, content, options = {}) {
        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role} will-change`;
        messageElement.setAttribute('data-message-id', messageId);
        
        if (options.delayedRender) {
            messageElement.style.contentVisibility = 'auto';
        }

        const messageContent = this.createMessageContent(role, content);
        messageElement.appendChild(messageContent);
        
        this.elements.messagesContainer.appendChild(messageElement);
        this.intersectionObserver.observe(messageElement);
        
        this.scheduleScrollToBottom();
        this.trackMessageEvent(role);
        
        return messageId;
    }

    createMessageContent(role, content) {
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (role === 'ai') {
            messageContent.innerHTML = this.sanitizeHTML(content);
            this.attachMessageActions(messageContent);
        } else {
            messageContent.textContent = content;
        }
        
        return messageContent;
    }

    sanitizeHTML(html) {
        // Безопасная обработка HTML
        return this.sanitizer.sanitizeFor('div', html).innerHTML;
    }

    async getAIResponse(userMessage, messageId) {
        const typingIndicatorId = this.showTypingIndicator();
        
        try {
            const response = await this.callAIService(userMessage);
            this.removeTypingIndicator(typingIndicatorId);
            
            await this.streamResponse(response, messageId);
            
        } catch (error) {
            this.removeTypingIndicator(typingIndicatorId);
            this.handleError('Ошибка получения ответа ИИ', error);
        }
    }

    async callAIService(prompt) {
        if (!this.state.isOnline) {
            throw new Error('Отсутствует интернет-соединение');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(this.getAIEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': this.VERSION
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: this.state.currentModel,
                    history: this.getRecentHistory()
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async streamResponse(response, messageId) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const text = decoder.decode(value, { stream: true });
            accumulatedText += text;
            
            this.updateMessageContent(messageId, accumulatedText);
            await this.delay(16); // ~60 FPS
        }
    }

    updateMessageContent(messageId, content) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const messageContent = messageElement.querySelector('.message-content');
            messageContent.innerHTML = this.sanitizeHTML(this.formatAIResponse(content));
        }
    }

    // Оптимизированные утилиты
    scheduleScrollToBottom() {
        if (this.scrollTimeout) {
            cancelAnimationFrame(this.scrollTimeout);
        }
        
        this.scrollTimeout = requestAnimationFrame(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Обработка ошибок
    handleError(userMessage, error) {
        console.error(userMessage, error);
        
        const errorMessage = this.state.isOnline ? 
            `${userMessage}: ${error.message}` :
            'Проверьте интернет-соединение';
            
        this.showNotification(errorMessage, 'error');
        this.addMessage('error', errorMessage);
    }

    handleCriticalError(error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-boundary';
        errorElement.innerHTML = `
            <h2>⚠️ Произошла ошибка</h2>
            <p>KHAI временно недоступен. Пожалуйста, обновите страницу.</p>
            <button onclick="window.location.reload()">Обновить</button>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorElement);
    }

    // Управление состоянием приложения
    updateUIState() {
        this.elements.sendBtn.disabled = this.state.isProcessing;
        this.elements.userInput.disabled = this.state.isProcessing;
        
        if (this.state.isProcessing) {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-loader"></i>';
        } else {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
        }
    }

    // Управление темой
    toggleTheme() {
        this.state.currentTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
        this.saveUserPreferences();
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Работа с сетью
    async checkConnectivity() {
        if (!navigator.onLine) {
            this.showNotification('Работаем в оффлайн-режиме', 'warning');
        }
    }

    handleOnline() {
        this.state.isOnline = true;
        this.showNotification('Соединение восстановлено', 'success');
    }

    handleOffline() {
        this.state.isOnline = false;
        this.showNotification('Отсутствует интернет-соединение', 'warning');
    }

    // Уведомления
    showNotification(message, type = 'info') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('KHAI', {
                body: message,
                icon: '/icons/icon-192x192.png',
                tag: 'khai-notification'
            });
        }
        
        // In-app уведомление
        this.showInAppNotification(message, type);
    }

    showInAppNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Сохранение и загрузка
    saveUserPreferences() {
        const preferences = {
            theme: this.state.currentTheme,
            model: this.state.currentModel,
            chats: Array.from(this.state.chatSessions.entries())
        };
        
        localStorage.setItem('khai-preferences', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('khai-preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.state.currentTheme = preferences.theme || this.state.currentTheme;
                this.state.currentModel = preferences.model || this.state.currentModel;
                
                if (preferences.chats) {
                    this.state.chatSessions = new Map(preferences.chats);
                }
                
                this.applyPreferences();
            }
        } catch (error) {
            console.warn('Error loading preferences:', error);
        }
    }

    applyPreferences() {
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
        this.elements.modelSelect.value = this.state.currentModel;
    }

    // Производительность и аналитика
    trackMessageEvent(role) {
        this.performance.messageCount++;
        
        if (window.gtag) {
            gtag('event', 'message_sent', {
                event_category: 'engagement',
                event_label: role,
                value: 1
            });
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = `# 🇧🇾 Добро пожаловать в KHAI!

**Первый белорусский ИИ-помощник**

✨ **Возможности:**
• Умные ответы на любые вопросы
• Поддержка голосового ввода
• Анализ изображений
• Мультиязычность
• Полная конфиденциальность

💡 **Совет:** Начните общение, отправив сообщение!`;

        this.addMessage('ai', welcomeMessage);
    }

    // Очистка ресурсов
    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
        
        if (this.scrollTimeout) {
            cancelAnimationFrame(this.scrollTimeout);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Предзагрузка критических ресурсов
    const preloadLinks = [
        { rel: 'preconnect', href: 'https://js.puter.com' },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'preload', href: '/icons/icon-192x192.png', as: 'image' }
    ];
    
    preloadLinks.forEach(link => {
        const el = document.createElement('link');
        Object.assign(el, link);
        document.head.appendChild(el);
    });

    // Запуск приложения
    window.khaiApp = new KHAI();
});

// Обработка ошибок на уровне window
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// API для внешнего использования
window.KHAI = {
    version: '3.0.0',
    init: () => new KHAI()
};
