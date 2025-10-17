// KHAI Chat Application
class KHAIChat {
    constructor() {
        this.state = {
            currentChatId: 'default',
            chats: {},
            attachedFiles: [],
            isRecording: false,
            recognition: null,
            currentEditingChatId: null,
            isStreaming: false,
            currentStreamingMessage: null,
            isProcessing: false
        };
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.bindEvents();
        this.initializeFromStorage();
        this.setupMarked();
        
        // Focus on input
        this.userInput.focus();
        
        this.showNotification('KHAI загружен и готов к работе!', 'success');
    }

    initializeElements() {
        // DOM Elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.voiceToggle = document.getElementById('voiceToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.imageGenBtn = document.getElementById('imageGenBtn');
        this.modelSelect = document.getElementById('modelSelect');
        this.chatList = document.getElementById('chatList');
        this.sidebarNewChat = document.getElementById('sidebarNewChat');
        this.exportChatsBtn = document.getElementById('exportChatsBtn');
        this.importChatsBtn = document.getElementById('importChatsBtn');
        this.clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
        this.currentChatName = document.getElementById('currentChatName');
        this.editChatModal = document.getElementById('editChatModal');
        this.editChatClose = document.getElementById('editChatClose');
        this.editChatCancel = document.getElementById('editChatCancel');
        this.editChatSave = document.getElementById('editChatSave');
        this.editChatInput = document.getElementById('editChatInput');
        this.attachFileBtn = document.getElementById('attachFileBtn');
    }

