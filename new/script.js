// Khuyew AI - Simplified Working Version
class KhuyewAI {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Khuyew AI...');
            
            // Initialize core components first
            await this.initializeCore();
            await this.setupEventListeners();
            await this.loadSavedData();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Khuyew AI initialized successfully');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showError('Ошибка загрузки приложения', error);
        }
    }

    async initializeCore() {
        // Basic configuration
        this.config = {
            maxFileSize: 5 * 1024 * 1024,
            maxMessageLength: 4000,
            models: {
                'gpt-5-nano': '🚀 GPT-5 Nano',
                'o3-mini': '🧠 O3 Mini', 
                'deepseek-chat': '🔍 DeepSeek Chat',
                'deepseek-reasoner': '💭 DeepSeek Reasoner',
                'gemini-2.0-flash': '⚡ Gemini 2.0 Flash',
                'gemini-1.5-flash': '🎯 Gemini 1.5 Flash',
                'grok-beta': '🤖 xAI Grok'
            }
        };

        // State management
        this.state = {
            currentModel: 'gpt-5-nano',
            currentChatId: 'default',
            isProcessing: false,
            theme: 'dark',
            chats: new Map(),
            attachedFiles: []
        };

        // Cache DOM elements
        this.elements = this.cacheElements();
        
        // Verify critical elements exist
        this.validateCriticalElements();
    }

    cacheElements() {
        const elements = {
            // Core containers
            loadingScreen: document.getElementById('loadingScreen'),
            appContainer: document.querySelector('.app-container'),
            messagesContainer: document.getElementById('messagesContainer'),
            
            // Input elements
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            fileInput: document.getElementById('fileInput'),
            attachedFiles: document.getElementById('attachedFiles'),
            
            // Control elements
            modelSelect: document.getElementById('modelSelect'),
            themeToggle: document.getElementById('themeToggle'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            clearInputBtn: document.getElementById('clearInputBtn'),
            menuToggle: document.getElementById('menuToggle'),
            sidebarMenu: document.getElementById('sidebarMenu'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarClose: document.getElementById('sidebarClose'),
            
            // Chat management
            chatList: document.getElementById('chatList'),
            newChatBtn: document.getElementById('newChatBtn'),
            currentChatName: document.getElementById('currentChatName')
        };

        return elements;
    }

    validateCriticalElements() {
        const critical = [
            'loadingScreen', 'appContainer', 'messagesContainer',
            'userInput', 'sendBtn', 'modelSelect'
        ];

        critical.forEach(key => {
            if (!this.elements[key]) {
                throw new Error(`Critical element missing: ${key}`);
            }
        });
    }

    async setupEventListeners() {
        // Message sending
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File handling
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('attachFileBtn')?.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        // Chat management
        this.elements.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.elements.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());

        // UI controls
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.elements.sidebarClose.addEventListener('click', () => this.toggleSidebar());
        this.elements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar());

        // Model selection
        this.elements.modelSelect.addEventListener('change', (e) => {
            this.state.currentModel = e.target.value;
            this.showNotification(`Модель изменена на: ${this.config.models[e.target.value]}`, 'success');
        });

        // Help button
        document.getElementById('helpBtn')?.addEventListener('click', () => this.showHelp());

        // Window events
        window.addEventListener('beforeunload', () => this.saveData());
    }

    async loadSavedData() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem('khuyew-theme');
            if (savedTheme) {
                this.state.theme = savedTheme;
                document.documentElement.setAttribute('data-theme', savedTheme);
                this.updateThemeIcon();
            }

            // Load model preference
            const savedModel = localStorage.getItem('khuyew-model');
            if (savedModel && this.config.models[savedModel]) {
                this.state.currentModel = savedModel;
                this.elements.modelSelect.value = savedModel;
            }

            // Initialize default chat
            this.initializeDefaultChat();
            
            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.warn('Error loading saved data:', error);
            this.initializeDefaultChat();
        }
    }

    initializeDefaultChat() {
        const defaultChat = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.state.chats.set('default', defaultChat);
        this.state.currentChatId = 'default';
        this.elements.currentChatName.textContent = 'Основной чат';
    }

    hideLoadingScreen() {
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    this.elements.loadingScreen.style.display = 'none';
                    this.elements.appContainer.style.display = 'flex';
                }, 500);
            }
        }, 1000);
    }

    async sendMessage() {
        if (this.state.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        const message = this.elements.userInput.value.trim();
        
        if (!message && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'error');
            return;
        }

        this.state.isProcessing = true;
        this.updateSendButton();

        try {
            // Add user message
            this.addMessage('user', message);
            
            // Clear input
            this.clearInput();

            // Simulate AI response (replace with actual AI call)
            await this.simulateAIResponse(message);

        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Ошибка при отправке сообщения', 'error');
        } finally {
            this.state.isProcessing = false;
            this.updateSendButton();
        }
    }

    async simulateAIResponse(userMessage) {
        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Remove typing indicator
        this.hideTypingIndicator();

        // Generate response based on user message
        const responses = [
            `Привет! Вы написали: "${userMessage}". Как я могу помочь вам с этим вопросом?`,
            `Я проанализировал ваш запрос: "${userMessage}". Могу предложить несколько решений...`,
            `Интересный вопрос! "${userMessage}" - давайте разберем его подробнее.`,
            `По вашему запросу "${userMessage}" я нашел следующую информацию...`,
            `Отличный вопрос! "${userMessage}" - это важная тема, давайте обсудим ее.`
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage('ai', response);
    }

    addMessage(role, content, files = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Process markdown if it's AI response
        if (role === 'ai') {
            messageContent.innerHTML = this.renderMarkdown(content);
            this.highlightCode(messageContent);
        } else {
            messageContent.textContent = content;
        }

        // Add files if any
        if (files.length > 0) {
            files.forEach(file => {
                const fileElement = this.createFileElement(file);
                messageContent.appendChild(fileElement);
            });
        }

        // Add model info for AI messages
        if (role === 'ai') {
            const modelInfo = document.createElement('div');
            modelInfo.className = 'model-indicator';
            modelInfo.textContent = `Модель: ${this.config.models[this.state.currentModel]}`;
            messageContent.appendChild(modelInfo);
        }

        messageElement.appendChild(messageContent);
        this.elements.messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
        this.saveData();
    }

    renderMarkdown(text) {
        // Simple markdown parser for demonstration
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    highlightCode(container) {
        const codeBlocks = container.querySelectorAll('code');
        codeBlocks.forEach(block => {
            if (block.textContent && block.textContent.includes('function')) {
                block.style.background = 'var(--code-bg)';
                block.style.padding = '2px 4px';
                block.style.borderRadius = '3px';
            }
        });
    }

    createFileElement(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'message-file';
        fileElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                <i class="ti ti-file" style="color: var(--accent-primary);"></i>
                <span>${file.name}</span>
                <small style="color: var(--text-tertiary);">(${this.formatFileSize(file.size)})</small>
            </div>
        `;
        return fileElement;
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
        `;
        typingElement.id = 'typing-indicator';
        this.elements.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.state.attachedFiles.push(file);
                this.renderAttachedFile(file);
            }
        });

        // Reset input
        event.target.value = '';
    }

    validateFile(file) {
        if (file.size > this.config.maxFileSize) {
            this.showNotification(`Файл слишком большой: ${file.name}`, 'error');
            return false;
        }

        if (!file.type.startsWith('image/') && !file.type.startsWith('text/') && file.type !== 'application/pdf') {
            this.showNotification(`Неподдерживаемый тип файла: ${file.name}`, 'error');
            return false;
        }

        return true;
    }

    renderAttachedFile(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="ti ti-file"></i>
            <span>${file.name} (${this.formatFileSize(file.size)})</span>
            <button class="remove-file" data-filename="${file.name}">
                <i class="ti ti-x"></i>
            </button>
        `;

        const removeBtn = fileElement.querySelector('.remove-file');
        removeBtn.addEventListener('click', () => {
            this.state.attachedFiles = this.state.attachedFiles.filter(f => f.name !== file.name);
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

    clearInput() {
        this.elements.userInput.value = '';
        this.state.attachedFiles = [];
        this.elements.attachedFiles.innerHTML = '';
        this.elements.userInput.style.height = 'auto';
    }

    clearChat() {
        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.elements.messagesContainer.innerHTML = '';
            const currentChat = this.state.chats.get(this.state.currentChatId);
            if (currentChat) {
                currentChat.messages = [];
                currentChat.updatedAt = Date.now();
            }
            this.showWelcomeMessage();
            this.saveData();
            this.showNotification('Чат очищен', 'success');
        }
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Чат ${this.state.chats.size}`;
        
        const newChat = {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.state.chats.set(chatId, newChat);
        this.state.currentChatId = chatId;
        this.elements.currentChatName.textContent = chatName;
        this.elements.messagesContainer.innerHTML = '';
        
        this.showWelcomeMessage();
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
        this.toggleSidebar();
    }

    showWelcomeMessage() {
        const welcomeMessage = `# 👋 Добро пожаловать в Khuyew AI!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI.

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото  
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь
• **Контекстный диалог** - помню историю нашего разговора
• **Подсветка синтаксиса** - красивое отображение кода

**Текущая модель: ${this.config.models[this.state.currentModel]}**

**Начните общение, отправив сообщение или изображение!**`;

        this.addMessage('ai', welcomeMessage);
    }

    showHelp() {
        const helpMessage = `# 🆘 Помощь по Khuyew AI

## 💬 Как использовать:
1. **Напишите вопрос** в поле ввода ниже
2. **Нажмите Enter** или кнопку отправки
3. **Получите ответ** от ИИ-помощника

## 🛠️ Функции:
• **Смена модели** - выберите другую модель в выпадающем списке
• **Очистка чата** - удалите всю историю разговора
• **Новый чат** - создайте отдельную беседу для новой темы
• **Прикрепление файлов** - загружайте изображения и документы

## ⌨️ Горячие клавиши:
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **Ctrl + Delete** - очистить поле ввода`;

        this.addMessage('ai', helpMessage);
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('khuyew-theme', this.state.theme);
        this.updateThemeIcon();
        this.showNotification(`Тема изменена на ${this.state.theme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
    }

    updateThemeIcon() {
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = this.state.theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    toggleSidebar() {
        this.elements.sidebarMenu.classList.toggle('active');
        this.elements.sidebarOverlay.classList.toggle('active');
    }

    updateSendButton() {
        this.elements.sendBtn.disabled = this.state.isProcessing;
        const icon = this.elements.sendBtn.querySelector('i');
        if (icon) {
            icon.className = this.state.isProcessing ? 'ti ti-loader' : 'ti ti-send';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                }
                .notification.info { border-left: 4px solid var(--accent-primary); }
                .notification.success { border-left: 4px solid var(--accent-success); }
                .notification.warning { border-left: 4px solid var(--accent-warning); }
                .notification.error { border-left: 4px solid var(--accent-error); }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
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

    saveData() {
        try {
            localStorage.setItem('khuyew-theme', this.state.theme);
            localStorage.setItem('khuyew-model', this.state.currentModel);
            
            // Save chats
            const chatsData = Array.from(this.state.chats.entries());
            localStorage.setItem('khuyew-chats', JSON.stringify(chatsData));
        } catch (error) {
            console.warn('Error saving data:', error);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 DOM loaded, initializing Khuyew AI...');
    window.khuyewAI = new KhuyewAI();
});

// Add basic error handling for the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}
