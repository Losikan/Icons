"use strict";

const CONFIG = {
    canvas: {
        width: 1000,
        height: 600
    },
    assets: {
        characters: {
            0: 'gameAssets/characters/character0.png',
            1: 'gameAssets/characters/character1.png',
            2: 'gameAssets/characters/character2.png',
            3: 'gameAssets/characters/character3.png'
        },
        bullets: {
            0: 'gameAssets/objects/bullet0.png',
            1: 'gameAssets/objects/bullet1.png',
            2: 'gameAssets/objects/bullet2.png',
            3: 'gameAssets/objects/bullet3.png'
        },
        emotes: {
            0: 'gameAssets/emotes/emote0.png',
            1: 'gameAssets/emotes/emote1.png',
            2: 'gameAssets/emotes/emote2.png',
            3: 'gameAssets/emotes/emote3.png'
        },
        enemies: {
            enemy1: 'gameAssets/enemies/enemy1.png',
            enemy2: 'gameAssets/enemies/enemy2.png',
            enemy3: 'gameAssets/enemies/enemy3.png'
        },
        map: 'gameAssets/objects/map.png',
        gameOver: 'gameAssets/objects/gameOver.png',
        health: 'gameAssets/objects/health.png'
    },
    character: {
        speeds: [1, 1.5, 2, 2.5],
        frameDelay: 100,
        scale: 1,
        bulletSpeed: 15,
        fireRates: [1000, 800, 500, 300],
        bulletDamages: [20, 25, 33.33, 100],
        collision: 32
    },
    enemies: {
        speed: 0.3,
        frameDelay: 100,
        scale: 1.5,
        spawnRate: 2000,
        spawnChances: {
            enemy1: 60,   
            enemy2: 30, 
            enemy3: 10 
        },
        maxCount: 10,
        health: 100
    },
    map: {
        width: 1000,
        height: 600
    }
};

const CHARACTER_ANIMATIONS = {
    runDown: { row: 0, frames: [0, 1, 2, 3] },
    runLeft: { row: 1, frames: [0, 1, 2, 3] },
    runRight: { row: 2, frames: [0, 1, 2, 3] },
    runUp: { row: 3, frames: [0, 1, 2, 3] }
};

