// KHAI — Advanced AI Chat Application (Production Ready)
class KHAIChat {
    constructor() {
        // Application state
        this.state = {
            chats: new Map(),
            currentChatId: 'main-chat',
            messages: [],
            settings: {
                theme: 'dark',
                fontSize: 'medium',
                model: 'gpt-4',
                autoScroll: true,
                soundEnabled: true,
                offlineMode: false
            },
            isGenerating: false,
            generationAborted: false,
            isOnline: navigator.onLine,
            attachedFiles: [],
            currentMode: 'normal',
            conversationHistory: []
        };

        // Performance optimizations
        this.performance = {
            activeTimeouts: new Set(),
            activeIntervals: new Set(),
            activeEventListeners: new Map(),
            lastRenderTime: 0,
            renderThrottle: 100,
            messageCache: new Map(),
            virtualScroll: {
                visibleStart: 0,
                visibleEnd: 0,
                itemHeight: 80
            }
        };

        // Mobile optimizations
        this.mobile = {
            isKeyboardVisible: false,
            touchStartY: 0,
            viewportHeight: window.innerHeight
        };

        // API configuration
        this.api = {
            endpoints: {
                chat: '/api/chat',
                models: '/api/models',
                files: '/api/files'
            },
            timeout: 30000,
            retryCount: 3
        };

        // Security
        this.security = {
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/json'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxMessageLength: 4000,
            maxHistoryLength: 100
        };

        this.init();
    }

    // ==================== INITIALIZATION ====================

