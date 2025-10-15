import Utils from './utils.js';
import AIManager from './ai.js';

class ChatManager {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.logo = document.getElementById('logo');
        
        this.aiManager = new AIManager();
        this.isGenerating = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMessages();
        this.setupAutoResize();
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.logo.addEventListener('click', () => this.clearChat());
        
        // Auto-save when leaving page
        window.addEventListener('beforeunload', () => this.saveMessages());
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
            this.updateSendButton();
        });
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    updateSendButton() {
        const hasText = this.userInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isGenerating;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        const imageData = window.imageManager?.getCurrentImage();

        if (!message && !imageData) {
            Utils.showNotification('Введите сообщение или загрузите изображение', 'error');
            return;
        }

        if (this.isGenerating) {
            Utils.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        try {
            this.isGenerating = true;
            this.updateSendButton();
            
            // Add user message
            this.addMessage('user', message, imageData);
            
            // Clear input and image
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            window.imageManager?.clearImage();
            
            // Show typing indicator
            const typingId = this.showTypingIndicator();
            
            // Get AI response
            const response = await this.aiManager.sendMessage(message, imageData);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add AI response
            if (response.type === 'image') {
                this.addImageMessage(response.prompt, response.imageUrl);
            } else {
                this.addMessage('ai', response.content);
            }
            
            this.saveMessages();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addMessage('error', error.message || 'Произошла ошибка при отправке сообщения');
            Utils.showNotification('Ошибка при отправке сообщения', 'error');
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
        }
    }

    addMessage(role, content, imageData = null) {
        const messageId = Utils.generateId();
        const timestamp = Utils.formatTime();
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        messageElement.id = messageId;
        
        let messageContent = '';
        
        if (role === 'user' && imageData) {
            messageContent += `
                <div class="message-image-preview">
                    <img src="${imageData}" alt="Загруженное изображение" class="uploaded-image">
                </div>
            `;
        }
        
        if (content) {
            messageContent += `
                <div class="message-content">
                    ${role === 'ai' || role === 'error' ? this.formatMarkdown(content) : Utils.escapeHtml(content)}
                </div>
            `;
        }
        
        messageElement.innerHTML = messageContent;
        
        // Add timestamp
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = timestamp;
        timeElement.style.cssText = `
            font-size: 11px;
            color: var(--text-tertiary);
            margin-top: 8px;
            text-align: ${role === 'user' ? 'right' : 'left'};
        `;
        messageElement.appendChild(timeElement);
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Highlight code blocks
        if (role === 'ai') {
            setTimeout(() => this.highlightCodeBlocks(messageElement), 100);
        }
        
        return messageId;
    }

    addImageMessage(prompt, imageUrl) {
        const messageId = Utils.generateId();
        const timestamp = Utils.formatTime();
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-image';
        messageElement.id = messageId;
        
        messageElement.innerHTML = `
            <div class="message-content">
                <strong>Сгенерировано изображение:</strong>
                <div class="image-prompt">${Utils.escapeHtml(prompt)}</div>
            </div>
            <img src="${imageUrl}" alt="Сгенерированное изображение" class="generated-image" 
                 onclick="window.imageManager?.openModal('${imageUrl}', '${Utils.escapeHtml(prompt)}')">
            <div class="message-time" style="font-size: 11px; color: var(--text-tertiary); margin-top: 8px;">
                ${timestamp}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageId;
    }

    showTypingIndicator() {
        const typingId = Utils.generateId();
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = typingId;
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingId;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) {
                element.remove();
            }
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
        }
    }

    formatMarkdown(content) {
        try {
            // Process code blocks first
            let processedContent = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'text';
                const escapedCode = Utils.escapeHtml(code.trim());
                return `<div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-btn" onclick="window.chatManager.copyCode(this)">
                            <i class="ti ti-copy"></i>
                            Копировать
                        </button>
                    </div>
                    <pre><code class="language-${language}">${escapedCode}</code></pre>
                </div>`;
            });

            // Process inline code
            processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');

            // Process other markdown elements
            processedContent = processedContent
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;">')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');

            return `<p>${processedContent}</p>`;
        } catch (error) {
            console.error('Error formatting markdown:', error);
            return `<p>${Utils.escapeHtml(content)}</p>`;
        }
    }

    async copyCode(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        try {
            await Utils.copyToClipboard(code);
            button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                button.classList.remove('copied');
            }, 2000);
        } catch (error) {
            Utils.showNotification('Ошибка при копировании', 'error');
        }
    }

    highlightCodeBlocks(messageElement) {
        const codeBlocks = messageElement.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (window.hljs) {
                window.hljs.highlightElement(block);
            }
        });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    saveMessages() {
        const messages = [];
        const messageElements = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator)');
        
        messageElements.forEach(element => {
            const role = element.classList.contains('message-user') ? 'user' : 
                        element.classList.contains('message-error') ? 'error' : 'ai';
            
            const contentElement = element.querySelector('.message-content');
            const imageElement = element.querySelector('.generated-image, .uploaded-image');
            
            let content = '';
            let imageUrl = '';
            let prompt = '';
            
            if (contentElement) {
                content = contentElement.textContent.trim();
            }
            
            if (imageElement) {
                imageUrl = imageElement.src;
                if (element.classList.contains('message-image')) {
                    const promptElement = element.querySelector('.image-prompt');
                    if (promptElement) {
                        prompt = promptElement.textContent.trim();
                    }
                }
            }
            
            if (content || imageUrl) {
                messages.push({
                    role,
                    content,
                    imageUrl,
                    prompt,
                    timestamp: element.querySelector('.message-time')?.textContent || Utils.formatTime()
                });
            }
        });
        
        localStorage.setItem('khuyew-ai-messages', JSON.stringify(messages));
    }

    loadMessages() {
        try {
            const saved = localStorage.getItem('khuyew-ai-messages');
            if (saved) {
                const messages = JSON.parse(saved);
                messages.forEach(msg => {
                    if (msg.role === 'user') {
                        this.addMessage('user', msg.content, msg.imageUrl || null);
                    } else if (msg.imageUrl && msg.prompt) {
                        this.addImageMessage(msg.prompt, msg.imageUrl);
                    } else {
                        this.addMessage(msg.role, msg.content);
                    }
                });
                this.scrollToBottom();
            } else {
                // Add welcome message
                this.addMessage('ai', `Привет! Я Khuyew AI - ваш бесплатный ИИ-помощник. Я могу:

• Отвечать на вопросы и помогать с задачами
• Анализировать загруженные изображения
• Генерировать новые изображения по описанию
• Поддерживать голосовой ввод

Просто напишите сообщение, загрузите изображение или нажмите на кнопку микрофона для голосового ввода!`);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            localStorage.removeItem('khuyew-ai-messages');
        }
    }

    clearChat() {
        if (this.messagesContainer.children.length > 0 && 
            !this.isGenerating && 
            confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            
            this.messagesContainer.innerHTML = '';
            localStorage.removeItem('khuyew-ai-messages');
            
            // Add welcome message
            setTimeout(() => {
                this.addMessage('ai', `Чат очищен! Чем могу помочь?`);
            }, 300);
            
            Utils.showNotification('Чат очищен', 'success');
        }
    }
}

export default ChatManager;
