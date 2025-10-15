import Utils from './utils.js';

class ImageManager {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.imageUploadBtn = document.getElementById('imageUploadBtn');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.imagePreview = document.getElementById('imagePreview');
        this.imagePreviewContainer = document.getElementById('imagePreviewContainer');
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalCaption = document.getElementById('modalCaption');
        this.modalClose = document.getElementById('modalClose');
        
        this.currentImage = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.imageUploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.removeImageBtn.addEventListener('click', () => this.clearImage());
        
        // Modal events
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.hidden) {
                this.closeModal();
            }
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            Utils.isValidImage(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentImage = e.target.result;
                this.showImagePreview(this.currentImage);
                Utils.showNotification('Изображение загружено', 'success');
            };
            
            reader.onerror = () => {
                throw new Error('Ошибка при чтении файла');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            Utils.showNotification(error.message, 'error');
            this.clearImage();
        }
        
        // Reset file input
        event.target.value = '';
    }

    showImagePreview(imageData) {
        this.imagePreview.src = imageData;
        this.imagePreviewContainer.hidden = false;
        
        // Scroll to preview
        setTimeout(() => {
            this.imagePreviewContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    clearImage() {
        this.currentImage = null;
        this.imagePreview.src = '';
        this.imagePreviewContainer.hidden = true;
        this.fileInput.value = '';
    }

    getCurrentImage() {
        return this.currentImage;
    }

    openModal(imageUrl, caption = '') {
        this.modalImage.src = imageUrl;
        this.modalCaption.textContent = caption || 'Сгенерированное изображение';
        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.hidden = true;
        document.body.style.overflow = '';
    }

    async downloadImage(imageUrl, filename = 'khuyew-ai-image.png') {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);
            Utils.showNotification('Изображение сохранено', 'success');
            
        } catch (error) {
            console.error('Error downloading image:', error);
            Utils.showNotification('Ошибка при сохранении изображения', 'error');
        }
    }

    async compressImage(imageData, maxWidth = 1024, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = imageData;
        });
    }
}

export default ImageManager;
