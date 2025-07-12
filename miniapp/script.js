document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d'); // Получаем 2D-контекст для рисования

    // Простой пример рисования на канвасе
    ctx.fillStyle = 'green'; // Цвет заливки
    ctx.fillRect(50, 50, 100, 100); // Рисуем квадрат: x, y, width, height

    ctx.fillStyle = 'blue';
    ctx.beginPath(); // Начинаем новый путь
    ctx.arc(320, 240, 50, 0, Math.PI * 2); // Рисуем круг: x, y, radius, startAngle, endAngle
    ctx.fill(); // Заливаем круг
    ctx.closePath(); // Закрываем путь

    console.log('Канвас готов к рисованию!');
});
