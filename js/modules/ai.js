import Utils from './utils.js';

class AIManager {
    constructor() {
        this.baseURL = 'https://khuyew-ai-backend.onrender.com';
        this.isGenerating = false;
    }

    async sendMessage(message, imageData = null) {
        if (this.isGenerating) {
            throw new Error('Уже выполняется другой запрос');
        }

        this.isGenerating = true;

        try {
            // Check if it's an image generation request
            if (this.isImageGenerationRequest(message)) {
                return await this.generateImage(message);
            }

            // Regular chat message
            return await this.sendChatMessage(message, imageData);
        } finally {
            this.isGenerating = false;
        }
    }

    isImageGenerationRequest(message) {
        const imageKeywords = ['нарисуй', 'сгенерируй изображение', 'создай картинку', 'нарисуй изображение', 'изобрази'];
        return imageKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    async sendChatMessage(message, imageData = null) {
        const payload = {
            message: message,
            image: imageData
        };

        try {
            const response = await fetch(`${this.baseURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return {
                type: 'text',
                content: data.response
            };

        } catch (error) {
            console.error('Chat API error:', error);
            
            // Fallback response
            if (imageData) {
                return {
                    type: 'text',
                    content: `Я вижу, что вы загрузили изображение. К сожалению, сервис анализа изображений временно недоступен. Текст вашего сообщения: "${message}"`
                };
            } else {
                return {
                    type: 'text',
                    content: `Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз. Ваше сообщение: "${message}"`
                };
            }
        }
    }

    async generateImage(prompt) {
        try {
            // Remove image generation keywords for cleaner prompt
            const cleanPrompt = prompt.replace(/нарисуй|сгенерируй изображение|создай картинку|нарисуй изображение|изобрази/gi, '').trim();
            
            const response = await fetch(`${this.baseURL}/api/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: cleanPrompt })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return {
                type: 'image',
                prompt: cleanPrompt,
                imageUrl: data.imageUrl
            };

        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error(`Не удалось сгенерировать изображение: ${error.message}`);
        }
    }

    async analyzeImage(imageData, message = 'Что изображено на этой картинке?') {
        try {
            const response = await fetch(`${this.baseURL}/api/analyze-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return {
                type: 'text',
                content: data.response
            };

        } catch (error) {
            console.error('Image analysis error:', error);
            throw new Error('Не удалось проанализировать изображение. Пожалуйста, попробуйте еще раз.');
        }
    }
}

export default AIManager;
