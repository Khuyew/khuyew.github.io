// Enhanced KHAI Chat Application
class KHAIChat {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-5-nano';
        this.isGenerating = false;
        this.isVoiceMode = false;
        this.currentInputMode = 'text';
        this.soundEnabled = true;
        this.autoHideEnabled = true;
        this.scrollProgress = 0;
        this.notifications = [];
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadChats();
        this.setupSoundEffects();
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
        this.setupScrollProgress();
        
        // Initialize theme
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Initialize input mode
        this.setInputMode('text');
        
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
        
        // Load settings
        this.loadSettings();
    }
    
    setupEventListeners() {
        // Header elements
        const modelSelectBtn = document.getElementById('modelSelectBtn');
        const globalSearchInput = document.getElementById('globalSearchInput');
        const themeToggle = document.getElementById('themeToggle');
        const menuToggle = document.getElementById('menuToggle');
        
        modelSelectBtn.addEventListener('click', this.openModelSelectionModal.bind(this));
        globalSearchInput.addEventListener('input', this.handleGlobalSearch.bind(this));
        themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        menuToggle.addEventListener('click', this.toggleSidebar.bind(this));
        
        // Input handling
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');
        
        userInput.addEventListener('input', this.handleInputChange.bind(this));
        userInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        clearInputBtn.addEventListener('click', this.clearInput.bind(this));
        
        // Input mode selection
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.setInputMode(mode);
            });
        });
        
        // File attachment
        const attachFileBtn = document.getElementById('attachFileBtn');
        const fileInput = document.getElementById('fileInput');
        
        attachFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Sidebar menu
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        sidebarClose.addEventListener('click', this.toggleSidebar.bind(this));
        sidebarOverlay.addEventListener('click', this.toggleSidebar.bind(this));
        
        // Chat actions
        const newChatBtn = document.getElementById('newChatBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const downloadChatBtn = document.getElementById('downloadChatBtn');
        
        newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        downloadChatBtn.addEventListener('click', this.downloadCurrentChat.bind(this));
        
        // Settings
        const soundToggle = document.getElementById('soundToggle');
        const autoHideToggle = document.getElementById('autoHideToggle');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const requestStyleSelect = document.getElementById('requestStyleSelect');
        
        soundToggle.addEventListener('change', this.toggleSound.bind(this));
        autoHideToggle.addEventListener('change', this.toggleAutoHide.bind(this));
        fontSizeSelect.addEventListener('change', this.changeFontSize.bind(this));
        requestStyleSelect.addEventListener('change', this.changeRequestStyle.bind(this));
        
        // Navigation controls
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
        
        scrollToTopBtn.addEventListener('click', () => this.scrollTo('top'));
        scrollToBottomBtn.addEventListener('click', () => this.scrollTo('bottom'));
        
        // Model selection modal
        const modelSelectionClose = document.getElementById('modelSelectionClose');
        const modelItems = document.querySelectorAll('.model-item');
        
        modelSelectionClose.addEventListener('click', this.closeModelSelectionModal.bind(this));
        modelItems.forEach(item => {
            item.addEventListener('click', () => {
                const model = item.dataset.model;
                this.selectModel(model);
            });
        });
        
        // Scroll handling
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Handle before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });
        
        // Handle online/offline status
        window.addEventListener('online', this.updateStatusIndicator.bind(this));
        window.addEventListener('offline', this.updateStatusIndicator.bind(this));
        this.updateStatusIndicator();
        
        // Auto-hide elements
        if (this.autoHideEnabled) {
            this.setupAutoHide();
        }
    }
    
    setupSoundEffects() {
        // Create audio context for subtle sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Preload sound effects
        this.sounds = {
            message: this.createSound(523.25, 0.1),
            notification: this.createSound(659.25, 0.15),
            error: this.createSound(392, 0.2, 'sawtooth'),
            success: this.createSound(783.99, 0.15, 'sine')
        };
    }
    
    createSound(frequency, duration, type = 'sine') {
        return () => {
            if (!this.soundEnabled) return;
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Audio context not available:', error);
            }
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    setupScrollProgress() {
        const messagesContainer = document.getElementById('messagesContainer');
        const scrollProgress = document.getElementById('scrollProgress');
        
        messagesContainer.addEventListener('scroll', () => {
            const scrollTop = messagesContainer.scrollTop;
            const scrollHeight = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            
            scrollProgress.style.width = `${progress}%`;
            this.scrollProgress = progress;
        });
    }
    
    setInputMode(mode) {
        this.currentInputMode = mode;
        
        // Update UI
        const modeButtons = document.querySelectorAll('.mode-btn');
        const userInput = document.getElementById('userInput');
        const formatOptions = document.getElementById('formatOptions');
        
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Update placeholder and show/hide format options
        switch (mode) {
            case 'text':
                userInput.placeholder = 'Задайте вопрос или опишите задачу...';
                formatOptions.classList.add('visible');
                break;
            case 'image':
                userInput.placeholder = 'Опишите изображение для генерации...';
                formatOptions.classList.remove('visible');
                break;
            case 'voice':
                userInput.placeholder = 'Нажмите для голосового ввода...';
                formatOptions.classList.remove('visible');
                this.activateVoiceInput();
                break;
        }
        
        this.playSound('notification');
    }
    
    activateVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isVoiceMode = true;
                this.showNotification('Голосовой ввод активирован. Говорите...', 'info');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('userInput').value = transcript;
                this.handleInputChange({ target: document.getElementById('userInput') });
                this.playSound('success');
            };
            
            this.recognition.onerror = (event) => {
                this.showNotification('Ошибка распознавания голоса: ' + event.error, 'error');
                this.isVoiceMode = false;
                this.playSound('error');
            };
            
            this.recognition.onend = () => {
                this.isVoiceMode = false;
            };
            
            this.recognition.start();
        } else {
            this.showNotification('Голосовой ввод не поддерживается вашим браузером', 'error');
        }
    }
    
    handleInputChange(e) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Update clear button visibility
        const clearInputBtn = document.getElementById('clearInputBtn');
        clearInputBtn.style.display = textarea.value ? 'flex' : 'none';
        
        // Update metrics
        this.updateInputMetrics();
    }
    
    updateInputMetrics() {
        const userInput = document.getElementById('userInput');
        const attachedFiles = document.getElementById('attachedFiles');
        
        const charCount = userInput.value.length;
        const fileCount = attachedFiles.children.length;
        
        // Calculate total size (rough estimate)
        let totalSize = charCount * 2; // 2 bytes per char for UTF-8
        Array.from(attachedFiles.children).forEach(file => {
            const content = file.dataset.content;
            if (content) {
                totalSize += content.length * 0.75; // Rough base64 to bytes conversion
            }
        });
        
        document.getElementById('charCount').textContent = charCount;
        document.getElementById('fileCount').textContent = fileCount;
        document.getElementById('totalSize').textContent = this.formatBytes(totalSize);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    async sendMessage() {
        if (this.currentInputMode === 'voice' && !this.isVoiceMode) {
            this.activateVoiceInput();
            return;
        }
        
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
        this.updateInputMetrics();
        
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            files: files,
            timestamp: new Date(),
            inputMode: this.currentInputMode
        };
        
        this.addMessageToCurrentChat(userMessage);
        this.renderMessages();
        this.scrollToBottom();
        this.playSound('message');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate AI response
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
            this.playSound('message');
            
            // Show push notification when response is complete
            if (document.hidden) {
                this.showPushNotification('KHAI ответил', aiResponse.substring(0, 100) + '...');
            }
        }, 1000 + Math.random() * 2000);
    }
    
    // ... (rest of the methods remain similar but with enhanced functionality)
    
    setupAutoHide() {
        let hideTimeout;
        const elementsToHide = document.querySelectorAll('.navigation-controls, .footer-actions');
        
        const resetHideTimeout = () => {
            clearTimeout(hideTimeout);
            elementsToHide.forEach(el => el.classList.remove('hidden'));
            
            hideTimeout = setTimeout(() => {
                if (this.autoHideEnabled) {
                    elementsToHide.forEach(el => el.classList.add('hidden'));
                }
            }, 3000);
        };
        
        document.addEventListener('mousemove', resetHideTimeout);
        document.addEventListener('click', resetHideTimeout);
        document.addEventListener('scroll', resetHideTimeout);
        
        resetHideTimeout(); // Initial setup
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('khai-sound-enabled', this.soundEnabled);
        this.showNotification(
            this.soundEnabled ? 'Звуковые эффекты включены' : 'Звуковые эффекты выключены',
            'info'
        );
    }
    
    toggleAutoHide() {
        this.autoHideEnabled = !this.autoHideEnabled;
        localStorage.setItem('khai-auto-hide-enabled', this.autoHideEnabled);
        
        if (this.autoHideEnabled) {
            this.setupAutoHide();
        } else {
            document.querySelectorAll('.navigation-controls, .footer-actions')
                .forEach(el => el.classList.remove('hidden'));
        }
        
        this.showNotification(
            this.autoHideEnabled ? 'Авто-скрытие включено' : 'Авто-скрытие выключено',
            'info'
        );
    }
    
    changeFontSize() {
        const fontSize = document.getElementById('fontSizeSelect').value;
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
        localStorage.setItem('khai-font-size', fontSize);
    }
    
    changeRequestStyle() {
        const style = document.getElementById('requestStyleSelect').value;
        localStorage.setItem('khai-request-style', style);
        this.showNotification(`Стиль запроса изменен на: ${style}`, 'info');
    }
    
    openModelSelectionModal() {
        document.getElementById('modelSelectionModal').classList.add('active');
        this.playSound('notification');
    }
    
    closeModelSelectionModal() {
        document.getElementById('modelSelectionModal').classList.remove('active');
    }
    
    selectModel(model) {
        this.currentModel = model;
        
        // Update UI
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-model="${model}"]`).classList.add('selected');
        
        this.closeModelSelectionModal();
        this.showNotification(`Модель изменена на: ${model}`, 'success');
        this.playSound('success');
    }
    
    handleGlobalSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        if (query.length < 2) return;
        
        // Search through all messages in current chat
        const currentChat = this.chats.get(this.currentChatId);
        const results = currentChat.messages.filter(msg => 
            msg.content.toLowerCase().includes(query)
        );
        
        if (results.length > 0) {
            this.highlightSearchResults(query);
        }
    }
    
    highlightSearchResults(query) {
        const messages = document.querySelectorAll('.message-content');
        messages.forEach(message => {
            const text = message.textContent;
            const regex = new RegExp(query, 'gi');
            const highlighted = text.replace(regex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            message.innerHTML = highlighted;
        });
    }
    
    loadSettings() {
        // Load sound setting
        const soundEnabled = localStorage.getItem('khai-sound-enabled');
        if (soundEnabled !== null) {
            this.soundEnabled = soundEnabled === 'true';
            document.getElementById('soundToggle').checked = this.soundEnabled;
        }
        
        // Load auto-hide setting
        const autoHideEnabled = localStorage.getItem('khai-auto-hide-enabled');
        if (autoHideEnabled !== null) {
            this.autoHideEnabled = autoHideEnabled === 'true';
            document.getElementById('autoHideToggle').checked = this.autoHideEnabled;
        }
        
        // Load font size
        const fontSize = localStorage.getItem('khai-font-size');
        if (fontSize) {
            document.getElementById('fontSizeSelect').value = fontSize;
            this.changeFontSize();
        }
        
        // Load request style
        const requestStyle = localStorage.getItem('khai-request-style');
        if (requestStyle) {
            document.getElementById('requestStyleSelect').value = requestStyle;
        }
    }
    
    // ... (other existing methods with minor enhancements for new UI)
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
