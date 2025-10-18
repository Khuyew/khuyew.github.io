// Основной JavaScript файл для KHAI Assistant

class KHAIAssistant {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-4';
        this.isGenerating = false;
        this.attachedFiles = [];
        this.currentMode = 'normal';
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.scrollTimer = null;
        this.interfaceHidden = false;
        this.readingMode = false;
        this.textSelectionActive = false;
        this.scrollHideTimer = null;
        this.interfaceReturnTimer = null;

        this.initializeApp();
    }

    initializeApp() {
        this.initializeEventListeners();
        this.loadChats();
        this.loadSettings();
        this.setupPWA();
        this.updateUI();
        this.showNotification('Добро пожаловать в KHAI Assistant!', 'info');
    }

    // PWA Setup
    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Handle PWA installation
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showNotification('Вы можете установить KHAI Assistant как приложение!', 'info');
        });

        window.addEventListener('appinstalled', () => {
            this.showNotification('KHAI Assistant успешно установлен!', 'success');
            deferredPrompt = null;
        });
    }

    // Event Listeners
    initializeEventListeners() {
        // Основные элементы управления
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keydown', (e) => this.handleInputKeydown(e));
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.toggleSidebar());

        // Управление файлами
        document.getElementById('attachFileBtn').addEventListener('click', () => this.triggerFileInput());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));

        // Управление чатами
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('deleteAllChatsBtn').addEventListener('click', () => this.deleteAllChats());

        // Поиск
        document.getElementById('headerSearch').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('headerSearchClear').addEventListener('click', () => this.clearSearch());

        // Навигация
        document.getElementById('scrollToBottom').addEventListener('click', () => this.scrollToBottom());
        document.getElementById('scrollToLastAI').addEventListener('click', () => this.scrollToLastAIMessage());

        // Мини-карта
        document.getElementById('chatMinimap').addEventListener('click', (e) => this.handleMinimapClick(e));

        // Режимы
        document.getElementById('normalModeBtn').addEventListener('click', () => this.setMode('normal'));
        document.getElementById('generateVoiceBtn').addEventListener('click', () => this.setMode('voice'));
        document.getElementById('generateImageBtn').addEventListener('click', () => this.setMode('image'));

        // Модальные окна
        document.getElementById('modelSelectBtn').addEventListener('click', () => this.showModelModal());
        document.getElementById('modelModalClose').addEventListener('click', () => this.hideModelModal());
        document.getElementById('modelModalCancel').addEventListener('click', () => this.hideModelModal());
        document.getElementById('modelModalConfirm').addEventListener('click', () => this.confirmModelSelection());

        // Тема
        document.getElementById('themeMinimapToggle').addEventListener('click', () => this.toggleTheme());

        // Управление вводом
        document.getElementById('clearInputBtn').addEventListener('click', () => this.clearInput());
        document.getElementById('userInput').addEventListener('input', () => this.handleInputChange());

        // Скролл для скрытия интерфейса
        document.getElementById('messagesContainer').addEventListener('scroll', () => this.handleScroll());
        document.addEventListener('selectionchange', () => this.handleTextSelection());

        // Инициализация мини-карты
        this.setupMinimap();

        // Авто-сохранение
        setInterval(() => this.saveChats(), 30000);
    }

    // Управление чатами
    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const chatName = 'Новый чат ' + (this.chats.size + 1);
        
        this.chats.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString(),
            model: this.currentModel
        });

        this.switchToChat(chatId);
        this.toggleSidebar();
        this.showNotification('Создан новый чат', 'success');
    }

    switchToChat(chatId) {
        this.currentChatId = chatId;
        this.updateUI();
        this.scrollToBottom();
    }

    deleteAllChats() {
        this.showConfirmModal(
            'Удалить все чаты?',
            'Все ваши чаты и история сообщений будут безвозвратно удалены. Это действие нельзя отменить.',
            () => {
                this.chats.clear();
                this.createNewChat();
                this.showNotification('Все чаты удалены', 'success');
            }
        );
    }

    // Сообщения
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message && this.attachedFiles.length === 0) return;

        // Добавляем сообщение пользователя
        this.addMessage('user', message, this.attachedFiles);

        // Очищаем ввод и файлы
        input.value = '';
        this.clearAttachedFiles();
        this.updateInputControls();

        // Показываем индикатор набора
        this.showTypingIndicator();

        try {
            let response;
            switch (this.currentMode) {
                case 'voice':
                    response = await this.generateVoiceResponse(message);
                    break;
                case 'image':
                    response = await this.generateImageResponse(message);
                    break;
                default:
                    response = await this.generateTextResponse(message);
            }

            this.hideTypingIndicator();
            this.addMessage('ai', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', `Ошибка: ${error.message}`);
            console.error('Error generating response:', error);
        }

        this.saveChats();
        this.updateMinimap();
    }

    addMessage(role, content, files = []) {
        const message = {
            id: 'msg_' + Date.now() + Math.random(),
            role,
            content,
            files: [...files],
            timestamp: new Date().toISOString()
        };

        const chat = this.chats.get(this.currentChatId);
        chat.messages.push(message);
        
        this.renderMessage(message);
        this.scrollToBottom();
        this.updateFooterStatus();
    }

    renderMessage(message) {
        const container = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        container.appendChild(messageElement);
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message message-${message.role}`;
        div.id = message.id;

        let content = message.content;
        if (message.role === 'ai') {
            content = marked.parse(content);
        }

        div.innerHTML = `
            <div class="message-content">${content}</div>
            ${message.files.length > 0 ? this.renderAttachedFiles(message.files) : ''}
            <div class="message-actions">
                <button class="message-action-btn copy" onclick="app.copyMessage('${message.id}')" title="Копировать">
                    <i class="ti ti-copy"></i>
                </button>
                <button class="message-action-btn delete" onclick="app.deleteMessage('${message.id}')" title="Удалить">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;

        // Подсветка кода для AI сообщений
        if (message.role === 'ai') {
            setTimeout(() => {
                div.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 0);
        }

        return div;
    }

    // Генерация ответов
    async generateTextResponse(prompt) {
        // Здесь должна быть интеграция с выбранной моделью ИИ
        // Временная заглушка для демонстрации
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = [
                    `Я обработал ваш запрос: "${prompt}". Как искусственный интеллект, я могу помочь вам с различными задачами, включая анализ текста, генерацию контента, ответы на вопросы и многое другое.`,
                    `Отличный вопрос! На основе моего обучения, я могу сказать, что "${prompt}" - это интересная тема для обсуждения. Что именно вас интересует?`,
                    `Спасибо за ваш запрос. Я проанализировал его и готов предоставить подробный ответ. Нужна ли вам дополнительная информация по этой теме?`
                ];
                resolve(responses[Math.floor(Math.random() * responses.length)]);
            }, 1000);
        });
    }

    async generateVoiceResponse(prompt) {
        // Заглушка для генерации голоса
        return `[Голосовой режим] Запрос: ${prompt}. В этом режиме можно генерировать голосовые ответы.`;
    }

    async generateImageResponse(prompt) {
        // Заглушка для генерации изображений
        return `[Режим изображений] Запрос: ${prompt}. В этом режиме можно генерировать изображения по описанию.`;
    }

    // Поиск
    handleSearch(e) {
        const query = e.target.value.trim();
        const clearBtn = document.getElementById('headerSearchClear');
        
        clearBtn.style.display = query ? 'flex' : 'none';

        if (query.length > 2) {
            this.performSearch(query);
        } else {
            this.clearSearchHighlights();
        }
    }

    performSearch(query) {
        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;

        this.searchResults = [];
        const messages = document.querySelectorAll('.message');
        
        messages.forEach((message, index) => {
            const content = message.querySelector('.message-content').textContent;
            if (content.toLowerCase().includes(query.toLowerCase())) {
                this.searchResults.push(message.id);
                this.highlightMessage(message, query);
            }
        });

        if (this.searchResults.length > 0) {
            this.currentSearchIndex = 0;
            this.scrollToSearchResult(this.currentSearchIndex);
        }
    }

    highlightMessage(messageElement, query) {
        const content = messageElement.querySelector('.message-content');
        const text = content.textContent;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        content.innerHTML = highlighted;
    }

    clearSearchHighlights() {
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            highlight.outerHTML = highlight.innerHTML;
        });
        this.searchResults = [];
        this.currentSearchIndex = -1;
    }

    clearSearch() {
        document.getElementById('headerSearch').value = '';
        document.getElementById('headerSearchClear').style.display = 'none';
        this.clearSearchHighlights();
    }

    // Мини-карта
    setupMinimap() {
        this.updateMinimap();
        
        // Обновляем мини-карту при изменении размера окна
        window.addEventListener('resize', () => this.updateMinimap());
    }

    updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        const messagesContainer = document.getElementById('messagesContainer');
        const messages = Array.from(messagesContainer.querySelectorAll('.message'));
        
        minimapContent.innerHTML = '';
        
        messages.forEach(message => {
            const div = document.createElement('div');
            div.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            div.style.height = '2px';
            minimapContent.appendChild(div);
        });

        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        const container = document.getElementById('messagesContainer');
        const viewport = document.getElementById('minimapViewport');
        const minimap = document.getElementById('chatMinimap');
        
        const containerHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        const viewportTop = (scrollTop / containerHeight) * minimap.clientHeight;
        const viewportHeightPx = (viewportHeight / containerHeight) * minimap.clientHeight;
        
        viewport.style.top = viewportTop + 'px';
        viewport.style.height = viewportHeightPx + 'px';
    }

    handleMinimapClick(e) {
        const minimap = document.getElementById('chatMinimap');
        const rect = minimap.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const percentage = clickY / rect.height;
        
        const container = document.getElementById('messagesContainer');
        const scrollPosition = percentage * container.scrollHeight;
        
        container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }

    // Навигация
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }

    scrollToLastAIMessage() {
        const messages = Array.from(document.querySelectorAll('.message-ai'));
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToSearchResult(index) {
        if (this.searchResults.length === 0) return;
        
        const messageId = this.searchResults[index];
        const message = document.getElementById(messageId);
        if (message) {
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            message.style.animation = 'pulse 2s';
            setTimeout(() => message.style.animation = '', 2000);
        }
    }

    // Управление интерфейсом
    handleScroll() {
        this.updateMinimapViewport();
        
        // Показываем/скрываем интерфейс при скролле
        if (!this.textSelectionActive) {
            this.handleInterfaceVisibility();
        }
    }

    handleInterfaceVisibility() {
        const container = document.getElementById('messagesContainer');
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Скрываем интерфейс при активном скролле
        clearTimeout(this.scrollHideTimer);
        this.scrollHideTimer = setTimeout(() => {
            if (!this.interfaceHidden && scrollHeight > clientHeight * 2) {
                this.hideInterface();
            }
        }, 500);

        // Возвращаем интерфейс через 2 секунды после остановки скролла
        clearTimeout(this.interfaceReturnTimer);
        this.interfaceReturnTimer = setTimeout(() => {
            if (this.interfaceHidden && !this.readingMode) {
                this.showInterface();
            }
        }, 2000);
    }

    handleTextSelection() {
        const selection = window.getSelection();
        this.textSelectionActive = selection.toString().length > 0;
        
        if (this.textSelectionActive) {
            this.showInterface();
        }
    }

    hideInterface() {
        if (this.interfaceHidden) return;
        
        document.querySelector('.app-header').classList.add('hidden');
        document.querySelector('.input-section').classList.add('hidden');
        document.querySelector('.app-footer').classList.add('hidden');
        document.querySelector('.chat-minimap-container').style.opacity = '0';
        
        this.interfaceHidden = true;
        
        // Включаем режим чтения
        this.enableReadingMode();
    }

    showInterface() {
        if (!this.interfaceHidden) return;
        
        document.querySelector('.app-header').classList.remove('hidden');
        document.querySelector('.input-section').classList.remove('hidden');
        document.querySelector('.app-footer').classList.remove('hidden');
        document.querySelector('.chat-minimap-container').style.opacity = '1';
        
        this.interfaceHidden = false;
        
        // Выключаем режим чтения
        this.disableReadingMode();
    }

    enableReadingMode() {
        if (this.readingMode) return;
        
        const container = document.getElementById('messagesContainer');
        container.classList.add('reading-mode');
        this.readingMode = true;
        
        // Увеличиваем размер сообщений
        document.querySelectorAll('.message').forEach(message => {
            message.style.transform = 'scale(1.5)';
            message.style.margin = '40px 0';
        });
    }

    disableReadingMode() {
        if (!this.readingMode) return;
        
        const container = document.getElementById('messagesContainer');
        container.classList.remove('reading-mode');
        this.readingMode = false;
        
        // Возвращаем нормальный размер сообщений
        document.querySelectorAll('.message').forEach(message => {
            message.style.transform = 'scale(1)';
            message.style.margin = '';
        });
    }

    // Уведомления
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const id = 'notif_' + Date.now();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = id;
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="app.closeNotification('${id}')">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        // Закрываем предыдущее уведомление, если есть
        const existingNotifications = container.querySelectorAll('.notification');
        if (existingNotifications.length > 0) {
            existingNotifications.forEach(notif => this.closeNotification(notif.id));
        }
        
        container.appendChild(notification);
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => this.closeNotification(id), 5000);
    }

    closeNotification(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
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

    // Модальные окна
    showModelModal() {
        document.getElementById('modelModalOverlay').classList.add('active');
    }

    hideModelModal() {
        document.getElementById('modelModalOverlay').classList.remove('active');
    }

    confirmModelSelection() {
        const selected = document.querySelector('.model-item.selected');
        if (selected) {
            this.currentModel = selected.dataset.model;
            this.updateModelInfo();
            this.hideModelModal();
            this.showNotification(`Модель изменена на: ${this.getModelName(this.currentModel)}`, 'success');
        }
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        document.getElementById('confirmModal').classList.add('active');
        
        const confirmBtn = document.getElementById('confirmModalConfirm');
        const cancelBtn = document.getElementById('confirmModalCancel');
        const closeBtn = document.getElementById('confirmModalClose');
        
        const cleanup = () => {
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            closeBtn.onclick = null;
            document.getElementById('confirmModal').classList.remove('active');
        };
        
        confirmBtn.onclick = () => {
            onConfirm();
            cleanup();
        };
        
        cancelBtn.onclick = cleanup;
        closeBtn.onclick = cleanup;
    }

    // Тема
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeMinimapToggle i');
        icon.className = newTheme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
        
        this.showNotification(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`, 'info');
    }

    // Утилиты
    copyMessage(messageId) {
        const message = document.getElementById(messageId);
        const content = message.querySelector('.message-content').textContent;
        
        navigator.clipboard.writeText(content).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        });
    }

    deleteMessage(messageId) {
        const chat = this.chats.get(this.currentChatId);
        chat.messages = chat.messages.filter(msg => msg.id !== messageId);
        
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.remove();
        }
        
        this.saveChats();
        this.updateMinimap();
        this.showNotification('Сообщение удалено', 'success');
    }

    clearInput() {
        document.getElementById('userInput').value = '';
        this.updateInputControls();
    }

    handleInputChange() {
        this.updateInputControls();
    }

    updateInputControls() {
        const input = document.getElementById('userInput');
        const clearBtn = document.getElementById('clearInputBtn');
        
        clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
        
        // Автоматическое изменение высоты текстового поля
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    triggerFileInput() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (this.attachedFiles.length < 5) { // Максимум 5 файлов
                this.attachedFiles.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    file: file
                });
            }
        });
        
        this.renderAttachedFilesList();
        e.target.value = '';
    }

    renderAttachedFilesList() {
        const container = document.getElementById('attachedFiles');
        container.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'attached-file';
            div.innerHTML = `
                <span class="attached-file-name">${file.name}</span>
                <button class="attached-file-remove" onclick="app.removeAttachedFile(${index})">
                    <i class="ti ti-x"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    removeAttachedFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachedFilesList();
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.renderAttachedFilesList();
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Обновляем кнопки
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}ModeBtn`).classList.add('active');
        
        // Обновляем placeholder
        const input = document.getElementById('userInput');
        const placeholders = {
            normal: 'Задайте вопрос или опишите изображение...',
            voice: 'Введите текст для генерации голоса...',
            image: 'Опишите изображение, которое хотите сгенерировать...'
        };
        input.placeholder = placeholders[mode] || placeholders.normal;
        
        this.showNotification(`Режим изменен: ${this.getModeName(mode)}`, 'info');
    }

    getModeName(mode) {
        const names = {
            normal: 'Обычный',
            voice: 'Голосовой',
            image: 'Генерация изображений'
        };
        return names[mode] || 'Неизвестный';
    }

    getModelName(model) {
        const names = {
            'gpt-4': 'GPT-4',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'claude-3-sonnet': 'Claude 3 Sonnet',
            'claude-3-haiku': 'Claude 3 Haiku',
            'gemini-pro': 'Gemini Pro',
            'llama-2-70b': 'Llama 2 70B'
        };
        return names[model] || model;
    }

    // Сохранение и загрузка
    saveChats() {
        const data = {
            chats: Array.from(this.chats.entries()),
            currentChatId: this.currentChatId,
            currentModel: this.currentModel,
            theme: document.documentElement.getAttribute('data-theme') || 'dark'
        };
        localStorage.setItem('khai-assistant', JSON.stringify(data));
    }

    loadChats() {
        const data = localStorage.getItem('khai-assistant');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.chats = new Map(parsed.chats);
                this.currentChatId = parsed.currentChatId || 'default';
                this.currentModel = parsed.currentModel || 'gpt-4';
                
                // Восстанавливаем тему
                if (parsed.theme) {
                    document.documentElement.setAttribute('data-theme', parsed.theme);
                }
            } catch (e) {
                console.error('Error loading chats:', e);
                this.createDefaultChat();
            }
        } else {
            this.createDefaultChat();
        }
    }

    loadSettings() {
        // Загрузка дополнительных настроек
        const theme = localStorage.getItem('theme');
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    createDefaultChat() {
        this.chats.set('default', {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            model: this.currentModel
        });
        this.currentChatId = 'default';
    }

    // UI Updates
    updateUI() {
        this.updateChatList();
        this.updateMessages();
        this.updateModelInfo();
        this.updateFooterStatus();
    }

    updateChatList() {
        const container = document.getElementById('chatList');
        container.innerHTML = '';
        
        this.chats.forEach(chat => {
            const div = document.createElement('div');
            div.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            div.onclick = () => this.switchToChat(chat.id);
            
            div.innerHTML = `
                <div class="chat-item-icon">
                    <i class="ti ti-message"></i>
                </div>
                <span class="chat-item-name">${chat.name}</span>
                <div class="chat-item-actions">
                    <button class="chat-item-action edit" onclick="event.stopPropagation(); app.editChat('${chat.id}')">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-item-action delete" onclick="event.stopPropagation(); app.deleteChat('${chat.id}')">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
    }

    updateMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages.forEach(message => this.renderMessage(message));
        }
        
        this.updateMinimap();
    }

    updateModelInfo() {
        document.getElementById('currentModelInfo').textContent = this.getModelName(this.currentModel);
        
        // Обновляем иконку в кнопке выбора модели
        const modelBtn = document.getElementById('modelSelectBtn');
        modelBtn.innerHTML = `<i class="ti ti-brain"></i>`;
        modelBtn.title = `Текущая модель: ${this.getModelName(this.currentModel)}`;
    }

    updateFooterStatus() {
        const chat = this.chats.get(this.currentChatId);
        const status = document.getElementById('footerStatus');
        
        if (chat) {
            const messageCount = chat.messages.length;
            status.textContent = `${messageCount} сообщений`;
        } else {
            status.textContent = 'Готов к работе';
        }
    }

    // Индикатор набора
    showTypingIndicator() {
        const container = document.getElementById('messagesContainer');
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai typing-indicator';
        indicator.id = 'typingIndicator';
        
        indicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        container.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Боковое меню
    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    // Редактирование чата
    editChat(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        const modal = document.getElementById('editChatModal');
        const input = document.getElementById('editChatNameInput');
        const clearBtn = document.getElementById('modalClearInput');
        
        input.value = chat.name;
        clearBtn.style.display = input.value ? 'flex' : 'none';
        
        modal.classList.add('active');
        
        const saveBtn = document.getElementById('editChatModalSave');
        const cancelBtn = document.getElementById('editChatModalCancel');
        const closeBtn = document.getElementById('editChatModalClose');
        
        const cleanup = () => {
            saveBtn.onclick = null;
            cancelBtn.onclick = null;
            closeBtn.onclick = null;
            modal.classList.remove('active');
        };
        
        saveBtn.onclick = () => {
            chat.name = input.value.trim() || 'Без названия';
            this.updateChatList();
            this.updateFooterStatus();
            cleanup();
            this.showNotification('Название чата обновлено', 'success');
        };
        
        cancelBtn.onclick = cleanup;
        closeBtn.onclick = cleanup;
        
        // Очистка поля
        clearBtn.onclick = () => {
            input.value = '';
            clearBtn.style.display = 'none';
            input.focus();
        };
        
        // Изменение поля ввода
        input.oninput = () => {
            clearBtn.style.display = input.value ? 'flex' : 'none';
        };
        
        input.focus();
    }

    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }
        
        this.showConfirmModal(
            'Удалить чат?',
            'Это действие нельзя отменить. Все сообщения в этом чате будут удалены.',
            () => {
                this.chats.delete(chatId);
                
                // Переключаемся на другой чат, если удалили текущий
                if (chatId === this.currentChatId) {
                    const remainingChats = Array.from(this.chats.keys());
                    this.switchToChat(remainingChats[0]);
                }
                
                this.updateUI();
                this.showNotification('Чат удален', 'success');
            }
        );
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new KHAIAssistant();
});

// Обработчики для PWA
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
});
