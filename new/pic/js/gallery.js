document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const caption = document.getElementById('caption');

    // Используем массив из gallery-data.js
    galleryImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.caption;
        img.loading = 'lazy';

        img.addEventListener('click', () => {
            modal.style.display = 'block';
            modalImg.src = image.src;
            caption.textContent = image.caption;
        });

        gallery.appendChild(img);
    });

    // Закрытие модалки
    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие по клику вне изображения
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});