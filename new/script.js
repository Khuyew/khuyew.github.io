// Enhanced KHAI Pro AI Chat Application
class KHAIProChat {
    constructor() {
        this.initializeApp();
        this.bindEvents();
        this.loadSettings();
        this.initializeAI();
    }

    initializeApp() {
        // App state
        this.state = {
            currentChat: 'main',
            chats: {},
            messages: [],
            currentMode: 'normal',
            isGenerating: false,
            isOnline: true,
            theme: 'dark',
            currentModel: 'gpt-4-turbo',
            attachedFiles: [],
            searchQuery: '',
            isSidebarOpen: false,
            isFullscreen: false,
            voiceRecognition: null,
            isListening: false
        };

        // AI models configuration
        this.models = {
            'gpt-4-turbo': {
                name: 'GPT-4 Turbo',
                icon: 'ti ti-brain',
                description: 'Самый продвинутый модель от OpenAI',
                maxTokens: 128000
            },
            'gpt-4': {
                name: 'GPT-4',
                icon: 'ti ti-sparkles',
                description: 'Мощная модель для сложных задач',
                maxTokens: 8192
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                icon: 'ti ti-zap',
                description: 'Быстрая и эффективная модель',
                maxTokens: 4096
            },
            'claude-3-opus': {
                name: 'Claude 3 Opus',
                icon: 'ti ti-cpu',
                description: 'Самый мощный модель от Anthropic',
                maxTokens: 200000
            },
            'gemini-pro': {
                name: 'Gemini Pro',
                icon: 'ti ti-star',
                description: 'Продвинутый модель от Google',
                maxTokens: 32768
            }
        };

        // DOM elements cache
        this.elements = {
            // Header
            headerSearch: document.getElementById('headerSearch'),
            headerSearchClear: document.getElementById('headerSearchClear'),
            connectionStatus: document.getElementById('connectionStatus'),
            themeToggle: document.getElementById('themeToggle'),
            modelSelectBtn: document.getElementById('modelSelectBtn'),
            menuToggle: document.getElementById('menuToggle'),
            fullscreenToggle: document.getElementById('fullscreenToggle'),

            // Main chat
            messagesContainer: document.getElementById('messagesContainer'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            clearInputBtn: document.getElementById('clearInputBtn'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            emojiBtn: document.getElementById('emojiBtn'),
            fileInput: document.getElementById('fileInput'),
            attachImageBtn: document.getElementById('attachImageBtn'),
            attachFileBtn: document.getElementById('attachFileBtn'),
            attachedFiles: document.getElementById('attachedFiles'),

            // Sidebar
            chatMinimap: document.getElementById('chatMinimap'),
            minimapContent: document.getElementById('minimapContent'),
            minimapViewport: document.getElementById('minimapViewport'),
            minimapToggle: document.getElementById('minimapToggle'),
            scrollToTop: document.getElementById('scrollToTop'),
            scrollToLastAI: document.getElementById('scrollToLastAI'),
            scrollToBottom: document.getElementById('scrollToBottom'),
            messageCount: document.getElementById('messageCount'),
            chatDuration: document.getElementById('chatDuration'),

            // Mode buttons
            normalModeBtn: document.getElementById('normalModeBtn'),
            creativeModeBtn: document.getElementById('creativeModeBtn'),
            generateVoiceBtn: document.getElementById('generateVoiceBtn'),
            generateImageBtn: document.getElementById('generateImageBtn'),
            codeModeBtn: document.getElementById('codeModeBtn'),
            modeIndicator: document.getElementById('modeIndicator'),
            currentModeText: document.getElementById('currentModeText'),

            // Action buttons
            helpBtn: document.getElementById('helpBtn'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            exportBtn: document.getElementById('exportBtn'),
            quickNewChat: document.getElementById('quickNewChat'),
            quickDownload: document.getElementById('quickDownload'),
            quickSettings: document.getElementById('quickSettings'),

            // Footer
            currentChatName: document.getElementById('currentChatName'),
            footerMessageCount: document.getElementById('footerMessageCount'),
            currentModelInfo: document.getElementById('currentModelInfo'),
            footerStatus: document.getElementById('footerStatus'),

            // Sidebar menu
            sidebarMenu: document.getElementById('sidebarMenu'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarClose: document.getElementById('sidebarClose'),
            sidebarSearch: document.getElementById('sidebarSearch'),
            chatList: document.getElementById('chatList'),
            chatsCount: document.getElementById('chatsCount'),
            newChatBtn: document.getElementById('newChatBtn'),
            importChatBtn: document.getElementById('importChatBtn'),
            sidebarModelInfo: document.getElementById('sidebarModelInfo'),
            sidebarMessageCount: document.getElementById('sidebarMessageCount'),
            sidebarStatus: document.getElementById('sidebarStatus'),

            // Quick access
            qaNewChat: document.getElementById('qaNewChat'),
            qaTemplates: document.getElementById('qaTemplates'),
            qaSettings: document.getElementById('qaSettings'),
            qaHelp: document.getElementById('qaHelp'),

            // Emoji picker
            emojiPicker: document.getElementById('emojiPicker'),
            emojiGrid: document.getElementById('emojiGrid'),

            // Context menu
            contextMenu: document.getElementById('contextMenu')
        };

        // Initialize UI
        this.updateModelDisplay();
        this.setupEmojiPicker();
        this.setupVoiceRecognition();
        this.setupFileHandling();
        this.setupMinimap();
        this.setupAutoResize();
        this.checkConnection();
        
        // Load initial chat
        this.loadChat(this.state.currentChat);
    }

    bindEvents() {
        // Header events
        this.elements.headerSearch.addEventListener('input', this.handleSearch.bind(this));
        this.elements.headerSearchClear.addEventListener('click', this.clearSearch.bind(this));
        this.elements.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        this.elements.modelSelectBtn.addEventListener('click', this.showModelSelector.bind(this));
        this.elements.menuToggle.addEventListener('click', this.toggleSidebar.bind(this));
        this.elements.fullscreenToggle.addEventListener('click', this.toggleFullscreen.bind(this));

        // Input events
        this.elements.userInput.addEventListener('input', this.handleInputChange.bind(this));
        this.elements.userInput.addEventListener('keydown', this.handleInputKeydown.bind(this));
        this.elements.sendBtn.addEventListener('click', this.sendMessage.bind(this));
        this.elements.clearInputBtn.addEventListener('click', this.clearInput.bind(this));
        this.elements.voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        this.elements.emojiBtn.addEventListener('click', this.toggleEmojiPicker.bind(this));
        this.elements.attachImageBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.attachFileBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Mode events
        this.elements.normalModeBtn.addEventListener('click', () => this.setMode('normal'));
        this.elements.creativeModeBtn.addEventListener('click', () => this.setMode('creative'));
        this.elements.generateVoiceBtn.addEventListener('click', () => this.setMode('voice'));
        this.elements.generateImageBtn.addEventListener('click', () => this.setMode('image'));
        this.elements.codeModeBtn.addEventListener('click', () => this.setMode('code'));

        // Action events
        this.elements.helpBtn.addEventListener('click', this.showHelp.bind(this));
        this.elements.clearChatBtn.addEventListener('click', this.clearChat.bind(this));
        this.elements.exportBtn.addEventListener('click', this.exportChat.bind(this));
        this.elements.quickNewChat.addEventListener('click', this.createNewChat.bind(this));
        this.elements.quickDownload.addEventListener('click', this.downloadChat.bind(this));
        this.elements.quickSettings.addEventListener('click', this.showSettings.bind(this));

        // Navigation events
        this.elements.scrollToTop.addEventListener('click', () => this.scrollToTop());
        this.elements.scrollToLastAI.addEventListener('click', () => this.scrollToLastAIMessage());
        this.elements.scrollToBottom.addEventListener('click', () => this.scrollToBottom());

        // Sidebar menu events
        this.elements.sidebarClose.addEventListener('click', this.closeSidebar.bind(this));
        this.elements.sidebarOverlay.addEventListener('click', this.closeSidebar.bind(this));
        this.elements.sidebarSearch.addEventListener('input', this.handleSidebarSearch.bind(this));
        this.elements.newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        this.elements.importChatBtn.addEventListener('click', this.importChat.bind(this));

        // Quick access events
        this.elements.qaNewChat.addEventListener('click', this.createNewChat.bind(this));
        this.elements.qaTemplates.addEventListener('click', this.showTemplates.bind(this));
        this.elements.qaSettings.addEventListener('click', this.showSettings.bind(this));
        this.elements.qaHelp.addEventListener('click', this.showHelp.bind(this));

        // Global events
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('online', () => this.setOnlineStatus(true));
        window.addEventListener('offline', () => this.setOnlineStatus(false));

        // Context menu
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('click', this.closeContextMenu.bind(this));

        // Puter AI events
        if (typeof puter !== 'undefined') {
            puter.on('ready', this.initializePuterAI.bind(this));
        }
    }

    // Enhanced Model Management
    updateModelDisplay() {
        const model = this.models[this.state.currentModel];
        if (model) {
            this.elements.modelSelectBtn.innerHTML = `<i class="${model.icon}"></i>`;
            this.elements.modelSelectBtn.title = model.name;
            this.elements.currentModelInfo.textContent = model.name;
            this.elements.sidebarModelInfo.textContent = model.name;
        }
    }

    showModelSelector(event) {
        // Create model selector dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'context-menu active';
        dropdown.style.position = 'absolute';
        dropdown.style.top = `${event.target.offsetTop + event.target.offsetHeight + 8}px`;
        dropdown.style.left = `${event.target.offsetLeft}px`;
        dropdown.style.minWidth = '200px';

        Object.entries(this.models).forEach(([id, model]) => {
            const item = document.createElement('button');
            item.className = 'context-menu-item';
            item.innerHTML = `
                <i class="${model.icon}"></i>
                <div style="flex: 1; text-align: left;">
                    <div style="font-weight: 600;">${model.name}</div>
                    <div style="font-size: 12px; color: var(--text-tertiary);">${model.description}</div>
                </div>
                ${this.state.currentModel === id ? '<i class="ti ti-check" style="color: var(--accent-primary);"></i>' : ''}
            `;
            item.addEventListener('click', () => {
                this.state.currentModel = id;
                this.updateModelDisplay();
                this.saveSettings();
                dropdown.remove();
            });
            dropdown.appendChild(item);
        });

        document.body.appendChild(dropdown);

        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== this.elements.modelSelectBtn) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }

    // Enhanced Input Handling
    handleInputChange() {
        const value = this.elements.userInput.value.trim();
        this.elements.clearInputBtn.style.display = value ? 'flex' : 'none';
        
        // Auto-resize textarea
        this.autoResizeTextarea();
        
        // Update send button state
        this.elements.sendBtn.disabled = !value && this.state.attachedFiles.length === 0;
    }

    autoResizeTextarea() {
        const textarea = this.elements.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    handleInputKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    clearInput() {
        this.elements.userInput.value = '';
        this.handleInputChange();
        this.elements.userInput.focus();
    }

    // Enhanced Message Handling
    async sendMessage() {
        const message = this.elements.userInput.value.trim();
        const files = this.state.attachedFiles;

        if (!message && files.length === 0) return;

        // Add user message
        this.addMessage('user', message, files);

        // Clear input
        this.clearInput();
        this.state.attachedFiles = [];
        this.updateAttachedFiles();

        // Show typing indicator
        this.showTypingIndicator();

        // Generate AI response
        try {
            const response = await this.generateAIResponse(message, files);
            this.hideTypingIndicator();
            this.addMessage('ai', response, [], this.state.currentMode);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', `Ошибка: ${error.message}`);
            console.error('AI Response Error:', error);
        }

        // Update UI
        this.updateStats();
        this.updateMinimap();
    }

    addMessage(role, content, files = [], mode = 'normal') {
        const message = {
            id: Date.now().toString(),
            role,
            content,
            files,
            mode,
            timestamp: new Date(),
            model: role === 'ai' ? this.state.currentModel : null
        };

        this.state.messages.push(message);
        this.renderMessage(message);
        this.saveChat();
        this.scrollToBottom();

        return message;
    }

    renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${message.role} ${message.mode !== 'normal' ? message.mode : ''}`;
        messageEl.dataset.messageId = message.id;

        const timeString = message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let avatar, header;
        
        if (message.role === 'user') {
            avatar = '<div class="message-avatar">👤</div>';
            header = `
                <div class="message-header">
                    <span>Вы</span>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
        } else if (message.role === 'ai') {
            const model = this.models[message.model] || this.models[this.state.currentModel];
            avatar = `<div class="message-avatar"><i class="${model.icon}"></i></div>`;
            header = `
                <div class="message-header">
                    <span>${model.name}</span>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
        } else if (message.role === 'error') {
            avatar = '<div class="message-avatar">❌</div>';
            header = `
                <div class="message-header">
                    <span>Ошибка</span>
                    <span class="message-time">${timeString}</span>
                </div>
            `;
        }

        let content = '';
        if (message.files && message.files.length > 0) {
            content += this.renderAttachedFiles(message.files);
        }

        if (message.content) {
            if (message.role === 'ai' || message.role === 'error') {
                content += this.renderMarkdown(message.content);
            } else {
                content += `<div class="message-text">${this.escapeHtml(message.content)}</div>`;
            }
        }

        const actions = this.renderMessageActions(message);

        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content">
                ${header}
                ${content}
                ${actions}
            </div>
        `;

        this.elements.messagesContainer.appendChild(messageEl);
        
        // Highlight code blocks
        this.highlightCodeBlocks(messageEl);
    }

    renderMarkdown(content) {
        try {
            return marked.parse(content, {
                breaks: true,
                gfm: true,
                highlight: (code, language) => {
                    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                    return hljs.highlight(code, { language: validLanguage }).value;
                }
            });
        } catch (error) {
            return `<div class="message-text">${this.escapeHtml(content)}</div>`;
        }
    }

    renderAttachedFiles(files) {
        return files.map(file => `
            <div class="attached-file">
                <i class="ti ti-file"></i>
                <span>${file.name}</span>
                <button class="remove-file" onclick="app.removeAttachedFile('${file.id}')">
                    <i class="ti ti-x"></i>
                </button>
            </div>
        `).join('');
    }

    renderMessageActions(message) {
        if (message.role === 'error') return '';

        return `
            <div class="message-actions">
                <button class="message-action" onclick="app.copyMessage('${message.id}')" title="Копировать">
                    <i class="ti ti-copy"></i>
                    <span>Копировать</span>
                </button>
                <button class="message-action" onclick="app.regenerateMessage('${message.id}')" title="Перегенерировать">
                    <i class="ti ti-refresh"></i>
                    <span>Перегенерировать</span>
                </button>
                ${message.role === 'ai' ? `
                    <button class="message-action" onclick="app.rateMessage('${message.id}', 'like')" title="Нравится">
                        <i class="ti ti-thumb-up"></i>
                    </button>
                    <button class="message-action" onclick="app.rateMessage('${message.id}', 'dislike')" title="Не нравится">
                        <i class="ti ti-thumb-down"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }

    // Enhanced AI Integration
    async generateAIResponse(message, files = []) {
        this.state.isGenerating = true;
        this.updateSendButton();

        try {
            let prompt = message;
            
            // Add mode-specific instructions
            switch (this.state.currentMode) {
                case 'creative':
                    prompt = `Будь креативным и вдохновляющим. Предоставь развернутый, творческий ответ:\n\n${message}`;
                    break;
                case 'code':
                    prompt = `Проанализируй и предоставь код с комментариями. Будь точным и техническим:\n\n${message}`;
                    break;
                case 'voice':
                    prompt = `Создай текст для озвучивания. Будь естественным и разговорным:\n\n${message}`;
                    break;
                case 'image':
                    prompt = `Опиши изображение подробно и художественно:\n\n${message}`;
                    break;
            }

            // Use Puter AI SDK
            if (typeof puter !== 'undefined' && puter.ai) {
                const response = await puter.ai.chat(prompt, {
                    model: this.state.currentModel,
                    max_tokens: this.models[this.state.currentModel]?.maxTokens || 4000
                });
                return response;
            } else {
                // Fallback to mock response
                return this.generateMockResponse(prompt, this.state.currentMode);
            }
        } finally {
            this.state.isGenerating = false;
            this.updateSendButton();
        }
    }

    generateMockResponse(prompt, mode) {
        const responses = {
            normal: "Я проанализировал ваш запрос и готов предоставить подробный ответ с учетом всех указанных аспектов.",
            creative: "✨ Позвольте мне нарисовать вам картину словами... Это будет удивительное путешествие в мир творчества и вдохновения!",
            code: "```javascript\n// Оптимальное решение вашей задачи\nfunction optimalSolution(input) {\n    // Реализация с лучшими практиками\n    return processedResult;\n}\n```",
            voice: "Я подготовил естественный и плавный текст, который идеально подойдет для озвучивания. Он звучит так, как будто его говорит живой человек.",
            image: "🖼️ Представьте себе: яркие цвета, гармоничные формы, игра света и тени... Это изображение рассказывает целую историю!"
        };

        return responses[mode] || responses.normal;
    }

    // Enhanced Mode Management
    setMode(mode) {
        this.state.currentMode = mode;
        
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeBtn = document.getElementById(`${mode}ModeBtn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }

        // Update mode indicator
        const modeTexts = {
            normal: 'Обычный режим',
            creative: 'Креативный режим',
            voice: 'Генерация голоса',
            image: 'Генерация изображений',
            code: 'Режим программирования'
        };

        this.elements.currentModeText.textContent = modeTexts[mode] || 'Обычный режим';

        // Update placeholder
        const placeholders = {
            normal: 'Задайте вопрос или опишите задачу...',
            creative: 'Опишите вашу креативную идею...',
            voice: 'Введите текст для преобразования в голос...',
            image: 'Опишите изображение, которое хотите создать...',
            code: 'Опишите код, который нужно написать...'
        };

        this.elements.userInput.placeholder = placeholders[mode] || 'Задайте вопрос...';

        this.saveSettings();
    }

    // Enhanced File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (this.state.attachedFiles.length >= 5) {
                this.showNotification('Максимум 5 файлов', 'warning');
                return;
            }

            const fileObj = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                type: file.type,
                size: file.size
            };

            this.state.attachedFiles.push(fileObj);
        });

        this.updateAttachedFiles();
        event.target.value = ''; // Reset input
    }

    updateAttachedFiles() {
        this.elements.attachedFiles.innerHTML = this.renderAttachedFiles(this.state.attachedFiles);
        this.handleInputChange(); // Update send button state
    }

    removeAttachedFile(fileId) {
        this.state.attachedFiles = this.state.attachedFiles.filter(file => file.id !== fileId);
        this.updateAttachedFiles();
    }

    // Enhanced UI Components
    setupEmojiPicker() {
        const emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
            people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹', '🧘', '🛀', '🛌', '👭', '👫', '👬', '💏', '💑', '👪'],
            nature: ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🐞', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
            food: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪁', '🥅', '⛳', '🪃', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
            objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
        };

        // Populate emoji grid
        Object.entries(emojis).forEach(([category, categoryEmojis]) => {
            const categoryBtn = this.elements.emojiPicker.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                categoryBtn.addEventListener('click', () => {
                    this.showEmojiCategory(category, categoryEmojis);
                    
                    // Update active category
                    this.elements.emojiPicker.querySelectorAll('.emoji-category-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    categoryBtn.classList.add('active');
                });
            }
        });

        // Show default category
        this.showEmojiCategory('smileys', emojis.smileys);
    }

    showEmojiCategory(category, emojis) {
        this.elements.emojiGrid.innerHTML = '';
        
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('button');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                this.insertEmoji(emoji);
                this.hideEmojiPicker();
            });
            this.elements.emojiGrid.appendChild(emojiItem);
        });
    }

    toggleEmojiPicker() {
        this.elements.emojiPicker.classList.toggle('active');
    }

    hideEmojiPicker() {
        this.elements.emojiPicker.classList.remove('active');
    }

    insertEmoji(emoji) {
        const textarea = this.elements.userInput;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        textarea.value = text.substring(0, start) + emoji + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
        
        this.handleInputChange();
    }

    // Enhanced Voice Recognition
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.voiceRecognition = new SpeechRecognition();
            
            this.state.voiceRecognition.continuous = false;
            this.state.voiceRecognition.interimResults = true;
            this.state.voiceRecognition.lang = 'ru-RU';

            this.state.voiceRecognition.onstart = () => {
                this.state.isListening = true;
                this.updateVoiceButton();
                this.showNotification('Слушаю...', 'info');
            };

            this.state.voiceRecognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                
                if (transcript) {
                    this.elements.userInput.value += transcript;
                    this.handleInputChange();
                }
            };

            this.state.voiceRecognition.onend = () => {
                this.state.isListening = false;
                this.updateVoiceButton();
            };

            this.state.voiceRecognition.onerror = (event) => {
                this.state.isListening = false;
                this.updateVoiceButton();
                this.showNotification('Ошибка распознавания речи', 'error');
                console.error('Speech recognition error:', event.error);
            };
        } else {
            this.elements.voiceInputBtn.style.display = 'none';
        }
    }

    toggleVoiceInput() {
        if (!this.state.voiceRecognition) return;

        if (this.state.isListening) {
            this.state.voiceRecognition.stop();
        } else {
            this.state.voiceRecognition.start();
        }
    }

    updateVoiceButton() {
        const btn = this.elements.voiceInputBtn;
        if (this.state.isListening) {
            btn.innerHTML = '<i class="ti ti-square"></i>';
            btn.style.color = 'var(--accent-error)';
        } else {
            btn.innerHTML = '<i class="ti ti-microphone"></i>';
            btn.style.color = '';
        }
    }

    // Enhanced Minimap
    setupMinimap() {
        this.elements.minimapToggle.addEventListener('click', this.toggleMinimap.bind(this));
        this.elements.chatMinimap.addEventListener('click', this.handleMinimapClick.bind(this));
        
        // Update minimap on scroll
        this.elements.messagesContainer.addEventListener('scroll', this.updateMinimap.bind(this));
    }

    toggleMinimap() {
        const container = this.elements.minimapContainer;
        const isHidden = container.style.display === 'none';
        
        if (isHidden) {
            container.style.display = 'flex';
            this.elements.minimapToggle.innerHTML = '<i class="ti ti-chevron-up"></i>';
            this.updateMinimap();
        } else {
            container.style.display = 'none';
            this.elements.minimapToggle.innerHTML = '<i class="ti ti-chevron-down"></i>';
        }
    }

    updateMinimap() {
        const messages = this.elements.messagesContainer;
        const minimap = this.elements.minimapContent;
        const viewport = this.elements.minimapViewport;

        if (!minimap || !viewport) return;

        const totalHeight = messages.scrollHeight;
        const visibleHeight = messages.clientHeight;
        const scrollTop = messages.scrollTop;

        // Calculate viewport position and size
        const viewportTop = (scrollTop / totalHeight) * 120;
        const viewportHeight = (visibleHeight / totalHeight) * 120;

        viewport.style.top = `${viewportTop}px`;
        viewport.style.height = `${viewportHeight}px`;

        // Update minimap content (simplified representation)
        this.renderMinimapContent();
    }

    renderMinimapContent() {
        const minimap = this.elements.minimapContent;
        const messages = Array.from(this.elements.messagesContainer.children);
        
        minimap.innerHTML = '';
        
        messages.forEach((message, index) => {
            const block = document.createElement('div');
            block.style.height = '4px';
            block.style.marginBottom = '1px';
            block.style.borderRadius = '1px';
            
            if (message.classList.contains('message-user')) {
                block.style.background = 'var(--accent-primary)';
            } else if (message.classList.contains('message-ai')) {
                block.style.background = 'var(--accent-success)';
            } else if (message.classList.contains('message-error')) {
                block.style.background = 'var(--accent-error)';
            } else {
                block.style.background = 'var(--text-tertiary)';
            }
            
            minimap.appendChild(block);
        });
    }

    handleMinimapClick(event) {
        const minimap = this.elements.chatMinimap;
        const rect = minimap.getBoundingClientRect();
        const clickY = event.clientY - rect.top;
        const percentage = clickY / rect.height;
        
        const messages = this.elements.messagesContainer;
        const targetScroll = percentage * messages.scrollHeight;
        
        messages.scrollTo({
            top: targetScroll - messages.clientHeight / 2,
            behavior: 'smooth'
        });
    }

    // Enhanced Navigation
    scrollToTop() {
        this.elements.messagesContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTo({
            top: this.elements.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    scrollToLastAIMessage() {
        const aiMessages = Array.from(this.elements.messagesContainer.querySelectorAll('.message-ai'));
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Enhanced Sidebar Menu
    toggleSidebar() {
        this.state.isSidebarOpen = !this.state.isSidebarOpen;
        
        if (this.state.isSidebarOpen) {
            this.elements.sidebarMenu.classList.add('active');
            this.elements.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeSidebar();
        }
    }

    closeSidebar() {
        this.state.isSidebarOpen = false;
        this.elements.sidebarMenu.classList.remove('active');
        this.elements.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Enhanced Settings Management
    loadSettings() {
        try {
            const saved = localStorage.getItem('khai-pro-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                Object.assign(this.state, settings);
                
                // Apply settings
                this.applySettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            const settings = {
                theme: this.state.theme,
                currentModel: this.state.currentModel,
                currentMode: this.state.currentMode
            };
            localStorage.setItem('khai-pro-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    applySettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.updateThemeButton();
        
        // Apply model
        this.updateModelDisplay();
        
        // Apply mode
        this.setMode(this.state.currentMode);
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.updateThemeButton();
        this.saveSettings();
    }

    updateThemeButton() {
        const btn = this.elements.themeToggle;
        if (this.state.theme === 'dark') {
            btn.innerHTML = '<i class="ti ti-sun"></i>';
            btn.title = 'Светлая тема';
        } else {
            btn.innerHTML = '<i class="ti ti-moon"></i>';
            btn.title = 'Темная тема';
        }
    }

    // Enhanced Chat Management
    loadChat(chatId) {
        try {
            const saved = localStorage.getItem(`khai-pro-chat-${chatId}`);
            if (saved) {
                const chatData = JSON.parse(saved);
                this.state.messages = chatData.messages || [];
                this.renderMessages();
                this.updateStats();
                this.updateMinimap();
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    }

    saveChat() {
        try {
            const chatData = {
                id: this.state.currentChat,
                name: this.elements.currentChatName.textContent,
                messages: this.state.messages,
                lastUpdated: new Date()
            };
            localStorage.setItem(`khai-pro-chat-${this.state.currentChat}`, JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    }

    createNewChat() {
        const chatId = `chat-${Date.now()}`;
        this.state.currentChat = chatId;
        this.state.messages = [];
        this.renderMessages();
        this.updateStats();
        this.closeSidebar();
        this.showNotification('Новый чат создан', 'success');
    }

    clearChat() {
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.state.messages = [];
            this.renderMessages();
            this.updateStats();
            this.showNotification('Чат очищен', 'success');
        }
    }

    renderMessages() {
        this.elements.messagesContainer.innerHTML = '';
        this.state.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
    }

    // Enhanced Stats and UI Updates
    updateStats() {
        const messageCount = this.state.messages.length;
        this.elements.messageCount.textContent = `${messageCount} сообщений`;
        this.elements.footerMessageCount.textContent = messageCount;
        this.elements.sidebarMessageCount.textContent = messageCount;
        
        // Update chat duration (simplified)
        if (this.state.messages.length > 0) {
            const firstMessage = this.state.messages[0].timestamp;
            const duration = Math.round((new Date() - new Date(firstMessage)) / 60000);
            this.elements.chatDuration.textContent = `${duration} мин`;
        } else {
            this.elements.chatDuration.textContent = '0 мин';
        }
    }

    updateSendButton() {
        const btn = this.elements.sendBtn;
        if (this.state.isGenerating) {
            btn.innerHTML = '<i class="ti ti-loader"></i>';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="ti ti-send"></i>';
            btn.disabled = !this.elements.userInput.value.trim() && this.state.attachedFiles.length === 0;
        }
    }

    // Enhanced Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-left: 4px solid var(--${type === 'info' ? 'accent-primary' : type === 'success' ? 'accent-success' : type === 'warning' ? 'accent-warning' : 'accent-error'});
            color: var(--text-primary);
            padding: 12px 16px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-2xl);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
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

    // Enhanced Connection Management
    checkConnection() {
        this.setOnlineStatus(navigator.onLine);
    }

    setOnlineStatus(online) {
        this.state.isOnline = online;
        const status = this.elements.connectionStatus;
        const footerStatus = this.elements.footerStatus;
        const sidebarStatus = this.elements.sidebarStatus;

        if (online) {
            status.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
            status.className = 'connection-status';
            footerStatus.innerHTML = '<i class="ti ti-circle-check"></i><span>Готов к работе</span>';
            sidebarStatus.textContent = '✅ Онлайн';
            sidebarStatus.className = 'info-value status-online';
        } else {
            status.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
            status.className = 'connection-status offline';
            footerStatus.innerHTML = '<i class="ti ti-circle-x"></i><span>Нет соединения</span>';
            sidebarStatus.textContent = '❌ Офлайн';
            sidebarStatus.className = 'info-value';
        }
    }

    // Enhanced Fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
            this.state.isFullscreen = true;
            this.elements.fullscreenToggle.innerHTML = '<i class="ti ti-arrows-minimize"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.state.isFullscreen = false;
                this.elements.fullscreenToggle.innerHTML = '<i class="ti ti-arrows-maximize"></i>';
            }
        }
    }

    // Enhanced Search
    handleSearch(event) {
        this.state.searchQuery = event.target.value.toLowerCase();
        this.elements.headerSearchClear.style.display = this.state.searchQuery ? 'flex' : 'none';
        this.highlightSearchResults();
    }

    clearSearch() {
        this.state.searchQuery = '';
        this.elements.headerSearch.value = '';
        this.elements.headerSearchClear.style.display = 'none';
        this.clearSearchHighlights();
    }

    highlightSearchResults() {
        this.clearSearchHighlights();
        
        if (!this.state.searchQuery) return;

        const messages = this.elements.messagesContainer.querySelectorAll('.message-text');
        messages.forEach(message => {
            const text = message.textContent || message.innerText;
            if (text.toLowerCase().includes(this.state.searchQuery)) {
                const regex = new RegExp(`(${this.state.searchQuery})`, 'gi');
                message.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            }
        });
    }

    clearSearchHighlights() {
        const marks = this.elements.messagesContainer.querySelectorAll('.search-highlight');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }

    // Enhanced Code Highlighting
    highlightCodeBlocks(container) {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // Enhanced Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar"><i class="ti ti-brain"></i></div>
            <div class="message-content">
                <div class="message-header">
                    <span>${this.models[this.state.currentModel].name}</span>
                    <span class="message-time">Печатает...</span>
                </div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        indicator.id = 'typing-indicator';
        this.elements.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Enhanced Message Actions
    copyMessage(messageId) {
        const message = this.state.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Сообщение скопировано', 'success');
            }).catch(err => {
                console.error('Failed to copy message:', err);
                this.showNotification('Ошибка копирования', 'error');
            });
        }
    }

    regenerateMessage(messageId) {
        const messageIndex = this.state.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1 && this.state.messages[messageIndex].role === 'user') {
            const userMessage = this.state.messages[messageIndex];
            
            // Remove subsequent AI messages
            this.state.messages = this.state.messages.slice(0, messageIndex + 1);
            this.renderMessages();
            
            // Regenerate response
            this.sendMessage(userMessage.content, userMessage.files);
        }
    }

    rateMessage(messageId, rating) {
        const message = this.state.messages.find(m => m.id === messageId);
        if (message) {
            message.rating = rating;
            this.showNotification(`Оценка "${rating}" сохранена`, 'success');
            this.saveChat();
        }
    }

    // Enhanced Global Event Handlers
    handleGlobalClick(event) {
        // Close emoji picker when clicking outside
        if (this.elements.emojiPicker.classList.contains('active') && 
            !this.elements.emojiPicker.contains(event.target) && 
            event.target !== this.elements.emojiBtn) {
            this.hideEmojiPicker();
        }

        // Close context menu when clicking outside
        if (this.elements.contextMenu.classList.contains('active') && 
            !this.elements.contextMenu.contains(event.target)) {
            this.closeContextMenu();
        }
    }

    handleGlobalKeydown(event) {
        // Escape key closes modals
        if (event.key === 'Escape') {
            if (this.state.isSidebarOpen) {
                this.closeSidebar();
            }
            if (this.elements.emojiPicker.classList.contains('active')) {
                this.hideEmojiPicker();
            }
            if (this.elements.contextMenu.classList.contains('active')) {
                this.closeContextMenu();
            }
        }

        // Ctrl+K for search
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            this.elements.headerSearch.focus();
        }

        // Ctrl+N for new chat
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            this.createNewChat();
        }
    }

    handleResize() {
        this.updateMinimap();
        this.autoResizeTextarea();
    }

    // Enhanced Context Menu
    handleContextMenu(event) {
        // Prevent default context menu on messages
        if (event.target.closest('.message')) {
            event.preventDefault();
            this.showMessageContextMenu(event);
        }
    }

    showMessageContextMenu(event) {
        const messageEl = event.target.closest('.message');
        if (!messageEl) return;

        const messageId = messageEl.dataset.messageId;
        const message = this.state.messages.find(m => m.id === messageId);
        if (!message) return;

        this.elements.contextMenu.innerHTML = '';
        
        if (message.role === 'user') {
            this.addContextMenuItem('Копировать', 'ti ti-copy', () => this.copyMessage(messageId));
            this.addContextMenuItem('Перегенерировать ответ', 'ti ti-refresh', () => this.regenerateMessage(messageId));
        } else if (message.role === 'ai') {
            this.addContextMenuItem('Копировать', 'ti ti-copy', () => this.copyMessage(messageId));
            this.addContextMenuItem('Перегенерировать', 'ti ti-refresh', () => this.regenerateMessage(messageId));
            this.addContextMenuDivider();
            this.addContextMenuItem('Нравится', 'ti ti-thumb-up', () => this.rateMessage(messageId, 'like'));
            this.addContextMenuItem('Не нравится', 'ti ti-thumb-down', () => this.rateMessage(messageId, 'dislike'));
        }

        this.elements.contextMenu.style.left = event.pageX + 'px';
        this.elements.contextMenu.style.top = event.pageY + 'px';
        this.elements.contextMenu.classList.add('active');
    }

    addContextMenuItem(text, icon, action) {
        const item = document.createElement('button');
        item.className = 'context-menu-item';
        item.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
        item.addEventListener('click', action);
        this.elements.contextMenu.appendChild(item);
    }

    addContextMenuDivider() {
        const divider = document.createElement('div');
        divider.className = 'context-menu-divider';
        this.elements.contextMenu.appendChild(divider);
    }

    closeContextMenu() {
        this.elements.contextMenu.classList.remove('active');
    }

    // Enhanced Export Functionality
    exportChat() {
        const chatData = {
            meta: {
                title: this.elements.currentChatName.textContent,
                exported: new Date().toISOString(),
                messageCount: this.state.messages.length,
                model: this.state.currentModel
            },
            messages: this.state.messages
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

        this.showNotification('Чат экспортирован', 'success');
    }

    importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const chatData = JSON.parse(e.target.result);
                        if (chatData.messages && Array.isArray(chatData.messages)) {
                            this.state.messages = chatData.messages;
                            this.renderMessages();
                            this.updateStats();
                            this.showNotification('Чат импортирован', 'success');
                        } else {
                            throw new Error('Invalid chat format');
                        }
                    } catch (error) {
                        this.showNotification('Ошибка импорта чата', 'error');
                        console.error('Import error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    downloadChat() {
        let content = `Чат KHAI Pro\n`;
        content += `Экспортировано: ${new Date().toLocaleString('ru-RU')}\n`;
        content += `Модель: ${this.models[this.state.currentModel].name}\n`;
        content += `Сообщений: ${this.state.messages.length}\n\n`;
        content += '='.repeat(50) + '\n\n';

        this.state.messages.forEach(message => {
            const time = new Date(message.timestamp).toLocaleTimeString('ru-RU');
            const sender = message.role === 'user' ? 'Вы' : this.models[message.model]?.name || 'AI';
            
            content += `${sender} [${time}]:\n`;
            content += `${message.content}\n\n`;
            
            if (message.files && message.files.length > 0) {
                content += `Прикрепленные файлы: ${message.files.map(f => f.name).join(', ')}\n`;
            }
            
            content += '-'.repeat(30) + '\n\n';
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-pro-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Чат скачан', 'success');
    }

    // Enhanced Help System
    showHelp() {
        const helpContent = `
# KHAI Pro - Помощь

## Основные возможности:
- **Чат с ИИ**: Общайтесь с различными моделями ИИ
- **Креативный режим**: Получайте творческие и вдохновляющие ответы
- **Генерация кода**: Пишите и анализируйте код
- **Голосовой ввод**: Говорите вместо набора текста
- **Работа с файлами**: Прикрепляйте изображения и документы

## Горячие клавиши:
- **Ctrl+K**: Быстрый поиск
- **Ctrl+N**: Новый чат
- **Enter**: Отправить сообщение
- **Shift+Enter**: Новая строка

## Советы:
- Используйте разные режимы для разных задач
- Прикрепляйте файлы для анализа
- Ищите по истории чата
- Экспортируйте важные беседы
        `;

        this.addMessage('ai', helpContent, [], 'normal');
        this.closeSidebar();
    }

    showSettings() {
        // Simple settings modal
        const settingsContent = `
# Настройки

## Внешний вид:
- Тёмная/светлая тема
- Размер шрифта
- Компактный режим

## Модель ИИ:
- GPT-4 Turbo (рекомендуется)
- GPT-4
- GPT-3.5 Turbo
- Claude 3 Opus
- Gemini Pro

## Дополнительно:
- Авто-сохранение
- Уведомления
- Качество голоса
        `;

        this.addMessage('ai', settingsContent, [], 'normal');
        this.closeSidebar();
    }

    showTemplates() {
        const templatesContent = `
# Шаблоны запросов

## Для программирования:
\`\`\`
Напиши код [язык] для [задача] с комментариями
Проанализируй этот код и предложи улучшения
Найди ошибки в коде и исправь их
\`\`\`

## Для творчества:
\`\`\`
Напиши рассказ на тему [тема]
Придумай идею для [проект]
Опиши [концепт] в деталях
\`\`\`

## Для анализа:
\`\`\`
Проанализируй этот текст и выдели ключевые моменты
Суммаризуй основные идеи из [контент]
Сравни [A] и [B] по критериям [критерии]
\`\`\`
        `;

        this.addMessage('ai', templatesContent, [], 'normal');
        this.closeSidebar();
    }

    // Enhanced Puter AI Integration
    initializePuterAI() {
        console.log('Puter AI SDK initialized');
        // Additional Puter AI setup can go here
    }

    // Enhanced Error Handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`Ошибка ${context}: ${error.message}`, 'error');
    }

    // Enhanced Auto-resize
    setupAutoResize() {
        const observer = new ResizeObserver(() => {
            this.autoResizeTextarea();
            this.updateMinimap();
        });

        if (this.elements.userInput) {
            observer.observe(this.elements.userInput);
        }
    }
}

// Enhanced CSS for additional components
const additionalStyles = `
/* Enhanced Notifications */
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

/* Enhanced Search Highlights */
.search-highlight {
    background: var(--accent-warning-alpha);
    color: var(--accent-warning);
    padding: 2px 4px;
    border-radius: var(--radius-sm);
}

/* Enhanced Typing Indicator */
.typing-indicator .typing-dots {
    display: flex;
    gap: 4px;
    margin-top: 8px;
}

.typing-indicator .typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
    animation: typingPulse 1.4s ease-in-out infinite both;
}

.typing-indicator .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typingPulse {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Enhanced Notifications */
.notification {
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color) !important;
}

/* Enhanced Model Selector Dropdown */
.context-menu {
    max-height: 400px;
    overflow-y: auto;
}

.context-menu-item {
    text-align: left;
    white-space: nowrap;
}

/* Enhanced Mobile Optimizations */
@media (max-width: 768px) {
    .context-menu {
        position: fixed !important;
        left: 10px !important;
        right: 10px !important;
        top: auto !important;
        bottom: 80px !important;
        width: auto !important;
        max-width: none !important;
    }
}

/* Enhanced Focus States for Accessibility */
.control-btn:focus-visible,
.quick-btn:focus-visible,
.nav-btn:focus-visible,
.attach-btn:focus-visible,
.input-btn:focus-visible,
.send-btn:focus-visible,
.action-btn:focus-visible,
.sidebar-btn:focus-visible,
.emoji-item:focus-visible,
.context-menu-item:focus-visible,
.quick-access-btn:focus-visible,
.chat-item:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
}

/* Enhanced Loading States */
.ti-loader {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Enhanced Scrollbar for Context Menu */
.context-menu::-webkit-scrollbar {
    width: 6px;
}

.context-menu::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
}

.context-menu::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}

.context-menu::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
}
`;

// Add additional styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIProChat();
});

// Enhanced Service Worker for PWA (optional)
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
