// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const attachFileBtn = document.getElementById('attachFileBtn');
const fileInput = document.getElementById('fileInput');
const attachedFiles = document.getElementById('attachedFiles');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarClose = document.getElementById('sidebarClose');
const chatList = document.getElementById('chatList');
const newChatBtn = document.getElementById('newChatBtn');
const deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
const editChatModal = document.getElementById('editChatModal');
const editChatNameInput = document.getElementById('editChatNameInput');
const editChatModalClose = document.getElementById('editChatModalClose');
const editChatModalCancel = document.getElementById('editChatModalCancel');
const editChatModalSave = document.getElementById('editChatModalSave');
const deleteAllChatsModal = document.getElementById('deleteAllChatsModal');
const deleteAllChatsModalClose = document.getElementById('deleteAllChatsModalClose');
const deleteAllChatsModalCancel = document.getElementById('deleteAllChatsModalCancel');
const deleteAllChatsModalConfirm = document.getElementById('deleteAllChatsModalConfirm');
const modelSelect = document.getElementById('modelSelect');
const helpBtn = document.getElementById('helpBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const generateImageBtn = document.getElementById('generateImageBtn');
const generateVoiceBtn = document.getElementById('generateVoiceBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const headerSearch = document.getElementById('headerSearch');
const headerSearchClear = document.getElementById('headerSearchClear');
const sidebarSearch = document.getElementById('sidebarSearch');
const sidebarSearchClear = document.getElementById('sidebarSearchClear');
const chatMinimap = document.getElementById('chatMinimap');
const minimapContent = document.getElementById('minimapContent');
const minimapViewport = document.getElementById('minimapViewport');
const scrollToLastAI = document.getElementById('scrollToLastAI');
const scrollToBottom = document.getElementById('scrollToBottom');
const modalClearInput = document.getElementById('modalClearInput');
const currentChatName = document.getElementById('currentChatName');

// State variables
let currentChatId = 'default';
let chats = {};
let currentMode = 'normal'; // 'normal', 'voice', 'image'
let isRecording = false;
let recognition = null;
let attachedFilesData = [];
let isGenerating = false;
let currentEditingChatId = null;
let searchTerm = '';
let sidebarSearchTerm = '';

// Initialize the app
function init() {
    loadChats();
    loadTheme();
    setupEventListeners();
    setupModeButtons();
    setupSearch();
    setupMinimap();
    updateChatList();
    updateCurrentChatName();
    
    // Initialize Puter AI SDK
    window.publisher = 'puter';
    
    // Show welcome message if it's a new chat
    if (!chats[currentChatId] || chats[currentChatId].messages.length === 0) {
        showWelcomeMessage();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Input and send
    userInput.addEventListener('input', handleInputChange);
    userInput.addEventListener('keydown', handleKeyDown);
    sendBtn.addEventListener('click', sendMessage);
    clearInputBtn.addEventListener('click', clearInput);
    
    // Voice input
    voiceInputBtn.addEventListener('click', toggleVoiceInput);
    
    // File attachment
    attachFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar
    menuToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Chat management
    newChatBtn.addEventListener('click', createNewChat);
    deleteAllChatsBtn.addEventListener('click', showDeleteAllChatsModal);
    
    // Modal events
    editChatModalClose.addEventListener('click', closeEditChatModal);
    editChatModalCancel.addEventListener('click', closeEditChatModal);
    editChatModalSave.addEventListener('click', saveChatName);
    editChatNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveChatName();
    });
    
    deleteAllChatsModalClose.addEventListener('click', closeDeleteAllChatsModal);
    deleteAllChatsModalCancel.addEventListener('click', closeDeleteAllChatsModal);
    deleteAllChatsModalConfirm.addEventListener('click', deleteAllChats);
    
    // Model selection
    modelSelect.addEventListener('change', handleModelChange);
    
    // Action buttons
    helpBtn.addEventListener('click', showHelp);
    clearChatBtn.addEventListener('click', clearCurrentChat);
    
    // Modal clear input
    modalClearInput.addEventListener('click', () => {
        editChatNameInput.value = '';
        modalClearInput.style.display = 'none';
    });
    
    editChatNameInput.addEventListener('input', () => {
        modalClearInput.style.display = editChatNameInput.value ? 'flex' : 'none';
    });
    
    // Navigation buttons
    scrollToLastAI.addEventListener('click', scrollToLastAIMessage);
    scrollToBottom.addEventListener('click', scrollToBottomOfChat);
    
    // Handle window resize
    window.addEventListener('resize', updateMinimap);
    
    // Handle messages container scroll
    messagesContainer.addEventListener('scroll', updateMinimapViewport);
}

// Setup mode buttons
function setupModeButtons() {
    normalModeBtn.addEventListener('click', () => setMode('normal'));
    generateVoiceBtn.addEventListener('click', () => setMode('voice'));
    generateImageBtn.addEventListener('click', () => setMode('image'));
    
    // Set initial mode
    setMode('normal');
}

// Set current mode
function setMode(mode) {
    currentMode = mode;
    
    // Update button states
    normalModeBtn.classList.toggle('active', mode === 'normal');
    generateVoiceBtn.classList.toggle('active', mode === 'voice');
    generateImageBtn.classList.toggle('active', mode === 'image');
    
    // Update input placeholder based on mode
    switch (mode) {
        case 'normal':
            userInput.placeholder = 'Задайте вопрос...';
            break;
        case 'voice':
            userInput.placeholder = 'Опишите, что нужно озвучить...';
            break;
        case 'image':
            userInput.placeholder = 'Опишите изображение для генерации...';
            break;
    }
    
    // Update UI based on mode
    updateUIForMode();
}

// Update UI based on current mode
function updateUIForMode() {
    // For now, we just update the placeholder text
    // In a real implementation, you might show/hide different UI elements
}

// Setup search functionality
function setupSearch() {
    // Header search (search within current chat)
    headerSearch.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        headerSearchClear.style.display = searchTerm ? 'flex' : 'none';
        highlightSearchTerms();
    });
    
    headerSearchClear.addEventListener('click', () => {
        headerSearch.value = '';
        searchTerm = '';
        headerSearchClear.style.display = 'none';
        clearSearchHighlights();
    });
    
    // Sidebar search (search chat titles and content)
    sidebarSearch.addEventListener('input', (e) => {
        sidebarSearchTerm = e.target.value.toLowerCase();
        sidebarSearchClear.style.display = sidebarSearchTerm ? 'flex' : 'none';
        updateChatList();
    });
    
    sidebarSearchClear.addEventListener('click', () => {
        sidebarSearch.value = '';
        sidebarSearchTerm = '';
        sidebarSearchClear.style.display = 'none';
        updateChatList();
    });
}