    async init() {
        try {
            await this.setupServiceWorker();
            await this.loadApplicationState();
            await this.setupEventListeners();
            this.setupMobileOptimizations();
            this.initializeUI();
            this.showWelcomeMessage();
            
            // Finalize initialization
            this.hideLoader();
            this.showNotification('KHAI готов к работе!', 'success');
            
            console.log('KHAI Chat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KHAI Chat:', error);
            this.handleError('Ошибка инициализации приложения', error);
        }
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Check for updates periodically
                setInterval(() => registration.update(), 60 * 60 * 1000); // Every hour

            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    async loadApplicationState() {
        try {
            // Load settings
            const savedSettings = localStorage.getItem('khai-settings');
            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
                this.applySettings();
            }

            // Load chats
            const savedChats = localStorage.getItem('khai-chats');
            if (savedChats) {
                const chatsData = JSON.parse(savedChats);
                this.state.chats = new Map(Object.entries(chatsData.chats || {}));
                this.state.currentChatId = chatsData.currentChatId || 'main-chat';
                this.state.conversationHistory = chatsData.conversationHistory || [];
            } else {
                // Initialize with main chat
                this.state.chats.set('main-chat', {
                    id: 'main-chat',
                    title: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }

            // Apply loaded state
            this.applyTheme(this.state.settings.theme);
            this.renderCurrentChat();

        } catch (error) {
            console.error('Error loading application state:', error);
            this.initializeDefaultState();
        }
    }

    initializeDefaultState() {
        this.state.chats.set('main-chat', {
            id: 'main-chat',
            title: 'Основной чат',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        this.saveApplicationState();
    }

    // ==================== CHAT MANAGEMENT ====================

    async createChat(title = null) {
        const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const chatTitle = title || `Чат ${this.state.chats.size + 1}`;
        
        const newChat = {
            id: chatId,
            title: chatTitle,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.state.chats.set(chatId, newChat);
        await this.switchChat(chatId);
        this.saveApplicationState();
        
        this.showNotification(`Создан новый чат: "${chatTitle}"`, 'success');
        return chatId;
    }

    async switchChat(chatId) {
        if (!this.state.chats.has(chatId)) {
            throw new Error(`Chat ${chatId} not found`);
        }

        // Save current chat state
        this.saveCurrentChat();

        // Switch to new chat
        this.state.currentChatId = chatId;
        const chat = this.state.chats.get(chatId);
        this.state.messages = chat.messages || [];
        this.state.conversationHistory = this.buildConversationHistory(chat.messages);

        this.renderChat();
        this.updateChatList();
        this.saveApplicationState();
    }

    async deleteChat(chatId) {
        if (this.state.chats.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        if (!confirm(`Удалить чат "${this.state.chats.get(chatId)?.title}"?`)) {
            return;
        }

        this.state.chats.delete(chatId);

        // If deleting current chat, switch to another
        if (chatId === this.state.currentChatId) {
            const remainingChats = Array.from(this.state.chats.keys());
            const newCurrentChatId = remainingChats.find(id => id !== chatId) || remainingChats[0];
            await this.switchChat(newCurrentChatId);
        }

        this.saveApplicationState();
        this.updateChatList();
        this.showNotification('Чат удален', 'info');
    }

    async renameChat(chatId, newTitle) {
        if (!this.state.chats.has(chatId)) {
            throw new Error(`Chat ${chatId} not found`);
        }

        const chat = this.state.chats.get(chatId);
        chat.title = newTitle.trim() || `Чат ${chatId}`;
        chat.updatedAt = Date.now();

        this.state.chats.set(chatId, chat);
        this.saveApplicationState();
        this.updateChatList();

        this.showNotification('Чат переименован', 'success');
    }

    // ==================== MESSAGE HANDLING ====================

    async sendMessage(content, mode = this.state.currentMode) {
        if (this.state.isGenerating) {
            this.showNotification('Подождите, идет генерация...', 'warning');
            return;
        }

        // Validation
        if (!content.trim() && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (content.length > this.security.maxMessageLength) {
            this.showNotification(`Сообщение слишком длинное (максимум ${this.security.maxMessageLength} символов)`, 'error');
            return;
        }

        try {
            this.state.isGenerating = true;
            this.state.generationAborted = false;
            this.updateSendButton(true);

            // Create user message
            const userMessage = this.createMessage('user', content, mode);
            this.addMessage(userMessage);

            // Clear input
            this.clearInput();

            // Get AI response
            await this.getAIResponse(userMessage);

        } catch (error) {
            this.handleError('Ошибка отправки сообщения', error);
        } finally {
            if (!this.state.generationAborted) {
                this.state.isGenerating = false;
                this.updateSendButton(false);
                this.saveApplicationState();
            }
        }
    }

    createMessage(role, content, mode = 'normal', files = []) {
        return {
            id: this.generateId(),
            role,
            content: this.sanitizeHTML(content),
            mode,
            files: files.map(file => ({
                name: this.escapeHtml(file.name),
                type: file.type,
                size: file.size,
                url: file.url || null
            })),
            timestamp: Date.now(),
            status: 'sent'
        };
    }

    addMessage(message) {
        const chat = this.state.chats.get(this.state.currentChatId);
        if (!chat) return;

        chat.messages.push(message);
        chat.updatedAt = Date.now();
        
        this.state.messages = chat.messages;
        this.state.conversationHistory.push({
            role: message.role,
            content: message.content,
            timestamp: message.timestamp
        });

        // Limit history size
        if (this.state.conversationHistory.length > this.security.maxHistoryLength) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-this.security.maxHistoryLength);
        }

        this.renderMessage(message);
        this.scrollToBottom();
        this.updateChatStats();
    }

    async getAIResponse(userMessage) {
        this.showTypingIndicator();

        try {
            const prompt = this.buildPrompt(userMessage);
            const response = await this.callAIService(prompt);
            
            this.hideTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.handleError('Ошибка получения ответа ИИ', error);
        }
    }

    buildPrompt(userMessage) {
        const context = this.buildConversationContext();
        const currentContent = userMessage.content;
        
        if (userMessage.files.length > 0) {
            const fileContext = userMessage.files.map(file => 
                `[Файл: ${file.name}, тип: ${file.type}]`
            ).join(', ');
            return `${context}\n\nПользователь (с файлами ${fileContext}): ${currentContent}\n\nАссистент:`;
        }
        
        return `${context}\n\nПользователь: ${currentContent}\n\nАссистент:`;
    }

    buildConversationContext() {
        const recentHistory = this.state.conversationHistory.slice(-6); // Last 6 messages
        
        if (recentHistory.length === 0) {
            return "Ты - KHAI, полезный AI-ассистент. Отвечай на русском языке понятно и подробно.";
        }

        let context = "Контекст разговора:\n";
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 200 ? 
                msg.content.substring(0, 200) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        return context + "\nПродолжи разговор:";
    }

    async callAIService(prompt) {
        // Validate prompt
        if (!prompt || prompt.length > 10000) {
            throw new Error('Неверный запрос');
        }

        // Simulate API call - replace with actual implementation
        return this.mockAIResponse(prompt);
    }

    async mockAIResponse(prompt) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const responses = [
            "Привет! Я KHAI - ваш AI-ассистент. Чем могу помочь?",
            "Отличный вопрос! Давайте разберем его подробнее...",
            "На основе вашего запроса, я могу предложить следующее...",
            "Понимаю ваш вопрос. Вот что я могу сказать по этой теме...",
            "Интересный запрос! Давайте обсудим это детальнее."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate streaming
        const words = response.split(' ');
        const stream = {
            [Symbol.asyncIterator]: async function* () {
                for (const word of words) {
                    if (this.state.generationAborted) break;
                    await new Promise(resolve => setTimeout(resolve, 50));
                    yield { text: word + ' ' };
                }
            }.bind(this)
        };

        return stream;
    }

    async processAIResponse(response) {
        const messageId = this.createStreamingMessage();
        let fullResponse = '';
        
        try {
            for await (const part of response) {
                if (this.state.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(messageId, fullResponse);
                }
            }
            
            if (!this.state.generationAborted && fullResponse) {
                this.finalizeStreamingMessage(messageId, fullResponse);
                this.addMessage(this.createMessage('assistant', fullResponse));
            }
        } catch (error) {
            if (!this.state.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка обработки ответа', error);
            }
        }
    }

    // ==================== UI MANAGEMENT ====================

    initializeUI() {
        this.applyTheme(this.state.settings.theme);
        this.updateChatList();
        this.updateUIState();
        this.setupVirtualScroll();
    }

    renderChat() {
        const container = this.getElement('#messagesContainer');
        if (!container) return;

        // Clear container
        container.innerHTML = '';
        this.performance.messageCache.clear();

        // Render messages with virtual scrolling
        this.renderMessagesVirtual();
        this.scrollToBottom();
    }

    renderMessagesVirtual() {
        const container = this.getElement('#messagesContainer');
        if (!container || this.state.messages.length === 0) return;

        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        // Calculate visible range
        this.performance.virtualScroll.visibleStart = Math.floor(scrollTop / this.performance.virtualScroll.itemHeight);
        this.performance.virtualScroll.visibleEnd = Math.min(
            this.performance.virtualScroll.visibleStart + Math.ceil(containerHeight / this.performance.virtualScroll.itemHeight) + 5,
            this.state.messages.length
        );

        // Render visible messages
        const fragment = document.createDocumentFragment();
        for (let i = this.performance.virtualScroll.visibleStart; i < this.performance.virtualScroll.visibleEnd; i++) {
            const message = this.state.messages[i];
            const messageElement = this.renderMessageElement(message);
            fragment.appendChild(messageElement);
        }

        container.innerHTML = '';
        container.appendChild(fragment);

        // Set container height for proper scrolling
        container.style.height = `${this.state.messages.length * this.performance.virtualScroll.itemHeight}px`;
    }

    renderMessageElement(message) {
        // Check cache first
        if (this.performance.messageCache.has(message.id)) {
            return this.performance.messageCache.get(message.id).cloneNode(true);
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role} message-${message.mode}`;
        messageElement.dataset.messageId = message.id;
        messageElement.style.height = `${this.performance.virtualScroll.itemHeight}px`;
        messageElement.style.position = 'absolute';
        messageElement.style.top = `${this.state.messages.findIndex(m => m.id === message.id) * this.performance.virtualScroll.itemHeight}px`;
        messageElement.style.width = '100%';

        const content = message.role === 'user' ? 
            this.formatUserMessage(message) : 
            this.formatAIMessage(message);

        messageElement.innerHTML = content;
        
        // Cache the element
        this.performance.messageCache.set(message.id, messageElement.cloneNode(true));

        return messageElement;
    }

    formatUserMessage(message) {
        return `
            <div class="message-content">
                <div class="message-text">${message.content}</div>
                ${message.files.length > 0 ? this.formatAttachedFiles(message.files) : ''}
                <div class="message-meta">
                    ${new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                </div>
            </div>
        `;
    }

    formatAIMessage(message) {
        const formattedContent = this.renderMarkdown(message.content);
        return `
            <div class="message-content">
                <div class="message-text">${formattedContent}</div>
                <div class="message-actions">
                    <button class="message-action" data-action="copy" title="Копировать">
                        <i class="ti ti-copy"></i>
                    </button>
                    <button class="message-action" data-action="regenerate" title="Перегенерировать">
                        <i class="ti ti-refresh"></i>
                    </button>
                </div>
                <div class="message-meta">
                    ${new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                </div>
            </div>
        `;
    }

    renderMarkdown(content) {
        // Simple markdown parser - replace with library like marked in production
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    formatAttachedFiles(files) {
        return `
            <div class="attached-files-preview">
                ${files.map(file => `
                    <div class="attached-file">
                        <i class="ti ti-file-text"></i>
                        <span>${file.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-assistant streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="streaming-text"></div>
            </div>
        `;
        
        this.getElement('#messagesContainer').appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        
        if (content.length > 50 && typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        streamingText.textContent = content;
        
        if (this.state.settings.autoScroll) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        messageElement.innerHTML = `
            <div class="message-content">
                ${this.renderMarkdown(fullContent)}
                <div class="message-actions">
                    <button class="message-action" data-action="copy" title="Копировать">
                        <i class="ti ti-copy"></i>
                    </button>
                    <button class="message-action" data-action="regenerate" title="Перегенерировать">
                        <i class="ti ti-refresh"></i>
                    </button>
                </div>
                <div class="message-meta">
                    ${new Date().toLocaleTimeString('ru-RU')}
                </div>
            </div>
        `;
        
        this.setupMessageActions(messageElement);
        this.scrollToBottom();
    }

    // ==================== EVENT HANDLERS ====================

    setupEventListeners() {
        this.setupGlobalEventListeners();
        this.setupChatEventListeners();
        this.setupInputEventListeners();
        this.setupMobileEventListeners();
    }

    setupGlobalEventListeners() {
        // Online/offline detection
        this.addEventListener(window, 'online', () => {
            this.state.isOnline = true;
            this.showNotification('Соединение восстановлено', 'success');
            this.updateConnectionStatus();
        });

        this.addEventListener(window, 'offline', () => {
            this.state.isOnline = false;
            this.showNotification('Отсутствует соединение', 'warning');
            this.updateConnectionStatus();
        });

        // Visibility change
        this.addEventListener(document, 'visibilitychange', () => {
            if (!document.hidden) {
                this.saveApplicationState();
            }
        });

        // Before unload
        this.addEventListener(window, 'beforeunload', () => {
            this.cleanup();
        });

        // Resize with debouncing
        this.addEventListener(window, 'resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    setupChatEventListeners() {
        // Send message
        this.addEventListener('#sendBtn', 'click', () => {
            this.handleSendMessage();
        });

        // Clear chat
        this.addEventListener('#clearChatBtn', 'click', () => {
            this.clearCurrentChat();
        });

        // New chat
        this.addEventListener('#newChatBtn', 'click', () => {
            this.createChat();
        });

        // Input handling
        const userInput = this.getElement('#userInput');
        if (userInput) {
            this.addEventListener(userInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            this.addEventListener(userInput, 'input', this.debounce(() => {
                this.autoResizeTextarea(userInput);
            }, 100));
        }

        // Message actions delegation
        this.addEventListener('#messagesContainer', 'click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                this.handleMessageAction(actionBtn.dataset.action, actionBtn.closest('.message'));
            }
        });
    }

    setupInputEventListeners() {
        // File attachment
        this.addEventListener('#attachFileBtn', 'click', () => {
            this.getElement('#fileInput').click();
        });

        this.addEventListener('#fileInput', 'change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Voice input
        this.addEventListener('#voiceInputBtn', 'click', () => {
            this.toggleVoiceInput();
        });

        // Mode switching
        this.addEventListener('.mode-btn', 'click', (e) => {
            const mode = e.target.closest('.mode-btn').dataset.mode;
            this.switchMode(mode);
        });
    }

    setupMobileEventListeners() {
        // Touch events for mobile
        this.addEventListener(document, 'touchstart', (e) => {
            this.mobile.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // Keyboard detection
        const visualViewport = window.visualViewport;
        if (visualViewport) {
            this.addEventListener(visualViewport, 'resize', this.debounce(() => {
                this.handleViewportResize();
            }, 100));
        }

        // Mobile sidebar
        this.addEventListener('#mobileSidebarToggle', 'click', () => {
            this.toggleMobileSidebar();
        });

        this.addEventListener('#sidebarClose', 'click', () => {
            this.toggleMobileSidebar(false);
        });
    }

    handleSendMessage() {
        const userInput = this.getElement('#userInput');
        const content = userInput.value.trim();
        this.sendMessage(content, this.state.currentMode);
    }

    handleMessageAction(action, messageElement) {
        const messageId = messageElement.dataset.messageId;
        const message = this.state.messages.find(m => m.id === messageId);
        
        if (!message) return;

        switch (action) {
            case 'copy':
                this.copyToClipboard(message.content);
                break;
            case 'regenerate':
                this.regenerateMessage(message);
                break;
            case 'delete':
                this.deleteMessage(messageId);
                break;
        }
    }

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const validFiles = Array.from(files).slice(0, 3); // Limit to 3 files
        
        for (const file of validFiles) {
            try {
                this.validateFile(file);
                await this.processFile(file);
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
        
        this.updateAttachedFilesDisplay();
    }

    // ==================== UTILITIES ====================

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    getElement(selector) {
        if (selector.startsWith('#')) {
            return document.getElementById(selector.slice(1));
        }
        if (selector.startsWith('.')) {
            return document.querySelector(selector);
        }
        return document.querySelector(selector);
    }

    addEventListener(element, event, handler, options) {
        const target = typeof element === 'string' ? this.getElement(element) : element;
        if (!target) return;

        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка', 'error');
            }
        };

        target.addEventListener(event, wrappedHandler, options);
        
        // Track for cleanup
        if (!this.performance.activeEventListeners.has(target)) {
            this.performance.activeEventListeners.set(target, []);
        }
        this.performance.activeEventListeners.get(target).push({ event, handler: wrappedHandler, options });
    }

    // ==================== SECURITY ====================

    validateFile(file) {
        if (file.size > this.security.maxFileSize) {
            throw new Error('Файл слишком большой (максимум 10MB)');
        }

        if (!this.security.allowedFileTypes.includes(file.type) && 
            !file.name.match(/\.(txt|json|jpg|jpeg|png|gif|webp)$/i)) {
            throw new Error('Тип файла не поддерживается');
        }

        // Additional security checks
        if (file.type.startsWith('image/')) {
            this.validateImageFile(file);
        }

        return true;
    }

    async validateImageFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                if (img.width > 4096 || img.height > 4096) {
                    reject(new Error('Размер изображения слишком большой'));
                } else {
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Некорректное изображение'));
            };
            
            img.src = url;
        });
    }

    // ==================== SETTINGS & CONFIGURATION ====================

    applySettings() {
        this.applyTheme(this.state.settings.theme);
        this.applyFontSize(this.state.settings.fontSize);
        this.updateUIState();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.state.settings.theme = theme;
        localStorage.setItem('khai-settings', JSON.stringify(this.state.settings));
    }

    applyFontSize(size) {
        document.documentElement.setAttribute('data-font-size', size);
        this.state.settings.fontSize = size;
        localStorage.setItem('khai-settings', JSON.stringify(this.state.settings));
    }

    switchMode(mode) {
        this.state.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.updateModeIndicator();
    }

    // ==================== MOBILE OPTIMIZATIONS ====================

    setupMobileOptimizations() {
        // Prevent zoom on focus (iOS)
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
            input.addEventListener('blur', () => {
                input.style.fontSize = '';
            });
        });

        // Handle viewport changes
        this.setupViewportHandling();
    }

    setupViewportHandling() {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        this.addEventListener(visualViewport, 'resize', this.debounce(() => {
            this.handleViewportResize();
        }, 100));
    }

    handleViewportResize() {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        const isKeyboardVisible = visualViewport.height < window.innerHeight * 0.7;
        
        if (isKeyboardVisible && !this.mobile.isKeyboardVisible) {
            this.mobile.isKeyboardVisible = true;
            this.scrollToBottom(true);
        } else if (!isKeyboardVisible && this.mobile.isKeyboardVisible) {
            this.mobile.isKeyboardVisible = false;
        }
    }

    toggleMobileSidebar(show = null) {
        const sidebar = this.getElement('#mobileSidebar');
        const overlay = this.getElement('#sidebarOverlay');
        
        const shouldShow = show !== null ? show : sidebar.style.display !== 'block';
        
        if (shouldShow) {
            sidebar.style.display = 'block';
            overlay.style.display = 'block';
            setTimeout(() => {
                sidebar.classList.add('active');
                overlay.classList.add('active');
            }, 10);
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                sidebar.style.display = 'none';
                overlay.style.display = 'none';
            }, 300);
        }
    }

    // ==================== PERFORMANCE OPTIMIZATIONS ====================

    setupVirtualScroll() {
        const container = this.getElement('#messagesContainer');
        if (!container) return;

        this.addEventListener(container, 'scroll', this.throttle(() => {
            this.handleScroll();
        }, 50));
    }

    handleScroll() {
        this.renderMessagesVirtual();
        
        // Update auto-scroll setting
        const container = this.getElement('#messagesContainer');
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.state.settings.autoScroll = (scrollHeight - scrollTop - clientHeight) < 100;
    }

    // ==================== ERROR HANDLING ====================

    handleError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error');
        
        if (this.state.isGenerating) {
            this.state.isGenerating = false;
            this.updateSendButton(false);
            this.hideTypingIndicator();
        }
    }

    // ==================== NOTIFICATIONS & UI UPDATES ====================

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;

        const container = this.getElement('#notificationContainer');
        container.appendChild(notification);

        // Auto remove after 5 seconds
        const timeout = setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(timeout);
            notification.remove();
        });

        // Add animation
        setTimeout(() => notification.style.opacity = '1', 10);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'circle-check',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateUIState() {
        this.updateConnectionStatus();
        this.updateChatStats();
        this.updateModeIndicator();
        this.updateSendButton(this.state.isGenerating);
    }

    updateConnectionStatus() {
        const icon = this.getElement('#footerConnectionIcon');
        const status = this.getElement('#footerConnectionStatus');
        
        if (icon && status) {
            if (this.state.isOnline) {
                icon.className = 'ti ti-wifi';
                status.textContent = 'Онлайн';
            } else {
                icon.className = 'ti ti-wifi-off';
                status.textContent = 'Офлайн';
            }
        }
    }

    // ==================== CLEANUP ====================

    cleanup() {
        // Clear all timeouts and intervals
        this.performance.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.performance.activeIntervals.forEach(intervalId => clearInterval(intervalId));
        this.performance.activeTimeouts.clear();
        this.performance.activeIntervals.clear();
        
        // Remove all event listeners
        this.performance.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.performance.activeEventListeners.clear();
        
        // Save state
        this.saveApplicationState();
        
        console.log('KHAI Chat cleaned up');
    }

    // ==================== PUBLIC API ====================

    async exportChats() {
        const exportData = {
            version: '2.1.0',
            exportedAt: new Date().toISOString(),
            chats: Object.fromEntries(this.state.chats),
            settings: this.state.settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async importChats(file) {
        try {
            const text = await this.readFileAsText(file);
            const importData = JSON.parse(text);
            
            if (importData.version !== '2.1.0') {
                throw new Error('Несовместимая версия файла');
            }

            // Validate import data
            if (!importData.chats || typeof importData.chats !== 'object') {
                throw new Error('Некорректный формат файла');
            }

            this.state.chats = new Map(Object.entries(importData.chats));
            this.state.settings = { ...this.state.settings, ...importData.settings };
            
            await this.switchChat(Array.from(this.state.chats.keys())[0]);
            this.saveApplicationState();
            
            this.showNotification('Чат успешно импортирован', 'success');
        } catch (error) {
            this.handleError('Ошибка импорта чата', error);
        }
    }

    // ==================== HELPER METHODS ====================

    // Note: The following methods need to be implemented based on your specific UI structure
    // These are placeholders that should be adapted to your actual DOM structure

    hideLoader() {
        const loader = document.getElementById('appLoader');
        if (loader) loader.style.display = 'none';
    }

    showWelcomeMessage() {
        // Implementation depends on your UI
    }

    renderMessage(message) {
        // Implementation depends on your UI
    }

    renderCurrentChat() {
        // Implementation depends on your UI
    }

    updateChatList() {
        // Implementation depends on your UI
    }

    scrollToBottom(instant = false) {
        // Implementation depends on your UI
    }

    showTypingIndicator() {
        // Implementation depends on your UI
    }

    hideTypingIndicator() {
        // Implementation depends on your UI
    }

    updateSendButton(isGenerating) {
        // Implementation depends on your UI
    }

    clearInput() {
        // Implementation depends on your UI
    }

    autoResizeTextarea(textarea) {
        // Implementation depends on your UI
    }

    copyToClipboard(text) {
        // Implementation depends on your UI
    }

    regenerateMessage(message) {
        // Implementation depends on your UI
    }

    deleteMessage(messageId) {
        // Implementation depends on your UI
    }

    toggleVoiceInput() {
        // Implementation depends on your UI
    }

    updateModeIndicator() {
        // Implementation depends on your UI
    }

    clearCurrentChat() {
        // Implementation depends on your UI
    }

    handleResize() {
        // Implementation depends on your UI
    }

    updateChatStats() {
        // Implementation depends on your UI
    }

    processFile(file) {
        // Implementation depends on your UI
    }

    updateAttachedFilesDisplay() {
        // Implementation depends on your UI
    }

    saveApplicationState() {
        // Implementation depends on your UI
    }

    saveCurrentChat() {
        // Implementation depends on your UI
    }

    showUpdateNotification() {
        // Implementation depends on your UI
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    buildConversationHistory(messages) {
        return (messages || []).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
        }));
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });

    // Initialize KHAI Chat
    window.khaiChat = new KHAIChat();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIChat;
}
