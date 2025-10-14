// Утилиты для проекта

// Защита от XSS
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Прокрутка вниз
function scrollToBottom(element) {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

// Управление хранилищем чата
function manageChatStorage(messagesContainer, maxMessages = 100) {
    if (!messagesContainer) return;
    const messages = messagesContainer.querySelectorAll('.message');
    if (messages.length > maxMessages) {
        const toRemove = messages.length - maxMessages;
        for (let i = 0; i < toRemove; i++) {
            messages[i].remove();
        }
    }
}

// Повторные попытки при ошибках сети
async function withRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            console.error(`Попытка ${i + 1} не удалась:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Экспорт чата
function exportChat(messagesContainer) {
    const messages = Array.from(messagesContainer.querySelectorAll('.message'));
    const chatText = messages.map(msg => {
        const sender = msg.classList.contains('user-message') ? 'Вы' : 'ИИ';
        return `${sender}: ${msg.textContent}`;
    }).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khuyew-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Сохранение истории чата
function saveChatHistory(messagesContainer) {
    const messages = Array.from(messagesContainer.querySelectorAll('.message')).map(msg => ({
        text: msg.textContent,
        isUser: msg.classList.contains('user-message'),
        isError: msg.classList.contains('error-message'),
        isImage: msg.classList.contains('ai-image-message'),
        timestamp: new Date().toISOString()
    }));
    localStorage.setItem('khuyew-chat-history', JSON.stringify(messages));
}

// Загрузка истории чата
function loadChatHistory(messagesContainer) {
    try {
        const history = localStorage.getItem('khuyew-chat-history');
        if (history) {
            const messages = JSON.parse(history);
            if (messages.length > 0) {
                messages.forEach(msg => {
                    // Восстанавливаем обычные сообщения
                    if (!msg.isImage) {
                        addMessage(messagesContainer, msg.text, msg.isUser, msg.isError);
                    }
                });
                return true;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        localStorage.removeItem('khuyew-chat-history');
    }
    return false;
}

// Добавление сообщения (теперь экспортируем эту функцию)
function addMessage(messagesContainer, text, isUser = false, isError = false) {
    const messageElement = document.createElement('div');
    const className = isError ? 'error-message' : (isUser ? 'user-message' : 'ai-message');
    messageElement.classList.add('message', className);
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.textContent = sanitizeHTML(text);
    
    messageElement.appendChild(contentElement);
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom(messagesContainer);
    saveChatHistory(messagesContainer);
    manageChatStorage(messagesContainer);
    return messageElement;
}

// Анализ запроса
function analyzeRequest(message) {
    const imageKeywords = [
        'нарисуй', 'сгенерируй', 'изображение', 'картинку', 'фото', 'иллюстрацию',
        'draw', 'generate', 'image', 'picture', 'photo', 'illustration',
        'создай', 'покажи', 'визуализируй', 'арт'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    if (imageKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return 'generate';
    } else {
        return 'text';
    }
}

// Управление темой
function initTheme() {
    const savedTheme = localStorage.getItem('khuyew-theme');
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('khuyew-theme', 'light');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('khuyew-theme', 'dark');
        themeToggle.textContent = '🌙';
    }
}

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeHTML,
        scrollToBottom,
        manageChatStorage,
        withRetry,
        exportChat,
        saveChatHistory,
        loadChatHistory,
        addMessage,
        analyzeRequest,
        initTheme,
        toggleTheme
    };
}
