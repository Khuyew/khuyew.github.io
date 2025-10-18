// Main application state
const state = {
    currentChatId: 'default',
    chats: {
        'default': {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    },
    currentModel: 'gpt-4-turbo',
    theme: 'dark',
    isGenerating: false,
    isReadingMode: false,
    searchResults: [],
    currentSearchIndex: -1,
    selectedFiles: [],
    voiceRecognition: null,
    isRecording: false
};

// DOM Elements
const elements = {
    // Containers
    messagesContainer: document.getElementById('messagesContainer'),
    inputSection: document.getElementById('inputSection'),
    attachedFiles: document.getElementById('attachedFiles'),
    chatList: document.getElementById('chatList'),
    
    // Input elements
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    fileInput: document.getElementById('fileInput'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    voiceInputBtn: document.getElementById('voiceInputBtn'),
    
    // Header elements
    headerSearch: document.getElementById('headerSearch'),
    headerSearchClear: document.getElementById('headerSearchClear'),
    searchResultsDropdown: document.getElementById('searchResultsDropdown'),
    searchResultsList: document.getElementById('searchResultsList'),
    
    // Sidebar elements
    sidebarMenu: document.getElementById('sidebarMenu'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    menuToggle: document.getElementById('menuToggle'),
    sidebarClose: document.getElementById('sidebarClose'),
    newChatBtn: document.getElementById('newChatBtn'),
    
    // Footer elements
    currentChatName: document.getElementById('currentChatName'),
    footerClearChatBtn: document.getElementById('footerClearChatBtn'),
    footerDownloadBtn: document.getElementById('footerDownloadBtn'),
    footerHelpBtn: document.getElementById('footerHelpBtn'),
    
    // Mode buttons
    normalModeBtn: document.getElementById('normalModeBtn'),
    generateVoiceBtn: document.getElementById('generateVoiceBtn'),
    generateImageBtn: document.getElementById('generateImageBtn'),
    
    // Model selection
    modelSelectBtn: document.getElementById('modelSelectBtn'),
    modelModalOverlay: document.getElementById('modelModalOverlay'),
    modelModalClose: document.getElementById('modelModalClose'),
    modelModalCancel: document.getElementById('modelModalCancel'),
    modelModalConfirm: document.getElementById('modelModalConfirm'),
    
    // Edit chat modal
    editChatModal: document.getElementById('editChatModal'),
    editChatModalClose: document.getElementById('editChatModalClose'),
    editChatModalCancel: document.getElementById('editChatModalCancel'),
    editChatModalSave: document.getElementById('editChatModalSave'),
    editChatNameInput: document.getElementById('editChatNameInput'),
    
    // Minimap and navigation
    chatMinimap: document.getElementById('chatMinimap'),
    minimapContent: document.getElementById('minimapContent'),
    minimapViewport: document.getElementById('minimapViewport'),
    scrollToLastAI: document.getElementById('scrollToLastAI'),
    scrollToBottom: document.getElementById('scrollToBottom'),
    
    // Theme toggle
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    
    // App header and footer
    appHeader: document.querySelector('.app-header'),
    appFooter: document.querySelector('.app-footer')
};

// Initialize the application
function init() {
    loadState();
    setupEventListeners();
    setupTheme();
    setupMinimap();
    renderChatList();
    updateUI();
    setupPuterAI();
    
    // Show welcome message if no messages
    const currentChat = state.chats[state.currentChatId];
    if (currentChat.messages.length === 0) {
        showWelcomeMessage();
    } else {
        renderMessages();
    }
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('khaiChatState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(state, parsed);
        
        // Migrate old state structure if needed
        if (!state.chats) {
            state.chats = {
                'default': {
                    id: 'default',
                    name: 'Основной чат',
                    messages: state.messages || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };
            delete state.messages;
        }
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('khaiChatState', JSON.stringify({
        currentChatId: state.currentChatId,
        chats: state.chats,
        currentModel: state.currentModel,
        theme: state.theme
    }));
}

// Setup all event listeners
function setupEventListeners() {
    // Input events
    elements.userInput.addEventListener('input', handleInputChange);
    elements.userInput.addEventListener('keydown', handleInputKeydown);
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.clearInputBtn.addEventListener('click', clearInput);
    elements.voiceInputBtn.addEventListener('click', toggleVoiceInput);
    
    // File handling
    elements.fileInput.addEventListener('change', handleFileSelect);
    document.getElementById('attachFileBtn').addEventListener('click', () => elements.fileInput.click());
    
    // Header search
    elements.headerSearch.addEventListener('input', handleHeaderSearch);
    elements.headerSearchClear.addEventListener('click', clearHeaderSearch);
    
    // Sidebar events
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.sidebarClose.addEventListener('click', toggleSidebar);
    elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    elements.newChatBtn.addEventListener('click', createNewChat);
    
    // Footer events
    elements.footerClearChatBtn.addEventListener('click', clearCurrentChat);
    elements.footerDownloadBtn.addEventListener('click', downloadChatHistory);
    elements.footerHelpBtn.addEventListener('click', showHelp);
    
    // Mode buttons
    elements.normalModeBtn.addEventListener('click', () => setMode('normal'));
    elements.generateVoiceBtn.addEventListener('click', () => setMode('voice'));
    elements.generateImageBtn.addEventListener('click', () => setMode('image'));
    
    // Model selection
    elements.modelSelectBtn.addEventListener('click', showModelModal);
    elements.modelModalClose.addEventListener('click', hideModelModal);
    elements.modelModalCancel.addEventListener('click', hideModelModal);
    elements.modelModalConfirm.addEventListener('click', confirmModelSelection);
    
    // Edit chat modal
    elements.editChatModalClose.addEventListener('click', hideEditChatModal);
    elements.editChatModalCancel.addEventListener('click', hideEditChatModal);
    elements.editChatModalSave.addEventListener('click', saveChatName);
    
    // Navigation
    elements.scrollToLastAI.addEventListener('click', scrollToLastAIMessage);
    elements.scrollToBottom.addEventListener('click', scrollToBottom);
    
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Minimap events
    elements.chatMinimap.addEventListener('click', handleMinimapClick);
    
    // Global events
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', updateMinimap);
    elements.messagesContainer.addEventListener('scroll', updateMinimapViewport);
    
    // Touch events for reading mode
    let touchStartY = 0;
    let touchStartTime = 0;
    let isScrolling = false;
    let isSelecting = false;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        isSelecting = false;
    });
    
    document.addEventListener('touchmove', (e) => {
        isScrolling = true;
    });
    
    document.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Long press (500ms) or scrolling triggers reading mode
        if (touchDuration > 500 || isScrolling) {
            toggleReadingMode(true);
        }
    });
    
    // Mouse events for reading mode
    let mouseDownTime = 0;
    let isMouseDown = false;
    
    document.addEventListener('mousedown', (e) => {
        mouseDownTime = Date.now();
        isMouseDown = true;
        isSelecting = window.getSelection().toString().length > 0;
    });
    
    document.addEventListener('mouseup', (e) => {
        if (isMouseDown) {
            const mouseUpTime = Date.now();
            const mouseDuration = mouseUpTime - mouseDownTime;
            
            // Long click (500ms) or text selection triggers reading mode
            if (mouseDuration > 500 || isSelecting) {
                toggleReadingMode(true);
            }
        }
        isMouseDown = false;
        isSelecting = false;
    });
    
    // Click outside to exit reading mode
    document.addEventListener('click', (e) => {
        if (state.isReadingMode && !e.target.closest('.message')) {
            toggleReadingMode(false);
        }
    });
}

// Setup Puter AI SDK
function setupPuterAI() {
    // Puter.ai is already loaded via CDN in HTML
    console.log('Puter AI SDK loaded');
}

// Theme management
function setupTheme() {
    const savedTheme = localStorage.getItem('khaiTheme') || 'dark';
    state.theme = savedTheme;
    applyTheme();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveState();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    elements.themeIcon.className = state.theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
    elements.themeToggleBtn.title = state.theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему';
}

// Input handling
function handleInputChange() {
    const value = elements.userInput.value.trim();
    elements.clearInputBtn.style.display = value ? 'flex' : 'none';
    
    // Auto-resize textarea
    elements.userInput.style.height = 'auto';
    elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 120) + 'px';
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
}

