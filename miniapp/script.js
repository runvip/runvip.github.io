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
        lives: 3,
        score: 0,
        initialPlayerPosition: { x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 60 },
        isAlive: true,

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
            if (!this.isAlive) return;

            const prevX = this.x;
            const prevY = this.y;

            this.x += this.dx;
            this.y += this.dy;

            if (this.x < 0) this.x = 0;
            if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - this.height;

            for (const wall of walls) {
                if (checkCollision(this, wall)) {
                    this.x = prevX;
                    this.y = prevY;
                    break;
                }
            }
        },
        shoot: function () {
            if (this.canShoot && this.isAlive) {
                let bulletX, bulletY, bulletDx, bulletDy;
                const bulletSize = 6;
                const bulletSpeed = 7;

                switch (this.direction) {
                    case 0:
                        bulletX = this.x + this.width / 2 - bulletSize / 2;
                        bulletY = this.y - bulletSize;
                        bulletDx = 0;
                        bulletDy = -bulletSpeed;
                        break;
                    case 1:
                        bulletX = this.x + this.width;
                        bulletY = this.y + this.height / 2 - bulletSize / 2;
                        bulletDx = bulletSpeed;
                        bulletDy = 0;
                        break;
                    case 2:
                        bulletX = this.x + this.width / 2 - bulletSize / 2;
                        bulletY = this.y + this.height;
                        bulletDx = 0;
                        bulletDy = bulletSpeed;
                        break;
                    case 3:
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
                    isPlayerBullet: true,
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
    const enemies = [];
    let enemiesDestroyed = 0;

    // --- Определение уровней ---
    const levels = [
        {
            level: 1,
            maxEnemies: 3,
            initialWalls: [
                { x: 100, y: 100, width: 80, height: 20, color: 'brown', indestructible: false },
                { x: 200, y: 100, width: 20, height: 80, color: 'brown', indestructible: false },
                { x: 400, y: 200, width: 100, height: 20, color: 'gray', indestructible: true },
                { x: 50, y: 250, width: 20, height: 50, color: 'brown', indestructible: false },
                { x: 500, y: 300, width: 50, height: 50, color: 'brown', indestructible: false },
            ]
        },
        {
            level: 2,
            maxEnemies: 5,
            initialWalls: [
                { x: 150, y: 50, width: 20, height: 150, color: 'brown', indestructible: false },
                { x: 150, y: 300, width: 20, height: 150, color: 'brown', indestructible: false },
                { x: 300, y: 150, width: 200, height: 20, color: 'gray', indestructible: true },
                { x: 300, y: 350, width: 200, height: 20, color: 'gray', indestructible: true },
                { x: 400, y: 50, width: 20, height: 50, color: 'brown', indestructible: false },
                { x: 400, y: 400, width: 20, height: 50, color: 'brown', indestructible: false },
            ]
        },
        {
            level: 3,
            maxEnemies: 7,
            initialWalls: [
                { x: 50, y: 50, width: 540, height: 20, color: 'gray', indestructible: true },
                { x: 50, y: 410, width: 540, height: 20, color: 'gray', indestructible: true },
                { x: 50, y: 70, width: 20, height: 340, color: 'gray', indestructible: true },
                { x: 570, y: 70, width: 20, height: 340, color: 'gray', indestructible: true },
                { x: 200, y: 150, width: 240, height: 20, color: 'brown', indestructible: false },
                { x: 200, y: 300, width: 240, height: 20, color: 'brown', indestructible: false },
            ]
        }
    ];

    let currentLevelIndex = 0;
    let walls = []; // Инициализируется в initLevel

    // --- Вражеские танки ---
    function createEnemy() {
        const enemy = {
            x: Math.random() * (CANVAS_WIDTH - 40),
            y: Math.random() * (CANVAS_HEIGHT / 2 - 40),
            width: 40,
            height: 40,
            color: 'green',
            speed: 1.5,
            dx: 0,
            dy: 0,
            direction: Math.floor(Math.random() * 4),
            canShoot: true,
            fireCooldown: 1000 + Math.random() * 1000,
            moveTimer: 0,
            moveInterval: 1000 + Math.random() * 2000,

            draw: function () {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = 'darkgreen';
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

                this.moveTimer += deltaTime;
                if (this.moveTimer >= this.moveInterval) {
                    this.direction = Math.floor(Math.random() * 4);
                    this.moveTimer = 0;
                    this.moveInterval = 1000 + Math.random() * 2000;
                }

                this.dx = 0;
                this.dy = 0;
                switch (this.direction) {
                    case 0: this.dy = -this.speed; break;
                    case 1: this.dx = this.speed; break;
                    case 2: this.dy = this.speed; break;
                    case 3: this.dx = -this.speed; break;
                }

                this.x += this.dx;
                this.y += this.dy;

                if (this.x < 0) { this.x = 0; this.direction = Math.floor(Math.random() * 4); }
                if (this.x + this.width > CANVAS_WIDTH) { this.x = CANVAS_WIDTH - this.width; this.direction = Math.floor(Math.random() * 4); }
                if (this.y < 0) { this.y = 0; this.direction = Math.floor(Math.random() * 4); }
                if (this.y + this.height > CANVAS_HEIGHT) { this.y = CANVAS_HEIGHT - this.height; this.direction = Math.floor(Math.random() * 4); }


                for (const wall of walls) {
                    if (checkCollision(this, wall)) {
                        this.x = prevX;
                        this.y = prevY;
                        this.direction = Math.floor(Math.random() * 4);
                        break;
                    }
                }
            },
            shoot: function () {
                if (this.canShoot) {
                    let bulletX, bulletY, bulletDx, bulletDy;
                    const bulletSize = 6;
                    const bulletSpeed = 5;

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
                        color: 'orange',
                        isPlayerBullet: false,
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

    // --- Управление ---
    const keys = {};

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'KeyP') {
            togglePause();
        }
        if (e.code === 'KeyU' && !isPaused) {
            goToNextLevel();
        }
        // Обработчики для клавиш сохранения/загрузки/новой игры, когда игра на паузе
        if (isPaused) { // Эти действия должны быть доступны только в режиме паузы
            if (e.code === 'KeyS') { // S для сохранения
                saveGame();
                togglePause(); // Снимаем паузу после сохранения
            } else if (e.code === 'KeyL') { // L для загрузки
                loadGame();
                togglePause(); // Снимаем паузу после загрузки
            } else if (e.code === 'KeyN') { // N для новой игры
                if (confirm('Начать новую игру? Прогресс будет потерян.')) {
                    resetGame();
                    togglePause(); // Снимаем паузу после начала новой игры
                }
            }
        }
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
            player.dx = -player.speed;
            player.direction = 3;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.dx = player.speed;
            player.direction = 1;
        }

        if (keys['Space']) {
            player.shoot();
        }
    }

    // --- Отображение HUD (счет, жизни) ---
    function drawHUD() {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Жизни: ${player.lives}`, 10, 20);
        ctx.fillText(`Счет: ${player.score}`, 10, 40);
        ctx.fillText(`Уровень: ${levels[currentLevelIndex].level}`, 10, 60);
        ctx.fillText(`Врагов уничтожено на уровне: ${enemiesDestroyed} / ${levels[currentLevelIndex].maxEnemies}`, 10, 80);
    }

    // --- Функции сохранения/загрузки ---
    function saveGame() {
        const gameData = {
            player: {
                lives: player.lives,
                score: player.score,
                x: player.x,
                y: player.y,
                direction: player.direction
            },
            currentLevelIndex: currentLevelIndex,
            enemiesDestroyed: enemiesDestroyed,
            walls: walls,
        };
        try {
            localStorage.setItem('tankGameSave', JSON.stringify(gameData));
            console.log('Игра сохранена!', gameData);
            alert('Игра сохранена!');
        } catch (e) {
            console.error('Ошибка при сохранении игры:', e);
            alert('Не удалось сохранить игру. Возможно, переполнено хранилище браузера.');
        }
    }

    function loadGame() {
        try {
            const savedData = localStorage.getItem('tankGameSave');
            if (savedData) {
                const gameData = JSON.parse(savedData);

                player.lives = gameData.player.lives;
                player.score = gameData.player.score;
                player.x = gameData.player.x;
                player.y = gameData.player.y;
                player.direction = gameData.player.direction;

                currentLevelIndex = gameData.currentLevelIndex;
                enemiesDestroyed = gameData.enemiesDestroyed;

                walls = JSON.parse(JSON.stringify(gameData.walls));

                enemies.length = 0;
                bullets.length = 0;

                player.isAlive = true;

                // Важно: Отменяем текущий цикл, если он был запущен
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                gameLoopRunning = false; // Убедимся, что флаг сброшен перед запуском новой петли
                isPaused = false; // Устанавливаем isPaused в false ЗДЕСЬ

                console.log('Игра загружена!', gameData);
                alert('Игра загружена!');
                gameLoop(0); // Запускаем игровой цикл после загрузки
            } else {
                console.log('Сохранений нет. Начинаем новую игру.');
                resetGame(); // Начинаем новую игру, если нет сохранений
            }
        } catch (e) {
            console.error('Ошибка при загрузке игры (поврежденные данные?):', e);
            alert('Не удалось загрузить игру (данные повреждены). Начинаем новую игру.');
            resetGame(); // Начинаем новую игру, если ошибка при парсинге или другие проблемы
        }
    }

    function resetGame() {
        player.lives = 3;
        player.score = 0;
        player.x = player.initialPlayerPosition.x;
        player.y = player.initialPlayerPosition.y;
        player.direction = 0;
        player.isAlive = true;
        currentLevelIndex = 0;
        enemiesDestroyed = 0;
        enemies.length = 0;
        bullets.length = 0;

        // Важно: Отменяем текущий цикл перед сбросом
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        gameLoopRunning = false; // Убедимся, что флаг сброшен перед запуском новой петли
        isPaused = false; // Устанавливаем isPaused в false ЗДЕСЬ

        initLevel(); // Инициализация первого уровня

        // Дополнительная очистка канваса при сбросе
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Явно запускаем gameLoop после сброса
        gameLoop(0); // Запускаем игровой цикл после сброса

        console.log('Игра сброшена до начального состояния. Загружен уровень 1.');
    }

    // --- Функции управления уровнями ---
    function initLevel() {
        const levelData = levels[currentLevelIndex];
        walls = JSON.parse(JSON.stringify(levelData.initialWalls));
        enemies.length = 0;
        bullets.length = 0;
        enemiesDestroyed = 0;
        player.x = player.initialPlayerPosition.x;
        player.y = player.initialPlayerPosition.y;
        player.direction = 0;

        console.log(`Запущен уровень ${levelData.level}`);
    }

    function goToNextLevel() {
        if (currentLevelIndex < levels.length - 1) {
            currentLevelIndex++;
            player.score += 500;
            alert(`Уровень ${levels[currentLevelIndex].level} начался!`);
            initLevel();
        } else {
            alert('Поздравляем! Вы прошли все уровни!');
            resetGame();
        }
    }

    // --- Пауза и игровой цикл ---
    let isPaused = false;
    let animationFrameId = null; // Инициализируем null
    let gameLoopRunning = false; // Флаг, чтобы gameLoop запускался только один раз

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            if (animationFrameId) { // Отменяем только если был запущен
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null; // Сбрасываем ID
            }
            gameLoopRunning = false; // Флаг: цикл остановлен
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
            ctx.font = '20px Arial';
            ctx.fillText('Нажмите P, чтобы продолжить', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.fillText('Нажмите S, чтобы сохранить', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
            ctx.fillText('Нажмите L, чтобы загрузить', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
            ctx.fillText('Нажмите N, чтобы начать новую игру', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
            ctx.textAlign = 'left';
        } else {
            // Если игра не на паузе и цикл не запущен, запускаем его
            if (!gameLoopRunning) {
                lastTime = performance.now(); // Сброс lastTime для корректного deltaTime
                gameLoop(lastTime);
            }
        }
    }


    let lastTime = 0;

    function gameLoop(currentTime) {
        if (isPaused) {
            gameLoopRunning = false;
            return;
        }

        gameLoopRunning = true; // Устанавливаем флаг здесь, т.к. мы точно знаем, что цикл активен

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // 1. Обновление состояния игры
        handlePlayerMovement();
        player.update();

        const currentLevelData = levels[currentLevelIndex];
        // Спавним врагов, пока их меньше максимального количества для уровня,
        // и пока общее количество уничтоженных врагов на уровне меньше maxEnemies.
        // Это предотвратит спавн бесконечного количества врагов, если счетчик enemiesDestroyed уже достиг maxEnemies
        if (enemies.length < currentLevelData.maxEnemies && enemies.length + enemiesDestroyed < currentLevelData.maxEnemies) {
            enemies.push(createEnemy());
        }


        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.update();

            let bulletHitSomething = false;

            for (let j = walls.length - 1; j >= 0; j--) {
                const wall = walls[j];
                if (checkCollision(bullet, wall)) {
                    if (!wall.indestructible) {
                        walls.splice(j, 1);
                    }
                    bullets.splice(i, 1);
                    bulletHitSomething = true;
                    break;
                }
            }
            if (bulletHitSomething) continue;

            if (bullet.isPlayerBullet) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const enemy = enemies[j];
                    if (checkCollision(bullet, enemy)) {
                        bullets.splice(i, 1);
                        enemies.splice(j, 1);
                        player.score += 100;
                        enemiesDestroyed++;
                        bulletHitSomething = true;
                        break;
                    }
                }
            }
            if (bulletHitSomething) continue;

            if (!bullet.isPlayerBullet) {
                if (checkCollision(bullet, player)) {
                    bullets.splice(i, 1);
                    player.lives--;
                    bulletHitSomething = true;

                    if (player.lives <= 0) {
                        player.isAlive = false;
                        alert('Игра окончена! Вы уничтожили ' + player.score + ' очков. Начать заново?');
                        resetGame(); // resetGame уже вызовет gameLoop
                        saveGame();
                        return;
                    }
                }
            }
            if (bulletHitSomething) continue;

            if (bullet.isOffScreen()) {
                bullets.splice(i, 1);
            }
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update(deltaTime);

            if (Math.random() < 0.005 && enemy.canShoot) {
                enemy.shoot();
            }

            if (checkCollision(enemy, player)) {
                enemy.x -= enemy.dx;
                enemy.y -= enemy.dy;
                enemy.direction = Math.floor(Math.random() * 4);
            }

            for (let j = enemies.length - 1; j >= 0; j--) {
                const otherEnemy = enemies[j];
                if (enemy !== otherEnemy && checkCollision(enemy, otherEnemy)) {
                    enemy.x -= enemy.dx;
                    enemy.y -= enemy.dy;
                    enemy.direction = Math.floor(Math.random() * 4);
                }
            }
        }

        // Проверка завершения уровня
        if (enemiesDestroyed >= currentLevelData.maxEnemies && enemies.length === 0) {
            goToNextLevel();
            return;
        }


        // 2. Очистка канваса
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 3. Отрисовка всех объектов
        player.draw();
        bullets.forEach(bullet => bullet.draw());
        walls.forEach(wall => {
            ctx.fillStyle = wall.color;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        enemies.forEach(enemy => enemy.draw());

        drawHUD();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- Инициализация игры при старте ---
    // loadGame() теперь само запустит gameLoop
    loadGame();

    console.log('Полностью обновленный script.js загружен. Проверьте функционал "Новой игры".');
});