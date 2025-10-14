// Утилиты для проекта

// Защита от XSS
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Дебаунсинг функций для оптимизации производительности
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

// Троттлинг функций
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

// Оптимизированная прокрутка вниз с использованием requestAnimationFrame
function scrollToBottom(element) {
    if (element) {
        requestAnimationFrame(() => {
            element.scrollTop = element.scrollHeight;
        });
    }
}

// Плавная прокрутка вниз
function smoothScrollToBottom(element) {
    if (element) {
        element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
        });
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
        const content = msg.querySelector('.message-content') ? 
            msg.querySelector('.message-content').textContent : msg.textContent;
        return `${sender}: ${content}`;
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
        text: msg.querySelector('.message-content') ? 
            msg.querySelector('.message-content').textContent : msg.textContent,
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

// Добавление сообщения
function addMessage(messagesContainer, text, isUser = false, isError = false) {
    const messageElement = document.createElement('div');
    const className = isError ? 'error-message' : (isUser ? 'user-message' : 'ai-message');
    messageElement.classList.add('message', className);
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    if (isUser || isError) {
        contentElement.textContent = sanitizeHTML(text);
    } else {
        // Для сообщений ИИ используем Markdown
        contentElement.innerHTML = marked.parse(text);
        
        // Добавляем подсветку синтаксиса для блоков кода
        contentElement.querySelectorAll('pre code').forEach((block) => {
            // Создаем контейнер для блока кода с кнопкой копирования
            const pre = block.closest('pre');
            const language = block.className.replace('language-', '') || 'text';
            
            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            
            const languageSpan = document.createElement('span');
            languageSpan.className = 'code-language';
            languageSpan.textContent = language;
            
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '📋 Копировать';
            
            copyButton.addEventListener('click', () => {
                const codeText = block.textContent;
                navigator.clipboard.writeText(codeText).then(() => {
                    copyButton.innerHTML = '✅ Скопировано!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.innerHTML = '📋 Копировать';
                        copyButton.classList.remove('copied');
                    }, 2000);
                });
            });
            
            codeHeader.appendChild(languageSpan);
            codeHeader.appendChild(copyButton);
            
            pre.insertBefore(codeHeader, block);
            
            // Применяем подсветку синтаксиса
            hljs.highlightElement(block);
        });
    }
    
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

// Модальное окно для изображений
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    const close = document.querySelector('.close');
    
    if (!modal || !modalImg || !caption || !close) return;
    
    // Функция открытия модального окна
    function openModal(src, alt) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modalImg.src = src;
        modalImg.alt = alt || 'Увеличенное изображение';
        caption.textContent = alt || 'Сгенерированное изображение';
        
        // Фокус на кнопку закрытия
        close.focus();
        
        // Блокируем скролл страницы
        document.body.style.overflow = 'hidden';
    }
    
    // Функция закрытия модального окна
    function closeModal() {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Возвращаем фокус на изображение, которое открыло модальное окно
        const focusedImage = document.querySelector('.generated-image:focus');
        if (focusedImage) {
            focusedImage.focus();
        }
    }
    
    // Закрытие модального окна
    close.addEventListener('click', closeModal);
    
    // Закрытие при клике вне изображения
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Обработчики для всех изображений
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('generated-image')) {
            openModal(e.target.src, e.target.alt);
        }
    });
    
    // Поддержка клавиатуры для изображений
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('generated-image') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openModal(e.target.src, e.target.alt);
        }
    });
    
    // Закрытие по ESC и управление фокусом в модальном окне
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'Tab') {
                // Ограничиваем фокус внутри модального окна
                const focusableElements = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
}