// Setup minimap
function setupMinimap() {
    // Create minimap content based on messages
    updateMinimap();
    
    // Handle minimap click to scroll to position
    chatMinimap.addEventListener('click', (e) => {
        const rect = chatMinimap.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const percentage = clickY / rect.height;
        
        const scrollHeight = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        messagesContainer.scrollTop = percentage * scrollHeight;
    });
}

// Update minimap based on messages
function updateMinimap() {
    if (!minimapContent) return;
    
    minimapContent.innerHTML = '';
    const messages = chats[currentChatId]?.messages || [];
    
    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `minimap-message ${msg.role}`;
        
        // Calculate height based on message content length
        const contentLength = msg.content?.length || 0;
        const height = Math.max(2, Math.min(10, contentLength / 50));
        messageEl.style.height = `${height}px`;
        
        minimapContent.appendChild(messageEl);
    });
    
    updateMinimapViewport();
}

// Update minimap viewport position
function updateMinimapViewport() {
    if (!minimapViewport || !messagesContainer) return;
    
    const scrollTop = messagesContainer.scrollTop;
    const scrollHeight = messagesContainer.scrollHeight;
    const clientHeight = messagesContainer.clientHeight;
    
    if (scrollHeight <= clientHeight) {
        minimapViewport.style.display = 'none';
        return;
    }
    
    minimapViewport.style.display = 'block';
    
    const minimapHeight = chatMinimap.clientHeight;
    const viewportHeight = (clientHeight / scrollHeight) * minimapHeight;
    const viewportTop = (scrollTop / scrollHeight) * minimapHeight;
    
    minimapViewport.style.height = `${viewportHeight}px`;
    minimapViewport.style.top = `${viewportTop}px`;
}

