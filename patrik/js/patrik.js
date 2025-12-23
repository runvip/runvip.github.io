// --- НАСТРОЙКИ ---
const WAKE_WORDS = ['патрик', 'patrick'];

// Таймеры (в миллисекундах)
const WAIT_FOR_START_DELAY = 4000; // Ждем 4 сек, пока вы начнете говорить
const END_OF_PHRASE_DELAY = 3000;  // Ждем 1.5 сек тишины
const COMMAND_COOLDOWN = 1500;     // Задержка после выполнения обычных команд

// --- ЗВУКОВЫЕ ФРАЗЫ (ВАШИ ФАЙЛЫ) ---
const SOUNDS_PATH = 'sounds/';

const VOICE_ASSETS = {
    wake: ['wake_1.mp3', 'wake_2.mp3', 'wake_3.mp3'],
    thinking: ['hmm_1.mp3', 't.mp3', 't.mp3', '', 't.mp3'],
    incoming: ['hmm_1.mp3', 'hmm_2.mp3', 'hmm_3.mp3', 'hmm_4.mp3'],
    sleep: ['sleep_1.mp3', 't.mp3', 't.mp3'],
    error: ['error_1.mp3', 'error_2.mp3', 'error_3.mp3', 'error_4.mp3'],
    start: ['gotov_k_rabote.mp3'],
    stop: ['zovi_esli_the.mp3']
};

const INSTANT_COMMANDS = {
    'стоп': 'stop',
    'хватит': 'stop',
    'остановись': 'stop',
    'останови': 'stop',
    'довольно': 'stop',
    'прекрати': 'stop',
    'замолчи': 'stop',
    'тихо': 'stop',
    'пауза': 'stop',
    'замри': 'pause',
    'играй': 'play',
    'продолжи': 'play',
    'дальше': 'next',
    'следующий': 'next',
    'назад': 'back',
    'тише': 'vol_down',
    'потише': 'vol_down',
    'громче': 'vol_up',
    'погромче': 'vol_up'
};



// --- РАДИО НАСТРОЙКИ ---
const RADIO_STATIONS = [
    { name: 'Русское Радио', url: 'https://pub0101.101.ru:8000/stream/air/aac/64/100' },
    { name: 'Рекорд', url: 'https://radiorecord.hostingradio.ru/rr_main96.aacp' },
    { name: 'Маруся ФМ', url: 'https://radio-holding.ru:9433/marusya_default' },
    { name: 'Наше Радио', url: 'https://nashe5.hostingradio.ru/nashe-128.mp3' },
    { name: 'Вести ФМ', url: 'https://icecast-vgtrk.cdnvideo.ru/vestifm_mp3_192kbps' },
    { name: 'Маяк', url: 'https://icecast-vgtrk.cdnvideo.ru/mayakfm_mp3_192kbps' },
    { name: 'DFM', url: 'https://dfm.hostingradio.ru/dfm128.mp3' },
    { name: 'Радио России', url: 'https://icecast-vgtrk.cdnvideo.ru/rrzonam_mp3_192kbps' },
    { name: 'Комсомольская правда', url: 'https://kpradio.hostingradio.ru:8000/128?radiostatistica=top-radio.ru' },
    { name: 'Максимум', url: 'https://maximum.hostingradio.ru/maximum128.mp3' },
    { name: 'NRJ', url: 'https://pub0101.101.ru:8000/stream/air/aac/64/99' },
    { name: 'Relax FM', url: 'https://pub0201.101.ru:8000/stream/air/aac/64/200' },
    { name: 'Книга', url: 'https://bookradio.hostingradio.ru:8069/fm' },
    { name: 'Ultra', url: 'https://nashe1.hostingradio.ru:18000/ultra-128.mp3' },
    { name: 'Jazz', url: 'https://nashe1.hostingradio.ru/jazz-128.mp3' },
    { name: 'ТНТ', url: 'https://tntradio.hostingradio.ru:8027/tntradio128.mp3' },
    { name: 'Вата', url: 'https://radio.promodj.com/vata-192' },
    { name: 'Ретро Хит', url: 'https://retro.volna.top/Retro' },
    { name: 'Ремикс ФМ', url: 'https://remixfm.volna.top/RemixFM' },
    { name: 'Радио Cafe', url: 'https://cafe.volna.top/Cafe' },
    { name: 'Русский рок', url: 'https://air.volna.top/RusRock' },
    { name: 'Mixadance', url: 'https://stream.mixadance.fm/mixadance' },
    { name: 'Монстры рока СССР', url: 'https://stream.zeno.fm/d2acdq2w908uv' },
    { name: 'NOH FM', url: 'https://stream.ndhradio.online:8035/stream' },
    { name: 'Радио Премиум', url: 'https://listen2.rpfm.ru/premium128' },
    { name: 'Гламурная волна', url: 'https://stream.laut.fm/glamwave' },
    { name: 'Панки Хой', url: 'https://nashe1.hostingradio.ru/nashepunks.mp3' },
    { name: 'ХАЙП ФМ', url: 'https://hfm.volna.top/HypeFM' }
];

