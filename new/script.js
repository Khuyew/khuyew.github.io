// Основной класс приложения
class KHAIApp {
    constructor() {
        this.currentChat = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-5-nano';
        this.isOnline = true;
        this.isListening = false;
        this.isSpeaking = false;
        this.speechSynthesis = window.speechSynthesis;
        this.speechRecognition = null;
        this.attachedFiles = [];
        this.isMenuOpen = false;
        
        this.initializeApp();
    }
    
    // Инициализация приложения
    initializeApp() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.loadChats();
        this.applyTheme();
        this.setupPWA();
    }
    
    // Инициализация DOM элементов
    initializeElements() {
        this.elements = {
            // Основные элементы
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            
            // Кнопки
            menuToggle: document.getElementById('menuToggle'),
            themeToggle: document.getElementById('themeToggle'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            attachFileBtn: document.getElementById('attachFileBtn'),
            fileInput: document.getElementById('fileInput'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            helpBtn: document.getElementById('helpBtn'),
            
            // Меню
            mobileMenu: document.getElementById('mobileMenu'),
            menuOverlay: document.getElementById('menuOverlay'),
            menuClose: document.getElementById('menuClose'),
            modelSelect: document.getElementById('modelSelect'),
            chatList: document.getElementById('chatList'),
            newChatBtn: document.getElementById('newChatBtn'),
            exportChatBtn: document.getElementById('exportChatBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            
            // Другие элементы
            attachedFiles: document.getElementById('attachedFiles'),
            currentChatName: document.getElementById('currentChatName'),
            connectionStatus: document.getElementById('connectionStatus'),
            notificationContainer: document.getElementById('notificationContainer')
        };
    }
    
    // Инициализация обработчиков событий
    initializeEventListeners() {
        // Ввод сообщения
        this.elements.userInput.addEventListener('input', this.handleInputChange.bind(this));
        this.elements.userInput.addEventListener('keydown', this.handleInputKeydown.bind(this));
        this.elements.sendBtn.addEventListener('click', this.sendMessage.bind(this));
        
        // Голосовой ввод
        this.elements.voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        
        // Прикрепление файлов
        this.elements.attachFileBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Навигация и меню
        this.elements.menuToggle.addEventListener('click', this.toggleMenu.bind(this));
        this.elements.menuClose.addEventListener('click', this.closeMenu.bind(this));
        this.elements.menuOverlay.addEventListener('click', this.closeMenu.bind(this));
        
        // Тема
        this.elements.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Управление чатами
        this.elements.newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        this.elements.clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        this.elements.clearAllBtn.addEventListener('click', this.clearAllChats.bind(this));
        this.elements.exportChatBtn.addEventListener('click', this.exportCurrentChat.bind(this));
        this.elements.helpBtn.addEventListener('click', this.showHelp.bind(this));
        
        // Модель ИИ
        this.elements.modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.showNotification(`Модель изменена на: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
        
        // События для перетаскивания файлов
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleFileDrop.bind(this));
        
        // Обработка изменения размера окна
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Обработка онлайн/офлайн статуса
        window.addEventListener('online', this.handleOnlineStatus.bind(this));
        window.addEventListener('offline', this.handleOnlineStatus.bind(this));
        
        // Предотвращение закрытия при отправке сообщения
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
    
    // Инициализация распознавания речи
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'ru-RU';
            
            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.elements.voiceInputBtn.classList.add('listening');
                this.showNotification('Слушаю...', 'info');
            };
            
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.userInput.value = transcript;
                this.handleInputChange();
                this.showNotification('Речь распознана', 'success');
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
            };
            
            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.elements.voiceInputBtn.classList.remove('listening');
            };
        } else {
            this.elements.voiceInputBtn.style.display = 'none';
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'warning');
        }
    }
    
    // Обработка изменения ввода
    handleInputChange() {
        const textarea = this.elements.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Активация/деактивация кнопки отправки
        const hasText = textarea.value.trim().length > 0;
        this.elements.sendBtn.disabled = !hasText && this.attachedFiles.length === 0;
    }
    
    // Обработка нажатия клавиш в поле ввода
    handleInputKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
    
    // Отправка сообщения
    async sendMessage() {
        const message = this.elements.userInput.value.trim();
        const hasAttachments = this.attachedFiles.length > 0;
        
        if (!message && !hasAttachments) return;
        
        // Добавление сообщения пользователя
        this.addMessage('user', message, this.attachedFiles);
        
        // Очистка ввода
        this.elements.userInput.value = '';
        this.handleInputChange();
        this.clearAttachedFiles();
        
        // Показать индикатор набора
        this.showTypingIndicator();
        
        try {
            // Имитация ответа ИИ (в реальном приложении здесь будет API вызов)
            await this.simulateAIResponse(message);
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.addMessage('error', 'Произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз.');
        } finally {
            this.hideTypingIndicator();
        }
    }
    
    // Имитация ответа ИИ (заглушка для демонстрации)
    async simulateAIResponse(userMessage) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = [
                    "Я понимаю ваш вопрос. Давайте разберем его подробнее...",
                    "Это интересный вопрос! Вот что я могу сказать по этой теме...",
                    "На основе вашего запроса, я рекомендую рассмотреть следующие варианты...",
                    "Отличный вопрос! Вот подробное объяснение...",
                    "Я проанализировал ваш запрос и могу предложить следующее решение..."
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage('ai', randomResponse);
                resolve();
            }, 1500 + Math.random() * 2000);
        });
    }
    
    // Добавление сообщения в чат
    addMessage(type, content, attachments = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        
        let messageContent = '';
        
        if (type === 'user') {
            messageContent = this.formatUserMessage(content, attachments);
        } else if (type === 'ai') {
            messageContent = this.formatAIMessage(content);
        } else if (type === 'error') {
            messageContent = `
                <div class="message-content">
                    <i class="ti ti-alert-triangle"></i> ${content}
                </div>
            `;
        }
        
        messageDiv.innerHTML = messageContent;
        this.elements.messagesContainer.appendChild(messageDiv);
        
        // Прокрутка к последнему сообщению
        this.scrollToBottom();
        
        // Сохранение в историю
        this.saveMessageToHistory(type, content, attachments);
    }
    
    // Форматирование сообщения пользователя
    formatUserMessage(content, attachments) {
        let html = '<div class="message-content">';
        
        if (content) {
            html += `<p>${this.escapeHtml(content)}</p>`;
        }
        
        if (attachments && attachments.length > 0) {
            attachments.forEach(file => {
                if (file.type.startsWith('image/')) {
                    html += `
                        <div class="message-image">
                            <img src="${URL.createObjectURL(file)}" alt="Прикрепленное изображение">
                        </div>
                    `;
                }
            });
        }
        
        html += '</div>';
        return html;
    }
    
    // Форматирование сообщения ИИ
    formatAIMessage(content) {
        const formattedContent = marked.parse(content);
        
        return `
            <div class="message-content">
                ${formattedContent}
                <div class="model-indicator">
                    Модель: ${this.getModelDisplayName(this.currentModel)}
                </div>
                <div class="message-actions">
                    <button class="action-btn-small speak-btn" onclick="app.speakText('${this.escapeHtml(content)}')">
                        <i class="ti ti-volume"></i> Озвучить
                    </button>
                    <button class="action-btn-small copy-btn" onclick="app.copyToClipboard('${this.escapeHtml(content)}')">
                        <i class="ti ti-copy"></i> Копировать
                    </button>
                </div>
            </div>
        `;
    }
    
    // Показать индикатор набора текста
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-ai typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>KHAI печатает...</span>
        `;
        this.elements.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    // Скрыть индикатор набора текста
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Прокрутка к нижней части чата
    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }
    
    // Обработка выбора файла
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.addAttachedFiles(files);
        event.target.value = ''; // Сброс input
    }
    
    // Обработка перетаскивания файлов
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    }
    
    handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const files = Array.from(event.dataTransfer.files);
        this.addAttachedFiles(files);
    }
    
    // Добавление прикрепленных файлов
    addAttachedFiles(files) {
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length === 0) {
            this.showNotification('Пожалуйста, выберите только изображения', 'warning');
            return;
        }
        
        if (this.attachedFiles.length + validFiles.length > 5) {
            this.showNotification('Можно прикрепить не более 5 файлов', 'warning');
            return;
        }
        
        this.attachedFiles.push(...validFiles);
        this.updateAttachedFilesDisplay();
        this.showNotification(`Добавлено ${validFiles.length} изображений`, 'success');
    }
    
    // Обновление отображения прикрепленных файлов
    updateAttachedFilesDisplay() {
        this.elements.attachedFiles.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'attached-file';
            fileDiv.innerHTML = `
                <i class="ti ti-photo"></i>
                <span>${file.name}</span>
                <button class="remove-file" onclick="app.removeAttachedFile(${index})">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.elements.attachedFiles.appendChild(fileDiv);
        });
    }
    
    // Удаление прикрепленного файла
    removeAttachedFile(index) {
        this.attachedFiles.splice(index, 1);
        this.updateAttachedFilesDisplay();
    }
    
    // Очистка всех прикрепленных файлов
    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }
    
    // Переключение голосового ввода
    toggleVoiceInput() {
        if (!this.speechRecognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }
        
        if (this.isListening) {
            this.speechRecognition.stop();
        } else {
            this.speechRecognition.start();
        }
    }
    
    // Озвучка текста
    speakText(text) {
        if (this.isSpeaking) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
            });
            return;
        }
        
        if (!text.trim()) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.add('speaking');
                btn.innerHTML = '<i class="ti ti-player-stop"></i> Остановить';
            });
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
            });
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
            });
            this.showNotification('Ошибка озвучки', 'error');
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    // Копирование текста в буфер обмена
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showNotification('Не удалось скопировать текст', 'error');
        }
    }
    
    // Переключение меню
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.elements.mobileMenu.classList.toggle('active', this.isMenuOpen);
        this.elements.menuOverlay.classList.toggle('active', this.isMenuOpen);
        
        if (this.isMenuOpen) {
            this.updateChatList();
        }
    }
    
    // Закрытие меню
    closeMenu() {
        this.isMenuOpen = false;
        this.elements.mobileMenu.classList.remove('active');
        this.elements.menuOverlay.classList.remove('active');
    }
    
    // Переключение темы
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
        
        this.showNotification(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
    }
    
    // Применение сохраненной темы
    applyTheme() {
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = savedTheme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
    }
    
    // Создание нового чата
    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Чат ${this.chats.size + 1}`;
        
        this.chats.set(chatId, {
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString()
        });
        
        this.switchToChat(chatId);
        this.closeMenu();
        this.showNotification('Новый чат создан', 'success');
    }
    
    // Переключение на чат
    switchToChat(chatId) {
        this.currentChat = chatId;
        this.elements.currentChatName.textContent = this.chats.get(chatId).name;
        this.loadCurrentChatMessages();
        this.closeMenu();
    }
    
    // Очистка текущего чата
    clearCurrentChat() {
        if (this.chats.has(this.currentChat)) {
            this.chats.get(this.currentChat).messages = [];
            this.loadCurrentChatMessages();
            this.showNotification('Чат очищен', 'success');
        }
    }
    
    // Очистка всех чатов
    clearAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chats.clear();
            this.createNewChat();
            this.showNotification('Все чаты удалены', 'success');
        }
    }
    
    // Экспорт текущего чата
    exportCurrentChat() {
        if (!this.chats.has(this.currentChat)) return;
        
        const chat = this.chats.get(this.currentChat);
        const exportData = {
            name: chat.name,
            messages: chat.messages,
            exportedAt: new Date().toISOString(),
            model: this.currentModel
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `khai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат экспортирован', 'success');
    }
    
    // Показать справку
    showHelp() {
        const helpMessage = `
## Справка по KHAI

### Основные функции:
- **Текстовый чат**: Напишите сообщение и нажмите отправить
- **Голосовой ввод**: Нажмите кнопку микрофона для голосового ввода
- **Прикрепление файлов**: Добавляйте изображения для анализа
- **Озвучка ответов**: Нажмите "Озвучить" под сообщением ИИ

### Советы:
- Используйте Shift+Enter для переноса строки
- Перетаскивайте изображения прямо в чат
- Создавайте отдельные чаты для разных тем

### Поддерживаемые модели:
- GPT-5 Nano: Быстрые ответы
- O3 Mini: Оптимизированная для мобильных
- DeepSeek Chat: Универсальная модель
- DeepSeek Reasoner: Для сложных задач
- Gemini 2.0 Flash: Мультимодальная
        `;
        
        this.addMessage('ai', helpMessage);
        this.showNotification('Справка загружена', 'info');
    }
    
    // Загрузка чатов из localStorage
    loadChats() {
        const savedChats = localStorage.getItem('khai-chats');
        if (savedChats) {
            try {
                const chatsData = JSON.parse(savedChats);
                this.chats = new Map(Object.entries(chatsData));
            } catch (error) {
                console.error('Error loading chats:', error);
                this.chats = new Map();
            }
        }
        
        if (this.chats.size === 0) {
            this.createNewChat();
        } else {
            this.switchToChat(Array.from(this.chats.keys())[0]);
        }
    }
    
    // Сохранение чатов в localStorage
    saveChats() {
        const chatsObj = Object.fromEntries(this.chats);
        localStorage.setItem('khai-chats', JSON.stringify(chatsObj));
    }
    
    // Сохранение сообщения в историю
    saveMessageToHistory(type, content, attachments = []) {
        if (!this.chats.has(this.currentChat)) return;
        
        const chat = this.chats.get(this.currentChat);
        chat.messages.push({
            type,
            content,
            attachments: attachments.map(f => ({ name: f.name, type: f.type })),
            timestamp: new Date().toISOString(),
            model: type === 'ai' ? this.currentModel : undefined
        });
        
        this.saveChats();
    }
    
    // Загрузка сообщений текущего чата
    loadCurrentChatMessages() {
        this.elements.messagesContainer.innerHTML = '';
        
        if (!this.chats.has(this.currentChat)) return;
        
        const chat = this.chats.get(this.currentChat);
        chat.messages.forEach(msg => {
            this.addMessage(msg.type, msg.content, []);
        });
    }
    
    // Обновление списка чатов в меню
    updateChatList() {
        this.elements.chatList.innerHTML = '';
        
        this.chats.forEach((chat, id) => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${id === this.currentChat ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-info">
                    <i class="ti ti-message-circle"></i>
                    <span>${chat.name}</span>
                </div>
                ${this.chats.size > 1 ? '<button class="delete-chat-btn" onclick="app.deleteChat(\'' + id + '\')"><i class="ti ti-trash"></i></button>' : ''}
            `;
            
            chatItem.addEventListener('click', () => this.switchToChat(id));
            this.elements.chatList.appendChild(chatItem);
        });
    }
    
    // Удаление чата
    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChat === chatId) {
                const remainingChats = Array.from(this.chats.keys());
                this.switchToChat(remainingChats[0]);
            }
            
            this.updateChatList();
            this.saveChats();
            this.showNotification('Чат удален', 'success');
        }
    }
    
    // Получение отображаемого имени модели
    getModelDisplayName(modelKey) {
        const modelNames = {
            'gpt-5-nano': 'GPT-5 Nano',
            'o3-mini': 'O3 Mini',
            'deepseek-chat': 'DeepSeek Chat',
            'deepseek-reasoner': 'DeepSeek Reasoner',
            'gemini-2.0-flash': 'Gemini 2.0 Flash'
        };
        
        return modelNames[modelKey] || modelKey;
    }
    
    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // Получение иконки для уведомления
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'circle-check',
            'warning': 'alert-triangle',
            'error': 'alert-circle'
        };
        
        return icons[type] || 'info-circle';
    }
    
    // Обработка изменения размера окна
    handleResize() {
        // Закрытие меню при изменении ориентации на мобильных
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
    }
    
    // Обработка онлайн/офлайн статуса
    handleOnlineStatus() {
        this.isOnline = navigator.onLine;
        
        if (this.isOnline) {
            this.elements.connectionStatus.innerHTML = '<i class="ti ti-circle-check"></i>';
            this.elements.connectionStatus.title = 'Онлайн';
        } else {
            this.elements.connectionStatus.innerHTML = '<i class="ti ti-circle-off"></i>';
            this.elements.connectionStatus.title = 'Офлайн';
            this.elements.connectionStatus.classList.add('offline');
            this.showNotification('Отсутствует подключение к интернету', 'warning');
        }
    }
    
    // Обработка перед закрытием страницы
    handleBeforeUnload(event) {
        const hasUnsavedWork = this.elements.userInput.value.trim().length > 0 || this.attachedFiles.length > 0;
        
        if (hasUnsavedWork) {
            event.preventDefault();
            event.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?';
            return event.returnValue;
        }
    }
    
    // Настройка PWA
    setupPWA() {
        // Проверка поддержки Service Worker
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
        
        // Предотвращение масштабирования на iOS
        document.addEventListener('touchmove', function (event) {
            if (event.scale !== 1) { event.preventDefault(); }
        }, { passive: false });
    }
    
    // Экранирование HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIApp();
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Регистрация PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
