document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Размеры игрового поля
    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    // --- Игровые объекты ---

    // Объект игрока (танк)
    const player = {
        x: CANVAS_WIDTH / 2 - 20, // Начальная позиция по X (центр)
        y: CANVAS_HEIGHT - 60,   // Начальная позиция по Y (внизу)
        width: 40,
        height: 40,
        color: 'yellow',
        speed: 3,
        // Метод для отрисовки танка
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Добавим "пушку" для танка
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 15);
        }
    };

    // --- Игровой цикл ---

    function gameLoop() {
        // 1. Обновление состояния игры (пока ничего не делаем, но здесь будет логика движения, столкновений и т.д.)
        // Например, здесь мы могли бы обновить player.x или player.y
        // player.x += 1; // Танк будет двигаться вправо

        // 2. Очистка канваса
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Очищаем весь канвас

        // 3. Отрисовка всех объектов
        player.draw(); // Отрисовываем танк игрока

        // Запрашиваем следующий кадр анимации
        requestAnimationFrame(gameLoop);
    }

    // Запускаем игровой цикл
    gameLoop();

    console.log('Игровой цикл запущен, танк должен появиться!');
});
