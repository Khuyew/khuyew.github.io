// KHAI - Первый белорусский ИИ чат
// Production-ready JavaScript with modern features

class KHAIApp {
    constructor() {
        this.puter = null;
        this.currentChat = null;
        this.chats = new Map();
        this.isGenerating = false;
        this.isOnline = true;
        this.deferredPrompt = null;
        this.voiceRecognition = null;
        this.synth = window.speechSynthesis;
        
        this.init();
    }

    async init() {
        try {
            // Initialize core functionality
            await this.initializeServiceWorker();
            await this.initializePuterAI();
            await this.initializeApp();
            this.initializeEventListeners();
            this.initializeVoiceRecognition();
            this.checkConnectivity();
            
            // Show app content
            this.showAppContent();
            
            // Initialize analytics
            this.trackEvent('app_loaded');
            
        } catch (error) {
            console.error('Failed to initialize KHAI:', error);
            this.showNotification('Ошибка инициализации', 'Пожалуйста, обновите страницу', 'error');
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker зарегистрирован:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('Доступно обновление', 'Обновите приложение для новых функций', 'info');
                        }
                    });
                });
                
            } catch (error) {
                console.warn('Service Worker не зарегистрирован:', error);
            }
        }
    }

    async initializePuterAI() {
        try {
            // Wait for Puter SDK to load
            if (typeof puter === 'undefined') {
                await new Promise((resolve) => {
                    const checkPuter = setInterval(() => {
                        if (typeof puter !== 'undefined') {
                            clearInterval(checkPuter);
                            resolve();
                        }
                    }, 100);
                });
            }

            this.puter = puter;
            
            // Initialize AI with error handling
            await this.puter.ai.init();
            console.log('Puter AI инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации Puter AI:', error);
            throw new Error('AI service unavailable');
        }
    }

    async initializeApp() {
        // Load saved data
        await this.loadSavedData();
        
        // Create default chat if none exists
        if (this.chats.size === 0) {
            await this.createNewChat();
        }
        
        // Update UI
        this.updateChatList();
        this.renderMessages();
    }

    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Message sending
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input auto-resize
        document.getElementById('userInput').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
        });
        
        // Voice input
        document.getElementById('voiceInputBtn').addEventListener('click', () => this.toggleVoiceInput());
        
        // File attachment
        document.getElementById('attachFileBtn').addEventListener('click', () => this.attachFile());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Chat management
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearCurrentChat());
        document.getElementById('clearInputBtn').addEventListener('click', () => this.clearInput());
        
        // Sidebar controls
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());
        
        // Model selection
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.changeModel(e.target.value);
        });
        
        // PWA installation
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        document.getElementById('installBtn').addEventListener('click', () => this.installPWA());
        
        // Connectivity
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Visibility change (pause/resume voice)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.voiceRecognition?.listening) {
                this.stopVoiceRecognition();
            }
        });
        
        // Action buttons
        document.getElementById('generateVoiceBtn').addEventListener('click', () => this.generateVoice());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('exportChatBtn').addEventListener('click', () => this.exportChat());
        document.getElementById('importChatBtn').addEventListener('click', () => this.importChat());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.lang = 'ru-RU';
            
            this.voiceRecognition.onstart = () => {
                this.showVoiceRecordingUI();
            };
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                document.getElementById('userInput').value = transcript;
                this.autoResizeTextarea(document.getElementById('userInput'));
            };
            
            this.voiceRecognition.onend = () => {
                this.hideVoiceRecordingUI();
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.hideVoiceRecordingUI();
                
                if (event.error === 'not-allowed') {
                    this.showNotification('Микрофон недоступен', 'Разрешите доступ к микрофону в настройках браузера', 'error');
                }
            };
        }
    }

    // Core functionality methods
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        const files = Array.from(document.querySelectorAll('.file-item')).map(item => 
            item.dataset.fileId
        );

        if (!message && files.length === 0) return;

        // Disable input during generation
        this.setGeneratingState(true);
        
        try {
            // Add user message
            await this.addMessage('user', message, files);
            
            // Clear input and files
            this.clearInput();
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Generate AI response
            const response = await this.generateAIResponse(message, files);
            
            // Remove typing indicator and add AI response
            this.hideTypingIndicator();
            await this.addMessage('ai', response);
            
            // Save chat
            await this.saveChat(this.currentChat);
            
            // Track successful interaction
            this.trackEvent('message_sent', { 
                has_attachments: files.length > 0,
                model: document.getElementById('modelSelect').value
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showNotification('Ошибка отправки', 'Пожалуйста, попробуйте еще раз', 'error');
            this.trackEvent('message_error', { error: error.message });
        } finally {
            this.setGeneratingState(false);
        }
    }

    async generateAIResponse(message, files = []) {
        const model = document.getElementById('modelSelect').value;
        
        try {
            let prompt = message;
            
            // Handle file attachments
            if (files.length > 0) {
                prompt += '\n\nПрикрепленные файлы: ' + files.join(', ');
            }
            
            const response = await this.puter.ai.chat(prompt, {
                model: model,
                stream: false,
                temperature: 0.7,
                max_tokens: 2000
            });
            
            return response;
            
        } catch (error) {
            console.error('AI generation error:', error);
            
            if (error.message.includes('quota') || error.message.includes('limit')) {
                return 'Извините, достигнут лимит запросов. Пожалуйста, попробуйте позже.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                return 'Проблемы с сетью. Проверьте подключение к интернету.';
            } else {
                return 'Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.';
            }
        }
    }

    async addMessage(role, content, files = []) {
        const message = {
            id: this.generateId(),
            role,
            content,
            files,
            timestamp: Date.now(),
            model: role === 'ai' ? document.getElementById('modelSelect').value : null
        };
        
        this.currentChat.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
        
        // Auto-save after adding message
        await this.saveChat(this.currentChat);
    }

    renderMessage(message) {
        const container = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        container.appendChild(messageElement);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role}`;
        messageDiv.dataset.messageId = message.id;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Process message content (markdown, code blocks, etc.)
        if (message.role === 'ai') {
            content.innerHTML = this.processAIResponse(message.content);
        } else {
            content.textContent = message.content;
        }
        
        // Add file attachments
        if (message.files && message.files.length > 0) {
            const filesDiv = document.createElement('div');
            filesDiv.className = 'message-files';
            filesDiv.innerHTML = '<small>📎 Прикрепленные файлы</small>';
            content.appendChild(filesDiv);
        }
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = this.formatTimestamp(message.timestamp);
        
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        if (message.role === 'ai') {
            actions.innerHTML = `
                <button class="action-btn-small copy-btn" onclick="app.copyMessage('${message.id}')" title="Копировать">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                <button class="action-btn-small voice-btn" onclick="app.speakMessage('${message.id}')" title="Озвучить">
                    <i class="ti ti-volume"></i> Озвучить
                </button>
            `;
        }
        
        bubble.appendChild(content);
        bubble.appendChild(timestamp);
        bubble.appendChild(actions);
        messageDiv.appendChild(bubble);
        
        return messageDiv;
    }

    processAIResponse(content) {
        // Sanitize and process AI response
        let processed = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        
        // Convert markdown code blocks
        processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Convert inline code
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert links
        processed = processed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return processed;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Chat management
    async createNewChat() {
        const chatId = this.generateId();
        const chat = {
            id: chatId,
            name: `Чат ${this.chats.size + 1}`,
            messages: [],
            createdAt: Date.now(),
            model: document.getElementById('modelSelect').value
        };
        
        this.chats.set(chatId, chat);
        this.currentChat = chat;
        
        this.updateChatList();
        this.renderMessages();
        await this.saveChat(chat);
        
        this.trackEvent('chat_created');
    }

    async switchChat(chatId) {
        const chat = this.chats.get(chatId);
        if (chat) {
            this.currentChat = chat;
            this.renderMessages();
            this.closeSidebar();
            
            // Update model selector to match chat
            document.getElementById('modelSelect').value = chat.model;
            
            this.trackEvent('chat_switched');
        }
    }

    async deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить', 'Должен остаться хотя бы один чат', 'warning');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChat.id === chatId) {
                // Switch to another chat
                const remainingChat = this.chats.values().next().value;
                await this.switchChat(remainingChat.id);
            }
            
            this.updateChatList();
            await this.saveAllChats();
            
            this.trackEvent('chat_deleted');
        }
    }

    clearCurrentChat() {
        if (confirm('Очистить все сообщения в этом чате?')) {
            this.currentChat.messages = [];
            this.renderMessages();
            this.saveChat(this.currentChat);
            
            this.trackEvent('chat_cleared');
        }
    }

    // Voice functionality
    toggleVoiceInput() {
        if (!this.voiceRecognition) {
            this.showNotification('Голосовой ввод недоступен', 'Ваш браузер не поддерживает распознавание речи', 'warning');
            return;
        }
        
        if (this.voiceRecognition.listening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        try {
            this.voiceRecognition.start();
            this.trackEvent('voice_started');
        } catch (error) {
            console.error('Voice recognition start error:', error);
        }
    }

    stopVoiceRecognition() {
        try {
            this.voiceRecognition.stop();
            this.trackEvent('voice_stopped');
        } catch (error) {
            console.error('Voice recognition stop error:', error);
        }
    }

    showVoiceRecordingUI() {
        const inputSection = document.querySelector('.input-section');
        const recordingDiv = document.createElement('div');
        recordingDiv.className = 'voice-recording';
        recordingDiv.innerHTML = `
            <div class="recording-dot"></div>
            <div class="recording-text">Запись голоса...</div>
            <div class="recording-time">0:00</div>
        `;
        recordingDiv.id = 'voiceRecording';
        inputSection.insertBefore(recordingDiv, inputSection.firstChild);
        
        // Start timer
        this.voiceStartTime = Date.now();
        this.voiceTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.voiceStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            recordingDiv.querySelector('.recording-time').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    hideVoiceRecordingUI() {
        const recordingDiv = document.getElementById('voiceRecording');
        if (recordingDiv) {
            recordingDiv.remove();
        }
        if (this.voiceTimer) {
            clearInterval(this.voiceTimer);
            this.voiceTimer = null;
        }
    }

    async generateVoice() {
        const lastAIMessage = [...this.currentChat.messages].reverse().find(m => m.role === 'ai');
        
        if (!lastAIMessage) {
            this.showNotification('Нет сообщений', 'Сначала получите ответ от ИИ', 'warning');
            return;
        }
        
        try {
            this.setGeneratingState(true);
            
            // Use browser's speech synthesis
            const utterance = new SpeechSynthesisUtterance(lastAIMessage.content);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onstart = () => {
                this.showNotification('Озвучивание', 'Идет генерация голоса...', 'info');
            };
            
            utterance.onend = () => {
                this.showNotification('Готово', 'Озвучивание завершено', 'success');
                this.trackEvent('voice_generated');
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.showNotification('Ошибка', 'Не удалось озвучить сообщение', 'error');
            };
            
            this.synth.speak(utterance);
            
        } catch (error) {
            console.error('Voice generation error:', error);
            this.showNotification('Ошибка', 'Генерация голоса недоступна', 'error');
        } finally {
            this.setGeneratingState(false);
        }
    }

    speakMessage(messageId) {
        const message = this.currentChat.messages.find(m => m.id === messageId);
        if (message && message.role === 'ai') {
            const utterance = new SpeechSynthesisUtterance(message.content);
            utterance.lang = 'ru-RU';
            this.synth.speak(utterance);
            this.trackEvent('message_spoken');
        }
    }

    // File handling
    attachFile() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification('Файл слишком большой', 'Максимальный размер: 10MB', 'error');
                return;
            }
            
            this.addFileAttachment(file);
        });
        
        // Reset file input
        event.target.value = '';
    }

    addFileAttachment(file) {
        const fileId = this.generateId();
        const filesContainer = document.getElementById('attachedFiles');
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileId = fileId;
        fileItem.innerHTML = `
            <i class="ti ti-file"></i>
            <span>${file.name}</span>
            <button class="file-remove" onclick="app.removeFileAttachment('${fileId}')">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        filesContainer.appendChild(fileItem);
        
        // Store file reference
        if (!this.currentChat.attachments) {
            this.currentChat.attachments = new Map();
        }
        this.currentChat.attachments.set(fileId, file);
    }

    removeFileAttachment(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }
        
        if (this.currentChat.attachments) {
            this.currentChat.attachments.delete(fileId);
        }
    }

    // UI helpers
    showTypingIndicator() {
        const container = document.getElementById('messagesContainer');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-ai';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span>KHAI печатает</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setGeneratingState(generating) {
        this.isGenerating = generating;
        
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        
        if (generating) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="ti ti-loader-2"></i>';
            userInput.disabled = true;
        } else {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            userInput.disabled = false;
            userInput.focus();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    clearInput() {
        document.getElementById('userInput').value = '';
        this.autoResizeTextarea(document.getElementById('userInput'));
        
        // Clear attached files
        document.getElementById('attachedFiles').innerHTML = '';
        if (this.currentChat.attachments) {
            this.currentChat.attachments.clear();
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        if (this.currentChat) {
            this.currentChat.messages.forEach(message => {
                this.renderMessage(message);
            });
        }
        
        this.scrollToBottom();
        this.updateCurrentChatInfo();
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatItem = this.createChatListItem(chat);
            chatList.appendChild(chatItem);
        });
    }

    createChatListItem(chat) {
        const chatItem = document.createElement('button');
        chatItem.className = `chat-item ${chat.id === this.currentChat.id ? 'active' : ''}`;
        chatItem.onclick = () => this.switchChat(chat.id);
        
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? 
            (lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '')) : 
            'Нет сообщений';
        
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-name">${chat.name}</div>
                <div class="chat-item-preview">${preview}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-action-btn delete-chat-btn" onclick="event.stopPropagation(); app.deleteChat('${chat.id}')" title="Удалить чат">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;
        
        return chatItem;
    }

    updateCurrentChatInfo() {
        const chatNameElement = document.getElementById('currentChatName');
        if (this.currentChat && chatNameElement) {
            chatNameElement.textContent = this.currentChat.name;
        }
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
        
        this.trackEvent('theme_changed', { theme: newTheme });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('khai-theme') || 
                          (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
    }

    // Sidebar management
    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // PWA functionality
    showInstallButton() {
        const installBtn = document.getElementById('installBtn');
        installBtn.style.display = 'flex';
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.trackEvent('pwa_installed');
            }
            
            this.deferredPrompt = null;
            document.getElementById('installBtn').style.display = 'none';
        }
    }

    // Connectivity
    checkConnectivity() {
        this.isOnline = navigator.onLine;
        this.updateConnectionStatus();
    }

    handleOnline() {
        this.isOnline = true;
        this.updateConnectionStatus();
        this.showNotification('Соединение восстановлено', 'Вы снова онлайн', 'success');
        this.trackEvent('connection_restored');
    }

    handleOffline() {
        this.isOnline = false;
        this.updateConnectionStatus();
        this.showNotification('Нет соединения', 'Работа в офлайн-режиме', 'warning');
        this.trackEvent('connection_lost');
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const icon = statusElement.querySelector('i');
            const text = statusElement.querySelector('span');
            
            if (this.isOnline) {
                statusElement.className = 'connection-status online';
                icon.className = 'ti ti-wifi';
                text.textContent = 'Онлайн';
            } else {
                statusElement.className = 'connection-status offline';
                icon.className = 'ti ti-wifi-off';
                text.textContent = 'Офлайн';
            }
        }
    }

    // Data persistence
    async saveChat(chat) {
        try {
            const chatData = JSON.stringify(Array.from(this.chats.entries()));
            localStorage.setItem('khai-chats', chatData);
            
            // Also save to IndexedDB for larger storage
            await this.saveToIndexedDB(chat);
            
        } catch (error) {
            console.warn('Failed to save chat to localStorage:', error);
        }
    }

    async saveAllChats() {
        try {
            const chatData = JSON.stringify(Array.from(this.chats.entries()));
            localStorage.setItem('khai-chats', chatData);
        } catch (error) {
            console.warn('Failed to save all chats:', error);
        }
    }

    async loadSavedData() {
        try {
            // Load from localStorage
            const savedChats = localStorage.getItem('khai-chats');
            if (savedChats) {
                const chatEntries = JSON.parse(savedChats);
                this.chats = new Map(chatEntries);
                
                // Set current chat to the last used or first available
                const lastChatId = localStorage.getItem('khai-current-chat');
                this.currentChat = this.chats.get(lastChatId) || this.chats.values().next().value;
            }
            
            // Load theme
            this.loadTheme();
            
        } catch (error) {
            console.warn('Failed to load saved data:', error);
            this.chats = new Map();
        }
    }

    async saveToIndexedDB(chat) {
        // Implementation for IndexedDB storage for larger chats
        if ('indexedDB' in window) {
            // Simplified IndexedDB implementation
            const dbName = 'KHAI-Chats';
            const request = indexedDB.open(dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('chats')) {
                    db.createObjectStore('chats', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['chats'], 'readwrite');
                const store = transaction.objectStore('chats');
                store.put(chat);
            };
        }
    }

    // Import/Export
    async exportChat() {
        if (!this.currentChat) return;
        
        const chatData = {
            ...this.currentChat,
            exportDate: new Date().toISOString(),
            version: 'KHAI v3.0'
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${this.currentChat.name}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackEvent('chat_exported');
    }

    async importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const chatData = JSON.parse(event.target.result);
                    
                    // Validate chat data
                    if (!chatData.id || !chatData.messages) {
                        throw new Error('Invalid chat file');
                    }
                    
                    // Add to chats
                    this.chats.set(chatData.id, chatData);
                    this.currentChat = chatData;
                    
                    this.updateChatList();
                    this.renderMessages();
                    this.saveChat(chatData);
                    
                    this.showNotification('Чат импортирован', 'Чат успешно загружен', 'success');
                    this.trackEvent('chat_imported');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Ошибка импорта', 'Неверный формат файла', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    async clearAllData() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
            try {
                localStorage.clear();
                this.chats.clear();
                await this.createNewChat();
                
                this.showNotification('Данные очищены', 'Все чаты и настройки удалены', 'success');
                this.trackEvent('data_cleared');
                
            } catch (error) {
                console.error('Clear data error:', error);
                this.showNotification('Ошибка', 'Не удалось очистить данные', 'error');
            }
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(title, message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
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

    copyMessage(messageId) {
        const message = this.currentChat.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Скопировано', 'Сообщение скопировано в буфер обмена', 'success');
                this.trackEvent('message_copied');
            }).catch(() => {
                this.showNotification('Ошибка', 'Не удалось скопировать сообщение', 'error');
            });
        }
    }

    showHelp() {
        const helpMessage = `
## 🤖 KHAI - Первый белорусский ИИ чат

### Основные возможности:
- **💬 Умный чат** - Общайтесь с различными AI-моделями
- **🎤 Голосовой ввод** - Говорите вместо ввода текста
- **🔊 Озвучивание** - Прослушивайте ответы ИИ
- **📎 Файлы** - Прикрепляйте изображения и документы
- **💾 Сохранение** - Все чаты сохраняются автоматически
- **📱 PWA** - Установите как нативное приложение

### Горячие клавиши:
- **Enter** - Отправить сообщение
- **Shift+Enter** - Новая строка
- **Ctrl+/** - Открыть справку

### Поддерживаемые модели:
- GPT-5 Nano, O3 Mini, DeepSeek, Gemini, Grok и другие

🇧🇾 Сделано с ❤️ в Беларуси
        `.trim();
        
        this.showNotification('Справка KHAI', 'Откройте чат для подробной информации', 'info');
        
        // Add help message to chat
        this.addMessage('ai', helpMessage);
    }

    changeModel(model) {
        if (this.currentChat) {
            this.currentChat.model = model;
            this.saveChat(this.currentChat);
            this.trackEvent('model_changed', { model });
        }
    }

    showAppContent() {
        // Hide loading screen and show app
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.querySelector('.app-container');
        
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
            appContainer.style.display = 'flex';
        }, 500);
    }

    // Analytics (privacy-friendly)
    trackEvent(eventName, properties = {}) {
        // Simple analytics without external dependencies
        const analyticsData = {
            event: eventName,
            timestamp: Date.now(),
            properties: {
                ...properties,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                online: this.isOnline
            }
        };
        
        console.log('Analytics:', analyticsData);
        
        // Send to your analytics endpoint (optional)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIApp();
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
            console.log('Background sync completed');
        }
    });
}

// Error boundary
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIApp;
}
