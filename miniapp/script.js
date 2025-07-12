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
        // Добавим свойство для направления (0:вверх, 1:вправо, 2:вниз, 3:влево)
        direction: 0, // По умолчанию танк смотрит вверх

        draw: function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Отрисовка пушки в зависимости от направления
            ctx.fillStyle = 'gray';
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
        keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Получаем ссылки на сенсорные кнопки
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');

    // Функция для обработки событий касания кнопок
    function setupTouchControls() {
        // Функция, которая "нажимает" виртуальную клавишу
        const touchStartHandler = (e, keyCode) => {
            e.preventDefault(); // Предотвращаем стандартное поведение браузера (например, скролл)
            keys[keyCode] = true;
        };

        // Функция, которая "отпускает" виртуальную клавишу
        const touchEndHandler = (e, keyCode) => {
            e.preventDefault();
            keys[keyCode] = false;
        };

        // Прикрепляем слушателей событий к каждой кнопке
        btnUp.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowUp'));
        btnUp.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowUp'));
        btnDown.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowDown'));
        btnDown.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowDown'));
        btnLeft.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowLeft'));
        btnLeft.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowLeft'));
        btnRight.addEventListener('touchstart', (e) => touchStartHandler(e, 'ArrowRight'));
        btnRight.addEventListener('touchend', (e) => touchEndHandler(e, 'ArrowRight'));

        // Кнопка стрельбы (пока не реализована, но готовимся)
        btnFire.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['Space'] = true; // Будет соответствовать нажатию пробела
        });
        btnFire.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['Space'] = false;
        });
    }

    // Вызываем функцию настройки сенсорных кнопок
    setupTouchControls();


    // Функция для обработки движения на основе нажатых клавиш (обновлена для направления)
    function handlePlayerMovement() {
        player.dx = 0;
        player.dy = 0;

        // Если нажата только одна кнопка или несколько для одного направления,
        // то определяем направление
        if (keys['ArrowUp'] || keys['KeyW']) {
            player.dy = -player.speed;
            player.direction = 0; // Вверх
        } else if (keys['ArrowDown'] || keys['KeyS']) {
            player.dy = player.speed;
            player.direction = 2; // Вниз
        } else if (keys['ArrowLeft'] || keys['KeyA']) {
            player.dx = -player.speed;
            player.direction = 3; // Влево
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.dx = player.speed;
            player.direction = 1; // Вправо
        }

        // Если нажаты две клавиши, например, вверх и вправо,
        // приоритет отдается последней, или можно оставить диагональное движение.
        // Для простоты пока танк будет двигаться только в одном из 4 основных направлений.
        // Если нужны диагонали, логику нужно будет усложнить.
    }


    // --- Игровой цикл ---

    function gameLoop() {
        // 1. Обновление состояния игры
        handlePlayerMovement();
        player.update();

        // 2. Очистка канваса
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 3. Отрисовка всех объектов
        player.draw();

        requestAnimationFrame(gameLoop);
    }

    // Запускаем игровой цикл
    gameLoop();

    console.log('Игровой цикл запущен, попробуйте управлять танком стрелками/WASD или сенсорными кнопками!');
});