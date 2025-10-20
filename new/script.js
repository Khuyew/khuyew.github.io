// KHAI — Advanced AI Chat Application (Mobile-Optimized)
class KHAIChat {
    constructor() {
        // Минимальный необходимый state
        this.messages = [];
        this.currentChatId = 'main-chat';
        this.chats = new Map([['main-chat', []]]);
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.currentMode = 'normal';
        this.attachedFiles = [];
        this.isOnline = true;
        this.currentModel = 'gpt-4';
        this.conversationHistory = [];
        this.autoScrollEnabled = true;
        
        // Performance optimizations
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.lastRenderTime = 0;
        this.renderThrottle = 100; // ms
        
        // Mobile optimizations
        this.isKeyboardVisible = false;
        this.touchStartY = 0;
        
        this.init();
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.loadChatHistory();
            this.setupMobileOptimizations();
            this.showWelcomeMessage();
            this.updateUI();
            
            // Показываем приложение
            this.setTimeout(() => {
                const appLoader = document.getElementById('appLoader');
                const appContainer = document.querySelector('.app-container');
                
                if (appLoader) appLoader.style.display = 'none';
                if (appContainer) {
                    appContainer.style.opacity = '1';
                }
            }, 300);
            
        } catch (error) {
            console.error('Error initializing KHAI Chat:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    // Mobile optimizations
    setupMobileOptimizations() {
        // Prevent zoom on focus (iOS)
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
            input.addEventListener('blur', () => {
                input.style.fontSize = '';
            });
        });

        // Touch optimizations
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        // Handle keyboard show/hide
        const visualViewport = window.visualViewport;
        if (visualViewport) {
            visualViewport.addEventListener('resize', this.debounce(() => {
                this.handleViewportResize();
            }, 100));
        }
    }

    handleViewportResize() {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        const isKeyboardVisible = visualViewport.height < window.innerHeight * 0.7;
        
        if (isKeyboardVisible && !this.isKeyboardVisible) {
            // Keyboard shown
            this.isKeyboardVisible = true;
            this.scrollToBottom(true);
        } else if (!isKeyboardVisible && this.isKeyboardVisible) {
            // Keyboard hidden
            this.isKeyboardVisible = false;
        }
    }

    // Event listeners with delegation for performance
    async setupEventListeners() {
        // Single event delegation
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]') || e.target;
            
            switch (target.id) {
                case 'sendBtn':
                    e.preventDefault();
                    this.handleSendButtonClick();
                    break;
                case 'clearChatBtn':
                    this.clearChat();
                    break;
                case 'themeToggle':
                    this.toggleTheme();
                    break;
                case 'menuToggle':
                    this.toggleMobileMenu();
                    break;
                case 'newChatBtn':
                    this.createNewChat();
                    break;
            }
            
