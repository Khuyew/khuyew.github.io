// Стриминг ответов ИИ
class AIStreaming {
    constructor(messagesContainer) {
        this.messagesContainer = messagesContainer;
    }

    // Стриминг текстового ответа
    async streamTextResponse(prompt) {
        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai-message', 'ai-streaming');
        this.messagesContainer.appendChild(aiMessageElement);
        
        scrollToBottom(this.messagesContainer);

        try {
            const response = await puter.ai.chat(prompt, { 
                model: "gpt-5-nano", 
                stream: true 
            });
            
            let fullText = '';
            
            for await (const part of response) {
                if (part?.text) {
                    fullText += part.text;
                    aiMessageElement.innerHTML = sanitizeHTML(fullText) + '<span class="typing-cursor"></span>';
                    scrollToBottom(this.messagesContainer);
                }
            }
            
            // Убираем курсор после завершения
            aiMessageElement.innerHTML = sanitizeHTML(fullText);
            aiMessageElement.classList.remove('ai-streaming');
            
        } catch (error) {
            console.error('Ошибка стриминга:', error);
            aiMessageElement.remove();
            throw error;
        }
        
        saveChatHistory(this.messagesContainer);
        return aiMessageElement;
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
            document.querySelectorAll('.image-loading').forEach(el => el.closest('.message').remove());
            addMessage(this.messagesContainer, 
                'Извините, произошла ошибка при генерации изображения. Пожалуйста, попробуйте другой запрос.', 
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
        
        imageElement.classList.add('generated-image');
        messageElement.appendChild(imageElement);
        
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
}
