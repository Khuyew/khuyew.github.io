/**
 * KHAI — Первый белорусский ИИ чат
 * Основной файл приложения
 * Версия 2.4.0
 */

class KHAIApp {
    constructor() {
        this.isInitialized = false;
        this.currentChatId = null;
        this.isGenerating = false;
        this.attachedFiles = new Map();
        this.voiceRecognition = null;
        this.isRecording = false;
        this.currentTheme = 'dark';
        this.analytics = new AnalyticsModule();
        this.security = new SecurityModule();
        this.chatManager = new ChatManager();
        this.aiService = new AIService();
        this.voiceService = new VoiceService();
        this.imageService = new ImageService();
        
        this.init();
    }

    async init() {
        try {
            // Инициализация модулей
            await this.security.init();
            await this.analytics.init();
            
            // Загрузка сохраненных данных
            await this.loadSettings();
            await this.loadChatHistory();
            
            // Инициализация UI
            this.initUI();
            this.initEventListeners();
            this.initServiceWorker();
            
            // Показ welcome screen
            this.showWelcomeScreen();
            
            this.isInitialized = true;
            this.analytics.track('app_initialized');
            
            console.log('🚀 KHAI App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KHAI App:', error);
            this.showNotification('Ошибка инициализации приложения', 'error');
        }
    }

    initUI() {
        // Инициализация темы
        this.applyTheme(this.currentTheme);
        
        // Инициализация компонентов
        this.initMarkdownRenderer();
        this.initCodeHighlighting();
        this.initSidebar();
        this.initFileUpload();
        
        // Показ информации о текущем чате
        this.updateChatInfo();
    }