// Плеер для Радио
const radioPlayer = new Audio();
let currentStationIndex = 0;
let isRadioPlaying = false;
// --- НАСТРОЙКИ ГРОМКОСТИ ---
const VOL_RADIO_NORMAL = 0.6; // Обычная громкость радио
const VOL_RADIO_DUCKED = 0.1; // Тихо (когда говорим с Патриком)
const VOL_VOICE = 1.0;        // Громкость Патрика
// В начало patrik.js к константам
let userRadioVolume = 0.6; // Текущая громкость пользователя


// --- Глобальные переменные ---
let model, recognizer, mediaStream, audioContext, processor;
let isListening = false;
let isWaitingForCommand = false;
let isAiSpeaking = false;
let hasStartedSpeaking = false;
let silenceTimer = null;
let commandAccumulator = "";
let lastCommandTime = 0;
let processingInterval = null;




















const patrikModel = document.getElementById('patrik-model');
/* camera-orbit = "0deg 90deg 1m" (Азимут = 0, Элевация = 90, Дистанция = 1m)*/
function patrikLookAtMe() {
    if (patrikModel) {
        // Устанавливаем Азимут в 0deg (лицом)
        patrikModel.cameraOrbit = "0deg 90deg 10m";
        // Если вы хотите плавный поворот (анимацию), добавьте:
        // patrikModel.shadowIntensity = "1"; // Для примера, любое свойство
    }
}
/*Поворачивает Патрика спиной к пользователю. */
function patrikTurnAway() {
    if (patrikModel) {
        // Устанавливаем Азимут в 180deg (спиной)
        patrikModel.cameraOrbit = "180deg 90deg 10m";
    }
}






// Блокировка для команды СТОП, чтобы она не срабатывала 20 раз подряд
let stopLock = false;

// --- ЛОГИКА ПРИГЛУШЕНИЯ (DUCKING) ---
let duckingTimer = null;
function triggerAudioDucking() {
    // Если радио не играет или Патрик уже в режиме диалога - ничего не делаем
    if (!isRadioPlaying || isWaitingForCommand || radioPlayer.paused) return;

    // Мгновенно снижаем громкость
    radioPlayer.volume = 0.1;

    // Сбрасываем таймер восстановления
    if (duckingTimer) clearTimeout(duckingTimer);

    // Если тишина 1.5 секунды - возвращаем громкость
    duckingTimer = setTimeout(() => {
        // Восстанавливаем, только если мы НЕ перешли в режим диалога
        if (!isWaitingForCommand && isRadioPlaying) {
            // Плавное восстановление (опционально) или резкое:
            radioPlayer.volume = userRadioVolume;
        }
    }, 1500);
}







