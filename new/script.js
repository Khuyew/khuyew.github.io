// Configuration and State Management
class ChatApp {
    constructor() {
        this.state = {
            currentChatId: null,
            chats: this.loadChats(),
            messages: [],
            isRecording: false,
            recognition: null,
            isContextEnabled: true,
            currentModel: 'gpt-4',
            theme: this.loadTheme(),
            isCompactMode: false,
            isFullScreen: false,
            attachedFiles: [],
            currentMessageIndex: -1,
            speechSynthesis: window.speechSynthesis || null,
            isSpeaking: false,
            currentUtterance: null
        };

        this.models = {
            'gpt-4': { name: 'GPT-4', icon: '🤖' },
            'gpt-3.5': { name: 'GPT-3.5', icon: '⚡' },
            'claude-2': { name: 'Claude 2', icon: '🧠' },
            'llama-2': { name: 'Llama 2', icon: '🦙' }
        };

        this.init();
    }

    // Initialization
    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.loadCurrentChat();
        this.setupSpeechRecognition();
        this.setupAutoResize();
        this.setupScrollHandling();
        this.setupKeyboardShortcuts();
        this.updateUI();
    }

    // Theme Management
    loadTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.updateThemeButton();
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme(this.state.theme);
        this.showNotification(`Тема изменена на ${this.state.theme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }

    updateThemeButton() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.innerHTML = this.state.theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // Chat Management
    loadChats() {
        const saved = localStorage.getItem('chats');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Create default chat
        const defaultChat = {
            id: 'default',
            name: 'Новый чат',
            createdAt: new Date().toISOString(),
            messages: []
        };
        
        return [defaultChat];
    }

    saveChats() {
        localStorage.setItem('chats', JSON.stringify(this.state.chats));
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            name: `Чат ${this.state.chats.length + 1}`,
            createdAt: new Date().toISOString(),
            messages: []
        };
        
        this.state.chats.unshift(newChat);
        this.state.currentChatId = chatId;
        this.state.messages = [];
        this.state.attachedFiles = [];
        
        this.saveChats();
        this.updateChatList();
        this.updateUI();
        this.showNotification('Новый чат создан', 'success');
    }

    switchChat(chatId) {
        const chat = this.state.chats.find(c => c.id === chatId);
        if (chat) {
            this.state.currentChatId = chatId;
            this.state.messages = [...chat.messages];
            this.state.attachedFiles = [];
            this.updateUI();
            this.hideSidebar();
        }
    }

    renameChat(chatId, newName) {
        const chat = this.state.chats.find(c => c.id === chatId);
        if (chat && newName.trim()) {
            chat.name = newName.trim();
            this.saveChats();
            this.updateChatList();
            this.showNotification('Чат переименован', 'success');
        }
    }

    deleteChat(chatId) {
        if (this.state.chats.length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }

        this.state.chats = this.state.chats.filter(c => c.id !== chatId);
        
        if (this.state.currentChatId === chatId) {
            this.state.currentChatId = this.state.chats[0].id;
            this.loadCurrentChat();
        }
        
        this.saveChats();
        this.updateChatList();
        this.showNotification('Чат удален', 'success');
    }

    loadCurrentChat() {
        if (this.state.currentChatId) {
            const chat = this.state.chats.find(c => c.id === this.state.currentChatId);
            if (chat) {
                this.state.messages = [...chat.messages];
            }
        } else if (this.state.chats.length > 0) {
            this.state.currentChatId = this.state.chats[0].id;
            this.state.messages = [...this.state.chats[0].messages];
        }
    }

    // Message Management
    async sendMessage(content = null) {
        const input = document.getElementById('userInput');
        const messageContent = content || input.value.trim();
        
        if (!messageContent && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение', 'warning');
            return;
        }

        // Create user message
        const userMessage = {
            id: 'msg_' + Date.now(),
            role: 'user',
            content: messageContent,
            timestamp: new Date().toISOString(),
            files: [...this.state.attachedFiles]
        };

        this.addMessage(userMessage);
        input.value = '';
        this.clearAttachedFiles();
        this.updateInputHeight();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate AI response
            const aiResponse = await this.generateAIResponse(userMessage);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI message
            this.addMessage({
                id: 'msg_' + Date.now(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString(),
                model: this.state.currentModel
            });

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage({
                id: 'msg_' + Date.now(),
                role: 'error',
                content: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
                timestamp: new Date().toISOString()
            });
            console.error('Error generating response:', error);
        }

        this.saveCurrentChat();
        this.updateUI();
    }

    async generateAIResponse(userMessage) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const responses = [
            "Это интересный вопрос! Давайте разберем его подробнее...",
            "На основе вашего сообщения, я могу предложить следующее:",
            "Отличный вопрос! Вот что я могу сказать по этой теме:",
            "Понял ваш запрос. Вот мой ответ:",
            "Спасибо за вопрос! Вот что я нашел:"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        if (userMessage.files && userMessage.files.length > 0) {
            return `${randomResponse}\n\nЯ также проанализировал прикрепленные файлы. В них содержится полезная информация, которую я учел в своем ответе.`;
        }

        return `${randomResponse}\n\nЭто симуляция ответа ИИ. В реальном приложении здесь был бы ответ от выбранной модели.`;
    }

    addMessage(message) {
        this.state.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role}`;
        messageDiv.id = message.id;

        let content = '';
        
        if (message.role === 'user') {
            content = this.createUserMessageContent(message);
        } else if (message.role === 'assistant') {
            content = this.createAIMessageContent(message);
        } else if (message.role === 'error') {
            content = this.createErrorMessageContent(message);
        }

        messageDiv.innerHTML = content;
        this.setupMessageActions(messageDiv, message);
        
        return messageDiv;
    }

    createUserMessageContent(message) {
        let filesContent = '';
        if (message.files && message.files.length > 0) {
            filesContent = message.files.map(file => 
                `<div class="message-image">
                    <img src="${file.url}" alt="${file.name}" onclick="chatApp.viewImage('${file.url}')">
                </div>`
            ).join('');
        }

        return `
            <div class="message-content">${this.formatMessage(message.content)}</div>
            ${filesContent}
            <div class="message-actions">
                <button class="action-btn-small" onclick="chatApp.copyMessage('${message.id}')">
                    <i class="fas fa-copy"></i> Копировать
                </button>
                <button class="action-btn-small" onclick="chatApp.speakMessage('${message.id}')">
                    <i class="fas fa-volume-up"></i> Озвучить
                </button>
            </div>
        `;
    }

    createAIMessageContent(message) {
        return `
            <div class="message-content">${this.formatMessage(message.content)}</div>
            <div class="model-indicator">
                Модель: ${this.models[message.model]?.name || message.model}
            </div>
            <div class="message-actions">
                <button class="action-btn-small" onclick="chatApp.copyMessage('${message.id}')">
                    <i class="fas fa-copy"></i> Копировать
                </button>
                <button class="action-btn-small" onclick="chatApp.speakMessage('${message.id}')">
                    <i class="fas fa-volume-up"></i> Озвучить
                </button>
                <button class="action-btn-small" onclick="chatApp.regenerateResponse('${message.id}')">
                    <i class="fas fa-redo"></i> Перегенерировать
                </button>
            </div>
        `;
    }

    createErrorMessageContent(message) {
        return `
            <div class="message-content">
                <i class="fas fa-exclamation-triangle"></i> ${message.content}
            </div>
            <div class="message-actions">
                <button class="action-btn-small" onclick="chatApp.retryMessage('${message.id}')">
                    <i class="fas fa-redo"></i> Попробовать снова
                </button>
            </div>
        `;
    }

    formatMessage(content) {
        if (!content) return '';
        
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    setupMessageActions(messageElement, message) {
        // Add any additional message action setup here
    }

    // File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.addAttachedFile(file);
            }
        });
        event.target.value = ''; // Reset input
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        
        if (file.size > maxSize) {
            this.showNotification('Файл слишком большой (макс. 10MB)', 'error');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Неподдерживаемый тип файла', 'error');
            return false;
        }
        
        return true;
    }

    addAttachedFile(file) {
        const fileId = 'file_' + Date.now();
        const fileUrl = URL.createObjectURL(file);
        
        this.state.attachedFiles.push({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: fileUrl
        });
        
        this.renderAttachedFile(fileId);
        this.showNotification(`Файл "${file.name}" добавлен`, 'success');
    }

    renderAttachedFile(fileId) {
        const file = this.state.attachedFiles.find(f => f.id === fileId);
        if (!file) return;

        const attachedFilesContainer = document.getElementById('attachedFiles');
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="fas ${this.getFileIcon(file.type)}"></i>
            <span>${file.name}</span>
            <button class="remove-file" onclick="chatApp.removeAttachedFile('${fileId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        attachedFilesContainer.appendChild(fileElement);
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType === 'application/pdf') return 'fa-file-pdf';
        return 'fa-file';
    }

    removeAttachedFile(fileId) {
        const fileIndex = this.state.attachedFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            const file = this.state.attachedFiles[fileIndex];
            URL.revokeObjectURL(file.url);
            this.state.attachedFiles.splice(fileIndex, 1);
            this.updateAttachedFilesDisplay();
        }
    }

    clearAttachedFiles() {
        this.state.attachedFiles.forEach(file => {
            URL.revokeObjectURL(file.url);
        });
        this.state.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    updateAttachedFilesDisplay() {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        attachedFilesContainer.innerHTML = '';
        
        this.state.attachedFiles.forEach(file => {
            this.renderAttachedFile(file.id);
        });
    }

    viewImage(imageUrl) {
        // Simple image viewer
        window.open(imageUrl, '_blank');
    }

    // Voice Recognition
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.recognition = new SpeechRecognition();
            
            this.state.recognition.continuous = false;
            this.state.recognition.interimResults = true;
            this.state.recognition.lang = 'ru-RU';

            this.state.recognition.onstart = () => {
                this.state.isRecording = true;
                this.updateVoiceButton();
                this.showNotification('Голосовой ввод активирован', 'info');
            };

            this.state.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                document.getElementById('userInput').value = transcript;
            };

            this.state.recognition.onend = () => {
                this.state.isRecording = false;
                this.updateVoiceButton();
            };

            this.state.recognition.onerror = (event) => {
                this.state.isRecording = false;
                this.updateVoiceButton();
                this.showNotification('Ошибка голосового ввода: ' + event.error, 'error');
            };
        }
    }

    toggleVoiceInput() {
        if (!this.state.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }

        if (this.state.isRecording) {
            this.state.recognition.stop();
        } else {
            this.state.recognition.start();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceInput');
        if (voiceBtn) {
            if (this.state.isRecording) {
                voiceBtn.classList.add('active');
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            } else {
                voiceBtn.classList.remove('active');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
    }

    // Text-to-Speech
    speakMessage(messageId) {
        const message = this.state.messages.find(m => m.id === messageId);
        if (!message || !message.content) return;

        if (this.state.isSpeaking) {
            this.stopSpeech();
            return;
        }

        if (this.state.speechSynthesis) {
            this.state.currentUtterance = new SpeechSynthesisUtterance(message.content);
            this.state.currentUtterance.lang = 'ru-RU';
            this.state.currentUtterance.rate = 1.0;
            this.state.currentUtterance.pitch = 1.0;

            this.state.currentUtterance.onstart = () => {
                this.state.isSpeaking = true;
                this.updateSpeakButton(messageId);
            };

            this.state.currentUtterance.onend = () => {
                this.state.isSpeaking = false;
                this.state.currentUtterance = null;
                this.updateSpeakButton(messageId);
            };

            this.state.currentUtterance.onerror = () => {
                this.state.isSpeaking = false;
                this.state.currentUtterance = null;
                this.updateSpeakButton(messageId);
                this.showNotification('Ошибка воспроизведения', 'error');
            };

            this.state.speechSynthesis.speak(this.state.currentUtterance);
        } else {
            this.showNotification('Озвучка не поддерживается в вашем браузере', 'error');
        }
    }

    stopSpeech() {
        if (this.state.speechSynthesis && this.state.isSpeaking) {
            this.state.speechSynthesis.cancel();
            this.state.isSpeaking = false;
            this.state.currentUtterance = null;
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
            });
        }
    }

    updateSpeakButton(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            const speakBtn = messageElement.querySelector('.speak-btn');
            if (speakBtn) {
                if (this.state.isSpeaking) {
                    speakBtn.classList.add('speaking');
                    speakBtn.innerHTML = '<i class="fas fa-stop"></i> Остановить';
                } else {
                    speakBtn.classList.remove('speaking');
                    speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
                }
            }
        }
    }

    // UI Management
    updateUI() {
        this.updateMessageCounter();
        this.updateContextStatus();
        this.updateChatInfo();
        this.updateNavigationButtons();
        this.updateModelSelector();
    }

    updateMessageCounter() {
        const counter = document.getElementById('messageCounter');
        if (counter) {
            const totalMessages = this.state.messages.filter(m => m.role !== 'error').length;
            counter.textContent = `${totalMessages} сообщений`;
        }
    }

    updateContextStatus() {
        const status = document.getElementById('contextStatus');
        if (status) {
            const dot = status.querySelector('.status-dot');
            const text = status.querySelector('span');
            
            if (this.state.isContextEnabled) {
                dot.className = 'status-dot';
                text.textContent = 'Контекст активен';
            } else {
                dot.className = 'status-dot warning';
                text.textContent = 'Контекст отключен';
            }
        }
    }

    updateChatInfo() {
        const chatInfo = document.getElementById('currentChatInfo');
        if (chatInfo) {
            const currentChat = this.state.chats.find(c => c.id === this.state.currentChatId);
            if (currentChat) {
                chatInfo.innerHTML = `<i class="fas fa-comment"></i> ${currentChat.name}`;
            }
        }
    }

    updateNavigationButtons() {
        const navControls = document.querySelector('.navigation-controls');
        if (navControls) {
            if (this.state.messages.length > 0) {
                navControls.classList.remove('hidden');
            } else {
                navControls.classList.add('hidden');
            }
        }
    }

    updateModelSelector() {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.value = this.state.currentModel;
        }
    }

    toggleContext() {
        this.state.isContextEnabled = !this.state.isContextEnabled;
        this.updateContextStatus();
        this.showNotification(
            `Контекст ${this.state.isContextEnabled ? 'включен' : 'отключен'}`,
            'info'
        );
    }

    changeModel(modelId) {
        if (this.models[modelId]) {
            this.state.currentModel = modelId;
            this.updateModelSelector();
            this.showNotification(`Модель изменена на ${this.models[modelId].name}`, 'info');
        }
    }

    // Navigation
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    scrollToTop() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = 0;
        }
    }

    navigateMessages(direction) {
        const input = document.getElementById('userInput');
        const userMessages = this.state.messages.filter(m => m.role === 'user');
        
        if (direction === 'up') {
            if (this.state.currentMessageIndex < userMessages.length - 1) {
                this.state.currentMessageIndex++;
            } else {
                this.state.currentMessageIndex = 0;
            }
        } else {
            if (this.state.currentMessageIndex > 0) {
                this.state.currentMessageIndex--;
            } else {
                this.state.currentMessageIndex = userMessages.length - 1;
            }
        }
        
        if (userMessages[this.state.currentMessageIndex]) {
            input.value = userMessages[this.state.currentMessageIndex].content;
            this.updateInputHeight();
        }
    }

    // Search
    searchChats(query) {
        const chatList = document.getElementById('chatList');
        const chatItems = chatList.getElementsByClassName('chat-item');
        
        Array.from(chatItems).forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            const chatPreview = item.querySelector('.chat-preview').textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (chatName.includes(searchTerm) || chatPreview.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchInChat(query) {
        // Implement chat content search
        this.showNotification(`Поиск: "${query}"`, 'info');
    }

    // Input Management
    setupAutoResize() {
        const input = document.getElementById('userInput');
        input.addEventListener('input', this.updateInputHeight.bind(this));
    }

    updateInputHeight() {
        const input = document.getElementById('userInput');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    clearInput() {
        const input = document.getElementById('userInput');
        input.value = '';
        this.updateInputHeight();
        this.clearAttachedFiles();
    }

    // Typing Indicator
    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>Модель печатает...</span>
        `;
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Sidebar Management
    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    hideSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;

        chatList.innerHTML = '';
        
        this.state.chats.forEach(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? 
                (lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')) : 
                'Нет сообщений';
            
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.state.currentChatId ? 'active' : ''}`;
            chatItem.onclick = () => this.switchChat(chat.id);
            
            chatItem.innerHTML = `
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${preview}</div>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn" onclick="event.stopPropagation(); chatApp.renameChatPrompt('${chat.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn danger" onclick="event.stopPropagation(); chatApp.deleteChatPrompt('${chat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            chatList.appendChild(chatItem);
        });
    }

    // Modal Dialogs
    renameChatPrompt(chatId) {
        const chat = this.state.chats.find(c => c.id === chatId);
        if (!chat) return;

        const newName = prompt('Введите новое название чата:', chat.name);
        if (newName !== null) {
            this.renameChat(chatId, newName);
        }
    }

    deleteChatPrompt(chatId) {
        if (confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
            this.deleteChat(chatId);
        }
    }

    showClearChatPrompt() {
        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            this.clearCurrentChat();
        }
    }

    clearCurrentChat() {
        const currentChat = this.state.chats.find(c => c.id === this.state.currentChatId);
        if (currentChat) {
            currentChat.messages = [];
            this.state.messages = [];
            this.saveChats();
            this.updateUI();
            this.clearMessagesDisplay();
            this.showNotification('История чата очищена', 'success');
        }
    }

    clearMessagesDisplay() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notificationsContainer');
        if (!notificationsContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        notificationsContainer.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility Methods
    copyMessage(messageId) {
        const message = this.state.messages.find(m => m.id === messageId);
        if (message && message.content) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Сообщение скопировано', 'success');
            }).catch(() => {
                this.showNotification('Не удалось скопировать сообщение', 'error');
            });
        }
    }

    regenerateResponse(messageId) {
        const messageIndex = this.state.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
            // Remove the AI response and regenerate
            this.state.messages.splice(messageIndex, 1);
            const userMessage = this.state.messages[messageIndex - 1];
            
            if (userMessage && userMessage.role === 'user') {
                this.sendMessage(userMessage.content);
            }
        }
    }

    retryMessage(messageId) {
        const messageIndex = this.state.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
            this.state.messages.splice(messageIndex, 1);
            this.updateMessagesDisplay();
            this.sendMessage();
        }
    }

    updateMessagesDisplay() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        this.state.messages.forEach(message => this.renderMessage(message));
    }

    saveCurrentChat() {
        const currentChat = this.state.chats.find(c => c.id === this.state.currentChatId);
        if (currentChat) {
            currentChat.messages = [...this.state.messages];
            this.saveChats();
        }
    }

    // Scroll Handling
    setupScrollHandling() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
        }
    }

    handleScroll() {
        // Implement scroll-based features if needed
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + K for search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                document.getElementById('headerSearchInput')?.focus();
            }

            // Ctrl/Cmd + / for help
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Escape to clear input or close modals
            if (event.key === 'Escape') {
                this.hideSidebar();
                const modals = document.querySelectorAll('.modal.active');
                if (modals.length > 0) {
                    modals.forEach(modal => modal.classList.remove('active'));
                } else {
                    this.clearInput();
                }
            }

            // Up arrow for message history
            if (event.key === 'ArrowUp' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                this.navigateMessages('up');
            }

            // Down arrow for message history
            if (event.key === 'ArrowDown' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                this.navigateMessages('down');
            }

            // Enter to send message (with Shift for new line)
            if (event.key === 'Enter' && !event.shiftKey) {
                const input = document.getElementById('userInput');
                if (document.activeElement === input && input.value.trim()) {
                    event.preventDefault();
                    this.sendMessage();
                }
            }
        });
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { keys: 'Ctrl+K', action: 'Поиск' },
            { keys: 'Ctrl+/', action: 'Показать горячие клавиши' },
            { keys: 'Esc', action: 'Очистить/Закрыть' },
            { keys: 'Ctrl+↑', action: 'История сообщений (вверх)' },
            { keys: 'Ctrl+↓', action: 'История сообщений (вниз)' },
            { keys: 'Enter', action: 'Отправить сообщение' },
            { keys: 'Shift+Enter', action: 'Новая строка' }
        ];

        const shortcutsText = shortcuts.map(s => `${s.keys}: ${s.action}`).join('\n');
        alert('Горячие клавиши:\n\n' + shortcutsText);
    }

    // Compact Mode
    toggleCompactMode() {
        this.state.isCompactMode = !this.state.isCompactMode;
        document.body.classList.toggle('compact-mode', this.state.isCompactMode);
        this.showNotification(
            `Компактный режим ${this.state.isCompactMode ? 'включен' : 'отключен'}`,
            'info'
        );
    }

    // Full Screen Mode
    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                this.showNotification('Ошибка при переходе в полноэкранный режим', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Input events
        document.getElementById('userInput')?.addEventListener('input', this.updateInputHeight.bind(this));
        document.getElementById('sendMessage')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('clearInput')?.addEventListener('click', () => this.clearInput());
        document.getElementById('voiceInput')?.addEventListener('click', () => this.toggleVoiceInput());
        document.getElementById('attachFile')?.addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleFileSelect(e));

        // Header controls
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('menuToggle')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('modelSelect')?.addEventListener('change', (e) => this.changeModel(e.target.value));
        document.getElementById('headerSearchInput')?.addEventListener('input', (e) => this.searchInChat(e.target.value));

        // Navigation
        document.getElementById('scrollToTop')?.addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottom')?.addEventListener('click', () => this.scrollToBottom());

        // Footer controls
        document.getElementById('toggleContext')?.addEventListener('click', () => this.toggleContext());

        // Sidebar
        document.getElementById('sidebarOverlay')?.addEventListener('click', () => this.hideSidebar());
        document.getElementById('sidebarClose')?.addEventListener('click', () => this.hideSidebar());
        document.getElementById('newChatBtn')?.addEventListener('click', () => this.createNewChat());
        document.getElementById('clearChatBtn')?.addEventListener('click', () => this.showClearChatPrompt());
        document.getElementById('exportChatBtn')?.addEventListener('click', () => this.exportChat());
        document.getElementById('importChatBtn')?.addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile')?.addEventListener('change', (e) => this.importChat(e));
        document.getElementById('chatSearchInput')?.addEventListener('input', (e) => this.searchChats(e.target.value));

        // Global events
        document.addEventListener('fullscreenchange', this.handleFullScreenChange.bind(this));
        
        // Prevent drag and drop default behavior
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());

        // File drop zone
        this.setupFileDropZone();
    }

    setupFileDropZone() {
        const dropZone = document.getElementById('userInput');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.backgroundColor = 'var(--accent-primary-alpha)';
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.style.backgroundColor = '';
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.backgroundColor = '';
                
                const files = Array.from(e.dataTransfer.files);
                files.forEach(file => {
                    if (this.validateFile(file)) {
                        this.addAttachedFile(file);
                    }
                });
            });
        }
    }

    handleFullScreenChange() {
        this.state.isFullScreen = !!document.fullscreenElement;
    }

    // Import/Export
    exportChat() {
        const currentChat = this.state.chats.find(c => c.id === this.state.currentChatId);
        if (!currentChat) return;

        const dataStr = JSON.stringify(currentChat, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chat-${currentChat.name}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        this.showNotification('Чат экспортирован', 'success');
    }

    importChat(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const chatData = JSON.parse(e.target.result);
                
                // Validate chat data structure
                if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
                    const chatId = 'chat_' + Date.now();
                    const newChat = {
                        id: chatId,
                        name: chatData.name || `Импортированный чат`,
                        createdAt: chatData.createdAt || new Date().toISOString(),
                        messages: chatData.messages
                    };
                    
                    this.state.chats.unshift(newChat);
                    this.state.currentChatId = chatId;
                    this.state.messages = [...newChat.messages];
                    
                    this.saveChats();
                    this.updateChatList();
                    this.updateUI();
                    this.updateMessagesDisplay();
                    
                    this.showNotification('Чат импортирован', 'success');
                } else {
                    throw new Error('Invalid chat format');
                }
            } catch (error) {
                this.showNotification('Ошибка при импорте чата', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    // Cleanup
    cleanup() {
        this.clearAttachedFiles();
        this.stopSpeech();
        if (this.state.recognition && this.state.isRecording) {
            this.state.recognition.stop();
        }
    }
}

// Initialize the application when DOM is loaded
let chatApp;

document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});

// Handle page unload for cleanup
window.addEventListener('beforeunload', () => {
    if (chatApp) {
        chatApp.cleanup();
    }
});

// Service Worker Registration for PWA
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
