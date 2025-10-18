// script.js - Полная версия AI Assistant с исправлениями

class AIAssistant {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        // Основные элементы интерфейса
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.generateImageBtn = document.getElementById('generateImageBtn');
        this.generateVoiceBtn = document.getElementById('generateVoiceBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.logo = document.getElementById('logoBtn');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.currentChatName = document.getElementById('currentChatName');
        this.inputSection = document.getElementById('inputSection');
        
        // Элементы навигации
        this.scrollToLastAI = document.getElementById('scrollToLastAI');
        this.scrollToBottomBtn = document.getElementById('scrollToBottom');
        this.chatMinimap = document.getElementById('chatMinimap');
        this.minimapContent = document.getElementById('minimapContent');
        this.minimapViewport = document.getElementById('minimapViewport');

        // Элементы меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.chatList = document.getElementById('chatList');
        this.newChatBtn = document.getElementById('newChatBtn');

        // Поиск
        this.headerSearch = document.getElementById('headerSearch');
        this.headerSearchClear = document.getElementById('headerSearchClear');

        // Режимы
        this.normalModeBtn = document.getElementById('normalModeBtn');

        // Модальные окна
        this.editChatModal = document.getElementById('editChatModal');
        this.editChatNameInput = document.getElementById('editChatNameInput');
        this.modalClearInput = document.getElementById('modalClearInput');
        this.editChatModalClose = document.getElementById('editChatModalClose');
        this.editChatModalCancel = document.getElementById('editChatModalCancel');
        this.editChatModalSave = document.getElementById('editChatModalSave');
        this.editingChatId = null;

        // Новые элементы для исправлений
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.themeMinimapToggle = document.getElementById('themeMinimapToggle');
        this.footerHelpBtn = document.getElementById('footerHelpBtn');
        this.footerClearChatBtn = document.getElementById('footerClearChatBtn');
        this.footerDownloadBtn = document.getElementById('footerDownloadBtn');
        this.modelModalOverlay = document.getElementById('modelModalOverlay');
        this.modelModalClose = document.getElementById('modelModalClose');
        this.modelModalCancel = document.getElementById('modelModalCancel');
        this.modelModalConfirm = document.getElementById('modelModalConfirm');
        this.modelList = document.querySelector('.model-list');
        
        // Элементы сайдбара
        this.sidebarSearch = document.getElementById('sidebarSearch');
        this.currentModelInfo = document.getElementById('currentModelInfo');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.importChatBtn = document.getElementById('importChatBtn');
    }

