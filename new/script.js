// KHAI Pro - Advanced AI Chat Application
class KHAIProChat {
    constructor() {
        this.messages = [];
        this.currentChatId = 'main-chat';
        this.chats = new Map();
        this.isGenerating = false;
        this.currentMode = 'normal';
        this.attachedFiles = [];
        this.puterAI = null;
        this.isOnline = true;
        this.typingIndicator = null;
        this.searchTerm = '';
        this.currentModel = 'gpt-4';
        this.chatStartTime = Date.now();
        this.isListening = false;
        this.recognition = null;
        this.durationTimer = null;
        this.emojiPickerOutsideClick = this.emojiPickerOutsideClick.bind(this);
        this.isSpeaking = false;
        this.currentUtterance = null;
        
        this.models = {
            'gpt-4': { name: 'GPT-4 Turbo', description: 'Самый продвинутый модель для сложных задач' },
            'gpt-3.5': { name: 'GPT-3.5 Turbo', description: 'Быстрый и эффективный для повседневных задач' },
            'claude-3': { name: 'Claude 3', description: 'Отличный для креативных задач и анализа' },
            'gemini-pro': { name: 'Gemini Pro', description: 'Мощный мультимодальный модель от Google' }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опишите задачу...',
                systemPrompt: 'Ты полезный AI-ассистент. Отвечай подробно и точно на русском языке.'
            },
            creative: { 
                icon: 'ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...',
                systemPrompt: 'Ты креативный AI-ассистент. Будь изобретательным, предлагай нестандартные решения и идеи. Отвечай на русском языке.'
            },
            voice: { 
                icon: 'ti-microphone', 
                color: '#ff6b00',
                placeholder: 'Опишите что нужно сгенерировать в аудио формате...',
                systemPrompt: 'Ты специализируешься на создании и анализе аудио контента. Отвечай на русском языке.'
            },
            image: { 
                icon: 'ti-photo', 
                color: '#00c853',
                placeholder: 'Опишите изображение которое нужно сгенерировать...',
                systemPrompt: 'Ты специализируешься на создании и анализе изображений. Подробно описывай визуальные элементы. Отвечай на русском языке.'
            },
            code: { 
                icon: 'ti-code', 
                color: '#ffd600',
                placeholder: 'Опишите код который нужно написать или исправить...',
                systemPrompt: 'Ты эксперт по программированию. Пиши чистый, эффективный и хорошо документированный код. Отвечай на русском языке.'
            }
        };

        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadChatHistory();
            this.setupPuterAI();
            this.showWelcomeMessage();
            this.updateUI();
            this.setupServiceWorker();
            this.startChatDurationTimer();
            this.setupEmojiPicker();
            
