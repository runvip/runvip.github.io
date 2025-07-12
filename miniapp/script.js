document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Оригинальные (логические) размеры игры ---
    const ORIGINAL_GAME_WIDTH = 640;
    const ORIGINAL_GAME_HEIGHT = 480;

    // --- Переменная для коэффициента масштабирования ---
    let scaleFactor = 1;

    // --- Обновление размеров канваса и коэффициента масштабирования ---
    function resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const widthRatio = containerWidth / ORIGINAL_GAME_WIDTH;
        const heightRatio = containerHeight / ORIGINAL_GAME_HEIGHT;

        // Выбираем меньший коэффициент, чтобы игра полностью вписалась и сохранила пропорции 4:3
        scaleFactor = Math.min(widthRatio, heightRatio);

        // Устанавливаем внутренние размеры канваса на логические.
        // CSS позаботится о внешнем масштабировании элемента canvas.
        canvas.width = ORIGINAL_GAME_WIDTH;
        canvas.height = ORIGINAL_GAME_HEIGHT;

        // Применяем масштабирование к контексту отрисовки.
        // Важно: это сбрасывается каждый раз при очистке (clearRect)
        // Поэтому нужно применять его в gameLoop перед каждой отрисовкой игровых объектов.
        // Здесь мы просто устанавливаем его изначально для общих целей.
        ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

        console.log(`Canvas resized. Container: ${containerWidth}x${containerHeight}. Scale factor: ${scaleFactor}`);
    }

    // Вызываем resizeCanvas при загрузке страницы и при изменении размера окна
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Вызываем сразу при старте

    // --- Игровые объекты ---

    const player = {
        x: ORIGINAL_GAME_WIDTH / 2 - 20, // Используем ORIGINAL_GAME_WIDTH
        y: ORIGINAL_GAME_HEIGHT - 60,   // Используем ORIGINAL_GAME_HEIGHT
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
        initialPlayerPosition: { x: ORIGINAL_GAME_WIDTH / 2 - 20, y: ORIGINAL_GAME_HEIGHT - 60 },
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

            // Отскок от краев канваса (используем ORIGINAL_GAME_WIDTH/HEIGHT)
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > ORIGINAL_GAME_WIDTH) this.x = ORIGINAL_GAME_WIDTH - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > ORIGINAL_GAME_HEIGHT) this.y = ORIGINAL_GAME_HEIGHT - this.height;

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
                        // Используем ORIGINAL_GAME_WIDTH/HEIGHT для проверки выхода за экран
                        return this.x < -this.width || this.x > ORIGINAL_GAME_WIDTH ||
                            this.y < -this.height || this.y > ORIGINAL_GAME_HEIGHT;
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

    // --- Базовый класс вражеского танка ---
    class Enemy {
        constructor(x, y, width = 40, height = 40, color = 'green', speed = 1.5, fireCooldown = 1000, health = 1) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.speed = speed;
            this.dx = 0;
            this.dy = 0;
            this.direction = Math.floor(Math.random() * 4); // Случайное начальное направление
            this.canShoot = true;
            this.fireCooldown = fireCooldown;
            this.moveTimer = 0;
            this.moveInterval = 1000 + Math.random() * 2000; // Случайный интервал смены направления
            this.health = health; // Количество жизней врага
            this.initialHealth = health; // Запомним начальное здоровье для полоски

            // Добавим свойство для отслеживания типа врага (полезно для отладки и специфической логики)
            this.type = 'normal';
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'darkgreen'; // Пушка

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

            // Отрисовка полоски здоровья, если у врага больше 1 жизни
            if (this.initialHealth > 1) { // Проверяем initialHealth, чтобы рисовать полоску только для "тяжелых" врагов
                const healthBarWidth = this.width * (this.health / this.initialHealth);
                ctx.fillStyle = 'red';
                ctx.fillRect(this.x, this.y - 10, healthBarWidth, 5);
                ctx.strokeStyle = 'darkred';
                ctx.strokeRect(this.x, this.y - 10, this.width, 5);
            }
        }

        update(deltaTime) {
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

            // Отскок от краев канваса (используем ORIGINAL_GAME_WIDTH/HEIGHT)
            if (this.x < 0) { this.x = 0; this.direction = Math.floor(Math.random() * 4); }
            if (this.x + this.width > ORIGINAL_GAME_WIDTH) { this.x = ORIGINAL_GAME_WIDTH - this.width; this.direction = Math.floor(Math.random() * 4); }
            if (this.y < 0) { this.y = 0; this.direction = Math.floor(Math.random() * 4); }
            if (this.y + this.height > ORIGINAL_GAME_HEIGHT) { this.y = ORIGINAL_GAME_HEIGHT - this.height; this.direction = Math.floor(Math.random() * 4); }

            // Коллизии со стенами
            for (const wall of walls) {
                if (checkCollision(this, wall)) {
                    this.x = prevX;
                    this.y = prevY;
                    this.direction = Math.floor(Math.random() * 4); // Сменить направление при столкновении со стеной
                    break;
                }
            }
        }

        shoot() {
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
                    isWallBreaker: false, // Флаг для пуль разрушителей стен (по умолчанию false)
                    draw: function () {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    },
                    update: function () {
                        this.x += this.dx;
                        this.y += this.dy;
                    },
                    isOffScreen: function () {
                        // Используем ORIGINAL_GAME_WIDTH/HEIGHT для проверки выхода за экран
                        return this.x < -this.width || this.x > ORIGINAL_GAME_WIDTH ||
                            this.y < -this.height || this.y > ORIGINAL_GAME_HEIGHT;
                    }
                });

                this.canShoot = false;
                setTimeout(() => {
                    this.canShoot = true;
                }, this.fireCooldown);
            }
        }

        // Метод для получения урона
        takeDamage() {
            this.health--;
            return this.health <= 0; // Возвращает true, если враг уничтожен
        }
    }

    // --- Функция для создания врага (теперь использует класс) ---
    // Эту функцию мы будем вызывать из gameLoop для спавна
    function createRandomEnemy(enemyType = 'normal') {
        let enemy;
        const startX = Math.random() * (ORIGINAL_GAME_WIDTH - 40);
        const startY = Math.random() * (ORIGINAL_GAME_HEIGHT / 2 - 40);

        // Для начала просто вернем базового врага
        enemy = new Enemy(startX, startY);
        // initialHealth уже устанавливается в конструкторе Enemy

        // Позже здесь будет логика выбора разных типов врагов
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
    const keys = {}; // Остается для клавиатуры

    // Переменные для сенсорного управления
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoveThreshold = 20; // Минимальное смещение для распознавания свайпа
    let touchMoveActive = false; // Флаг, что сейчас идет свайп, а не тап
    let currentTouchDirection = null; // 'up', 'down', 'left', 'right' или null

    // Получаем новую кнопку "Меню"
    const btnMenu = document.getElementById('btnMenu');

    // Обработчик для кнопки "Меню"
    if (btnMenu) { // Проверяем, существует ли кнопка (она может быть скрыта CSS)
        btnMenu.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем дефолтное поведение
            togglePause(); // Вызываем функцию паузы
        });
    }

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'KeyP') {
            togglePause();
        }
        if (e.code === 'KeyU' && !isPaused) {
            goToNextLevel();
        }
        // Обработчики для клавиш сохранения/загрузки/новой игры, когда игра на паузе
        // Эти действия теперь также доступны через интерактивное меню паузы
        if (isPaused) {
            if (e.code === 'KeyS') { // S для сохранения
                saveGame();
                togglePause(); // Снимаем паузу после сохранения
            } else if (e.code === 'KeyL') { // L для загрузки
                loadGame();
            } else if (e.code === 'KeyN') { // N для новой игры
                if (confirm('Начать новую игру? Прогресс будет потерян.')) {
                    resetGame();
                }
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Обработчики сенсорного управления на канвасе
    canvas.addEventListener('touchstart', (e) => {
        // Проверяем, не на паузе ли игра, чтобы тач не повлиял на движение во время меню
        if (isPaused) return;

        e.preventDefault(); // Предотвращаем прокрутку страницы
        if (e.touches.length === 1) { // Обрабатываем только одно касание
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoveActive = false; // Предполагаем, что это может быть тап
            currentTouchDirection = null; // Сбрасываем направление движения
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (isPaused) return; // Не обрабатываем движение во время паузы

        e.preventDefault();
        if (e.touches.length === 1) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            const diffX = touchX - touchStartX;
            const diffY = touchY - touchStartY;

            // Определяем, достаточно ли сильно сдвинулось касание, чтобы считать это свайпом
            if (Math.abs(diffX) > touchMoveThreshold || Math.abs(diffY) > touchMoveThreshold) {
                touchMoveActive = true; // Теперь это точно свайп

                // Определяем доминирующее направление свайпа
                if (Math.abs(diffX) > Math.abs(diffY)) { // Горизонтальный свайп
                    if (diffX > 0) {
                        currentTouchDirection = 'right';
                    } else {
                        currentTouchDirection = 'left';
                    }
                } else { // Вертикальный свайп
                    if (diffY > 0) {
                        currentTouchDirection = 'down';
                    } else {
                        currentTouchDirection = 'up';
                    }
                }
            }
        }
    });

    canvas.addEventListener('touchend', (e) => {
        if (isPaused) return; // Не обрабатываем стрельбу/движение во время паузы

        e.preventDefault();
        // Если это не был активный свайп (т.е., это был короткий тап)
        if (!touchMoveActive) {
            player.shoot(); // Выстрел при коротком тапе
        }
        // Сбрасываем все состояния сенсорного управления
        currentTouchDirection = null;
        touchMoveActive = false;
        // Важно сбросить dx/dy игрока, если не нажаты клавиши
        player.dx = 0;
        player.dy = 0;
    });

    // Обработчики для интерактивного меню паузы
    canvas.addEventListener('click', handleMenuClick);
    canvas.addEventListener('touchend', handleMenuClick); // Используем touchend для мобильных


    function handlePlayerMovement() {
        player.dx = 0;
        player.dy = 0;

        // Обработка клавиатуры (если кнопки все еще активны или на десктопе)
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

        // Если есть активное сенсорное движение, оно переопределяет клавиатуру
        if (currentTouchDirection) {
            switch (currentTouchDirection) {
                case 'up':
                    player.dy = -player.speed;
                    player.direction = 0;
                    break;
                case 'down':
                    player.dy = player.speed;
                    player.direction = 2;
                    break;
                case 'left':
                    player.dx = -player.speed;
                    player.direction = 3;
                    break;
                case 'right':
                    player.dx = player.speed;
                    player.direction = 1;
                    break;
            }
        }

        // Клавиша пробел для стрельбы
        if (keys['Space']) {
            player.shoot();
        }
    }

    // --- Отображение HUD (счет, жизни) ---
    function drawHUD() {
        ctx.fillStyle = 'white';
        // Масштабируем размер шрифта относительно масштаба игры
        const fontSize = 16 / scaleFactor; // Возвращаем к оригинальному размеру, т.к. контекст масштабирован
        ctx.font = `${fontSize}px Arial`;
        // Координаты HUD также должны быть в "логических" координатах, чтобы их не сдвинуло
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
            // Сохраняем состояние стен
            walls: walls,
            // Сохраняем состояние врагов
            enemies: enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                direction: enemy.direction,
                health: enemy.health,
                type: enemy.type // Важно сохранить тип врага
            }))
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

                // Загружаем стены
                walls = JSON.parse(JSON.stringify(gameData.walls));

                // Загружаем врагов, создавая объекты классов
                enemies.length = 0; // Очищаем текущий массив врагов
                if (gameData.enemies && gameData.enemies.length > 0) {
                    gameData.enemies.forEach(enemyData => {
                        // Здесь нужно будет вызывать специализированные конструкторы, когда они появятся
                        // Пока что все Enemy, но позже будет switch по enemyData.type
                        const loadedEnemy = new Enemy(enemyData.x, enemyData.y, undefined, undefined, undefined, undefined, undefined, enemyData.health);
                        loadedEnemy.direction = enemyData.direction;
                        loadedEnemy.initialHealth = enemyData.health; // Для корректной отрисовки полоски здоровья
                        loadedEnemy.type = enemyData.type; // Убедимся, что тип тоже загружается
                        enemies.push(loadedEnemy);
                    });
                }


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
        ctx.clearRect(0, 0, ORIGINAL_GAME_WIDTH, ORIGINAL_GAME_HEIGHT); // Очищаем логические размеры
        resizeCanvas(); // Убедимся, что канвас корректно масштабирован при сбросе

        // Явно запускаем gameLoop после сброса
        gameLoop(0); // Запускаем игровой цикл после сброса

        console.log('Игра сброшена до начального состояния. Загружен уровень 1.');
    }

    // --- Функции управления уровнями ---
    function initLevel() {
        const levelData = levels[currentLevelIndex];
        // Глубокое копирование стен, чтобы изменения на уровне не влияли на исходные данные уровня
        walls = JSON.parse(JSON.stringify(levelData.initialWalls));
        enemies.length = 0;
        bullets.length = 0;
        enemiesDestroyed = 0;
        player.x = player.initialPlayerPosition.x;
        player.y = player.initialPlayerPosition.y;
        player.direction = 0;

        console.log(`Запущен уровень ${levelData.level}`);
        resizeCanvas(); // Убедимся, что канвас корректно масштабирован при старте уровня
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

    // Глобальные переменные для меню паузы
    const pauseMenuButtons = []; // Будет хранить объекты кнопок
    const BUTTON_WIDTH = 250;
    const BUTTON_HEIGHT = 40;
    const BUTTON_SPACING = 15; // Отступ между кнопками

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            if (animationFrameId) { // Отменяем только если был запущен
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null; // Сбрасываем ID
            }
            gameLoopRunning = false; // Флаг: цикл остановлен

            // При паузе нужно сбросить трансформацию для текста меню паузы
            // Рисуем меню в реальных пикселях канваса, не масштабируя его
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Более темный фон для меню
            // Заполняем ВЕСЬ канвас (его видимые размеры)
            ctx.fillRect(0, 0, canvas.width * scaleFactor, canvas.height * scaleFactor);

            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';

            const menuCenterX = (canvas.width * scaleFactor) / 2;
            let currentButtonY = (canvas.height * scaleFactor) / 2 - (BUTTON_HEIGHT * 2 + BUTTON_SPACING * 1.5); // Начальная Y для первой кнопки

            // Отрисовка заголовка "ПАУЗА"
            ctx.fillText('ПАУЗА', menuCenterX, currentButtonY - BUTTON_HEIGHT / 2 - 20); // Смещаем заголовок выше кнопок

            // Очищаем предыдущие кнопки
            pauseMenuButtons.length = 0;

            // Определяем кнопки меню
            const menuOptions = [
                { text: 'Продолжить', action: () => togglePause() },
                { text: 'Сохранить игру', action: () => { saveGame(); togglePause(); } }, // Сохраняем и сразу снимаем паузу
                { text: 'Загрузить игру', action: () => { loadGame(); } },
                { text: 'Новая игра', action: () => { if (confirm('Начать новую игру? Прогресс будет потерян.')) { resetGame(); } } }
            ];

            // Отрисовываем кнопки и сохраняем их координаты
            ctx.font = '24px Arial'; // Шрифт для кнопок
            menuOptions.forEach((option, index) => {
                const buttonX = menuCenterX - BUTTON_WIDTH / 2;
                const buttonY = currentButtonY + index * (BUTTON_HEIGHT + BUTTON_SPACING);

                ctx.fillStyle = '#333'; // Цвет фона кнопки
                ctx.fillRect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT);

                ctx.strokeStyle = '#555'; // Обводка кнопки
                ctx.lineWidth = 2;
                ctx.strokeRect(buttonX, buttonY, BUTTON_WIDTH, BUTTON_HEIGHT);

                ctx.fillStyle = 'white'; // Цвет текста кнопки
                // Центрируем текст по высоте кнопки
                ctx.fillText(option.text, menuCenterX, buttonY + BUTTON_HEIGHT / 2 + 8); // 8 - небольшая коррекция для вертикального центрирования текста

                // Добавляем кнопку в массив для обработки кликов/тапов
                pauseMenuButtons.push({
                    x: buttonX,
                    y: buttonY,
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT,
                    action: option.action
                });
            });

            ctx.textAlign = 'left'; // Возвращаем выравнивание текста по умолчанию
        } else {
            // Если игра не на паузе и цикл не запущен, запускаем его
            if (!gameLoopRunning) {
                lastTime = performance.now(); // Сброс lastTime для корректного deltaTime
                gameLoop(lastTime);
            }
            pauseMenuButtons.length = 0; // Очищаем кнопки при выходе из паузы
        }
    }

    // Функция для обработки кликов/тапов по кнопкам меню паузы
    function handleMenuClick(e) {
        if (!isPaused) return; // Обрабатываем клики по меню только когда игра на паузе

        e.preventDefault(); // Предотвращаем любые другие действия

        const rect = canvas.getBoundingClientRect(); // Размеры канваса на экране
        let clientX, clientY;

        if (e.type === 'touchend') {
            // Если это touchend, используем координаты последнего касания
            // Важно: touches может быть пустым на touchend, используем changedTouches
            if (e.changedTouches.length === 0) return;
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else { // Это 'click' событие
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Преобразуем координаты клика/тапа в координаты относительно отрисованного канваса
        // Учитываем scaleFactor, так как кнопки нарисованы в реальных пикселях канваса (после ctx.setTransform(1,...))
        const mouseX = (clientX - rect.left);
        const mouseY = (clientY - rect.top);

        // Проверяем каждую кнопку меню
        for (const button of pauseMenuButtons) {
            if (mouseX >= button.x && mouseX <= button.x + button.width &&
                mouseY >= button.y && mouseY <= button.y + button.height) {
                button.action(); // Выполняем действие кнопки
                break; // Выходим после первого срабатывания
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
        if (enemies.length < currentLevelData.maxEnemies && enemies.length + enemiesDestroyed < currentLevelData.maxEnemies) {
            enemies.push(createRandomEnemy('normal')); // Теперь используем createRandomEnemy
        }


        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.update();

            let bulletHitSomething = false;

            for (let j = walls.length - 1; j >= 0; j--) {
                const wall = walls[j];
                if (checkCollision(bullet, wall)) {
                    // Логика разрушения стен для пуль игрока (как раньше)
                    if (bullet.isPlayerBullet && !wall.indestructible) {
                        walls.splice(j, 1);
                    }
                    // ! Добавим логику для пуль врагов-разрушителей стен здесь позже !

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
                        const isDestroyed = enemy.takeDamage(); // Враг получает урон
                        if (isDestroyed) { // Если враг уничтожен
                            enemies.splice(j, 1);
                            player.score += 100;
                            enemiesDestroyed++;
                        }
                        bullets.splice(i, 1); // Пуля всегда исчезает при попадании
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
                        saveGame(); // Добавлено сохранение после Game Over
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
                // Отталкиваем врага при столкновении с игроком
                enemy.x -= enemy.dx;
                enemy.y -= enemy.dy;
                // И меняем направление врага
                enemy.direction = Math.floor(Math.random() * 4);
            }

            for (let j = enemies.length - 1; j >= 0; j--) {
                const otherEnemy = enemies[j];
                if (enemy !== otherEnemy && checkCollision(enemy, otherEnemy)) {
                    // Отталкиваем врагов друг от друга
                    enemy.x -= enemy.dx;
                    enemy.y -= enemy.dy; // Исправлено: enemy.dy
                    otherEnemy.x -= otherEnemy.dx;
                    otherEnemy.y -= otherEnemy.dy;
                    // И меняем их направления
                    enemy.direction = Math.floor(Math.random() * 4);
                    otherEnemy.direction = Math.floor(Math.random() * 4);
                }
            }
        }

        // Проверка завершения уровня
        if (enemiesDestroyed >= currentLevelData.maxEnemies && enemies.length === 0) {
            goToNextLevel();
            return;
        }


        // 2. Очистка канваса
        // ctx.clearRect должен очищать логическую область, т.к. контекст масштабирован
        ctx.clearRect(0, 0, ORIGINAL_GAME_WIDTH, ORIGINAL_GAME_HEIGHT);

        // 3. Установка масштаба для отрисовки всех игровых объектов
        // Важно: это должно быть после clearRect, иначе clearRect сбросит трансформацию
        ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

        // 4. Отрисовка всех объектов
        player.draw();
        bullets.forEach(bullet => bullet.draw());
        walls.forEach(wall => {
            ctx.fillStyle = wall.color;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        enemies.forEach(enemy => enemy.draw());

        drawHUD(); // HUD также будет отрисован с масштабированным контекстом

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- Инициализация игры при старте ---
    loadGame(); // Вызываем loadGame, которая запустит игру или resetGame
});