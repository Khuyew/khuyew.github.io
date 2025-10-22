// script.js - Enhanced version with all requested features

// ===== PERFORMANCE OPTIMIZATIONS =====

// Cache DOM elements for better performance
const DOMCache = {
    messagesContainer: document.getElementById('messagesContainer'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    currentChatName: document.getElementById('currentChatName'),
    chatList: document.getElementById('chatList'),
    sidebarMenu: document.getElementById('sidebarMenu'),
    themeToggle: document.getElementById('themeToggle'),
    menuToggle: document.getElementById('menuToggle'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    voiceInputBtn: document.getElementById('voiceInputBtn'),
    attachFileBtn: document.getElementById('attachFileBtn'),
    fileInput: document.getElementById('fileInput'),
    attachedFiles: document.getElementById('attachedFiles'),
    quickActions: document.getElementById('quickActions'),
    searchBtn: document.getElementById('searchBtn'),
    searchModal: document.getElementById('searchModal'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    searchClose: document.getElementById('searchClose'),
    modelsModal: document.getElementById('modelsModal'),
    modelsClose: document.getElementById('modelsClose'),
    newChatBtn: document.getElementById('newChatBtn'),
    exportChatsBtn: document.getElementById('exportChatsBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    sidebarClose: document.getElementById('sidebarClose'),
    loadingScreen: document.getElementById('loadingScreen'),
    pwaPrompt: document.getElementById('pwaPrompt'),
    pwaInstall: document.getElementById('pwaInstall'),
    pwaDismiss: document.getElementById('pwaDismiss')
};

// Virtualization for large chat histories
class MessageVirtualizer {
    constructor(container, batchSize = 50) {
        this.container = container;
        this.batchSize = batchSize;
        this.visibleMessages = new Set();
        this.observer = null;
        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const messageId = entry.target.dataset.messageId;
                if (entry.isIntersecting) {
                    this.visibleMessages.add(messageId);
                } else {
                    this.visibleMessages.delete(messageId);
                    // Optional: Cleanup non-visible messages for very large chats
                    // this.cleanupNonVisibleMessages();
                }
            });
        }, {
            root: this.container,
            rootMargin: '100px 0px',
            threshold: 0.1
        });
    }

    addMessage(element, messageId) {
        element.dataset.messageId = messageId;
        this.observer.observe(element);
    }

    cleanupNonVisibleMessages() {
        // For extremely large chats, remove DOM elements that are far from viewport
        // This is aggressive optimization for memory management
        const allMessages = this.container.querySelectorAll('.message');
        allMessages.forEach(msg => {
            if (!this.visibleMessages.has(msg.dataset.messageId)) {
                msg.remove();
            }
        });
    }
}

// Lazy loading for images
class LazyImageLoader {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
    }

    observeImage(img) {
        if (img.dataset.src) {
            this.observer.observe(img);
        }
    }
}

// Debounce utility for input handling
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// ===== SECURITY ENHANCEMENTS =====

// Input validation and sanitization
class InputSanitizer {
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        // Basic HTML sanitization - in production, use DOMPurify library
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static validateMessage(text) {
        if (typeof text !== 'string') return false;
        
        const trimmed = text.trim();
        if (trimmed.length === 0) return false;
        if (trimmed.length > 10000) return false; // Max length
        
        // Check for excessive repetition (spam detection)
        const repeatedChars = /(.)\1{10,}/;
        if (repeatedChars.test(trimmed)) return false;
        
        return true;
    }

    static sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9_\u0400-\u04FF.-]/g, '_');
    }
}

// Encryption for local data
class DataEncryption {
    static async generateKey() {
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    static async encryptData(data, key) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(data));
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        };
    }

    static async decryptData(encryptedData, key) {
        const iv = new Uint8Array(encryptedData.iv);
        const data = new Uint8Array(encryptedData.data);
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decrypted));
    }
}

// CSRF protection
class CSRFProtection {
    static generateToken() {
        return crypto.randomUUID();
    }

    static validateToken(token, storedToken) {
        return token === storedToken;
    }
}

// ===== MOBILE OPTIMIZATIONS =====

// Swipe gesture handling
class SwipeGestureHandler {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.threshold = 50;
        this.restrainedArea = 100; // Only detect swipes from screen edges
        
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleTouchStart(event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }

