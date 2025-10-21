// KHAI Chat Application
class KHAIChat {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentMode = 'chat';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isProcessing = false;
        this.notificationId = 0;
        this.isSidebarOpen = false;
        this.isSearchModalOpen = false;
        this.currentSearchResults = [];
        this.currentSearchIndex = -1;
        
        this.initializeApp();
        this.loadChats();
        this.setupEventListeners();
        this.setupPWA();
    }

    initializeApp() {
        // Initialize theme
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Initialize current chat
        if (!this.chats.has(this.currentChatId)) {
            this.chats.set(this.currentChatId, {
                id: this.currentChatId,
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString()
            });
        }

        this.renderChatList();
        this.renderMessages();
        this.updateCurrentChatName();
    }

    setupEventListeners() {
        // Input handling
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');
        const attachFileBtn = document.getElementById('attachFileBtn');
        const fileInput = document.getElementById('fileInput');
        const voiceInputBtn = document.getElementById('voiceInputBtn');

        userInput.addEventListener('input', this.handleInputResize.bind(this));
        userInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        sendBtn.addEventListener('click', () => this.sendMessage());
        clearInputBtn.addEventListener('click', () => this.clearInput());
        attachFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        voiceInputBtn.addEventListener('click', this.toggleVoiceRecording.bind(this));

        // Mode buttons
        document.getElementById('imageModeBtn').addEventListener('click', () => this.setMode('image'));
        document.getElementById('voiceModeBtn').addEventListener('click', () => this.setMode('voice'));
        document.getElementById('chatModeBtn').addEventListener('click', () => this.setMode('chat'));

        // Navigation controls
        document.getElementById('scrollToTopBtn').addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottomBtn').addEventListener('click', () => this.scrollToBottom());
        document.getElementById('nextMessageBtn').addEventListener('click', () => this.scrollToNextMessage());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));

        // Menu and sidebar
        document.getElementById('menuToggle').addEventListener('click', this.toggleSidebar.bind(this));
        document.getElementById('sidebarClose').addEventListener('click', this.toggleSidebar.bind(this));
        document.getElementById('sidebarOverlay').addEventListener('click', this.toggleSidebar.bind(this));

        // Chat management
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearCurrentChat());
        document.getElementById('deleteAllChatsBtn').addEventListener('click', () => this.deleteAllChats());

        // Search functionality
        document.getElementById('searchMessagesBtn').addEventListener('click', () => this.openSearchModal());
        document.getElementById('searchMessagesClose').addEventListener('click', () => this.closeSearchModal());
        document.getElementById('searchMessagesInput').addEventListener('input', (e) => this.handleSearchInput(e.target.value));

        // Help button
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());

        // Auto-save when leaving page
        window.addEventListener('beforeunload', () => this.saveChats());
        window.addEventListener('pagehide', () => this.saveChats());

        // Scroll handling for navigation controls visibility
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleInputResize() {
        const textarea = document.getElementById('userInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = Array.from(document.querySelectorAll('.attached-file')).map(file => file.dataset.filename);

        if (!message && files.length === 0) return;

        // Add user message
        this.addMessage('user', message, files);

        // Clear input and files
        userInput.value = '';
        this.clearInput();
        this.handleInputResize();

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage('ai', this.generateResponse(message, files), []);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(role, content, files = []) {
        const chat = this.chats.get(this.currentChatId);
        const message = {
            id: Date.now().toString(),
            role,
            content,
            files: [...files],
            timestamp: new Date().toISOString(),
            model: role === 'ai' ? this.getCurrentModel() : null
        };

        chat.messages.push(message);
        this.renderMessages();
        this.saveChats();
        this.scrollToBottom();
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        const chat = this.chats.get(this.currentChatId);
        
        container.innerHTML = '';

        chat.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });

        // Add typing indicator if needed
        if (document.querySelector('.typing-indicator')) {
            container.appendChild(this.createTypingIndicator());
        }
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role}`;
        messageDiv.dataset.messageId = message.id;

        let content = '';

        if (message.role === 'user') {
            content = this.formatUserMessage(message);
        } else {
            content = this.formatAIMessage(message);
        }

        messageDiv.innerHTML = content;
        this.setupMessageActions(messageDiv, message);
        
        return messageDiv;
    }

    formatUserMessage(message) {
        let content = `<div class="message-content">${this.escapeHtml(message.content)}</div>`;
        
        if (message.files && message.files.length > 0) {
            content += '<div class="message-files">';
            message.files.forEach(file => {
                content += `<div class="message-file">📎 ${this.escapeHtml(file)}</div>`;
            });
            content += '</div>';
        }

        return content;
    }

    formatAIMessage(message) {
        let content = `<div class="message-content">${this.parseMarkdown(message.content)}</div>`;
        
        if (message.model) {
            content += `<div class="model-indicator">Сгенерировано моделью: ${message.model}</div>`;
        }

        return content;
    }

    setupMessageActions(messageElement, message) {
        if (message.role === 'ai') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            actionsDiv.innerHTML = `
                <button class="action-btn-small copy-btn" title="Копировать">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                <button class="action-btn-small speak-btn" title="Озвучить">
                    <i class="ti ti-volume"></i> Озвучить
                </button>
                <button class="action-btn-small regenerate-btn" title="Перегенерировать">
                    <i class="ti ti-refresh"></i> Перегенерировать
                </button>
            `;

            messageElement.appendChild(actionsDiv);

            // Setup action listeners
            this.setupCopyButton(actionsDiv.querySelector('.copy-btn'), message.content);
            this.setupSpeakButton(actionsDiv.querySelector('.speak-btn'), message.content);
            this.setupRegenerateButton(actionsDiv.querySelector('.regenerate-btn'), message);
        }
    }

    setupCopyButton(button, text) {
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(text);
                this.showNotification('Текст скопирован в буфер обмена', 'success');
                
                // Visual feedback
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                this.showNotification('Не удалось скопировать текст', 'error');
            }
        });
    }

    setupSpeakButton(button, text) {
        let speech = null;
        
        button.addEventListener('click', () => {
            if (button.classList.contains('speaking')) {
                // Stop speaking
                if (speech) {
                    speechSynthesis.cancel();
                }
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
            } else {
                // Start speaking
                speech = new SpeechSynthesisUtterance(text);
                speech.lang = 'ru-RU';
                speech.rate = 1.0;
                speech.pitch = 1.0;
                
                speech.onstart = () => {
                    button.classList.add('speaking');
                    button.innerHTML = '<i class="ti ti-square"></i> Остановить';
                };
                
                speech.onend = () => {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
                };
                
                speech.onerror = () => {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
                    this.showNotification('Ошибка при озвучивании', 'error');
                };
                
                speechSynthesis.speak(speech);
            }
        });
    }

    setupRegenerateButton(button, message) {
        button.addEventListener('click', () => {
            // Find the user message that prompted this AI response
            const chat = this.chats.get(this.currentChatId);
            const messageIndex = chat.messages.findIndex(m => m.id === message.id);
            
            if (messageIndex > 0) {
                const userMessage = chat.messages[messageIndex - 1];
                
                // Remove this AI message and regenerate
                chat.messages.splice(messageIndex, 1);
                this.renderMessages();
                
                // Show typing indicator and generate new response
                this.showTypingIndicator();
                
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addMessage('ai', this.generateResponse(userMessage.content, userMessage.files), []);
                }, 1000 + Math.random() * 2000);
            }
        });
    }

    createTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-text">KHAI печатает...</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        return typingDiv;
    }

    showTypingIndicator() {
        const container = document.getElementById('messagesContainer');
        if (!document.querySelector('.typing-indicator')) {
            container.appendChild(this.createTypingIndicator());
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateResponse(userMessage, files) {
        const responses = {
            greeting: [
                "Привет! Я KHAI, первый белорусский ИИ-ассистент. Чем могу помочь?",
                "Здравствуйте! Рад вас видеть. Задавайте свои вопросы!",
                "Приветствую! Я здесь, чтобы помочь вам с любыми вопросами."
            ],
            question: [
                "Это интересный вопрос! На основе моих знаний, я могу сказать, что это требует внимательного изучения.",
                "Отличный вопрос! Позвольте мне подробно на него ответить.",
                "Понимаю ваш интерес к этой теме. Вот что я могу сказать по этому поводу:"
            ],
            image: [
                "На основе вашего описания я создал изображение. Надеюсь, оно соответствует вашим ожиданиям!",
                "Вот сгенерированное изображение по вашему запросу. Если нужно что-то изменить, просто скажите!",
                "Я создал визуализацию по вашему описанию. Что вы думаете?"
            ],
            default: [
                "Спасибо за ваше сообщение! Я обработал информацию и готов помочь дальше.",
                "Понял вас! Есть ли что-то конкретное, с чем я могу помочь?",
                "Интересно! Расскажите подробнее, что вас интересует."
            ]
        };

        let responseType = 'default';
        
        if (userMessage.toLowerCase().includes('привет') || userMessage.toLowerCase().includes('здравствуй')) {
            responseType = 'greeting';
        } else if (userMessage.includes('?')) {
            responseType = 'question';
        } else if (files.length > 0 || userMessage.toLowerCase().includes('изображен') || userMessage.toLowerCase().includes('картинк')) {
            responseType = 'image';
        }

        const possibleResponses = responses[responseType];
        return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}ModeBtn`).classList.add('active');

        // Update input placeholder based on mode
        const userInput = document.getElementById('userInput');
        switch (mode) {
            case 'image':
                userInput.placeholder = 'Опишите изображение для генерации...';
                break;
            case 'voice':
                userInput.placeholder = 'Готов к голосовому вводу...';
                break;
            default:
                userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        }

        this.showNotification(`Режим ${this.getModeDisplayName(mode)} активирован`, 'info');
    }

    getModeDisplayName(mode) {
        const names = {
            chat: 'чат',
            image: 'генерации изображений',
            voice: 'голосового ввода'
        };
        return names[mode] || mode;
    }

    async toggleVoiceRecording() {
        if (!this.isRecording) {
            await this.startVoiceRecording();
        } else {
            this.stopVoiceRecording();
        }
    }

    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processAudioRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            const voiceBtn = document.getElementById('voiceInputBtn');
            voiceBtn.classList.add('active');
            voiceBtn.innerHTML = '<i class="ti ti-square"></i>';
            
            this.showNotification('Запись началась...', 'info');
        } catch (error) {
            this.showNotification('Не удалось получить доступ к микрофону', 'error');
            console.error('Error accessing microphone:', error);
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            
            const voiceBtn = document.getElementById('voiceInputBtn');
            voiceBtn.classList.remove('active');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            
            this.showNotification('Запись завершена, обрабатывается...', 'info');
        }
    }

    async processAudioRecording() {
        // Simulate audio processing (replace with actual speech-to-text API)
        this.showNotification('Аудио обрабатывается...', 'info');
        
        setTimeout(() => {
            const mockTranscriptions = [
                "Привет! Как дела?",
                "Расскажи мне о возможностях искусственного интеллекта",
                "Сгенерируй изображение заката над морем",
                "Какая сегодня погода?"
            ];
            
            const transcribedText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
            document.getElementById('userInput').value = transcribedText;
            this.handleInputResize();
            
            this.showNotification('Текст распознан успешно', 'success');
        }, 2000);
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const attachedFilesContainer = document.getElementById('attachedFiles');
        
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification(`Файл ${file.name} слишком большой (макс. 10MB)`, 'error');
                return;
            }

            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.dataset.filename = file.name;
            fileElement.innerHTML = `
                <span>📎 ${file.name}</span>
                <button class="remove-file" title="Удалить файл">
                    <i class="ti ti-x"></i>
                </button>
            `;

            const removeBtn = fileElement.querySelector('.remove-file');
            removeBtn.addEventListener('click', () => {
                fileElement.remove();
            });

            attachedFilesContainer.appendChild(fileElement);
        });

        event.target.value = '';
    }

    clearInput() {
        document.getElementById('userInput').value = '';
        document.getElementById('attachedFiles').innerHTML = '';
        this.handleInputResize();
    }

    scrollToTop() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    scrollToNextMessage() {
        const container = document.getElementById('messagesContainer');
        const messages = container.querySelectorAll('.message');
        const currentScroll = container.scrollTop;
        const containerHeight = container.clientHeight;

        for (let i = 0; i < messages.length; i++) {
            const messageTop = messages[i].offsetTop;
            if (messageTop > currentScroll + 100) {
                container.scrollTo({ top: messageTop - 20, behavior: 'smooth' });
                break;
            }
        }
    }

    handleScroll() {
        const container = document.getElementById('messagesContainer');
        const navigationControls = document.getElementById('chatNavigationControls');
        
        if (container.scrollHeight > container.clientHeight + 100) {
            navigationControls.classList.remove('hidden');
        } else {
            navigationControls.classList.add('hidden');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.innerHTML = theme === 'light' ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Чат ${this.chats.size + 1}`;
        
        this.chats.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString()
        });
        
        this.switchToChat(chatId);
        this.toggleSidebar();
        this.showNotification('Новый чат создан', 'success');
    }

    switchToChat(chatId) {
        this.currentChatId = chatId;
        this.renderMessages();
        this.updateCurrentChatName();
        this.renderChatList();
    }

    updateCurrentChatName() {
        const chat = this.chats.get(this.currentChatId);
        document.getElementById('currentChatName').textContent = chat.name;
    }

    renderChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';

        Array.from(this.chats.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
                chatItem.innerHTML = `
                    <span class="chat-name">${this.escapeHtml(chat.name)}</span>
                    <div class="chat-item-actions">
                        <button class="chat-item-action edit-chat-btn" title="Редактировать название">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="chat-item-action delete-chat-btn" title="Удалить чат">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                `;

                chatItem.addEventListener('click', (e) => {
                    if (!e.target.closest('.chat-item-action')) {
                        this.switchToChat(chat.id);
                        this.toggleSidebar();
                    }
                });

                const editBtn = chatItem.querySelector('.edit-chat-btn');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editChatName(chat.id);
                });

                const deleteBtn = chatItem.querySelector('.delete-chat-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chat.id);
                });

                chatList.appendChild(chatItem);
            });
    }

    editChatName(chatId) {
        const chat = this.chats.get(chatId);
        const newName = prompt('Введите новое название чата:', chat.name);
        
        if (newName && newName.trim()) {
            chat.name = newName.trim();
            this.renderChatList();
            if (chatId === this.currentChatId) {
                this.updateCurrentChatName();
            }
            this.saveChats();
            this.showNotification('Название чата изменено', 'success');
        }
    }

    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (chatId === this.currentChatId) {
                // Switch to another chat
                const remainingChat = Array.from(this.chats.values())[0];
                this.switchToChat(remainingChat.id);
            }
            
            this.renderChatList();
            this.saveChats();
            this.showNotification('Чат удален', 'success');
        }
    }

    clearCurrentChat() {
        const chat = this.chats.get(this.currentChatId);
        if (chat.messages.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            chat.messages = [];
            this.renderMessages();
            this.saveChats();
            this.showNotification('История чата очищена', 'success');
        }
    }

    deleteAllChats() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ чаты? Это действие нельзя отменить.')) {
            const defaultChat = this.chats.get('default');
            this.chats.clear();
            
            // Keep only the default chat but clear its messages
            if (defaultChat) {
                defaultChat.messages = [];
                this.chats.set('default', defaultChat);
                this.switchToChat('default');
            } else {
                this.createNewChat();
            }
            
            this.saveChats();
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    openSearchModal() {
        this.isSearchModalOpen = true;
        document.getElementById('searchMessagesModal').classList.add('active');
        document.getElementById('searchMessagesInput').focus();
    }

    closeSearchModal() {
        this.isSearchModalOpen = false;
        document.getElementById('searchMessagesModal').classList.remove('active');
        document.getElementById('searchMessagesInput').value = '';
        this.clearSearchResults();
    }

    handleSearchInput(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        const chat = this.chats.get(this.currentChatId);
        const results = chat.messages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('searchResults');
        this.currentSearchResults = results;
        this.currentSearchIndex = -1;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result">Сообщения не найдены</div>';
            return;
        }

        resultsContainer.innerHTML = results.map((message, index) => `
            <div class="search-result" data-index="${index}">
                <div class="result-preview">
                    ${this.highlightText(message.content, query)}
                </div>
                <div class="result-meta">
                    ${message.role === 'user' ? '👤 Вы' : '🤖 KHAI'} • 
                    ${new Date(message.timestamp).toLocaleString()}
                </div>
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result').forEach((result, index) => {
            result.addEventListener('click', () => this.navigateToSearchResult(index));
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    navigateToSearchResult(index) {
        const message = this.currentSearchResults[index];
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.style.animation = 'gentlePulse 2s ease-in-out';
            setTimeout(() => {
                messageElement.style.animation = '';
            }, 2000);
        }
        
        this.closeSearchModal();
    }

    clearSearchResults() {
        document.getElementById('searchResults').innerHTML = '';
        this.currentSearchResults = [];
        this.currentSearchIndex = -1;
    }

    showHelp() {
        const helpMessage = `
## 🤖 KHAI - Первый белорусский ИИ чат

### 🎯 Основные возможности:
- **💬 Чат режим** - Общение с ИИ-ассистентом
- **🖼️ Генерация изображений** - Создание картинок по описанию
- **🎤 Голосовой ввод** - Запись и распознавание речи
- **📁 Поддержка файлов** - Загрузка изображений и документов

### 🎛️ Управление:
- **Enter** - Отправить сообщение
- **Shift+Enter** - Новая строка
- **Кнопки навигации** - Быстрая прокрутка чата

### 💾 Управление чатами:
- Создавайте несколько чатов для разных тем
- Переименовывайте и удаляйте чаты
- Ищите сообщения по ключевым словам

### 🎨 Персонализация:
- Темная/светлая тема
- Разные модели ИИ
- Настройка под ваши нужды

*KHAI - сделано в Беларуси с ❤️*
        `.trim();

        this.addMessage('ai', helpMessage, []);
    }

    getCurrentModel() {
        return document.getElementById('modelSelect').value;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        const container = document.querySelector('.notifications-container') || this.createNotificationsContainer();
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideDown 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check',
            error: 'x',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    createNotificationsContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    setupPWA() {
        // Register service worker
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

        // Show install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt();
        });

        document.getElementById('pwaInstall')?.addEventListener('click', () => {
            this.hideInstallPrompt();
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        this.showNotification('Приложение установлено!', 'success');
                    }
                    deferredPrompt = null;
                });
            }
        });

        document.getElementById('pwaDismiss')?.addEventListener('click', () => {
            this.hideInstallPrompt();
        });
    }

    showInstallPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.style.display = 'block';
        }
    }

    hideInstallPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    parseMarkdown(text) {
        // Simple markdown parser
        return marked.parse(text, {
            breaks: true,
            gfm: true,
            highlight: (code, lang) => {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });
    }

    // Data persistence
    saveChats() {
        const chatsData = Array.from(this.chats.values());
        localStorage.setItem('khai-chats', JSON.stringify(chatsData));
        localStorage.setItem('khai-current-chat', this.currentChatId);
    }

    loadChats() {
        try {
            const savedChats = localStorage.getItem('khai-chats');
            const currentChatId = localStorage.getItem('khai-current-chat');
            
            if (savedChats) {
                const chatsArray = JSON.parse(savedChats);
                this.chats.clear();
                chatsArray.forEach(chat => {
                    this.chats.set(chat.id, chat);
                });
            }
            
            if (currentChatId && this.chats.has(currentChatId)) {
                this.currentChatId = currentChatId;
            }
        } catch (error) {
            console.error('Error loading chats:', error);
            // Initialize with default chat if loading fails
            this.chats.clear();
            this.chats.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString()
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
}
