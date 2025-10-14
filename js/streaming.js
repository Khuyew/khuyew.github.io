// Стриминг ответов ИИ
class AIStreaming {
    constructor(messagesContainer) {
        this.messagesContainer = messagesContainer;
        this.currentStream = null;
        this.streamingSpeed = 50; // Оптимальная скорость печати
        this.chunkSize = 3; // Количество символов за один шаг
    }

    // Стриминг текстового ответа
    async streamTextResponse(prompt) {
        // Отменяем предыдущий стрим, если он есть
        if (this.currentStream) {
            this.currentStream.cancel?.();
        }

        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai-message', 'ai-streaming');
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        aiMessageElement.appendChild(contentElement);
        
        this.messagesContainer.appendChild(aiMessageElement);
        scrollToBottom(this.messagesContainer);

        try {
            const response = await puter.ai.chat(prompt, { 
                model: "gpt-5-nano", 
                stream: true 
            });
            
            this.currentStream = response;
            let fullText = '';
            let buffer = '';
            let isFirstChunk = true;
            
            for await (const part of response) {
                if (part?.text) {
                    buffer += part.text;
                    fullText += part.text;
                    
                    // Обрабатываем буфер порциями для плавности
                    if (buffer.length >= this.chunkSize || part.text.includes('\n')) {
                        await this.typeText(contentElement, buffer, isFirstChunk);
                        buffer = '';
                        isFirstChunk = false;
                    }
                }
            }
            
            // Обрабатываем оставшийся буфер
            if (buffer.length > 0) {
                await this.typeText(contentElement, buffer, isFirstChunk);
            }
            
            // Финальное обновление с Markdown
            this.finalizeMessage(contentElement, fullText);
            aiMessageElement.classList.remove('ai-streaming');
            this.currentStream = null;
            
        } catch (error) {
            console.error('Ошибка стриминга:', error);
            aiMessageElement.remove();
            this.currentStream = null;
            
            throw error;
        }
        
        return aiMessageElement;
    }

    // Плавная печать текста
    async typeText(element, text, isFirstChunk = false) {
        return new Promise(resolve => {
            let i = 0;
            const currentContent = element.innerHTML;
            
            const type = () => {
                if (i < text.length) {
                    const chunk = text.substring(i, i + 1);
                    element.innerHTML = currentContent + sanitizeHTML(text.substring(0, i + 1)) + '<span class="typing-cursor"></span>';
                    i++;
                    
                    // Разная скорость для разных символов
                    let delay = this.streamingSpeed;
                    if (chunk === '.' || chunk === '!' || chunk === '?') {
                        delay = this.streamingSpeed * 3;
                    } else if (chunk === ',' || chunk === ';') {
                        delay = this.streamingSpeed * 2;
                    } else if (chunk === ' ' || chunk === '\n') {
                        delay = this.streamingSpeed / 2;
                    }
                    
                    setTimeout(type, delay);
                } else {
                    resolve();
                }
            };
            
            type();
        });
    }

    // Финальная обработка сообщения с Markdown
    finalizeMessage(element, text) {
        element.innerHTML = marked.parse(text);
        this.applyCodeHighlighting(element);
        saveChatHistory(this.messagesContainer);
        scrollToBottom(this.messagesContainer);
    }

    // Применение подсветки синтаксиса
    applyCodeHighlighting(element) {
        element.querySelectorAll('pre code').forEach((block) => {
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
            hljs.highlightElement(block);
        });
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
            
            document.querySelectorAll('.image-loading').forEach(el => {
                const message = el.closest('.message');
                if (message) message.remove();
            });
            
            addMessage(this.messagesContainer, 
                '❌ Извините, произошла ошибка при генерации изображения. Пожалуйста, попробуйте другой запрос или проверьте подключение к интернету.', 
                false, true);
        }
    }

    // Добавление сообщения с изображением
    addImageMessage(promptText, imageElement) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'ai-image-message');
        
        const textElement = document.createElement('div');
        textElement.textContent = '🎨 Сгенерировано изображение:';
        messageElement.appendChild(textElement);
        
        if (imageElement instanceof HTMLElement) {
            imageElement.classList.add('generated-image');
            imageElement.alt = `Изображение по запросу: ${promptText}`;
            imageElement.setAttribute('tabindex', '0');
            imageElement.setAttribute('role', 'button');
            imageElement.setAttribute('aria-label', `Увеличить изображение: ${promptText}`);
            messageElement.appendChild(imageElement);
        } else {
            const img = document.createElement('img');
            img.src = imageElement;
            img.classList.add('generated-image');
            img.alt = `Изображение по запросу: ${promptText}`;
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', `Увеличить изображение: ${promptText}`);
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

    // Анализ изображения с текстом
    async analyzeImageWithText(text, imageData) {
        try {
            // Создаем индикатор анализа
            const analyzingElement = document.createElement('div');
            analyzingElement.classList.add('message', 'ai-message');
            analyzingElement.innerHTML = `
                <div class="ai-status">
                    <i class="ti ti-eye"></i>
                    ИИ анализирует изображение
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            
            this.messagesContainer.appendChild(analyzingElement);
            scrollToBottom(this.messagesContainer);
            
            // Эмулируем задержку анализа
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Удаляем индикатор анализа
            analyzingElement.remove();
            
            // Создаем промпт для анализа изображения
            const prompt = text ? 
                `Проанализируй изображение и ответь на вопрос: "${text}"` : 
                "Проанализируй это изображение и опиши что на нем изображено";
            
            // Используем обычный текстовый ответ (в реальном приложении здесь был бы API для анализа изображений)
            await this.streamTextResponse(prompt + ". (Примечание: Анализ изображений временно недоступен, но я могу помочь с текстовыми вопросами!)");
            
        } catch (error) {
            console.error('Ошибка анализа изображения:', error);
            addMessage(this.messagesContainer, 
                '❌ Ошибка анализа изображения. Попробуйте еще раз.', 
                false, true);
        }
    }

    // Остановка текущего стрима
    cancelStream() {
        if (this.currentStream) {
            this.currentStream.cancel?.();
            this.currentStream = null;
        }
    }
}
