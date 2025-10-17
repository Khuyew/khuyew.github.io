class KhuyewAI {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        // Основные элементы интерфейса
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.generateImageBtn = document.getElementById('generateImageBtn');
        this.generateVoiceBtn = document.getElementById('generateVoiceBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.modelSelect = document.getElementById('modelSelect');
        this.logo = document.querySelector('.logo-image');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.currentChatName = document.getElementById('currentChatName');
        
        // Новые элементы для меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.chatList = document.getElementById('chatList');
        this.newChatBtn = document.getElementById('newChatBtn');

        // Элементы модального окна редактирования чата
        this.editChatModal = document.getElementById('editChatModal');
        this.editChatModalClose = document.getElementById('editChatModalClose');
        this.editChatModalCancel = document.getElementById('editChatModalCancel');
        this.editChatModalSave = document.getElementById('editChatModalSave');
        this.editChatNameInput = document.getElementById('editChatNameInput');

        // Проверяем что все элементы найдены
        this.validateElements();
    }

    validateElements() {
        const requiredElements = [
            'messagesContainer', 'userInput', 'sendBtn', 'clearInputBtn',
            'clearChatBtn', 'helpBtn', 'generateVoiceBtn', 'themeToggle',
            'modelSelect', 'attachFileBtn', 'voiceInputBtn', 'fileInput',
            'attachedFiles', 'currentChatName', 'menuToggle', 'sidebarMenu',
            'sidebarOverlay', 'sidebarClose', 'chatList', 'newChatBtn',
            'editChatModal', 'editChatModalClose', 'editChatModalCancel',
            'editChatModalSave', 'editChatNameInput'
        ];

        requiredElements.forEach(elementName => {
            if (!this[elementName]) {
                console.error(`Элемент не найден: ${elementName}`);
                throw new Error(`Required element ${elementName} not found`);
            }
        });
    }

    initializeState() {
        // Состояние приложения
        this.isProcessing = false;
        this.currentTheme = 'dark'; // По умолчанию темная тема
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.attachedFilesList = [];
        this.isListening = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.currentModel = 'gpt-5-nano';
        this.currentAudio = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.activeTypingIndicator = null;
        this.activeStreamingMessage = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.editingChatId = null;

        // Конфигурация
        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач' 
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения' 
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа' 
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач' 
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений' 
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями' 
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач' 
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами' 
            }
        };

        this.fileTypeIcons = {
            'image': 'ti-photo',
            'text': 'ti-file-text',
            'pdf': 'ti-file-text',
            'audio': 'ti-music',
            'video': 'ti-video',
            'archive': 'ti-zip',
            'document': 'ti-file',
            'default': 'ti-file'
        };
    }

    setupMarked() {
        marked.setOptions({
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn(`Error highlighting ${lang}:`, err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }

    init() {
        try {
            this.bindEvents();
            this.setupAutoResize();
            this.setupVoiceRecognition();
            this.startPlaceholderAnimation();
            this.loadModelPreference();
            this.loadThemePreference();
            this.loadChatSessions();
            this.setupChatSelector();
            this.loadCurrentSession();
            
            this.showNotification('Khuyew AI загружен и готов к работе!', 'success');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    bindEvents() {
        // Основные обработчики событий
        const events = [
            [this.sendBtn, 'click', () => this.sendMessage()],
            [this.userInput, 'keydown', (e) => this.handleInputKeydown(e)],
            [this.clearInputBtn, 'click', () => this.clearInput()],
            [this.clearChatBtn, 'click', () => this.clearChat()],
            [this.helpBtn, 'click', () => this.showHelp()],
            [this.generateImageBtn, 'click', () => this.toggleImageMode()],
            [this.generateVoiceBtn, 'click', () => this.toggleVoiceMode()],
            [this.themeToggle, 'click', () => this.toggleTheme()],
            [this.modelSelect, 'change', (e) => this.handleModelChange(e)],
            [this.logo, 'click', () => this.showWelcomeMessage()],
            [this.attachFileBtn, 'click', () => this.fileInput.click()],
            [this.fileInput, 'change', (e) => this.handleFileSelect(e)],
            [this.voiceInputBtn, 'click', () => this.toggleVoiceInput()],
            [this.menuToggle, 'click', () => this.toggleSidebar()],
            [this.sidebarClose, 'click', () => this.closeSidebar()],
            [this.sidebarOverlay, 'click', () => this.closeSidebar()],
            [this.newChatBtn, 'click', () => this.createNewChat()],
            [window, 'beforeunload', () => this.handleBeforeUnload()],
            [this.editChatModalClose, 'click', () => this.closeEditChatModal()],
            [this.editChatModalCancel, 'click', () => this.closeEditChatModal()],
            [this.editChatModalSave, 'click', () => this.saveChatName()],
            [this.editChatNameInput, 'keydown', (e) => this.handleEditChatKeydown(e)]
        ];

        events.forEach(([element, event, handler]) => {
            this.addEventListener(element, event, handler);
        });
    }

    addEventListener(element, event, handler) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка при обработке действия', 'error');
            }
        };

        element.addEventListener(event, wrappedHandler);
        
        // Сохраняем для возможности очистки
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleEditChatKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.saveChatName();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeEditChatModal();
        }
    }

    handleModelChange(e) {
        this.changeModel(e.target.value);
    }

    handleBeforeUnload() {
        this.saveCurrentSession();
        this.saveModelPreference();
        this.saveChatSessions();
        
        // Очистка ресурсов
        this.cleanup();
    }

    setupAutoResize() {
        this.addEventListener(this.userInput, 'input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.voiceInputBtn.style.display = 'none';
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } catch (error) {
            console.error('Error setting up voice recognition:', error);
            this.voiceInputBtn.style.display = 'none';
        }
    }

    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            
            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            const currentText = currentExample.substring(0, charIndex);
            this.userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                isDeleting = true;
                this.setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            this.setTimeout(type, typeSpeed);
        };

        type();
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        if (this.sidebarMenu.classList.contains('active')) {
            this.updateChatDropdown();
        }
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    updateChatDropdown() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';

        const sessionsArray = Array.from(this.chatSessions.entries())
            .sort(([,a], [,b]) => b.lastActivity - a.lastActivity);

        if (sessionsArray.length === 0) {
            this.createDefaultChat();
            this.updateChatDropdown();
            return;
        }

        sessionsArray.forEach(([id, session]) => {
            const chatItem = this.createChatItem(id, session);
            this.chatList.appendChild(chatItem);
        });
    }

    createChatItem(id, session) {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${id === this.currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-chat-id', id);
        
        chatItem.innerHTML = `
            <div class="chat-info">
                <i class="ti ti-message"></i>
                <span class="chat-name">${this.escapeHtml(session.name)}</span>
            </div>
            <div class="chat-actions">
                <button class="edit-chat-btn" title="Редактировать название чата">
                    <i class="ti ti-edit"></i>
                </button>
                ${id !== 'default' ? '<button class="delete-chat-btn" title="Удалить чат"><i class="ti ti-x"></i></button>' : ''}
            </div>
        `;

        this.addEventListener(chatItem, 'click', (e) => {
            if (!e.target.closest('.chat-actions')) {
                this.switchChat(id);
                this.closeSidebar();
            }
        });

        const editBtn = chatItem.querySelector('.edit-chat-btn');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(id);
            });
        }

        const deleteBtn = chatItem.querySelector('.delete-chat-btn');
        if (deleteBtn) {
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(id);
            });
        }

        return chatItem;
    }

    openEditChatModal(chatId) {
        const session = this.chatSessions.get(chatId);
        if (!session) return;
        
        this.editingChatId = chatId;
        this.editChatNameInput.value = session.name;
        this.editChatModal.classList.add('active');
        this.editChatNameInput.focus();
        this.editChatNameInput.select();
    }

    closeEditChatModal() {
        this.editChatModal.classList.remove('active');
        this.editingChatId = null;
    }

    saveChatName() {
        if (!this.editingChatId) return;
        
        const newName = this.editChatNameInput.value.trim();
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }

        const session = this.chatSessions.get(this.editingChatId);
        if (session) {
            session.name = newName;
            this.chatSessions.set(this.editingChatId, session);
            
            if (this.currentChatId === this.editingChatId) {
                this.currentChatName.textContent = newName;
            }
            
            this.updateChatDropdown();
            this.saveChatSessions();
            this.showNotification('Название чата обновлено', 'success');
        }
        
        this.closeEditChatModal();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createNewChat() {
        const chatNumber = Array.from(this.chatSessions.values()).filter(session => 
            session.name.startsWith('Чат ')
        ).length + 1;
        
        const chatName = `Чат ${chatNumber}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.closeSidebar();
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }

    createChatSession(name = 'Новый чат') {
        const chatId = 'chat-' + Date.now();
        const session = {
            id: chatId,
            name: name,
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatDropdown();
        
        return chatId;
    }

    switchChat(chatId) {
        if (!this.chatSessions.has(chatId) || chatId === this.currentChatId) {
            return;
        }

        try {
            // Сохраняем текущую сессию перед переключением
            this.saveCurrentSession();
            
            this.currentChatId = chatId;
            const session = this.chatSessions.get(chatId);
            
            // Обновляем активность чата
            session.lastActivity = Date.now();
            this.chatSessions.set(chatId, session);
            
            // Обновляем UI
            this.currentChatName.textContent = session.name;
            
            // Загружаем новую сессию
            this.loadSession(session);
            this.showNotification(`Переключен на чат: ${session.name}`, 'info');
            
            this.saveChatSessions();
        } catch (error) {
            console.error('Error switching chat:', error);
            this.showNotification('Ошибка при переключении чата', 'error');
        }
    }

    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification('Основной чат нельзя удалить', 'warning');
            return;
        }

        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        const session = this.chatSessions.get(chatId);
        if (!session) return;

        if (confirm(`Удалить чат "${session.name}"?`)) {
            this.chatSessions.delete(chatId);
            
            // Если удаляем текущий чат, переключаемся на default
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatDropdown();
            this.showNotification('Чат удален', 'success');
        }
    }

    saveCurrentSession() {
        try {
            const messages = [];
            this.messagesContainer.querySelectorAll('.message').forEach(message => {
                if (message.classList.contains('typing-indicator') || 
                    message.classList.contains('streaming-message')) return;
                
                const role = message.classList.contains('message-user') ? 'user' : 
                           message.classList.contains('message-error') ? 'error' : 'ai';
                
                const content = message.querySelector('.message-content')?.innerHTML || '';
                if (content) {
                    messages.push({ role, content });
                }
            });
            
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.messages = messages;
                session.conversationHistory = [...this.conversationHistory];
                session.lastActivity = Date.now();
                this.chatSessions.set(this.currentChatId, session);
            }
        } catch (error) {
            console.error('Error saving current session:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.loadSession(session);
        } else {
            this.showWelcomeMessage();
        }
    }

    loadSession(session) {
        // Очищаем контейнер сообщений
        this.messagesContainer.innerHTML = '';
        
        // Загружаем историю сообщений
        this.conversationHistory = session.conversationHistory || [];
        
        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(msg => {
                this.renderMessage(msg.role, msg.content);
            });
        } else {
            this.showWelcomeMessage();
        }
        
        this.scrollToBottom();
    }

    renderMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        // Прикрепляем обработчики
        this.attachMessageHandlers(messageElement);
    }

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        if (messageElement.classList.contains('message-ai')) {
            this.attachSpeakButton(messageElement);
        }
    }

    changeModel(model) {
        if (!this.modelConfig[model]) {
            this.showNotification('Неизвестная модель', 'error');
            return;
        }

        this.currentModel = model;
        const modelInfo = this.modelConfig[model];
        this.showNotification(`Модель изменена на: ${modelInfo.name}`, 'success');
        this.saveModelPreference();
    }

    getModelDisplayName(model) {
        return this.modelConfig[model]?.name || model;
    }

    getModelDescription(model) {
        return this.modelConfig[model]?.description || 'Модель ИИ';
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
            }
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const placeholder = this.isVoiceMode 
            ? "Введите текст для генерации голоса..." 
            : "Задайте вопрос или опишите изображение...";
        
        this.userInput.placeholder = placeholder;
        this.generateVoiceBtn.classList.toggle('voice-mode-active', this.isVoiceMode);
        
        const icon = this.generateVoiceBtn.querySelector('i');
        icon.className = this.isVoiceMode ? 'ti ti-microphone-off' : 'ti ti-microphone';
        
        this.showNotification(
            this.isVoiceMode ? 'Режим генерации голоса включен' : 'Режим генерации голоса выключен',
            'info'
        );
    }

    getFileType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('text/')) return 'text';
        if (file.type.includes('pdf')) return 'pdf';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar') || file.type.includes('7z')) return 'archive';
        if (file.type.includes('document') || file.type.includes('msword') || file.type.includes('officedocument')) return 'document';
        return 'default';
    }

    getFileIcon(fileType) {
        return this.fileTypeIcons[fileType] || this.fileTypeIcons.default;
    }

    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        let processedCount = 0;
        const maxFiles = 5;

        for (const file of files) {
            if (processedCount >= maxFiles) {
                this.showNotification('Можно прикрепить не более 5 файлов', 'warning');
                break;
            }

            const fileType = this.getFileType(file);
            
            try {
                if (fileType === 'image') {
                    await this.processImageFile(file);
                } else {
                    await this.processTextFile(file, fileType);
                }
                processedCount++;
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                this.showNotification(`Ошибка обработки файла: ${file.name}`, 'error');
            }
        }

        this.renderAttachedFiles();
        event.target.value = '';
    }

    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    data: e.target.result,
                    type: 'image',
                    fileType: file.type,
                    size: file.size,
                    originalFile: file
                };
                
                this.attachedFilesList.push(fileData);
                this.showNotification(`Изображение "${file.name}" прикреплено`, 'success');
                resolve();
            };
            
            reader.onerror = () => {
                reject(new Error(`Failed to read image file: ${file.name}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    async processTextFile(file, fileType) {
        try {
            // Используем Puter.js для чтения файлов
            const filename = file.name;
            
            // Создаем временный файл в Puter файловой системе
            await puter.fs.write(filename, file);
            
            // Читаем содержимое файла
            const blob = await puter.fs.read(filename);
            let content;
            
            if (fileType === 'text') {
                content = await blob.text();
            } else {
                // Для бинарных файлов читаем как ArrayBuffer
                const arrayBuffer = await blob.arrayBuffer();
                content = `Binary file: ${file.name} (${file.size} bytes)`;
            }
            
            const fileData = {
                name: file.name,
                data: content,
                type: fileType,
                fileType: file.type,
                size: file.size,
                originalFile: file
            };
            
            this.attachedFilesList.push(fileData);
            this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
            
            // Удаляем временный файл
            await puter.fs.rm(filename);
            
        } catch (error) {
            console.error('Error processing text file with Puter:', error);
            // Fallback: используем FileReader
            await this.processTextFileWithFileReader(file, fileType);
        }
    }

    processTextFileWithFileReader(file, fileType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    data: e.target.result,
                    type: fileType,
                    fileType: file.type,
                    size: file.size,
                    originalFile: file
                };
                
                this.attachedFilesList.push(fileData);
                this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
                resolve();
            };
            
            reader.onerror = () => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };
            
            if (fileType === 'text') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedFilesList.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ${this.getFileIcon(file.type)}"></i>
                <span>${this.escapeHtml(file.name)} (${this.formatFileSize(file.size)})</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
        });

        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachedFile(index) {
        if (index < 0 || index >= this.attachedFilesList.length) return;
        
        const removedFile = this.attachedFilesList.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(`Файл "${removedFile.name}" удален`, 'info');
    }

    async sendMessage() {
        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        const message = this.userInput.value.trim();
        
        if (!message && this.attachedFilesList.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'error');
            return;
        }

        this.isProcessing = true;
        this.sendBtn.disabled = true;

        try {
            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message);
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.handleError('Произошла ошибка при отправке сообщения', error);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async processUserMessage(message) {
        // Добавляем сообщение пользователя
        this.addMessage('user', message, this.attachedFilesList);
        this.addToConversationHistory('user', message, this.attachedFilesList);
        
        // Очищаем ввод
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedFilesList];
        this.attachedFilesList = [];
        this.renderAttachedFiles();
        
        // Обрабатываем сообщение
        if (this.isImageMode) {
            await this.generateImage(message);
        } else {
            await this.getAIResponse(message, filesToProcess);
        }
    }

    async getAIResponse(userMessage, files) {
        this.removeTypingIndicator();
        this.activeTypingIndicator = this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage, files) {
        const imageFiles = files.filter(f => f.type === 'image');
        const textFiles = files.filter(f => f.type === 'text');
        
        let prompt = '';
        
        if (imageFiles.length > 0) {
            if (typeof puter?.ai?.img2txt !== 'function') {
                throw new Error('Функция анализа изображений недоступна');
            }
            
            const extractedText = await puter.ai.img2txt(imageFiles[0].data);
            
            if (userMessage.trim()) {
                prompt += `Пользователь отправил изображение "${imageFiles[0].name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"`;
            } else {
                prompt += `Пользователь отправил изображение "${imageFiles[0].name}".

Извлеченный текст с изображения: "${extractedText}"`;
            }
        }
        
        if (textFiles.length > 0) {
            if (prompt) prompt += '\n\n';
            
            prompt += `Пользователь отправил текстовый файл "${textFiles[0].name}" со следующим содержимым:\n\n"${textFiles[0].data}"`;
            
            if (userMessage.trim()) {
                prompt += `\n\nСопроводительное сообщение пользователя: "${userMessage}"`;
            }
        }
        
        if (!prompt && userMessage.trim()) {
            prompt = this.buildContextPrompt(userMessage);
        } else if (prompt && userMessage.trim()) {
            prompt += `\n\nОтветь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание прикрепленных файлов. Отвечай одним целостным сообщением на русском языке.`;
        } else {
            prompt += `\n\nПроанализируй прикрепленные файлы. Опиши основное содержание. Если есть текст - объясни его значение. Отвечай подробно на русском языке.`;
        }
        
        return prompt;
    }

    async callAIService(prompt) {
        if (typeof puter?.ai?.chat !== 'function') {
            throw new Error('Функция чата недоступна');
        }
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'claude-sonnet': { model: 'claude-sonnet' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'gemini-1.5-flash': { model: 'gemini-1.5-flash' },
            'grok-beta': { model: 'grok-beta' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: "Ты полезный AI-ассистент Khuyew AI. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.",
            stream: true
        };
        
        return await puter.ai.chat(prompt, options);
    }

    async processAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage();
        
        let fullResponse = '';
        for await (const part of response) {
            if (part?.text) {
                fullResponse += part.text;
                this.updateStreamingMessage(this.activeStreamingMessage, fullResponse);
                await this.delay(10); // Небольшая задержка для плавности
            }
        }
        
        this.finalizeStreamingMessage(this.activeStreamingMessage, fullResponse);
        this.activeStreamingMessage = null;
        
        this.addToConversationHistory('assistant', fullResponse);
        this.saveCurrentSession();
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator-inline');
        
        if (content.length > 100 && typingIndicator && !typingIndicator.classList.contains('fade-out')) {
            typingIndicator.classList.add('fade-out');
            this.setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.style.display = 'none';
                }
            }, 300);
        }
        
        const processedContent = this.processCodeBlocks(content);
        streamingText.innerHTML = processedContent;
        
        this.attachCopyButtons(streamingText);
        this.scrollToBottom();
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.classList.remove('streaming-content');
        
        const typingIndicator = messageContent.querySelector('.typing-indicator-inline');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const processedContent = this.processCodeBlocks(fullContent);
        messageContent.innerHTML = processedContent;
        
        // Добавляем информацию о модели
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
    }

    attachSpeakButton(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const plainText = this.extractPlainText(messageContent.textContent || '');
        
        if (plainText.trim().length < 10) return;
        
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        const existingSpeakBtn = actionsContainer.querySelector('.speak-btn');
        if (existingSpeakBtn) {
            existingSpeakBtn.remove();
        }
        
        const speakButton = document.createElement('button');
        speakButton.className = 'action-btn-small speak-btn';
        speakButton.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        speakButton.setAttribute('data-text', plainText);
        
        this.addEventListener(speakButton, 'click', (e) => {
            e.stopPropagation();
            const text = e.currentTarget.getAttribute('data-text');
            this.toggleTextToSpeech(text, speakButton);
        });
        
        actionsContainer.appendChild(speakButton);
    }

    extractPlainText(htmlText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    toggleTextToSpeech(text, button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        } else {
            this.speakText(text, button);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            this.stopSpeech(); // Останавливаем предыдущее воспроизведение

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
                this.currentUtterance.rate = 0.8;
            }

            button.classList.add('speaking');
            button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
                this.showNotification('Ошибка при озвучивании текста', 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    async generateVoice(text) {
        if (typeof puter?.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса недоступна');
        }
        
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }

        try {
            this.addMessage('user', `🔊 **Генерация голоса:** "${text}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await puter.ai.txt2speech(text);
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', `Сгенерирован голос для текста: ${text}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **Сгенерированный голос для текста:** "${this.escapeHtml(text)}"
            <div class="audio-player" style="margin-top: 12px;">
                <audio controls style="width: 100%; max-width: 300px;">
                    <source src="${audio.src}" type="audio/mpeg">
                    Ваш браузер не поддерживает аудио элементы.
                </audio>
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        const audioElement = messageContent.querySelector('audio');
        audioElement.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, files = []) {
        let messageContent = content;
        
        if (files && files.length > 0) {
            const fileNames = files.map(file => file.name).join(', ');
            messageContent += ` [Прикреплены файлы: ${fileNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        // Ограничиваем историю 30 сообщениями
        if (this.conversationHistory.length > 30) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    async generateImage(prompt) {
        try {
            if (typeof puter?.ai?.imagine !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.addMessage('ai', `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n*Идет процесс создания изображения...*`);
            
            const imageResult = await puter.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            // Обновляем сообщение с результатом
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Сгенерированное изображение по запросу:** "${this.escapeHtml(prompt)}"\n\n` +
                    `<img src="${imageResult.url}" alt="Сгенерированное изображение" style="max-width: 100%; border-radius: 8px;">`;
            }
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        const placeholder = this.isImageMode 
            ? "Опишите изображение для генерации..." 
            : "Задайте вопрос или опишите изображение...";
        
        this.userInput.placeholder = placeholder;
        this.generateImageBtn.classList.toggle('active', this.isImageMode);
        
        const icon = this.generateImageBtn.querySelector('i');
        icon.className = this.isImageMode ? 'ti ti-photo-off' : 'ti ti-photo';
        
        this.showNotification(
            this.isImageMode ? 'Режим генерации изображений включен' : 'Режим генерации изображений выключен',
            'info'
        );
    }

    addMessage(role, content, files = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        try {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML = processedContent;
        } catch {
            messageContent.textContent = content;
        }
        
        if (role === 'ai') {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        if (files && files.length > 0) {
            files.forEach(file => {
                if (file.type === 'image') {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'message-image';
                    
                    const img = document.createElement('img');
                    img.src = file.data;
                    img.alt = file.name;
                    img.style.maxWidth = '200px';
                    img.style.borderRadius = '8px';
                    img.style.marginTop = '8px';
                    
                    imageContainer.appendChild(img);
                    messageContent.appendChild(imageContainer);
                } else {
                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'message-file';
                    fileContainer.innerHTML = `
                        <i class="ti ${this.getFileIcon(file.type)}"></i>
                        <span>Прикреплен файл: ${this.escapeHtml(file.name)} (${this.formatFileSize(file.size)})</span>
                    `;
                    messageContent.appendChild(fileContainer);
                }
            });
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
        
        return messageElement;
    }

    processCodeBlocks(content) {
        let html = marked.parse(content);
        
        // Добавляем заголовки для блоков кода
        html = html.replace(/<pre><code class="([^"]*)">/g, (match, lang) => {
            const language = lang || 'text';
            return `
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" data-language="${language}">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                </div>
                <pre><code class="${lang}">`;
        });
        
        return html;
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => {
            this.addEventListener(btn, 'click', async (e) => {
                const codeBlock = e.target.closest('.code-header')?.nextElementSibling;
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                        btn.classList.add('copied');
                        
                        this.setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                        
                        this.showNotification('Код скопирован в буфер обмена', 'success');
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                        this.showNotification('Не удалось скопировать код', 'error');
                    }
                }
            });
        });
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) element.remove();
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
            this.activeTypingIndicator = null;
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.attachedFilesList = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification('Ввод очищен', 'success');
    }

    clearChat() {
        if (this.messagesContainer.children.length === 0) {
            return;
        }

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.showWelcomeMessage();
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showWelcomeMessage() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeMessage = `# 👋 Добро пожаловать в Khuyew AI!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. 

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Работа с файлами** - чтение и анализ текстовых файлов
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь
• **Озвучивание ответов** - слушайте ответы ИИ в аудиоформате
• **Контекстный диалог** - помню историю нашего разговора
• **Подсветка синтаксиса** - красивое отображение кода
• **Копирование кода** - удобное копирование фрагментов кода
• **Стриминг ответов** - ответы появляются постепенно
• **Мульти-чаты** - создавайте отдельные чаты для разных тем
• **Редактирование чатов** - изменяйте названия ваших чатов

**Текущая модель: ${currentModelName}** - ${currentModelDesc}

**Начните общение, отправив сообщение или файл!**`;

        this.addMessage('ai', welcomeMessage);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        const helpMessage = `# 🆘 Помощь по Khuyew AI

## 🤖 Текущая модель: ${currentModelName}
Вы можете переключать модели в верхнем правом углу.

## 💬 Система чатов:
• **Создание нового чата** - нажмите "Новый чат" в меню
• **Переключение между чатами** - выберите чат из списка в меню
• **Редактирование названия** - нажмите ✏️ рядом с названием чата
• **Удаление чатов** - нажмите ❌ рядом с названием чата (кроме основного)

## 📎 Работа с файлами:
• **Прикрепление файлов** - нажмите на скрепку для выбора файлов
• **Поддерживаемые форматы** - изображения, текстовые файлы, PDF, документы
• **Анализ содержимого** - ИИ проанализирует текст из прикрепленных файлов

## 🔊 Аудио функции:
• **Генерация голоса** - создает аудио из текста с помощью ИИ
• **Озвучить ответ** - воспроизводит ответ ИИ
• **Остановить озвучку** - нажмите кнопку повторно для остановки

## 🖼️ Работа с изображениями:
1. **Нажмите кнопку скрепки** чтобы прикрепить изображение
2. **Напишите вопрос** (опционально) - что вы хотите узнать о изображении
3. **Нажмите Отправить** - ИИ проанализирует изображение и ответит

**Попробуйте отправить файл или изображение с вопросом!**`;

        this.addMessage('ai', helpMessage);
        this.addToConversationHistory('assistant', helpMessage);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Обновляем иконку темы
        const themeIcon = this.themeToggle.querySelector('i');
        themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        
        // Сохраняем тему в localStorage
        try {
            localStorage.setItem('khuyew-ai-theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
            'info'
        );
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('khuyew-ai-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', this.currentTheme);
                
                // Обновляем иконку темы
                const themeIcon = this.themeToggle.querySelector('i');
                themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Убираем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    scrollToBottom() {
        this.setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        }, 50);
    }

    handleError(userMessage, error) {
        console.error(userMessage, error);
        this.addMessage('error', `${userMessage}: ${error.message}`);
        this.showNotification(userMessage, 'error');
    }

    // Система чатов
    setupChatSelector() {
        if (!this.chatSessions.has('default')) {
            this.createDefaultChat();
        }
        this.updateChatDropdown();
    }

    createDefaultChat() {
        const defaultSession = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        this.chatSessions.set('default', defaultSession);
        this.currentChatId = 'default';
        this.saveChatSessions();
    }

    // Сохранение и загрузка
    saveModelPreference() {
        try {
            localStorage.setItem('khuyew-ai-model', this.currentModel);
        } catch (error) {
            console.error('Error saving model preference:', error);
        }
    }

    loadModelPreference() {
        try {
            const savedModel = localStorage.getItem('khuyew-ai-model');
            if (savedModel && this.modelConfig[savedModel]) {
                this.currentModel = savedModel;
                this.modelSelect.value = savedModel;
            }
        } catch (error) {
            console.error('Error loading model preference:', error);
        }
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khuyew-ai-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khuyew-ai-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
        }
    }

    // Очистка ресурсов
    cleanup() {
        // Останавливаем все таймеры
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();

        // Останавливаем речь
        this.stopSpeech();

        // Останавливаем голосовой ввод
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }

        // Убираем индикаторы
        this.removeTypingIndicator();

        // Удаляем обработчики событий
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Проверяем наличие Puter.ai
        if (typeof puter === 'undefined') {
            console.warn('Puter.ai не загружен, некоторые функции будут недоступны');
        }
        
        // Предзагрузка голосов для синтеза речи
        if ('speechSynthesis' in window) {
            speechSynthesis.getVoices();
        }
        
        // Инициализация приложения
        new KhuyewAI();
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        const errorNotification = document.createElement('div');
        errorNotification.className = 'notification error';
        errorNotification.textContent = 'Критическая ошибка при загрузке приложения';
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '50%';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translate(-50%, -50%)';
        errorNotification.style.zIndex = '10000';
        document.body.appendChild(errorNotification);
    }
});
