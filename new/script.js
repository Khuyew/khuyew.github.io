class KHAChat {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.isExpandedMode = false;
        this.currentModel = 'gpt-4';
        this.attachedFiles = [];
        this.isVoiceMode = false;
        
        this.initializeApp();
        this.loadChats();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.setupSEO();
    }

    initializeApp() {
        this.setupTheme();
        this.renderChatList();
        this.updateUI();
        this.showNotification('Добро пожаловать в KHAI!', 'info');
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeToggle').checked = savedTheme === 'light';
    }

    setupEventListeners() {
        // Input handling
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');
        const voiceBtn = document.getElementById('voiceBtn');
        const fileInput = document.getElementById('fileInput');

        userInput.addEventListener('input', () => this.handleInputChange());
        userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        attachBtn.addEventListener('click', () => fileInput.click());
        clearInputBtn.addEventListener('click', () => this.clearInput());
        voiceBtn.addEventListener('click', () => this.toggleVoiceMode());

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Header controls
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('themeToggle').addEventListener('change', (e) => this.toggleTheme(e));
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('expandBtn').addEventListener('click', () => this.toggleExpandMode());

        // Model selection
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.showNotification(`Модель изменена на: ${e.target.selectedOptions[0].text}`, 'info');
        });

        // Navigation controls
        document.getElementById('scrollToTop').addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottom').addEventListener('click', () => this.scrollToBottom());

        // Sidebar controls
        document.getElementById('sidebarClose').addEventListener('click', () => this.closeSidebar());
        document.getElementById('exportChats').addEventListener('click', () => this.exportChats());
        document.getElementById('importChats').addEventListener('click', () => this.importChats());
        document.getElementById('clearAllChats').addEventListener('click', () => this.clearAllChats());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());

        // Overlay click
        document.getElementById('overlay').addEventListener('click', () => this.closeSidebar());

        // Chat search
        document.getElementById('chatSearchInput').addEventListener('input', (e) => this.searchChats(e.target.value));

        // Text-to-speech controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('speak-btn')) {
                this.toggleTextToSpeech(e.target);
            }
            if (e.target.classList.contains('copy-code-btn')) {
                this.copyCode(e.target);
            }
            if (e.target.classList.contains('remove-file')) {
                this.removeAttachedFile(e.target.dataset.index);
            }
            if (e.target.classList.contains('chat-item')) {
                this.loadChat(e.target.dataset.chatId);
            }
            if (e.target.classList.contains('delete-chat')) {
                this.deleteChat(e.target.closest('.chat-item').dataset.chatId);
            }
        });

        // Handle page visibility changes for speech synthesis
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isSpeaking) {
                this.stopSpeaking();
            }
        });

        // Handle beforeunload for cleanup
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    handleInputChange() {
        const userInput = document.getElementById('userInput');
        const clearInputBtn = document.getElementById('clearInputBtn');
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceBtn');

        // Show/hide clear button based on input content
        const hasContent = userInput.value.trim().length > 0 || this.attachedFiles.length > 0;
        clearInputBtn.style.display = hasContent ? 'flex' : 'none';

        // Auto-resize textarea
        this.autoResizeTextarea(userInput);

        // Update send button state
        const canSend = userInput.value.trim().length > 0 || this.attachedFiles.length > 0;
        sendBtn.disabled = !canSend;

        // Update voice button state
        voiceBtn.disabled = userInput.value.trim().length > 0;
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];

        files.forEach(file => {
            if (file.size > maxSize) {
                this.showNotification(`Файл "${file.name}" слишком большой (макс. 10MB)`, 'error');
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                this.showNotification(`Тип файла "${file.name}" не поддерживается`, 'error');
                return;
            }

            if (this.attachedFiles.length >= 5) {
                this.showNotification('Можно прикрепить не более 5 файлов', 'error');
                return;
            }

            this.attachedFiles.push(file);
            this.renderAttachedFiles();
        });

        // Reset file input
        e.target.value = '';
        this.handleInputChange();
    }

    renderAttachedFiles() {
        const container = document.getElementById('attachedFiles');
        container.innerHTML = '';

        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}" title="Удалить файл">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
    }

    removeAttachedFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachedFiles();
        this.handleInputChange();
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        // Create new chat if none exists
        if (!this.currentChatId) {
            this.createNewChat();
        }

        // Add user message
        this.addMessage('user', message, this.attachedFiles);

        // Clear input and files
        userInput.value = '';
        this.attachedFiles = [];
        this.renderAttachedFiles();
        this.handleInputChange();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate AI response (replace with actual API call)
            const response = await this.simulateAIResponse(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage('ai', response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.');
            console.error('Error sending message:', error);
        }

        this.saveChats();
        this.updateUI();
    }

    async simulateAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simple response simulation based on message content
        if (message.toLowerCase().includes('привет')) {
            return 'Привет! Я KHAI - первый белорусский ИИ ассистент. Чем могу помочь?';
        } else if (message.toLowerCase().includes('погода')) {
            return 'К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить специализированные сервисы для получения точной информации.';
        } else if (message.toLowerCase().includes('время')) {
            return `Сейчас ${new Date().toLocaleTimeString('ru-RU')}. Время летит, не так ли? 😊`;
        } else {
            const responses = [
                'Интересный вопрос! Давайте разберем его подробнее...',
                'Отличный запрос! Вот что я могу сказать по этому поводу...',
                'Спасибо за вопрос! Вот мой ответ...',
                'Понимаю ваш интерес к этой теме. Вот что я нашел...',
                'Это важный вопрос. Давайте рассмотрим его вместе...'
            ];
            return responses[Math.floor(Math.random() * responses.length)] + '\n\n*Это демонстрационный ответ. В реальном приложении здесь будет ответ от ИИ модели.*';
        }
    }

    addMessage(type, content, files = []) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;

        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        messageElement.id = messageId;

        let messageContent = '';

        if (type === 'user') {
            messageContent = this.formatUserMessage(content, files);
        } else if (type === 'ai') {
            messageContent = this.formatAIMessage(content);
        } else if (type === 'error') {
            messageContent = this.formatErrorMessage(content);
        }

        messageElement.innerHTML = messageContent;
        messagesContainer.appendChild(messageElement);

        // Add to current chat
        if (this.currentChatId) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages.push({
                    type,
                    content,
                    files: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
                    timestamp: new Date().toISOString(),
                    id: messageId
                });
                chat.lastActivity = new Date().toISOString();
            }
        }

        this.scrollToBottom();
        this.updateChatList();
    }

    formatUserMessage(content, files) {
        let html = `<div class="message-content">${this.escapeHtml(content)}</div>`;

        if (files.length > 0) {
            html += '<div class="attached-files-preview">';
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    html += `
                        <div class="message-image">
                            <img src="${URL.createObjectURL(file)}" alt="${file.name}" loading="lazy">
                        </div>
                    `;
                } else {
                    html += `
                        <div class="attached-file-preview">
                            <i class="fas fa-file"></i> ${file.name}
                        </div>
                    `;
                }
            });
            html += '</div>';
        }

        return html;
    }

    formatAIMessage(content) {
        const formattedContent = this.formatMarkdown(content);
        return `
            <div class="message-content">${formattedContent}</div>
            <div class="message-actions">
                <button class="action-btn-small speak-btn" title="Озвучить сообщение">
                    <i class="fas fa-volume-up"></i> Озвучить
                </button>
                <button class="action-btn-small copy-btn" onclick="app.copyToClipboard('${this.escapeHtml(content)}')" title="Копировать текст">
                    <i class="fas fa-copy"></i> Копировать
                </button>
            </div>
            <div class="model-indicator">
                Ответ сгенерирован моделью: ${this.currentModel}
            </div>
        `;
    }

    formatErrorMessage(content) {
        return `
            <div class="message-content">
                <i class="fas fa-exclamation-triangle"></i> ${this.escapeHtml(content)}
            </div>
        `;
    }

    formatMarkdown(text) {
        // Basic markdown formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'text';
                return `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-language">${language}</span>
                            <button class="copy-code-btn" onclick="app.copyCode(this)">
                                <i class="fas fa-copy"></i> Копировать
                            </button>
                        </div>
                        <pre><code>${this.escapeHtml(code.trim())}</code></pre>
                    </div>
                `;
            })
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div>KHAI печатает</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chat = {
            id: chatId,
            name: 'Новый чат',
            messages: [],
            created: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            model: this.currentModel
        };

        this.chats.set(chatId, chat);
        this.currentChatId = chatId;
        
        this.clearMessages();
        this.updateChatList();
        this.updateUI();
        this.saveChats();

        this.showNotification('Создан новый чат', 'success');
    }

    loadChat(chatId) {
        const chat = this.chats.get(chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.clearMessages();
            
            // Render all messages
            chat.messages.forEach(msg => {
                this.addMessage(msg.type, msg.content, msg.files || []);
            });
            
            this.updateUI();
            this.closeSidebar();
            this.showNotification(`Загружен чат: ${chat.name}`, 'info');
        }
    }

    deleteChat(chatId) {
        if (this.chats.has(chatId)) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.currentChatId = null;
                this.clearMessages();
            }
            
            this.updateChatList();
            this.saveChats();
            this.showNotification('Чат удален', 'success');
        }
    }

    clearMessages() {
        document.getElementById('messagesContainer').innerHTML = '';
    }

    updateChatList() {
        this.renderChatList();
    }

    renderChatList() {
        const chatList = document.getElementById('chatList');
        const chatsArray = Array.from(this.chats.values())
            .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

        if (chatsArray.length === 0) {
            chatList.innerHTML = `
                <div class="no-chats">
                    <i class="fas fa-comments"></i>
                    <p>Нет сохраненных чатов</p>
                </div>
            `;
            return;
        }

        chatList.innerHTML = chatsArray.map(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? 
                (lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')) : 
                'Нет сообщений';
            
            const isActive = chat.id === this.currentChatId;
            
            return `
                <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                    <div class="chat-info">
                        <div class="chat-name">${this.escapeHtml(chat.name)}</div>
                        <div class="chat-preview">${this.escapeHtml(preview)}</div>
                    </div>
                    <div class="chat-actions">
                        <button class="chat-action-btn delete-chat" title="Удалить чат">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    searchChats(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        const searchTerm = query.toLowerCase().trim();

        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            const chatPreview = item.querySelector('.chat-preview').textContent.toLowerCase();
            const matches = chatName.includes(searchTerm) || chatPreview.includes(searchTerm);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    updateUI() {
        const currentChatInfo = document.getElementById('currentChatInfo');
        const newChatBtn = document.getElementById('newChatBtn');
        const expandBtn = document.getElementById('expandBtn');

        // Update current chat info
        if (this.currentChatId && this.chats.has(this.currentChatId)) {
            const chat = this.chats.get(this.currentChatId);
            currentChatInfo.textContent = chat.name;
            currentChatInfo.title = `Создан: ${new Date(chat.created).toLocaleString('ru-RU')}`;
        } else {
            currentChatInfo.textContent = 'Новый чат';
            currentChatInfo.title = '';
        }

        // Update navigation controls visibility
        this.updateNavigationControls();

        // Update expand button
        expandBtn.innerHTML = this.isExpandedMode ? 
            '<i class="fas fa-compress"></i>' : 
            '<i class="fas fa-expand"></i>';
        expandBtn.title = this.isExpandedMode ? 'Обычный режим' : 'Режим чтения';
    }

    updateNavigationControls() {
        const messagesContainer = document.getElementById('messagesContainer');
        const navigationControls = document.querySelector('.navigation-controls');
        
        if (messagesContainer.scrollHeight > messagesContainer.clientHeight) {
            navigationControls.classList.remove('hidden');
        } else {
            navigationControls.classList.add('hidden');
        }
    }

    scrollToTop() {
        document.getElementById('messagesContainer').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }

    clearInput() {
        document.getElementById('userInput').value = '';
        this.attachedFiles = [];
        this.renderAttachedFiles();
        this.handleInputChange();
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const voiceBtn = document.getElementById('voiceBtn');
        
        if (this.isVoiceMode) {
            this.startVoiceRecording();
            voiceBtn.classList.add('active');
            voiceBtn.title = 'Остановить запись';
        } else {
            this.stopVoiceRecording();
            voiceBtn.classList.remove('active');
            voiceBtn.title = 'Голосовой ввод';
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

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                await this.processAudioRecording(audioBlob);
                
                // Clean up
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.showNotification('Запись началась...', 'info');
        } catch (error) {
            console.error('Error starting voice recording:', error);
            this.showNotification('Ошибка доступа к микрофону', 'error');
            this.isVoiceMode = false;
            document.getElementById('voiceBtn').classList.remove('active');
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.showNotification('Запись остановлена', 'info');
        }
    }

    async processAudioRecording(audioBlob) {
        // Here you would send the audio to your speech-to-text API
        // For now, we'll simulate the response
        this.showNotification('Обработка аудио...', 'info');
        
        // Simulate API processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulated transcription
        const simulatedText = "Это пример распознанной речи. В реальном приложении здесь будет текст из вашего аудио.";
        document.getElementById('userInput').value = simulatedText;
        this.handleInputChange();
        
        this.showNotification('Речь распознана', 'success');
    }

    toggleTextToSpeech(button) {
        const messageElement = button.closest('.message');
        const messageContent = messageElement.querySelector('.message-content').textContent;

        if (button.classList.contains('speaking')) {
            this.stopSpeaking();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
        } else {
            // Stop any currently speaking message
            this.stopSpeaking();
            
            // Start speaking this message
            this.speakText(messageContent);
            button.classList.add('speaking');
            button.innerHTML = '<i class="fas fa-stop"></i> Остановить';
        }
    }

    speakText(text) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = 'ru-RU';
        this.currentUtterance.rate = 1.0;
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 0.8;

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            const speakingButtons = document.querySelectorAll('.speak-btn.speaking');
            speakingButtons.forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
            });
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.showNotification('Ошибка озвучивания', 'error');
        };

        this.speechSynthesis.speak(this.currentUtterance);
        this.isSpeaking = true;
    }

    stopSpeaking() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showNotification('Ошибка копирования', 'error');
        });
    }

    copyCode(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        this.copyToClipboard(code);
        
        // Visual feedback
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> Скопировано';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i> Копировать';
        }, 2000);
    }

    toggleTheme(e) {
        const theme = e.target.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.showNotification(`Тема изменена: ${theme === 'light' ? 'Светлая' : 'Темная'}`, 'info');
    }

    toggleExpandMode() {
        this.isExpandedMode = !this.isExpandedMode;
        
        document.body.classList.toggle('expanded-mode', this.isExpandedMode);
        document.querySelector('.chat-main').classList.toggle('expanded', this.isExpandedMode);
        document.querySelector('.messages-container').classList.toggle('expanded', this.isExpandedMode);
        document.querySelector('.app-header').classList.toggle('compact', this.isExpandedMode);
        document.querySelector('.input-section').classList.toggle('compact', this.isExpandedMode);
        document.querySelector('.app-footer').classList.toggle('compact', this.isExpandedMode);
        
        this.updateUI();
        this.showNotification(
            this.isExpandedMode ? 'Режим чтения включен' : 'Режим чтения выключен', 
            'info'
        );
    }

    toggleSidebar() {
        document.getElementById('sidebarMenu').classList.toggle('active');
        document.getElementById('overlay').classList.toggle('active');
    }

    closeSidebar() {
        document.getElementById('sidebarMenu').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }

    toggleSearch() {
        this.showNotification('Поиск по чатам активирован', 'info');
        this.toggleSidebar();
        setTimeout(() => {
            document.getElementById('chatSearchInput').focus();
        }, 300);
    }

    showSettings() {
        this.showNotification('Настройки пока недоступны', 'info');
        // Implement settings modal in future versions
    }

    exportChats() {
        const chatsData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            chats: Array.from(this.chats.values())
        };

        const dataStr = JSON.stringify(chatsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `khai-chats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чаты экспортированы', 'success');
    }

    importChats() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (importedData.chats && Array.isArray(importedData.chats)) {
                        importedData.chats.forEach(chat => {
                            this.chats.set(chat.id, chat);
                        });
                        
                        this.saveChats();
                        this.updateChatList();
                        this.showNotification('Чаты успешно импортированы', 'success');
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (error) {
                    console.error('Error importing chats:', error);
                    this.showNotification('Ошибка импорта: неверный формат файла', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chats.clear();
            this.currentChatId = null;
            this.clearMessages();
            this.updateChatList();
            this.updateUI();
            this.saveChats();
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        });
    }

    saveChats() {
        const chatsData = {
            version: '1.0',
            currentChatId: this.currentChatId,
            chats: Array.from(this.chats.values())
        };
        localStorage.setItem('khai-chats', JSON.stringify(chatsData));
    }

    loadChats() {
        try {
            const saved = localStorage.getItem('khai-chats');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.chats) {
                    data.chats.forEach(chat => {
                        this.chats.set(chat.id, chat);
                    });
                }
                if (data.currentChatId && this.chats.has(data.currentChatId)) {
                    this.currentChatId = data.currentChatId;
                    this.loadChat(this.currentChatId);
                }
            }
        } catch (error) {
            console.error('Error loading chats:', error);
            this.showNotification('Ошибка загрузки чатов', 'error');
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    setupSEO() {
        // Update meta tags dynamically
        document.title = 'KHAI — Первый белорусский ИИ чат';
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = 'KHAI — первый белорусский ИИ чат с поддержкой генерации изображений, голосового ввода и анализа файлов. Современный AI-ассистент для решения повседневных задач.';
        
        // Structured data for SEO
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "KHAI — Первый белорусский ИИ чат",
            "description": "Первый белорусский ИИ чат с генерацией изображений и голосовым вводом",
            "url": window.location.href,
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "permissions": "microphone",
            "author": {
                "@type": "Organization",
                "name": "KHAI"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    cleanup() {
        this.stopSpeaking();
        this.stopVoiceRecording();
        this.saveChats();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAChat();
});

// Handle page lifecycle events
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.app) {
        window.app.saveChats();
    }
});

// Handle beforeunload for cleanup
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});
