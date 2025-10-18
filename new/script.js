// Global state
const state = {
    currentMode: 'normal',
    messages: [],
    isGenerating: false,
    currentModel: 'gpt-4',
    theme: localStorage.getItem('theme') || 'light',
    attachedFiles: [],
    chatHistory: JSON.parse(localStorage.getItem('chatHistory')) || []
};

// DOM elements
const elements = {
    // Header
    logoBtn: document.getElementById('logoBtn'),
    modelSelectBtn: document.getElementById('modelSelectBtn'),
    headerSearch: document.getElementById('headerSearch'),
    headerSearchClear: document.getElementById('headerSearchClear'),
    themeToggle: document.getElementById('themeToggle'),
    menuToggle: document.getElementById('menuToggle'),
    
    // Main chat
    messagesContainer: document.getElementById('messagesContainer'),
    
    // Minimap
    chatMinimap: document.getElementById('chatMinimap'),
    minimapContent: document.getElementById('minimapContent'),
    minimapViewport: document.getElementById('minimapViewport'),
    scrollToLastAI: document.getElementById('scrollToLastAI'),
    scrollToBottom: document.getElementById('scrollToBottom'),
    minimapThemeToggle: document.getElementById('minimapThemeToggle'),
    
    // Input section
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    voiceInputBtn: document.getElementById('voiceInputBtn'),
    attachFileBtn: document.getElementById('attachFileBtn'),
    fileInput: document.getElementById('fileInput'),
    attachedFiles: document.getElementById('attachedFiles'),
    
    // Mode buttons
    normalModeBtn: document.getElementById('normalModeBtn'),
    generateVoiceBtn: document.getElementById('generateVoiceBtn'),
    generateImageBtn: document.getElementById('generateImageBtn'),
    generateCodeBtn: document.getElementById('generateCodeBtn'),
    
    // Footer
    helpBtn: document.getElementById('helpBtn'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    downloadHistoryBtn: document.getElementById('downloadHistoryBtn'),
    
    // Sidebar
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    sidebar: document.getElementById('sidebar'),
    sidebarClose: document.getElementById('sidebarClose'),
    sidebarContent: document.getElementById('sidebarContent'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    
    // Modals
    modelModalOverlay: document.getElementById('modelModalOverlay'),
    modelModalClose: document.getElementById('modelModalClose'),
    helpModalOverlay: document.getElementById('helpModalOverlay'),
    helpModalClose: document.getElementById('helpModalClose')
};

// Initialize the application
function init() {
    applyTheme();
    setupEventListeners();
    loadChatHistory();
    updateUI();
    renderMinimap();
}

// Apply current theme
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeIcon = state.theme === 'dark' ? 'ti-sun' : 'ti-moon';
    elements.themeToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
    elements.minimapThemeToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
}

// Setup all event listeners
function setupEventListeners() {
    // Theme toggles
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.minimapThemeToggle.addEventListener('click', toggleTheme);
    
    // Header controls
    elements.logoBtn.addEventListener('click', () => {
        elements.messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    elements.modelSelectBtn.addEventListener('click', () => {
        elements.modelModalOverlay.classList.add('active');
    });
    
    elements.modelModalClose.addEventListener('click', () => {
        elements.modelModalOverlay.classList.remove('active');
    });
    
    elements.modelModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modelModalOverlay) {
            elements.modelModalOverlay.classList.remove('active');
        }
    });
    
    // Search functionality
    elements.headerSearch.addEventListener('input', handleSearch);
    elements.headerSearchClear.addEventListener('click', clearSearch);
    
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.add('active');
        elements.sidebarOverlay.classList.add('active');
    });
    
    elements.sidebarClose.addEventListener('click', closeSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Input controls
    elements.userInput.addEventListener('input', handleInputChange);
    elements.userInput.addEventListener('keydown', handleInputKeydown);
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.clearInputBtn.addEventListener('click', clearInput);
    elements.voiceInputBtn.addEventListener('click', startVoiceInput);
    
    // File attachment
    elements.attachFileBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Mode buttons
    elements.normalModeBtn.addEventListener('click', () => setMode('normal'));
    elements.generateVoiceBtn.addEventListener('click', () => setMode('voice'));
    elements.generateImageBtn.addEventListener('click', () => setMode('image'));
    elements.generateCodeBtn.addEventListener('click', () => setMode('code'));
    
    // Footer buttons
    elements.helpBtn.addEventListener('click', () => {
        elements.helpModalOverlay.classList.add('active');
    });
    
    elements.helpModalClose.addEventListener('click', () => {
        elements.helpModalOverlay.classList.remove('active');
    });
    
    elements.helpModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.helpModalOverlay) {
            elements.helpModalOverlay.classList.remove('active');
        }
    });
    
    elements.clearChatBtn.addEventListener('click', clearChat);
    elements.downloadHistoryBtn.addEventListener('click', downloadHistory);
    
    // Minimap and navigation
    elements.scrollToLastAI.addEventListener('click', scrollToLastAIMessage);
    elements.scrollToBottom.addEventListener('click', scrollToBottom);
    elements.chatMinimap.addEventListener('click', handleMinimapClick);
    
    // Model selection
    document.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('click', () => {
            const model = item.dataset.model;
            setModel(model);
            elements.modelModalOverlay.classList.remove('active');
        });
    });
    
    // Scroll events for minimap
    elements.messagesContainer.addEventListener('scroll', updateMinimapViewport);
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
}