    handleTouchEnd(event) {
        if (!this.startX || !this.startY) return;

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        
        const diffX = this.startX - endX;
        const diffY = this.startY - endY;

        // Only detect horizontal swipes from left edge
        if (this.startX < this.restrainedArea && Math.abs(diffX) > this.threshold && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                // Swipe left to right - open sidebar
                this.openSidebar();
            } else {
                // Swipe right to left - close sidebar
                this.closeSidebar();
            }
        }

        this.startX = 0;
        this.startY = 0;
    }

    openSidebar() {
        if (!DOMCache.sidebarMenu.classList.contains('active')) {
            DOMCache.sidebarMenu.classList.add('active');
            DOMCache.sidebarMenu.setAttribute('aria-hidden', 'false');
        }
    }

    closeSidebar() {
        if (DOMCache.sidebarMenu.classList.contains('active')) {
            DOMCache.sidebarMenu.classList.remove('active');
            DOMCache.sidebarMenu.setAttribute('aria-hidden', 'true');
        }
    }
}

// Vibration feedback
class VibrationFeedback {
    static light() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    static medium() {
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    }

    static heavy() {
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
}

// Network optimization
class NetworkOptimizer {
    constructor() {
        this.online = navigator.onLine;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleOnline() {
        this.online = true;
        this.retryCount = 0;
        this.showStatus('Соединение восстановлено', 'success');
        this.syncOfflineData();
    }

    handleOffline() {
        this.online = false;
        this.showStatus('Режим офлайн', 'warning');
    }

    async syncOfflineData() {
        const offlineMessages = this.getOfflineMessages();
        if (offlineMessages.length > 0) {
            for (const message of offlineMessages) {
                await this.retrySendMessage(message);
            }
            this.clearOfflineMessages();
        }
    }

    async retrySendMessage(message) {
        while (this.retryCount < this.maxRetries) {
            try {
                await this.sendMessageToAPI(message);
                return;
            } catch (error) {
                this.retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
            }
        }
        throw new Error('Max retries exceeded');
    }

    showStatus(message, type) {
        // Implementation for showing connection status
        console.log(`${type}: ${message}`);
    }

    getOfflineMessages() {
        return JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    }

    saveOfflineMessage(message) {
        const messages = this.getOfflineMessages();
        messages.push(message);
        localStorage.setItem('offlineMessages', JSON.stringify(messages));
    }

    clearOfflineMessages() {
        localStorage.removeItem('offlineMessages');
    }

    async sendMessageToAPI(message) {
        // Implementation for sending message to API
        // This would be replaced with actual API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.2) { // 80% success rate for demo
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000);
        });
    }
}

// Auto-save drafts
class DraftAutoSaver {
    constructor(inputElement, storageKey = 'chatDraft') {
        this.input = inputElement;
        this.storageKey = storageKey;
        this.debouncedSave = debounce(this.saveDraft.bind(this), 1000);
        this.init();
    }

    init() {
        this.input.addEventListener('input', this.debouncedSave);
        this.loadDraft();
    }

    saveDraft() {
        const draft = this.input.value.trim();
        if (draft) {
            localStorage.setItem(this.storageKey, draft);
        } else {
            localStorage.removeItem(this.storageKey);
        }
    }

    loadDraft() {
        const draft = localStorage.getItem(this.storageKey);
        if (draft) {
            this.input.value = draft;
        }
    }

    clearDraft() {
        this.input.value = '';
        localStorage.removeItem(this.storageKey);
    }
}

// ===== UX IMPROVEMENTS =====

// Auto-scroll to new messages
class AutoScrollManager {
    constructor(container) {
        this.container = container;
        this.isScrolledToBottom = true;
        this.init();
    }

    init() {
        this.container.addEventListener('scroll', this.handleScroll.bind(this));
        this.scrollToBottom();
    }

    handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        this.isScrolledToBottom = (scrollHeight - scrollTop - clientHeight) < 50;
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.container.scrollTop = this.container.scrollHeight;
            this.isScrolledToBottom = true;
        });
    }

    scrollToMessage(messageElement) {
        requestAnimationFrame(() => {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
}

// Voice input support
class VoiceInputHandler {
    constructor(inputElement, buttonElement) {
        this.input = inputElement;
        this.button = buttonElement;
        this.recognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.button.classList.add('listening');
                VibrationFeedback.light();
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                this.input.value = transcript;
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.button.classList.remove('listening');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.button.classList.remove('listening');
            };

            this.button.addEventListener('click', this.toggleListening.bind(this));
        } else {
            this.button.style.display = 'none';
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }
}

// Smart autocomplete
class SmartAutocomplete {
    constructor(inputElement, suggestionsContainer) {
        this.input = inputElement;
        this.container = suggestionsContainer;
        this.suggestions = [];
        this.debouncedShow = debounce(this.showSuggestions.bind(this), 300);
        this.init();
    }

    init() {
        this.input.addEventListener('input', this.debouncedShow);
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });
        
        this.loadCommonPhrases();
    }

    loadCommonPhrases() {
        this.suggestions = [
            'Объясни как работает',
            'Напиши код для',
            'Переведи на английский',
            'Суммаризируй текст',
            'Какая сегодня погода?',
            'Расскажи о',
            'Помоги с'
        ];
    }

    showSuggestions() {
        const query = this.input.value.toLowerCase().trim();
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const filtered = this.suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            this.renderSuggestions(filtered);
            this.container.style.display = 'block';
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.container.style.display = 'none';
    }

    renderSuggestions(suggestions) {
        this.container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</div>`
        ).join('');

        this.container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.input.value = item.dataset.suggestion;
                this.hideSuggestions();
                this.input.focus();
            });
        });
    }
}

// ===== NEW FEATURES =====

// Message search functionality
class MessageSearch {
    constructor(messagesContainer, searchInput, resultsContainer) {
        this.messagesContainer = messagesContainer;
        this.searchInput = searchInput;
        this.resultsContainer = resultsContainer;
        this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
        this.init();
    }

    init() {
        this.searchInput.addEventListener('input', this.debouncedSearch);
    }

    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        if (query.length < 2) {
            this.clearResults();
            return;
        }

        const messages = Array.from(this.messagesContainer.querySelectorAll('.message-content'));
        const results = messages.filter(message => 
            message.textContent.toLowerCase().includes(query)
        );

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        this.resultsContainer.innerHTML = results.map((message, index) => {
            const content = message.textContent;
            const highlighted = this.highlightText(content, query);
            return `
                <div class="search-result" data-index="${index}">
                    <div class="result-preview">${highlighted}</div>
                </div>
            `;
        }).join('');

        this.resultsContainer.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const index = parseInt(result.dataset.index);
                this.scrollToResult(results[index]);
            });
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    scrollToResult(messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');
        setTimeout(() => messageElement.classList.remove('highlight'), 2000);
    }

    clearResults() {
        this.resultsContainer.innerHTML = '';
    }
}

// PDF export functionality
class PDFExporter {
    static async exportChatToPDF(messages, filename = 'chat-export.pdf') {
        // This would use a PDF generation library like jsPDF
        // For now, we'll create a simple text export
        const textContent = messages.map(msg => 
            `${msg.role === 'user' ? 'Вы' : 'KHAI'}: ${msg.content}`
        ).join('\n\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Cloud backup functionality
class CloudBackup {
    constructor() {
        this.backupInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    init() {
        setInterval(() => this.autoBackup(), this.backupInterval);
    }

    async autoBackup() {
        if (!navigator.onLine) return;
        
        try {
            const chats = this.getAllChats();
            await this.uploadToCloud(chats);
            console.log('Auto-backup completed');
        } catch (error) {
            console.error('Auto-backup failed:', error);
        }
    }

    getAllChats() {
        // Implementation to get all chats from storage
        return JSON.parse(localStorage.getItem('chats') || '{}');
    }

    async uploadToCloud(data) {
        // Implementation for cloud upload
        // This would be replaced with actual cloud storage API
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }
}

// Usage statistics
class UsageStatistics {
    constructor() {
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        document.addEventListener('messageSent', () => this.recordMessage());
        document.addEventListener('chatCreated', () => this.recordChat());
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('usageStats') || '{}');
    }

    saveStats() {
        localStorage.setItem('usageStats', JSON.stringify(this.stats));
    }

    recordMessage() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.stats.messages) this.stats.messages = {};
        this.stats.messages[today] = (this.stats.messages[today] || 0) + 1;
        this.saveStats();
    }

    recordChat() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.stats.chats) this.stats.chats = {};
        this.stats.chats[today] = (this.stats.chats[today] || 0) + 1;
        this.saveStats();
    }

    getStats() {
        return this.stats;
    }
}

// ===== TECHNICAL IMPROVEMENTS =====

// Service Worker registration
class ServiceWorkerManager {
    static async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.worker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('ServiceWorker update found:', newWorker);
                });
                
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }
}

// Web Workers for heavy operations
class ChatWorker {
    constructor() {
        this.worker = new Worker('/js/chat-worker.js');
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        this.worker.onmessage = (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'PROCESSED_MESSAGE':
                    this.handleProcessedMessage(data);
                    break;
                case 'SEARCH_COMPLETE':
                    this.handleSearchComplete(data);
                    break;
                case 'EXPORT_READY':
                    this.handleExportReady(data);
                    break;
            }
        };
    }

    processMessage(message) {
        this.worker.postMessage({
            type: 'PROCESS_MESSAGE',
            data: message
        });
    }

    searchMessages(query, messages) {
        this.worker.postMessage({
            type: 'SEARCH_MESSAGES',
            data: { query, messages }
        });
    }

    exportChat(messages, format) {
        this.worker.postMessage({
            type: 'EXPORT_CHAT',
            data: { messages, format }
        });
    }

    handleProcessedMessage(data) {
        // Handle processed message from worker
    }

    handleSearchComplete(data) {
        // Handle search results from worker
    }

    handleExportReady(data) {
        // Handle export data from worker
    }
}

// IndexedDB for data storage
class ChatDatabase {
    constructor() {
        this.dbName = 'KHAIChatDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('chats')) {
                    const chatsStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
                    chatsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('messages')) {
                    const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                    messagesStore.createIndex('chatId', 'chatId', { unique: false });
                    messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async saveChat(chat) {
        return this.transaction('chats', 'readwrite', store => {
            return store.put(chat);
        });
    }

    async getChats() {
        return this.transaction('chats', 'readonly', store => {
            return store.getAll();
        });
    }

    async saveMessage(message) {
        return this.transaction('messages', 'readwrite', store => {
            return store.put(message);
        });
    }

    async getMessages(chatId) {
        return this.transaction('messages', 'readonly', store => {
            const index = store.index('chatId');
            return index.getAll(chatId);
        });
    }

    transaction(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// WebSocket for real-time communication
class RealTimeChat {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    init() {
        this.connect();
    }

    connect() {
        try {
            this.socket = new WebSocket('wss://your-websocket-server.com/chat');
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.handleReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    handleMessage(data) {
        const event = new CustomEvent('websocketMessage', { detail: data });
        document.dispatchEvent(event);
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Fallback to HTTP request
            this.sendViaHTTP(message);
        }
    }

    async sendViaHTTP(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            return await response.json();
        } catch (error) {
            console.error('HTTP fallback failed:', error);
            throw error;
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            setTimeout(() => this.connect(), delay);
        }
    }
}

// PWA functionality
class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
        window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
        
        if (DOMCache.pwaInstall) {
            DOMCache.pwaInstall.addEventListener('click', this.installApp.bind(this));
        }
        
        if (DOMCache.pwaDismiss) {
            DOMCache.pwaDismiss.addEventListener('click', this.dismissPrompt.bind(this));
        }
    }

    handleBeforeInstallPrompt(event) {
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallPrompt();
    }

    handleAppInstalled() {
        console.log('App installed successfully');
        this.hideInstallPrompt();
        this.deferredPrompt = null;
    }

    showInstallPrompt() {
        if (DOMCache.pwaPrompt) {
            DOMCache.pwaPrompt.style.display = 'block';
            DOMCache.pwaPrompt.setAttribute('aria-hidden', 'false');
        }
    }

    hideInstallPrompt() {
        if (DOMCache.pwaPrompt) {
            DOMCache.pwaPrompt.style.display = 'none';
            DOMCache.pwaPrompt.setAttribute('aria-hidden', 'true');
        }
    }

    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }

    dismissPrompt() {
        this.hideInstallPrompt();
        // Don't show again for a while
        localStorage.setItem('pwaPromptDismissed', Date.now().toString());
    }
}

// ===== MAIN APPLICATION CLASS =====

class KHAIChatApp {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.isOnline = navigator.onLine;
        this.csrfToken = CSRFProtection.generateToken();
        
        // Initialize components
        this.initComponents();
        this.bindEvents();
        this.loadChats();
    }

    initComponents() {
        // Performance optimizations
        this.messageVirtualizer = new MessageVirtualizer(DOMCache.messagesContainer);
        this.lazyImageLoader = new LazyImageLoader();
        this.autoScroll = new AutoScrollManager(DOMCache.messagesContainer);
        
        // Mobile optimizations
        this.swipeHandler = new SwipeGestureHandler();
        this.networkOptimizer = new NetworkOptimizer();
        this.draftSaver = new DraftAutoSaver(DOMCache.userInput);
        
        // UX improvements
        this.voiceInput = new VoiceInputHandler(DOMCache.userInput, DOMCache.voiceInputBtn);
        this.autocomplete = new SmartAutocomplete(DOMCache.userInput, document.getElementById('suggestionsContainer'));
        this.messageSearch = new MessageSearch(DOMCache.messagesContainer, DOMCache.searchInput, DOMCache.searchResults);
        
        // New features
        this.usageStats = new UsageStatistics();
        this.cloudBackup = new CloudBackup();
        
        // Technical improvements
        this.database = new ChatDatabase();
        this.chatWorker = new ChatWorker();
        this.realTimeChat = new RealTimeChat();
        this.pwaHandler = new PWAHandler();
        
        // Register Service Worker
        ServiceWorkerManager.register();
    }

    bindEvents() {
        // Send message
        DOMCache.sendBtn.addEventListener('click', () => this.sendMessage());
        DOMCache.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // UI controls
        DOMCache.menuToggle.addEventListener('click', () => this.toggleSidebar());
        DOMCache.sidebarClose.addEventListener('click', () => this.closeSidebar());
        DOMCache.themeToggle.addEventListener('click', () => this.toggleTheme());
        DOMCache.clearInputBtn.addEventListener('click', () => this.clearInput());
        DOMCache.attachFileBtn.addEventListener('click', () => this.attachFile());
        DOMCache.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Quick actions
        DOMCache.quickActions.addEventListener('click', (e) => {
            const action = e.target.closest('.quick-action')?.dataset.action;
            if (action) this.handleQuickAction(action);
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Modals
        DOMCache.searchBtn.addEventListener('click', () => this.openSearch());
        DOMCache.searchClose.addEventListener('click', () => this.closeSearch());
        DOMCache.modelsClose.addEventListener('click', () => this.closeModels());

        // Chat management
        DOMCache.newChatBtn.addEventListener('click', () => this.createNewChat());
        DOMCache.exportChatsBtn.addEventListener('click', () => this.exportChats());
        DOMCache.clearAllBtn.addEventListener('click', () => this.clearAllChats());

        // Network events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Real-time events
        document.addEventListener('websocketMessage', (e) => this.handleWebSocketMessage(e.detail));
    }

    async sendMessage() {
        const messageText = DOMCache.userInput.value.trim();
        
        if (!InputSanitizer.validateMessage(messageText)) {
            VibrationFeedback.medium();
            return;
        }

        // Sanitize message
        const sanitizedMessage = InputSanitizer.sanitizeHTML(messageText);
        
        // Create message object
        const message = {
            id: Date.now().toString(),
            content: sanitizedMessage,
            role: 'user',
            timestamp: new Date().toISOString(),
            chatId: this.currentChatId,
            csrfToken: this.csrfToken
        };

        // Add to UI immediately
        this.addMessageToUI(message);
        DOMCache.userInput.value = '';
        this.draftSaver.clearDraft();
        VibrationFeedback.light();

        // Record statistics
        document.dispatchEvent(new CustomEvent('messageSent'));

        try {
            // Send to AI service
            const response = await this.sendToAI(message);
            this.addMessageToUI(response);
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Ошибка отправки сообщения');
        }
    }

    async sendToAI(message) {
        if (!this.isOnline) {
            this.networkOptimizer.saveOfflineMessage(message);
            throw new Error('Offline mode');
        }

        // Implementation for AI service communication
        // This would be replaced with actual AI API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now().toString(),
                    content: 'Это имитация ответа AI. В реальном приложении здесь будет ответ от AI сервиса.',
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    chatId: this.currentChatId
                });
            }, 1000);
        });
    }

    addMessageToUI(message) {
        const messageElement = this.createMessageElement(message);
        DOMCache.messagesContainer.appendChild(messageElement);
        this.messageVirtualizer.addMessage(messageElement, message.id);
        
        if (message.role === 'user') {
            this.autoScroll.scrollToBottom();
        }
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message message-${message.role}`;
        div.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-actions">
                <button class="action-btn-small" onclick="app.copyMessage('${message.id}')">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                <button class="action-btn-small" onclick="app.shareMessage('${message.id}')">
                    <i class="ti ti-share"></i> Поделиться
                </button>
            </div>
        `;
        return div;
    }

    toggleSidebar() {
        DOMCache.sidebarMenu.classList.toggle('active');
        const isHidden = !DOMCache.sidebarMenu.classList.contains('active');
        DOMCache.sidebarMenu.setAttribute('aria-hidden', isHidden.toString());
    }

    closeSidebar() {
        DOMCache.sidebarMenu.classList.remove('active');
        DOMCache.sidebarMenu.setAttribute('aria-hidden', 'true');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    clearInput() {
        DOMCache.userInput.value = '';
        this.draftSaver.clearDraft();
        VibrationFeedback.light();
    }

    attachFile() {
        DOMCache.fileInput.click();
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.displayAttachedFile(file);
            }
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        
        if (file.size > maxSize) {
            this.showError('Файл слишком большой (макс. 10MB)');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Неподдерживаемый тип файла');
            return false;
        }
        
        return true;
    }

    displayAttachedFile(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <span>${InputSanitizer.sanitizeFilename(file.name)}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        DOMCache.attachedFiles.appendChild(fileElement);
    }

    handleQuickAction(action) {
        const actions = {
            summarize: 'Пожалуйста, суммаризируй следующий текст:',
            translate: 'Переведи на английский:',
            explain: 'Объясни подробнее:',
            code: 'Напиши код для:'
        };
        
        if (actions[action]) {
            DOMCache.userInput.value = actions[action] + ' ';
            DOMCache.userInput.focus();
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.currentTarget.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    openSearch() {
        DOMCache.searchModal.style.display = 'block';
        DOMCache.searchInput.focus();
    }

    closeSearch() {
        DOMCache.searchModal.style.display = 'none';
        DOMCache.searchInput.value = '';
        this.messageSearch.clearResults();
    }

    closeModels() {
        DOMCache.modelsModal.style.display = 'none';
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now();
        this.currentChatId = chatId;
        this.chats.set(chatId, {
            id: chatId,
            name: 'Новый чат',
            timestamp: new Date().toISOString(),
            messages: []
        });
        
        this.updateChatList();
        this.clearMessages();
        document.dispatchEvent(new CustomEvent('chatCreated'));
        VibrationFeedback.light();
    }

    exportChats() {
        const currentChat = this.chats.get(this.currentChatId);
        if (currentChat) {
            PDFExporter.exportChatToPDF(currentChat.messages, `chat-${this.currentChatId}.txt`);
        }
    }

    clearAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты?')) {
            this.chats.clear();
            this.currentChatId = null;
            this.updateChatList();
            this.clearMessages();
            localStorage.removeItem('chats');
            VibrationFeedback.heavy();
        }
    }

    updateChatList() {
        // Implementation to update chat list in sidebar
    }

    clearMessages() {
        DOMCache.messagesContainer.innerHTML = '';
    }

    loadChats() {
        // Implementation to load chats from storage
    }

    handleOnline() {
        this.isOnline = true;
        this.showStatus('Соединение восстановлено', 'success');
    }

    handleOffline() {
        this.isOnline = false;
        this.showStatus('Режим офлайн', 'warning');
    }

    handleWebSocketMessage(data) {
        // Handle real-time messages from WebSocket
        console.log('WebSocket message:', data);
    }

    showError(message) {
        // Implementation for showing error messages
        console.error(message);
    }

    showStatus(message, type) {
        // Implementation for showing status messages
        console.log(`${type}: ${message}`);
    }

    copyMessage(messageId) {
        const message = this.findMessage(messageId);
        if (message) {
            navigator.clipboard.writeText(message.content);
            VibrationFeedback.light();
        }
    }

    shareMessage(messageId) {
        const message = this.findMessage(messageId);
        if (message && navigator.share) {
            navigator.share({
                title: 'Сообщение из KHAI Chat',
                text: message.content
            });
        }
    }

    findMessage(messageId) {
        // Implementation to find message by ID
        return null;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIChatApp();
});

// Additional utility functions
function formatMessageContent(content) {
    // Format message content with markdown-like syntax
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        KHAIChatApp,
        InputSanitizer,
        DataEncryption,
        MessageVirtualizer,
        LazyImageLoader
    };
}