// Кеш для звуков (AudioBuffers)
const audioBuffers = {};

// Плеер для длинного голоса Патрика (TTS)
const audioPlayer = new Audio();

// Элементы UI
const statusRing = document.getElementById('status-ring');
const avatar_container = document.getElementById('avatar-wrapper');
const statusText = document.getElementById('status-text');
const logEl = document.getElementById('log');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');

// --- ЛОГИРОВАНИЕ И UI ---
function log(msg, type = '') {
    const div = document.createElement('div');
    div.className = `log-item log-${type}`;
    if (type === 'ai') {
        div.setAttribute('data-raw', msg); // Сохраняем чистый ответ
        div.textContent = `Патрик: ${msg}`; // Вставляем текст, чтобы marked.parse не удалял его
    } else {
        div.innerHTML = msg;
    }
    logEl.insertBefore(div, logEl.firstChild);
    if (logEl.children.length > 50) { logEl.removeChild(logEl.lastChild); }
    return div; // Возвращаем элемент для дальнейшей обработки
}


function setStatus(text, state) {
    statusText.textContent = text;
    statusRing.className = state;
    avatar_container.className = 'avatar-container ' + state;
}

// --- СИСТЕМА ПРЕДЗАГРУЗКИ ЗВУКОВ (AUDIO BUFFER) ---
async function preloadVoiceAssets() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // log('Кеширование фраз...', 'sys');
    const loadPromises = [];
    for (const [category, files] of Object.entries(VOICE_ASSETS)) {
        audioBuffers[category] = [];
        files.forEach(filename => {
            const url = SOUNDS_PATH + filename;
            const promise = fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`404 ${url}`);
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    audioBuffers[category].push(audioBuffer);
                })
                .catch(e => console.warn(`Не удалось загрузить звук ${filename}:`, e));

            loadPromises.push(promise);
        });
    }

    await Promise.all(loadPromises);
    // log('Фразы загружены в память', 'sys');
}

// Функция проигрывания буфера
function playBufferedSound(category) {
    if (!audioContext || !audioBuffers[category] || audioBuffers[category].length === 0) {
        return false;
    }

    const buffers = audioBuffers[category];
    const buffer = buffers[Math.floor(Math.random() * buffers.length)];

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
    return true;
}

// --- СИНТЕЗАТОР (Бипы) ---
function beep(freq, duration, type = 'sine', vol = 0.5) {
    if (!audioContext || audioContext.state === 'suspended') return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration);
}

// --- ФОНОВЫЙ ЗВУК (ТИК-ТАК) ---
function startProcessingSound() {
    if (processingInterval) return;
    processingInterval = setInterval(() => {
        beep(800, 0.1, 'sine', 0.2);
        setTimeout(() => beep(600, 0.1, 'sine', 0.2), 150);
    }, 800);
}

function stopProcessingSound() {
    if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
    }
}

// Главная функция звука
function playSound(type) {
    if (!audioContext) return;

    // Сначала пробуем файл
    const playedVoice = playBufferedSound(type);

    // Если файла нет или это специфический звук, играем бип
    if (playedVoice && type !== 'success') return;

    switch (type) {
        case 'wake':
            beep(523.25, 0.6, 'sine', 0.6);
            setTimeout(() => beep(783.99, 0.6, 'sine', 0.6), 200);
            break;
        case 'success':
            beep(1200, 0.15, 'triangle', 0.3);
            break;
        case 'incoming':
            beep(880, 0.1, 'sine', 0.5);
            break;
        case 'mic_open':
            beep(440, 0.1, 'sine', 0.3);
            break;
        case 'sleep':
            beep(400, 0.3, 'sine', 0.5);
            break;
        case 'error':
            beep(150, 0.4, 'sawtooth', 0.6);
            break;
    }
}