// File handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    state.selectedFiles = [...state.selectedFiles, ...files];
    renderAttachedFiles();
    elements.fileInput.value = '';
}

function renderAttachedFiles() {
    elements.attachedFiles.innerHTML = state.selectedFiles.map((file, index) => `
        <div class="attached-file">
            <i class="ti ti-file-text"></i>
            <span>${file.name}</span>
            <button class="remove-file" onclick="removeFile(${index})">
                <i class="ti ti-x"></i>
            </button>
        </div>
    `).join('');
}

function removeFile(index) {
    state.selectedFiles.splice(index, 1);
    renderAttachedFiles();
}

// Voice input
function toggleVoiceInput() {
    if (!state.voiceRecognition) {
        initializeVoiceRecognition();
    }
    
    if (state.isRecording) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
}

function initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
        return;
    }
    
    state.voiceRecognition = new SpeechRecognition();
    state.voiceRecognition.continuous = false;
    state.voiceRecognition.interimResults = true;
    state.voiceRecognition.lang = 'ru-RU';
    
    state.voiceRecognition.onstart = () => {
        state.isRecording = true;
        elements.voiceInputBtn.classList.add('active');
        showNotification('Слушаю...', 'info');
    };
    
    state.voiceRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        elements.userInput.value = transcript;
        handleInputChange();
    };
    
    state.voiceRecognition.onend = () => {
        state.isRecording = false;
        elements.voiceInputBtn.classList.remove('active');
    };
    
    state.voiceRecognition.onerror = (event) => {
        showNotification('Ошибка распознавания речи: ' + event.error, 'error');
        state.isRecording = false;
        elements.voiceInputBtn.classList.remove('active');
    };
}