const ENEMY_ANIMATIONS = {
    runDown: { row: 0, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
    runUp: { row: 1, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
    runLeft: { row: 2, frames: [0, 1, 2, 3, 4, 5, 6, 7] },
    runRight: { row: 3, frames: [0, 1, 2, 3, 4, 5, 6, 7] }
};

class Character {
    constructor(spriteSheet, characterIndex) {
        this.spriteSheet = spriteSheet;
        this.characterIndex = characterIndex;
        this.reset();
    }

    reset() {
        this.x = CONFIG.canvas.width / 2;
        this.y = CONFIG.canvas.height / 2;
        this.speed = CONFIG.character.speeds[this.characterIndex];
        this.currentAnim = 'runDown';
        this.currentFrame = 0;
        this.lastUpdate = Date.now();
        this.lastShot = 0;
        this.lastEmote = 0;
    }

    updateAnimation() {
        if (Date.now() - this.lastUpdate > CONFIG.character.frameDelay) {
            const anim = CHARACTER_ANIMATIONS[this.currentAnim];
            this.currentFrame = (this.currentFrame + 1) % anim.frames.length;
            this.lastUpdate = Date.now();
        }
    }

    draw(ctx) {
        if (!this.spriteSheet.complete) return;
        
        const anim = CHARACTER_ANIMATIONS[this.currentAnim];
        const frameIndex = anim.frames[this.currentFrame];
        const scale = CONFIG.character.scale;
        const frameSize = 72;
        
        ctx.drawImage(
            this.spriteSheet,
            frameIndex * frameSize,
            anim.row * frameSize,
            frameSize,
            frameSize,
            this.x - (frameSize * scale)/2,
            this.y - (frameSize * scale)/2,
            frameSize * scale,
            frameSize * scale
        );
    }
}

class Bullet {
    constructor(x, y, targetX, targetY, image, damage) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.damage = damage;
        const dx = targetX - x;
        const dy = targetY - y;
        this.speed = CONFIG.character.bulletSpeed;
        this.angle = Math.atan2(dy, dx);
        this.lifespan = 1000;
        this.spawnTime = Date.now();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifespan;
    }
}

class Emote {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.lifespan = 500;
        this.spawnTime = Date.now();
    }

    update() {
        this.y -= 2;
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifespan;
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = CONFIG.enemies.speed;
        this.currentAnim = 'runDown';
        this.currentFrame = 0;
        this.lastUpdate = Date.now();
        this.health = CONFIG.enemies.health;
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        if (Math.abs(dx) > Math.abs(dy)) {
            this.currentAnim = dx > 0 ? 'runRight' : 'runLeft';
        } else {
            this.currentAnim = dy > 0 ? 'runDown' : 'runUp';
        }
    }

    updateAnimation() {
        if (Date.now() - this.lastUpdate > CONFIG.enemies.frameDelay) {
            const anim = ENEMY_ANIMATIONS[this.currentAnim];
            this.currentFrame = (this.currentFrame + 1) % anim.frames.length;
            this.lastUpdate = Date.now();
        }
    }

    draw(ctx, game) {
        const spriteSheet = game.enemySprites[this.type];
        if (!spriteSheet?.complete) return;

        const anim = ENEMY_ANIMATIONS[this.currentAnim];
        const frameIndex = anim.frames[this.currentFrame];
        const scale = CONFIG.enemies.scale;
        const scaledSize = 64 * scale;

        ctx.drawImage(
            spriteSheet,
            frameIndex * 64,
            anim.row * 64,
            64, 64,
            this.x - scaledSize/2,
            this.y - scaledSize/2,
            scaledSize, scaledSize
        );
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.loadout = { character: 0, weapon: 0, emote: 0 };
        this.enemies = [];
        this.bullets = [];
        this.emotes = [];
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.gameOver = false;
        this.gameOverImage = new Image();
        this.healthImage = new Image();
        this.health = 0;
        this.lastHitTime = 0;
        this.initLoadout();
    }

    getMaxHealth() {
        switch (this.loadout.character) {
            case 0: return 1;
            case 1: return 2;
            case 2: return 4;
            case 3: return 7;
            default: return 1;
        }
    }

        initLoadout() {
        
        document.querySelectorAll('.loadout-box').forEach(box => {
            const type = box.dataset.type;
            const initialValue = this.loadout[type];
            
           
            const selectedOption = box.querySelector(`.option-item[data-value="${initialValue}"]`);
            
            
            const selectorDisplay = document.createElement('div');
            selectorDisplay.className = 'selector-display';
            selectorDisplay.innerHTML = selectedOption.innerHTML;
            
            
            const dropdown = document.createElement('div');
            dropdown.className = 'selector-dropdown hidden';
            
            
            box.querySelectorAll('.option-item').forEach(item => {
                const clone = item.cloneNode(true);
                clone.addEventListener('click', (e) => {
                    this.handleOptionSelect(e.target.closest('.option-item'), box);
                });
                dropdown.appendChild(clone);
            });
            
            
            selectorDisplay.addEventListener('click', () => {
                dropdown.classList.toggle('hidden');
                box.querySelector('.options').classList.add('hidden'); // Hide the original options
            });
            
            
            box.appendChild(selectorDisplay);
            box.appendChild(dropdown);
            
            
            box.querySelector('.options').classList.add('hidden');
        });

        document.addEventListener('keypress', (e) => {
            if (e.code === 'Enter') {
                document.getElementById('loadoutScreen').style.display = 'none';
                this.canvas.style.display = 'block';
                this.startGame();
            }
        });
    }

    handleOptionSelect(item, box) {
          if (item.classList.contains('locked')) {
            console.log("Character is locked!");
            return;
            }
        
            const type = box.dataset.type;
            const value = item.dataset.value;
            this.loadout[type] = parseInt(value);
        
        
        const selectorDisplay = box.querySelector('.selector-display');
        selectorDisplay.innerHTML = item.innerHTML;
        
        
        box.querySelector('.selector-dropdown').classList.add('hidden');
        
       
        box.querySelectorAll('.option-item').forEach(i => 
            i.classList.remove('selected'));
        
       
        item.classList.add('selected');
    }

    async startGame() {
        try {
            await this.loadAssets();
            this.setupCanvas();
            this.setupEventListeners();
            this.spawnEnemies();
            this.health = this.getMaxHealth();

            this.canvas.style.display = 'block';
            this.canvas.style.border = '3px solid #4ecdc4';
            this.canvas.style.borderRadius = '15px';
            this.canvas.style.boxShadow = '0 0 50px rgba(78, 205, 196, 0.2)';

            this.gameLoop();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    setupCanvas() {
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        this.canvas.style.display = 'none';
    }

    setupEventListeners() {
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        window.addEventListener('keypress', e => {
            if (e.code === 'Space') this.shoot();
            if (e.code === 'KeyE') this.playEmote();
        });
    }

    loadAssets() {
        return new Promise((resolve, reject) => {
            const assets = [
                this.characterSheet = new Image(),
                this.mapImage = new Image(),
                this.gameOverImage,
                this.healthImage,
                ...(this.bulletImages = Array(4).fill().map(() => new Image())),
                ...(this.emoteImages = Array(4).fill().map(() => new Image())),
                ...Object.values(this.enemySprites = {
                    enemy1: new Image(),
                    enemy2: new Image(),
                    enemy3: new Image()
                })
            ];

            let loaded = 0;
            const totalAssets = assets.length;
            
            const checkLoaded = () => {
                if (++loaded === totalAssets) {
                    this.character = new Character(this.characterSheet, this.loadout.character);
                    resolve();
                }
            };

            assets.forEach(img => {
                img.onload = checkLoaded;
                img.onerror = () => reject(`Failed to load ${img.src}`);
            });

            this.characterSheet.src = CONFIG.assets.characters[this.loadout.character];
            this.mapImage.src = CONFIG.assets.map;
            this.gameOverImage.src = CONFIG.assets.gameOver;
            this.healthImage.src = CONFIG.assets.health;
            this.bulletImages.forEach((img, i) => img.src = CONFIG.assets.bullets[i]);
            this.emoteImages.forEach((img, i) => img.src = CONFIG.assets.emotes[i]);
            this.enemySprites.enemy1.src = CONFIG.assets.enemies.enemy1;
            this.enemySprites.enemy2.src = CONFIG.assets.enemies.enemy2;
            this.enemySprites.enemy3.src = CONFIG.assets.enemies.enemy3;
        });
    }

    spawnEnemies() {
        this.enemyInterval = setInterval(() => {
            if (this.enemies.length >= CONFIG.enemies.maxCount) return;

            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
                case 0: x = Math.random() * this.canvas.width; y = -50; break;
                case 1: x = this.canvas.width + 50; y = Math.random() * this.canvas.height; break;
                case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 50; break;
                case 3: x = -50; y = Math.random() * this.canvas.height; break;
            }

            const total = Object.values(CONFIG.enemies.spawnChances).reduce((a,b) => a+b);
            let random = Math.random() * total;
            let current = 0;
            let type;

            for (const [key, value] of Object.entries(CONFIG.enemies.spawnChances)) {
                current += value;
                if (random <= current) {
                    type = key;
                    break;
                }
            }
            
            this.enemies.push(new Enemy(x, y, type));
        }, CONFIG.enemies.spawnRate);
    }

    shoot() {
        const fireRate = CONFIG.character.fireRates[this.loadout.weapon];
        if (Date.now() - this.character.lastShot < fireRate) return;
        
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const distance = Math.hypot(
                enemy.x - this.character.x,
                enemy.y - this.character.y
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy) {
            this.bullets.push(new Bullet(
                this.character.x,
                this.character.y,
                nearestEnemy.x,
                nearestEnemy.y,
                this.bulletImages[this.loadout.weapon],
                CONFIG.character.bulletDamages[this.loadout.weapon]
            ));
            this.character.lastShot = Date.now();
        }
    }

    playEmote() {
        if (Date.now() - this.character.lastEmote < 1000) return;
        
        this.emotes.push(new Emote(
            this.character.x,
            this.character.y - 50,
            this.emoteImages[this.loadout.emote]
        ));
        this.character.lastEmote = Date.now();
    }

    handleMovement() {
        const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = this.keys;
        const isMoving = ArrowUp || ArrowDown || ArrowLeft || ArrowRight;

        if (isMoving) {
            if (ArrowDown) this.character.y += this.character.speed;
            if (ArrowUp) this.character.y -= this.character.speed;
            if (ArrowRight) this.character.x += this.character.speed;
            if (ArrowLeft) this.character.x -= this.character.speed;
        }

        const charWidth = 72 * CONFIG.character.scale;
        const charHeight = 72 * CONFIG.character.scale;
        this.character.x = Math.max(charWidth/2, Math.min(CONFIG.canvas.width - charWidth/2, this.character.x));
        this.character.y = Math.max(charHeight/2, Math.min(CONFIG.canvas.height - charHeight/2, this.character.y));

        if (isMoving) {
            if (ArrowDown) this.character.currentAnim = 'runDown';
            if (ArrowUp) this.character.currentAnim = 'runUp';
            if (ArrowRight) this.character.currentAnim = 'runRight';
            if (ArrowLeft) this.character.currentAnim = 'runLeft';
        } else {
            this.character.currentAnim = 'runDown';
        }
    }

    checkCollisions() {
        this.bullets = this.bullets.filter(bullet => {
            if (bullet.isExpired()) return false;
            
            let bulletHit = false;
            
            this.enemies = this.enemies.filter(enemy => {
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 30) {
                    enemy.health -= bullet.damage;
                    bulletHit = true;
                    
                    if (enemy.health <= 0) {
                        this.score += 10;
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                            localStorage.setItem('highScore', this.highScore);
                        }
                        return false;
                    }
                }
                return true;
            });
            
            return !bulletHit;
        });
    }

    checkPlayerCollisions() {
        if (this.gameOver) return;

        const now = Date.now();
        if (now - this.lastHitTime < 1000) return;

        const player = this.character;
        
        for (const enemy of this.enemies) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                this.health -= 1;
                this.lastHitTime = now;
                if (this.health <= 0) {
                    this.showGameOver();
                }
                break;
            }
        }
    }

    drawHearts() {
        const heartSize = 32;
        const padding = 5;
        let x = this.canvas.width - padding - heartSize;
        const y = 10;

        for (let i = 0; i < this.health; i++) {
            this.ctx.drawImage(this.healthImage, x, y, heartSize, heartSize);
            x -= (heartSize + padding);
        }
    }

    showGameOver() {
        this.gameOver = true;
        clearInterval(this.enemyInterval);
        
        this.ctx.drawImage(
            this.gameOverImage,
            0, 
            0, 
            this.canvas.width,  
            this.canvas.height  
        );

        document.addEventListener('keypress', (e) => {
            if (e.code === 'Enter') {
                location.reload(); 
            }
        }, { once: true });
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameOver) {
            if (this.mapImage.complete) {
                this.ctx.drawImage(this.mapImage, 0, 0);
            }

            this.handleMovement();
            this.checkCollisions();
            this.checkPlayerCollisions();
            
            if (this.character) {
                this.character.updateAnimation();
                this.character.draw(this.ctx);
            }

            this.enemies.forEach(enemy => {
                enemy.update(this.character.x, this.character.y);
                enemy.updateAnimation();
                enemy.draw(this.ctx, this);
            });

            this.bullets.forEach(bullet => {
                bullet.update();
                if (bullet.image?.complete) {
                    this.ctx.drawImage(
                        bullet.image,
                        bullet.x - 16,
                        bullet.y - 16,
                        32,
                        32
                    );
                }
            });

            this.emotes.forEach((emote, index) => {
                emote.update();
                if (emote.image?.complete) {
                    this.ctx.drawImage(
                        emote.image,
                        emote.x - 16,
                        emote.y - 16,
                        32,
                        32
                    );
                }
                if (emote.isExpired()) {
                    this.emotes.splice(index, 1);
                }
            });

            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
            this.ctx.fillText(`High Score: ${this.highScore}`, 10, 60);

            if (this.healthImage.complete) {
                this.drawHearts();
            }
        } else {
            this.ctx.drawImage(
                this.gameOverImage,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('DOMContentLoaded', () => new Game());