// --- ВИЗУАЛИЗАТОР ---
function initVisualizer() {
    const wrapper = document.getElementById('avatar-wrapper');
    if (!wrapper) return;
    const barCount = 150;

    for (let i = 0; i < barCount; i++) {
        const spoke = document.createElement('div');
        spoke.className = 'spoke';
        const bar = document.createElement('div');
        bar.className = 'bar';
        const angle = (360 / barCount) * i;
        spoke.style.transform = `rotate(${angle}deg)`;
        bar.style.animationDelay = `${Math.random() * 1.5}s`;
        spoke.appendChild(bar);
        wrapper.appendChild(spoke);
    }
}









// --- УПРАВЛЕНИЕ РАДИО ---
function playRadio(stationName = null) {
    // Если имя не передано, играем текущую или случайную
    if (!stationName) {
        if (!radioPlayer.src) stationName = 'Маруся ФМ'; // Дефолт
        else {
            radioPlayer.play();
            isRadioPlaying = true;
            setStatus('Радио играет', 'active');
            return;
        }
    }

    // Поиск станции
    let foundIndex = -1;
    if (stationName === 'next') {
        currentStationIndex = (currentStationIndex + 1) % RADIO_STATIONS.length;
        foundIndex = currentStationIndex;
    } else if (stationName === 'prev') {
        currentStationIndex = (currentStationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
        foundIndex = currentStationIndex;
    } else {
        // Нечеткий поиск по названию
        const cleanName = stationName.toLowerCase().trim();
        foundIndex = RADIO_STATIONS.findIndex(s => s.name.toLowerCase().includes(cleanName));
        if (foundIndex === -1) foundIndex = Math.floor(Math.random() * RADIO_STATIONS.length); // Случайная, если не нашли
    }

    currentStationIndex = foundIndex;
    const station = RADIO_STATIONS[currentStationIndex];

    log(`<i class="fas fa-music"></i> Включаю: ${station.name}`, 'sys');

    // Плавное переключение
    radioPlayer.pause();
    radioPlayer.src = station.url;
    // radioPlayer.volume = 0.6; // Громкость радио чуть тише голоса
    radioPlayer.volume = userRadioVolume;
    radioPlayer.play().then(() => {
        isRadioPlaying = true;
        setStatus(`FM: ${station.name}`, 'active');
    }).catch(e => {
        log('Ошибка радио (HTTP/HTTPS?): ' + e.message, 'error');
    });
}

function stopRadio() {
    radioPlayer.pause();
    isRadioPlaying = false;
}

// Функция приглушения/восстановления радио
function setRadioMode(mode) {
    if (!radioPlayer || radioPlayer.paused) return;

    if (mode === 'background') {
        // Режим фона (тихо), чтобы слышать команды
        // radioPlayer.volume = VOL_RADIO_DUCKED;
        radioPlayer.volume = 0.05; // Фиксированно тихо при диалоге
    } else if (mode === 'normal') {
        // Возвращаем нормальную громкость
        // radioPlayer.volume = VOL_RADIO_NORMAL;
        radioPlayer.volume = userRadioVolume; // Возврат к уровню пользователя
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
async function init() {
    try {
        setStatus('Загружаю...', '');
        const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        const modelPath = `${currentPath}/model/vosk-model-small-ru-0.22.zip`;

        log(`Загрузка модели распознавания...`, 'sys');
        model = await Vosk.createModel(modelPath);

        await preloadVoiceAssets();

        setStatus('Готов', '');
        btnStart.disabled = false;
        patrikLookAtMe(); // Поворачиваем Патрика лицом к нам
        log(`Система готова. Нажмите ВКЛЮЧИТЬ! После этого Вы можете ЗАПУСТИТЬ РАДИО, сохранить СОБЫТИЕ или ЗАМЕТКУ. Подробнее <a href="help">ЗДЕСЬ</a>`, 'sys');
        // playSound('success');

        audioPlayer.onended = handleAiFinishedSpeaking;
        audioPlayer.onerror = handleAiFinishedSpeaking;

    } catch (e) {
        setStatus('Ошибка', 'error');
        log(`Ошибка инициализации: ${e.message}`, 'error');
        console.error(e);
    }
}

// --- ОБРАБОТКА РЕЧИ ---
function handleSpeech(text, isFinal) {
    if (!text) return;
    const lower = text.toLowerCase().trim();

    // 1. АНТИ-СПАМ БЛОКИРОВКА СТОП-СЛОВ
    if (stopLock) return;

    // СТОП (с проверкой)
    for (const [trigger, action] of Object.entries(INSTANT_COMMANDS)) {
        if (lower.includes(trigger) && action === 'stop') {
            executeStopCommand(trigger);
            return;
        }
    }

    if (isAiSpeaking) return;
    if (Date.now() - lastCommandTime < COMMAND_COOLDOWN) return;

    // Остальные команды
    for (const [trigger, action] of Object.entries(INSTANT_COMMANDS)) {
        if (lower.includes(trigger)) {
            executeInstantAction(action, trigger);
            return;
        }
    }

    // Активация
    if (!isWaitingForCommand) {
        if (WAKE_WORDS.some(word => lower.includes(word))) {
            activateAI();
        }
        return;
    }

    // Накопление
    if (!hasStartedSpeaking) {
        hasStartedSpeaking = true;
        log('Слышу голос...', 'sys');
    }
    resetSilenceTimer();

    if (isFinal) {
        let cleanText = text;
        WAKE_WORDS.forEach(w => {
            cleanText = cleanText.replace(new RegExp(w, 'gi'), '');
        });
        commandAccumulator += " " + cleanText;
    }
}














function executeStopCommand(triggerWord) {
    stopLock = true;
    setTimeout(() => { stopLock = false; }, 2000);
    // Если мы просто закончили диалог, возвращаем музыку
    // Но если команда была СТОП МУЗЫКА, то stopRadio() уже вызвана ниже, и это не помешает
    if (!isAiSpeaking) {
        setRadioMode('normal');
    }
    // ---------------------
    if (recognizer && typeof recognizer.reset === 'function') {
        recognizer.reset();
    }
    log(`<i class="fas fa-bolt"></i> КОМАНДА: ${triggerWord.toUpperCase()}`, 'wake');

    stopProcessingSound();

    // Останавливаем голос Патрика
    if (isAiSpeaking) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        isAiSpeaking = false;
        const wrapper = document.getElementById('avatar-wrapper');
        if (wrapper) wrapper.classList.remove('is-speaking');
    }

    // Останавливаем Радио
    if (isRadioPlaying) {
        stopRadio();
        log('Радио остановлено.', 'sys');
    }

    isWaitingForCommand = false;
    hasStartedSpeaking = false;
    clearTimeout(silenceTimer);

    if (triggerWord.toUpperCase() == 'ОСТАНОВИ') {
        stop();
        log(`<i class="fas fa-stop-circle"></i> ПАТРИК БОЛЬШЕ НЕ СЛУШАЕТ`, 'wake');
    } else {
        playSound('sleep');
    }

    setStatus('Готов', '');
    lastCommandTime = Date.now();
}




function executeInstantAction(action, triggerWord) {
    const now = Date.now();
    if (now - lastCommandTime < COMMAND_COOLDOWN) return;
    lastCommandTime = now;

    log(`<i class="fas fa-bolt"></i> КОМАНДА: ${triggerWord.toUpperCase()}`, 'wake');
    playSound('success');

    // Логика быстрых команд
    switch (action) {
        case 'next':
            playRadio('next');
            break;
        case 'back':
            playRadio('prev');
            break;
        case 'play':
            playRadio(); // Продолжить играть
            break;
        case 'pause':
            stopRadio();
            break;
        case 'vol_up':
            userRadioVolume = Math.min(1.0, userRadioVolume + 0.2);
            radioPlayer.volume = userRadioVolume;
            log(`Громкость: ${Math.round(userRadioVolume * 100)}%`, 'sys');
            break;
        case 'vol_down':
            userRadioVolume = Math.max(0.1, userRadioVolume - 0.2);
            radioPlayer.volume = userRadioVolume;
            log(`Громкость: ${Math.round(userRadioVolume * 100)}%`, 'sys');
            break;


    }
}







// --- УПРАВЛЕНИЕ ДИАЛОГОМ ---
function activateAI() {
    const now = Date.now();
    if (now - lastCommandTime < 1000) return;

    // Сбрасываем таймер восстановления громкости, чтобы она не скакнула вверх
    if (duckingTimer) clearTimeout(duckingTimer);

    // --- Приглушаем радио ---
    setRadioMode('background');
    // ----------------------------
    patrikLookAtMe();// поворачиваем к нам лицом 3Д модель

    isWaitingForCommand = true;
    hasStartedSpeaking = false;
    commandAccumulator = "";
    lastCommandTime = now;

    playSound('wake');

    setStatus('Слушаю...', 'active');
    log('Активирован!', 'wake');
    resetSilenceTimer();
}

function continueConversation() {
    log('Жду ответ...', 'sys');
    setStatus('Слушаю...', 'active');
    playSound('mic_open');

    isWaitingForCommand = true;
    hasStartedSpeaking = false;
    commandAccumulator = "";
    resetSilenceTimer();
}

function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    const delay = hasStartedSpeaking ? END_OF_PHRASE_DELAY : WAIT_FOR_START_DELAY;
    silenceTimer = setTimeout(finalizeAIRequest, delay);
}

function finalizeAIRequest() {
    if (!isWaitingForCommand) return;
    isWaitingForCommand = false;

    const finalPrompt = commandAccumulator.trim();

    if (finalPrompt.length > 1) {
        playSound('success');
        //sendToOllama(finalPrompt);
        localDo(finalPrompt);
    } else {
        log('Тишина...', 'sys');
        setStatus('Готов', '');
        playSound('sleep');
        patrikTurnAway(); // 3Д модель отворачивается
    }
}

// --- Думаю локально ---
async function localDo(text) {
    setStatus('Думаю...', 'processing');
    log(`Запрос: "${text}"`, 'cmd');

    // Голос "Дай подумать" + Тик-так
    playSound('thinking');
    startProcessingSound();
    stopProcessingSound();
    checkText = " " + text;
    try {
        if (checkText.indexOf('радио') > 0) {
            if (checkText.indexOf('включ') > 0 || checkText.indexOf('запус') > 0 || checkText.indexOf('друг') > 0 || checkText.indexOf('вруб') > 0) {
                playRadio('next')
            }
            if (checkText.indexOf('выключ') > 0 || checkText.indexOf('стоп') > 0) {
                stopRadio();
            }

        }

    } catch (err) {
        log(`Ошибка: ${err.message}`, 'error');
        setStatus('Ошибка', 'error');
        playSound('error');
    }

}


// --- ОТПРАВКА В OLLAMA ---
async function sendToOllama(text) {
    setStatus('Думаю...', 'processing');
    log(`AI Запрос: "${text}"`, 'cmd');

    // Голос "Дай подумать" + Тик-так
    playSound('thinking');
    startProcessingSound();
    let admA = document.getElementById('admA') ? document.getElementById('admA').value : '';
    let kodA = document.getElementById('kodA') ? document.getElementById('kodA').value : '';
    try {
        const response = await fetch('https://dewiar.com/patrik/ollama.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, admA: admA, kodA: kodA })
        });

        stopProcessingSound();

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // --- ДОБАВЛЕНО: УПРАВЛЕНИЕ РАДИО ОТ СЕРВЕРА ---
        if (data.radio_command) {
            playRadio(data.radio_command);
        }
        // ----------------------------------------------

        const aiText = data.text || '';

        // --- КОД ПРОВЕРКИ ОТВЕТА СЕРВЕРА НА СБРОС ---
        if (aiText === "Голова пустая... Кто ты?") {
            logEl.innerHTML = ''; // ОЧИЩАЕМ ВИЗУАЛЬНЫЙ ЛОГ
            // Добавим сообщение об очистке в новый пустой лог
            log('Визуальный лог очищен по команде сервера.', 'sys');
            patrikLookAtMe();// повернулся лицом к нам
        }
        // --- КОНЕЦ КОДА ---

        const newLogItem = log(aiText, 'ai'); // Теперь log возвращает div
        if (newLogItem) {
            // Берем сохраненный чистый ответ (без префикса "Патрик: ")
            const rawContent = newLogItem.getAttribute('data-raw') || '';
            // Парсим как Markdown (он поддерживает HTML-теги внутри себя)
            const htmlContent = marked.parse(rawContent.trim());
            // Вставляем обработанный HTML
            newLogItem.innerHTML = 'Патрик: ' + htmlContent;
            newLogItem.removeAttribute('data-raw');
        }

        if (!aiText) {
            playSound('error');
            setStatus('Готов', '');
            return;
        }

        if (data.audio_url) {
            playAiResponse(data.audio_url);
        } else {
            log('Аудио не получено.', 'error');
            setTimeout(continueConversation, 2000);
        }

    } catch (err) {
        stopProcessingSound();
        log(`Ошибка: ${err.message}`, 'error');
        setStatus('Ошибка', 'error');
        playSound('error');
    }
}