// Theme toggle
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    applyTheme();
}

// Handle search input
function handleSearch(e) {
    const searchTerm = e.target.value.trim();
    elements.headerSearchClear.style.display = searchTerm ? 'block' : 'none';
    
    if (searchTerm.length > 2) {
        highlightSearchResults(searchTerm);
    } else {
        clearSearchHighlights();
    }
}

function clearSearch() {
    elements.headerSearch.value = '';
    elements.headerSearchClear.style.display = 'none';
    clearSearchHighlights();
}

function highlightSearchResults(term) {
    clearSearchHighlights();
    
    const messages = elements.messagesContainer.querySelectorAll('.message-text');
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    messages.forEach(message => {
        const html = message.innerHTML;
        const highlighted = html.replace(regex, match => 
            `<mark class="search-highlight">${match}</mark>`
        );
        message.innerHTML = highlighted;
    });
}

function clearSearchHighlights() {
    const highlights = elements.messagesContainer.querySelectorAll('mark.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

// Input handling
function handleInputChange() {
    const value = elements.userInput.value.trim();
    elements.clearInputBtn.style.display = value ? 'block' : 'none';
    
    // Auto-resize textarea
    elements.userInput.style.height = 'auto';
    elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 120) + 'px';
    
    // Update send button state
    elements.sendBtn.disabled = !value && state.attachedFiles.length === 0;
}

function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function clearInput() {
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';
    elements.clearInputBtn.style.display = 'none';
    elements.sendBtn.disabled = true;
}

// Voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showMessage('Голосовой ввод не поддерживается в вашем браузере', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;
    
    recognition.start();
    
    recognition.onstart = () => {
        elements.voiceInputBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
        elements.voiceInputBtn.style.background = 'var(--accent-primary)';
        elements.voiceInputBtn.style.color = 'white';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = transcript;
        handleInputChange();
    };
    
    recognition.onend = () => {
        elements.voiceInputBtn.innerHTML = '<i class="ti ti-microphone"></i>';
        elements.voiceInputBtn.style.background = '';
        elements.voiceInputBtn.style.color = '';
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showMessage('Ошибка распознавания речи: ' + event.error, 'error');
    };
}

// File handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showMessage(`Файл ${file.name} слишком большой (макс. 10MB)`, 'error');
            return;
        }
        
        state.attachedFiles.push({
            file: file,
            id: Date.now() + Math.random()
        });
    });
    
    renderAttachedFiles();
    elements.sendBtn.disabled = false;
    elements.fileInput.value = '';
}

