import Utils from './utils.js';

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcript = '';
        this.voiceBtn = document.getElementById('voiceBtn');
        this.userInput = document.getElementById('userInput');
        this.voiceLevel = document.getElementById('voiceLevel');
        
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.bindEvents();
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceBtn.classList.add('voice-recording');
                this.voiceLevel.hidden = false;
                Utils.showNotification('Слушаю... Говорите', 'info');
            };
            
            this.recognition.onresult = (event) => {
                this.transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        this.transcript += event.results[i][0].transcript;
                    } else {
                        this.transcript += event.results[i][0].transcript;
                    }
                }
                
                this.userInput.value = this.transcript;
                this.userInput.dispatchEvent(new Event('input'));
                
                // Update voice level visualization
                this.updateVoiceLevel();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopListening();
                
                let errorMessage = 'Ошибка распознавания речи';
                switch (event.error) {
                    case 'not-allowed':
                        errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
                        break;
                    case 'no-speech':
                        errorMessage = 'Речь не распознана. Попробуйте еще раз.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Микрофон не найден. Убедитесь, что микрофон подключен.';
                        break;
                }
                
                Utils.showNotification(errorMessage, 'error');
            };
            
            this.recognition.onend = () => {
                this.stopListening();
                if (this.transcript.trim()) {
                    Utils.showNotification('Речь распознана', 'success');
                }
            };
        } else {
            this.voiceBtn.style.display = 'none';
            console.warn('Speech recognition not supported');
        }
    }

    bindEvents() {
        this.voiceBtn.addEventListener('click', () => this.toggleListening());
        
        // Stop listening when sending message
        document.getElementById('sendBtn').addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            }
        });
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition) {
            Utils.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        try {
            this.transcript = '';
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            Utils.showNotification('Ошибка запуска голосового ввода', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
        
        this.isListening = false;
        this.voiceBtn.classList.remove('voice-recording');
        this.voiceLevel.hidden = true;
        this.voiceLevel.style.width = '0%';
    }

    updateVoiceLevel() {
        // Simulate voice level for demonstration
        // In a real app, you would use AudioContext to analyze actual volume
        const level = Math.random() * 100;
        this.voiceLevel.style.width = `${level}%`;
    }

    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
}

export default VoiceManager;