function startVoiceRecognition() {
    try {
        state.voiceRecognition.start();
    } catch (error) {
        showNotification('Не удалось начать запись', 'error');
    }
}

function stopVoiceRecognition() {
    try {
        state.voiceRecognition.stop();
    } catch (error) {
        // Ignore stop errors
    }
}

// Message handling
async function sendMessage() {
    const message = elements.userInput.value.trim();
    const files = state.selectedFiles;
    
    if (!message && files.length === 0) {
        showNotification('Введите сообщение или прикрепите файл', 'warning');
        return;
    }
    
    if (state.isGenerating) {
        showNotification('Подождите завершения предыдущего запроса', 'warning');
        return;
    }
    
    // Add user message
    const userMessage = {
        id: generateId(),
        type: 'user',
        content: message,
        files: files.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
        })),
        timestamp: new Date().toISOString(),
        model: state.currentModel
    };
    
    addMessageToCurrentChat(userMessage);
    clearInput();
    state.selectedFiles = [];
    renderAttachedFiles();
    
    // Show loading state
    state.isGenerating = true;
    updateUI();
    
    try {
        // Prepare message history for context
        const currentChat = state.chats[state.currentChatId];
        const messageHistory = currentChat.messages
            .filter(msg => msg.type === 'user' || msg.type === 'ai')
            .slice(-10) // Last 10 messages for context
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
        
        // Add current message
        messageHistory.push({
            role: 'user',
            content: message
        });
        
        // Generate AI response using Puter AI
        const response = await generateAIResponse(messageHistory);
        
        // Add AI message
        const aiMessage = {
            id: generateId(),
            type: 'ai',
            content: response,
            timestamp: new Date().toISOString(),
            model: state.currentModel
        };
        
        addMessageToCurrentChat(aiMessage);
        
    } catch (error) {
        console.error('Error generating response:', error);
        
        const errorMessage = {
            id: generateId(),
            type: 'error',
            content: 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.',
            timestamp: new Date().toISOString()
        };
        
        addMessageToCurrentChat(errorMessage);
    } finally {
        state.isGenerating = false;
        updateUI();
        scrollToBottom();
    }
}

async function generateAIResponse(messages) {
    // Use Puter AI SDK to generate response
    const response = await puter.ai.chat({
        messages: messages,
        model: state.currentModel,
        max_tokens: 4000,
        temperature: 0.7
    });
    
    return response.content;
}

function addMessageToCurrentChat(message) {
    const chat = state.chats[state.currentChatId];
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    saveState();
    renderMessages();
    updateChatList();
}