    bindEvents() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter (but allow Shift+Enter for new line)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.userInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // File attachment
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileAttach(e));
        
        // Voice recording
        this.voiceToggle.addEventListener('click', () => this.toggleVoiceRecording());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Sidebar menu
        this.menuToggle.addEventListener('click', () => this.openSidebar());
        this.sidebarClose.addEventListener('click', () => this.closeSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        
        // Chat actions
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        this.imageGenBtn.addEventListener('click', () => {
            this.modelSelect.value = 'dall-e';
            this.showNotification('Режим генерации изображений активирован', 'info');
        });
        
        // Sidebar actions
        this.sidebarNewChat.addEventListener('click', () => this.createNewChat());
        this.exportChatsBtn.addEventListener('click', () => this.exportChats());
        this.importChatsBtn.addEventListener('click', () => this.importChats());
        this.clearAllChatsBtn.addEventListener('click', () => this.clearAllChats());
        
        // Edit chat modal
        this.editChatClose.addEventListener('click', () => this.closeEditChatModal());
        this.editChatCancel.addEventListener('click', () => this.closeEditChatModal());
        this.editChatSave.addEventListener('click', () => this.saveEditedChatName());
        this.editChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveEditedChatName();
            }
        });
        
        // Model selection
        this.modelSelect.addEventListener('change', () => {
            const model = this.modelSelect.value;
            this.showNotification(`Модель изменена на: ${this.modelSelect.options[this.modelSelect.selectedIndex].text}`, 'info');
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', () => this.saveState());
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

    // Initialize from localStorage
    initializeFromStorage() {
        // Load saved theme
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Update theme button icon
        const themeIcon = this.themeToggle.querySelector('i');
        themeIcon.className = savedTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        // Load saved state
        const savedState = localStorage.getItem('khai-state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            } catch (e) {
                console.error('Error loading state from localStorage:', e);
            }
        }
        
        // Ensure default chat exists
        if (!this.state.chats['default']) {
            this.state.chats['default'] = {
                name: 'Общий чат',
                messages: [
                    {
                        role: 'ai',
                        content: 'Привет! Я KHAI - ваш бесплатный ИИ-помощник. Чем могу помочь?',
                        timestamp: new Date().toISOString()
                    }
                ]
            };
        }
        
        this.renderChatList();
        this.loadCurrentChat();
    }

    // Save state to localStorage
    saveState() {
        localStorage.setItem('khai-state', JSON.stringify(this.state));
    }

    // Render chat list in sidebar
    renderChatList() {
        this.chatList.innerHTML = '';
        Object.keys(this.state.chats).forEach(chatId => {
            const chat = this.state.chats[chatId];
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatId === this.state.currentChatId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-info">
                    <i class="ti ti-message-chatbot"></i>
                    <span>${this.escapeHtml(chat.name)}</span>
                </div>
                <button class="edit-chat-btn" data-chat-id="${chatId}" title="Редактировать чат">
                    <i class="ti ti-pencil"></i>
                </button>
                ${chatId !== 'default' ? `
                    <button class="delete-chat-btn" data-chat-id="${chatId}" title="Удалить чат">
                        <i class="ti ti-trash"></i>
                    </button>
                ` : ''}
            `;
            this.chatList.appendChild(chatItem);

            // Add event listeners
            chatItem.querySelector('.chat-info').addEventListener('click', () => this.switchChat(chatId));
            
            const editBtn = chatItem.querySelector('.edit-chat-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openEditChatModal(chatId);
                });
            }

            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chatId);
                });
            }
        });
    }

    // Load current chat messages
    loadCurrentChat() {
        this.messagesContainer.innerHTML = '';
        const currentChat = this.state.chats[this.state.currentChatId];
        if (currentChat) {
            this.currentChatName.textContent = currentChat.name;
            currentChat.messages.forEach(message => {
                this.addMessageToChat(message.role, message.content, false, message.timestamp);
            });
        }
        this.scrollToBottom();
    }

    // Switch to a different chat
    switchChat(chatId) {
        if (chatId === this.state.currentChatId) return;
        
        this.state.currentChatId = chatId;
        this.saveState();
        this.renderChatList();
        this.loadCurrentChat();
        this.closeSidebar();
        this.showNotification('Переключено на чат: ' + this.state.chats[chatId].name, 'info');
    }

    // Create a new chat
    createNewChat() {
        const chatId = 'chat-' + Date.now();
        this.state.chats[chatId] = {
            name: 'Новый чат ' + (Object.keys(this.state.chats).length),
            messages: []
        };
        this.state.currentChatId = chatId;
        this.saveState();
        this.renderChatList();
        this.loadCurrentChat();
        this.closeSidebar();
        this.showNotification('Создан новый чат', 'success');
    }

    // Delete a chat
    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification('Основной чат нельзя удалить', 'error');
            return;
        }
        
        if (Object.keys(this.state.chats).length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить чат "${this.state.chats[chatId].name}"?`)) {
            delete this.state.chats[chatId];
            // If we're deleting the current chat, switch to default
            if (this.state.currentChatId === chatId) {
                this.state.currentChatId = 'default';
            }
            this.saveState();
            this.renderChatList();
            this.loadCurrentChat();
            this.showNotification('Чат удален', 'success');
        }
    }

    // Clear current chat
    clearCurrentChat() {
        if (this.state.chats[this.state.currentChatId].messages.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить текущий чат?')) {
            this.state.chats[this.state.currentChatId].messages = [];
            this.saveState();
            this.loadCurrentChat();
            this.showNotification('Чат очищен', 'success');
        }
    }

    // Clear all chats
    clearAllChats() {
        if (Object.keys(this.state.chats).length === 1 && this.state.chats[this.state.currentChatId].messages.length === 0) {
            this.showNotification('Все чаты уже пусты', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            Object.keys(this.state.chats).forEach(chatId => {
                this.state.chats[chatId].messages = [];
            });
            this.saveState();
            this.loadCurrentChat();
            this.showNotification('Все чаты очищены', 'success');
        }
    }

    // Open edit chat modal
    openEditChatModal(chatId) {
        this.state.currentEditingChatId = chatId;
        this.editChatInput.value = this.state.chats[chatId].name;
        this.editChatModal.classList.add('active');
        this.editChatInput.focus();
    }

    // Close edit chat modal
    closeEditChatModal() {
        this.editChatModal.classList.remove('active');
        this.state.currentEditingChatId = null;
    }

    // Save edited chat name
    saveEditedChatName() {
        if (!this.state.currentEditingChatId) return;
        
        const newName = this.editChatInput.value.trim();
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        this.state.chats[this.state.currentEditingChatId].name = newName;
        if (this.state.currentEditingChatId === this.state.currentChatId) {
            this.currentChatName.textContent = newName;
        }
        this.saveState();
        this.renderChatList();
        this.closeEditChatModal();
        this.showNotification('Название чата обновлено', 'success');
    }

    // Add message to chat
    addMessageToChat(role, content, saveToState = true, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;
        
        // Parse markdown for AI messages
        if (role === 'ai') {
            const parsedContent = marked.parse(content);
            messageDiv.innerHTML = `
                <div class="message-content">${parsedContent}</div>
                <div class="message-actions">
                    <button class="action-btn-small speak-btn" title="Озвучить ответ">
                        <i class="ti ti-volume"></i>
                        <span>Озвучить</span>
                    </button>
                    <button class="action-btn-small copy-response-btn" title="Скопировать ответ">
                        <i class="ti ti-copy"></i>
                        <span>Копировать</span>
                    </button>
                    ${content.includes('```') ? `
                        <button class="action-btn-small download-html-btn" title="Скачать как HTML">
                            <i class="ti ti-download"></i>
                            <span>HTML</span>
                        </button>
                    ` : ''}
                    ${content.length > 100 ? `
                        <button class="action-btn-small download-txt-btn" title="Скачать как TXT">
                            <i class="ti ti-download"></i>
                            <span>TXT</span>
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Add event listeners for action buttons
            const speakBtn = messageDiv.querySelector('.speak-btn');
            speakBtn.addEventListener('click', () => this.toggleSpeech(content, speakBtn));
            
            const copyBtn = messageDiv.querySelector('.copy-response-btn');
            copyBtn.addEventListener('click', () => this.copyToClipboard(content, copyBtn));
            
            const downloadHtmlBtn = messageDiv.querySelector('.download-html-btn');
            if (downloadHtmlBtn) {
                downloadHtmlBtn.addEventListener('click', () => this.downloadAsHTML(content));
            }
            
            const downloadTxtBtn = messageDiv.querySelector('.download-txt-btn');
            if (downloadTxtBtn) {
                downloadTxtBtn.addEventListener('click', () => this.downloadAsTXT(content));
            }
            
            // Apply syntax highlighting
            setTimeout(() => {
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                    
                    // Add copy button to code blocks
                    const pre = block.parentElement;
                    if (!pre.querySelector('.copy-code-btn')) {
                        const codeHeader = document.createElement('div');
                        codeHeader.className = 'code-header';
                        
                        const language = block.className.replace('language-', '') || 'code';
                        const languageSpan = document.createElement('span');
                        languageSpan.className = 'code-language';
                        languageSpan.textContent = language;
                        
                        const copyBtn = document.createElement('button');
                        copyBtn.className = 'copy-code-btn';
                        copyBtn.innerHTML = '<i class="ti ti-copy"></i><span>Копировать</span>';
                        copyBtn.addEventListener('click', () => this.copyToClipboard(block.textContent, copyBtn));
                        
                        codeHeader.appendChild(languageSpan);
                        codeHeader.appendChild(copyBtn);
                        pre.insertBefore(codeHeader, block);
                    }
                });
            }, 0);
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${content}</div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        
        if (saveToState) {
            this.state.chats[this.state.currentChatId].messages.push({
                role,
                content,
                timestamp: timestamp || new Date().toISOString()
            });
            this.saveState();
        }
        
        this.scrollToBottom();
        return messageDiv;
    }

    // Toggle speech synthesis
    toggleSpeech(text, button) {
        if (!window.speechSynthesis) {
            this.showNotification('Браузер не поддерживает синтез речи', 'error');
            return;
        }
        
        if (button.classList.contains('speaking')) {
            // Stop speaking
            window.speechSynthesis.cancel();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-volume"></i><span>Озвучить</span>';
        } else {
            // Start speaking
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onstart = () => {
                button.classList.add('speaking');
                button.innerHTML = '<i class="ti ti-square"></i><span>Остановить</span>';
            };
            
            utterance.onend = () => {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-volume"></i><span>Озвучить</span>';
            };
            
            utterance.onerror = () => {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-volume"></i><span>Озвучить</span>';
                this.showNotification('Ошибка воспроизведения', 'error');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // Copy text to clipboard
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            if (button) {
                const originalHTML = button.innerHTML;
                button.classList.add('copied');
                button.innerHTML = '<i class="ti ti-check"></i><span>Скопировано</span>';
                
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = originalHTML;
                }, 2000);
            }
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Не удалось скопировать текст', 'error');
        });
    }

    // Download content as HTML
    downloadAsHTML(content) {
        const blob = new Blob([`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KHAI - Ответ ИИ</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    ${marked.parse(content)}
</body>
</html>`], { type: 'text/html' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-response-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('HTML файл скачан', 'success');
    }

    // Download content as TXT
    downloadAsTXT(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-response-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Текстовый файл скачан', 'success');
    }

    // Export chats
    exportChats() {
        const dataStr = JSON.stringify(this.state.chats, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chats-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чаты экспортированы', 'success');
    }

    // Import chats
    importChats() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const importedChats = JSON.parse(event.target.result);
                    if (typeof importedChats === 'object') {
                        this.state.chats = { ...this.state.chats, ...importedChats };
                        this.saveState();
                        this.renderChatList();
                        this.showNotification('Чаты импортированы', 'success');
                    } else {
                        this.showNotification('Неверный формат файла', 'error');
                    }
                } catch (err) {
                    console.error('Error importing chats:', err);
                    this.showNotification('Ошибка при импорте чатов', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Handle file attachment
    handleFileAttach(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        files.forEach(file => {
            if (this.state.attachedFiles.length >= 5) {
                this.showNotification('Можно прикрепить не более 5 файлов', 'error');
                return;
            }
            
            this.state.attachedFiles.push(file);
            
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-file-text"></i>
                <span>${file.name}</span>
                <button class="remove-file" data-file-name="${file.name}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
            
            // Add event listener to remove button
            fileElement.querySelector('.remove-file').addEventListener('click', (e) => {
                const fileName = e.currentTarget.getAttribute('data-file-name');
                this.state.attachedFiles = this.state.attachedFiles.filter(f => f.name !== fileName);
                fileElement.remove();
            });
        });
        
        // Reset file input
        this.fileInput.value = '';
    }

    // Remove all attached files
    removeAllAttachedFiles() {
        this.state.attachedFiles = [];
        this.attachedFiles.innerHTML = '';
    }

    // Send message
    async sendMessage() {
        if (this.state.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        const message = this.userInput.value.trim();
        if (!message && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'error');
            return;
        }

        this.state.isProcessing = true;
        this.sendButton.disabled = true;

        try {
            // Add user message
            this.addMessageToChat('user', message);
            this.userInput.value = '';
            this.removeAllAttachedFiles();
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>KHAI печатает...</span>
            `;
            this.messagesContainer.appendChild(typingIndicator);
            this.scrollToBottom();
            
            // Simulate AI response (in a real app, this would be an API call)
            setTimeout(() => {
                typingIndicator.remove();
                
                // Generate response based on message and model
                const model = this.modelSelect.value;
                let response = this.generateAIResponse(message, model);
                
                // Add AI response
                this.addMessageToChat('ai', response);
                
                this.state.isProcessing = false;
                this.sendButton.disabled = false;
            }, 1500);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Ошибка при отправке сообщения', 'error');
            this.state.isProcessing = false;
            this.sendButton.disabled = false;
        }
    }

    // Generate AI response based on message and model
    generateAIResponse(message, model) {
        const responses = {
            'gpt-3.5': [
                `Я проанализировал ваш запрос: "${message}". Как ИИ-помощник KHAI, я могу помочь вам с различными задачами, включая ответы на вопросы, генерацию текста, решение проблем и многое другое.`,
                `На основе вашего сообщения "${message}", я могу предложить несколько решений или идей. Не стесняйтесь задавать уточняющие вопросы!`,
                `Спасибо за ваш запрос! Я готов помочь с "${message}". Пожалуйста, уточните, если вам нужна более конкретная информация.`
            ],
            'gpt-4': [
                `Как продвинутая модель KHAI, я глубоко проанализировал ваш запрос "${message}" и могу предложить комплексное решение. Мои возможности включают сложный анализ, креативную генерацию и решение нетривиальных задач.`,
                `Ваш запрос "${message}" затрагивает интересную тему. Используя расширенные возможности KHAI, я могу предоставить детализированный ответ и предложить несколько перспективных направлений для рассмотрения.`,
                `Благодаря улучшенным алгоритмам KHAI, я могу предложить более точный и содержательный ответ на ваш запрос "${message}". Что именно вас интересует в этой теме?`
            ],
            'claude': [
                `Как ИИ-ассистент KHAI с фокусом на безопасность и полезность, я рассмотрел ваш запрос "${message}". Я стремлюсь предоставлять честные, точные и полезные ответы.`,
                `Ваш вопрос "${message}" интересен. Как часть KHAI, я уделяю особое внимание ясности и точности в ответах. Есть ли конкретные аспекты, которые вы хотели бы обсудить?`,
                `Я проанализировал "${message}" с точки зрения предоставления наиболее полезного и безопасного ответа. KHAI предназначен для помощи пользователям в решении различных задач эффективно и этично.`
            ],
            'gemini': [
                `Как мультимодальный ИИ KHAI, я могу работать с различными типами информации. Ваш запрос "${message}" получен, и я готов предоставить комплексный ответ.`,
                `Используя возможности KHAI для обработки разных форматов данных, я рассмотрел ваш вопрос "${message}". Могу ли я помочь чем-то еще?`,
                `KHAI способен понимать контекст и нюансы в запросах. Ваше сообщение "${message}" обработано, и я готов предложить релевантную информацию.`
            ],
            'dall-e': [
                `Как часть системы генерации изображений KHAI, я могу создать визуализацию для: "${message}". В реальной реализации здесь было бы сгенерированное изображение.`,
                `KHAI DALL-E готов создать изображение на основе вашего описания: "${message}". В демо-версии мы показываем этот текст вместо реального изображения.`,
                `Ваш запрос на генерацию изображения: "${message}" получен. KHAI DALL-E обработает его и создаст уникальную визуализацию.`
            ]
        };
        
        const modelResponses = responses[model] || responses['gpt-3.5'];
        return modelResponses[Math.floor(Math.random() * modelResponses.length)];
    }

    // Toggle voice recording
    toggleVoiceRecording() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Браузер не поддерживает распознавание речи', 'error');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!this.state.recognition) {
            this.state.recognition = new SpeechRecognition();
            this.state.recognition.continuous = false;
            this.state.recognition.interimResults = true;
            this.state.recognition.lang = 'ru-RU';
            
            this.state.recognition.onstart = () => {
                this.state.isRecording = true;
                this.voiceToggle.classList.add('active');
                this.showNotification('Голосовой ввод активирован', 'info');
            };
            
            this.state.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    } else {
                        transcript += event.results[i][0].transcript;
                    }
                }
                this.userInput.value = transcript;
                this.autoResizeTextarea();
            };
            
            this.state.recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                this.showNotification('Ошибка распознавания речи: ' + event.error, 'error');
                this.state.isRecording = false;
                this.voiceToggle.classList.remove('active');
            };
            
            this.state.recognition.onend = () => {
                this.state.isRecording = false;
                this.voiceToggle.classList.remove('active');
            };
        }
        
        if (this.state.isRecording) {
            this.state.recognition.stop();
        } else {
            this.state.recognition.start();
        }
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        
        // Update button icon
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }

    // Open sidebar
    openSidebar() {
        this.sidebarMenu.classList.add('active');
        this.sidebarOverlay.classList.add('active');
    }

    // Close sidebar
    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        }, 50);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Auto-resize textarea
    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Preload voices for speech synthesis
        if ('speechSynthesis' in window) {
            speechSynthesis.getVoices();
        }
        
        // Initialize application
        new KHAIChat();
        
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
