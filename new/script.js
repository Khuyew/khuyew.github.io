// script.js - Основной файл JavaScript для KHAI AI Assistant

// Конфигурация приложения
const CONFIG = {
    MAX_MESSAGE_LENGTH: 4000,
    MAX_CHAT_HISTORY: 50,
    TYPING_DELAY: 1000,
    DEBOUNCE_DELAY: 300
};

// Глобальные переменные
let currentChatId = 'default';
let chats = {};
let currentModel = 'gpt-5-nano';
let isGenerating = false;
let speechSynthesis = null;
let isSpeaking = false;
let currentMode = 'normal';
let attachedFiles = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadChats();
    setupEventListeners();
    setupTheme();
    updateUI();
    showNotification('KHAI Assistant готов к работе!', 'success');
}

// Загрузка и сохранение чатов
function loadChats() {
    const savedChats = localStorage.getItem('khai_chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
    }
    
    if (!chats[currentChatId]) {
        chats[currentChatId] = {
            id: currentChatId,
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString()
        };
    }
    
    updateChatList();
    renderMessages();
}

function saveChats() {
    localStorage.setItem('khai_chats', JSON.stringify(chats));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Отправка сообщения
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('userInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Очистка ввода
    document.getElementById('clearInputBtn').addEventListener('click', clearInput);
    
    // Голосовой ввод
    document.getElementById('voiceInputBtn').addEventListener('click', toggleVoiceInput);
    
    // Прикрепление файлов
    document.getElementById('attachFileBtn').addEventListener('click', triggerFileInput);
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Управление чатами
    document.getElementById('newChatBtn').addEventListener('click', createNewChat);
    document.getElementById('clearChatBtn').addEventListener('click', clearCurrentChat);
    document.getElementById('exportChatBtn').addEventListener('click', exportChat);
    
    // Режимы работы
    document.getElementById('normalModeBtn').addEventListener('click', () => setMode('normal'));
    document.getElementById('generateVoiceBtn').addEventListener('click', () => setMode('voice'));
    document.getElementById('generateImageBtn').addEventListener('click', () => setMode('image'));
    
    // Поиск
    document.getElementById('headerSearch').addEventListener('input', debounce(searchMessages, CONFIG.DEBOUNCE_DELAY));
    document.getElementById('headerSearchClear').addEventListener('click', clearHeaderSearch);
    
    // Навигация
    document.getElementById('scrollToBottom').addEventListener('click', scrollToBottom);
    document.getElementById('scrollToLastAI').addEventListener('click', scrollToLastAI);
    document.getElementById('continueResponseBtn').addEventListener('click', continueResponse);
    
    // Модальные окна
    setupModalEvents();
    
    // Боковое меню
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
    
    // Смена темы
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Выбор модели
    document.getElementById('modelSelectBtn').addEventListener('click', openModelSelectModal);
    
    // Логотип
    document.getElementById('logoBtn').addEventListener('click', function() {
        showNotification('KHAI Assistant v2.4', 'info');
    });
}

// Управление модальными окнами
function setupModalEvents() {
    // Модалка редактирования чата
    document.getElementById('editChatModalCancel').addEventListener('click', closeEditChatModal);
    document.getElementById('editChatModalClose').addEventListener('click', closeEditChatModal);
    document.getElementById('editChatModalSave').addEventListener('click', saveChatName);
    
    // Модалка удаления всех чатов
    document.getElementById('deleteAllChatsBtn').addEventListener('click', openDeleteAllChatsModal);
    document.getElementById('deleteAllChatsModalCancel').addEventListener('click', closeDeleteAllChatsModal);
    document.getElementById('deleteAllChatsModalClose').addEventListener('click', closeDeleteAllChatsModal);
    document.getElementById('deleteAllChatsModalConfirm').addEventListener('click', confirmDeleteAllChats);
    
    // Модалка выбора модели
    document.getElementById('modelSelectModalCancel').addEventListener('click', closeModelSelectModal);
    document.getElementById('modelSelectModalClose').addEventListener('click', closeModelSelectModal);
    
    // Модалка ошибки
    document.getElementById('errorModalClose').addEventListener('click', closeErrorModal);
    document.getElementById('errorModalOk').addEventListener('click', closeErrorModal);
}

// Основные функции чата
function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message && attachedFiles.length === 0) {
        showNotification('Введите сообщение или прикрепите файл', 'warning');
        return;
    }
    
    if (isGenerating) {
        stopGeneration();
        return;
    }
    
    // Добавление сообщения пользователя
    addMessage('user', message, attachedFiles);
    clearInput();
    
    // Имитация ответа AI (в реальном приложении здесь будет API вызов)
    simulateAIResponse(message);
}

