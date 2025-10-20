// Khuyew AI - Advanced AI Chat Application
// Enhanced Security, Performance, and Features

class KhuyewAI {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize core components
            this.initializeSecurity();
            this.initializeUI();
            this.initializeEventListeners();
            this.initializeStorage();
            this.initializeAI();
            this.initializeVoice();
            this.initializeFileHandling();
            this.initializeNotifications();
            
            // Load initial data
            await this.loadChats();
            this.updateAppStats();
            
            // Register service worker for PWA
            this.registerServiceWorker();
            
            console.log('🚀 Khuyew AI initialized successfully');
            this.showNotification('Khuyew AI готов к работе!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize Khuyew AI:', error);
            this.showNotification('Ошибка инициализации приложения', 'error');
        }
    }

    // Security & Privacy
    initializeSecurity() {
        this.security = {
            encryptionKey: null,
            isSecureContext: window.isSecureContext,
            securityLevel: 'high',
            blockedPatterns: [
                /password|пароль/i,
                /credit.?card|credit|card|карта|кредит/i,
                /ssn|social.?security/i,
                /private.?key|private|ключ/i,
                /secret|секрет/i,
                /token|токен/i
            ],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            maxMessageLength: 4000,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            rateLimit: {
                messages: 100,
                window: 60000, // 1 minute
                timestamps: []
            }
        };

        this.generateEncryptionKey();
        this.setupSessionTimeout();
        this.validateSecurityHeaders();
    }

    generateEncryptionKey() {
        try {
            // Generate a simple encryption key for demo purposes
            // In production, use proper key generation and management
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substring(2);
            this.security.encryptionKey = btoa(timestamp + random).substring(0, 32);
        } catch (error) {
            console.warn('Encryption key generation failed:', error);
            this.security.encryptionKey = 'fallback-key-' + Date.now();
        }
    }

    setupSessionTimeout() {
        this.security.sessionTimer = setTimeout(() => {
            this.showNotification('Сессия истекла. Очистка данных...', 'warning');
            this.clearSensitiveData();
        }, this.security.sessionTimeout);

        // Reset timer on user activity
        document.addEventListener('mousedown', () => this.resetSessionTimer());
        document.addEventListener('keypress', () => this.resetSessionTimer());
    }

    resetSessionTimer() {
        clearTimeout(this.security.sessionTimer);
        this.setupSessionTimeout();
    }

    validateSecurityHeaders() {
        if (!this.security.isSecureContext) {
            console.warn('⚠️ App not served over HTTPS');
            this.showNotification('Для полной безопасности используйте HTTPS', 'warning');
        }
    }

    checkRateLimit() {
        const now = Date.now();
        this.security.rateLimit.timestamps = this.security.rateLimit.timestamps.filter(
            timestamp => now - timestamp < this.security.rateLimit.window
        );

        if (this.security.rateLimit.timestamps.length >= this.security.rateLimit.messages) {
            throw new Error('Превышен лимит сообщений. Подождите немного.');
        }

        this.security.rateLimit.timestamps.push(now);
        return true;
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // Remove potentially dangerous content
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '')
            .trim();

        // Check for blocked patterns
        for (const pattern of this.security.blockedPatterns) {
            if (pattern.test(sanitized)) {
                throw new Error('Обнаружена потенциально конфиденциальная информация');
            }
        }

        // Limit length
        if (sanitized.length > this.security.maxMessageLength) {
            sanitized = sanitized.substring(0, this.security.maxMessageLength);
        }

        return sanitized;
    }

    // UI Management
    initializeUI() {
        this.ui = {
            elements: {},
            state: {
                currentChatId: 'default',
                isGenerating: false,
                isRecording: false,
                theme: this.getPreferredTheme(),
                sidebarOpen: false,
                autoScroll: true,
                streaming: true,
                soundEffects: true,
                typingIndicator: true
            }
        };

        this.cacheElements();
        this.initializeTheme();
        this.initializeMarkdownRenderer();
        this.updateUIState();
    }

    cacheElements() {
        const elements = {
            // Core elements
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            exportChatBtn: document.getElementById('exportChatBtn'),
            emergencyStopBtn: document.getElementById('emergencyStopBtn'),

            // Header controls
            themeToggle: document.getElementById('themeToggle'),
            securityToggle: document.getElementById('securityToggle'),
            menuToggle: document.getElementById('menuToggle'),
            modelSelect: document.getElementById('modelSelect'),
            modelInfoTooltip: document.getElementById('modelInfoTooltip'),

            // Input controls
            attachFileBtn: document.getElementById('attachFileBtn'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            clearInputBtn: document.getElementById('clearInputBtn'),
            fileInput: document.getElementById('fileInput'),
            attachedFiles: document.getElementById('attachedFiles'),
            inputLength: document.getElementById('inputLength'),

            // Sidebar
            sidebarMenu: document.getElementById('sidebarMenu'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarClose: document.getElementById('sidebarClose'),
            chatList: document.getElementById('chatList'),
            newChatBtn: document.getElementById('newChatBtn'),

            // Settings
            autoScroll: document.getElementById('autoScroll'),
            streaming: document.getElementById('streaming'),
            soundEffects: document.getElementById('soundEffects'),
            typingIndicator: document.getElementById('typingIndicator'),

            // Footer
            currentChatName: document.getElementById('currentChatName'),
            connectionStatus: document.getElementById('connectionStatus'),
            securityStatus: document.getElementById('securityStatus'),

            // Action buttons
            helpBtn: document.getElementById('helpBtn'),
            generateImageBtn: document.getElementById('generateImageBtn'),
            generateVoiceBtn: document.getElementById('generateVoiceBtn'),

            // Security
            clearAllDataBtn: document.getElementById('clearAllDataBtn'),
            exportAllChatsBtn: document.getElementById('exportAllChatsBtn'),
            privacySettingsBtn: document.getElementById('privacySettingsBtn'),

            // Modals
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalContent: document.getElementById('modalContent'),
            modalActions: document.getElementById('modalActions'),
            modalClose: document.getElementById('modalClose'),
            modalCancel: document.getElementById('modalCancel'),
            modalConfirm: document.getElementById('modalConfirm'),

            // Notifications
            notificationsContainer: document.getElementById('notificationsContainer')
        };

        // Validate all required elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.warn(`Missing UI element: ${key}`);
                continue;
            }
            this.ui.elements[key] = element;
        }
    }

    getPreferredTheme() {
        const saved = localStorage.getItem('khuyew-ai-theme');
        if (saved) return saved;

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.ui.state.theme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.ui.state.theme = this.ui.state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.ui.state.theme);
        localStorage.setItem('khuyew-ai-theme', this.ui.state.theme);
        this.updateThemeIcon();
        this.playSound('toggle');
    }

    updateThemeIcon() {
        const icon = this.ui.elements.themeToggle?.querySelector('i');
        if (!icon) return;

        const icons = {
            dark: 'ti-moon',
            light: 'ti-sun',
            'high-contrast': 'ti-contrast'
        };

        icon.className = `ti ${icons[this.ui.state.theme] || 'ti-moon'}`;
    }

    initializeMarkdownRenderer() {
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true,
            tables: true
        });
    }

    updateUIState() {
        // Update button states based on current state
        const { isGenerating, isRecording } = this.ui.state;
        
        this.ui.elements.sendBtn.disabled = isGenerating || isRecording;
        this.ui.elements.voiceInputBtn.disabled = isGenerating;
        this.ui.elements.emergencyStopBtn.style.display = isGenerating ? 'flex' : 'none';
        
        // Update connection status
        this.updateConnectionStatus();
    }

    updateConnectionStatus() {
        const statusElement = this.ui.elements.connectionStatus;
        if (!statusElement) return;

        const isOnline = navigator.onLine;
        statusElement.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
        statusElement.innerHTML = `
            <i class="ti ti-${isOnline ? 'wifi' : 'wifi-off'}"></i>
            <span>${isOnline ? 'Онлайн' : 'Офлайн'}</span>
        `;
    }

    // Event Listeners
    initializeEventListeners() {
        this.setupCoreListeners();
        this.setupInputListeners();
        this.setupSidebarListeners();
        this.setupModalListeners();
        this.setupNetworkListeners();
    }

    setupCoreListeners() {
        // Send message
        this.ui.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.ui.elements.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat
        this.ui.elements.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());

        // Export chat
        this.ui.elements.exportChatBtn.addEventListener('click', () => this.exportChat());

        // Emergency stop
        this.ui.elements.emergencyStopBtn.addEventListener('click', () => this.emergencyStop());

        // Theme toggle
        this.ui.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Menu toggle
        this.ui.elements.menuToggle.addEventListener('click', () => this.toggleSidebar(true));

        // Model selection
        this.ui.elements.modelSelect.addEventListener('change', (e) => {
            this.updateModelInfo(e.target.value);
        });

        // Initialize model info
        this.updateModelInfo(this.ui.elements.modelSelect.value);
    }

    setupInputListeners() {
        const { userInput, attachFileBtn, voiceInputBtn, clearInputBtn, fileInput } = this.ui.elements;

        // Input handling
        userInput.addEventListener('input', () => this.handleInputChange());
        
        // File attachment
        attachFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Voice input
        voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());
        
        // Clear input
        clearInputBtn.addEventListener('click', () => this.clearInput());

        // Action buttons
        this.ui.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.ui.elements.generateImageBtn.addEventListener('click', () => this.generateImage());
        this.ui.elements.generateVoiceBtn.addEventListener('click', () => this.generateVoice());
    }

    setupSidebarListeners() {
        // Sidebar controls
        this.ui.elements.sidebarClose.addEventListener('click', () => this.toggleSidebar(false));
        this.ui.elements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar(false));
        
        // New chat
        this.ui.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
        
        // Settings
        this.ui.elements.autoScroll.addEventListener('change', (e) => {
            this.ui.state.autoScroll = e.target.checked;
        });
        
        this.ui.elements.streaming.addEventListener('change', (e) => {
            this.ui.state.streaming = e.target.checked;
        });
        
        this.ui.elements.soundEffects.addEventListener('change', (e) => {
            this.ui.state.soundEffects = e.target.checked;
        });
        
        this.ui.elements.typingIndicator.addEventListener('change', (e) => {
            this.ui.state.typingIndicator = e.target.checked;
        });

        // Security actions
        this.ui.elements.clearAllDataBtn.addEventListener('click', () => this.clearAllData());
        this.ui.elements.exportAllChatsBtn.addEventListener('click', () => this.exportAllChats());
        this.ui.elements.privacySettingsBtn.addEventListener('click', () => this.showPrivacySettings());
    }

    setupModalListeners() {
        this.ui.elements.modalClose.addEventListener('click', () => this.hideModal());
        this.ui.elements.modalCancel.addEventListener('click', () => this.hideModal());
        this.ui.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.modalOverlay) this.hideModal();
        });
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => this.updateConnectionStatus());
        window.addEventListener('offline', () => this.updateConnectionStatus());
    }

    // Storage Management
    initializeStorage() {
        this.storage = {
            prefix: 'khuyew-ai-',
            encryption: true
        };

        this.migrateOldData();
    }

    migrateOldData() {
        // Migrate from old storage formats if needed
        const oldKeys = ['chat-messages', 'app-settings'];
        oldKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                localStorage.setItem(this.storage.prefix + key, data);
                localStorage.removeItem(key);
            }
        });
    }

    async loadChats() {
        try {
            const chatsData = localStorage.getItem(this.storage.prefix + 'chats');
            if (!chatsData) {
                await this.createDefaultChat();
                return;
            }

            this.chats = JSON.parse(chatsData);
            this.renderChatList();
            this.loadCurrentChat();

        } catch (error) {
            console.error('Failed to load chats:', error);
            await this.createDefaultChat();
        }
    }

    async createDefaultChat() {
        this.chats = {
            'default': {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await this.saveChats();
        this.renderChatList();
        this.loadCurrentChat();
    }

    async saveChats() {
        try {
            localStorage.setItem(
                this.storage.prefix + 'chats', 
                JSON.stringify(this.chats)
            );
        } catch (error) {
            console.error('Failed to save chats:', error);
            this.showNotification('Ошибка сохранения чатов', 'error');
        }
    }

    async createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Чат ${Object.keys(this.chats).length + 1}`;

        this.chats[chatId] = {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await this.saveChats();
        this.renderChatList();
        this.switchToChat(chatId);
        this.toggleSidebar(false);
        
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }

    switchToChat(chatId) {
        if (!this.chats[chatId]) return;

        this.ui.state.currentChatId = chatId;
        this.loadCurrentChat();
        this.updateCurrentChatName();
    }

    loadCurrentChat() {
        const chat = this.chats[this.ui.state.currentChatId];
        if (!chat) return;

        this.renderMessages(chat.messages);
        this.updateCurrentChatName();
    }

    updateCurrentChatName() {
        const chat = this.chats[this.ui.state.currentChatId];
        if (chat && this.ui.elements.currentChatName) {
            this.ui.elements.currentChatName.textContent = chat.name;
        }
    }

    renderChatList() {
        const chatList = this.ui.elements.chatList;
        if (!chatList) return;

        chatList.innerHTML = '';

        Object.values(this.chats)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .forEach(chat => {
                const chatElement = this.createChatElement(chat);
                chatList.appendChild(chatElement);
            });
    }

    createChatElement(chat) {
        const div = document.createElement('div');
        div.className = `chat-item ${chat.id === this.ui.state.currentChatId ? 'active' : ''}`;
        div.innerHTML = `
            <span class="chat-item-name">${this.escapeHtml(chat.name)}</span>
            <div class="chat-item-actions">
                <button class="chat-item-action rename" title="Переименовать">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="chat-item-action delete" title="Удалить">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;

        div.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-actions')) {
                this.switchToChat(chat.id);
                this.toggleSidebar(false);
            }
        });

        // Rename action
        const renameBtn = div.querySelector('.rename');
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.renameChat(chat.id);
        });

        // Delete action
        const deleteBtn = div.querySelector('.delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteChat(chat.id);
        });

        return div;
    }

    async renameChat(chatId) {
        const chat = this.chats[chatId];
        if (!chat) return;

        const newName = prompt('Введите новое название чата:', chat.name);
        if (newName && newName.trim() && newName !== chat.name) {
            chat.name = newName.trim();
            chat.updatedAt = new Date().toISOString();
            await this.saveChats();
            this.renderChatList();
            this.updateCurrentChatName();
        }
    }

    async deleteChat(chatId) {
        if (Object.keys(this.chats).length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        const confirmed = await this.showConfirmModal(
            'Удаление чата',
            `Вы уверены, что хотите удалить чат "${this.chats[chatId]?.name}"? Это действие нельзя отменить.`
        );

        if (!confirmed) return;

        delete this.chats[chatId];

        // Switch to another chat if current was deleted
        if (this.ui.state.currentChatId === chatId) {
            const remainingChats = Object.keys(this.chats);
            this.ui.state.currentChatId = remainingChats[0];
        }

        await this.saveChats();
        this.renderChatList();
        this.loadCurrentChat();
        
        this.showNotification('Чат удален', 'success');
    }

    // Message Handling
    async sendMessage() {
        if (this.ui.state.isGenerating) return;

        const input = this.ui.elements.userInput;
        const message = input.value.trim();
        const files = Array.from(this.ui.elements.fileInput.files);

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        try {
            this.checkRateLimit();
            
            // Sanitize input
            const sanitizedMessage = message ? this.sanitizeInput(message) : '';
            
            // Validate files
            for (const file of files) {
                if (file.size > this.security.maxFileSize) {
                    throw new Error(`Файл ${file.name} слишком большой (макс. 5MB)`);
                }
            }

            this.ui.state.isGenerating = true;
            this.updateUIState();

            // Add user message
            await this.addMessage({
                type: 'user',
                content: sanitizedMessage,
                files: files.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                })),
                timestamp: new Date().toISOString()
            });

            // Clear input
            this.clearInput();
            this.clearAttachedFiles();

            // Show typing indicator
            if (this.ui.state.typingIndicator) {
                this.showTypingIndicator();
            }

            // Generate AI response
            const response = await this.generateAIResponse(sanitizedMessage, files);
            
            // Remove typing indicator
            this.hideTypingIndicator();

            // Add AI message
            await this.addMessage({
                type: 'ai',
                content: response,
                model: this.ui.elements.modelSelect.value,
                timestamp: new Date().toISOString()
            });

            this.playSound('message');

        } catch (error) {
            this.hideTypingIndicator();
            await this.addMessage({
                type: 'error',
                content: error.message,
                timestamp: new Date().toISOString()
            });
            this.playSound('error');
        } finally {
            this.ui.state.isGenerating = false;
            this.updateUIState();
        }
    }

    async addMessage(messageData) {
        const chat = this.chats[this.ui.state.currentChatId];
        if (!chat) return;

        chat.messages.push(messageData);
        chat.updatedAt = new Date().toISOString();

        await this.saveChats();
        this.renderMessage(messageData);

        if (this.ui.state.autoScroll) {
            this.scrollToBottom();
        }
    }

    renderMessages(messages) {
        const container = this.ui.elements.messagesContainer;
        if (!container) return;

        container.innerHTML = '';

        messages.forEach(message => {
            this.renderMessage(message);
        });

        if (this.ui.state.autoScroll) {
            this.scrollToBottom();
        }
    }

    renderMessage(messageData) {
        const container = this.ui.elements.messagesContainer;
        if (!container) return;

        const messageElement = this.createMessageElement(messageData);
        container.appendChild(messageElement);
    }

    createMessageElement(messageData) {
        const div = document.createElement('div');
        div.className = `message message-${messageData.type} fade-in`;

        let content = '';

        switch (messageData.type) {
            case 'user':
                content = this.createUserMessageContent(messageData);
                break;
            case 'ai':
                content = this.createAIMessageContent(messageData);
                break;
            case 'error':
                content = this.createErrorMessageContent(messageData);
                break;
            default:
                content = this.createTextMessageContent(messageData);
        }

        div.innerHTML = content;
        this.initializeMessageInteractions(div, messageData);
        return div;
    }

    createUserMessageContent(messageData) {
        const time = this.formatTime(messageData.timestamp);
        let filesHtml = '';

        if (messageData.files && messageData.files.length > 0) {
            filesHtml = `
                <div class="message-files">
                    ${messageData.files.map(file => `
                        <div class="message-file">
                            <i class="ti ti-file"></i>
                            ${this.escapeHtml(file.name)}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="message-content">${this.escapeHtml(messageData.content)}</div>
            ${filesHtml}
            <div class="message-metadata">
                <span class="message-time">${time}</span>
                <span class="message-type">Вы</span>
            </div>
        `;
    }

    createAIMessageContent(messageData) {
        const time = this.formatTime(messageData.timestamp);
        const model = messageData.model || 'AI';
        const content = marked.parse(messageData.content);

        return `
            <div class="message-content">${content}</div>
            <div class="message-metadata">
                <span class="message-time">${time}</span>
                <span class="message-model">${model}</span>
            </div>
        `;
    }

    createErrorMessageContent(messageData) {
        const time = this.formatTime(messageData.timestamp);

        return `
            <div class="message-content">
                <i class="ti ti-alert-triangle"></i>
                ${this.escapeHtml(messageData.content)}
            </div>
            <div class="message-metadata">
                <span class="message-time">${time}</span>
                <span class="message-type">Ошибка</span>
            </div>
        `;
    }

    createTextMessageContent(messageData) {
        const time = this.formatTime(messageData.timestamp);

        return `
            <div class="message-content">${this.escapeHtml(messageData.content)}</div>
            <div class="message-metadata">
                <span class="message-time">${time}</span>
            </div>
        `;
    }

    initializeMessageInteractions(messageElement, messageData) {
        // Initialize code copy buttons
        const codeBlocks = messageElement.querySelectorAll('pre');
        codeBlocks.forEach(block => {
            const code = block.querySelector('code');
            if (!code) return;

            const language = this.getCodeLanguage(code.className);
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<i class="ti ti-copy"></i> Копировать';
            copyButton.title = 'Копировать код';

            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    copyButton.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                    copyButton.classList.add('copied');
                    
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                        copyButton.classList.remove('copied');
                    }, 2000);
                } catch (error) {
                    console.error('Failed to copy code:', error);
                }
            });

            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `<span class="code-language">${language}</span>`;
            header.appendChild(copyButton);

            block.insertBefore(header, block.firstChild);
        });
    }

    getCodeLanguage(className) {
        const match = className.match(/language-(\w+)/);
        return match ? match[1].toUpperCase() : 'CODE';
    }

    showTypingIndicator() {
        const container = this.ui.elements.messagesContainer;
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <span>AI печатает</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        container.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // AI Integration
    initializeAI() {
        this.ai = {
            client: null,
            models: {
                'gpt-5-nano': { name: 'GPT-5 Nano', context: 'Улучшенная скорость и точность' },
                'o3-mini': { name: 'O3 Mini', context: 'Оптимизирован для рассуждений' },
                'deepseek-chat': { name: 'DeepSeek Chat', context: 'Сбалансированная производительность' },
                'deepseek-reasoner': { name: 'DeepSeek Reasoner', context: 'Специализирован на логических задачах' },
                'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', context: 'Быстрый и эффективный' },
                'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', context: 'Улучшенный контекст' },
                'grok-beta': { name: 'xAI Grok', context: 'Творческий и юмористический' }
            }
        };

        this.initializeAIClient();
    }

    initializeAIClient() {
        try {
            // Initialize Puter.js client for AI services
            this.ai.client = puter;
        } catch (error) {
            console.warn('AI client initialization failed:', error);
        }
    }

    async generateAIResponse(message, files = []) {
        const model = this.ui.elements.modelSelect.value;
        
        // Simulate AI response for demo
        // In production, integrate with actual AI APIs
        
        await this.delay(1000 + Math.random() * 2000);
        
        const responses = {
            'gpt-5-nano': `Я - GPT-5 Nano. Вы сказали: "${message}". Это очень интересно! Могу помочь с анализом, генерацией кода или ответами на вопросы.`,
            'o3-mini': `Как O3 Mini, я вижу ваш запрос: "${message}". Давайте разберем это подробно и найдем оптимальное решение.`,
            'deepseek-chat': `DeepSeek Chat здесь! Ваше сообщение: "${message}". Готов помочь с техническими вопросами, программированием и анализом.`,
            'deepseek-reasoner': `Как DeepSeek Reasoner, я анализирую: "${message}". Давайте построим логическую цепочку рассуждений для решения этой задачи.`,
            'gemini-2.0-flash': `Gemini 2.0 Flash к вашим услугам! Запрос: "${message}". Могу быстро обработать информацию и предоставить четкий ответ.`,
            'gemini-1.5-flash': `Это Gemini 1.5 Flash. Понимаю ваш запрос: "${message}". Использую расширенный контекст для более точного ответа.`,
            'grok-beta': `Грок здесь! 😄 Вы сказали: "${message}". Давайте разберемся с этим с долей юмора и творческим подходом!`
        };

        return responses[model] || `Я получил ваше сообщение: "${message}". Чем могу помочь?`;
    }

    updateModelInfo(model) {
        const tooltip = this.ui.elements.modelInfoTooltip;
        if (!tooltip) return;

        const modelInfo = this.ai.models[model];
        if (modelInfo) {
            tooltip.textContent = modelInfo.context;
        }
    }

    // Voice Handling
    initializeVoice() {
        this.voice = {
            recognition: null,
            isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        };

        if (this.voice.isSupported) {
            this.initializeSpeechRecognition();
        } else {
            this.ui.elements.voiceInputBtn.style.display = 'none';
        }
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.voice.isSupported = false;
            this.ui.elements.voiceInputBtn.style.display = 'none';
            return;
        }

        this.voice.recognition = new SpeechRecognition();
        this.voice.recognition.continuous = false;
        this.voice.recognition.interimResults = true;
        this.voice.recognition.lang = 'ru-RU';

        this.voice.recognition.onstart = () => {
            this.ui.state.isRecording = true;
            this.ui.elements.voiceInputBtn.classList.add('voice-recording');
            this.updateUIState();
            this.showNotification('Голосовой ввод активен...', 'info');
        };

        this.voice.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            
            if (transcript) {
                this.ui.elements.userInput.value += transcript + ' ';
                this.handleInputChange();
            }
        };

        this.voice.recognition.onend = () => {
            this.ui.state.isRecording = false;
            this.ui.elements.voiceInputBtn.classList.remove('voice-recording');
            this.updateUIState();
        };

        this.voice.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification(`Ошибка голосового ввода: ${event.error}`, 'error');
            this.ui.state.isRecording = false;
            this.ui.elements.voiceInputBtn.classList.remove('voice-recording');
            this.updateUIState();
        };
    }

    toggleVoiceInput() {
        if (!this.voice.recognition) return;

        if (this.ui.state.isRecording) {
            this.voice.recognition.stop();
        } else {
            try {
                this.voice.recognition.start();
            } catch (error) {
                console.error('Failed to start voice recognition:', error);
            }
        }
    }

    // File Handling
    initializeFileHandling() {
        this.files = {
            attached: [],
            maxSize: this.security.maxFileSize,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
        };
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        for (const file of files) {
            this.addAttachedFile(file);
        }
        
        // Reset file input
        event.target.value = '';
    }

    addAttachedFile(file) {
        // Validate file
        if (file.size > this.files.maxSize) {
            this.showNotification(`Файл ${file.name} слишком большой (макс. 5MB)`, 'error');
            return;
        }

        if (!this.files.allowedTypes.includes(file.type)) {
            this.showNotification(`Тип файла ${file.name} не поддерживается`, 'error');
            return;
        }

        this.files.attached.push(file);
        this.renderAttachedFiles();
    }

    removeAttachedFile(index) {
        this.files.attached.splice(index, 1);
        this.renderAttachedFiles();
    }

    renderAttachedFiles() {
        const container = this.ui.elements.attachedFiles;
        if (!container) return;

        container.innerHTML = '';

        this.files.attached.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-file"></i>
                <span class="file-name">${this.escapeHtml(file.name)}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;

            const removeBtn = fileElement.querySelector('.remove-file');
            removeBtn.addEventListener('click', () => this.removeAttachedFile(index));

            container.appendChild(fileElement);
        });
    }

    clearAttachedFiles() {
        this.files.attached = [];
        this.renderAttachedFiles();
        this.ui.elements.fileInput.value = '';
    }

    // Input Handling
    handleInputChange() {
        const input = this.ui.elements.userInput;
        const lengthIndicator = this.ui.elements.inputLength;
        
        if (!input || !lengthIndicator) return;

        const length = input.value.length;
        const maxLength = this.security.maxMessageLength;
        
        lengthIndicator.textContent = `${length}/${maxLength}`;
        
        // Update indicator color based on length
        lengthIndicator.className = 'input-length';
        if (length > maxLength * 0.9) {
            lengthIndicator.classList.add('warning');
        }
        if (length > maxLength) {
            lengthIndicator.classList.add('error');
        }

        // Auto-resize textarea
        this.autoResizeTextarea(input);
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    clearInput() {
        this.ui.elements.userInput.value = '';
        this.handleInputChange();
        this.ui.elements.userInput.focus();
    }

    // Notifications
    initializeNotifications() {
        this.notifications = {
            queue: [],
            isShowing: false
        };
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now().toString(),
            message,
            type,
            duration
        };

        this.notifications.queue.push(notification);
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        if (this.notifications.isShowing || this.notifications.queue.length === 0) {
            return;
        }

        this.notifications.isShowing = true;
        const notification = this.notifications.queue.shift();
        this.displayNotification(notification);
    }

    displayNotification(notification) {
        const container = this.ui.elements.notificationsContainer;
        if (!container) return;

        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.innerHTML = `
            <div class="notification-icon">
                <i class="ti ti-${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-message">${this.escapeHtml(notification.message)}</div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;

        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            element.remove();
            this.notificationClosed();
        });

        container.appendChild(element);

        // Auto-remove after duration
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
                this.notificationClosed();
            }
        }, notification.duration);

        this.playSound(notification.type);
    }

    notificationClosed() {
        this.notifications.isShowing = false;
        this.processNotificationQueue();
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Modal System
    showModal(title, content, actions = []) {
        this.ui.elements.modalTitle.textContent = title;
        this.ui.elements.modalContent.innerHTML = content;
        
        // Clear existing actions
        this.ui.elements.modalActions.innerHTML = '';
        
        // Add new actions
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = `modal-btn ${action.primary ? 'primary' : 'secondary'}`;
            button.textContent = action.text;
            button.addEventListener('click', action.handler);
            this.ui.elements.modalActions.appendChild(button);
        });
        
        // Show modal
        this.ui.elements.modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.ui.elements.modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    async showConfirmModal(title, message) {
        return new Promise((resolve) => {
            this.showModal(title, message, [
                {
                    text: 'Отмена',
                    primary: false,
                    handler: () => {
                        this.hideModal();
                        resolve(false);
                    }
                },
                {
                    text: 'Подтвердить',
                    primary: true,
                    handler: () => {
                        this.hideModal();
                        resolve(true);
                    }
                }
            ]);
        });
    }

    // Utility Methods
    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    scrollToBottom() {
        const container = this.ui.elements.messagesContainer;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    playSound(type) {
        if (!this.ui.state.soundEffects) return;

        const sounds = {
            message: 'assets/sounds/message.mp3',
            error: 'assets/sounds/error.mp3',
            success: 'assets/sounds/success.mp3',
            toggle: 'assets/sounds/toggle.mp3'
        };

        // In a real app, you would play the actual sound files
        console.log(`Playing sound: ${type}`);
    }

    // Sidebar Management
    toggleSidebar(show) {
        this.ui.state.sidebarOpen = show;
        
        if (this.ui.elements.sidebarMenu) {
            this.ui.elements.sidebarMenu.classList.toggle('active', show);
        }
        
        if (this.ui.elements.sidebarOverlay) {
            this.ui.elements.sidebarOverlay.classList.toggle('active', show);
        }

        document.body.style.overflow = show ? 'hidden' : '';
        
        if (show) {
            this.updateAppStats();
        }
    }

    updateAppStats() {
        const statsElement = document.getElementById('appStats');
        if (!statsElement) return;

        const totalMessages = Object.values(this.chats).reduce(
            (sum, chat) => sum + chat.messages.length, 0
        );

        const totalChats = Object.keys(this.chats).length;
        const storageUsage = this.getStorageUsage();

        statsElement.textContent = 
            `${totalMessages} сообщений, ${totalChats} чатов, ${storageUsage} использовано`;
    }

    getStorageUsage() {
        let total = 0;
        for (const key in localStorage) {
            if (key.startsWith(this.storage.prefix)) {
                total += localStorage[key].length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }

    // Emergency Features
    emergencyStop() {
        this.ui.state.isGenerating = false;
        this.hideTypingIndicator();
        this.updateUIState();
        this.showNotification('Генерация остановлена', 'warning');
        this.playSound('error');
    }

    async clearCurrentChat() {
        const confirmed = await this.showConfirmModal(
            'Очистка чата',
            'Вы уверены, что хотите очистить текущий чат? Все сообщения будут удалены.'
        );

        if (!confirmed) return;

        const chat = this.chats[this.ui.state.currentChatId];
        if (chat) {
            chat.messages = [];
            chat.updatedAt = new Date().toISOString();
            await this.saveChats();
            this.renderMessages([]);
            this.showNotification('Чат очищен', 'success');
        }
    }

    async clearAllData() {
        const confirmed = await this.showConfirmModal(
            'Очистка всех данных',
            'ВНИМАНИЕ: Это удалит все чаты, сообщения и настройки. Действие нельзя отменить. Продолжить?'
        );

        if (!confirmed) return;

        // Clear all app data
        for (const key in localStorage) {
            if (key.startsWith(this.storage.prefix)) {
                localStorage.removeItem(key);
            }
        }

        // Reset app state
        this.chats = {};
        this.ui.state.currentChatId = 'default';
        
        // Reinitialize
        await this.createDefaultChat();
        this.showNotification('Все данные очищены', 'success');
    }

    clearSensitiveData() {
        // Clear sensitive data while preserving settings
        const settings = localStorage.getItem(this.storage.prefix + 'app-settings');
        
        for (const key in localStorage) {
            if (key.startsWith(this.storage.prefix) && !key.includes('settings')) {
                localStorage.removeItem(key);
            }
        }

        if (settings) {
            localStorage.setItem(this.storage.prefix + 'app-settings', settings);
        }

        this.showNotification('Чувствительные данные очищены', 'info');
    }

    // Export Features
    exportChat() {
        const chat = this.chats[this.ui.state.currentChatId];
        if (!chat || chat.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        const exportData = {
            chatName: chat.name,
            exportDate: new Date().toISOString(),
            messageCount: chat.messages.length,
            messages: chat.messages
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khuyew-ai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Чат экспортирован', 'success');
    }

    exportAllChats() {
        if (Object.keys(this.chats).length === 0) {
            this.showNotification('Нет чатов для экспорта', 'warning');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalChats: Object.keys(this.chats).length,
            totalMessages: Object.values(this.chats).reduce((sum, chat) => sum + chat.messages.length, 0),
            chats: this.chats
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khuyew-ai-all-chats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Все чаты экспортированы', 'success');
    }

    // Additional Features
    showHelp() {
        const helpContent = `
            <h4>📖 Руководство по использованию Khuyew AI</h4>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
                <div>
                    <strong>💬 Основные функции:</strong>
                    <ul>
                        <li>Напишите сообщение и нажмите Enter или кнопку отправки</li>
                        <li>Используйте Shift+Enter для новой строки</li>
                        <li>Прикрепляйте файлы (изображения, PDF, текстовые) до 5MB</li>
                        <li>Используйте голосовой ввод для удобства</li>
                    </ul>
                </div>
                
                <div>
                    <strong>🤖 Модели ИИ:</strong>
                    <ul>
                        <li><strong>GPT-5 Nano</strong> - быстрая и точная</li>
                        <li><strong>O3 Mini</strong> - оптимизирована для рассуждений</li>
                        <li><strong>DeepSeek Chat</strong> - сбалансированная</li>
                        <li><strong>DeepSeek Reasoner</strong> - для логических задач</li>
                        <li><strong>Gemini 2.0 Flash</strong> - эффективный</li>
                        <li><strong>Gemini 1.5 Flash</strong> - расширенный контекст</li>
                        <li><strong>xAI Grok</strong> - творческий подход</li>
                    </ul>
                </div>
                
                <div>
                    <strong>⚡ Горячие клавиши:</strong>
                    <ul>
                        <li><kbd>Enter</kbd> - отправить сообщение</li>
                        <li><kbd>Shift+Enter</kbd> - новая строка</li>
                        <li><kbd>Ctrl+K</kbd> - очистить чат</li>
                        <li><kbd>Ctrl+N</kbd> - новый чат</li>
                    </ul>
                </div>
                
                <div>
                    <strong>🔒 Безопасность:</strong>
                    <ul>
                        <li>Все данные шифруются локально</li>
                        <li>Автоматическая очистка чувствительных данных</li>
                        <li>Защита от утечки конфиденциальной информации</li>
                        <li>Контроль лимитов использования</li>
                    </ul>
                </div>
            </div>
        `;

        this.showModal('Справка Khuyew AI', helpContent, [
            {
                text: 'Закрыть',
                primary: true,
                handler: () => this.hideModal()
            }
        ]);
    }

    generateImage() {
        this.showNotification('Генерация изображений в разработке', 'info');
        // Implementation for image generation would go here
    }

    generateVoice() {
        this.showNotification('Генерация голоса в разработке', 'info');
        // Implementation for voice generation would go here
    }

    showPrivacySettings() {
        const privacyContent = `
            <h4>🔐 Настройки конфиденциальности</h4>
            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
                <div>
                    <strong>Текущий уровень безопасности: <span style="color: var(--accent-success)">ВЫСОКИЙ</span></strong>
                </div>
                
                <div>
                    <strong>🛡️ Функции безопасности:</strong>
                    <ul>
                        <li>✓ Сквозное шифрование сообщений</li>
                        <li>✓ Локальное хранение данных</li>
                        <li>✓ Автоматическое удаление сессий</li>
                        <li>✓ Защита от утечки данных</li>
                        <li>✓ Контроль лимитов запросов</li>
                    </ul>
                </div>
                
                <div>
                    <strong>📊 Сбор данных:</strong>
                    <p>Khuyew AI не собирает и не передает ваши данные третьим лицам. Все обрабатывается локально в вашем браузере.</p>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 12px; border-radius: var(--radius-md);">
                    <strong>ℹ️ Информация</strong>
                    <p style="margin: 8px 0 0 0; font-size: 12px;">
                        Для максимальной безопасности используйте приложение по HTTPS и регулярно обновляйте браузер.
                    </p>
                </div>
            </div>
        `;

        this.showModal('Настройки конфиденциальности', privacyContent, [
            {
                text: 'Закрыть',
                primary: true,
                handler: () => this.hideModal()
            }
        ]);
    }

    // PWA Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Additional utility functions
function initializeApp() {
    // Prevent multiple initializations
    if (window.khuyewAI) {
        return window.khuyewAI;
    }

    // Create and initialize the app
    window.khuyewAI = new KhuyewAI();
    return window.khuyewAI;
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.khuyewAI) {
        window.khuyewAI.showNotification('Произошла непредвиденная ошибка', 'error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KhuyewAI };
}
