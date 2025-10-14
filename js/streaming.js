// Стриминг ответов ИИ
class AIStreaming {
    constructor(messagesContainer) {
        this.messagesContainer = messagesContainer;
        this.currentStream = null;
    }

    // Стриминг текстового ответа
    async streamTextResponse(prompt) {
        // Отменяем предыдущий стрим, если он есть
        if (this.currentStream) {
            this.currentStream.cancel?.();
        }

        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai-message', 'ai-streaming');
        this.messagesContainer.appendChild(aiMessageElement);
        
        scrollToBottom(this.messagesContainer);

        try {
            const response = await puter.ai.chat(prompt, { 
                model: "gpt-5-nano", 
                stream: true 
            });
            
            this.currentStream = response;
            let fullText = '';
            
            for await (const part of response) {
                if (part?.text) {
                    fullText += part.text;
                    aiMessageElement.innerHTML = sanitizeHTML(fullText) + '<span class="typing-cursor"></span>';
                    scrollToBottom(this.messagesContainer);
                    
                    // Сохраняем прогресс в историю
                    this.saveStreamingProgress(fullText);
                }
            }
            
            // Убираем курсор после завершения
            aiMessageElement.innerHTML = sanitizeHTML(fullText);
            aiMessageElement.classList.remove('ai-streaming');
            this.currentStream = null;
            
            // Сохраняем финальную версию
            saveChatHistory(this.messagesContainer);
            
        } catch (error) {
            console.error('Ошибка стриминга:', error);
            aiMessageElement.remove();
            this.currentStream = null;
            
            // Показываем сообщение об ошибке
            const errorElement = addMessage(this.messagesContainer, 
                "Извините, произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз.", 
                false, true);
                
            throw error;
        }
        
        return aiMessageElement;
    }

    // Сохранение прогресса стриминга
    saveStreamingProgress(text) {
        try {
            const messages = Array.from(this.messagesContainer.querySelectorAll('.message'));
            const lastAiMessage = messages.reverse().find(msg => 
                msg.classList.contains('ai-message') && 
                msg.classList.contains('ai-streaming')
            );
            
            if (lastAiMessage) {
                const tempMessages = messages.filter(msg => msg !== lastAiMessage);
                const chatData = tempMessages.map(msg => ({
                    text: msg.textContent,
                    isUser: msg.classList.contains('user-message'),
                    isError: msg.classList.contains('error-message'),
                    isImage: msg.classList.contains('ai-image-message'),
                    timestamp: new Date().toISOString()
                }));
                
                // Добавляем текущий прогресс
                chatData.push({
                    text: text,
                    isUser: false,
                    isError: false,
                    isImage: false,
                    timestamp: new Date().toISOString(),
                    isStreaming: true
                });
                
                localStorage.setItem('khuyew-chat-history', JSON.stringify(chatData));
            }
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
        }
    }

    // Генерация изображения
    async generateImage(prompt) {
        try {
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('message', 'ai-message');
            loadingElement.innerHTML = '<span class="image-loading"></span>Генерирую изображение...';
            this.messagesContainer.appendChild(loadingElement);
            scrollToBottom(this.messagesContainer);
            
            const image = await withRetry(() => 
                puter.ai.txt2img(prompt, { testMode: true })
            );
            
            loadingElement.remove();
            this.addImageMessage(prompt, image);
            
        } catch (error) {
            console.error('Ошибка генерации изображения:', error);
            
            // Удаляем все элементы загрузки
            document.querySelectorAll('.image-loading').forEach(el => {
                const message = el.closest('.message');
                if (message) message.remove();
            });
            
            addMessage(this.messagesContainer, 
                'Извините, произошла ошибка при генерации изображения. Пожалуйста, попробуйте другой запрос или проверьте подключение к интернету.', 
                false, true);
        }
    }

    // Добавление сообщения с изображением
    addImageMessage(promptText, imageElement) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'ai-image-message');
        
        const textElement = document.createElement('div');
        textElement.textContent = 'Сгенерировано изображение:';
        messageElement.appendChild(textElement);
        
        // Убедимся, что imageElement - это DOM элемент
        if (imageElement instanceof HTMLElement) {
            imageElement.classList.add('generated-image');
            messageElement.appendChild(imageElement);
        } else {
            // Если это URL или другой формат
            const img = document.createElement('img');
            img.src = imageElement;
            img.classList.add('generated-image');
            img.alt = 'Сгенерированное изображение';
            messageElement.appendChild(img);
        }
        
        if (promptText) {
            const promptElement = document.createElement('div');
            promptElement.classList.add('image-prompt');
            promptElement.textContent = `Запрос: "${sanitizeHTML(promptText)}"`;
            messageElement.appendChild(promptElement);
        }
        
        this.messagesContainer.appendChild(messageElement);
        scrollToBottom(this.messagesContainer);
        saveChatHistory(this.messagesContainer);
        manageChatStorage(this.messagesContainer);
    }

    // Остановка текущего стрима
    cancelStream() {
        if (this.currentStream) {
            this.currentStream.cancel?.();
            this.currentStream = null;
        }
    }
}