    initEventListeners() {
        // Ввод сообщения
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        
        userInput.addEventListener('input', this.handleInputChange.bind(this));
        userInput.addEventListener('keydown', this.handleInputKeydown.bind(this));
        sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        
        // Голосовой ввод
        const voiceButton = document.getElementById('voiceButton');
        voiceButton.addEventListener('click', this.toggleVoiceRecognition.bind(this));
        
        // Прикрепление файлов
        const attachButton = document.getElementById('attachButton');
        attachButton.addEventListener('click', this.openFilePicker.bind(this));
        
        // Управление чатом
        const newChatBtn = document.getElementById('newChatBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const exportChatBtn = document.getElementById('exportChatBtn');
        
        newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        exportChatBtn.addEventListener('click', this.exportCurrentChat.bind(this));
        
        // Настройки
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', this.openSettings.bind(this));
        
        // Перетаскивание файлов
        this.initDragAndDrop();
        
        // Обработка изменения темы
        this.initThemeToggle();
        
        // Обработка изменения модели
        this.initModelSelector();
    }

    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registered:', registration);
                
                // Проверка обновлений
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('Доступно новое обновление!', 'info');
                        }
                    });
                });
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    // Основные методы работы с чатом
    async handleSendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        
        if (!message && this.attachedFiles.size === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (this.isGenerating) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        try {
            this.isGenerating = true;
            this.updateUIForGeneration(true);
            
            // Создание сообщения пользователя
            const userMessage = await this.createUserMessage(message);
            
            // Отправка запроса к ИИ
            const aiResponse = await this.aiService.sendMessage({
                message: message,
                chatHistory: this.chatManager.getCurrentChatHistory(),
                files: Array.from(this.attachedFiles.values()),
                model: this.getSelectedModel()
            });
            
            // Создание сообщения ИИ
            await this.createAIMessage(aiResponse);
            
            // Очистка ввода и прикрепленных файлов
            this.clearInput();
            this.attachedFiles.clear();
            this.updateAttachmentsList();
            
            // Аналитика
            this.analytics.track('message_sent', {
                has_attachments: this.attachedFiles.size > 0,
                model: this.getSelectedModel(),
                message_length: message.length
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Ошибка при отправке сообщения', 'error');
            await this.createErrorMessage(error.message || 'Произошла неизвестная ошибка');
        } finally {
            this.isGenerating = false;
            this.updateUIForGeneration(false);
        }
    }

    async createUserMessage(content) {
        const messageId = this.security.generateId();
        const timestamp = Date.now();
        
        const messageData = {
            id: messageId,
            type: 'user',
            content: content,
            timestamp: timestamp,
            files: Array.from(this.attachedFiles.values())
        };
        
        // Добавление в историю чата
        this.chatManager.addMessage(messageData);
        
        // Создание DOM элемента
        const messageElement = this.createMessageElement(messageData);
        this.addMessageToChat(messageElement);
        
        return messageData;
    }

    async createAIMessage(response) {
        const messageId = this.security.generateId();
        const timestamp = Date.now();
        
        const messageData = {
            id: messageId,
            type: 'ai',
            content: response.content,
            timestamp: timestamp,
            model: response.model,
            usage: response.usage
        };
        
        // Добавление в историю чата
        this.chatManager.addMessage(messageData);
        
        // Создание DOM элемента с потоковым выводом
        const messageElement = await this.createStreamingMessageElement(messageData);
        this.addMessageToChat(messageElement);
        
        return messageData;
    }

    async createErrorMessage(error) {
        const messageId = this.security.generateId();
        const timestamp = Date.now();
        
        const messageData = {
            id: messageId,
            type: 'error',
            content: error,
            timestamp: timestamp
        };
        
        const messageElement = this.createMessageElement(messageData);
        this.addMessageToChat(messageElement);
        
        return messageData;
    }

    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${messageData.type}`;
        messageDiv.dataset.messageId = messageData.id;
        
        let content = '';
        
        switch (messageData.type) {
            case 'user':
                content = this.formatUserMessage(messageData);
                break;
            case 'ai':
                content = this.formatAIMessage(messageData);
                break;
            case 'error':
                content = this.formatErrorMessage(messageData);
                break;
            case 'system':
                content = this.formatSystemMessage(messageData);
                break;
        }
        
        messageDiv.innerHTML = content;
        
        // Инициализация действий для сообщения
        this.initMessageActions(messageDiv, messageData);
        
        return messageDiv;
    }

    async createStreamingMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-ai`;
        messageDiv.dataset.messageId = messageData.id;
        
        // Начальный контент с индикатором загрузки
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Потоковый вывод контента
        await this.streamContent(messageDiv, messageData.content);
        
        // Обновление содержимого после завершения потоковой передачи
        messageDiv.innerHTML = this.formatAIMessage(messageData);
        this.initMessageActions(messageDiv, messageData);
        
        return messageDiv;
    }

    async streamContent(messageElement, content) {
        const words = content.split(' ');
        let currentContent = '';
        
        for (let i = 0; i < words.length; i++) {
            currentContent += words[i] + ' ';
            messageElement.querySelector('.message-content').innerHTML = 
                this.security.sanitizeHTML(marked.parse(currentContent));
            
            // Подсветка кода после каждого обновления
            this.highlightCode(messageElement);
            
            // Прокрутка к последнему сообщению
            this.scrollToBottom();
            
            // Задержка для эффекта печати
            await new Promise(resolve => setTimeout(resolve, 30));
        }
    }

    formatUserMessage(messageData) {
        let content = `
            <div class="message-content">
                ${this.security.sanitizeHTML(messageData.content)}
            </div>
        `;
        
        if (messageData.files && messageData.files.length > 0) {
            content += this.formatAttachments(messageData.files);
        }
        
        return content;
    }

    formatAIMessage(messageData) {
        let content = `
            <div class="message-content">
                ${this.security.sanitizeHTML(marked.parse(messageData.content))}
            </div>
            <div class="message-actions">
                <button class="action-btn-small copy-message" title="Копировать">
                    <i class="ti ti-copy"></i>
                    <span>Копировать</span>
                </button>
                <button class="action-btn-small regenerate-message" title="Перегенерировать">
                    <i class="ti ti-refresh"></i>
                    <span>Перегенерировать</span>
                </button>
                <button class="action-btn-small feedback-message" title="Оценить">
                    <i class="ti ti-thumb-up"></i>
                    <span>Оценить</span>
                </button>
            </div>
        `;
        
        if (messageData.usage) {
            content += `
                <div class="message-usage">
                    <small>Токены: ${messageData.usage.tokens || 'N/A'}</small>
                </div>
            `;
        }
        
        return content;
    }

    formatErrorMessage(messageData) {
        return `
            <div class="message-content">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="ti ti-alert-circle" style="color: var(--error-text);"></i>
                    <strong>Ошибка:</strong> ${this.security.sanitizeHTML(messageData.content)}
                </div>
            </div>
            <div class="message-actions">
                <button class="action-btn-small retry-message" title="Повторить">
                    <i class="ti ti-refresh"></i>
                    <span>Повторить</span>
                </button>
            </div>
        `;
    }

    formatAttachments(files) {
        let attachmentsHTML = '<div class="message-attachments">';
        
        files.forEach(file => {
            attachmentsHTML += `
                <div class="attachment-preview">
                    <i class="ti ti-file-text"></i>
                    <span>${this.security.sanitizeHTML(file.name)}</span>
                    <small>(${this.formatFileSize(file.size)})</small>
                </div>
            `;
        });
        
        attachmentsHTML += '</div>';
        return attachmentsHTML;
    }

    // Управление чатами
    async createNewChat() {
        if (this.chatManager.hasUnsavedChanges()) {
            const confirmed = await this.showConfirmationDialog(
                'Несохраненные изменения',
                'У вас есть несохраненные изменения. Вы уверены, что хотите начать новый чат?',
                'warning'
            );
            
            if (!confirmed) return;
        }
        
        this.chatManager.createNewChat();
        this.clearChatInterface();
        this.showWelcomeScreen();
        this.updateChatInfo();
        
        this.analytics.track('new_chat_created');
    }

    async clearCurrentChat() {
        if (this.chatManager.getCurrentChatHistory().length === 0) {
            return;
        }
        
        const confirmed = await this.showConfirmationDialog(
            'Очистить чат',
            'Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.',
            'warning'
        );
        
        if (confirmed) {
            this.chatManager.clearCurrentChat();
            this.clearChatInterface();
            this.showWelcomeScreen();
            
            this.analytics.track('chat_cleared');
        }
    }

    async exportCurrentChat() {
        try {
            const chatData = this.chatManager.exportCurrentChat();
            const blob = new Blob([JSON.stringify(chatData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khai-chat-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат успешно экспортирован', 'success');
            this.analytics.track('chat_exported');
        } catch (error) {
            console.error('Error exporting chat:', error);
            this.showNotification('Ошибка при экспорте чата', 'error');
        }
    }

    // Работа с файлами
    async handleFileSelect(files) {
        for (let file of files) {
            if (this.attachedFiles.size >= 5) {
                this.showNotification('Максимум 5 файлов можно прикрепить', 'warning');
                break;
            }
            
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                this.showNotification(`Файл ${file.name} слишком большой (макс. 50MB)`, 'error');
                continue;
            }
            
            try {
                const processedFile = await this.imageService.processFile(file);
                const fileId = this.security.generateId();
                
                this.attachedFiles.set(fileId, {
                    id: fileId,
                    file: processedFile,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    preview: await this.generateFilePreview(processedFile)
                });
                
                this.analytics.track('file_attached', {
                    file_type: file.type,
                    file_size: file.size
                });
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification(`Ошибка обработки файла ${file.name}`, 'error');
            }
        }
        
        this.updateAttachmentsList();
    }

    async generateFilePreview(file) {
        if (file.type.startsWith('image/')) {
            return await this.imageService.createImagePreview(file);
        }
        
        // Для других типов файлов возвращаем иконку
        return this.getFileIcon(file.type);
    }

    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': 'ti-file-text',
            'text/plain': 'ti-file-text',
            'application/msword': 'ti-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'ti-file-word',
            'application/vnd.ms-excel': 'ti-file-spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'ti-file-spreadsheet',
            'application/zip': 'ti-file-zip',
            'audio/': 'ti-file-music',
            'video/': 'ti-file-video'
        };
        
        for (const [type, icon] of Object.entries(iconMap)) {
            if (fileType.startsWith(type.replace('*', ''))) {
                return `<i class="ti ${icon}"></i>`;
            }
        }
        
        return '<i class="ti ti-file"></i>';
    }

    // Голосовой ввод
    async toggleVoiceRecognition() {
        if (this.isRecording) {
            await this.stopVoiceRecognition();
        } else {
            await this.startVoiceRecognition();
        }
    }

    async startVoiceRecognition() {
        try {
            const transcript = await this.voiceService.startRecognition();
            
            if (transcript) {
                document.getElementById('userInput').value = transcript;
                this.handleInputChange();
            }
            
            this.isRecording = false;
            this.updateVoiceButton();
            
        } catch (error) {
            console.error('Voice recognition error:', error);
            this.showNotification('Ошибка голосового ввода', 'error');
            this.isRecording = false;
            this.updateVoiceButton();
        }
    }

    async stopVoiceRecognition() {
        await this.voiceService.stopRecognition();
        this.isRecording = false;
        this.updateVoiceButton();
    }

    // Вспомогательные методы
    updateUIForGeneration(generating) {
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');
        
        if (generating) {
            sendButton.innerHTML = '<i class="ti ti-loader"></i>';
            sendButton.disabled = true;
            userInput.disabled = true;
        } else {
            sendButton.innerHTML = '<i class="ti ti-send"></i>';
            sendButton.disabled = false;
            userInput.disabled = false;
        }
    }

    clearInput() {
        const userInput = document.getElementById('userInput');
        userInput.value = '';
        userInput.style.height = 'auto';
        this.handleInputChange();
    }

    scrollToBottom() {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addMessageToChat(messageElement) {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Скрытие welcome screen при первом сообщении
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
    }

    clearChatInterface() {
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.innerHTML = '';
        this.attachedFiles.clear();
        this.updateAttachmentsList();
    }

    showWelcomeScreen() {
        const messagesContainer = document.querySelector('.messages-container');
        
        if (this.chatManager.getCurrentChatHistory().length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-screen">
                    <div class="welcome-logo">KHAI</div>
                    <div class="welcome-subtitle">
                        Первый белорусский искусственный интеллект
                        <span class="beta-badge">BETA</span>
                    </div>
                    
                    <div class="welcome-features">
                        <div class="feature-card" onclick="app.showExamplePrompt('programming')">
                            <div class="feature-icon">💻</div>
                            <div class="feature-title">Программирование</div>
                            <div class="feature-description">Помощь в написании и отладке кода</div>
                        </div>
                        
                        <div class="feature-card" onclick="app.showExamplePrompt('writing')">
                            <div class="feature-icon">✍️</div>
                            <div class="feature-title">Творчество</div>
                            <div class="feature-description">Написание текстов и идей</div>
                        </div>
                        
                        <div class="feature-card" onclick="app.showExamplePrompt('analysis')">
                            <div class="feature-icon">📊</div>
                            <div class="feature-title">Анализ</div>
                            <div class="feature-description">Обработка данных и аналитика</div>
                        </div>
                        
                        <div class="feature-card" onclick="app.showExamplePrompt('learning')">
                            <div class="feature-icon">🎓</div>
                            <div class="feature-title">Обучение</div>
                            <div class="feature-description">Ответы на вопросы и объяснения</div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="action-btn" onclick="app.showQuickStartGuide()">
                            <i class="ti ti-help"></i>
                            <span>Быстрый старт</span>
                        </button>
                        <button class="action-btn" onclick="app.openSettings()">
                            <i class="ti ti-settings"></i>
                            <span>Настройки</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async showExamplePrompt(type) {
        const examples = {
            programming: "Напиши функцию на Python для сортировки массива методом пузырька с оптимизацией",
            writing: "Помоги написать креативное описание для нового IT-стартапа",
            analysis: "Проанализируй эти данные и предложи ключевые insights",
            learning: "Объясни концепцию машинного обучения как будто я новичок"
        };
        
        document.getElementById('userInput').value = examples[type];
        this.handleInputChange();
        this.showNotification('Пример промпта добавлен в поле ввода', 'info');
    }

    // Уведомления
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        const timeout = setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        // Закрытие по клику
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            this.hideNotification(notification);
        });
        
        return notification;
    }

    hideNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'circle-check',
            error: 'alert-circle',
            warning: 'alert-triangle'
        };
        return icons[type] || 'info-circle';
    }

    // Диалоги подтверждения
    async showConfirmationDialog(title, message, type = 'warning') {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'modal-overlay active';
            dialog.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">
                            <i class="ti ti-x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="confirmation-dialog">
                            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                            <p>${message}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="confirmCancel">Отмена</button>
                        <button class="btn btn-primary" id="confirmOk">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            const closeDialog = (result) => {
                document.body.removeChild(dialog);
                resolve(result);
            };
            
            dialog.querySelector('#confirmCancel').addEventListener('click', () => closeDialog(false));
            dialog.querySelector('#confirmOk').addEventListener('click', () => closeDialog(true));
            dialog.querySelector('.modal-close').addEventListener('click', () => closeDialog(false));
            
            // Закрытие по клику вне модального окна
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialog(false);
                }
            });
        });
    }

    // Загрузка и сохранение настроек
    async loadSettings() {
        try {
            const settings = await this.security.getSecureStorage('app_settings');
            if (settings) {
                this.currentTheme = settings.theme || 'dark';
                this.applyTheme(this.currentTheme);
                
                // Применение других настроек
                if (settings.autoSave !== undefined) {
                    this.chatManager.autoSave = settings.autoSave;
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            const settings = {
                theme: this.currentTheme,
                autoSave: this.chatManager.autoSave,
                model: this.getSelectedModel(),
                lastUpdated: Date.now()
            };
            
            await this.security.setSecureStorage('app_settings', settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async loadChatHistory() {
        try {
            await this.chatManager.loadChats();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Получение выбранной модели
    getSelectedModel() {
        const modelSelect = document.getElementById('modelSelect');
        return modelSelect ? modelSelect.value : 'gpt-4';
    }

    // Форматирование размера файла
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Инициализация приложения после загрузки DOM
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new KHAIApp();
    
    // Глобальные обработчики ошибок
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        app.analytics.track('global_error', {
            message: event.error?.message,
            stack: event.error?.stack
        });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        app.analytics.track('unhandled_rejection', {
            reason: event.reason?.message
        });
    });
    
    // Регистрация приложения в глобальной области видимости для отладки
    window.KHAIApp = app;
});

// Обработка события beforeunload для сохранения данных
window.addEventListener('beforeunload', (event) => {
    if (app && app.chatManager.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';
        return event.returnValue;
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIApp;
}