// --- НОВАЯ ФУНКЦИЯ: Единый обработчик завершения речи ---
function handleAiFinishedSpeaking() {
    isAiSpeaking = false;

    // 1. Убираем анимацию говорения
    const wrapper = document.getElementById('avatar-wrapper');
    if (wrapper) wrapper.classList.remove('is-speaking');

    // 2. Восстанавливаем громкость радио (если оно играло)
    setRadioMode('normal');

    // 3. Продолжаем слушать пользователя
    // Вместо startListeningForCommand(), которой нет, используем continueConversation()
    continueConversation();
}






// --- ВОСПРОИЗВЕДЕНИЕ ОТВЕТА ---
function playAiResponse(url) {
    setStatus('Говорю...', 'active');
    const wrapper = document.getElementById('avatar-wrapper');
    if (wrapper) wrapper.classList.add('is-speaking');

    isAiSpeaking = true;

    // Добавляем временную метку, чтобы браузер не кешировал аудио
    audioPlayer.src = url + "?t=" + new Date().getTime();

    // Назначаем наш ЕДИНЫЙ обработчик
    audioPlayer.onended = handleAiFinishedSpeaking;

    // В случае ошибки тоже нужно сбросить состояние, иначе Патрик зависнет
    audioPlayer.onerror = (e) => {
        log("Ошибка плеера: " + e.message || 'Error', 'error');
        handleAiFinishedSpeaking(); // Вызываем тот же сброс
    };

    audioPlayer.play().catch(e => {
        log("Ошибка плеера (автозапуск): " + e.message, 'error');
        handleAiFinishedSpeaking();
    });
}