    initializeState() {
        // Состояние приложения
        this.isProcessing = false;
        this.currentTheme = 'dark';
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.attachedImages = [];
        this.isListening = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.currentModel = 'gpt-5-nano';
        this.currentAudio = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.activeTypingIndicator = null;
        this.activeStreamingMessage = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.autoScrollEnabled = true;
        
        // Новые состояния для управления генерацией
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.lastUserMessage = null;
        
        // Состояния для навигации
        this.isAtBottom = true;
        this.isAtTop = false;
        this.lastAIMessageIndex = -1;

        // Конфигурация
        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач' 
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения' 
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа' 
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач' 
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений' 
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями' 
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач' 
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами' 
            }
        };
    }

    setupMarked() {
        marked.setOptions({
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn(`Error highlighting ${lang}:`, err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }

    init() {
        try {
            this.bindEvents();
            this.setupAutoResize();
            this.setupVoiceRecognition();
            this.startPlaceholderAnimation();
            this.loadThemePreference();
            this.loadChatSessions();
            this.setupChatSelector();
            this.loadCurrentSession();
            this.setupScrollTracking();
            this.setupResponsiveMinimap();
            this.updateModelInfo();
            
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    bindEvents() {
        // Основные обработчики событий
        const events = [
            [this.sendBtn, 'click', () => this.handleSendButtonClick()],
            [this.userInput, 'keydown', (e) => this.handleInputKeydown(e)],
            [this.userInput, 'input', () => this.handleInputChange()],
            [this.clearInputBtn, 'click', () => this.clearInput()],
            [this.clearChatBtn, 'click', () => this.clearChat()],
            [this.helpBtn, 'click', () => this.showHelp()],
            [this.generateImageBtn, 'click', () => this.toggleImageMode()],
            [this.generateVoiceBtn, 'click', () => this.toggleVoiceMode()],
            [this.themeToggle, 'click', () => this.toggleTheme()],
            [this.logo, 'click', () => this.refreshPage()],
            [this.attachFileBtn, 'click', () => this.fileInput.click()],
            [this.fileInput, 'change', (e) => this.handleFileSelect(e)],
            [this.voiceInputBtn, 'click', () => this.toggleVoiceInput()],
            [this.menuToggle, 'click', () => this.toggleSidebar()],
            [this.sidebarClose, 'click', () => this.closeSidebar()],
            [this.sidebarOverlay, 'click', () => this.closeSidebar()],
            [this.newChatBtn, 'click', () => this.createNewChat()],
            [window, 'beforeunload', () => this.handleBeforeUnload()],
            [this.editChatModalClose, 'click', () => this.closeEditChatModal()],
            [this.editChatModalCancel, 'click', () => this.closeEditChatModal()],
            [this.editChatModalSave, 'click', () => this.saveChatName()],
            [this.editChatNameInput, 'keydown', (e) => {
                if (e.key === 'Enter') this.saveChatName();
                if (e.key === 'Escape') this.closeEditChatModal();
            }],
            [this.editChatNameInput, 'input', () => this.handleModalInputChange()],
            [this.modalClearInput, 'click', () => this.clearModalInput()],
            [this.scrollToLastAI, 'click', () => this.scrollToLastAIMessage()],
            [this.scrollToBottomBtn, 'click', () => this.scrollToBottom(true)],
            [this.messagesContainer, 'scroll', () => this.handleScroll()],
            [this.headerSearch, 'input', () => this.handleSearchInput()],
            [this.headerSearchClear, 'click', () => this.clearSearch()],
            [this.normalModeBtn, 'click', () => this.setMode('normal')],

            // Новые события для исправлений
            [this.modelSelectBtn, 'click', () => this.openModelModal()],
            [this.themeMinimapToggle, 'click', () => this.toggleTheme()],
            [this.footerHelpBtn, 'click', () => this.showHelp()],
            [this.footerClearChatBtn, 'click', () => this.clearChat()],
            [this.footerDownloadBtn, 'click', () => this.downloadHistory()],
            [this.modelModalClose, 'click', () => this.closeModelModal()],
            [this.modelModalCancel, 'click', () => this.closeModelModal()],
            [this.modelModalConfirm, 'click', () => this.confirmModelSelection()],
            [this.modelModalOverlay, 'click', (e) => {
                if (e.target === this.modelModalOverlay) this.closeModelModal();
            }],
            [this.modelList, 'click', (e) => this.handleModelItemClick(e)],
            [this.sidebarSearch, 'input', () => this.filterChatHistory()],
            [this.importChatBtn, 'click', () => this.importChatHistory()],
            [document, 'keydown', (e) => this.handleGlobalKeydown(e)]
        ];

        events.forEach(([element, event, handler]) => {
            this.addEventListener(element, event, handler);
        });
    }

    refreshPage() {
        location.reload();
    }

    setupScrollTracking() {
        // Инициализация отслеживания прокрутки
        this.updateNavigationButtons();
    }

    handleScroll() {
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Определяем, находится ли пользователь внизу
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        
        // Определяем, находится ли пользователь вверху
        this.isAtTop = scrollTop < 50;
        
        // Обновляем кнопки навигации
        this.updateNavigationButtons();
        
        // Обновляем мини-карту
        this.updateMinimapViewport();
        
        // Включаем автоскролл только если пользователь находится внизу
        this.autoScrollEnabled = this.isAtBottom;
    }

    updateNavigationButtons() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai:not(.typing-indicator)');
        const hasAIMessages = aiMessages.length > 0;
        
        // Обновляем кнопку "к последнему AI"
        if (this.scrollToLastAI) {
            this.scrollToLastAI.classList.toggle('active', !this.isAtBottom && hasAIMessages);
            this.scrollToLastAI.disabled = !hasAIMessages;
        }
        
        // Обновляем кнопку "вниз"
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.classList.toggle('active', !this.isAtBottom);
            this.scrollToBottomBtn.disabled = this.isAtBottom;
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.setTimeout(() => this.updateNavigationButtons(), 300);
        }
    }

    scrollToBottom(force = false) {
        if (force) {
            this.autoScrollEnabled = true;
        }
        
        if (this.autoScrollEnabled) {
            this.setTimeout(() => {
                if (this.messagesContainer) {
                    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                    this.setTimeout(() => this.updateNavigationButtons(), 100);
                }
            }, 50);
        }
    }

    handleSendButtonClick() {
        if (this.isGenerating) {
            // Если идет генерация, останавливаем ее
            this.stopGeneration();
        } else {
            // Иначе отправляем сообщение
            this.sendMessage();
        }
    }

    handleInputChange() {
        // Проверяем, изменился ли ввод пользователя
        const hasInput = this.userInput.value.trim().length > 0 || this.attachedImages.length > 0;
        
        if (this.isGenerating && hasInput) {
            // Если идет генерация и пользователь начал вводить текст,
            // меняем кнопку обратно на отправку
            this.updateSendButton(false);
        }
        
        // Показываем/скрываем кнопку очистки
        this.clearInputBtn.style.display = this.userInput.value ? 'flex' : 'none';
    }

    updateSendButton(isGenerating) {
        if (isGenerating) {
            // Режим генерации - кнопка остановки (красная)
            this.sendBtn.classList.add('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-player-stop"></i>';
            this.sendBtn.title = 'Остановить генерацию';
            
            // Блокируем поле ввода только во время активной генерации
            this.inputSection.classList.add('input-disabled');
            this.userInput.disabled = true;
            this.userInput.placeholder = 'ИИ генерирует ответ... Нажмите остановить для прерывания';
        } else {
            // Обычный режим - кнопка отправки (самолетик)
            this.sendBtn.classList.remove('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            this.sendBtn.title = 'Отправить сообщение';
            
            // Полностью разблокируем поле ввода
            this.inputSection.classList.remove('input-disabled');
            this.userInput.disabled = false;
            
            // Обновляем плейсхолдер в зависимости от режима
            if (this.isVoiceMode) {
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
            } else if (this.isImageMode) {
                this.userInput.placeholder = 'Опишите изображение для генерации...';
            } else {
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
            }
        }
    }

    async sendMessage() {
        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        const message = this.userInput.value.trim();
        
        if (!message && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'error');
            return;
        }

        this.isProcessing = true;
        this.isGenerating = true;
        this.generationAborted = false;
        this.updateSendButton(true);

        try {
            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message);
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.handleError('Произошла ошибка при отправке сообщения', error);
        } finally {
            if (!this.generationAborted) {
                this.isProcessing = false;
                this.isGenerating = false;
                this.updateSendButton(false);
            }
        }
    }

    stopGeneration() {
        if (this.isGenerating && this.currentStreamController) {
            this.generationAborted = true;
            this.isGenerating = false;
            this.isProcessing = false;
            
            // Останавливаем стриминг
            if (this.currentStreamController.abort) {
                this.currentStreamController.abort();
            }
            
            // Убираем индикатор печати
            this.removeTypingIndicator();
            
            // Обновляем UI
            this.updateSendButton(false);
            if (this.activeStreamingMessage) {
                this.finalizeStreamingMessage(this.activeStreamingMessage, 
                    this.messagesContainer.querySelector(`#${this.activeStreamingMessage} .streaming-text`).innerHTML);
            }
            
            this.showNotification('Генерация остановлена', 'info');
            this.currentStreamController = null;
        }
    }

    async processUserMessage(message) {
        // Сохраняем последнее сообщение пользователя для возможного продолжения
        this.lastUserMessage = {
            text: message,
            files: [...this.attachedImages]
        };
        
        // Добавляем сообщение пользователя
        this.addMessage('user', message, this.attachedImages);
        this.addToConversationHistory('user', message, this.attachedImages);
        
        // Очищаем ввод
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
        // Обрабатываем сообщение
        if (this.isImageMode) {
            await this.generateImage(message);
        } else {
            await this.getAIResponse(message, filesToProcess);
        }
    }

    async getAIResponse(userMessage, files) {
        this.removeTypingIndicator();
        this.activeTypingIndicator = this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                // Обработка изображений
                if (typeof puter?.ai?.img2txt !== 'function') {
                    throw new Error('Функция анализа изображений недоступна');
                }
                
                const extractedText = await puter.ai.img2txt(file.data);
                
                if (userMessage.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Если на изображении есть дополнительная информация (текст, задачи, диаграммы и т.д.) - используй её для полного ответа. Отвечай одним целостным сообщением на русском языке.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
                }
            } else if (file.fileType === 'text') {
                // Обработка текстовых файлов
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил текстовый файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй текст и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил текстовый файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного текста. Отвечай подробно на русском языке.`;
                }
            }
        } else {
            return this.buildContextPrompt(userMessage);
        }
    }

    async callAIService(prompt) {
        if (typeof puter?.ai?.chat !== 'function') {
            throw new Error('Функция чата недоступна');
        }
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'claude-sonnet': { model: 'claude-sonnet' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'gemini-1.5-flash': { model: 'gemini-1.5-flash' },
            'grok-beta': { model: 'grok-beta' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: "Ты полезный AI-ассистент. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.",
            stream: true
        };
        
        return await puter.ai.chat(prompt, options);
    }

    async processAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage();
        this.currentStreamController = response; // Сохраняем контроллер для возможности остановки
        
        let fullResponse = '';
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(this.activeStreamingMessage, fullResponse);
                    await this.delay(10); // Небольшая задержка для плавности
                }
            }
            
            if (!this.generationAborted) {
                this.finalizeStreamingMessage(this.activeStreamingMessage, fullResponse);
                this.addToConversationHistory('assistant', fullResponse);
                this.saveCurrentSession();
                this.updateMinimap();
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка при обработке ответа ИИ', error);
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator-inline');
        
        if (content.length > 100 && typingIndicator && !typingIndicator.classList.contains('fade-out')) {
            typingIndicator.classList.add('fade-out');
            this.setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.style.display = 'none';
                }
            }, 300);
        }
        
        const processedContent = this.processCodeBlocks(content);
        streamingText.innerHTML = processedContent;
        
        this.attachCopyButtons(streamingText);
        
        // Прокручиваем только если пользователь не открутился вверх
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.classList.remove('streaming-content');
        
        const typingIndicator = messageContent.querySelector('.typing-indicator-inline');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const processedContent = this.processCodeBlocks(fullContent);
        messageContent.innerHTML = processedContent;
        
        // Добавляем информацию о модели
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        
        // Добавляем кнопки скачивания если есть код или упоминание файлов
        this.addDownloadButtons(messageElement, fullContent);
        
        this.scrollToBottom();
    }

    // Добавляем кнопки скачивания файлов
    addDownloadButtons(messageElement, content) {
        let messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            messageElement.appendChild(messageActions);
        }

        // Проверяем, содержит ли сообщение код или упоминание файлов
        const hasCode = content.includes('```') || 
                       /(файл|код|скачать|сохранить|download|file)/i.test(content);
        
        if (hasCode) {
            // Создаем кнопки для разных типов файлов
            const fileTypes = [
                { name: 'Текст', ext: 'txt', icon: 'ti-file-text' },
                { name: 'Python', ext: 'py', icon: 'ti-brand-python' },
                { name: 'JavaScript', ext: 'js', icon: 'ti-brand-javascript' },
                { name: 'HTML', ext: 'html', icon: 'ti-brand-html5' },
                { name: 'CSS', ext: 'css', icon: 'ti-brand-css3' }
            ];

            fileTypes.forEach(fileType => {
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'action-btn-small download-file-btn';
                downloadBtn.innerHTML = `<i class="ti ${fileType.icon}"></i> ${fileType.name}`;
                downloadBtn.onclick = () => this.downloadFile(content, fileType.ext);
                messageActions.appendChild(downloadBtn);
            });
        }
    }

    // Метод для скачивания файла
    downloadFile(content, fileExtension) {
        // Извлекаем чистый текст из HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        // Создаем имя файла с временной меткой
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `ai_assistant_${timestamp}.${fileExtension}`;

        // Используем puter.js для сохранения файла
        if (typeof puter?.fs?.write === 'function') {
            puter.fs.write(fileName, plainText)
                .then(() => {
                    this.showNotification(`Файл "${fileName}" успешно сохранен!`, 'success');
                })
                .catch(error => {
                    console.error('Error saving file with puter:', error);
                    // Fallback: скачивание через браузер
                    this.downloadViaBrowser(plainText, fileName);
                });
        } else {
            // Fallback: скачивание через браузер
            this.downloadViaBrowser(plainText, fileName);
        }
    }

    // Fallback метод для скачивания через браузер
    downloadViaBrowser(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showNotification(`Файл "${fileName}" скачан`, 'success');
    }

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        if (messageElement.classList.contains('message-ai')) {
            this.attachSpeakButton(messageElement);
            // Добавляем кнопки скачивания для существующих сообщений
            const messageContent = messageElement.querySelector('.message-content');
            if (messageContent) {
                const content = messageContent.textContent || '';
                this.addDownloadButtons(messageElement, content);
            }
        }
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => {
            this.addEventListener(btn, 'click', async (e) => {
                const codeBlock = e.target.closest('.code-header')?.nextElementSibling;
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                        btn.classList.add('copied');
                        
                        this.setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                        
                        this.showNotification('Код скопирован в буфер обмена', 'success');
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                        this.showNotification('Не удалось скопировать код', 'error');
                    }
                }
            });
        });
    }

    attachSpeakButton(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const plainText = this.extractPlainText(messageContent.textContent || '');
        
        if (plainText.trim().length < 10) return;
        
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        const existingSpeakBtn = actionsContainer.querySelector('.speak-btn');
        if (existingSpeakBtn) {
            existingSpeakBtn.remove();
        }
        
        const speakButton = document.createElement('button');
        speakButton.className = 'action-btn-small speak-btn';
        speakButton.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        speakButton.setAttribute('data-text', plainText);
        
        this.addEventListener(speakButton, 'click', (e) => {
            e.stopPropagation();
            const text = e.currentTarget.getAttribute('data-text');
            this.toggleTextToSpeech(text, speakButton);
        });
        
        actionsContainer.appendChild(speakButton);
    }

    extractPlainText(htmlText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    toggleTextToSpeech(text, button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        } else {
            this.speakText(text, button);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            this.stopSpeech(); // Останавливаем предыдущее воспроизведение

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
                this.currentUtterance.rate = 0.8;
            }

            button.classList.add('speaking');
            button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
                this.showNotification('Ошибка при озвучивании текста', 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    async generateVoice(text) {
        if (typeof puter?.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса недоступна');
        }
        
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }

        try {
            this.addMessage('user', `🔊 **Генерация голоса:** "${text}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await puter.ai.txt2speech(text);
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', `Сгенерирован голос для текста: ${text}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **Сгенерированный голос для текста:** "${this.escapeHtml(text)}"
            <div class="audio-player" style="margin-top: 12px;">
                <audio controls style="width: 100%; max-width: 300px;">
                    <source src="${audio.src}" type="audio/mpeg">
                    Ваш браузер не поддерживает аудио элементы.
                </audio>
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        const audioElement = messageContent.querySelector('audio');
        audioElement.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += ` [Прикреплено изображение: ${imageNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        // Ограничиваем историю 30 сообщениями
        if (this.conversationHistory.length > 30) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    async generateImage(prompt) {
        try {
            if (typeof puter?.ai?.imagine !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.addMessage('ai', `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n*Идет процесс создания изображения...*`);
            
            const imageResult = await puter.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            // Обновляем сообщение с результатом
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Сгенерированное изображение по запросу:** "${this.escapeHtml(prompt)}"\n\n` +
                    `<img src="${imageResult.url}" alt="Сгенерированное изображение" style="max-width: 100%; border-radius: 8px;">`;
            }
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.setMode(this.isImageMode ? 'image' : 'normal');
    }

    addMessage(role, content, images = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        try {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML = processedContent;
        } catch {
            messageContent.textContent = content;
        }
        
        if (role === 'ai') {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        if (images && images.length > 0) {
            images.forEach(image => {
                if (image.fileType === 'image') {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'message-image';
                    
                    const img = document.createElement('img');
                    img.src = image.data;
                    img.alt = image.name;
                    img.style.maxWidth = '200px';
                    img.style.borderRadius = '8px';
                    img.style.marginTop = '8px';
                    
                    imageContainer.appendChild(img);
                    messageContent.appendChild(imageContainer);
                } else if (image.fileType === 'text') {
                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'attached-file';
                    fileContainer.style.marginTop = '8px';
                    fileContainer.innerHTML = `
                        <i class="ti ti-file-text"></i>
                        <span>${this.escapeHtml(image.name)} (Текстовый файл)</span>
                    `;
                    messageContent.appendChild(fileContainer);
                }
            });
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
        this.updateMinimap();
        
        return messageElement;
    }

    processCodeBlocks(content) {
        let html = marked.parse(content);
        
        // Добавляем заголовки для блоков кода
        html = html.replace(/<pre><code class="([^"]*)">/g, (match, lang) => {
            const language = lang || 'text';
            return `
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" data-language="${language}">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                </div>
                <pre><code class="${lang}">`;
        });
        
        return html;
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
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
        
        return typingElement.id;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) element.remove();
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
            this.activeTypingIndicator = null;
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification('Ввод очищен', 'success');
        this.handleInputChange();
    }

    clearChat() {
        if (this.messagesContainer.children.length === 0) {
            return;
        }

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            // Не показываем приветственное сообщение при очистке
            this.saveCurrentSession();
            this.updateMinimap();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showWelcomeMessage() {
        // Проверяем, не было ли уже показано приветственное сообщение
        if (this.conversationHistory.length > 0) {
            return;
        }
        
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeMessage = `# 👋 Добро пожаловать в KHAI Assistant!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. 

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Анализ текстовых файлов** - чтение и анализ содержимого файлов
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь
• **Озвучивание ответов** - слушайте ответы ИИ в аудиоформате
• **Контекстный диалог** - помню историю нашего разговора
• **Подсветка синтаксиса** - красивое отображение кода
• **Копирование кода** - удобное копирование фрагментов кода
• **Стриминг ответов** - ответы появляются постепенно
• **Мульти-чаты** - создавайте отдельные чаты для разных тем
• **Редактирование названий чатов** - нажмите на иконку карандаша

**Текущая модель: ${currentModelName}** - ${currentModelDesc}

**Начните общение, отправив сообщение, изображение или текстовый файл!**`;

        this.addMessage('ai', welcomeMessage);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        const helpMessage = `# 🆘 Помощь по KHAI Assistant

## 🤖 Текущая модель: ${currentModelName}
Вы можете переключать модели в верхнем правом углу.

## 💬 Система чатов:
• **Создание нового чата** - нажмите "Новый чат" в меню
• **Редактирование названия** - нажмите на иконку карандаша рядом с чатом
• **Переключение между чатами** - выберите чат из списка в меню
• **Удаление чатов** - нажмите ❌ рядом с названием чата (кроме основного)

## 📁 Работа с файлами:
• **Изображения** - прикрепите для анализа текста и содержимого
• **Текстовые файлы** - прикрепите для анализа содержимого (.txt)
• **Максимум файлов** - можно прикрепить до 3 файлов за раз

## 🔊 Аудио функции:
• **Генерация голоса** - создает аудио из текста с помощью ИИ
• **Озвучить ответ** - воспроизводит ответ ИИ
• **Остановить озвучку** - нажмите кнопку повторно для остановки

## 🖼️ Работа с изображениями:
1. **Нажмите кнопку ➕** чтобы прикрепить изображение
2. **Напишите вопрос** (опционально) - что вы хотите узнать о изображении
3. **Нажмите Отправить** - ИИ проанализирует изображение и ответит

## 📄 Работа с текстовых файлов:
1. **Нажмите кнопку ➕** чтобы прикрепить текстовый файл
2. **Напишите вопрос** (опционально) - что вы хотите узнать о содержимом
3. **Нажмите Отправить** - ИИ проанализирует файл и ответит

**Попробуйте отправить изображение или текстовый файл с вопросом!**`;

        this.addMessage('ai', helpMessage);
        this.addToConversationHistory('assistant', helpMessage);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Сохраняем тему в localStorage
        try {
            localStorage.setItem('khai-assistant-theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
        
        // Обновляем иконки кнопок темы
        const themeIcon = this.currentTheme === 'dark' ? 'ti-sun' : 'ti-moon';
        this.themeToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
        this.themeMinimapToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
            'info'
        );
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('khai-assistant-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Убираем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'circle-check',
            'error': 'alert-circle',
            'warning': 'alert-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    handleError(userMessage, error) {
        console.error(userMessage, error);
        this.addMessage('error', `${userMessage}: ${error.message}`);
        this.showNotification(userMessage, 'error');
    }

    // Система чатов
    setupChatSelector() {
        if (!this.chatSessions.has('default')) {
            this.createDefaultChat();
        }
        this.updateChatList();
    }

    createDefaultChat() {
        const defaultSession = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        this.chatSessions.set('default', defaultSession);
        this.currentChatId = 'default';
        this.saveChatSessions();
    }

    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        if (this.sidebarMenu.classList.contains('active')) {
            this.updateChatList();
            this.updateModelInfo();
            this.updateConnectionStatus();
        }
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    updateChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';

        const sessionsArray = Array.from(this.chatSessions.entries())
            .sort(([,a], [,b]) => b.lastActivity - a.lastActivity);

        if (sessionsArray.length === 0) {
            this.createDefaultChat();
            this.updateChatList();
            return;
        }

        sessionsArray.forEach(([id, session]) => {
            const chatItem = this.createChatItem(id, session);
            this.chatList.appendChild(chatItem);
        });
    }

    createChatItem(id, session) {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${id === this.currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-chat-id', id);
        
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-title">${this.escapeHtml(session.name)}</div>
                <div class="chat-item-preview">${this.getChatPreview(session)}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-item-action edit" title="Редактировать название чата">
                    <i class="ti ti-pencil"></i>
                </button>
                ${id !== 'default' ? '<button class="chat-item-action delete" title="Удалить чат"><i class="ti ti-trash"></i></button>' : ''}
            </div>
        `;

        this.addEventListener(chatItem, 'click', (e) => {
            if (!e.target.closest('.chat-item-action')) {
                this.switchChat(id);
                this.closeSidebar();
            }
        });

        const editBtn = chatItem.querySelector('.edit');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(id, session.name);
            });
        }

        const deleteBtn = chatItem.querySelector('.delete');
        if (deleteBtn) {
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(id);
            });
        }

        return chatItem;
    }

    getChatPreview(session) {
        if (session.conversationHistory && session.conversationHistory.length > 0) {
            const lastMessage = session.conversationHistory[session.conversationHistory.length - 1];
            const preview = lastMessage.content.substring(0, 50);
            return preview + (lastMessage.content.length > 50 ? '...' : '');
        }
        return 'Нет сообщений';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createNewChat() {
        const chatNumber = Array.from(this.chatSessions.values()).filter(session => 
            session.name.startsWith('Чат ')
        ).length + 1;
        
        const chatName = `Чат ${chatNumber}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.closeSidebar();
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }

    createChatSession(name = 'Новый чат') {
        const chatId = 'chat-' + Date.now();
        const session = {
            id: chatId,
            name: name,
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatList();
        
        return chatId;
    }

    switchChat(chatId) {
        if (!this.chatSessions.has(chatId) || chatId === this.currentChatId) {
            return;
        }

        try {
            // Сохраняем текущую сессию перед переключением
            this.saveCurrentSession();
            
            this.currentChatId = chatId;
            const session = this.chatSessions.get(chatId);
            
            // Обновляем активность чата
            session.lastActivity = Date.now();
            this.chatSessions.set(chatId, session);
            
            // Обновляем UI
            this.currentChatName.textContent = session.name;
            
            // Загружаем новую сессию
            this.loadSession(session);
            this.showNotification(`Переключен на чат: ${session.name}`, 'info');
            
            this.saveChatSessions();
        } catch (error) {
            console.error('Error switching chat:', error);
            this.showNotification('Ошибка при переключении чата', 'error');
        }
    }

    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification('Основной чат нельзя удалить', 'warning');
            return;
        }

        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        const session = this.chatSessions.get(chatId);
        if (!session) return;

        if (confirm(`Удалить чат "${session.name}"?`)) {
            this.chatSessions.delete(chatId);
            
            // Если удаляем текущий чат, переключаемся на default
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    openEditChatModal(chatId, currentName) {
        this.editingChatId = chatId;
        this.editChatNameInput.value = currentName;
        this.editChatModal.classList.add('active');
        this.handleModalInputChange();
        
        // Фокусируемся на поле ввода после открытия модального окна
        this.setTimeout(() => {
            this.editChatNameInput.focus();
            this.editChatNameInput.select();
        }, 100);
    }

    handleModalInputChange() {
        const hasText = this.editChatNameInput.value.trim().length > 0;
        this.modalClearInput.style.display = hasText ? 'flex' : 'none';
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.editChatNameInput.focus();
        this.handleModalInputChange();
    }

    closeEditChatModal() {
        this.editingChatId = null;
        this.editChatNameInput.value = '';
        this.modalClearInput.style.display = 'none';
        this.editChatModal.classList.remove('active');
    }

    saveChatName() {
        if (!this.editingChatId) return;
        
        const newName = this.editChatNameInput.value.trim();
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }

        const session = this.chatSessions.get(this.editingChatId);
        if (session) {
            session.name = newName;
            this.chatSessions.set(this.editingChatId, session);
            this.saveChatSessions();
            this.updateChatList();
            
            if (this.currentChatId === this.editingChatId) {
                this.currentChatName.textContent = newName;
            }
            
            this.showNotification('Название чата изменено', 'success');
        }
        
        this.closeEditChatModal();
    }

    saveCurrentSession() {
        try {
            const messages = [];
            this.messagesContainer.querySelectorAll('.message').forEach(message => {
                if (message.classList.contains('typing-indicator') || 
                    message.classList.contains('streaming-message')) return;
                
                const role = message.classList.contains('message-user') ? 'user' : 
                           message.classList.contains('message-error') ? 'error' : 'ai';
                
                const content = message.querySelector('.message-content')?.innerHTML || '';
                if (content) {
                    messages.push({ role, content });
                }
            });
            
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.messages = messages;
                session.conversationHistory = [...this.conversationHistory];
                session.lastActivity = Date.now();
                this.chatSessions.set(this.currentChatId, session);
                this.saveChatSessions();
            }
        } catch (error) {
            console.error('Error saving current session:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.loadSession(session);
        } else {
            this.showWelcomeMessage();
        }
    }

    loadSession(session) {
        // Очищаем контейнер сообщений
        this.messagesContainer.innerHTML = '';
        
        // Загружаем историю сообщений
        this.conversationHistory = session.conversationHistory || [];
        
        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(msg => {
                this.renderMessage(msg.role, msg.content);
            });
        } else {
            this.showWelcomeMessage();
        }
        
        this.scrollToBottom();
        this.updateMinimap();
    }

    renderMessage(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        // Прикрепляем обработчики
        this.attachMessageHandlers(messageElement);
    }

    // Сохранение и загрузка
    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-assistant-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
        }
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleBeforeUnload() {
        // Останавливаем генерацию при закрытии страницы
        if (this.isGenerating) {
            this.stopGeneration();
        }
        
        this.saveCurrentSession();
        this.saveChatSessions();
        this.cleanup();
    }

    setupAutoResize() {
        this.addEventListener(this.userInput, 'input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.voiceInputBtn.style.display = 'none';
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
                this.handleInputChange();
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } catch (error) {
            console.error('Error setting up voice recognition:', error);
            this.voiceInputBtn.style.display = 'none';
        }
    }

    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            
            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            const currentText = currentExample.substring(0, charIndex);
            this.userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                isDeleting = true;
                this.setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            this.setTimeout(type, typeSpeed);
        };

        type();
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    getModelDisplayName(model) {
        return this.modelConfig[model]?.name || model;
    }

    getModelDescription(model) {
        return this.modelConfig[model]?.description || 'Модель ИИ';
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
            }
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.setMode(this.isVoiceMode ? 'voice' : 'normal');
    }

    // Исправление режимов кнопок
    setMode(mode) {
        // Сбрасываем все режимы
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        // Снимаем активность со всех кнопок режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            // Скрываем текст у неактивных кнопок
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
                btnText.style.display = 'none';
            }
        });
        
        // Устанавливаем выбранный режим
        if (mode === 'normal') {
            this.normalModeBtn.classList.add('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        } else if (mode === 'voice') {
            this.generateVoiceBtn.classList.add('active');
            this.isVoiceMode = true;
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
        } else if (mode === 'image') {
            this.generateImageBtn.classList.add('active');
            this.isImageMode = true;
            this.userInput.placeholder = 'Опишите изображение для генерации...';
        }
        
        // Показываем текст только у активной кнопки
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) {
            const activeBtnText = activeBtn.querySelector('.btn-text');
            if (activeBtnText) {
                activeBtnText.style.display = 'inline';
            }
        }
        
        this.showNotification(`Режим: ${this.getModeName(mode)}`, 'info');
    }

    getModeName(mode) {
        const names = {
            'normal': 'Обычный',
            'voice': 'Генерация голоса',
            'image': 'Генерация изображений'
        };
        return names[mode] || 'Неизвестный';
    }

    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        let processedCount = 0;
        const maxFiles = 3;

        for (const file of files) {
            if (processedCount >= maxFiles) {
                this.showNotification('Можно прикрепить не более 3 файлов', 'warning');
                break;
            }

            try {
                if (file.type.startsWith('image/')) {
                    const imageData = await this.processImageFile(file);
                    this.attachedImages.push(imageData);
                    this.showNotification(`Изображение "${file.name}" прикреплено`, 'success');
                    processedCount++;
                } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                    const textData = await this.processTextFile(file);
                    this.attachedImages.push(textData);
                    this.showNotification(`Текстовый файл "${file.name}" прикреплен`, 'success');
                    processedCount++;
                } else {
                    this.showNotification(`Формат файла "${file.name}" не поддерживается`, 'error');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification(`Ошибка обработки файла: ${file.name}`, 'error');
            }
        }

        this.renderAttachedFiles();
        event.target.value = '';
        this.handleInputChange();
    }

    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    fileType: 'image'
                });
            };
            reader.onerror = () => reject(new Error(`Ошибка загрузки изображения: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    processTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    fileType: 'text'
                });
            };
            reader.onerror = () => reject(new Error(`Ошибка чтения текстового файла: ${file.name}`));
            reader.readAsText(file);
        });
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        if (this.attachedImages.length === 0) {
            this.attachedFiles.style.display = 'none';
            return;
        }

        this.attachedFiles.style.display = 'flex';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            
            const icon = file.fileType === 'image' ? 'ti-photo' : 'ti-file-text';
            const typeLabel = file.fileType === 'image' ? 'Изображение' : 'Текстовый файл';
            
            fileElement.innerHTML = `
                <i class="ti ${icon}"></i>
                <span>${this.escapeHtml(file.name)} (${typeLabel}, ${this.formatFileSize(file.size)})</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
        });

        this.attachedFiles.querySelectorAll('.remove-file-btn').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachedFile(index) {
        if (index < 0 || index >= this.attachedImages.length) return;
        
        const removedFile = this.attachedImages.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(`${removedFile.fileType === 'image' ? 'Изображение' : 'Файл'} "${removedFile.name}" удален`, 'info');
        this.handleInputChange();
    }

    // Мини-карта
    updateMinimap() {
        if (!this.minimapContent) return;
        
        this.minimapContent.innerHTML = '';
        const messages = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator):not(.streaming-message)');
        
        messages.forEach((message, index) => {
            const block = document.createElement('div');
            block.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            block.dataset.index = index;
            block.addEventListener('click', () => this.scrollToMessage(index));
            this.minimapContent.appendChild(block);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.chatMinimap) return;
        
        const container = this.messagesContainer;
        const containerHeight = container.scrollHeight;
        const visibleHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        if (containerHeight === 0) return;
        
        const viewportHeight = (visibleHeight / containerHeight) * this.chatMinimap.offsetHeight;
        const viewportTop = (scrollTop / containerHeight) * this.chatMinimap.offsetHeight;
        
        this.minimapViewport.style.height = `${Math.max(viewportHeight, 10)}px`;
        this.minimapViewport.style.top = `${viewportTop}px`;
    }

    scrollToMessage(index) {
        const messages = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator):not(.streaming-message)');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Поиск
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        if (searchTerm) {
            this.headerSearchClear.style.display = 'flex';
            this.highlightSearchTerms(searchTerm);
        } else {
            this.headerSearchClear.style.display = 'none';
            this.clearSearchHighlights();
        }
    }

    // Исправление поиска - экранирование спецсимволов
    highlightSearchTerms(term) {
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        // Экранируем специальные символы для regex
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTerm, 'gi');
        
        messages.forEach(message => {
            const originalContent = message.dataset.originalContent || message.innerHTML;
            message.dataset.originalContent = originalContent;
            
            const highlightedContent = originalContent.replace(regex, match => 
                `<span class="search-highlight">${match}</span>`
            );
            
            message.innerHTML = highlightedContent;
        });

        // Подсветка в мини-карте
        const minimapMessages = this.minimapContent.querySelectorAll('.minimap-message');
        const messageElements = this.messagesContainer.querySelectorAll('.message');
        
        minimapMessages.forEach((msg, index) => {
            const messageElement = messageElements[index];
            if (messageElement) {
                const messageText = messageElement.textContent || '';
                if (regex.test(messageText)) {
                    msg.classList.add('search-highlighted');
                } else {
                    msg.classList.remove('search-highlighted');
                }
            }
        });
    }

    clearSearchHighlights() {
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        
        messages.forEach(message => {
            if (message.dataset.originalContent) {
                message.innerHTML = message.dataset.originalContent;
                delete message.dataset.originalContent;
            }
        });

        // Убираем подсветку в мини-карте
        const minimapMessages = this.minimapContent.querySelectorAll('.minimap-message');
        minimapMessages.forEach(msg => msg.classList.remove('search-highlighted'));
    }

    clearSearch() {
        this.headerSearch.value = '';
        this.headerSearchClear.style.display = 'none';
        this.clearSearchHighlights();
    }

    addEventListener(element, event, handler) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка при обработке действия', 'error');
            }
        };

        element.addEventListener(event, wrappedHandler);
        
        // Сохраняем для возможности очистки
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
    }

    // Очистка ресурсов
    cleanup() {
        // Останавливаем все таймеры
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();

        // Останавливаем речь
        this.stopSpeech();

        // Останавливаем голосовой ввод
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Игнорируем ошибки при остановке
            }
        }

        // Убираем индикаторы
        this.removeTypingIndicator();

        // Очищаем прикрепленные файлы
        this.attachedImages = [];
        
        // Удаляем обработчики событий
        this.activeEventListeners.forEach((listeners, element) => {
            if (element && element.removeEventListener) {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
            }
        });
        this.activeEventListeners.clear();
    }

    // Новые методы для исправлений

    // Модальное окно выбора модели
    openModelModal() {
        this.modelModalOverlay.classList.add('active');
        // Выделяем текущую выбранную модель
        const currentModelItem = this.modelList.querySelector(`[data-model="${this.currentModel}"]`);
        if (currentModelItem) {
            currentModelItem.classList.add('selected');
        }
    }

    closeModelModal() {
        this.modelModalOverlay.classList.remove('active');
    }

    handleModelItemClick(e) {
        const modelItem = e.target.closest('.model-item');
        if (modelItem) {
            // Снимаем выделение со всех элементов
            this.modelList.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('selected');
            });
            // Выделяем выбранный элемент
            modelItem.classList.add('selected');
        }
    }

    confirmModelSelection() {
        const selectedModelItem = this.modelList.querySelector('.model-item.selected');
        if (selectedModelItem) {
            const newModel = selectedModelItem.dataset.model;
            if (newModel !== this.currentModel) {
                this.currentModel = newModel;
                this.showNotification(`Модель изменена на: ${this.getModelDisplayName(newModel)}`, 'success');
                this.updateModelInfo();
            }
        }
        this.closeModelModal();
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            this.currentModelInfo.textContent = this.getModelDisplayName(this.currentModel);
        }
    }

    updateConnectionStatus() {
        if (this.connectionStatus) {
            this.connectionStatus.textContent = '✅ Онлайн';
            this.connectionStatus.style.color = 'var(--success-text)';
        }
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.toLowerCase().trim();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-item-title').textContent.toLowerCase();
            const preview = item.querySelector('.chat-item-preview').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || preview.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    importChatHistory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const chatData = JSON.parse(event.target.result);
                        this.importChatSession(chatData);
                        this.showNotification('Чат успешно импортирован', 'success');
                    } catch (error) {
                        this.showNotification('Ошибка при импорте файла', 'error');
                        console.error('Import error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    importChatSession(chatData) {
        const chatId = 'imported-' + Date.now();
        const session = {
            id: chatId,
            name: chatData.name || 'Импортированный чат',
            messages: chatData.messages || [],
            conversationHistory: chatData.conversationHistory || [],
            createdAt: chatData.createdAt || Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatList();
        this.switchChat(chatId);
    }

    // Скачивание истории
    downloadHistory() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session || session.messages.length === 0) {
            this.showNotification('Нет данных для скачивания', 'warning');
            return;
        }

        const chatData = {
            version: '1.0',
            name: session.name,
            exportedAt: new Date().toISOString(),
            model: this.currentModel,
            messages: session.messages,
            conversationHistory: session.conversationHistory
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${session.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('История чата скачана', 'success');
    }

    // Глобальные горячие клавиши
    handleGlobalKeydown(e) {
        // Ctrl+/ или Cmd+/ - очистка чата
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.clearChat();
        }
        
        // Ctrl+H или Cmd+H - история чатов (сайдбар)
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        // Escape - закрытие модальных окон и сайдбара
        if (e.key === 'Escape') {
            this.closeSidebar();
            this.closeModelModal();
            this.closeEditChatModal();
        }
    }

    // Мини-карта в мобильной версии
    setupResponsiveMinimap() {
        const checkMobile = () => {
            const isMobile = window.innerWidth <= 480;
            if (isMobile) {
                this.ensureMinimapVisibility();
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }

    ensureMinimapVisibility() {
        // Гарантируем что мини-карта видна в мобильной версии
        const minimapContainer = this.chatMinimapContainer;
        if (minimapContainer) {
            minimapContainer.style.display = 'flex';
            minimapContainer.style.flexDirection = 'column';
            minimapContainer.style.alignItems = 'flex-end';
            minimapContainer.style.gap = '8px';
            minimapContainer.style.zIndex = '100';
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof puter === 'undefined') {
            console.warn('Puter.ai не загружен, некоторые функции будут недоступны');
        }
        
        if ('speechSynthesis' in window) {
            // Предзагрузка голосов
            speechSynthesis.getVoices();
        }
        
        window.aiAssistant = new AIAssistant();
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        const errorNotification = document.createElement('div');
        errorNotification.className = 'notification error';
        errorNotification.textContent = 'Критическая ошибка при загрузке приложения';
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '50%';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translate(-50%, -50%)';
        errorNotification.style.zIndex = '10000';
        document.body.appendChild(errorNotification);
    }
});
