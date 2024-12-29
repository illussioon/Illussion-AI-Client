class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 70;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initParticles();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 2,
                speedX: Math.random() * 1.5 - 0.75,
                speedY: Math.random() * 1.5 - 0.75,
                opacity: Math.random() * 0.7 + 0.3
            });
        }
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(175, 155, 255, ${particle.opacity})`;
        this.ctx.fill();
    }
    
    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Возвращаем частицу в пределы экрана
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
        
        // Рисуем линии между близкими частицами
        this.particles.forEach(p2 => {
            const dx = particle.x - p2.x;
            const dy = particle.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(175, 155, 255, ${0.15 * (1 - distance/150)})`;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

class AIChat {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.userInput = document.getElementById('user-input');
        this.submitButton = this.chatForm.querySelector('button');
        this.isWaitingResponse = false;
        
        this.userAvatar = `
            <div class="avatar">
                <svg viewBox="0 0 24 24" fill="rgb(142 129 199)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>`;
            
        this.aiAvatar = `
            <div class="avatar">
                <svg viewBox="0 0 24 24" fill="rgb(110 89 165)">
                    <path d="M13.5 2c-5.629 0-10.212 4.436-10.475 10h-3.025l4.537 5.917 4.463-5.917h-3.025c.26-3.902 3.508-7 7.525-7 4.178 0 7.573 3.393 7.573 7.571 0 4.178-3.395 7.571-7.573 7.571-2.339 0-4.437-1.060-5.844-2.727l-2.242 2.242c1.997 1.996 4.751 3.232 7.789 3.232 6.081 0 11.027-4.946 11.027-11.027s-4.946-11.027-11.027-11.027z"/>
                    <path d="M15.414 11h-3.414v-3.414l-4.414 4.414 4.414 4.414v-3.414h3.414l4.414-4.414z"/>
                </svg>
            </div>`;
        
        // Настройка marked
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            },
            breaks: true,
            gfm: true
        });
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = this.userInput.value.trim();
            if (message && !this.isWaitingResponse) {
                await this.sendMessage(message);
                this.userInput.value = '';
            }
        });
    }

    addMessageToChat(message, isUser = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-container ${isUser ? 'user-message' : 'ai-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Добавляем аватар
        messageContent.innerHTML = isUser ? this.userAvatar : this.aiAvatar;
        
        const messageText = document.createElement('div');
        messageText.className = `glass-effect rounded-lg p-3 ${
            isUser ? 'bg-[rgba(155,135,245,0.1)]' : 'bg-[rgba(255,255,255,0.05)]'
        }`;
        
        messageText.innerHTML = `
            <div class="text-sm text-[rgb(155,135,245)] mb-1">${isUser ? 'You' : 'Illussion Neiro'}</div>
            <div class="markdown-content">
                ${isUser ? message : marked.parse(message)}
            </div>
        `;
        
        if (!isUser) {
            messageText.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message-container ai-message';
        indicatorDiv.id = 'typing-indicator';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.aiAvatar;
        
        const indicator = document.createElement('div');
        indicator.className = 'glass-effect rounded-lg p-3';
        
        indicator.innerHTML = `
            <div class="text-sm text-[rgb(155,135,245)] mb-1">Illussion Neiro</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messageContent.appendChild(indicator);
        indicatorDiv.appendChild(messageContent);
        this.chatMessages.appendChild(indicatorDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    setInputState(disabled) {
        this.isWaitingResponse = disabled;
        this.userInput.disabled = disabled;
        this.submitButton.disabled = disabled;
        
        // Визуальная обратная связь
        if (disabled) {
            this.submitButton.classList.add('opacity-50');
            this.userInput.classList.add('opacity-50');
        } else {
            this.submitButton.classList.remove('opacity-50');
            this.userInput.classList.remove('opacity-50');
        }
    }

    async sendMessage(message) {
        // Блокируем ввод
        this.setInputState(true);
        
        // Показываем сообщение пользователя
        this.addMessageToChat(message, true);
        
        // Показываем индикатор набора текста
        this.addTypingIndicator();

        try {
            const response = await fetch('https://api.illussion.art/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // Удаляем индикатор абора текста
            this.removeTypingIndicator();
            
            if (!response.ok) {
                throw new Error(data.reply || 'Произошла ошибка при получении ответа');
            }
            
            // Показываем ответ AI
            this.addMessageToChat(data.reply, false);
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessageToChat('Извините, произошла ошибка. Попробуйте позже.', false);
        } finally {
            // Разблокируем ввод
            this.setInputState(false);
        }
    }
}

// Инициализация чата и системы частиц
const chat = new AIChat();
const particles = new ParticleSystem(); 

function createEditor() {
    const editor = document.createElement('textarea');
    editor.style.width = '100%';
    editor.style.height = '300px';
    editor.value = markdown;
    
    editor.addEventListener('input', function() {
        document.getElementById('content').innerHTML = marked.parse(this.value);
        hljs.highlightAll();
    });
    
    document.body.insertBefore(editor, document.getElementById('content'));
}

// Вызовите функцию для создания редактора
createEditor(); 