// --- ЗАПУСК ---
async function start() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true, // Обязательно: вычитает звук из колонок
                noiseSuppression: true, // Убирает фоновый шум
                autoGainControl: true,  // Выравнивает громкость
                channelCount: 1
            }
        });

        recognizer = new model.KaldiRecognizer(16000);


        recognizer.on('result', (msg) => {
            if (msg.result && msg.result.text) handleSpeech(msg.result.text, true);
        });

        recognizer.on('partialresult', (msg) => {
            if (msg.result && msg.result.partial) {
                // Если есть хоть какой-то текст (звук речи) - глушим музыку
                if (msg.result.partial.length > 0) {
                    triggerAudioDucking();
                }
                handleSpeech(msg.result.partial, false);
            }
        });



        const source = audioContext.createMediaStreamSource(mediaStream);
        processor = audioContext.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
            if (!isListening) return;
            recognizer.acceptWaveform(e.inputBuffer);
        };
        source.connect(processor);
        processor.connect(audioContext.destination);

        isListening = true;
        btnStart.style.display = 'none';
        btnStop.style.display = 'inline-block';
        patrikLookAtMe();// повернулся лицом к нам
        setStatus('Готов!', '');
        log('Микрофон включен', 'sys');
        playSound('start');

    } catch (e) {
        log(`Mic Error: ${e.message}`, 'error');
    }
}