function simulateAIResponse(userMessage) {
    isGenerating = true;
    updateSendButton();
    
    // Имитация задержки сети
    setTimeout(() => {
        const responses = [
            "Это интересный вопрос! Давайте разберем его подробнее...",
            "Отличный вопрос! Вот что я могу сказать по этой теме:",
            "Спасибо за вопрос! Вот мой ответ:",
            "Понимаю ваш интерес. Вот что я нашел:",
            "Отличная тема для обсуждения! Вот мои мысли:"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const aiMessage = `${randomResponse}\n\nЭто демонстрационный ответ. В реальном приложении здесь будет ответ от AI модели.`;
        
        addMessage('ai', aiMessage);
        isGenerating = false;
        updateSendButton();
        scrollToBottom();
    }, 2000);
}

function addMessage(type, content, files = []) {
    const chat = chats[currentChatId];
    const message = {
        id: generateId(),
        type: type,
        content: content,
        files: [...files],
        timestamp: new Date().toISOString(),
        model: type === 'ai' ? currentModel : null
    };
    
    chat.messages.push(message);
    
    // Ограничение истории сообщений
    if (chat.messages.length > CONFIG.MAX_CHAT_HISTORY) {
        chat.messages = chat.messages.slice(-CONFIG.MAX_CHAT_HISTORY);
    }
    
    saveChats();
    renderMessages();
    updateMinimap();
    
    return message;
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    const chat = chats[currentChatId];
    
    container.innerHTML = '';
    
    chat.messages.forEach(message => {
        const messageElement = createMessageElement(message);
        container.appendChild(messageElement);
    });
    
    scrollToBottom();
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${message.type}`;
    messageDiv.dataset.messageId = message.id;
    
    let content = message.content;
    
    // Обработка markdown для AI сообщений
    if (message.type === 'ai') {
        try {
            content = marked.parse(content);
        } catch (e) {
            console.error('Markdown parsing error:', e);
        }
    }
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${content}
            ${message.files.length > 0 ? renderAttachedFiles(message.files) : ''}
            ${message.type === 'ai' && message.model ? `<div class="model-indicator">Модель: ${message.model}</div>` : ''}
        </div>
        <div class="message-actions">
            <button class="action-btn-small copy-btn" onclick="copyMessage('${message.id}')" title="Копировать">
                <i class="ti ti-copy"></i>
            </button>
            ${message.type === 'ai' ? `
                <button class="action-btn-small speak-btn" onclick="toggleSpeech('${message.id}')" title="Озвучить">
                    <i class="ti ti-volume"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    // Применение подсветки синтаксиса
    if (message.type === 'ai') {
        setTimeout(() => {
            messageDiv.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }, 0);
    }
    
    return messageDiv;
}

// Управление файлами
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification(`Файл ${file.name} слишком большой (макс. 10MB)`, 'error');
            return;
        }
        
        attachedFiles.push({
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            file: file
        });
    });
    
    updateAttachedFilesDisplay();
    event.target.value = ''; // Сброс input
}