// Highlight search terms in messages
function highlightSearchTerms() {
    if (!searchTerm) {
        clearSearchHighlights();
        return;
    }
    
    const messages = document.querySelectorAll('.message-content');
    messages.forEach(messageEl => {
        const content = messageEl.textContent || messageEl.innerText;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlighted = content.replace(regex, '<mark class="search-highlight">$1</mark>');
        
        // Only update if there are changes to avoid unnecessary DOM updates
        if (messageEl.innerHTML !== highlighted) {
            messageEl.innerHTML = highlighted;
        }
    });
}

// Clear search highlights
function clearSearchHighlights() {
    const messages = document.querySelectorAll('.message-content');
    messages.forEach(messageEl => {
        const content = messageEl.textContent || messageEl.innerText;
        messageEl.innerHTML = content;
    });
}

// Scroll to last AI message
function scrollToLastAIMessage() {
    const aiMessages = document.querySelectorAll('.message-ai');
    if (aiMessages.length > 0) {
        const lastAIMessage = aiMessages[aiMessages.length - 1];
        lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Scroll to bottom of chat
function scrollToBottomOfChat() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle input change
function handleInputChange() {
    // Auto-resize textarea
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    
    // Update send button state
    const hasText = userInput.value.trim().length > 0;
    sendBtn.disabled = !hasText && attachedFilesData.length === 0;
    
    // Show/hide clear button
    clearInputBtn.style.display = hasText ? 'flex' : 'none';
}

// Handle key down events
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Send message
function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message && attachedFilesData.length === 0) return;
    
    // Add user message
    addMessage('user', message, attachedFilesData);
    
    // Clear input and attached files
    clearInput();
    clearAttachedFiles();
    
    // Generate AI response
    generateAIResponse(message);
}