function stop() {
    isListening = false;
    isWaitingForCommand = false;
    isAiSpeaking = false;
    stopProcessingSound();
    audioPlayer.pause();
    clearTimeout(silenceTimer);
    patrikTurnAway(); // Патрик отвернулся
    // 1. Сначала проигрываем звук, пока контекст активен
    playSound('stop');
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    // 2. Добавляем гарантированную задержку (например, 400 мс),
    // чтобы дать звуку завершиться перед приостановкой контекста.
    if (audioContext && audioContext.state === 'running') {
        setTimeout(() => {
            // Приостанавливаем только после завершения звука
            audioContext.suspend();
        }, 2000); // 2000 мс достаточно для короткого "бипа"
    }
    btnStart.style.display = 'inline-block';
    btnStop.style.display = 'none';
    setStatus('Отключен', '');
    log('Микрофон отключен', 'sys');
    // Обратите внимание: setStatus вызывается сразу, а suspend - через 2000 мс
}


btnStart.onclick = start;
btnStop.onclick = stop;






// Обработка текстового ввода
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const btnSend = document.getElementById('btnSend');

    if (btnSend && textInput) {
        btnSend.onclick = () => {
            const text = textInput.value.trim();
            if (text) {
                // sendToOllama(text);
                localDo(text);
                textInput.value = '';
            }
        };

        textInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                btnSend.click();
            }
        };
    }
});

