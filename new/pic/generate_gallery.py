import os
import json
from datetime import datetime

def generate_image_list(image_folder, output_js_file):
    """
    Сканирует папку с изображениями и создает JS-файл с отсортированным списком
    :param image_folder: Папка с изображениями
    :param output_js_file: Куда сохранить JS-файл
    """
    valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp')
    images = []

    for filename in os.listdir(image_folder):
        if filename.lower().endswith(valid_extensions):
            filepath = os.path.join(image_folder, filename)
            mtime = os.path.getmtime(filepath)
            images.append({
                'src': f'images/{filename}',
                'caption': '',
                'mtime': mtime
            })
    
    # Сортировка по дате изменения (новые -> старые)
    images.sort(key=lambda x: x['mtime'], reverse=True)

    js_content = f"""// Автоматически сгенерировано {datetime.now().strftime('%Y-%m-%d %H:%M')}
const galleryImages = {json.dumps(
    [{'src': img['src'], 'caption': img['caption']} for img in images],
    indent=2,
    ensure_ascii=False
)};
"""

    with open(output_js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f'✅ Обновлено {len(images)} изображений в {output_js_file}')

if __name__ == '__main__':
    # Настройки (измените под свой проект)
    generate_image_list(
        image_folder='images',
        output_js_file='js/gallery-data.js'
    )