// Rendering
function renderMessages() {
    const chat = state.chats[state.currentChatId];
    elements.messagesContainer.innerHTML = chat.messages.map(message => `
        <div class="message message-${message.type}" data-message-id="${message.id}">
            <div class="message-content">${formatMessageContent(message)}</div>
            ${message.model ? `<div class="model-indicator">Модель: ${getModelDisplayName(message.model)}</div>` : ''}
            ${message.type === 'ai' ? `
                <div class="message-actions">
                    <button class="action-btn-small" onclick="copyMessage('${message.id}')">
                        <i class="ti ti-copy"></i> Копировать
                    </button>
                    <button class="action-btn-small" onclick="regenerateMessage('${message.id}')">
                        <i class="ti ti-refresh"></i> Перегенерировать
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Apply syntax highlighting
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
    
    updateMinimap();
}

function formatMessageContent(message) {
    let content = message.content;
    
    // Escape HTML but preserve code blocks for marked
    content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Convert markdown to HTML
    content = marked.parse(content);
    
    // Add copy buttons to code blocks
    content = content.replace(/<pre><code class="([^"]*)">/g, (match, language) => `
        <div class="code-header">
            <span class="code-language">${language || 'text'}</span>
            <button class="copy-code-btn" onclick="copyCode(this)">
                <i class="ti ti-copy"></i> Копировать
            </button>
        </div>
        <pre><code class="${language}">
    `);
    
    return content;
}

function showWelcomeMessage() {
    const welcomeMessage = {
        id: generateId(),
        type: 'ai',
        content: `# Добро пожаловать в KHAI Assistant! 👋

Я ваш ИИ-помощник, готовый помочь с различными задачами. Вот что я умею:

## 📝 Основные возможности
- **Текстовые ответы** на любые вопросы
- **Генерация изображений** по описанию
- **Голосовые ответы** для удобного прослушивания
- **Поиск по чату** для быстрого нахождения информации
- **Поддержка кода** с подсветкой синтаксиса

## 🎯 Советы по использованию
- Задавайте вопросы естественным языком
- Используйте кнопки внизу для смены режимов
- Прикрепляйте файлы для анализа
- Ищите по истории чата в верхней панели

Начните общение, отправив сообщение ниже!`,
        timestamp: new Date().toISOString(),
        model: state.currentModel
    };
    
    addMessageToCurrentChat(welcomeMessage);
}

// Search functionality
function handleHeaderSearch() {
    const query = elements.headerSearch.value.trim();
    elements.headerSearchClear.style.display = query ? 'flex' : 'none';
    
    if (query.length < 2) {
        elements.searchResultsDropdown.style.display = 'none';
        state.searchResults = [];
        state.currentSearchIndex = -1;
        clearSearchHighlights();
        return;
    }
    
    performSearch(query);
}

function performSearch(query) {
    const chat = state.chats[state.currentChatId];
    const results = [];
    
    chat.messages.forEach((message, index) => {
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
                messageIndex: index,
                message: message,
                preview: getSearchPreview(message.content, query)
            });
        }
    });
    
    state.searchResults = results;
    state.currentSearchIndex = -1;
    
    if (results.length > 0) {
        showSearchResults(results, query);
    } else {
        elements.searchResultsDropdown.style.display = 'none';
        clearSearchHighlights();
    }
}

function showSearchResults(results, query) {
    elements.searchResultsList.innerHTML = results.map((result, index) => `
        <div class="search-result-item ${index === state.currentSearchIndex ? 'current' : ''}" 
             onclick="navigateToSearchResult(${index})">
            <div style="font-weight: 500; margin-bottom: 2px;">
                ${result.message.type === 'user' ? '👤 Вы' : '🤖 KHAI'}
            </div>
            <div style="font-size: 12px; color: var(--text-tertiary);">
                ${result.preview}
            </div>
        </div>
    `).join('');
    
    elements.searchResultsDropdown.style.display = 'block';
    highlightSearchResults(query);
}

function getSearchPreview(content, query) {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + query.length + 50);
    
    let preview = content.substring(start, end);
    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';
    
    // Highlight the search term in preview
    const regex = new RegExp(`(${query})`, 'gi');
    preview = preview.replace(regex, '<mark>$1</mark>');
    
    return preview;
}

function highlightSearchResults(query) {
    const messages = elements.messagesContainer.querySelectorAll('.message');
    const regex = new RegExp(`(${query})`, 'gi');
    
    messages.forEach(message => {
        const content = message.querySelector('.message-content');
        if (content) {
            const originalContent = content.getAttribute('data-original') || content.innerHTML;
            content.setAttribute('data-original', originalContent);
            
            const highlightedContent = originalContent.replace(regex, '<mark class="search-highlight">$1</mark>');
            content.innerHTML = highlightedContent;
        }
    });
    
    // Also highlight minimap
    const minimapMessages = elements.minimapContent.querySelectorAll('.minimap-message');
    minimapMessages.forEach((minimapMsg, index) => {
        const message = state.chats[state.currentChatId].messages[index];
        if (message && message.content.toLowerCase().includes(query.toLowerCase())) {
            minimapMsg.classList.add('search-highlighted');
        } else {
            minimapMsg.classList.remove('search-highlighted');
        }
    });
}

function clearSearchHighlights() {
    const messages = elements.messagesContainer.querySelectorAll('.message');
    
    messages.forEach(message => {
        const content = message.querySelector('.message-content');
        if (content && content.getAttribute('data-original')) {
            content.innerHTML = content.getAttribute('data-original');
            content.removeAttribute('data-original');
        }
    });
    
    // Clear minimap highlights
    const minimapMessages = elements.minimapContent.querySelectorAll('.minimap-message');
    minimapMessages.forEach(msg => msg.classList.remove('search-highlighted'));
}

function clearHeaderSearch() {
    elements.headerSearch.value = '';
    elements.headerSearchClear.style.display = 'none';
    elements.searchResultsDropdown.style.display = 'none';
    state.searchResults = [];
    state.currentSearchIndex = -1;
    clearSearchHighlights();
}

function navigateToSearchResult(index) {
    if (index < 0 || index >= state.searchResults.length) return;
    
    state.currentSearchIndex = index;
    const result = state.searchResults[index];
    
    // Scroll to message
    const messageElement = elements.messagesContainer.querySelector(`[data-message-id="${result.message.id}"]`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add visual highlight
        messageElement.style.animation = 'none';
        messageElement.offsetHeight; // Trigger reflow
        messageElement.style.animation = 'fadeIn 0.5s ease';
        messageElement.style.backgroundColor = 'var(--accent-primary-alpha)';
        
        setTimeout(() => {
            messageElement.style.backgroundColor = '';
        }, 2000);
    }
    
    // Update search results display
    showSearchResults(state.searchResults, elements.headerSearch.value.trim());
}

// Chat management
function createNewChat() {
    const chatId = generateId();
    const chatName = `Чат ${Object.keys(state.chats).length + 1}`;
    
    state.chats[chatId] = {
        id: chatId,
        name: chatName,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    switchToChat(chatId);
    toggleSidebar();
    saveState();
}

function switchToChat(chatId) {
    state.currentChatId = chatId;
    elements.currentChatName.textContent = state.chats[chatId].name;
    renderMessages();
    updateUI();
    scrollToBottom();
    saveState();
}

function updateChatList() {
    const chats = Object.values(state.chats)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    elements.chatList.innerHTML = chats.map(chat => `
        <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" 
             onclick="switchToChat('${chat.id}')">
            <i class="ti ti-message-circle"></i>
            <div class="chat-item-content">
                <div class="chat-item-title">${chat.name}</div>
                <div class="chat-item-preview">${getChatPreview(chat)}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-action-btn" onclick="event.stopPropagation(); editChat('${chat.id}')" title="Редактировать">
                    <i class="ti ti-edit"></i>
                </button>
                ${chat.id !== 'default' ? `
                    <button class="chat-action-btn" onclick="event.stopPropagation(); deleteChat('${chat.id}')" title="Удалить">
                        <i class="ti ti-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getChatPreview(chat) {
    if (chat.messages.length === 0) return 'Нет сообщений';
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const content = lastMessage.content.substring(0, 50);
    return lastMessage.type === 'user' ? `Вы: ${content}...` : `KHAI: ${content}...`;
}

function editChat(chatId) {
    const chat = state.chats[chatId];
    elements.editChatNameInput.value = chat.name;
    elements.editChatModal.style.display = 'block';
    elements.editChatModal.setAttribute('data-chat-id', chatId);
}

function hideEditChatModal() {
    elements.editChatModal.style.display = 'none';
}

function saveChatName() {
    const chatId = elements.editChatModal.getAttribute('data-chat-id');
    const newName = elements.editChatNameInput.value.trim();
    
    if (newName && chatId) {
        state.chats[chatId].name = newName;
        if (chatId === state.currentChatId) {
            elements.currentChatName.textContent = newName;
        }
        updateChatList();
        saveState();
    }
    
    hideEditChatModal();
}

function deleteChat(chatId) {
    if (confirm('Вы уверены, что хотите удалить этот чат? История сообщений будет потеряна.')) {
        delete state.chats[chatId];
        
        if (state.currentChatId === chatId) {
            switchToChat('default');
        }
        
        updateChatList();
        saveState();
    }
}

function clearCurrentChat() {
    if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
        state.chats[state.currentChatId].messages = [];
        saveState();
        renderMessages();
        showWelcomeMessage();
    }
}

// Model selection
function showModelModal() {
    // Update selected model in list
    document.querySelectorAll('.model-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.model === state.currentModel);
    });
    
    elements.modelModalOverlay.classList.add('active');
}

function hideModelModal() {
    elements.modelModalOverlay.classList.remove('active');
}

function confirmModelSelection() {
    const selectedModel = document.querySelector('.model-item.selected').dataset.model;
    state.currentModel = selectedModel;
    updateUI();
    saveState();
    hideModelModal();
    showNotification(`Модель изменена на: ${getModelDisplayName(selectedModel)}`, 'success');
}

function getModelDisplayName(model) {
    const modelNames = {
        'gpt-4-turbo': 'GPT-4 Turbo',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        'claude-2': 'Claude 2',
        'gemini-pro': 'Gemini Pro'
    };
    return modelNames[model] || model;
}

// Mode management
function setMode(mode) {
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}ModeBtn`).classList.add('active');
    
    // Update input placeholder based on mode
    const placeholders = {
        normal: 'Задайте вопрос или опишите изображение...',
        voice: 'Опишите, что вы хотите услышать...',
        image: 'Опишите изображение, которое хотите сгенерировать...'
    };
    
    elements.userInput.placeholder = placeholders[mode] || placeholders.normal;
}

