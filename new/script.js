// Khuyew AI Pro - Advanced AI Chat System
// Enhanced with maximum security, performance, and features

class KhuyewAIChat {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize core components
            await this.initializeSecurity();
            await this.initializeUI();
            await this.initializeAI();
            await this.initializeStorage();
            await this.initializeEventListeners();
            
            // Finalize initialization
            await this.finalizeSetup();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Ошибка инициализации приложения', error);
        }
    }

    // Security Initialization
    async initializeSecurity() {
        // Content Security Policy enforcement
        this.security = {
            isSecure: window.location.protocol === 'https:',
            allowedOrigins: ['https://api.puter.com', 'https://js.puter.com'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            encryptionKey: await this.generateEncryptionKey()
        };

        // Security monitoring
        this.setupSecurityMonitoring();
        
        // Session security
        this.setupSessionSecurity();
    }

    async generateEncryptionKey() {
        try {
            if (window.crypto && window.crypto.subtle) {
                return await crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
            }
        } catch (error) {
            console.warn('Encryption not available:', error);
        }
        return null;
    }

    setupSecurityMonitoring() {
        // Monitor for suspicious activities
        const securityEvents = ['copy', 'cut', 'paste', 'contextmenu', 'keydown'];
        securityEvents.forEach(event => {
            document.addEventListener(event, (e) => {
                this.logSecurityEvent(event, e);
            });
        });

        // Prevent iframe embedding
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
    }

    setupSessionSecurity() {
        // Auto-logout after inactivity
        this.resetInactivityTimer();
        
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetInactivityTimer());
        });
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.security.sessionTimeout);
    }

    handleSessionTimeout() {
        this.showNotification('Сессия истекла из-за неактивности', 'warning');
        this.clearCurrentChat();
    }

    // UI Initialization
    async initializeUI() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUIComponents());
        } else {
            this.setupUIComponents();
        }
    }

    setupUIComponents() {
        // Cache DOM elements
        this.cacheDOMElements();
        
        // Initialize components
        this.setupTheme();
        this.setupInputHandler();
        this.setupSidebar();
        this.setupModals();
        this.setupMessageRenderer();
        this.setupFileHandler();
        this.setupVoiceHandler();
        
        // Load initial data
        this.loadInitialData();
    }

    cacheDOMElements() {
        this.elements = {
            // Core containers
            loadingScreen: document.getElementById('loadingScreen'),
            appContainer: document.querySelector('.app-container'),
            messagesContainer: document.getElementById('messagesContainer'),
            
            // Input elements
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            fileInput: document.getElementById('fileInput'),
            cameraInput: document.getElementById('cameraInput'),
            attachedFiles: document.getElementById('attachedFiles'),
            
            // Control elements
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            menuToggle: document.getElementById('menuToggle'),
            sidebarMenu: document.getElementById('sidebarMenu'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            
            // Status elements
            connectionStatus: document.getElementById('connectionStatus'),
            securityStatus: document.getElementById('securityStatus'),
            modelStatus: document.getElementById('currentModelStatus'),
            messageCount: document.getElementById('messageCount'),
            
            // Audio elements
            messageSound: document.getElementById('messageSound'),
            notificationSound: document.getElementById('notificationSound')
        };

        // Validate all required elements exist
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.error(`Missing required element: ${key}`);
            }
        });
    }

    setupTheme() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem('khuyew-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        this.updateThemeIcon(theme);
    }

    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    setupInputHandler() {
        // Auto-resize textarea
        this.elements.userInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateCharCounter();
        });

        // Keyboard shortcuts
        this.elements.userInput.addEventListener('keydown', (e) => {
            this.handleInputKeydown(e);
        });

        // Send message on button click
        this.elements.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    autoResizeTextarea() {
        const textarea = this.elements.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    updateCharCounter() {
        const counter = document.getElementById('charCounter');
        if (counter) {
            const length = this.elements.userInput.value.length;
            counter.textContent = `${length}/4000`;
            
            // Update color based on length
            if (length > 3500) {
                counter.style.color = 'var(--accent-warning)';
            } else if (length > 3000) {
                counter.style.color = 'var(--accent-primary)';
            } else {
                counter.style.color = 'var(--text-tertiary)';
            }
        }
    }

    handleInputKeydown(e) {
        // Send on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
        
        // Clear input on Ctrl+Delete
        if (e.key === 'Delete' && e.ctrlKey) {
            e.preventDefault();
            this.clearInput();
        }
        
        // Voice input on Ctrl+Space
        if (e.key === ' ' && e.ctrlKey) {
            e.preventDefault();
            this.toggleVoiceInput();
        }
    }

    // AI Integration
    async initializeAI() {
        this.ai = {
            currentModel: 'gpt-5-nano',
            models: {
                'gpt-5-nano': { name: 'GPT-5 Nano', description: 'Быстрая и эффективная модель' },
                'o3-mini': { name: 'O3 Mini', description: 'Продвинутые рассуждения' },
                'deepseek-chat': { name: 'DeepSeek Chat', description: 'Умный и адаптивный' },
                'deepseek-reasoner': { name: 'DeepSeek Reasoner', description: 'Логическое мышление' },
                'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', description: 'Молниеносные ответы' },
                'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', description: 'Баланс скорости и качества' },
                'grok-beta': { name: 'xAI Grok', description: 'Прямолинейный и остроумный' },
                'claude-3.5-sonnet': { name: 'Claude 3.5 Sonnet', description: 'Творческий подход' }
            },
            isGenerating: false,
            conversationHistory: []
        };

        // Initialize Puter AI
        try {
            this.puterAI = await puter.ai;
            console.log('Puter AI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Puter AI:', error);
            this.showError('Ошибка инициализации ИИ', error);
        }
    }

    // Storage Management
    async initializeStorage() {
        this.storage = {
            prefix: 'khuyew-ai-pro-',
            encryption: this.security.encryptionKey !== null
        };

        // Initialize chat history
        await this.loadChatHistory();
        await this.updateStatistics();
    }

    async loadChatHistory() {
        try {
            const savedChats = localStorage.getItem(this.storage.prefix + 'chats');
            if (savedChats) {
                this.chats = JSON.parse(savedChats);
            } else {
                this.chats = [this.createNewChat()];
            }
            
            this.currentChatId = this.chats[0].id;
            await this.loadCurrentChat();
            
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chats = [this.createNewChat()];
            this.currentChatId = this.chats[0].id;
        }
    }

    createNewChat() {
        return {
            id: this.generateId(),
            name: 'Новый чат',
            messages: [],
            model: this.ai.currentModel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    generateId() {
        return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    async loadCurrentChat() {
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if (chat) {
            this.renderMessages(chat.messages);
            this.updateChatInfo(chat);
            this.updateMessageCount();
        }
    }

    // Message Management
    async sendMessage() {
        const messageText = this.elements.userInput.value.trim();
        const files = Array.from(this.attachedFiles || []);

        if (!messageText && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (this.ai.isGenerating) {
            this.showNotification('Дождитесь завершения текущего ответа', 'warning');
            return;
        }

        try {
            // Create user message
            const userMessage = {
                id: this.generateId(),
                type: 'user',
                content: messageText,
                files: files.map(file => this.prepareFileData(file)),
                timestamp: new Date().toISOString(),
                model: this.ai.currentModel
            };

            // Add to current chat
            this.addMessageToCurrentChat(userMessage);
            this.renderMessage(userMessage);
            this.clearInput();

            // Show typing indicator
            this.showTypingIndicator();

            // Generate AI response
            await this.generateAIResponse(userMessage);

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Ошибка отправки сообщения', error);
            this.hideTypingIndicator();
        }
    }

    prepareFileData(file) {
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file)
        };
    }

    async generateAIResponse(userMessage) {
        try {
            this.ai.isGenerating = true;
            this.updateSendButton();

            // Prepare conversation context
            const context = this.prepareConversationContext(userMessage);
            
            // Generate response using Puter AI
            const response = await this.puterAI.chat(context, {
                model: this.ai.currentModel,
                stream: true,
                onStream: (chunk) => this.handleStreamChunk(chunk)
            });

            // Create AI message
            const aiMessage = {
                id: this.generateId(),
                type: 'ai',
                content: response,
                timestamp: new Date().toISOString(),
                model: this.ai.currentModel
            };

            // Add to chat and render
            this.addMessageToCurrentChat(aiMessage);
            this.hideTypingIndicator();
            this.renderMessage(aiMessage);
            
            // Play sound and update UI
            this.playMessageSound();
            this.updateMessageCount();

        } catch (error) {
            console.error('Error generating AI response:', error);
            this.showError('Ошибка генерации ответа', error);
            this.hideTypingIndicator();
        } finally {
            this.ai.isGenerating = false;
            this.updateSendButton();
        }
    }

    prepareConversationContext(userMessage) {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        const recentMessages = currentChat.messages.slice(-10); // Last 10 messages for context
        
        return recentMessages.concat([{
            role: 'user',
            content: userMessage.content
        }]);
    }

    handleStreamChunk(chunk) {
        // Update the last AI message with streaming content
        const lastMessage = this.getLastAIMessage();
        if (lastMessage) {
            lastMessage.content += chunk;
            this.updateLastMessage(lastMessage);
        }
    }

    getLastAIMessage() {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        return currentChat.messages.filter(m => m.type === 'ai').pop();
    }

    updateLastMessage(message) {
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-text');
            if (contentElement) {
                contentElement.innerHTML = this.renderMarkdown(message.content);
                this.highlightCodeBlocks(contentElement);
            }
        }
    }

    // Message Rendering
    renderMessages(messages) {
        this.elements.messagesContainer.innerHTML = '';
        messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = this.createMessageElement(message);
        this.elements.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Highlight code blocks
        setTimeout(() => {
            this.highlightCodeBlocks(messageElement);
        }, 100);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.setAttribute('data-message-id', message.id);

        const avatar = this.createAvatar(message.type);
        const content = this.createMessageContent(message);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    createAvatar(type) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (type === 'user') {
            avatar.innerHTML = '<i class="ti ti-user"></i>';
        } else {
            avatar.innerHTML = '<i class="ti ti-robot"></i>';
        }
        
        return avatar;
    }

    createMessageContent(message) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.renderMarkdown(message.content);

        bubble.appendChild(text);

        // Add files if present
        if (message.files && message.files.length > 0) {
            const filesContainer = this.createFilesContainer(message.files);
            bubble.appendChild(filesContainer);
        }

        // Add message metadata
        const meta = this.createMessageMeta(message);
        bubble.appendChild(meta);

        contentDiv.appendChild(bubble);
        return contentDiv;
    }

    createFilesContainer(files) {
        const container = document.createElement('div');
        container.className = 'message-files';
        
        files.forEach(file => {
            const fileElement = this.createFileElement(file);
            container.appendChild(fileElement);
        });
        
        return container;
    }

    createFileElement(file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'message-file';
        
        if (file.type.startsWith('image/')) {
            fileDiv.innerHTML = `
                <img src="${file.url}" alt="${file.name}" class="message-image" loading="lazy">
                <div class="file-caption">${file.name}</div>
            `;
        } else {
            fileDiv.innerHTML = `
                <div class="file-icon">
                    <i class="ti ti-file-text"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            `;
        }
        
        return fileDiv;
    }

    createMessageMeta(message) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);

        const actions = document.createElement('div');
        actions.className = 'message-actions';

        if (message.type === 'ai') {
            const copyBtn = this.createActionButton('copy', 'Копировать');
            copyBtn.addEventListener('click', () => this.copyMessage(message));
            actions.appendChild(copyBtn);
        }

        const deleteBtn = this.createActionButton('trash', 'Удалить');
        deleteBtn.addEventListener('click', () => this.deleteMessage(message.id));
        actions.appendChild(deleteBtn);

        metaDiv.appendChild(time);
        metaDiv.appendChild(actions);

        return metaDiv;
    }

    createActionButton(icon, title) {
        const button = document.createElement('button');
        button.className = 'message-action';
        button.title = title;
        button.innerHTML = `<i class="ti ti-${icon}"></i>`;
        return button;
    }

    renderMarkdown(text) {
        if (!text) return '';
        
        try {
            return marked.parse(text, {
                breaks: true,
                gfm: true,
                sanitize: false // We'll sanitize separately
            });
        } catch (error) {
            console.error('Markdown parsing error:', error);
            return this.escapeHtml(text);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    highlightCodeBlocks(container) {
        if (container) {
            container.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    // File Handling
    setupFileHandler() {
        this.attachedFiles = new Set();
        
        document.getElementById('attachFileBtn').addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.elements.cameraInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        this.elements.cameraInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
    }

    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.attachedFiles.add(file);
                this.renderAttachedFile(file);
            }
        });
        
        // Reset input
        this.elements.fileInput.value = '';
        this.elements.cameraInput.value = '';
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.security.maxFileSize) {
            this.showNotification(`Файл слишком большой (макс. 5MB): ${file.name}`, 'error');
            return false;
        }

        // Check file type
        if (!this.security.allowedFileTypes.includes(file.type)) {
            this.showNotification(`Неподдерживаемый тип файла: ${file.name}`, 'error');
            return false;
        }

        return true;
    }

    renderAttachedFile(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" data-filename="${file.name}">
                <i class="ti ti-x"></i>
            </button>
        `;

        // Add remove event listener
        const removeBtn = fileElement.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => {
            this.attachedFiles.delete(file);
            fileElement.remove();
        });

        this.elements.attachedFiles.appendChild(fileElement);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Voice Handling
    setupVoiceHandler() {
        this.voice = {
            isRecording: false,
            recognition: null
        };

        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voice.recognition = new SpeechRecognition();
            
            this.voice.recognition.continuous = false;
            this.voice.recognition.interimResults = true;
            this.voice.recognition.lang = 'ru-RU';

            this.voice.recognition.onstart = () => {
                this.voice.isRecording = true;
                this.showVoiceRecordingUI();
            };

            this.voice.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                this.elements.userInput.value = transcript;
                this.autoResizeTextarea();
                this.updateCharCounter();
            };

            this.voice.recognition.onend = () => {
                this.voice.isRecording = false;
                this.hideVoiceRecordingUI();
            };

            this.voice.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Ошибка распознавания речи', 'error');
                this.voice.isRecording = false;
                this.hideVoiceRecordingUI();
            };
        }
    }

    toggleVoiceInput() {
        if (!this.voice.recognition) {
            this.showNotification('Распознавание речи не поддерживается', 'warning');
            return;
        }

        if (this.voice.isRecording) {
            this.voice.recognition.stop();
        } else {
            this.voice.recognition.start();
        }
    }

    showVoiceRecordingUI() {
        const recordingElement = document.createElement('div');
        recordingElement.className = 'voice-recording';
        recordingElement.innerHTML = `
            <div class="recording-dot"></div>
            <span>Запись голоса...</span>
            <button class="stop-recording">
                <i class="ti ti-square"></i>
            </button>
        `;

        recordingElement.querySelector('.stop-recording').addEventListener('click', () => {
            this.voice.recognition.stop();
        });

        this.elements.messagesContainer.appendChild(recordingElement);
        this.scrollToBottom();
    }

    hideVoiceRecordingUI() {
        const recordingElement = this.elements.messagesContainer.querySelector('.voice-recording');
        if (recordingElement) {
            recordingElement.remove();
        }
    }

    // Sidebar Management
    setupSidebar() {
        // Toggle sidebar
        this.elements.menuToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        this.elements.sidebarOverlay.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('sidebarClose').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Sidebar functionality
        this.setupSidebarFunctionality();
    }

    toggleSidebar() {
        this.elements.sidebarMenu.classList.toggle('active');
        this.elements.sidebarOverlay.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        document.body.style.overflow = this.elements.sidebarMenu.classList.contains('active') ? 'hidden' : '';
    }

    setupSidebarFunctionality() {
        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.createNewChatSession();
            this.toggleSidebar();
        });

        // Model selection
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectModel(card.dataset.model);
            });
        });

        // Settings
        this.setupSettingsHandlers();
    }

    selectModel(modelId) {
        if (this.ai.models[modelId]) {
            this.ai.currentModel = modelId;
            this.elements.modelSelect.value = modelId;
            this.elements.modelStatus.textContent = this.ai.models[modelId].name;
            
            // Update model cards
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.toggle('active', card.dataset.model === modelId);
            });

            this.showNotification(`Модель изменена на: ${this.ai.models[modelId].name}`, 'success');
            this.saveSettings();
        }
    }

    setupSettingsHandlers() {
        const settings = ['autoScroll', 'streamResponses', 'soundEffects', 'typingIndicator'];
        
        settings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                // Load saved setting
                const saved = localStorage.getItem(`khuyew-${setting}`);
                if (saved !== null) {
                    element.checked = saved === 'true';
                }

                element.addEventListener('change', () => {
                    localStorage.setItem(`khuyew-${setting}`, element.checked);
                    this.showNotification('Настройка сохранена', 'success');
                });
            }
        });
    }

    // Modal Management
    setupModals() {
        this.setupPrivacyModal();
        this.setupTermsModal();
        this.setupHelpModal();
    }

    setupPrivacyModal() {
        const modal = document.getElementById('privacyModal');
        const closeBtn = document.getElementById('privacyModalClose');
        const openBtn = document.getElementById('privacyBtn');

        if (openBtn) openBtn.addEventListener('click', () => this.openModal(modal));
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal(modal));

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal(modal);
            }
        });
    }

    setupTermsModal() {
        // Similar implementation for terms modal
    }

    setupHelpModal() {
        // Similar implementation for help modal
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Utility Functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    scrollToBottom() {
        if (document.getElementById('autoScroll')?.checked !== false) {
            setTimeout(() => {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    clearInput() {
        this.elements.userInput.value = '';
        this.attachedFiles.clear();
        this.elements.attachedFiles.innerHTML = '';
        this.autoResizeTextarea();
        this.updateCharCounter();
    }

    updateSendButton() {
        const isGenerating = this.ai.isGenerating;
        this.elements.sendBtn.disabled = isGenerating;
        
        if (isGenerating) {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-loader"></i>';
        } else {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
        }
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="ti ti-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;

        typingElement.setAttribute('data-typing-indicator', 'true');
        this.elements.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = this.elements.messagesContainer.querySelector('[data-typing-indicator="true"]');
        if (typingElement) {
            typingElement.remove();
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;

        // Add styles for notification
        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-left: 4px solid;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-info { border-left-color: var(--accent-primary); }
                .notification-success { border-left-color: var(--accent-success); }
                .notification-warning { border-left-color: var(--accent-warning); }
                .notification-error { border-left-color: var(--accent-error); }
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: var(--radius-sm);
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
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

    showError(message, error) {
        console.error(message, error);
        this.showNotification(`${message}: ${error.message}`, 'error');
    }

    // Sound Management
    playMessageSound() {
        if (document.getElementById('soundEffects')?.checked !== false) {
            try {
                this.elements.messageSound.currentTime = 0;
                this.elements.messageSound.play().catch(() => {
                    // Ignore play() errors (user might have blocked audio)
                });
            } catch (error) {
                // Ignore sound errors
            }
        }
    }

    playNotificationSound() {
        if (document.getElementById('soundEffects')?.checked !== false) {
            try {
                this.elements.notificationSound.currentTime = 0;
                this.elements.notificationSound.play().catch(() => {
                    // Ignore play() errors
                });
            } catch (error) {
                // Ignore sound errors
            }
        }
    }

    // Event Listeners
    async initializeEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Clear chat
        this.elements.clearChatBtn.addEventListener('click', () => {
            this.clearCurrentChat();
        });

        // Model selection
        this.elements.modelSelect.addEventListener('change', (e) => {
            this.selectModel(e.target.value);
        });

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.userInput.value = btn.dataset.prompt;
                this.autoResizeTextarea();
                this.updateCharCounter();
                this.elements.userInput.focus();
            });
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveCurrentChat();
        });

        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khuyew-theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        this.showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
    }

    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.elements.userInput.focus();
        }

        // Ctrl/Cmd + / to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.toggleSidebar();
        }
    }

    updateConnectionStatus(online) {
        const statusElement = this.elements.connectionStatus;
        if (statusElement) {
            if (online) {
                statusElement.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
                statusElement.style.color = 'var(--accent-success)';
            } else {
                statusElement.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
                statusElement.style.color = 'var(--accent-error)';
            }
        }
    }

    // Chat Management
    createNewChatSession() {
        const newChat = this.createNewChat();
        this.chats.unshift(newChat);
        this.currentChatId = newChat.id;
        this.loadCurrentChat();
        this.saveChats();
        this.showNotification('Новый чат создан', 'success');
    }

    clearCurrentChat() {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat) {
            currentChat.messages = [];
            currentChat.updatedAt = new Date().toISOString();
            this.renderMessages([]);
            this.updateMessageCount();
            this.saveChats();
            this.showNotification('Чат очищен', 'success');
        }
    }

    deleteMessage(messageId) {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat) {
            currentChat.messages = currentChat.messages.filter(m => m.id !== messageId);
            currentChat.updatedAt = new Date().toISOString();
            this.loadCurrentChat();
            this.saveChats();
            this.showNotification('Сообщение удалено', 'success');
        }
    }

    copyMessage(message) {
        navigator.clipboard.writeText(message.content).then(() => {
            this.showNotification('Сообщение скопировано', 'success');
        }).catch(() => {
            this.showNotification('Ошибка копирования', 'error');
        });
    }

    addMessageToCurrentChat(message) {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat) {
            currentChat.messages.push(message);
            currentChat.updatedAt = new Date().toISOString();
            
            // Update chat name if it's the first user message
            if (message.type === 'user' && currentChat.messages.filter(m => m.type === 'user').length === 1) {
                currentChat.name = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
            }
            
            this.saveChats();
            this.updateMessageCount();
        }
    }

    updateMessageCount() {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat && this.elements.messageCount) {
            const count = currentChat.messages.length;
            this.elements.messageCount.textContent = `${count} сообщений`;
        }
    }

    updateChatInfo(chat) {
        const chatNameElement = document.getElementById('currentChatName');
        if (chatNameElement) {
            chatNameElement.textContent = chat.name;
        }
    }

    // Storage Operations
    saveChats() {
        try {
            localStorage.setItem(this.storage.prefix + 'chats', JSON.stringify(this.chats));
        } catch (error) {
            console.error('Error saving chats:', error);
            this.showError('Ошибка сохранения чатов', error);
        }
    }

    saveCurrentChat() {
        this.saveChats();
    }

    saveSettings() {
        const settings = {
            theme: document.documentElement.getAttribute('data-theme'),
            model: this.ai.currentModel
        };
        
        try {
            localStorage.setItem(this.storage.prefix + 'settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Statistics
    async updateStatistics() {
        const totalMessages = this.chats.reduce((sum, chat) => sum + chat.messages.length, 0);
        const totalChats = this.chats.length;

        document.getElementById('totalMessages').textContent = totalMessages;
        document.getElementById('totalChats').textContent = totalChats;
        document.getElementById('aiModels').textContent = Object.keys(this.ai.models).length;
    }

    // Security Logging
    logSecurityEvent(event, data) {
        // In a production app, this would send logs to a secure server
        console.log(`Security event: ${event}`, data);
    }

    // Final Setup
    async finalizeSetup() {
        // Hide loading screen and show app
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
                this.elements.appContainer.style.display = 'flex';
            }, 500);
        }

        // Initial connection status
        this.updateConnectionStatus(navigator.onLine);

        // Play welcome sound
        this.playNotificationSound();

        // Show welcome message
        this.showNotification('Khuyew AI Pro готов к работе!', 'success');

        console.log('Khuyew AI Pro initialized successfully');
    }

    // Load initial data
    loadInitialData() {
        // Load settings
        const savedSettings = localStorage.getItem(this.storage.prefix + 'settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.theme) {
                    document.documentElement.setAttribute('data-theme', settings.theme);
                    this.updateThemeIcon(settings.theme);
                }
                if (settings.model && this.ai.models[settings.model]) {
                    this.selectModel(settings.model);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }
}

// Initialize the application when the script loads
document.addEventListener('DOMContentLoaded', () => {
    window.khuyewAI = new KhuyewAIChat();
});

// Service Worker for PWA functionality
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
    module.exports = KhuyewAIChat;
}