function renderAttachedFiles() {
    elements.attachedFiles.innerHTML = '';
    
    state.attachedFiles.forEach(fileInfo => {
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <span>${fileInfo.file.name}</span>
            <button class="file-remove" data-id="${fileInfo.id}">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        elements.attachedFiles.appendChild(fileElement);
    });
    
    // Add event listeners for remove buttons
    elements.attachedFiles.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            state.attachedFiles = state.attachedFiles.filter(f => f.id != id);
            renderAttachedFiles();
            
            if (state.attachedFiles.length === 0 && !elements.userInput.value.trim()) {
                elements.sendBtn.disabled = true;
            }
        });
    });
}

// Mode management
function setMode(mode) {
    state.currentMode = mode;
    
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    switch (mode) {
        case 'normal':
            elements.normalModeBtn.classList.add('active');
            elements.userInput.placeholder = 'Задайте вопрос...';
            break;
        case 'voice':
            elements.generateVoiceBtn.classList.add('active');
            elements.userInput.placeholder = 'Опишите, что нужно озвучить...';
            break;
        case 'image':
            elements.generateImageBtn.classList.add('active');
            elements.userInput.placeholder = 'Опишите изображение для генерации...';
            break;
        case 'code':
            elements.generateCodeBtn.classList.add('active');
            elements.userInput.placeholder = 'Опишите код для генерации...';
            break;
    }
    
    updateUI();
}

function setModel(model) {
    state.currentModel = model;
    
    // Update model selection UI
    document.querySelectorAll('.model-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.model === model) {
            item.classList.add('active');
        }
    });
}

// Message handling
function sendMessage() {
    const message = elements.userInput.value.trim();
    
    if (!message && state.attachedFiles.length === 0) {
        return;
    }
    
    // Add user message
    addMessage(message, 'user', state.attachedFiles);
    
    // Clear input and files
    clearInput();
    state.attachedFiles = [];
    renderAttachedFiles();
    
    // Generate AI response
    generateAIResponse(message);
}