// Minimap functionality
function setupMinimap() {
    updateMinimap();
}

function updateMinimap() {
    const chat = state.chats[state.currentChatId];
    const container = elements.messagesContainer;
    
    if (chat.messages.length === 0) {
        elements.minimapContent.innerHTML = '';
        return;
    }
    
    // Calculate approximate message heights
    let totalHeight = 0;
    const messageHeights = chat.messages.map(message => {
        // Estimate height based on content length and type
        const baseHeight = message.type === 'user' ? 60 : 80;
        const contentHeight = Math.max(20, Math.min(200, message.content.length / 4));
        const height = baseHeight + contentHeight;
        totalHeight += height;
        return height;
    });
    
    // Scale factor for minimap
    const scaleFactor = elements.chatMinimap.clientHeight / totalHeight;
    
    elements.minimapContent.innerHTML = chat.messages.map((message, index) => {
        const height = Math.max(2, messageHeights[index] * scaleFactor);
        return `<div class="minimap-message ${message.type}" style="height: ${height}px"></div>`;
    }).join('');
    
    updateMinimapViewport();
}

function updateMinimapViewport() {
    const container = elements.messagesContainer;
    const viewport = elements.minimapViewport;
    
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    
    if (scrollHeight <= containerHeight) {
        viewport.style.display = 'none';
        return;
    }
    
    viewport.style.display = 'block';
    const viewportHeight = (containerHeight / scrollHeight) * elements.chatMinimap.clientHeight;
    const viewportTop = (scrollTop / scrollHeight) * elements.chatMinimap.clientHeight;
    
    viewport.style.height = Math.max(20, viewportHeight) + 'px';
    viewport.style.top = viewportTop + 'px';
}

