// KHAI Assistant - Production Ready Application
class KHAIAssistant {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.currentModel = 'khai';
        this.isGenerating = false;
        this.voiceRecognition = null;
        this.isListening = false;
        this.currentTheme = 'dark';
        this.fileAttachments = new Map();
        this.isOnline = true;
        this.puter = null;
        
        // Initialize models list with proper order
        this.models = [
            {
                id: 'khai',
                name: 'KHAI AI',
                description: 'Первый белорусский ИИ-помощник',
                status: 'active',
                icon: 'ti ti-star'
            },
            {
                id: 'gpt5',
                name: 'GPT-5 Nano',
                description: 'Быстрая и точная модель для повседневных задач',
                status: 'active',
                icon: 'ti ti-brain'
            },
            {
                id: 'claude',
                name: 'Claude Sonnet',
                description: 'Продвинутая модель для сложных задач',
                status: 'soon',
                icon: 'ti ti-cloud'
            }
        ];

        this.init();
    }

    async init() {
        try {
            // Initialize critical components first
            await this.initializeCriticalComponents();
            
            // Initialize Puter AI SDK
            await this.initializePuterAI();
            
            // Load saved data
            await this.loadSavedData();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Hide preloader after everything is ready
            setTimeout(() => {
                this.hidePreloader();
            }, 1000);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Ошибка инициализации приложения');
            this.hidePreloader();
        }
    }

    async initializeCriticalComponents() {
        // Initialize theme
        this.initializeTheme();
        
        // Initialize service worker for PWA
        this.initializeServiceWorker();
        
        // Initialize voice recognition if available
        this.initializeVoiceRecognition();
    }

    async initializePuterAI() {
        try {
            if (typeof puter !== 'undefined') {
                this.puter = puter;
                console.log('Puter AI SDK initialized');
            } else {
                console.warn('Puter AI SDK not available');
            }
        } catch (error) {
            console.warn('Puter AI initialization failed:', error);
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('khai-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('khai-theme', theme);
        
        // Update theme toggle button icon
        const themeIcon = document.querySelector('#themeToggle i, .theme-minimap-btn i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'ru-RU';

            this.voiceRecognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
            };

            this.voiceRecognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const userInput = document.getElementById('userInput');
                userInput.value = transcript;
                this.adjustTextareaHeight(userInput);
                this.toggleClearInputButton();
            };

            this.voiceRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton();
                
                if (event.error === 'not-allowed') {
                    this.showError('Разрешите доступ к микрофону для использования голосового ввода');
                }
            };
        } else {
            document.getElementById('voiceInputBtn').style.display = 'none';
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            if (this.isListening) {
                voiceBtn.innerHTML = '<i class="ti ti-square"></i>';
                voiceBtn.style.color = 'var(--error-text)';
            } else {
                voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
                voiceBtn.style.color = '';
            }
        }
    }

    async loadSavedData() {
        try {
            // Load chats from localStorage
            const savedChats = localStorage.getItem('khai-chats');
            if (savedChats) {
                const chatsData = JSON.parse(savedChats);
                chatsData.forEach(chat => {
                    this.chats.set(chat.id, chat);
                });
            }

            // Load current model
            const savedModel = localStorage.getItem('khai-model');
            if (savedModel && this.models.some(m => m.id === savedModel)) {
                this.currentModel = savedModel;
            }

            // Update UI with loaded data
            this.updateChatList();
            this.updateModelSelection();

        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    initializeEventListeners() {
        // Input and send
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');

        userInput.addEventListener('input', () => {
            this.adjustTextareaHeight(userInput);
            this.toggleClearInputButton();
            this.toggleSendButton();
        });

        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!this.isGenerating) {
                    this.sendMessage();
                }
            }
        });

        sendBtn.addEventListener('click', () => {
            if (!this.isGenerating) {
                this.sendMessage();
            }
        });

        clearInputBtn.addEventListener('click', () => {
            userInput.value = '';
            this.adjustTextareaHeight(userInput);
            this.toggleClearInputButton();
            this.toggleSendButton();
        });

        // File attachments
        const fileInput = document.getElementById('fileInput');
        const attachFileBtn = document.getElementById('attachFileBtn');

        attachFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Voice input
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        if (voiceInputBtn) {
            voiceInputBtn.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        const themeMinimapToggle = document.getElementById('themeMinimapToggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        if (themeMinimapToggle) {
            themeMinimapToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Sidebar and navigation
        const menuToggle = document.getElementById('menuToggle');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const newChatBtn = document.getElementById('newChatBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const downloadChatBtn = document.getElementById('downloadChatBtn');

        menuToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        sidebarClose.addEventListener('click', () => {
            this.toggleSidebar();
        });

        sidebarOverlay.addEventListener('click', () => {
            this.toggleSidebar();
        });

        newChatBtn.addEventListener('click', () => {
            this.createNewChat();
            this.toggleSidebar();
        });

        clearChatBtn.addEventListener('click', () => {
            this.clearCurrentChat();
        });

        downloadChatBtn.addEventListener('click', () => {
            this.downloadCurrentChat();
        });

        // Model selection
        const modelSelectBtn = document.getElementById('modelSelectBtn');
        const modelModalOverlay = document.getElementById('modelModalOverlay');
        const modelModalClose = document.getElementById('modelModalClose');
        const modelModalCancel = document.getElementById('modelModalCancel');
        const modelModalConfirm = document.getElementById('modelModalConfirm');

        modelSelectBtn.addEventListener('click', () => {
            this.showModelSelection();
        });

        modelModalClose.addEventListener('click', () => {
            this.hideModelSelection();
        });

        modelModalCancel.addEventListener('click', () => {
            this.hideModelSelection();
        });

        modelModalConfirm.addEventListener('click', () => {
            this.confirmModelSelection();
        });

        modelModalOverlay.addEventListener('click', (e) => {
            if (e.target === modelModalOverlay) {
                this.hideModelSelection();
            }
        });

        // Search functionality
        const headerSearch = document.getElementById('headerSearch');
        const headerSearchClear = document.getElementById('headerSearchClear');
        const sidebarSearch = document.getElementById('sidebarSearch');
        const sidebarSearchClear = document.getElementById('sidebarSearchClear');

        headerSearch.addEventListener('input', (e) => {
            this.handleHeaderSearch(e.target.value);
            headerSearchClear.style.display = e.target.value ? 'flex' : 'none';
        });

        headerSearchClear.addEventListener('click', () => {
            headerSearch.value = '';
            this.handleHeaderSearch('');
            headerSearchClear.style.display = 'none';
        });

        sidebarSearch.addEventListener('input', (e) => {
            this.handleSidebarSearch(e.target.value);
            sidebarSearchClear.style.display = e.target.value ? 'flex' : 'none';
        });

        sidebarSearchClear.addEventListener('click', () => {
            sidebarSearch.value = '';
            this.handleSidebarSearch('');
            sidebarSearchClear.style.display = 'none';
        });

        // Navigation buttons
        const scrollToLastAI = document.getElementById('scrollToLastAI');
        const scrollToBottom = document.getElementById('scrollToBottom');

        if (scrollToLastAI) {
            scrollToLastAI.addEventListener('click', () => {
                this.scrollToLastAIMessage();
            });
        }

        if (scrollToBottom) {
            scrollToBottom.addEventListener('click', () => {
                this.scrollToBottom();
            });
        }

        // Mode buttons
        const normalModeBtn = document.getElementById('normalModeBtn');
        const generateVoiceBtn = document.getElementById('generateVoiceBtn');
        const generateImageBtn = document.getElementById('generateImageBtn');

        normalModeBtn.addEventListener('click', () => {
            this.setMode('normal');
        });

        generateVoiceBtn.addEventListener('click', () => {
            this.setMode('voice');
        });

        generateImageBtn.addEventListener('click', () => {
            this.setMode('image');
        });

        // Error page
        const errorBackBtn = document.getElementById('errorBackBtn');
        if (errorBackBtn) {
            errorBackBtn.addEventListener('click', () => {
                this.hide404Page();
            });
        }

        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });

        // Prevent drag and drop file upload for now
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });

        // Initialize minimap
        this.initializeMinimap();
    }

    initializeUI() {
        // Create initial chat if none exists
        if (this.chats.size === 0) {
            this.createNewChat();
        } else {
            // Load the last active chat
            const lastChatId = localStorage.getItem('khai-last-chat');
            if (lastChatId && this.chats.has(lastChatId)) {
                this.loadChat(lastChatId);
            } else {
                this.loadChat(Array.from(this.chats.keys())[0]);
            }
        }

        // Update connection status
        this.updateConnectionStatus(navigator.onLine);

        // Update app version date
        this.updateAppVersionDate();
    }

    initializeMinimap() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimapViewport = document.getElementById('minimapViewport');
        const minimapContent = document.getElementById('minimapContent');

        if (!messagesContainer || !minimapViewport || !minimapContent) return;

        const updateMinimap = () => {
            const scrollHeight = messagesContainer.scrollHeight;
            const clientHeight = messagesContainer.clientHeight;
            const scrollTop = messagesContainer.scrollTop;

            if (scrollHeight <= clientHeight) {
                minimapViewport.style.display = 'none';
                return;
            }

            minimapViewport.style.display = 'block';

            const viewportHeight = (clientHeight / scrollHeight) * 100;
            const viewportTop = (scrollTop / scrollHeight) * 100;

            minimapViewport.style.height = `${viewportHeight}%`;
            minimapViewport.style.top = `${viewportTop}%`;

            // Update minimap content representation
            this.updateMinimapContent();
        };

        messagesContainer.addEventListener('scroll', updateMinimap);
        window.addEventListener('resize', updateMinimap);

        // Click on minimap to scroll
        minimapViewport.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startScrollTop = messagesContainer.scrollTop;

            const onMouseMove = (e) => {
                const deltaY = e.clientY - startY;
                const scrollRatio = messagesContainer.scrollHeight / minimapContent.offsetHeight;
                messagesContainer.scrollTop = startScrollTop + deltaY * scrollRatio;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        this.updateMinimap = updateMinimap;
    }

    updateMinimapContent() {
        const minimapContent = document.getElementById('minimapContent');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!minimapContent || !messagesContainer) return;

        // Clear existing content
        minimapContent.innerHTML = '';

        // Create simplified representation of messages
        const messages = messagesContainer.querySelectorAll('.message');
        messages.forEach(message => {
            const block = document.createElement('div');
            block.className = 'minimap-block';
            
            if (message.classList.contains('user')) {
                block.style.background = 'var(--accent-primary)';
            } else if (message.classList.contains('ai')) {
                block.style.background = 'var(--text-secondary)';
            } else {
                block.style.background = 'var(--text-tertiary)';
            }
            
            block.style.height = '2px';
            block.style.marginBottom = '1px';
            block.style.borderRadius = '1px';
            
            minimapContent.appendChild(block);
        });
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleClearInputButton() {
        const clearInputBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        clearInputBtn.style.display = userInput.value ? 'flex' : 'none';
    }

    toggleSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        sendBtn.disabled = !userInput.value.trim() || this.isGenerating;
    }

    toggleVoiceInput() {
        if (!this.voiceRecognition) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        if (this.isListening) {
            this.voiceRecognition.stop();
        } else {
            try {
                this.voiceRecognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Reset sidebar search when closing
        if (!sidebar.classList.contains('active')) {
            const sidebarSearch = document.getElementById('sidebarSearch');
            const sidebarSearchClear = document.getElementById('sidebarSearchClear');
            sidebarSearch.value = '';
            sidebarSearchClear.style.display = 'none';
            this.handleSidebarSearch('');
        }
    }

    showModelSelection() {
        const modal = document.getElementById('modelModalOverlay');
        const modelList = document.getElementById('modelList');
        
        // Populate model list
        modelList.innerHTML = this.models.map(model => `
            <div class="model-item ${model.id === this.currentModel ? 'selected' : ''}" data-model="${model.id}">
                <div class="model-icon">
                    <i class="${model.icon}"></i>
                </div>
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-description">${model.description}</div>
                </div>
                <div class="model-status ${model.status}">${model.status === 'active' ? '✅ Активна' : '⏳ Скоро'}</div>
            </div>
        `).join('');

        // Add click handlers
        modelList.querySelectorAll('.model-item').forEach(item => {
            item.addEventListener('click', () => {
                modelList.querySelectorAll('.model-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        modal.classList.add('active');
    }

    hideModelSelection() {
        const modal = document.getElementById('modelModalOverlay');
        modal.classList.remove('active');
    }

    confirmModelSelection() {
        const selectedItem = document.querySelector('.model-item.selected');
        if (selectedItem) {
            const modelId = selectedItem.dataset.model;
            const model = this.models.find(m => m.id === modelId);
            
            if (model && model.status === 'active') {
                this.currentModel = modelId;
                localStorage.setItem('khai-model', modelId);
                this.updateModelSelection();
                this.hideModelSelection();
            } else {
                this.showError('Эта модель пока недоступна');
            }
        }
    }

    updateModelSelection() {
        const currentModel = this.models.find(m => m.id === this.currentModel);
        if (currentModel) {
            const modelInfo = document.getElementById('currentModelInfo');
            if (modelInfo) {
                modelInfo.textContent = currentModel.name;
            }
        }
    }

    handleHeaderSearch(query) {
        // Implement search in current chat
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const text = message.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            message.style.display = matches || !query ? 'flex' : 'none';
        });
    }

    handleSidebarSearch(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
            const matches = name.includes(query.toLowerCase());
            item.style.display = matches || !query ? 'flex' : 'none';
        });
    }

    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            if (this.fileAttachments.size >= 5) {
                this.showError('Можно прикрепить не более 5 файлов');
                return;
            }

            const fileId = Date.now().toString();
            this.fileAttachments.set(fileId, file);
            this.addFileToUI(fileId, file);
        });
    }

    addFileToUI(fileId, file) {
        const attachedFiles = document.getElementById('attachedFiles');
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            ${file.type.startsWith('image/') ? 
                `<img src="${URL.createObjectURL(file)}" alt="${file.name}">` : 
                `<i class="ti ti-file-text"></i>`
            }
            <span>${file.name}</span>
            <button class="file-remove" data-file="${fileId}">
                <i class="ti ti-x"></i>
            </button>
        `;

        attachedFiles.appendChild(fileItem);

        // Add remove event listener
        fileItem.querySelector('.file-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFile(fileId);
        });
    }

    removeFile(fileId) {
        this.fileAttachments.delete(fileId);
        const fileElement = document.querySelector(`[data-file="${fileId}"]`).closest('.file-item');
        if (fileElement) {
            fileElement.remove();
        }
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message && this.fileAttachments.size === 0) {
            return;
        }

        // Create new chat if none exists
        if (!this.currentChatId) {
            this.createNewChat();
        }

        // Add user message
        this.addMessage('user', message);

        // Clear input
        userInput.value = '';
        this.adjustTextareaHeight(userInput);
        this.toggleClearInputButton();
        this.toggleSendButton();

        // Clear file attachments
        this.fileAttachments.clear();
        document.getElementById('attachedFiles').innerHTML = '';

        // Show thinking indicator
        const thinkingId = this.addMessage('thinking', 'Думаю...');

        // Generate AI response
        await this.generateAIResponse(message, thinkingId);
    }

    addMessage(type, content, files = []) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageId = Date.now().toString();

        // Remove skeleton loaders if present
        const skeletons = messagesContainer.querySelectorAll('.message-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.id = `msg-${messageId}`;

        let avatarIcon = 'ti ti-user';
        let avatarText = 'Вы';

        if (type === 'ai') {
            avatarIcon = 'ti ti-brain';
            avatarText = 'AI';
        } else if (type === 'thinking') {
            avatarIcon = 'ti ti-clock';
            avatarText = '...';
        } else if (type === 'error') {
            avatarIcon = 'ti ti-alert-triangle';
            avatarText = '!';
        }

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                ${type === 'ai' || type === 'user' ? `
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать">
                            <i class="ti ti-copy"></i>
                        </button>
                        ${type === 'ai' ? `
                            <button class="action-btn regenerate-btn" title="Перегенерировать">
                                <i class="ti ti-refresh"></i>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        // Add files if present
        if (files.length > 0) {
            const filesHTML = files.map(file => `
                <div class="file-attachment">
                    <i class="ti ti-file-text"></i>
                    <span>${file.name}</span>
                </div>
            `).join('');
            
            const filesContainer = document.createElement('div');
            filesContainer.className = 'message-files';
            filesContainer.innerHTML = filesHTML;
            messageElement.querySelector('.message-content').insertBefore(
                filesContainer, 
                messageElement.querySelector('.message-text')
            );
        }

        messagesContainer.appendChild(messageElement);

        // Add event listeners for action buttons
        if (type === 'ai' || type === 'user') {
            const copyBtn = messageElement.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(content);
            });

            if (type === 'ai') {
                const regenerateBtn = messageElement.querySelector('.regenerate-btn');
                regenerateBtn.addEventListener('click', () => {
                    this.regenerateResponse(messageId);
                });
            }
        }

        // Scroll to bottom
        this.scrollToBottom();

        // Update minimap
        if (this.updateMinimap) {
            this.updateMinimap();
        }

        // Save chat
        this.saveCurrentChat();

        return messageId;
    }

    formatMessage(content) {
        // Basic markdown support
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Convert URLs to links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    async generateAIResponse(userMessage, thinkingId) {
        this.isGenerating = true;
        this.toggleSendButton();

        try {
            // Remove thinking indicator
            const thinkingElement = document.getElementById(`msg-${thinkingId}`);
            if (thinkingElement) {
                thinkingElement.remove();
            }

            // Simulate AI response (replace with actual AI API call)
            let response = 'Это демонстрационный ответ. В реальном приложении здесь будет ответ от выбранной модели ИИ. ';
            
            // Add model-specific responses
            switch (this.currentModel) {
                case 'khai':
                    response += 'KHAI AI - первый белорусский ИИ-помощник готов помочь вам с любыми вопросами!';
                    break;
                case 'gpt5':
                    response += 'GPT-5 Nano предоставляет быстрые и точные ответы на ваши запросы.';
                    break;
                case 'claude':
                    response += 'Claude Sonnet специализируется на сложных аналитических задачах.';
                    break;
            }

            // Add some context based on user message
            if (userMessage.toLowerCase().includes('привет')) {
                response = 'Привет! Рад вас видеть. Чем могу помочь?';
            } else if (userMessage.toLowerCase().includes('погода')) {
                response = 'К сожалению, я не могу предоставить актуальные данные о погоде в демо-режиме.';
            } else if (userMessage.toLowerCase().includes('код')) {
                response = 'Вот пример кода:\n\n```javascript\nfunction helloWorld() {\n    console.log("Привет, мир!");\n}\n\nhelloWorld();\n```';
            }

            // Simulate typing effect
            await this.typeMessage(response, 'ai');

        } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Remove thinking indicator
            const thinkingElement = document.getElementById(`msg-${thinkingId}`);
            if (thinkingElement) {
                thinkingElement.remove();
            }
            
            this.addMessage('error', 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.');
        } finally {
            this.isGenerating = false;
            this.toggleSendButton();
        }
    }

    async typeMessage(content, type) {
        const messageId = this.addMessage(type, '');
        const messageElement = document.getElementById(`msg-${messageId}`);
        const messageText = messageElement.querySelector('.message-text');

        let displayedContent = '';
        const characters = content.split('');

        for (let char of characters) {
            displayedContent += char;
            messageText.innerHTML = this.formatMessage(displayedContent);
            
            // Scroll to bottom as content grows
            this.scrollToBottom();
            
            // Random typing speed for natural feel
            await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 10));
        }

        // Add message actions after typing complete
        const actionsHTML = `
            <div class="message-actions">
                <button class="action-btn copy-btn" title="Копировать">
                    <i class="ti ti-copy"></i>
                </button>
                <button class="action-btn regenerate-btn" title="Перегенерировать">
                    <i class="ti ti-refresh"></i>
                </button>
            </div>
        `;
        
        messageElement.querySelector('.message-content').insertAdjacentHTML('beforeend', actionsHTML);

        // Add event listeners
        const copyBtn = messageElement.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(content);
        });

        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        regenerateBtn.addEventListener('click', () => {
            this.regenerateResponse(messageId);
        });

        // Save chat after complete message
        this.saveCurrentChat();
    }

    async regenerateResponse(messageId) {
        if (this.isGenerating) return;

        const messageElement = document.getElementById(`msg-${messageId}`);
        if (!messageElement) return;

        // Find the user message that prompted this response
        const messages = Array.from(document.querySelectorAll('.message'));
        const currentIndex = messages.indexOf(messageElement);
        
        if (currentIndex > 0) {
            const userMessageElement = messages[currentIndex - 1];
            if (userMessageElement.classList.contains('user')) {
                const userMessage = userMessageElement.querySelector('.message-text').textContent;
                
                // Remove current AI response
                messageElement.remove();
                
                // Generate new response
                await this.generateAIResponse(userMessage, null);
            }
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showTemporaryMessage('Скопировано в буфер обмена');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showError('Не удалось скопировать текст');
        });
    }

    createNewChat() {
        const chatId = Date.now().toString();
        const chatName = `Чат ${this.chats.size + 1}`;
        
        const chat = {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.chats.set(chatId, chat);
        this.currentChatId = chatId;
        
        this.updateChatList();
        this.clearMessagesContainer();
        this.updateCurrentChatName(chatName);
        this.saveChats();
        
        localStorage.setItem('khai-last-chat', chatId);
    }

    loadChat(chatId) {
        const chat = this.chats.get(chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.clearMessagesContainer();
            this.updateCurrentChatName(chat.name);
            
            // Recreate messages
            chat.messages.forEach(msg => {
                this.addMessage(msg.type, msg.content, msg.files || []);
            });
            
            localStorage.setItem('khai-last-chat', chatId);
        }
    }

    clearCurrentChat() {
        if (this.currentChatId && confirm('Вы уверены, что хотите очистить текущий чат?')) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages = [];
                chat.updatedAt = new Date().toISOString();
                this.clearMessagesContainer();
                this.saveChats();
            }
        }
    }

    downloadCurrentChat() {
        if (!this.currentChatId) return;

        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;

        const chatData = {
            title: chat.name,
            exportedAt: new Date().toISOString(),
            messages: chat.messages
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearMessagesContainer() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;

        const chatsArray = Array.from(this.chats.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        chatList.innerHTML = chatsArray.map(chat => `
            <div class="chat-item ${chat.id === this.currentChatId ? 'active' : ''}" data-chat="${chat.id}">
                <div class="chat-item-icon">
                    <i class="ti ti-message"></i>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-name">${chat.name}</div>
                    <div class="chat-item-date">${this.formatDate(chat.updatedAt)}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat-btn" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-action-btn delete-chat-btn" title="Удалить">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        chatList.querySelectorAll('.chat-item').forEach(item => {
            const chatId = item.dataset.chat;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.loadChat(chatId);
                    this.toggleSidebar();
                }
            });

            const editBtn = item.querySelector('.edit-chat-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editChatName(chatId);
            });

            const deleteBtn = item.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chatId);
            });
        });
    }

    editChatName(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;

        const modal = document.getElementById('editChatModal');
        const input = document.getElementById('editChatNameInput');
        const clearBtn = document.getElementById('modalClearInput');
        const cancelBtn = document.getElementById('editChatModalCancel');
        const saveBtn = document.getElementById('editChatModalSave');
        const closeBtn = document.getElementById('editChatModalClose');

        input.value = chat.name;
        clearBtn.style.display = input.value ? 'flex' : 'none';

        const clearInput = () => {
            input.value = '';
            clearBtn.style.display = 'none';
        };

        const saveChat = () => {
            const newName = input.value.trim() || `Чат ${chatId.slice(-4)}`;
            chat.name = newName;
            chat.updatedAt = new Date().toISOString();
            
            this.updateChatList();
            if (chatId === this.currentChatId) {
                this.updateCurrentChatName(newName);
            }
            this.saveChats();
            modal.classList.remove('active');
        };

        // Clear button
        clearBtn.onclick = clearInput;

        // Input events
        input.oninput = () => {
            clearBtn.style.display = input.value ? 'flex' : 'none';
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') saveChat();
            if (e.key === 'Escape') modal.classList.remove('active');
        };

        // Button events
        cancelBtn.onclick = () => modal.classList.remove('active');
        closeBtn.onclick = () => modal.classList.remove('active');
        saveBtn.onclick = saveChat;

        // Overlay click
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        };

        modal.classList.add('active');
        input.focus();
        input.select();
    }

    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showError('Нельзя удалить последний чат');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                const remainingChats = Array.from(this.chats.keys());
                this.loadChat(remainingChats[0]);
            }
            
            this.updateChatList();
            this.saveChats();
        }
    }

    updateCurrentChatName(name) {
        const currentChatName = document.getElementById('currentChatName');
        if (currentChatName) {
            currentChatName.textContent = name;
        }
    }

    saveCurrentChat() {
        if (!this.currentChatId) return;

        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;

        // Collect messages from DOM
        const messageElements = document.querySelectorAll('.message:not(.message-skeleton)');
        chat.messages = Array.from(messageElements).map(element => {
            const type = Array.from(element.classList)
                .find(cls => ['user', 'ai', 'error', 'thinking'].includes(cls)) || 'ai';
            
            const content = element.querySelector('.message-text').textContent;
            
            return {
                type,
                content,
                timestamp: new Date().toISOString()
            };
        });

        chat.updatedAt = new Date().toISOString();
        this.saveChats();
    }

    saveChats() {
        const chatsArray = Array.from(this.chats.values());
        localStorage.setItem('khai-chats', JSON.stringify(chatsArray));
    }

    setMode(mode) {
        const buttons = document.querySelectorAll('.mode-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        const modeIndicator = document.querySelector('.mode-indicator');
        let icon = 'ti ti-message';
        let text = 'Обычный режим';

        switch (mode) {
            case 'voice':
                document.getElementById('generateVoiceBtn').classList.add('active');
                icon = 'ti ti-microphone';
                text = 'Генерация голоса';
                break;
            case 'image':
                document.getElementById('generateImageBtn').classList.add('active');
                icon = 'ti ti-photo';
                text = 'Генерация изображений';
                break;
            default:
                document.getElementById('normalModeBtn').classList.add('active');
        }

        modeIndicator.innerHTML = `<i class="${icon}"></i> ${text}`;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    scrollToLastAIMessage() {
        const messages = document.querySelectorAll('.message.ai');
        if (messages.length > 0) {
            const lastAIMessage = messages[messages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateConnectionStatus(online) {
        this.isOnline = online;
        const statusElement = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionStatusText');

        if (statusElement && statusText) {
            if (online) {
                statusElement.innerHTML = '<i class="ti ti-circle"></i>';
                statusElement.className = 'connection-status';
                statusText.textContent = 'Подключено';
            } else {
                statusElement.innerHTML = '<i class="ti ti-circle-off"></i>';
                statusElement.className = 'connection-status offline';
                statusText.textContent = 'Офлайн';
            }
        }
    }

    updateAppVersionDate() {
        const versionDateElement = document.getElementById('appVersionDate');
        if (versionDateElement) {
            versionDateElement.textContent = new Date().getFullYear().toString();
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} дн. назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    showError(message) {
        this.showTemporaryMessage(message, 'error');
    }

    showTemporaryMessage(message, type = 'info') {
        const temporaryMessage = document.createElement('div');
        temporaryMessage.className = `temporary-message ${type}`;
        temporaryMessage.textContent = message;
        temporaryMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-bg)' : 'var(--bg-tertiary)'};
            color: ${type === 'error' ? 'var(--error-text)' : 'var(--text-primary)'};
            border: 1px solid ${type === 'error' ? 'var(--error-border)' : 'var(--border-color)'};
            padding: 12px 16px;
            border-radius: var(--radius-md);
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(temporaryMessage);

        setTimeout(() => {
            temporaryMessage.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (temporaryMessage.parentNode) {
                    temporaryMessage.parentNode.removeChild(temporaryMessage);
                }
            }, 300);
        }, 3000);
    }

    handleResize() {
        // Update minimap on resize
        if (this.updateMinimap) {
            this.updateMinimap();
        }
    }

    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }

    show404Page() {
        const page404 = document.getElementById('page404');
        const appContainer = document.getElementById('appContainer');
        
        if (page404 && appContainer) {
            appContainer.style.display = 'none';
            page404.style.display = 'flex';
        }
    }

    hide404Page() {
        const page404 = document.getElementById('page404');
        const appContainer = document.getElementById('appContainer');
        
        if (page404 && appContainer) {
            page404.style.display = 'none';
            appContainer.style.display = 'flex';
        }
    }
}

// CSS for temporary messages
const temporaryStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.temporary-message {
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-lg);
}
`;

// Add temporary styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = temporaryStyles;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a 404 page
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
        const app = new KHAIAssistant();
        app.show404Page();
    } else {
        window.khaiApp = new KHAIAssistant();
    }
});

// Prevent leaving page during generation
window.addEventListener('beforeunload', (e) => {
    if (window.khaiApp && window.khaiApp.isGenerating) {
        e.preventDefault();
        e.returnValue = 'Идет генерация ответа. Вы уверены, что хотите покинуть страницу?';
        return e.returnValue;
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIAssistant;
}