function addMessage(content, type, files = []) {
    const message = {
        id: Date.now(),
        content,
        type,
        files: [...files],
        timestamp: new Date(),
        model: type === 'ai' ? state.currentModel : null
    };
    
    state.messages.push(message);
    
    const messageElement = createMessageElement(message);
    elements.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    setTimeout(() => {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }, 100);
    
    // Update minimap
    renderMinimap();
    
    // Save to history
    saveToHistory();
    
    return messageElement;
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${message.type}`;
    messageDiv.dataset.messageId = message.id;
    
    let filesHTML = '';
    if (message.files && message.files.length > 0) {
        filesHTML = message.files.map(file => 
            `<div class="message-file">
                <i class="ti ti-file"></i>
                ${file.file.name}
            </div>`
        ).join('');
    }
    
    const timestamp = message.timestamp.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-header">
                <div class="message-avatar ${message.type}-avatar">
                    ${message.type === 'user' ? 'В' : 'ИИ'}
                </div>
                <span class="message-time">${timestamp}</span>
                ${message.model ? `<span class="message-model">${message.model}</span>` : ''}
            </div>
            <div class="message-text">${formatMessageContent(message.content)}</div>
            ${filesHTML}
            <div class="message-actions">
                <button class="message-action" onclick="copyMessage(${message.id})" title="Копировать">
                    <i class="ti ti-copy"></i>
                </button>
                <button class="message-action" onclick="editMessage(${message.id})" title="Редактировать">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="message-action" onclick="deleteMessage(${message.id})" title="Удалить">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return messageDiv;
}

function formatMessageContent(content) {
    if (!content) return '';
    
    // Escape HTML to prevent XSS
    let escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    // Format code blocks
    escaped = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>');
    
    // Format inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Format links
    escaped = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Format line breaks
    escaped = escaped.replace(/\n/g, '<br>');
    
    return escaped;
}

function generateAIResponse(userMessage) {
    if (state.isGenerating) return;
    
    state.isGenerating = true;
    elements.sendBtn.disabled = true;
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message message-ai';
    typingIndicator.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    elements.messagesContainer.appendChild(typingIndicator);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        typingIndicator.remove();
        
        let response = '';
        switch (state.currentMode) {
            case 'normal':
                response = generateNormalResponse(userMessage);
                break;
            case 'voice':
                response = generateVoiceResponse(userMessage);
                break;
            case 'image':
                response = generateImageResponse(userMessage);
                break;
            case 'code':
                response = generateCodeResponse(userMessage);
                break;
        }
        
        addMessage(response, 'ai');
        
        state.isGenerating = false;
        elements.sendBtn.disabled = false;
        
        // Highlight code blocks
        highlightCodeBlocks();
    }, 2000 + Math.random() * 2000);
}

function generateNormalResponse(message) {
    const responses = [
        `Я понимаю ваш вопрос: "${message}". Как ИИ-ассистент, я могу помочь вам с анализом информации, генерацией текста, решением задач и многим другим. Что конкретно вас интересует?`,
        `Спасибо за ваш запрос! На основе моего анализа "${message}", я могу предложить несколько решений или дополнительную информацию по этой теме.`,
        `Интересный вопрос! "${message}" - это тема, которая требует внимательного рассмотрения. Я готов предоставить вам подробный ответ и дополнительные материалы.`,
        `Я обработал ваш запрос "${message}". Как ИИ-помощник, я могу предложить различные варианты решения или углубиться в детали этой темы.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateVoiceResponse(message) {
    return `Голосовой режим: Я подготовил озвучку для "${message}". Голосовое сообщение сгенерировано и готово к воспроизведению.`;
}

function generateImageResponse(message) {
    return `Режим генерации изображений: На основе описания "${message}" я создал визуализацию. Изображение сгенерировано в высоком качестве и соответствует вашему запросу.`;
}

function generateCodeResponse(message) {
    return `Режим генерации кода: На основе описания "${message}" я создал следующий код:\n\n\`\`\`javascript\nfunction example() {\n    console.log("Сгенерированный код на основе вашего запроса");\n    // Дополнительная логика здесь\n}\n\`\`\``;
}

function highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

// Message actions
function copyMessage(messageId) {
    const message = state.messages.find(m => m.id === messageId);
    if (message) {
        navigator.clipboard.writeText(message.content)
            .then(() => showMessage('Сообщение скопировано', 'success'))
            .catch(() => showMessage('Ошибка копирования', 'error'));
    }
}

function editMessage(messageId) {
    const message = state.messages.find(m => m.id === messageId);
    if (message && message.type === 'user') {
        elements.userInput.value = message.content;
        handleInputChange();
        deleteMessage(messageId);
        elements.userInput.focus();
    }
}

function deleteMessage(messageId) {
    state.messages = state.messages.filter(m => m.id !== messageId);
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.remove();
    }
    renderMinimap();
    saveToHistory();
}

function showMessage(text, type = 'info') {
    const message = addMessage(text, type);
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

// Minimap functionality
function renderMinimap() {
    elements.minimapContent.innerHTML = '';
    
    state.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `minimap-message minimap-message-${message.type}`;
        messageElement.dataset.messageId = message.id;
        elements.minimapContent.appendChild(messageElement);
    });
    
    updateMinimapViewport();
}

function updateMinimapViewport() {
    const container = elements.messagesContainer;
    const content = container.scrollHeight - container.clientHeight;
    const scrollTop = container.scrollTop;
    
    if (content <= 0) {
        elements.minimapViewport.style.display = 'none';
        return;
    }
    
    elements.minimapViewport.style.display = 'block';
    
    const viewportHeight = (container.clientHeight / container.scrollHeight) * elements.chatMinimap.clientHeight;
    const viewportTop = (scrollTop / content) * (elements.chatMinimap.clientHeight - viewportHeight);
    
    elements.minimapViewport.style.height = `${viewportHeight}px`;
    elements.minimapViewport.style.top = `${viewportTop}px`;
}