function handleMinimapClick(e) {
    const rect = elements.chatMinimap.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    
    const container = elements.messagesContainer;
    const scrollTop = percentage * (container.scrollHeight - container.clientHeight);
    
    container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    });
}

// Navigation
function scrollToLastAIMessage() {
    const chat = state.chats[state.currentChatId];
    const lastAIMessage = [...chat.messages].reverse().find(msg => msg.type === 'ai');
    
    if (lastAIMessage) {
        const messageElement = elements.messagesContainer.querySelector(`[data-message-id="${lastAIMessage.id}"]`);
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

// Sidebar
function toggleSidebar() {
    elements.sidebarMenu.classList.toggle('active');
    elements.sidebarOverlay.classList.toggle('active');
}

// Reading mode
function toggleReadingMode(enable) {
    if (enable === undefined) {
        state.isReadingMode = !state.isReadingMode;
    } else {
        state.isReadingMode = enable;
    }
    
    document.body.classList.toggle('reading-mode', state.isReadingMode);
    elements.messagesContainer.classList.toggle('full-width', state.isReadingMode);
    
    // Always show theme toggle, minimap, and navigation buttons in reading mode
    if (state.isReadingMode) {
        elements.themeToggleBtn.style.opacity = '1';
        elements.chatMinimap.style.opacity = '1';
        document.querySelector('.minimap-navigation').style.opacity = '1';
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function updateUI() {
    // Update send button state
    elements.sendBtn.disabled = state.isGenerating || (!elements.userInput.value.trim() && state.selectedFiles.length === 0);
    
    // Update model indicator
    document.getElementById('currentModelInfo').textContent = getModelDisplayName(state.currentModel);
    
    // Update footer status
    document.getElementById('footerStatus').textContent = state.isGenerating ? 'Генерация ответа...' : 'Готов к работе';
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="ti ti-x"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

function copyMessage(messageId) {
    const message = state.chats[state.currentChatId].messages.find(m => m.id === messageId);
    if (message) {
        navigator.clipboard.writeText(message.content).then(() => {
            showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(() => {
            showNotification('Не удалось скопировать сообщение', 'error');
        });
    }
}

function copyCode(button) {
    const codeBlock = button.closest('.code-header').nextElementSibling;
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="ti ti-copy"></i> Копировать';
        }, 2000);
    });
}

function regenerateMessage(messageId) {
    const chat = state.chats[state.currentChatId];
    const messageIndex = chat.messages.findIndex(m => m.id === messageId);
    
    if (messageIndex > 0) {
        // Remove the AI message and all messages after it
        const userMessage = chat.messages[messageIndex - 1];
        chat.messages = chat.messages.slice(0, messageIndex - 1);
        
        // Resend the user message
        elements.userInput.value = userMessage.content;
        sendMessage();
    }
}

function downloadChatHistory() {
    const chat = state.chats[state.currentChatId];
    const content = chat.messages.map(msg => {
        const sender = msg.type === 'user' ? 'Вы' : 'KHAI';
        const time = new Date(msg.timestamp).toLocaleString();
        return `[${time}] ${sender}:\n${msg.content}\n\n`;
    }).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('История чата скачана', 'success');
}

function showHelp() {
    const helpMessage = {
        id: generateId(),
        type: 'ai',
        content: `# Справка по KHAI Assistant 🆘

## 📱 Основные функции интерфейса

### Управление чатами
- **Новый чат** - создайте новую беседу в боковом меню
- **История чатов** - переключайтесь между предыдущими беседами
- **Поиск по чату** - находите сообщения в текущей беседе

### Навигация
- **Мини-карта** - быстрая навигация по длинным беседам
- **Кнопки вверх/вниз** - переход к последнему ответу ИИ или в конец чата
- **Режим чтения** - зажмите экран или выделите текст для скрытия интерфейса

### Настройки
- **Смена темы** - переключайте между темной и светлой темой
- **Выбор модели** - меняйте модель ИИ для разных задач
- **Режимы работы** - обычный чат, генерация голоса или изображений

## 🎯 Советы по использованию
- Используйте **код-блоки** для программирования (оборачивайте код в \\`\\`\\`)
- **Прикрепляйте файлы** для анализа документов и изображений
- **Ищите по истории** чтобы найти нужную информацию
- Используйте **режим чтения** для удобного просмотра длинных ответов

Нужна дополнительная помощь? Задайте вопрос в чате!`,
        timestamp: new Date().toISOString(),
        model: state.currentModel
    };
    
    addMessageToCurrentChat(helpMessage);
    scrollToBottom();
}

function handleDocumentClick(e) {
    // Close search dropdown when clicking outside
    if (!e.target.closest('.header-search-container')) {
        elements.searchResultsDropdown.style.display = 'none';
    }
    
    // Close modals when clicking on overlay
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Service Worker registration for PWA (optional)
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
