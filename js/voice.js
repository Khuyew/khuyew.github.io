// Голосовой ввод
class VoiceRecognition {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.audioContext = null;
        this.analyser = null;
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'ru-RU';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.setupEventListeners();
        } else {
            document.getElementById('voiceButton').style.display = 'none';
        }
    }

    setupEventListeners() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceLevel = document.getElementById('voiceLevel');
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            voiceButton.classList.add('voice-recording');
            voiceButton.innerHTML = '🔴 Стоп';
            voiceLevel.style.display = 'block';
            this.startVoiceVisualization();
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            document.getElementById('user-input').focus();
        };
        
        this.recognition.onerror = (event) => {
            console.error('Ошибка распознавания голоса:', event.error);
            this.stop();
            
            if (event.error === 'not-allowed') {
                addMessage(document.getElementById('messagesContainer'), 
                    'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.', false, true);
            } else if (event.error === 'no-speech') {
                addMessage(document.getElementById('messagesContainer'), 
                    'Речь не распознана. Попробуйте еще раз.', false, true);
            }
        };
        
        this.recognition.onend = () => {
            this.stop();
        };
        
        voiceButton.addEventListener('click', () => {
            if (!this.isRecording) {
                this.start();
            } else {
                this.stop();
            }
        });
    }

    start() {
        const voiceButton = document.getElementById('voiceButton');
        try {
            this.recognition.start();
            voiceButton.disabled = true;
            setTimeout(() => {
                voiceButton.disabled = false;
            }, 1000);
        } catch (error) {
            console.error('Ошибка запуска распознавания:', error);
            voiceButton.disabled = false;
        }
    }

    stop() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceLevel = document.getElementById('voiceLevel');
        
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        this.isRecording = false;
        voiceButton.classList.remove('voice-recording');
        voiceButton.innerHTML = '🎤 Голос';
        voiceLevel.style.display = 'none';
        this.stopVoiceVisualization();
    }

    startVoiceVisualization() {
        const voiceLevel = document.getElementById('voiceLevel');
        if (!navigator.mediaDevices) return;
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                const microphone = this.audioContext.createMediaStreamSource(stream);
                microphone.connect(this.analyser);
                this.analyser.fftSize = 256;
                
                const bufferLength = this.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                const updateVoiceLevel = () => {
                    if (!this.isRecording) return;
                    
                    this.analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    const level = Math.min(average / 128, 1);
                    
                    voiceLevel.style.width = `${level * 100}%`;
                    requestAnimationFrame(updateVoiceLevel);
                };
                
                updateVoiceLevel();
            })
            .catch(err => {
                console.error('Ошибка доступа к микрофону:', err);
            });
    }

    stopVoiceVisualization() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
