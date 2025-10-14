# Развертывание Khuyew AI

## Быстрый старт

Khuyew AI - это статическое веб-приложение, которое можно развернуть на любом веб-сервере.

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Khuyew/khuyew-ai.git
cd khuyew-ai
```

2. Откройте `index.html` в браузере или запустите локальный сервер:
```bash
# Python 3
python -m http.server 8000

# Node.js (если установлен http-server)
npx http-server

# PHP
php -S localhost:8000
```

3. Откройте http://localhost:8000 в браузере

### Развертывание на хостинге

#### GitHub Pages
1. Форкните репозиторий
2. Перейдите в Settings → Pages
3. Выберите source: Deploy from a branch
4. Выберите ветку main
5. Ваш сайт будет доступен по адресу: `https://username.github.io/khuyew-ai`

#### Netlify
1. Подключите GitHub репозиторий к Netlify
2. Build command: оставьте пустым
3. Publish directory: `/` (корневая папка)
4. Деплой произойдет автоматически

#### Vercel
1. Импортируйте проект из GitHub
2. Framework Preset: Other
3. Root Directory: `/`
4. Build Command: оставьте пустым
5. Output Directory: оставьте пустым

#### Обычный веб-хостинг
1. Загрузите все файлы в корневую папку сайта
2. Убедитесь, что `index.html` находится в корне
3. Настройте HTTPS (рекомендуется для Web Speech API)

## Настройка

### Переменные окружения
Приложение не требует переменных окружения, но вы можете настроить:

- **Puter AI API**: Используется внешний сервис, настройка не требуется
- **Аналитика**: Добавьте Google Analytics или другие сервисы в `index.html`

### Кастомизация
- Измените цвета в `css/style.css` (CSS переменные в `:root`)
- Настройте логотип и название в `index.html`
- Добавьте свои иконки в папку `/icons` (если нужно)

## Требования

### Браузерная поддержка
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### HTTPS
Для работы голосового ввода требуется HTTPS соединение. Большинство хостингов предоставляют бесплатные SSL сертификаты.

### API ключи
- **Puter AI**: Не требуется, используется публичное API
- **Web Speech API**: Встроен в браузер

## Мониторинг

### Логирование
Включите debug режим в консоли браузера:
```javascript
localStorage.setItem('khuyew-debug', 'true');
```

### Аналитика
Добавьте в `<head>` секцию `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Безопасность

### CSP (Content Security Policy)
Рекомендуемые заголовки для веб-сервера:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.puter.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://api.puter.com;
```

### Заголовки безопасности
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: microphone=(self), camera=(), geolocation=()
```

## Производительность

### Кэширование
Настройте кэширование статических файлов:
```
# .htaccess для Apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
</IfModule>
```

### CDN
Рассмотрите использование CDN для статических ресурсов:
- Cloudflare (бесплатный план)
- AWS CloudFront
- Google Cloud CDN

## Обновления

### Автоматические обновления
При использовании GitHub Pages, Netlify или Vercel обновления происходят автоматически при push в main ветку.

### Ручные обновления
1. Скачайте новую версию
2. Замените файлы на сервере
3. Очистите кэш браузера (Ctrl+F5)

## Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на ошибки
2. Убедитесь в наличии HTTPS
3. Проверьте совместимость браузера
4. Создайте issue в GitHub репозитории