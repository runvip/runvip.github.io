document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    // --- Игровые объекты ---

    const player = {
        x: CANVAS_WIDTH / 2 - 20,
        y: CANVAS_HEIGHT - 60,
        width: 40,
        height: 40,
        color: 'yellow',
        speed: 3,
        dx: 0,
        dy: 0,
        direction: 0, // 0:вверх, 1:вправо, 2:вниз, 3:влево
        canShoot: true,
        fireCooldown: 300,
        lives: 3, // Добавляем жизни игрока
        score: 0, // Добавляем очки игрока

        draw: function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'gray'; // Пушка

            switch (this.direction) {
                case 0: // Вверх
                    ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 15);
                    break;
                case 1: // Вправо
                    ctx.fillRect(this.x + this.width, this.y + this.height / 2 - 5, 15, 10);
                    break;
                case 2: // Вниз
                    ctx.fillRect(this.x + this.width / 2 - 5, this.y + this.height - 5, 10, 15);
                    break;
                case 3: // Влево
                    ctx.fillRect(this.x - 10, this.y + this.height / 2 - 5, 15, 10);
                    break;
            }
        },
        update: function () {
            const prevX = this.x;
            const prevY = this.y;

            this.x += this.dx;
            this.y += this.dy;

            // Ограничиваем движение танка пределами канваса
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - this.height;

            // Проверка коллизий с стенами после движения
            for (const wall of walls) {
                if (checkCollision(this, wall)) {
                    this.x = prevX;
                    this.y = prevY;
                    break;
                }
            }
        },
        shoot: function () {
            if (this.canShoot) {
                let bulletX, bulletY, bulletDx, bulletDy;
                const bulletSize = 6;
                const bulletSpeed = 7;

                switch (this.direction) {
                    case 0: // Вверх
                        bulletX = this.x + this.width / 2 - bulletSize / 2;
                        bulletY = this.y - bulletSize;
                        bulletDx = 0;
                        bulletDy = -bulletSpeed;
                        break;
                    case 1: // Вправо
                        bulletX = this.x + this.width;
                        bulletY = this.y + this.height / 2 - bulletSize / 2;
                        bulletDx = bulletSpeed;
                        bulletDy = 0;
                        break;
                    case 2: // Вниз
                        bulletX = this.x + this.width / 2 - bulletSize / 2;
                        bulletY = this.y + this.height;
                        bulletDx = 0;
                        bulletDy = bulletSpeed;
                        break;
                    case 3: // Влево
                        bulletX = this.x - bulletSize;
                        bulletY = this.y + this.height / 2 - bulletSize / 2;
                        bulletDx = -bulletSpeed;
                        bulletDy = 0;
                        break;
                }

                bullets.push({
                    x: bulletX,
                    y: bulletY,
                    width: bulletSize,
                    height: bulletSize,
                    dx: bulletDx,
                    dy: bulletDy,
                    color: 'red',
                    isPlayerBullet: true, // Флаг, чтобы отличать пули игрока
                    draw: function () {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    },
                    update: function () {
                        this.x += this.dx;
                        this.y += this.dy;
                    },
                    isOffScreen: function () {
                        return this.x < -this.width || this.x > CANVAS_WIDTH ||
                            this.y < -this.height || this.y > CANVAS_HEIGHT;
                    }
                });

                this.canShoot = false;
                setTimeout(() => {
                    this.canShoot = true;
                }, this.fireCooldown);
            }
        }
    };

    const bullets = [];

    const walls = [
        { x: 100, y: 100, width: 80, height: 20, color: 'brown', indestructible: false },
        { x: 200, y: 100, width: 20, height: 80, color: 'brown', indestructible: false },
        { x: 400, y: 200, width: 100, height: 20, color: 'gray', indestructible: true },
        { x: 50, y: 250, width: 20, height: 50, color: 'brown', indestructible: false },
        { x: 500, y: 300, width: 50, height: 50, color: 'brown', indestructible: false }
    ];

    // --- Вражеские танки ---
    const enemies = [];
    const maxEnemies = 3; // Максимальное количество врагов на поле одновременно
    let enemiesDestroyed = 0; // Счетчик уничтоженных врагов

    // Функция для создания нового вражеского танка
    function createEnemy() {
        const enemy = {
            x: Math.random() * (CANVAS_WIDTH - 40), // Случайная позиция
            y: Math.random() * (CANVAS_HEIGHT / 2 - 40), // В верхней половине экрана
            width: 40,
            height: 40,
            color: 'green',
            speed: 1.5,
            dx: 0,
            dy: 0,
            direction: Math.floor(Math.random() * 4), // Случайное начальное направление
            canShoot: true,
            fireCooldown: 1000 + Math.random() * 1000, // Случайная задержка стрельбы 1-2 секунды
            moveTimer: 0, // Таймер для изменения направления движения
            moveInterval: 1000 + Math.random() * 2000, // Интервал изменения направления 1-3 секунды

            draw: function () {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = 'darkgreen'; // Пушка
                switch (this.direction) {
                    case 0: ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 15); break;
                    case 1: ctx.fillRect(this.x + this.width, this.y + this.height / 2 - 5, 15, 10); break;
                    case 2: ctx.fillRect(this.x + this.width / 2 - 5, this.y + this.height - 5, 10, 15); break;
                    case 3: ctx.fillRect(this.x - 10, this.y + this.height / 2 - 5, 15, 10); break;
                }
            },
            update: function (deltaTime) {
                const prevX = this.x;
                const prevY = this.y;

                // Обновление таймера движения и изменение направления
                this.moveTimer += deltaTime;
                if (this.moveTimer >= this.moveInterval) {
                    this.direction = Math.floor(Math.random() * 4); // Случайное новое направление
                    this.moveTimer = 0;
                    this.moveInterval = 1000 + Math.random() * 2000; // Новый интервал
                }

                // Установка dx/dy в зависимости от направления
                this.dx = 0;
                this.dy = 0;
                switch (this.direction) {
                    case 0: this.dy = -this.speed; break; // Вверх
                    case 1: this.dx = this.speed; break;  // Вправо
                    case 2: this.dy = this.speed; break;  // Вниз
                    case 3: this.dx = -this.speed; break; // Влево
                }

                this.x += this.dx;
                this.y += this.dy;

                // Ограничиваем движение пределами канваса
                if (this.x < 0) { this.x = 0; this.direction = Math.floor(Math.random() * 4); } // Отскок
                if (this.x + this.width > CANVAS_WIDTH) { this.x = CANVAS_WIDTH - this.width; this.direction = Math.floor(Math.random() * 4); }
                if (this.y < 0) { this.y = 0; this.direction = Math.floor(Math.random() * 4); }
                if (this.y + this.height > CANVAS_HEIGHT) { this.y = CANVAS_HEIGHT - this.height; this.direction = Math.floor(Math.random() * 4); }


                // Проверка коллизий с стенами (враги тоже не проходят сквозь стены)
                for (const wall of walls) {
                    if (checkCollision(this, wall)) {
                        this.x = prevX;
                        this.y = prevY;
                        this.direction = Math.floor(Math.random() * 4); // Меняем направление при столкновении
                        break;
                    }
                }
            },
            shoot: function () {
                if (this.canShoot) {
                    let bulletX, bulletY, bulletDx, bulletDy;
                    const bulletSize = 6;
                    const bulletSpeed = 5; // Скорость пули врага

                    switch (this.direction) {
                        case 0: bulletX = this.x + this.width / 2 - bulletSize / 2; bulletY = this.y - bulletSize; bulletDx = 0; bulletDy = -bulletSpeed; break;
                        case 1: bulletX = this.x + this.width; bulletY = this.y + this.height / 2 - bulletSize / 2; bulletDx = bulletSpeed; bulletDy = 0; break;
                        case 2: bulletX = this.x + this.width / 2 - bulletSize / 2; bulletY = this.y + this.height; bulletDx = 0; bulletDy = bulletSpeed; break;
                        case 3: bulletX = this.x - bulletSize; bulletY = this.y + this.height / 2 - bulletSize / 2; bulletDx = -bulletSpeed; bulletDy = 0; break;
                    }

                    bullets.push({
                        x: bulletX,
                        y: bulletY,
                        width: bulletSize,
                        height: bulletSize,
                        dx: bulletDx,
                        dy: bulletDy,
                        color: 'orange', // Пули врагов другого цвета
                        isPlayerBullet: false, // Флаг, чтобы отличать пули врагов
                        draw: function () {
                            ctx.fillStyle = this.color;
                            ctx.fillRect(this.x, this.y, this.width, this.height);
                        },
                        update: function () {
                            this.x += this.dx;
                            this.y += this.dy;
                        },
                        isOffScreen: function () {
                            return this.x < -this.width || this.x > CANVAS_WIDTH ||
                                this.y < -this.height || this.y > CANVAS_HEIGHT;
                        }
                    });

                    this.canShoot = false;
                    setTimeout(() => {
                        this.canShoot = true;
                    }, this.fireCooldown);
                }
            }
        };
        return enemy;
    }

    // --- Функции для коллизий ---
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    // --- Управление (без изменений) ---
    const keys = {};

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');

    function setupTouchControls() {
        const touchStartHandler = (e, keyCode) => {
            e.preventDefault();
            keys[keyCode] = true;
        };

        const touchEndHandler = (e, keyCode) => {
            e.preventDefault();
            keys[keyCode] = false;
        };

        btnUp.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowUp'));
        btnUp.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowUp'));
        btnDown.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowDown'));
        btnDown.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowDown'));
        btnLeft.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowLeft'));
        btnLeft.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowLeft'));
        btnRight.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowRight'));
        btnRight.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowRight'));

        btnFire.addEventListener('touchstart', (e) => touchStartHandler(e, 'Space'));
        btnFire.addEventListener('touchend', (e) => touchEndHandler(e, 'Space'));
    }

    setupTouchControls();

    function handlePlayerMovement() {
        player.dx = 0;
        player.dy = 0;

        if (keys['ArrowUp'] || keys['KeyW']) {
            player.dy = -player.speed;
            player.direction = 0;
        } else if (keys['ArrowDown'] || keys['KeyS']) {
            player.dy = player.speed;
            player.direction = 2;
        } else if (keys['ArrowLeft'] || keys['KeyA']) {
            player.dx = -player.speed