// Функция удаления заметки/события через AJAX
function deleteItem(id, type) {
    if (!confirm('Удалить эту запись?')) return;

    let admA = document.getElementById('admA') ? document.getElementById('admA').value : '';
    let kodA = document.getElementById('kodA') ? document.getElementById('kodA').value : '';

    fetch('delete_item.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            type: type,
            admA: admA,
            kodA: kodA
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                log('✓ Запись удалена', 'sys');

                // Находим кнопку, которую нажали, и удаляем весь родительский блок .log-ai
                const allButtons = document.querySelectorAll('.crm-btn.delete');
                allButtons.forEach(btn => {
                    const onclickAttr = btn.getAttribute('onclick');
                    if (onclickAttr && onclickAttr.includes(`deleteItem(${id},`)) {
                        const logBlock = btn.closest('.log-item.log-ai');
                        if (logBlock) {
                            logBlock.remove();
                        }
                    }
                });
            } else {
                log('✗ Ошибка удаления: ' + data.error, 'error');
            }
        })
        .catch(e => log('✗ Ошибка: ' + e.message, 'error'));
}







window.onload = function () {
    initVisualizer();
    init();
};

// --- JS: Обработка Markdown для загруженной истории ---
document.addEventListener('DOMContentLoaded', () => {
    // Выбираем только элементы лога, которые требуют форматирования Markdown
    const markdownElements = document.querySelectorAll('.log-ai-markdown');
    markdownElements.forEach(el => {
        // rawText теперь содержит иконки (<i>) и Markdown-синтаксис (**)
        const rawText = el.innerHTML.replace(/^Патрик: /i, '').trim();
        // Парсим Markdown. marked.js оставит HTML-теги нетронутыми.
        const htmlContent = marked.parse(rawText);
        // Восстанавливаем префикс и вставляем обработанный HTML
        el.innerHTML = 'Патрик: ' + htmlContent;
    });
});