function updateAttachedFilesDisplay() {
    const container = document.getElementById('attachedFiles');
    
    if (attachedFiles.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = attachedFiles.map(file => `
        <div class="attached-file">
            <i class="ti ti-file-text"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <button class="remove-file-btn" onclick="removeAttachedFile('${file.id}')">
                <i class="ti ti-x"></i>
            </button>
        </div>
    `).join('');
}

function removeAttachedFile(fileId) {
    attachedFiles = attachedFiles.filter(file => file.id !== fileId);
    updateAttachedFilesDisplay();
}

// Управление режимами
function setMode(mode) {
    currentMode = mode;
    
    // Обновление кнопок режимов
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${mode}ModeBtn`).classList.add('active');
    
    // Обновление плейсхолдера
    const input = document.getElementById('userInput');
    switch (mode) {
        case 'normal':
            input.placeholder = 'Задайте вопрос...';
            break;
        case 'voice':
            input.placeholder = 'Опишите, что нужно озвучить...';
            break;
        case 'image':
            input.placeholder = 'Опишите изображение для генерации...';
            break;
    }
    
    showNotification(`Режим: ${getModeName(mode)}`, 'info');
}

function getModeName(mode) {
    const names = {
        'normal': 'Обычный',
        'voice': 'Генерация голоса',
        'image': 'Генерация изображений'
    };
    return names[mode] || 'Неизвестный';
}

// Управление интерфейсом
function updateUI() {
    updateSendButton();
    updateFooterStatus();
    updateCurrentChatName();
}

function updateSendButton() {
    const sendBtn = document.getElementById('sendBtn');
    const icon = sendBtn.querySelector('i');
    
    if (isGenerating) {
        sendBtn.classList.add('stop-generation');
        icon.className = 'ti ti-square';
        sendBtn.title = 'Остановить генерацию';
    } else {
        sendBtn.classList.remove('stop-generation');
        icon.className = 'ti ti-send';
        sendBtn.title = 'Отправить сообщение';
    }
}

function updateFooterStatus() {
    const status = document.getElementById('footerStatus');
    if (isGenerating) {
        status.textContent = 'Генерация ответа...';
        status.style.color = 'var(--accent-primary)';
    } else {
        status.textContent = 'Готов к работе';
        status.style.color = '';
    }
}

function updateCurrentChatName() {
    const element = document.getElementById('currentChatName');
    if (chats[currentChatId]) {
        element.textContent = chats[currentChatId].name;
    }
}

// Управление чатами
function createNewChat() {
    const chatId = generateId();
    const chatName = `Новый чат ${Object.keys(chats).length + 1}`;
    
    chats[chatId] = {
        id: chatId,
        name: chatName,
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    switchToChat(chatId);
    closeSidebar();
    showNotification('Создан новый чат', 'success');
}

function switchToChat(chatId) {
    currentChatId = chatId;
    attachedFiles = [];
    updateAttachedFilesDisplay();
    renderMessages();
    updateChatList();
    updateUI();
}

function clearCurrentChat() {
    if (confirm('Вы уверены, что хотите очистить текущий чат?')) {
        chats[currentChatId].messages = [];
        saveChats();
        renderMessages();
        showNotification('Чат очищен', 'success');
    }
}

function exportChat() {
    const chat = chats[currentChatId];
    const data = {
        chat: chat,
        exportedAt: new Date().toISOString(),
        version: 'KHAI Assistant v2.4'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Чат экспортирован', 'success');
}

// Поиск и навигация
function searchMessages() {
    const searchTerm = document.getElementById('headerSearch').value.trim();
    const clearBtn = document.getElementById('headerSearchClear');
    
    if (searchTerm) {
        clearBtn.style.display = 'flex';
        highlightSearchTerms(searchTerm);
    } else {
        clearBtn.style.display = 'none';
        clearSearchHighlights();
    }
}

function highlightSearchTerms(term) {
    const messages = document.querySelectorAll('.message-content');
    const regex = new RegExp(term, 'gi');
    
    messages.forEach(message => {
        const originalContent = message.dataset.originalContent || message.innerHTML;
        message.dataset.originalContent = originalContent;
        
        const highlightedContent = originalContent.replace(regex, match => 
            `<span class="search-highlight">${match}</span>`
        );
        
        message.innerHTML = highlightedContent;
    });
}

function clearSearchHighlights() {
    const messages = document.querySelectorAll('.message-content');
    
    messages.forEach(message => {
        if (message.dataset.originalContent) {
            message.innerHTML = message.dataset.originalContent;
            delete message.dataset.originalContent;
        }
    });
}

function clearHeaderSearch() {
    document.getElementById('headerSearch').value = '';
    document.getElementById('headerSearchClear').style.display = 'none';
    clearSearchHighlights();
}

// Мини-карта и скроллинг
function updateMinimap() {
    const minimapContent = document.getElementById('minimapContent');
    const chat = chats[currentChatId];
    
    minimapContent.innerHTML = '';
    
    chat.messages.forEach((message, index) => {
        const block = document.createElement('div');
        block.className = `minimap-message ${message.type}`;
        block.dataset.index = index;
        block.addEventListener('click', () => scrollToMessage(index));
        minimapContent.appendChild(block);
    });
    
    updateMinimapViewport();
}

function updateMinimapViewport() {
    const container = document.getElementById('messagesContainer');
    const viewport = document.getElementById('minimapViewport');
    const minimap = document.getElementById('chatMinimap');
    
    const containerHeight = container.scrollHeight;
    const visibleHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    
    const viewportHeight = (visibleHeight / containerHeight) * minimap.offsetHeight;
    const viewportTop = (scrollTop / containerHeight) * minimap.offsetHeight;
    
    viewport.style.height = `${viewportHeight}px`;
    viewport.style.top = `${viewportTop}px`;
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function scrollToLastAI() {
    const chat = chats[currentChatId];
    const lastAIMessageIndex = [...chat.messages].reverse().findIndex(msg => msg.type === 'ai');
    
    if (lastAIMessageIndex !== -1) {
        const actualIndex = chat.messages.length - 1 - lastAIMessageIndex;
        scrollToMessage(actualIndex);
    }
}

function scrollToMessage(index) {
    const container = document.getElementById('messagesContainer');
    const messages = container.querySelectorAll('.message');
    
    if (messages[index]) {
        messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Утилиты
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="ti ti-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="ti ti-x"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'circle-check',
        'error': 'alert-circle',
        'warning': 'alert-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Темная/светлая тема
function setupTheme() {
    const savedTheme = localStorage.getItem('khai_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('khai_theme', newTheme);
    
    showNotification(`Тема: ${newTheme === 'dark' ? 'Тёмная' : 'Светлая'}`, 'info');
}

// Боковое меню
function toggleSidebar() {
    document.getElementById('sidebarMenu').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebarMenu').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// Заглушки для будущих функций
function toggleVoiceInput() {
    showNotification('Голосовой ввод скоро будет доступен', 'info');
}

function stopGeneration() {
    isGenerating = false;
    updateUI();
    showNotification('Генерация остановлена', 'warning');
}

function continueResponse() {
    showNotification('Продолжение ответа скоро будет доступно', 'info');
}

function copyMessage(messageId) {
    const message = chats[currentChatId].messages.find(m => m.id === messageId);
    if (message) {
        navigator.clipboard.writeText(message.content).then(() => {
            showNotification('Текст скопирован в буфер обмена', 'success');
        });
    }
}

function toggleSpeech(messageId) {
    showNotification('Озвучка скоро будет доступна', 'info');
}

function clearInput() {
    document.getElementById('userInput').value = '';
    document.getElementById('clearInputBtn').style.display = 'none';
}

// Обработка изменения текста в поле ввода
document.getElementById('userInput').addEventListener('input', function() {
    const clearBtn = document.getElementById('clearInputBtn');
    clearBtn.style.display = this.value ? 'flex' : 'none';
});

// Обновление мини-карты при скролле
document.getElementById('messagesContainer').addEventListener('scroll', updateMinimapViewport);

// Инициализация мини-карты при загрузке
window.addEventListener('load', updateMinimap);