            // Handle data-action elements
            if (target.dataset.action) {
                e.preventDefault();
                this.handleDataAction(target.dataset.action, target);
            }
        });

        // Input handling
        const userInput = document.getElementById('userInput');
        if (userInput) {
            this.addEventListener(userInput, 'input', this.debounce(() => {
                this.autoResizeTextarea(userInput);
            }, 50));

            this.addEventListener(userInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendButtonClick();
                }
            });

            this.addEventListener(userInput, 'focus', () => {
                this.scrollToBottom(true);
            });
        }

        // Messages container scroll with throttling
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            this.addEventListener(messagesContainer, 'scroll', this.throttle(() => {
                this.handleScroll();
            }, 100));
        }

        // Online/offline detection
        this.addEventListener(window, 'online', () => {
            this.setOnlineStatus(true);
        });

        this.addEventListener(window, 'offline', () => {
            this.setOnlineStatus(false);
        });

        // Paste handling for security
        this.addEventListener(document, 'paste', (e) => {
            this.handlePaste(e);
        });

        // Before unload for cleanup
        this.addEventListener(window, 'beforeunload', () => {
            this.cleanup();
        });
    }

    handleDataAction(action, element) {
        switch (action) {
            case 'send-message':
                this.handleSendButtonClick();
                break;
            case 'clear-chat':
                this.clearChat();
                break;
            case 'new-chat':
                this.createNewChat();
                break;
            case 'toggle-theme':
                this.toggleTheme();
                break;
            case 'toggle-menu':
                this.toggleMobileMenu();
                break;
        }
    }

    // Performance optimized event handling
    addEventListener(element, event, handler) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка', 'error');
            }
        };

        element.addEventListener(event, wrappedHandler);
        
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    // Secure HTML escaping
    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Secure file validation
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'application/json'
        ];

        if (file.size > maxSize) {
            throw new Error('Файл слишком большой (максимум 10MB)');
        }

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|json)$/i)) {
            throw new Error('Тип файла не поддерживается');
        }

        return true;
    }

    // Main message handling
    handleSendButtonClick() {
        if (this.isGenerating) {
            this.stopGeneration();
        } else {
            this.sendMessage();
        }
    }

    async sendMessage() {
        if (this.isGenerating) {
            this.showNotification('Подождите, идет генерация...', 'warning');
            return;
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение', 'warning');
            return;
        }

        // Security: limit message length
        if (message.length > 4000) {
            this.showNotification('Сообщение слишком длинное', 'error');
            return;
        }

        try {
            this.isGenerating = true;
            this.generationAborted = false;
            this.updateSendButton(true);

            await this.processUserMessage(message, [...this.attachedFiles]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.handleError('Ошибка отправки сообщения', error);
        } finally {
            if (!this.generationAborted) {
                this.isGenerating = false;
                this.updateSendButton(false);
                this.saveChatHistory();
            }
        }
    }

    async processUserMessage(message, files = []) {
        // Security: sanitize message
        const sanitizedMessage = this.escapeHtml(message);
        
        const userMessage = {
            id: this.generateId(),
            role: 'user',
            content: sanitizedMessage,
            files: files.map(f => ({
                name: this.escapeHtml(f.name),
                type: f.type,
                size: f.size
            })),
            timestamp: Date.now(),
            mode: this.currentMode
        };

        this.addMessageToChat(userMessage);
        this.addToConversationHistory('user', sanitizedMessage, files);
        
        // Clear input
        const userInput = document.getElementById('userInput');
        userInput.value = '';
        this.autoResizeTextarea(userInput);
        this.clearAttachedFiles();

        // Get AI response
        await this.getAIResponse(sanitizedMessage, files);
    }

    async getAIResponse(userMessage, files) {
        this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.hideTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.handleError('Ошибка получения ответа', error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            // Simple file context - in real app, you'd process files here
            return `Пользователь отправил файл "${file.name}" с сообщением: "${userMessage}"`;
        } else {
            return this.buildContextPrompt(userMessage);
        }
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-4); // Limit context
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Предыдущий разговор:\n";
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 300 ? 
                msg.content.substring(0, 300) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос: ${currentMessage}\nОтвет:`;
        return context;
    }

    async callAIService(prompt) {
        // Security: validate prompt
        if (!prompt || prompt.length > 10000) {
            throw new Error('Неверный запрос');
        }

        // Mock AI service - replace with actual API call
        return this.mockAIResponse(prompt);
    }

    async mockAIResponse(prompt) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const responses = [
            "Привет! Я KHAI - ваш AI-ассистент. Чем могу помочь?",
            "Отличный вопрос! Давайте разберем его подробнее...",
            "На основе вашего запроса, я могу предложить следующее...",
            "Понимаю ваш вопрос. Вот что я могу сказать по этой теме...",
            "Интересный запрос! Давайте обсудим это детальнее."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate streaming
        const words = response.split(' ');
        const stream = {
            [Symbol.asyncIterator]: async function* () {
                for (const word of words) {
                    if (this.generationAborted) break;
                    await new Promise(resolve => setTimeout(resolve, 50));
                    yield { text: word + ' ' };
                }
            }.bind(this)
        };

        return stream;
    }

    async processAIResponse(response) {
        const messageId = this.createStreamingMessage();
        let fullResponse = '';
        
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(messageId, fullResponse);
                }
            }
            
            if (!this.generationAborted && fullResponse) {
                this.finalizeStreamingMessage(messageId, fullResponse);
                this.addToConversationHistory('assistant', fullResponse);
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка обработки ответа', error);
            }
        }
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-assistant streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="streaming-text"></div>
            </div>
        `;
        
        document.getElementById('messagesContainer').appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        
        if (content.length > 50 && typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        streamingText.textContent = content; // Security: use textContent instead of innerHTML
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        messageElement.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(fullContent)}
                <div class="message-meta">
                    ${new Date().toLocaleTimeString('ru-RU')}
                </div>
            </div>
        `;
        
        this.scrollToBottom();
    }

    // Message management
    addMessageToChat(message) {
        const chat = this.chats.get(this.currentChatId) || [];
        
        // Performance: limit chat history
        if (chat.length > 500) {
            chat.splice(0, 100);
        }
        
        chat.push(message);
        this.chats.set(this.currentChatId, chat);
        this.renderMessage(message);
    }

    renderMessage(message) {
        // Performance: throttle rendering
        const now = Date.now();
        if (now - this.lastRenderTime < this.renderThrottle) {
            this.setTimeout(() => this.renderMessage(message), this.renderThrottle);
            return;
        }
        this.lastRenderTime = now;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.dataset.messageId = message.id;
        
        // Security: use textContent for user messages
        if (message.role === 'user') {
            messageElement.textContent = message.content;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    ${message.content}
                    <div class="message-meta">
                        ${new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                    </div>
                </div>
            `;
        }
        
        document.getElementById('messagesContainer').appendChild(messageElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    // UI Management
    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-assistant typing-indicator';
        typingElement.id = 'typing-indicator';
        
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
        
        document.getElementById('messagesContainer').appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const element = document.getElementById('typing-indicator');
        if (element) {
            element.remove();
        }
    }

    updateSendButton(isGenerating) {
        const sendBtn = document.getElementById('sendBtn');
        if (!sendBtn) return;

        if (isGenerating) {
            sendBtn.textContent = '⏹';
            sendBtn.title = 'Остановить';
        } else {
            sendBtn.textContent = '➤';
            sendBtn.title = 'Отправить';
        }
    }

    stopGeneration() {
        if (this.isGenerating && this.currentStreamController) {
            this.generationAborted = true;
            this.isGenerating = false;
            
            // Abort any ongoing requests
            if (this.currentStreamController.abort) {
                this.currentStreamController.abort();
            }
            
            this.hideTypingIndicator();
            this.updateSendButton(false);
            this.showNotification('Генерация остановлена', 'info');
        }
    }

    // Scroll management
    handleScroll() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.autoScrollEnabled = (scrollHeight - scrollTop - clientHeight) < 100;
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            this.setTimeout(() => {
                const container = document.getElementById('messagesContainer');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 100);
        }
    }

    // File handling with security
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    this.handleFileUpload([file]);
                }
                break;
            }
        }
    }

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        for (let file of Array.from(files).slice(0, 3)) { // Limit to 3 files
            try {
                this.validateFile(file);
                
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: await this.readFileAsDataURL(file)
                };
                
                this.attachedFiles.push(fileData);
                this.showNotification(`Файл "${file.name}" добавлен`, 'success');
                
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
        
        this.updateAttachedFilesDisplay();
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateAttachedFilesDisplay() {
        // Simple files display - implement as needed
        console.log('Attached files:', this.attachedFiles);
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    // Chat management
    clearChat() {
        if (confirm('Очистить историю чата?')) {
            this.messages = [];
            this.chats.set(this.currentChatId, []);
            this.conversationHistory = [];
            
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.innerHTML = '';
            }
            
            this.hideTypingIndicator();
            this.stopGeneration();
            this.clearAttachedFiles();
            
            this.saveChatHistory();
            this.showWelcomeMessage();
            this.showNotification('Чат очищен', 'success');
        }
    }

    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        this.chats.set(newChatId, []);
        this.currentChatId = newChatId;
        
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        this.showWelcomeMessage();
        this.showNotification('Новый чат создан', 'success');
        this.toggleMobileMenu();
    }

    showWelcomeMessage() {
        const container = document.getElementById('messagesContainer');
        if (!container || container.children.length > 0) return;
        
        const welcome = document.createElement('div');
        welcome.className = 'welcome-message';
        welcome.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3>Добро пожаловать в KHAI!</h3>
                <p>Ваш AI-ассистент готов помочь.</p>
            </div>
        `;
        
        container.appendChild(welcome);
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        
        this.showNotification(`Тема: ${newTheme === 'dark' ? 'тёмная' : 'светлая'}`, 'info');
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('mobileSidebar');
        if (sidebar) {
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Online status
    setOnlineStatus(online) {
        this.isOnline = online;
        this.showNotification(online ? 'Онлайн' : 'Офлайн', online ? 'success' : 'warning');
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Simple notification - implement toast system if needed
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // For mobile, you might want to use a toast library
        if (window.Android && window.Android.showToast) {
            window.Android.showToast(message);
        }
    }

    handleError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error');
        
        if (this.isGenerating) {
            this.isGenerating = false;
            this.updateSendButton(false);
            this.hideTypingIndicator();
        }
    }

    // Auto-resize textarea
    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Data management
    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
        
        // Performance: limit history size
        if (this.conversationHistory.length > 100) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }

    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-chats');
            if (saved) {
                const data = JSON.parse(saved);
                this.chats = new Map(Object.entries(data.chats || {}));
                this.currentChatId = data.currentChatId || 'main-chat';
                this.conversationHistory = data.conversationHistory || [];
                
                this.renderChat();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chats.set('main-chat', []);
        }
    }

    saveChatHistory() {
        try {
            const data = {
                chats: Object.fromEntries(this.chats),
                currentChatId: this.currentChatId,
                conversationHistory: this.conversationHistory,
                timestamp: Date.now()
            };
            
            localStorage.setItem('khai-chats', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    renderChat() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        const chat = this.chats.get(this.currentChatId) || [];
        chat.forEach(message => {
            this.renderMessage(message);
        });
        
        this.scrollToBottom();
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateUI() {
        // Update any UI elements as needed
        this.autoResizeTextarea(document.getElementById('userInput'));
    }

    // Cleanup for memory management
    cleanup() {
        // Clear all timeouts
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        // Remove all event listeners
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Clean up any other resources
        this.stopGeneration();
        this.hideTypingIndicator();
        
        // Save state
        this.saveChatHistory();
        
        console.log('KHAI Chat cleaned up');
    }

    // Mobile-specific destructor
    destroy() {
        this.cleanup();
    }
}

// Mobile-optimized service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple instances
    if (!window.khaiChat) {
        window.khaiChat = new KHAIChat();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.khaiChat) {
        window.khaiChat.cleanup();
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Mobile-specific: prevent pull-to-refresh on main content
document.addEventListener('DOMContentLoaded', () => {
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const scrolledToTop = window.scrollY === 0;
        
        if (scrolledToTop && touchY - touchStartY > 50) {
            e.preventDefault();
        }
    }, { passive: false });
});
