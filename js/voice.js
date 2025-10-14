// Голосовой ввод
class VoiceRecognition {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.lang = 'ru-RU';
                this.recognition.interimResults = true;
                this.recognition.maxAlternatives = 1;
                
                this.setupEventListeners();
            } catch (error) {
                console.error('Ошибка инициализации распознавания голоса:', error);
                this.disableVoiceButton();
            }
        } else {
            this.disableVoiceButton();
        }
    }

    disableVoiceButton() {
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            voiceButton.style.display = 'none';
        }
    }

    setupEventListeners() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceLevel = document.getElementById('voiceLevel');
        
        if (!voiceButton) return;
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            voiceButton.classList.add('voice-recording');
            voiceButton.innerHTML = '<i class="ti ti-square"></i>';
            voiceButton.title = 'Остановить запись';
            if (voiceLevel) voiceLevel.style.display = 'block';
            this.startVoiceVisualization();
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const userInput = document.getElementById('user-input');
            if (userInput) {
                // Показываем промежуточный результат
                userInput.value = finalTranscript || interimTranscript;
                userInput.focus();
                
                // Если есть финальный результат, останавливаем запись
                if (finalTranscript) {
                    this.stop();
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Ошибка распознавания голоса:', event.error);
            this.stop();
            
            const messagesContainer = document.getElementById('messagesContainer');
            if (!messagesContainer) return;
            
            if (event.error === 'not-allowed') {
                addMessage(messagesContainer, 
                    '🔒 Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.', false, true);
            } else if (event.error === 'no-speech') {
                addMessage(messagesContainer, 
                    '🎤 Речь не распознана. Пожалуйста, говорите четче и громче.', false, true);
            } else if (event.error === 'audio-capture') {
                addMessage(messagesContainer, 
                    '🎤 Не удалось получить доступ к микрофону. Проверьте настройки устройства.', false, true);
            } else if (event.error === 'network') {
                addMessage(messagesContainer, 
                    '🌐 Ошибка сети. Проверьте подключение к интернету.', false, true);
            }
        };
        
        this.recognition.onend = () => {
            this.stop();
        };
        
        voiceButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isRecording) {
                this.start();
            } else {
                this.stop();
            }
        });
    }

    start() {
        const voiceButton = document.getElementById('voiceButton');
        if (!voiceButton || !this.recognition) return;
        
        try {
            // Проверяем поддержку getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Браузер не поддерживает доступ к микрофону');
            }
            
            this.recognition.start();
            voiceButton.disabled = true;
            setTimeout(() => {
                voiceButton.disabled = false;
            }, 1000);
        } catch (error) {
            console.error('Ошибка запуска распознавания:', error);
            voiceButton.disabled = false;
            
            const messagesContainer = document.getElementById('messagesContainer');
            if (messagesContainer) {
                addMessage(messagesContainer, 
                    '🎤 Ошибка доступа к микрофону. Проверьте разрешения браузера.', false, true);
            }
        }
    }

    stop() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceLevel = document.getElementById('voiceLevel');
        
        if (this.recognition && this.isRecording) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Ошибка остановки распознавания:', error);
            }
        }
        this.isRecording = false;
        if (voiceButton) {
            voiceButton.classList.remove('voice-recording');
            voiceButton.innerHTML = '<i class="ti ti-microphone"></i>';
            voiceButton.title = 'Голосовой ввод';
        }
        if (voiceLevel) {
            voiceLevel.style.display = 'none';
        }
        this.stopVoiceVisualization();
    }

    async startVoiceVisualization() {
        const voiceLevel = document.getElementById('voiceLevel');
        if (!voiceLevel || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }, 
                video: false 
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
            microphone.connect(this.analyser);
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Троттлим обновление визуализации для лучшей производительности
            const throttledUpdate = throttle(() => {
                if (!this.isRecording) return;
                
                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const level = Math.min(average / 128, 1);
                
                voiceLevel.style.width = `${level * 100}%`;
            }, 50);
            
            const updateVoiceLevel = () => {
                if (!this.isRecording) return;
                throttledUpdate();
                requestAnimationFrame(updateVoiceLevel);
            };
            
            updateVoiceLevel();
        } catch (err) {
            console.error('Ошибка визуализации голоса:', err);
        }
    }

    stopVoiceVisualization() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(console.error);
            this.audioContext = null;
        }
        this.analyser = null;
    }
}