function handleMinimapClick(e) {
    const rect = elements.chatMinimap.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / elements.chatMinimap.clientHeight;
    
    const container = elements.messagesContainer;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const targetScroll = percentage * maxScroll;
    
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
}

// Navigation
function scrollToLastAIMessage() {
    const aiMessages = state.messages.filter(m => m.type === 'ai');
    if (aiMessages.length > 0) {
        const lastAIMessage = aiMessages[aiMessages.length - 1];
        const messageElement = document.querySelector(`[data-message-id="${lastAIMessage.id}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function scrollToBottom() {
    elements.messagesContainer.scrollTo({ 
        top: elements.messagesContainer.scrollHeight, 
        behavior: 'smooth' 
    });
}

// Chat history
function saveToHistory() {
    if (state.messages.length === 0) return;
    
    const chatSession = {
        id: Date.now(),
        title: state.messages[0].content.substring(0, 50) + '...',
        preview: state.messages[state.messages.length - 1].content.substring(0, 100) + '...',
        messages: [...state.messages],
        timestamp: new Date(),
        model: state.currentModel
    };
    
    // Remove existing session with same ID or add new one
    state.chatHistory = state.chatHistory.filter(session => session.id !== chatSession.id);
    state.chatHistory.unshift(chatSession);
    
    // Keep only last 50 sessions
    state.chatHistory = state.chatHistory.slice(0, 50);
    
    localStorage.setItem('chatHistory', JSON.stringify(state.chatHistory));
    loadChatHistory();
}

function loadChatHistory() {
    elements.chatHistoryList.innerHTML = '';
    
    state.chatHistory.forEach(session => {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        item.innerHTML = `
            <div class="chat-history-title">${session.title}</div>
            <div class="chat-history-preview">${session.preview}</div>
            <div class="chat-history-time">${session.timestamp.toLocaleDateString('ru-RU')}</div>
        `;
        
        item.addEventListener('click', () => loadChatSession(session.id));
        elements.chatHistoryList.appendChild(item);
    });
}

function loadChatSession(sessionId) {
    const session = state.chatHistory.find(s => s.id === sessionId);
    if (session) {
        // Clear current chat
        state.messages = [];
        elements.messagesContainer.innerHTML = '';
        
        // Load session messages
        session.messages.forEach(message => {
            addMessage(message.content, message.type, message.files);
        });
        
        // Set model
        setModel(session.model);
        
        closeSidebar();
        scrollToBottom();
    }
}

function clearChat() {
    if (state.messages.length === 0) return;
    
    if (confirm('Вы уверены, что хотите очистить чат? История будет сохранена.')) {
        state.messages = [];
        elements.messagesContainer.innerHTML = '';
        renderMinimap();
        saveToHistory();
    }
}

function downloadHistory() {
    if (state.messages.length === 0) {
        showMessage('Нет сообщений для скачивания', 'error');
        return;
    }
    
    const chatData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        model: state.currentModel,
        messages: state.messages
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('История чата скачана', 'success');
}

// Sidebar management
function closeSidebar() {
    elements.sidebar.classList.remove('active');
    elements.sidebarOverlay.classList.remove('active');
}

// Global keyboard shortcuts
function handleGlobalKeydown(e) {
    // Ctrl + / to clear chat
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        clearChat();
    }
    
    // Ctrl + H to toggle history
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (elements.sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            elements.sidebar.classList.add('active');
            elements.sidebarOverlay.classList.add('active');
        }
    }
    
    // Escape to close modals and sidebar
    if (e.key === 'Escape') {
        closeSidebar();
        elements.modelModalOverlay.classList.remove('active');
        elements.helpModalOverlay.classList.remove('active');
    }
}

// UI updates
function updateUI() {
    // Update send button state based on current mode and input
    const hasInput = elements.userInput.value.trim() || state.attachedFiles.length > 0;
    elements.sendBtn.disabled = !hasInput || state.isGenerating;
    
    // Update mode-specific UI elements
    updateModeSpecificUI();
}

function updateModeSpecificUI() {
    // Add any mode-specific UI updates here
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export functions for global access
window.copyMessage = copyMessage;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
