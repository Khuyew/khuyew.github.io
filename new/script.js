// Main application script
class KHAIChat {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-5-nano';
        this.isGenerating = false;
        this.isVoiceMode = false;
        this.isScrolling = false;
        this.scrollTimer = null;
        this.notifications = [];
        this.typingAnimation = null;
        this.currentTypingMessage = null;
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadChats();
        this.showPWAInstallPrompt();
    }
    
    initializeApp() {
        // Initialize chat if none exists
        if (!this.chats.has(this.currentChatId)) {
            this.chats.set(this.currentChatId, {
                id: this.currentChatId,
                name: 'Основной чат',
                messages: [],
                createdAt: new Date()
            });
        }
        
        this.renderChatList();
        this.renderMessages();
        this.updateCurrentChatInfo();
        
        // Initialize theme
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Initialize marked for markdown rendering
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
    }
    
    setupEventListeners() {
        // Input handling
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        
        userInput.addEventListener('input', this.handleInputChange.bind(this));
        userInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        
        // Voice input
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        
        // File attachment
        const attachFileBtn = document.getElementById('attachFileBtn');
        const fileInput = document.getElementById('fileInput');
        
        attachFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Clear input
        const clearInputBtn = document.getElementById('clearInputBtn');
        clearInputBtn.addEventListener('click', this.clearInput.bind(this));
        
        // Sidebar menu
        const menuToggle = document.getElementById('menuToggle');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        menuToggle.addEventListener('click', this.toggleSidebar.bind(this));
        sidebarClose.addEventListener('click', this.toggleSidebar.bind(this));
        sidebarOverlay.addEventListener('click', this.toggleSidebar.bind(this));
        
        // Chat actions
        const newChatBtn = document.getElementById('newChatBtn');
        const deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
        const importChatBtn = document.getElementById('importChatBtn');
        const downloadAllChatsBtn = document.getElementById('downloadAllChatsBtn');
        
        newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        deleteAllChatsBtn.addEventListener('click', this.deleteAllChats.bind(this));
        importChatBtn.addEventListener('click', this.importChat.bind(this));
        downloadAllChatsBtn.addEventListener('click', this.downloadAllChats.bind(this));
        
        // Search
        const chatSearchInput = document.getElementById('chatSearchInput');
        const searchMessagesBtn = document.getElementById('searchMessagesBtn');
        const searchMessagesClose = document.getElementById('searchMessagesClose');
        const searchMessagesInput = document.getElementById('searchMessagesInput');
        
        chatSearchInput.addEventListener('input', this.filterChats.bind(this));
        searchMessagesBtn.addEventListener('click', this.openSearchMessagesModal.bind(this));
        searchMessagesClose.addEventListener('click', this.closeSearchMessagesModal.bind(this));
        searchMessagesInput.addEventListener('input', this.searchMessages.bind(this));
        
        // Navigation controls
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
        const nextMessageBtn = document.getElementById('nextMessageBtn');
        
        scrollToTopBtn.addEventListener('click', () => this.scrollTo('top'));
        scrollToBottomBtn.addEventListener('click', () => this.scrollTo('bottom'));
        nextMessageBtn.addEventListener('click', () => this.scrollTo('next'));
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Model selection
        const modelSelect = document.getElementById('modelSelect');
        modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.showNotification(`Модель изменена на: ${e.target.options[e.target.selectedIndex].text}`, 'info');
        });
        
        // Action buttons
        const helpBtn = document.getElementById('helpBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const generateImageBtn = document.getElementById('generateImageBtn');
        const generateVoiceBtn = document.getElementById('generateVoiceBtn');
        
        helpBtn.addEventListener('click', this.showHelp.bind(this));
        clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        generateImageBtn.addEventListener('click', this.generateImage.bind(this));
        generateVoiceBtn.addEventListener('click', this.generateVoice.bind(this));
        
        // Scroll handling for compact mode
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // PWA install
        const pwaInstall = document.getElementById('pwaInstall');
        const pwaDismiss = document.getElementById('pwaDismiss');
        
        pwaInstall.addEventListener('click', this.installPWA.bind(this));
        pwaDismiss.addEventListener('click', this.dismissPWA.bind(this));
        
        // Handle before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });
        
        // Handle online/offline status
        window.addEventListener('online', this.updateStatusIndicator.bind(this));
        window.addEventListener('offline', this.updateStatusIndicator.bind(this));
        this.updateStatusIndicator();
    }
    
    handleInputChange(e) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Update clear button visibility
        const clearInputBtn = document.getElementById('clearInputBtn');
        clearInputBtn.style.display = textarea.value ? 'flex' : 'none';
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const attachedFiles = document.getElementById('attachedFiles');
        const files = Array.from(attachedFiles.querySelectorAll('.attached-file')).map(file => {
            return {
                name: file.dataset.name,
                type: file.dataset.type,
                content: file.dataset.content
            };
        });
        
        if (!message && files.length === 0) return;
        
        // Clear input and files
        userInput.value = '';
        userInput.style.height = 'auto';
        attachedFiles.innerHTML = '';
        document.getElementById('clearInputBtn').style.display = 'none';
        
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            files: files,
            timestamp: new Date()
        };
        
        this.addMessageToCurrentChat(userMessage);
        this.renderMessages();
        this.scrollToBottom();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response (replace with actual API call)
        setTimeout(async () => {
            this.hideTypingIndicator();
            
            const aiResponse = await this.generateAIResponse(message, files);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: aiResponse,
                model: this.currentModel,
                timestamp: new Date()
            };
            
            this.addMessageToCurrentChat(aiMessage);
            this.renderMessages();
            this.scrollToBottom();
            
            // Show push notification when response is complete
            if (document.hidden) {
                this.showPushNotification('KHAI ответил', aiResponse.substring(0, 100) + '...');
            }
            
            // Auto-speak if voice mode is active
            if (this.isVoiceMode) {
                this.speakMessage(aiResponse);
            }
        }, 1000 + Math.random() * 2000);
    }
    
    async generateAIResponse(message, files) {
        // This is a mock implementation - replace with actual AI API calls
        let response = '';
        
        if (files.length > 0) {
            response = `Я проанализировал прикреплённые файлы (${files.map(f => f.name).join(', ')}). `;
            
            if (message) {
                response += `На основе вашего вопроса "${message}", я могу сказать следующее: `;
            } else {
                response += 'Вот что я могу сказать о содержимом файлов: ';
            }
            
            response += 'Это интересный материал, который требует более глубокого анализа. ';
            
            if (files.some(f => f.type.startsWith('image/'))) {
                response += 'Изображения содержат визуальную информацию, которую я обработал. ';
            }
            
            response += 'Если у вас есть конкретные вопросы по содержанию, задавайте их, и я постараюсь помочь более детально.';
        } else if (message.toLowerCase().includes('привет') || message.toLowerCase().includes('здравствуй')) {
            response = 'Привет! Я KHAI — первый белорусский ИИ-ассистент. Чем могу помочь?';
        } else if (message.toLowerCase().includes('погода')) {
            response = 'К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить специализированные сервисы для получения точной информации.';
        } else if (message.toLowerCase().includes('помощь')) {
            response = 'Я могу помочь с различными задачами: ответить на вопросы, сгенерировать текст, проанализировать изображения, создать голосовые сообщения. Просто опишите, что вам нужно!';
        } else {
            const responses = [
                'Интересный вопрос! На основе моих знаний могу сказать, что это перспективное направление для изучения.',
                'Спасибо за вопрос! Это действительно важная тема, которая требует внимательного рассмотрения.',
                'Отличный вопрос! Я проанализировал информацию и могу предложить следующий ответ...',
                'На основе предоставленных данных, я пришёл к следующим выводам...',
                'Это сложный вопрос, требующий многостороннего подхода. Вот что я могу сказать по этому поводу...'
            ];
            
            response = responses[Math.floor(Math.random() * responses.length)];
            
            // Add some context-specific responses
            if (message.length > 100) {
                response += ' Вы предоставили подробное описание, что помогает мне лучше понять суть вопроса.';
            }
            
            if (message.includes('?')) {
                response += ' Если у вас есть дополнительные вопросы, не стесняйтесь задавать их!';
            }
        }
        
        return response;
    }
    
    addMessageToCurrentChat(message) {
        const chat = this.chats.get(this.currentChatId);
        chat.messages.push(message);
        chat.updatedAt = new Date();
        
        // Update chat preview
        if (message.type === 'user') {
            chat.preview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
        }
        
        this.saveChats();
        this.renderChatList();
    }
    
    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        const chat = this.chats.get(this.currentChatId);
        
        if (!chat) return;
        
        messagesContainer.innerHTML = '';
        
        chat.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        // Add typing indicator if active
        if (this.currentTypingMessage) {
            messagesContainer.appendChild(this.createTypingIndicator());
        }
    }
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.type}`;
        messageDiv.dataset.messageId = message.id;
        
        let content = '';
        
        if (message.type === 'user') {
            // User message
            if (message.files && message.files.length > 0) {
                content += '<div class="message-files">';
                message.files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        content += `<div class="message-image"><img src="${file.content}" alt="${file.name}"></div>`;
                    } else {
                        content += `<div class="file-attachment"><i class="ti ti-file"></i> ${file.name}</div>`;
                    }
                });
                content += '</div>';
            }
            
            if (message.content) {
                content += `<div class="message-content">${this.escapeHtml(message.content)}</div>`;
            }
        } else {
            // AI message
            content += `<div class="message-content">${marked.parse(message.content)}</div>`;
            
            // Add model indicator
            if (message.model) {
                content += `<div class="model-indicator">Сгенерировано с помощью: ${message.model}</div>`;
            }
            
            // Add message actions
            content += `
                <div class="message-actions">
                    <button class="action-btn-small speak-btn" onclick="khaiChat.speakMessage('${this.escapeSingleQuotes(message.content)}')">
                        <i class="ti ti-volume"></i> Озвучить
                    </button>
                    <button class="action-btn-small" onclick="khaiChat.copyMessage('${this.escapeSingleQuotes(message.content)}')">
                        <i class="ti ti-copy"></i> Копировать
                    </button>
                    <button class="action-btn-small" onclick="khaiChat.downloadMessage('${message.id}')">
                        <i class="ti ti-download"></i> Скачать
                    </button>
                </div>
            `;
        }
        
        messageDiv.innerHTML = content;
        
        // Add code copy functionality
        messageDiv.querySelectorAll('pre code').forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            const language = codeBlock.className.replace('language-', '') || 'text';
            
            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            codeHeader.innerHTML = `
                <span class="code-language">${language}</span>
                <button class="copy-code-btn">
                    <i class="ti ti-copy"></i> Копировать
                </button>
            `;
            
            pre.insertBefore(codeHeader, codeBlock);
            
            const copyBtn = codeHeader.querySelector('.copy-code-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyBtn.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });
        });
        
        return messageDiv;
    }
    
    createTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div>KHAI печатает</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        return typingDiv;
    }
    
    showTypingIndicator() {
        this.currentTypingMessage = true;
        this.renderMessages();
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.currentTypingMessage = false;
        this.renderMessages();
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    scrollTo(position) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messages = Array.from(messagesContainer.querySelectorAll('.message'));
        
        if (position === 'top') {
            messagesContainer.scrollTop = 0;
        } else if (position === 'bottom') {
            this.scrollToBottom();
        } else if (position === 'next') {
            const currentScroll = messagesContainer.scrollTop;
            const containerHeight = messagesContainer.clientHeight;
            
            for (let i = 0; i < messages.length; i++) {
                const messageTop = messages[i].offsetTop;
                if (messageTop > currentScroll + 100) {
                    messagesContainer.scrollTop = messageTop - 20;
                    break;
                }
            }
        }
    }
    
    handleScroll() {
        const messagesContainer = document.getElementById('messagesContainer');
        const appHeader = document.querySelector('.app-header');
        const appFooter = document.querySelector('.app-footer');
        const inputSection = document.querySelector('.input-section');
        const navigationControls = document.getElementById('navigationControls');
        const chatMain = document.querySelector('.chat-main');
        const messages = document.querySelector('.messages-container');
        
        // Show/hide navigation controls based on scroll position
        if (messagesContainer.scrollTop > 100) {
            navigationControls.classList.remove('hidden');
        } else {
            navigationControls.classList.add('hidden');
        }
        
        // Handle compact mode on scroll
        clearTimeout(this.scrollTimer);
        
        if (!this.isScrolling) {
            this.isScrolling = true;
            appHeader.classList.add('compact');
            appFooter.classList.add('compact');
            inputSection.classList.add('compact');
            chatMain.classList.add('expanded');
            messages.classList.add('expanded');
        }
        
        this.scrollTimer = setTimeout(() => {
            this.isScrolling = false;
            appHeader.classList.remove('compact');
            appFooter.classList.remove('compact');
            inputSection.classList.remove('compact');
            chatMain.classList.remove('expanded');
            messages.classList.remove('expanded');
        }, 1500);
    }
    
    toggleVoiceInput() {
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        
        if (!this.isVoiceMode) {
            // Start voice input
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = 'ru-RU';
                
                this.recognition.onstart = () => {
                    this.isVoiceMode = true;
                    voiceInputBtn.classList.add('active');
                    this.showNotification('Голосовой ввод активирован. Говорите...', 'info');
                };
                
                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    document.getElementById('userInput').value = transcript;
                    this.handleInputChange({ target: document.getElementById('userInput') });
                };
                
                this.recognition.onerror = (event) => {
                    this.showNotification('Ошибка распознавания голоса: ' + event.error, 'error');
                    this.isVoiceMode = false;
                    voiceInputBtn.classList.remove('active');
                };
                
                this.recognition.onend = () => {
                    this.isVoiceMode = false;
                    voiceInputBtn.classList.remove('active');
                };
                
                this.recognition.start();
            } else {
                this.showNotification('Голосовой ввод не поддерживается вашим браузером', 'error');
            }
        } else {
            // Stop voice input
            if (this.recognition) {
                this.recognition.stop();
            }
            this.isVoiceMode = false;
            voiceInputBtn.classList.remove('active');
        }
    }
    
    speakMessage(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            // Find and update the speak button for this message
            const speakButtons = document.querySelectorAll('.speak-btn');
            speakButtons.forEach(btn => btn.classList.remove('speaking'));
            
            const currentMessage = document.querySelector(`[data-message-id] .speak-btn`);
            if (currentMessage) {
                currentMessage.classList.add('speaking');
            }
            
            utterance.onend = () => {
                speakButtons.forEach(btn => btn.classList.remove('speaking'));
            };
            
            utterance.onerror = () => {
                speakButtons.forEach(btn => btn.classList.remove('speaking'));
                this.showNotification('Ошибка воспроизведения голоса', 'error');
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            this.showNotification('Голосовое воспроизведение не поддерживается вашим браузером', 'error');
        }
    }
    
    handleFileUpload(event) {
        const files = event.target.files;
        const attachedFiles = document.getElementById('attachedFiles');
        
        for (let file of files) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileElement = document.createElement('div');
                fileElement.className = 'attached-file';
                fileElement.dataset.name = file.name;
                fileElement.dataset.type = file.type;
                fileElement.dataset.content = e.target.result;
                
                fileElement.innerHTML = `
                    <i class="ti ti-file"></i>
                    <span>${file.name}</span>
                    <button class="remove-file" onclick="this.parentElement.remove()">
                        <i class="ti ti-x"></i>
                    </button>
                `;
                
                attachedFiles.appendChild(fileElement);
            };
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
        
        // Reset file input
        event.target.value = '';
    }
    
    clearInput() {
        document.getElementById('userInput').value = '';
        document.getElementById('userInput').style.height = 'auto';
        document.getElementById('attachedFiles').innerHTML = '';
        document.getElementById('clearInputBtn').style.display = 'none';
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
    
    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Новый чат ${this.chats.size + 1}`;
        
        this.chats.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date()
        });
        
        this.currentChatId = chatId;
        this.saveChats();
        this.renderChatList();
        this.renderMessages();
        this.updateCurrentChatInfo();
        this.toggleSidebar();
        
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }
    
    switchChat(chatId) {
        this.currentChatId = chatId;
        this.renderMessages();
        this.updateCurrentChatInfo();
        this.toggleSidebar();
        this.scrollToBottom();
    }
    
    deleteChat(chatId, event) {
        event.stopPropagation();
        
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить единственный чат', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                // Switch to another chat
                const remainingChats = Array.from(this.chats.keys());
                this.currentChatId = remainingChats[0];
                this.renderMessages();
                this.updateCurrentChatInfo();
            }
            
            this.saveChats();
            this.renderChatList();
            this.showNotification('Чат удалён', 'success');
        }
    }
    
    renameChat(chatId, event) {
        event.stopPropagation();
        
        const chat = this.chats.get(chatId);
        const newName = prompt('Введите новое название чата:', chat.name);
        
        if (newName && newName.trim()) {
            chat.name = newName.trim();
            this.saveChats();
            this.renderChatList();
            this.updateCurrentChatInfo();
            this.showNotification('Название чата изменено', 'success');
        }
    }
    
    downloadChat(chatId, event) {
        event.stopPropagation();
        
        const chat = this.chats.get(chatId);
        const chatData = {
            ...chat,
            messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            })),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt ? chat.updatedAt.toISOString() : null
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
        
        this.showNotification(`Чат "${chat.name}" скачан`, 'success');
    }
    
    deleteAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            const defaultChat = this.chats.get('default');
            this.chats.clear();
            
            if (defaultChat) {
                this.chats.set('default', {
                    ...defaultChat,
                    messages: []
                });
                this.currentChatId = 'default';
            } else {
                this.createNewChat();
            }
            
            this.saveChats();
            this.renderChatList();
            this.renderMessages();
            this.updateCurrentChatInfo();
            
            this.showNotification('Все чаты удалены', 'success');
        }
    }
    
    importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const chatData = JSON.parse(event.target.result);
                    
                    // Validate chat data structure
                    if (!chatData.id || !chatData.name || !Array.isArray(chatData.messages)) {
                        throw new Error('Неверный формат файла чата');
                    }
                    
                    // Generate new ID to avoid conflicts
                    chatData.id = 'imported-' + Date.now();
                    chatData.createdAt = new Date(chatData.createdAt);
                    
                    if (chatData.updatedAt) {
                        chatData.updatedAt = new Date(chatData.updatedAt);
                    }
                    
                    // Convert message timestamps
                    chatData.messages = chatData.messages.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    
                    this.chats.set(chatData.id, chatData);
                    this.saveChats();
                    this.renderChatList();
                    this.showNotification(`Чат "${chatData.name}" импортирован`, 'success');
                    
                } catch (error) {
                    this.showNotification('Ошибка импорта чата: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    downloadAllChats() {
        const allChats = Array.from(this.chats.values()).map(chat => ({
            ...chat,
            messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            })),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt ? chat.updatedAt.toISOString() : null
        }));
        
        const blob = new Blob([JSON.stringify(allChats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-all-chats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Все чаты скачаны', 'success');
    }
    
    filterChats() {
        const searchTerm = document.getElementById('chatSearchInput').value.toLowerCase();
        const chatItems = document.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            const chatPreview = item.querySelector('.chat-preview').textContent.toLowerCase();
            
            if (chatName.includes(searchTerm) || chatPreview.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    openSearchMessagesModal() {
        document.getElementById('searchMessagesModal').classList.add('active');
    }
    
    closeSearchMessagesModal() {
        document.getElementById('searchMessagesModal').classList.remove('active');
        document.getElementById('searchMessagesInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
    
    searchMessages() {
        const searchTerm = document.getElementById('searchMessagesInput').value.toLowerCase();
        const searchResults = document.getElementById('searchResults');
        
        if (!searchTerm) {
            searchResults.innerHTML = '';
            return;
        }
        
        const currentChat = this.chats.get(this.currentChatId);
        const results = currentChat.messages.filter(msg => 
            msg.content.toLowerCase().includes(searchTerm)
        );
        
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Сообщения не найдены</div>';
            return;
        }
        
        results.forEach(msg => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="search-result-content">${msg.content.substring(0, 100)}...</div>
                <div class="search-result-meta">
                    <span>${msg.type === 'user' ? 'Вы' : 'KHAI'}</span>
                    <span>${msg.timestamp.toLocaleString()}</span>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                this.closeSearchMessagesModal();
                this.scrollToMessage(msg.id);
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the message temporarily
            messageElement.style.backgroundColor = 'var(--accent-primary-alpha)';
            setTimeout(() => {
                messageElement.style.backgroundColor = '';
            }, 2000);
        }
    }
    
    renderChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.addEventListener('click', () => this.switchChat(chat.id));
            
            const preview = chat.messages.length > 0 ? 
                (chat.messages[chat.messages.length - 1].content.substring(0, 50) + 
                 (chat.messages[chat.messages.length - 1].content.length > 50 ? '...' : '')) : 
                'Нет сообщений';
            
            chatItem.innerHTML = `
                <div class="chat-info">
                    <div class="chat-name">${this.escapeHtml(chat.name)}</div>
                    <div class="chat-preview">${this.escapeHtml(preview)}</div>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn" onclick="khaiChat.renameChat('${chat.id}', event)" title="Переименовать">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-action-btn" onclick="khaiChat.downloadChat('${chat.id}', event)" title="Скачать чат">
                        <i class="ti ti-download"></i>
                    </button>
                    ${this.chats.size > 1 ? `
                        <button class="chat-action-btn danger" onclick="khaiChat.deleteChat('${chat.id}', event)" title="Удалить чат">
                            <i class="ti ti-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            chatList.appendChild(chatItem);
        });
    }
    
    updateCurrentChatInfo() {
        const currentChat = this.chats.get(this.currentChatId);
        if (currentChat) {
            document.getElementById('currentChatName').textContent = currentChat.name;
        }
    }
    
    clearCurrentChat() {
        if (confirm('Вы уверены, что хотите очистить текущий чат?')) {
            const chat = this.chats.get(this.currentChatId);
            chat.messages = [];
            this.saveChats();
            this.renderMessages();
            this.renderChatList();
            this.showNotification('Чат очищен', 'success');
        }
    }
    
    generateImage() {
        const userInput = document.getElementById('userInput');
        const prompt = userInput.value.trim();
        
        if (!prompt) {
            this.showNotification('Введите описание для генерации изображения', 'warning');
            return;
        }
        
        this.showNotification('Генерация изображения...', 'info');
        
        // Simulate image generation (replace with actual API call)
        setTimeout(() => {
            // For demo purposes, we'll use a placeholder
            const mockImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
            
            const message = {
                id: Date.now().toString(),
                type: 'ai',
                content: `Сгенерировано изображение по запросу: "${prompt}"`,
                image: mockImageUrl,
                timestamp: new Date()
            };
            
            this.addMessageToCurrentChat(message);
            this.renderMessages();
            this.scrollToBottom();
            this.showNotification('Изображение сгенерировано', 'success');
        }, 2000);
    }
    
    generateVoice() {
        const userInput = document.getElementById('userInput');
        const text = userInput.value.trim();
        
        if (!text) {
            this.showNotification('Введите текст для генерации голоса', 'warning');
            return;
        }
        
        this.showNotification('Генерация голосового сообщения...', 'info');
        
        // Simulate voice generation (replace with actual API call)
        setTimeout(() => {
            const message = {
                id: Date.now().toString(),
                type: 'ai',
                content: `Сгенерировано голосовое сообщение для текста: "${text}"`,
                audio: 'mock-audio-url', // In a real app, this would be the audio URL
                timestamp: new Date()
            };
            
            this.addMessageToCurrentChat(message);
            this.renderMessages();
            this.scrollToBottom();
            this.showNotification('Голосовое сообщение сгенерировано', 'success');
            
            // Auto-play the generated audio
            this.speakMessage(text);
        }, 2000);
    }
    
    showHelp() {
        const helpMessage = `
## KHAI — Помощь

### Основные функции:
- **Общение с ИИ**: Задавайте вопросы и получайте развернутые ответы
- **Генерация изображений**: Создавайте изображения по текстовому описанию
- **Голосовой ввод/вывод**: Общайтесь с помощью голоса
- **Поиск по сообщениям**: Быстро находите нужную информацию в чатах
- **Управление чатами**: Создавайте, переименовывайте, удаляйте чаты

### Горячие клавиши:
- **Enter**: Отправить сообщение
- **Shift + Enter**: Новая строка
- **Голосовой ввод**: Нажмите на микрофон для активации

### Советы:
- Будьте конкретны в запросах для лучших результатов
- Используйте разные чаты для разных тем
- Экспортируйте важные беседы для сохранения

### Поддерживаемые модели:
- GPT-5 Nano, O3 Mini, DeepSeek, Gemini, Grok и другие
        `;
        
        const message = {
            id: 'help-' + Date.now(),
            type: 'ai',
            content: helpMessage,
            timestamp: new Date()
        };
        
        this.addMessageToCurrentChat(message);
        this.renderMessages();
        this.scrollToBottom();
    }
    
    copyMessage(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(() => {
            this.showNotification('Не удалось скопировать текст', 'error');
        });
    }
    
    downloadMessage(messageId) {
        const chat = this.chats.get(this.currentChatId);
        const message = chat.messages.find(m => m.id === messageId);
        
        if (message) {
            const content = `Сообщение от ${message.timestamp.toLocaleString()}\n\n${message.content}`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khai-message-${messageId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Сообщение скачано', 'success');
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        localStorage.setItem('khai-theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    updateStatusIndicator() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');
        
        if (navigator.onLine) {
            statusDot.style.background = 'var(--success-text)';
            statusText.textContent = 'Онлайн';
        } else {
            statusDot.style.background = 'var(--error-text)';
            statusText.textContent = 'Офлайн';
        }
    }
    
    showNotification(message, type = 'info') {
        const notificationsContainer = document.querySelector('.notifications-container') || this.createNotificationsContainer();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        notificationsContainer.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Remove previous notification if there are too many
        if (notificationsContainer.children.length > 3) {
            notificationsContainer.removeChild(notificationsContainer.children[0]);
        }
    }
    
    createNotificationsContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }
    
    showPushNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/apple-touch-icon.png' });
        }
    }
    
    showPWAInstallPrompt() {
        // Show PWA install prompt if conditions are met
        if (this.deferredPrompt && !this.isPWAInstalled()) {
            setTimeout(() => {
                document.getElementById('pwaPrompt').style.display = 'block';
            }, 5000);
        }
    }
    
    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.showNotification('Приложение установлено', 'success');
                }
                this.deferredPrompt = null;
                document.getElementById('pwaPrompt').style.display = 'none';
            });
        }
    }
    
    dismissPWA() {
        document.getElementById('pwaPrompt').style.display = 'none';
        localStorage.setItem('khai-pwa-dismissed', 'true');
    }
    
    isPWAInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               navigator.standalone ||
               document.referrer.includes('android-app://');
    }
    
    saveChats() {
        const chatsData = Array.from(this.chats.values()).map(chat => ({
            ...chat,
            messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            })),
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt ? chat.updatedAt.toISOString() : null
        }));
        
        localStorage.setItem('khai-chats', JSON.stringify(chatsData));
    }
    
    loadChats() {
        try {
            const chatsData = JSON.parse(localStorage.getItem('khai-chats'));
            
            if (chatsData && Array.isArray(chatsData)) {
                this.chats.clear();
                
                chatsData.forEach(chatData => {
                    // Convert timestamps back to Date objects
                    chatData.createdAt = new Date(chatData.createdAt);
                    
                    if (chatData.updatedAt) {
                        chatData.updatedAt = new Date(chatData.updatedAt);
                    }
                    
                    chatData.messages = chatData.messages.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    
                    this.chats.set(chatData.id, chatData);
                });
                
                // Set current chat to the first one or create default
                if (this.chats.size > 0) {
                    this.currentChatId = Array.from(this.chats.keys())[0];
                } else {
                    this.createNewChat();
                }
            }
        } catch (error) {
            console.error('Error loading chats:', error);
            // Initialize with default chat if loading fails
            if (this.chats.size === 0) {
                this.createNewChat();
            }
        }
    }
    
    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    escapeSingleQuotes(text) {
        return text.replace(/'/g, "\\'");
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Service Worker registration for PWA
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