// Add message to chat
function addMessage(role, content, files = []) {
    if (!chats[currentChatId]) {
        chats[currentChatId] = {
            id: currentChatId,
            name: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    
    const message = {
        role,
        content,
        files: [...files],
        timestamp: new Date().toISOString(),
        model: role === 'ai' ? modelSelect.value : null
    };
    
    chats[currentChatId].messages.push(message);
    chats[currentChatId].updatedAt = new Date().toISOString();
    
    // Update chat list if this is a new chat
    if (chats[currentChatId].messages.length === 1) {
        updateChatList();
    }
    
    // Render message
    renderMessage(message);
    
    // Save chats
    saveChats();
    
    // Update minimap
    updateMinimap();
}

// Render message in UI
function renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${message.role}`;
    
    let contentHTML = '';
    
    // Add files if present
    if (message.files && message.files.length > 0) {
        message.files.forEach(file => {
            if (file.type.startsWith('image/')) {
                contentHTML += `
                    <div class="message-image">
                        <img src="${file.url}" alt="${file.name}">
                    </div>
                `;
            } else {
                contentHTML += `
                    <div class="attached-file">
                        <i class="ti ti-file-text"></i>
                        <span>${file.name}</span>
                        <button class="download-file-btn" onclick="downloadFile('${file.name}', '${file.url}')">
                            <i class="ti ti-download"></i>
                        </button>
                    </div>
                `;
            }
        });
    }
    
    // Add message content
    if (message.content) {
        if (message.role === 'ai') {
            // Use marked to parse markdown for AI messages
            contentHTML += `
                <div class="message-content">
                    ${marked.parse(message.content)}
                </div>
                ${message.model ? `<div class="model-indicator">Сгенерировано с помощью: ${getModelDisplayName(message.model)}</div>` : ''}
            `;
        } else {
            // For user messages, just display the text (no markdown)
            contentHTML += `
                <div class="message-content">
                    ${escapeHtml(message.content)}
                </div>
            `;
        }
    }
    
    // Add message actions for AI messages
    if (message.role === 'ai' && message.content) {
        contentHTML += `
            <div class="message-actions">
                <button class="action-btn-small copy-btn" onclick="copyToClipboard(this, '${escapeHtml(message.content).replace(/'/g, "\\'")}')">
                    <i class="ti ti-copy"></i>
                    <span>Копировать</span>
                </button>
                <button class="action-btn-small speak-btn" onclick="speakText(this, '${escapeHtml(message.content).replace(/'/g, "\\'")}')">
                    <i class="ti ti-volume"></i>
                    <span>Озвучить</span>
                </button>
            </div>
        `;
    }
    
    messageEl.innerHTML = contentHTML;
    
    // Apply syntax highlighting to code blocks
    if (message.role === 'ai') {
        setTimeout(() => {
            messageEl.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
                
                // Add copy button to code blocks
                const pre = block.closest('pre');
                if (pre && !pre.querySelector('.code-header')) {
                    const codeHeader = document.createElement('div');
                    codeHeader.className = 'code-header';
                    
                    const language = block.className.replace('language-', '') || 'code';
                    codeHeader.innerHTML = `
                        <span class="code-language">${language}</span>
                        <button class="copy-code-btn" onclick="copyCodeToClipboard(this, '${escapeHtml(block.textContent).replace(/'/g, "\\'")}')">
                            <i class="ti ti-copy"></i>
                            <span>Копировать</span>
                        </button>
                    `;
                    
                    pre.insertBefore(codeHeader, pre.firstChild);
                }
            });
        }, 0);
    }
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Generate AI response
async function generateAIResponse(userMessage) {
    if (isGenerating) return;
    
    isGenerating = true;
    
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
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        let response;
        
        // Handle different modes
        switch (currentMode) {
            case 'normal':
                response = await generateTextResponse(userMessage);
                break;
            case 'voice':
                response = await generateVoiceResponse(userMessage);
                break;
            case 'image':
                response = await generateImageResponse(userMessage);
                break;
            default:
                response = await generateTextResponse(userMessage);
        }
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response to chat
        addMessage('ai', response);
        
    } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Show error message
        addMessage('ai', `Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.`);
    } finally {
        isGenerating = false;
    }
}

// Generate text response using Puter AI
async function generateTextResponse(message) {
    const chatHistory = chats[currentChatId].messages
        .filter(msg => msg.role === 'user' || msg.role === 'ai')
        .map(msg => ({ role: msg.role, content: msg.content }))
        .slice(-10); // Keep last 10 messages for context
    
    const messages = [
        ...chatHistory,
        { role: 'user', content: message }
    ];
    
    const response = await ai.chat.completions.create({
        messages: messages,
        model: modelSelect.value,
        stream: false
    });
    
    return response.choices[0].message.content;
}

// Generate voice response (placeholder)
async function generateVoiceResponse(message) {
    // This is a placeholder - in a real implementation, you would use a TTS service
    return `Режим генерации голоса: "${message}". В настоящей реализации здесь будет сгенерирован аудиофайл с озвучкой вашего текста.`;
}

// Generate image response (placeholder)
async function generateImageResponse(message) {
    // This is a placeholder - in a real implementation, you would use an image generation service
    return `Режим генерации изображений: "${message}". В настоящей реализации здесь будет сгенерировано изображение на основе вашего описания.`;
}

// Clear input
function clearInput() {
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;
    clearInputBtn.style.display = 'none';
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: e.target.result
            };
            
            attachedFilesData.push(fileData);
            renderAttachedFile(fileData);
        };
        
        reader.readAsDataURL(file);
    });
    
    // Reset file input
    fileInput.value = '';
}

// Render attached file in UI
function renderAttachedFile(fileData) {
    const fileEl = document.createElement('div');
    fileEl.className = 'attached-file';
    
    if (fileData.type.startsWith('image/')) {
        fileEl.innerHTML = `
            <img src="${fileData.url}" alt="${fileData.name}">
            <span>${fileData.name}</span>
            <button class="remove-file-btn" onclick="removeAttachedFile('${fileData.name}')">
                <i class="ti ti-x"></i>
            </button>
        `;
    } else {
        fileEl.innerHTML = `
            <i class="ti ti-file-text"></i>
            <span>${fileData.name}</span>
            <button class="remove-file-btn" onclick="removeAttachedFile('${fileData.name}')">
                <i class="ti ti-x"></i>
            </button>
        `;
    }
    
    attachedFiles.appendChild(fileEl);
    
    // Update send button state
    sendBtn.disabled = userInput.value.trim().length === 0 && attachedFilesData.length === 0;
}

// Remove attached file
function removeAttachedFile(fileName) {
    attachedFilesData = attachedFilesData.filter(file => file.name !== fileName);
    
    // Re-render attached files
    attachedFiles.innerHTML = '';
    attachedFilesData.forEach(renderAttachedFile);
    
    // Update send button state
    sendBtn.disabled = userInput.value.trim().length === 0 && attachedFilesData.length === 0;
}

// Clear all attached files
function clearAttachedFiles() {
    attachedFilesData = [];
    attachedFiles.innerHTML = '';
}

// Toggle voice input
function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Ваш браузер не поддерживает распознавание речи. Пожалуйста, используйте Chrome или Edge.');
        return;
    }
    
    if (isRecording) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

// Start voice input
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ru-RU';
    
    recognition.onstart = () => {
        isRecording = true;
        voiceInputBtn.innerHTML = '<i class="ti ti-square"></i>';
        voiceInputBtn.style.background = 'var(--error-bg)';
        voiceInputBtn.style.color = 'var(--error-text)';
        voiceInputBtn.style.borderColor = 'var(--error-text)';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleInputChange();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
    };
    
    recognition.onend = () => {
        stopVoiceInput();
    };
    
    recognition.start();
}

// Stop voice input
function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }
    
    isRecording = false;
    voiceInputBtn.innerHTML = '<i class="ti ti-microphone"></i>';
    voiceInputBtn.style.background = '';
    voiceInputBtn.style.color = '';
    voiceInputBtn.style.borderColor = '';
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle button icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
}

// Load theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle button icon
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
}

// Open sidebar
function openSidebar() {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close sidebar
function closeSidebar() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Create new chat
function createNewChat() {
    const newChatId = 'chat_' + Date.now();
    currentChatId = newChatId;
    
    chats[newChatId] = {
        id: newChatId,
        name: 'Новый чат',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Show welcome message
    showWelcomeMessage();
    
    // Update UI
    updateChatList();
    updateCurrentChatName();
    
    // Save chats
    saveChats();
    
    // Close sidebar
    closeSidebar();
}

// Update chat list in sidebar
function updateChatList() {
    chatList.innerHTML = '';
    
    const chatItems = Object.values(chats)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .filter(chat => {
            if (!sidebarSearchTerm) return true;
            
            const searchLower = sidebarSearchTerm.toLowerCase();
            return chat.name.toLowerCase().includes(searchLower) ||
                   chat.messages.some(msg => 
                       msg.content && msg.content.toLowerCase().includes(searchLower)
                   );
        });
    
    if (chatItems.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="ti ti-message-off"></i>
            <p>Чаты не найдены</p>
        `;
        chatList.appendChild(emptyState);
        return;
    }
    
    chatItems.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? 
            (lastMessage.content ? lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '') : 'Файл') : 
            'Нет сообщений';
        
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-title">${escapeHtml(chat.name)}</div>
                <div class="chat-item-preview">${escapeHtml(preview)}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-item-action edit" onclick="editChatName('${chat.id}')">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="chat-item-action delete" onclick="deleteChat('${chat.id}')">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        `;
        
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-actions')) {
                switchToChat(chat.id);
            }
        });
        
        chatList.appendChild(chatItem);
    });
}