            console.log('KHAI Pro Chat initialized successfully');
        } catch (error) {
            console.error('Error initializing KHAI Pro Chat:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    setupEventListeners() {
        try {
            // Send message
            document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
            
            const userInput = document.getElementById('userInput');
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Input auto-resize
            userInput.addEventListener('input', () => {
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
            });

            // Clear input
            document.getElementById('clearInputBtn').addEventListener('click', () => {
                userInput.value = '';
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                userInput.focus();
            });

            // Mode buttons
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.setMode(e.currentTarget.dataset.mode);
                });
            });

            // File attachment
            document.getElementById('attachImageBtn').addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });

            document.getElementById('attachFileBtn').addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });

            document.getElementById('fileInput').addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
                e.target.value = ''; // Reset input
            });

            // Voice input
            document.getElementById('voiceInputBtn').addEventListener('click', () => {
                this.toggleVoiceInput();
            });

            // Emoji picker
            document.getElementById('emojiBtn').addEventListener('click', (e) => {
                this.toggleEmojiPicker(e.currentTarget);
            });

            // Clear chat
            document.getElementById('clearChatBtn').addEventListener('click', () => {
                this.clearChat();
            });

            // Export chat
            document.getElementById('exportBtn').addEventListener('click', () => {
                this.exportChat();
            });

            // Help
            document.getElementById('helpBtn').addEventListener('click', () => {
                this.showHelp();
            });

            // Theme toggle
            document.getElementById('themeToggle').addEventListener('click', () => {
                this.toggleTheme();
            });

            // Fullscreen toggle
            document.getElementById('fullscreenToggle').addEventListener('click', () => {
                this.toggleFullscreen();
            });

            // Model selection
            document.getElementById('modelSelectBtn').addEventListener('click', () => {
                this.showModelSelection();
            });

            // Menu toggle
            document.getElementById('menuToggle').addEventListener('click', () => {
                this.toggleSidebarMenu();
            });

            document.getElementById('sidebarClose').addEventListener('click', () => {
                this.toggleSidebarMenu();
            });

            document.getElementById('sidebarOverlay').addEventListener('click', () => {
                this.toggleSidebarMenu();
            });

            // Quick actions
            document.getElementById('quickNewChat').addEventListener('click', () => {
                this.createNewChat();
            });

            document.getElementById('quickDownload').addEventListener('click', () => {
                this.exportChat();
            });

            document.getElementById('quickSettings').addEventListener('click', () => {
                this.showSettings();
            });

            // Navigation
            document.getElementById('scrollToTop').addEventListener('click', () => {
                this.scrollToTop();
            });

            document.getElementById('scrollToLastAI').addEventListener('click', () => {
                this.scrollToLastAIMessage();
            });

            document.getElementById('scrollToBottom').addEventListener('click', () => {
                this.scrollToBottom();
            });

            // Search
            const headerSearch = document.getElementById('headerSearch');
            headerSearch.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            document.getElementById('headerSearchClear').addEventListener('click', () => {
                headerSearch.value = '';
                this.handleSearch('');
                headerSearch.focus();
            });

            // Context menu
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.message')) {
                    e.preventDefault();
                    this.showContextMenu(e, e.target.closest('.message'));
                }
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.context-menu')) {
                    this.hideContextMenu();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                this.handleKeyboardShortcuts(e);
            });

            // Online/offline detection
            window.addEventListener('online', () => {
                this.setOnlineStatus(true);
            });

            window.addEventListener('offline', () => {
                this.setOnlineStatus(false);
            });

            // Resize handling with debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });

            // Paste handling for images
            document.addEventListener('paste', (e) => {
                this.handlePaste(e);
            });

            // Drag and drop for files
            document.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.showDropZone();
            });

            document.addEventListener('dragleave', (e) => {
                if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
                    this.hideDropZone();
                }
            });

            document.addEventListener('drop', (e) => {
                e.preventDefault();
                this.hideDropZone();
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });

            // Minimap scroll sync
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.addEventListener('scroll', () => {
                this.updateMinimapViewport();
            });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupPuterAI() {
        try {
            if (window.puter && window.puter.ai) {
                this.puterAI = window.puter;
                console.log('Puter AI SDK loaded successfully');
                this.setOnlineStatus(true);
            } else {
                console.warn('Puter AI SDK not available, using fallback');
                this.setOnlineStatus(false);
            }
        } catch (error) {
            console.error('Error initializing Puter AI:', error);
            this.setOnlineStatus(false);
        }
    }

    async sendMessage() {
        if (this.isGenerating) {
            this.showNotification('Подождите, идет генерация ответа...', 'warning');
            return;
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = this.attachedFiles;

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (message.length > 8000) {
            this.showError('Сообщение слишком длинное. Максимум 8000 символов.');
            return;
        }

        try {
            // Add user message
            const userMessage = {
                id: this.generateId(),
                role: 'user',
                content: message,
                files: [...files],
                timestamp: Date.now(),
                mode: this.currentMode
            };

            this.addMessageToChat(userMessage);
            userInput.value = '';
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
            this.clearAttachedFiles();

            // Show typing indicator
            this.showTypingIndicator();

            this.isGenerating = true;
            this.updateSendButton();

            let response;
            
            switch (this.currentMode) {
                case 'image':
                    response = await this.generateImage(message);
                    break;
                case 'voice':
                    response = await this.generateVoice(message);
                    break;
                case 'code':
                    response = await this.generateCode(message);
                    break;
                default:
                    response = await this.generateTextResponse(message, files);
            }

            this.hideTypingIndicator();
            
            const aiMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                mode: this.currentMode
            };

            this.addMessageToChat(aiMessage);
            
        } catch (error) {
            console.error('Error generating response:', error);
            this.hideTypingIndicator();
            this.showError('Не удалось получить ответ. Пожалуйста, попробуйте еще раз.');
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
            this.saveChatHistory();
            this.updateUI();
        }
    }

    async generateTextResponse(message, files = []) {
        if (!this.puterAI || !this.isOnline) {
            return this.generateFallbackResponse(message, files);
        }

        try {
            const systemPrompt = this.modeConfigs[this.currentMode].systemPrompt;
            const context = this.getConversationContext();
            
            let fullPrompt = `${systemPrompt}\n\nКонтекст разговора:\n${context}\n\nПользователь: ${message}`;
            
            if (files.length > 0) {
                fullPrompt += `\n\nПрикрепленные файлы: ${files.map(f => f.name).join(', ')}`;
            }

            const response = await this.puterAI.ai.chat(fullPrompt, {
                model: this.currentModel,
                max_tokens: 2000,
                temperature: this.currentMode === 'creative' ? 0.8 : 0.7
            });

            return response || this.generateFallbackResponse(message, files);
        } catch (error) {
            console.error('Error with Puter AI:', error);
            return this.generateFallbackResponse(message, files);
        }
    }

    generateFallbackResponse(message, files = []) {
        const responses = {
            normal: [
                "Я проанализировал ваш запрос. На основе доступной информации могу предложить следующее...",
                "Отличный вопрос! Вот что я могу рассказать по этой теме...",
                "Понимаю ваш интерес к этой теме. Вот подробный ответ...",
                "Это интересная задача. Давайте рассмотрим возможные решения..."
            ],
            creative: [
                "Вот креативная идея для вашего проекта...",
                "Предлагаю нестандартный подход к решению этой задачи...",
                "Как насчет такой творческой концепции?",
                "Вот инновационное решение, которое может вас заинтересовать..."
            ],
            code: [
                "Вот решение вашей задачи на коде...",
                "Предлагаю следующий код для реализации требуемой функциональности...",
                "Вот оптимизированное решение вашей programming задачи...",
                "Рассмотрим несколько подходов к реализации этого функционала..."
            ],
            image: [
                "На основе вашего описания, я бы создал изображение со следующими характеристиками...",
                "Вот детальное описание визуальной сцены согласно вашему запросу...",
                "Представляю концепцию изображения основанную на ваших требованиях...",
                "Вот как можно визуализировать вашу идею..."
            ],
            voice: [
                "Для генерации аудио по вашему запросу я бы использовал следующие параметры...",
                "Вот концепция звукового оформления согласно вашему описанию...",
                "Предлагаю следующий подход к созданию аудио контента...",
                "Вот детали звукового решения для вашей задачи..."
            ]
        };

        const modeResponses = responses[this.currentMode] || responses.normal;
        const randomResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];
        
        return `${randomResponse}\n\n*Примечание: Режим эмуляции. Для реальной генерации требуется подключение к AI-сервису.*`;
    }

    async generateImage(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🖼️ **Генерация изображения**\n\nОписание: ${description}\n\n*Для реальной генерации изображений необходимо подключение к AI-сервису.*`;
        }

        try {
            // Используем Puter AI для генерации изображений
            const imageResult = await this.puterAI.ai.imagine(description, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            return `🖼️ **Сгенерированное изображение**\n\n**Описание:** ${description}\n\n![Генерированное изображение](${imageResult.url})`;
        } catch (error) {
            console.error('Error generating image:', error);
            return `❌ **Ошибка генерации изображения**\n\nНе удалось сгенерировать изображение по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateVoice(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🎵 **Генерация аудио**\n\nОписание: ${description}\n\n*Для реальной генерации аудио необходимо подключение к AI-сервису.*`;
        }

        try {
            // Используем Puter AI для генерации голоса
            const audioResult = await this.puterAI.ai.txt2speech(description);
            
            return `🎵 **Сгенерированное аудио**\n\n**Описание:** ${description}\n\n<audio controls><source src="${audioResult.url}" type="audio/mpeg">Ваш браузер не поддерживает аудио элементы.</audio>`;
        } catch (error) {
            console.error('Error generating voice:', error);
            return `❌ **Ошибка генерации аудио**\n\nНе удалось сгенерировать аудио по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateCode(description) {
        if (!this.puterAI || !this.isOnline) {
            return `💻 **Генерация кода**\n\nЗадача: ${description}\n\n*Для реальной генерации кода необходимо подключение к AI-сервису.*`;
        }

        try {
            const response = await this.puterAI.ai.chat(
                `Напиши код для следующей задачи: ${description}. Предоставь полный, рабочий код с комментариями.`,
                { model: this.currentModel, max_tokens: 2000 }
            );

            const codeExample = response || `// Пример кода для: ${description}
function solution() {
    // Реализация вашей задачи
    console.log("Hello, World!");
    
    // Возвращаем результат
    return "Задача выполнена";
}

// Вызов функции
solution();`;

            return `💻 **Сгенерированный код**\n\n**Задача:** ${description}\n\n\`\`\`javascript\n${codeExample}\n\`\`\`\n\n*Код успешно сгенерирован. Не забудьте протестировать и адаптировать его под ваши нужды.*`;
        } catch (error) {
            console.error('Error generating code:', error);
            return `❌ **Ошибка генерации кода**\n\nНе удалось сгенерировать код по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или уточните задачу.`;
        }
    }

    addMessageToChat(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.updateMinimap();
        this.scrollToBottom();
        this.updateChatStats();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }

        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        this.highlightCodeBlocks(messageElement);
        this.addToMinimap(message);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role} ${message.mode !== 'normal' ? `message-${message.mode}` : ''}`;
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.timestamp = message.timestamp;

        let content = '';

        if (message.role === 'user') {
            content = `
                <div class="message-content">${this.escapeHtml(message.content)}</div>
                ${message.files.length > 0 ? this.renderAttachedFiles(message.files) : ''}
                <div class="message-actions">
                    <button class="action-btn" onclick="chat.copyMessage('${message.id}')" title="Копировать">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                    <button class="action-btn" onclick="chat.editMessage('${message.id}')" title="Редактировать">
                        <i class="ti ti-edit"></i>
                        Редактировать
                    </button>
                </div>
            `;
        } else {
            const renderedContent = marked.parse(message.content);
            content = `
                <div class="message-content">${renderedContent}</div>
                <div class="message-actions">
                    <button class="action-btn" onclick="chat.copyMessage('${message.id}')" title="Копировать">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                    <button class="action-btn" onclick="chat.regenerateMessage('${message.id}')" title="Перегенерировать">
                        <i class="ti ti-refresh"></i>
                        Перегенерировать
                    </button>
                    <button class="action-btn" onclick="chat.shareMessage('${message.id}')" title="Поделиться">
                        <i class="ti ti-share"></i>
                        Поделиться
                    </button>
                    <button class="action-btn speak-btn" onclick="chat.speakMessage('${message.id}')" title="Озвучить">
                        <i class="ti ti-speakerphone"></i>
                        Озвучить
                    </button>
                </div>
            `;
        }

        messageDiv.innerHTML = content;
        return messageDiv;
    }

    renderAttachedFiles(files) {
        if (!files || files.length === 0) return '';
        
        return files.map(file => `
            <div class="attached-file">
                <i class="ti ti-file"></i>
                <span>${this.escapeHtml(file.name)}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
        `).join('');
    }

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.typingIndicator = typingDiv;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    setMode(mode) {
        if (this.modeConfigs[mode]) {
            this.currentMode = mode;
            
            // Update UI
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-pressed', 'true');
            }
            
            // Update input placeholder
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.placeholder = this.modeConfigs[mode].placeholder;
            }
            
            // Update mode indicator
            const modeText = document.getElementById('currentModeText');
            if (modeText) {
                modeText.textContent = this.getModeDisplayName(mode);
            }

            this.showNotification(`Режим изменен на: ${this.getModeDisplayName(mode)}`);
        }
    }

    getModeDisplayName(mode) {
        const names = {
            normal: 'Обычный режим',
            creative: 'Креативный режим',
            voice: 'Генерация голоса',
            image: 'Генерация изображений',
            code: 'Режим программирования'
        };
        return names[mode] || 'Неизвестный режим';
    }

    // File handling methods
    handleFileUpload(files) {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;

        // Check total size
        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 50 * 1024 * 1024) { // 50MB total
            this.showError('Общий размер файлов превышает 50MB');
            return;
        }

        validFiles.forEach(file => {
            this.attachedFiles.push(file);
        });

        this.updateAttachedFilesDisplay();
        this.showNotification(`Добавлено файлов: ${validFiles.length}`, 'success');
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'application/pdf', 
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/json', 'text/markdown'
        ];
        
        if (file.size > maxSize) {
            this.showError(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|json|md|jpg|jpeg|png|gif|webp)$/i)) {
            this.showError(`Тип файла "${file.name}" не поддерживается.`);
            return false;
        }
        
        return true;
    }

    renderAttachedFile(file) {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        if (!attachedFilesContainer) return;

        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="ti ti-file"></i>
            <span>${this.escapeHtml(file.name)}</span>
            <span class="file-size">(${this.formatFileSize(file.size)})</span>
            <button class="remove-file" onclick="chat.removeAttachedFile('${this.escapeHtml(file.name)}')">
                <i class="ti ti-x"></i>
            </button>
        `;
        attachedFilesContainer.appendChild(fileElement);
    }

    removeAttachedFile(fileName) {
        this.attachedFiles = this.attachedFiles.filter(file => file.name !== fileName);
        this.updateAttachedFilesDisplay();
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    updateAttachedFilesDisplay() {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        if (!attachedFilesContainer) return;

        attachedFilesContainer.innerHTML = '';
        this.attachedFiles.forEach(file => this.renderAttachedFile(file));
        
        // Show/hide container
        attachedFilesContainer.style.display = this.attachedFiles.length > 0 ? 'flex' : 'none';
    }

    // UI utility methods
    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleClearInputButton() {
        const clearBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        
        if (clearBtn && userInput) {
            clearBtn.style.display = userInput.value.trim() ? 'flex' : 'none';
        }
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        if (!sendBtn) return;

        sendBtn.disabled = this.isGenerating;
        sendBtn.innerHTML = this.isGenerating ? 
            '<i class="ti ti-loader spin"></i>' : 
            '<i class="ti ti-send"></i>';
    }

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

    scrollToLastAIMessage() {
        const messages = document.querySelectorAll('.message-ai');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateUI() {
        this.updateMessageCount();
        this.updateChatStats();
        this.updateConnectionStatus();
    }

    updateMessageCount() {
        const count = this.messages.length;
        
        const messageCountEl = document.getElementById('messageCount');
        const footerMessageCountEl = document.getElementById('footerMessageCount');
        const sidebarMessageCountEl = document.getElementById('sidebarMessageCount');
        
        if (messageCountEl) messageCountEl.textContent = `${count} сообщений`;
        if (footerMessageCountEl) footerMessageCountEl.textContent = count;
        if (sidebarMessageCountEl) sidebarMessageCountEl.textContent = count;
    }

    updateChatStats() {
        const duration = Math.floor((Date.now() - this.chatStartTime) / 60000);
        const chatDurationEl = document.getElementById('chatDuration');
        if (chatDurationEl) {
            chatDurationEl.textContent = `${duration} мин`;
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const footerStatus = document.getElementById('footerStatus');
        const sidebarStatus = document.getElementById('sidebarStatus');
        
        if (this.isOnline) {
            if (statusElement) {
                statusElement.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
                statusElement.className = 'connection-status';
            }
            if (footerStatus) {
                footerStatus.innerHTML = '<i class="ti ti-circle-check"></i><span>Готов к работе</span>';
            }
            if (sidebarStatus) {
                sidebarStatus.textContent = '✅ Онлайн';
                sidebarStatus.className = 'info-value status-online';
            }
        } else {
            if (statusElement) {
                statusElement.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
                statusElement.className = 'connection-status offline';
            }
            if (footerStatus) {
                footerStatus.innerHTML = '<i class="ti ti-circle-x"></i><span>Офлайн режим</span>';
            }
            if (sidebarStatus) {
                sidebarStatus.textContent = '❌ Офлайн';
                sidebarStatus.className = 'info-value status-offline';
            }
        }
    }

    setOnlineStatus(online) {
        this.isOnline = online;
        this.updateConnectionStatus();
        
        if (online) {
            this.showNotification('Подключение восстановлено', 'success');
        } else {
            this.showNotification('Работаем в офлайн режиме', 'warning');
        }
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('khai-pro-theme', theme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
        
        this.showNotification(`Тема изменена на: ${theme === 'dark' ? 'Темная' : 'Светлая'}`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('khai-pro-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    // Fullscreen management
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showError('Не удалось перейти в полноэкранный режим');
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Chat management
    createNewChat() {
        const chatId = this.generateId();
        const chatName = `Чат ${this.chats.size + 1}`;
        
        this.chats.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.switchToChat(chatId);
        this.showNotification('Новый чат создан');
    }

    switchToChat(chatId) {
        if (this.chats.has(chatId)) {
            this.currentChatId = chatId;
            this.messages = [...this.chats.get(chatId).messages];
            this.renderChat();
            this.updateUI();
        }
    }

    clearChat() {
        if (this.messages.length === 0) {
            this.showNotification('Нет сообщений для очистки', 'warning');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.messages = [];
            this.chatStartTime = Date.now();
            this.renderChat();
            this.saveChatHistory();
            this.updateUI();
            this.showNotification('Чат очищен');
        }
    }

    exportChat() {
        if (this.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        try {
            const chatData = {
                version: '2.0.0',
                exportedAt: new Date().toISOString(),
                chat: {
                    id: this.currentChatId,
                    messageCount: this.messages.length,
                    duration: Math.floor((Date.now() - this.chatStartTime) / 60000)
                },
                messages: this.messages
            };

            const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khai-pro-chat-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат экспортирован успешно', 'success');
        } catch (error) {
            console.error('Error exporting chat:', error);
            this.showError('Ошибка при экспорте чата');
        }
    }

    // Search functionality
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        const searchClearBtn = document.getElementById('headerSearchClear');
        
        if (searchClearBtn) {
            searchClearBtn.style.display = term ? 'flex' : 'none';
        }
        
        this.highlightSearchTerms();
    }

    highlightSearchTerms() {
        const messages = document.querySelectorAll('.message-content');
        const term = this.searchTerm;
        
        messages.forEach(content => {
            const text = content.textContent || '';
            const html = content.innerHTML;
            
            if (term && text.toLowerCase().includes(term)) {
                const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
                const highlighted = html.replace(regex, '<mark class="search-highlight">$1</mark>');
                content.innerHTML = highlighted;
            } else {
                content.innerHTML = html.replace(/<mark class="search-highlight">(.*?)<\/mark>/gi, '$1');
            }
        });
    }

    // Voice input functionality
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showVoiceInputIndicator();
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                const userInput = document.getElementById('userInput');
                if (userInput) {
                    userInput.value = transcript;
                    this.autoResizeTextarea(userInput);
                    this.toggleClearInputButton();
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.hideVoiceInputIndicator();
                
                if (event.error !== 'aborted') {
                    this.showError(`Ошибка распознавания: ${event.error}`);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.hideVoiceInputIndicator();
            };
        } catch (error) {
            console.error('Error setting up speech recognition:', error);
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showError('Не удалось запустить голосовой ввод');
            }
        }
    }

    showVoiceInputIndicator() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
        }
    }

    hideVoiceInputIndicator() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
        }
    }

    // Text-to-speech functionality
    speakMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'assistant') return;

        if (this.isSpeaking) {
            this.stopSpeech();
            return;
        }

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const speakBtn = messageElement?.querySelector('.speak-btn');
        
        if (speakBtn) {
            speakBtn.classList.add('speaking');
            speakBtn.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
        }

        this.speakText(message.content, speakBtn);
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showError('Озвучивание текста не поддерживается в вашем браузере');
            return;
        }

        try {
            this.stopSpeech();

            // Extract plain text from markdown
            const plainText = text
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/`([^`]+)`/g, '$1') // Remove inline code
                .replace(/#{1,6}\s?/g, '') // Remove headers
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1') // Remove italic
                .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
                .replace(/&[#\w]+;/g, '') // Remove HTML entities
                .replace(/\n+/g, '. ') // Replace newlines with periods
                .trim();

            if (!plainText) {
                this.showError('Нет текста для озвучивания');
                return;
            }

            this.currentUtterance = new SpeechSynthesisUtterance(plainText);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.8;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
            }

            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                }
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                }
                this.showError('Ошибка при озвучивании текста');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showError('Ошибка при озвучивании текста');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
        
        // Reset all speak buttons
        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.classList.remove('speaking');
            btn.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
        });
    }

    // Message actions
    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const text = message.role === 'user' ? 
            message.content : 
            message.content.replace(/```[\s\S]*?```/g, '').replace(/`([^`]+)`/g, '$1');

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            this.showError('Не удалось скопировать сообщение');
        });
    }

    editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'user') return;

        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = message.content;
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
            userInput.focus();
            
            // Remove the message
            this.messages = this.messages.filter(m => m.id !== messageId);
            this.renderChat();
            this.saveChatHistory();
            this.updateUI();
        }
    }

    regenerateMessage(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1 || this.messages[messageIndex].role !== 'assistant') return;

        // Find the previous user message
        const userMessageIndex = this.messages.findIndex((m, i) => 
            i < messageIndex && m.role === 'user'
        );

        if (userMessageIndex !== -1) {
            const userMessage = this.messages[userMessageIndex];
            
            // Remove all messages after the user message
            this.messages = this.messages.slice(0, userMessageIndex + 1);
            this.renderChat();
            
            // Regenerate response
            setTimeout(() => {
                this.sendMessage();
            }, 100);
        }
    }

    shareMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const shareText = message.role === 'user' ? 
            `Мой вопрос: ${message.content}` : 
            `Ответ ИИ: ${message.content.replace(/```[\s\S]*?```/g, '').replace(/`([^`]+)`/g, '$1')}`;

        if (navigator.share) {
            navigator.share({
                title: 'Сообщение из KHAI Pro Chat',
                text: shareText
            }).catch(err => {
                console.error('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Сообщение скопировано для отправки', 'success');
        }).catch(err => {
            console.error('Failed to copy for sharing:', err);
            this.showError('Не удалось подготовить сообщение для отправки');
        });
    }

    // Minimap functionality
    updateMinimap() {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        minimap.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot minimap-${message.role}`;
            dot.title = `${message.role === 'user' ? 'Вы' : 'ИИ'}: ${new Date(message.timestamp).toLocaleTimeString()}`;
            dot.addEventListener('click', () => {
                this.scrollToMessageIndex(index);
            });
            minimap.appendChild(dot);
        });
    }

    updateMinimapViewport() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimapViewport = document.getElementById('minimapViewport');
        if (!messagesContainer || !minimapViewport) return;

        const scrollPercentage = messagesContainer.scrollTop / (messagesContainer.scrollHeight - messagesContainer.clientHeight);
        const viewportHeight = Math.min(100, (messagesContainer.clientHeight / messagesContainer.scrollHeight) * 100);
        
        minimapViewport.style.height = `${viewportHeight}%`;
        minimapViewport.style.top = `${scrollPercentage * (100 - viewportHeight)}%`;
    }

    addToMinimap(message) {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        const dot = document.createElement('div');
        dot.className = `minimap-dot minimap-${message.role}`;
        dot.title = `${message.role === 'user' ? 'Вы' : 'ИИ'}: ${new Date(message.timestamp).toLocaleTimeString()}`;
        dot.addEventListener('click', () => {
            this.scrollToMessageIndex(this.messages.length - 1);
        });
        minimap.appendChild(dot);
    }

    scrollToMessageIndex(index) {
        const messages = document.querySelectorAll('.message');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Context menu
    showContextMenu(event, messageElement) {
        this.hideContextMenu();

        const messageId = messageElement.dataset.messageId;
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;

        const menuItems = [
            { icon: 'copy', text: 'Копировать', action: () => this.copyMessage(messageId) },
            { icon: 'share', text: 'Поделиться', action: () => this.shareMessage(messageId) }
        ];

        if (message.role === 'assistant') {
            menuItems.push(
                { icon: 'speakerphone', text: 'Озвучить', action: () => this.speakMessage(messageId) },
                { icon: 'refresh', text: 'Перегенерировать', action: () => this.regenerateMessage(messageId) }
            );
        }

        if (message.role === 'user') {
            menuItems.push(
                { icon: 'edit', text: 'Редактировать', action: () => this.editMessage(messageId) }
            );
        }

        menuItems.push(
            { icon: 'trash', text: 'Удалить', action: () => this.deleteMessage(messageId) }
        );

        contextMenu.innerHTML = menuItems.map(item => `
            <button class="context-menu-item" onclick="chat.hideContextMenu(); ${item.action.toString().replace('chat.', '')}">
                <i class="ti ti-${item.icon}"></i>
                <span>${item.text}</span>
            </button>
        `).join('');

        document.body.appendChild(contextMenu);
        this.currentContextMenu = contextMenu;
    }

    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    }

    deleteMessage(messageId) {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.renderChat();
        this.saveChatHistory();
        this.updateUI();
        this.showNotification('Сообщение удалено');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    document.getElementById('headerSearch')?.focus();
                    break;
                case 'n':
                    event.preventDefault();
                    this.createNewChat();
                    break;
                case 'd':
                    event.preventDefault();
                    this.clearChat();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportChat();
                    break;
                case '/':
                    event.preventDefault();
                    document.getElementById('userInput')?.focus();
                    break;
            }
        }

        if (event.key === 'Escape') {
            this.hideContextMenu();
            this.hideEmojiPicker();
        }
    }

    // Emoji picker
    setupEmojiPicker() {
        const emojiCategories = {
            'faces': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
            'gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
            'objects': ['💻', '📱', '⌚', '📷', '🎥', '📹', '📼', '💾', '💿', '📀', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫'],
            'symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭']
        };

        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        let emojiHTML = '';
        for (const [category, emojis] of Object.entries(emojiCategories)) {
            emojiHTML += `<div class="emoji-category">
                <div class="emoji-category-title">${category}</div>
                <div class="emoji-grid">`;
            
            emojis.forEach(emoji => {
                emojiHTML += `<span class="emoji" data-emoji="${emoji}">${emoji}</span>`;
            });
            
            emojiHTML += `</div></div>`;
        }

        emojiPicker.innerHTML = emojiHTML;

        // Add click handlers for emojis
        emojiPicker.querySelectorAll('.emoji').forEach(emojiEl => {
            emojiEl.addEventListener('click', () => {
                const emoji = emojiEl.dataset.emoji;
                this.insertEmoji(emoji);
                this.hideEmojiPicker();
            });
        });
    }

    toggleEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        if (emojiPicker.classList.contains('show')) {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker(button);
        }
    }

    showEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        const rect = button.getBoundingClientRect();
        emojiPicker.style.top = `${rect.bottom + window.scrollY}px`;
        emojiPicker.style.left = `${rect.left + window.scrollX}px`;
        emojiPicker.classList.add('show');

        document.addEventListener('click', this.emojiPickerOutsideClick);
    }

    hideEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker) {
            emojiPicker.classList.remove('show');
        }
        document.removeEventListener('click', this.emojiPickerOutsideClick);
    }

    emojiPickerOutsideClick(event) {
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiBtn = document.getElementById('emojiBtn');
        
        if (emojiPicker && 
            !emojiPicker.contains(event.target) && 
            !emojiBtn.contains(event.target)) {
            this.hideEmojiPicker();
        }
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            const start = userInput.selectionStart;
            const end = userInput.selectionEnd;
            const text = userInput.value;
            userInput.value = text.substring(0, start) + emoji + text.substring(end);
            userInput.selectionStart = userInput.selectionEnd = start + emoji.length;
            userInput.focus();
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${type === 'success' ? 'circle-check' : type === 'warning' ? 'alert-triangle' : type === 'error' ? 'circle-x' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ti ti-x"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    highlightCodeBlocks(element) {
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (block.className) {
                const language = block.className.replace('language-', '');
                block.classList.add('hljs');
                block.classList.add(`language-${language}`);
            }
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
            copyBtn.title = 'Копировать код';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    this.showNotification('Код скопирован в буфер обмена', 'success');
                }).catch(err => {
                    console.error('Failed to copy code:', err);
                    this.showError('Не удалось скопировать код');
                });
            });

            const pre = block.parentElement;
            if (pre && !pre.querySelector('.copy-code-btn')) {
                pre.style.position = 'relative';
                pre.appendChild(copyBtn);
            }
        });
    }

    getConversationContext() {
        if (this.messages.length === 0) return '';
        
        const recentMessages = this.messages.slice(-6); // Last 6 messages
        return recentMessages.map(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 200 ? 
                msg.content.substring(0, 200) + '...' : msg.content;
            return `${role}: ${content}`;
        }).join('\n');
    }

    // Service Worker for offline functionality
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered:', registration);
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }
    }

    // Chat duration timer
    startChatDurationTimer() {
        this.durationTimer = setInterval(() => {
            this.updateChatStats();
        }, 60000); // Update every minute
    }

    // Welcome message
    showWelcomeMessage() {
        if (this.messages.length > 0) return;

        const welcomeMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `# 🚀 Добро пожаловать в KHAI Pro Chat!

## ✨ Возможности:

### 🤖 Умные режимы работы:
- **💬 Обычный режим** - для повседневных вопросов и задач
- **🎨 Креативный режим** - для генерации идей и творческих решений
- **🖼️ Генерация изображений** - создание картинок по описанию
- **🎵 Генерация голоса** - создание аудио контента
- **💻 Режим программирования** - написание и анализ кода

### 🛠️ Функциональность:
- **📁 Работа с файлами** - загрузка и анализ изображений, документов
- **🎤 Голосовой ввод** - говорите вместо печати
- **🔊 Озвучивание ответов** - слушайте ответы ИИ
- **🔍 Поиск по чату** - быстрый поиск по истории сообщений
- **📊 Мини-карта** - навигация по длинным чатам
- **🎨 Темы** - светлая и темная тема оформления
- **📱 Адаптивный дизайн** - работает на всех устройствах

### ⚡ Быстрые действия:
- \`Ctrl+K\` - поиск по чату
- \`Ctrl+N\` - новый чат
- \`Ctrl+D\` - очистить чат
- \`Ctrl+E\` - экспорт чата
- \`Ctrl+/\` - фокус на ввод сообщения

**Начните общение, отправив сообщение или выбрав нужный режим работы!**`,
            timestamp: Date.now(),
            mode: 'normal'
        };

        this.addMessageToChat(welcomeMessage);
    }

    showHelp() {
        const helpMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `# 🆘 Помощь по KHAI Pro Chat

## 📖 Основные возможности:

### 🔄 Смена режимов:
Нажмите на кнопки режимов в нижней панели для переключения между:
- **💬 Обычный** - общие вопросы и задачи
- **🎨 Креативный** - идеи и творческие решения  
- **🖼️ Изображения** - генерация и анализ картинок
- **🎵 Голос** - создание аудио контента
- **💻 Код** - программирование и анализ кода

### 📁 Работа с файлами:
- Нажмите **📎** для прикрепления файлов
- Поддерживаются: изображения, текстовые файлы, PDF, документы
- Максимальный размер файла: 10MB
- Можно прикреплять несколько файлов одновременно

### 🎤 Голосовой ввод:
- Нажмите **🎤** для начала записи голоса
- Говорите четко на русском языке
- Нажмите еще раз для остановки

### 🔊 Озвучивание:
- Нажмите кнопку **🔊** в сообщении ИИ для озвучивания
- Поддерживается русский язык
- Можно остановить воспроизведение повторным нажатием

### 🔍 Поиск по чату:
- Используйте поиск в верхней панели
- Найденные совпадения подсвечиваются
- \`Ctrl+K\` - быстрый доступ к поиску

### 💾 Экспорт чата:
- Нажмите **📥** для экспорта всей истории
- Сохраняется в формате JSON
- Включает все сообщения и метаданные

## ⌨️ Горячие клавиши:
- \`Ctrl+N\` - Новый чат
- \`Ctrl+D\` - Очистить чат
- \`Ctrl+E\` - Экспорт чата
- \`Ctrl+K\` - Поиск
- \`Ctrl+/\` - Фокус на ввод
- \`Escape\` - Закрыть меню/поиск

## 🛠️ Дополнительные функции:
- **Мини-карта** - быстрая навигация по длинным чатам
- **Контекстное меню** - правый клик на сообщении
- **Темы** - переключение между светлой и темной темой
- **Полноэкранный режим** - для фокусировки на работе

**Нужна дополнительная помощь? Просто спросите!**`,
            timestamp: Date.now(),
            mode: 'normal'
        };

        this.addMessageToChat(helpMessage);
    }

    showSettings() {
        const settingsMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `# ⚙️ Настройки KHAI Pro Chat

## 🎨 Внешний вид:
- **Тема:** ${document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙 Темная' : '☀️ Светлая'}
- **Полноэкранный режим:** Доступен
- **Мини-карта:** ${document.getElementById('minimap') ? 'Включена' : 'Отключена'}

## 🤖 Модель ИИ:
- **Текущая модель:** ${this.models[this.currentModel]?.name || this.currentModel}
- **Описание:** ${this.models[this.currentModel]?.description || 'Неизвестная модель'}

## 💾 Данные:
- **Сообщений в чате:** ${this.messages.length}
- **Продолжительность чата:** ${Math.floor((Date.now() - this.chatStartTime) / 60000)} минут
- **Статус соединения:** ${this.isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}

## 🔧 Управление:
- **Авто-сохранение:** Включено
- **Уведомления:** Включены
- **Голосовые функции:** ${'speechSynthesis' in window ? 'Доступны' : 'Недоступны'}
- **Распознавание речи:** ${this.recognition ? 'Доступно' : 'Недоступно'}

### Для изменения настроек:
- **Смена темы:** Нажмите кнопку темы в верхней панели
- **Смена модели:** Нажмите на текущую модель в верхней панели
- **Полноэкранный режим:** Нажмите кнопку полноэкранного режима

**Настройки автоматически сохраняются в вашем браузере.**`,
            timestamp: Date.now(),
            mode: 'normal'
        };

        this.addMessageToChat(settingsMessage);
    }

    showModelSelection() {
        const modelSelection = document.createElement('div');
        modelSelection.className = 'model-selection';
        modelSelection.innerHTML = `
            <div class="model-selection-header">
                <h3>Выбор модели ИИ</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="model-list">
                ${Object.entries(this.models).map(([key, model]) => `
                    <div class="model-item ${key === this.currentModel ? 'selected' : ''}" 
                         onclick="chat.selectModel('${key}'); this.parentElement.parentElement.remove()">
                        <div class="model-info">
                            <div class="model-name">${model.name}</div>
                            <div class="model-description">${model.description}</div>
                        </div>
                        ${key === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(modelSelection);
    }

    selectModel(modelKey) {
        if (this.models[modelKey]) {
            this.currentModel = modelKey;
            this.showNotification(`Модель изменена на: ${this.models[modelKey].name}`);
            
            const modelBtn = document.getElementById('modelSelectBtn');
            if (modelBtn) {
                modelBtn.textContent = this.models[modelKey].name;
            }
        }
    }

    // Render entire chat
    renderChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
        this.updateMinimap();
        this.scrollToBottom();
    }

    // Save/load chat history
    saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                currentMode: this.currentMode,
                currentModel: this.currentModel,
                chatStartTime: this.chatStartTime,
                updatedAt: Date.now()
            };
            
            localStorage.setItem('khai-pro-chat-data', JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-pro-chat-data');
            if (saved) {
                const chatData = JSON.parse(saved);
                this.messages = chatData.messages || [];
                this.currentMode = chatData.currentMode || 'normal';
                this.currentModel = chatData.currentModel || 'gpt-4';
                this.chatStartTime = chatData.chatStartTime || Date.now();
                
                this.renderChat();
                this.setMode(this.currentMode);
                
                if (chatData.currentModel && this.models[chatData.currentModel]) {
                    this.selectModel(chatData.currentModel);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Handle resize
    handleResize() {
        this.updateMinimapViewport();
        this.autoResizeTextarea(document.getElementById('userInput'));
    }

    // Handle paste event for images
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        const files = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            this.handleFileUpload(files);
        }
    }

    // Drop zone for file uploads
    showDropZone() {
        let dropZone = document.getElementById('dropZone');
        if (!dropZone) {
            dropZone = document.createElement('div');
            dropZone.id = 'dropZone';
            dropZone.innerHTML = `
                <div class="drop-zone-content">
                    <i class="ti ti-upload"></i>
                    <p>Перетащите файлы для загрузки</p>
                </div>
            `;
            document.body.appendChild(dropZone);
        }
        dropZone.classList.add('active');
    }

    hideDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.classList.remove('active');
        }
    }

    // Toggle sidebar menu
    toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    // Cleanup
    destroy() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
        }
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.stopSpeech();
        this.hideTypingIndicator();
        this.hideContextMenu();
        this.hideEmojiPicker();
        
        this.saveChatHistory();
    }
}

// Initialize the chat when DOM is loaded
let chat;

document.addEventListener('DOMContentLoaded', () => {
    try {
        chat = new KHAIProChat();
        
        // Load saved theme
        const savedTheme = localStorage.getItem('khai-pro-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
        
        console.log('KHAI Pro Chat initialized successfully');
    } catch (error) {
        console.error('Failed to initialize KHAI Pro Chat:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="ti ti-alert-triangle"></i>
                <h3>Ошибка загрузки приложения</h3>
                <p>Не удалось инициализировать KHAI Pro Chat. Пожалуйста, обновите страницу.</p>
                <button onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Make chat globally available for HTML onclick handlers
window.chat = chat;

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (chat) {
        chat.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIProChat;
}
