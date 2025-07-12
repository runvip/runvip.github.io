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
        dx: 0, // Изменение по X за кадр (скорость движения по горизонтали)
        dy: 0, // Изменение по Y за кадр (скорость движения по вертикали)

        draw: function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Добавим "пушку" для танка
            ctx.fillStyle = 'gray';
            // Пока пушка всегда смотрит вверх. Позже мы изменим её направление.
            ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 15);
        },
        // Метод для обновления позиции танка
        update: function () {
            this.x += this.dx;
            this.y += this.dy;

            // Ограничиваем движение танка пределами канваса
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
            if (this.y < 0) this.y = 0;
            if (this.y + this.height > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - this.height;
        }
    };

    // --- Управление ---

    const keys = {}; // Объект для отслеживания состояния клавиш (нажата/отпущена)

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true; // Записываем, что клавиша нажата
        // console.log('Нажата:', e.code); // Отладка: посмотреть код нажатой клавиши
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false; // Записываем, что клавиша отпущена
    });

    // Функция для обработки движения на основе нажатых клавиш
    function handlePlayerMovement() {
        player.dx = 0;
        player.dy = 0;

        if (keys['ArrowUp'] || keys['KeyW']) { // Клавиши вверх или W
            player.dy = -player.speed;
        }
        if (keys['ArrowDown'] || keys['KeyS']) { // Клавиши вниз или S
            player.dy = player.speed;
        }
        if (keys['ArrowLeft'] || keys['KeyA']) { // Клавиши влево или A
            player.dx = -player.speed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) { // Клавиши вправо или D
            player.dx = player.speed;
        }

        // Если нажаты две клавиши для движения по диагонали,
        // нужно скорректировать скорость, чтобы не было быстрее
        // (это более продвинутая техника, пока не будем её реализовывать,
        // просто имей в виду, что танк будет двигаться быстрее по диагонали)
    }


    // --- Игровой цикл ---

    function gameLoop() {
        // 1. Обновление состояния игры
        handlePlayerMovement(); // Обрабатываем движение игрока
        player.update();      // Обновляем позицию танка

        // 2. Очистка канваса
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 3. Отрисовка всех объектов
        player.draw();

        requestAnimationFrame(gameLoop);
    }

    // Запускаем игровой цикл
    gameLoop();

    console.log('Игровой цикл запущен, попробуйте управлять танком стрелками или WASD!');
});