// Switch to chat
function switchToChat(chatId) {
    if (chatId === currentChatId) {
        closeSidebar();
        return;
    }
    
    currentChatId = chatId;
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Render messages for this chat
    if (chats[chatId] && chats[chatId].messages.length > 0) {
        chats[chatId].messages.forEach(renderMessage);
    } else {
        showWelcomeMessage();
    }
    
    // Update UI
    updateCurrentChatName();
    updateMinimap();
    
    // Close sidebar
    closeSidebar();
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update current chat name display
function updateCurrentChatName() {
    const chat = chats[currentChatId];
    if (chat) {
        currentChatName.textContent = chat.name;
    } else {
        currentChatName.textContent = 'Основной чат';
    }
}

// Edit chat name
function editChatName(chatId) {
    currentEditingChatId = chatId;
    const chat = chats[chatId];
    
    editChatNameInput.value = chat.name;
    modalClearInput.style.display = chat.name ? 'flex' : 'none';
    
    editChatModal.classList.add('active');
}

// Close edit chat modal
function closeEditChatModal() {
    editChatModal.classList.remove('active');
    currentEditingChatId = null;
}

// Save chat name
function saveChatName() {
    if (!currentEditingChatId) return;
    
    const newName = editChatNameInput.value.trim() || 'Новый чат';
    chats[currentEditingChatId].name = newName;
    chats[currentEditingChatId].updatedAt = new Date().toISOString();
    
    // Update UI
    updateChatList();
    updateCurrentChatName();
    
    // Save chats
    saveChats();
    
    // Close modal
    closeEditChatModal();
}

// Delete chat
function deleteChat(chatId) {
    if (Object.keys(chats).length <= 1) {
        alert('Нельзя удалить последний чат');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
        delete chats[chatId];
        
        // If we're deleting the current chat, switch to another one
        if (chatId === currentChatId) {
            const remainingChatIds = Object.keys(chats);
            if (remainingChatIds.length > 0) {
                switchToChat(remainingChatIds[0]);
            } else {
                createNewChat();
            }
        }
        
        // Update UI
        updateChatList();
        
        // Save chats
        saveChats();
    }
}

// Show delete all chats modal
function showDeleteAllChatsModal() {
    deleteAllChatsModal.classList.add('active');
}

// Close delete all chats modal
function closeDeleteAllChatsModal() {
    deleteAllChatsModal.classList.remove('active');
}

// Delete all chats
function deleteAllChats() {
    // Keep only the current chat
    const currentChat = chats[currentChatId];
    chats = { [currentChatId]: currentChat };
    
    // Clear messages and show welcome
    messagesContainer.innerHTML = '';
    showWelcomeMessage();
    
    // Update UI
    updateChatList();
    updateCurrentChatName();
    
    // Save chats
    saveChats();
    
    // Close modal
    closeDeleteAllChatsModal();
}

// Handle model change
function handleModelChange() {
    // In a real implementation, you might want to save the model preference
    console.log('Model changed to:', modelSelect.value);
}

// Show help
function showHelp() {
    const helpMessage = `
# Помощь по KHAI Assistant

## Основные возможности:
- **Бесплатное использование** - никаких скрытых платежей
- **Мультимодальность** - работа с текстом, изображениями и голосом
- **Разные модели ИИ** - выбор подходящей модели для ваших задач
- **Локальное хранение** - ваши данные остаются на вашем устройстве

## Режимы работы:
1. **Обычный режим** - текстовые ответы на вопросы
2. **Генерация голоса** - создание аудио из текста
3. **Генерация изображений** - создание картинок по описанию

## Советы:
- Используйте точные и конкретные запросы для лучших результатов
- Прикрепляйте файлы для контекста (изображения, документы)
- Меняйте модели ИИ в зависимости от типа задачи

## Горячие клавиши:
- Enter - отправить сообщение
- Shift+Enter - новая строка
- Ctrl+/ - открыть справку

[Подробная документация](https://docs.khai.example.com)
    `;
    
    addMessage('ai', helpMessage);
}

// Clear current chat
function clearCurrentChat() {
    if (confirm('Вы уверены, что хотите очистить текущий чат? Все сообщения будут удалены.')) {
        if (chats[currentChatId]) {
            chats[currentChatId].messages = [];
        }
        
        messagesContainer.innerHTML = '';
        showWelcomeMessage();
        
        // Save chats
        saveChats();
        
        // Update minimap
        updateMinimap();
    }
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeMessage = `
# Добро пожаловать в KHAI Assistant! 👋

Я ваш бесплатный ИИ-помощник с поддержкой мультимодальных возможностей.

## Что я умею:
- Отвечать на вопросы и помогать с задачами
- Генерировать текст, код, идеи и решения
- Работать с изображениями и документами
- Озвучивать текст (в режиме генерации голоса)
- Создавать изображения по описанию (скоро)

## Как использовать:
1. Выберите режим работы (обычный, голос, изображения)
2. Введите ваш запрос в поле ниже
3. Нажмите Отправить или Enter

## Доступные модели:
- **GPT-5 Nano** - быстрые и точные ответы
- **O3 Mini** - улучшенное понимание контекста
- **DeepSeek Chat** - специализирован для диалогов
- **Gemini 2.0 Flash** - мультимодальные возможности

Не стесняйтесь задавать вопросы! Я здесь, чтобы помочь. 😊
    `;
    
    addMessage('ai', welcomeMessage);
}

// Load chats from localStorage
function loadChats() {
    const savedChats = localStorage.getItem('khai_chats');
    
    if (savedChats) {
        chats = JSON.parse(savedChats);
    } else {
        // Create default chat
        chats = {
            default: {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        currentChatId = 'default';
    }
    
    // Render current chat messages
    if (chats[currentChatId] && chats[currentChatId].messages.length > 0) {
        chats[currentChatId].messages.forEach(renderMessage);
    }
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('khai_chats', JSON.stringify(chats));
}

// Utility functions

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get model display name
function getModelDisplayName(modelId) {
    const modelNames = {
        'gpt-5-nano': 'GPT-5 Nano',
        'o3-mini': 'O3 Mini',
        'claude-sonnet': 'Claude Sonnet',
        'deepseek-chat': 'DeepSeek Chat',
        'deepseek-reasoner': 'DeepSeek Reasoner',
        'gemini-2.0-flash': 'Gemini 2.0 Flash',
        'gemini-1.5-flash': 'Gemini 1.5 Flash',
        'grok-beta': 'xAI Grok'
    };
    
    return modelNames[modelId] || modelId;
}

// Copy text to clipboard
function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="ti ti-check"></i><span>Скопировано</span>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Не удалось скопировать текст');
    });
}

// Copy code to clipboard
function copyCodeToClipboard(button, code) {
    navigator.clipboard.writeText(code).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="ti ti-check"></i><span>Скопировано</span>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        alert('Не удалось скопировать код');
    });
}

// Speak text
function speakText(button, text) {
    if ('speechSynthesis' in window) {
        if (button.classList.contains('speaking')) {
            // Stop speaking
            speechSynthesis.cancel();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-volume"></i><span>Озвучить</span>';
        } else {
            // Start speaking
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
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
                alert('Произошла ошибка при озвучивании текста');
            };
            
            speechSynthesis.speak(utterance);
        }
    } else {
        alert('Ваш браузер не поддерживает синтез речи');
    }
}

// Download file
function downloadFile(filename, url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
