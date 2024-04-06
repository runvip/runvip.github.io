var s_url = 'https://script.google.com/macros/s/AKfycbzqYcBqof1T2kvjrBa-LSoaq7c4j0wQs1GEDb634OwHnv2PLfnM0-Z3IDdEJbLD1Im3/exec';

const dino = document.getElementById('dino');
const cactus = document.getElementById('cactus');
var gameOn=false;
document.addEventListener("keydown", function () {
    jump();
    gameOn = true;
    document.getElementById('dino_info').innerHTML='ручное управление';
});

document.addEventListener("touchstart", function () {
    jump();
    gameOn = true;
    document.getElementById('dino_info').innerHTML='ручное управление';
});

function jump() {
    if (dino.classList != "jump") {
        dino.classList.add("jump");
    }
    setTimeout(function () {
        dino.classList.remove("jump");
    }, 300)
}

function gameStart() {
    gameOn = true;
}

let isAlive = setInterval( function() {
    let dinoTop = parseInt(window.getComputedStyle(dino).getPropertyValue("top"));
    let cactusLeft = parseInt(window.getComputedStyle(cactus).getPropertyValue("left"));

    if (gameOn == false && cactusLeft < 50 && cactusLeft > 0 && dinoTop >= 140) {
        document.getElementById('dino_info').innerHTML='автопилот';
        jump();
    }

    if (gameOn == true && cactusLeft < 50 && cactusLeft > 0 && dinoTop >= 140) {
        document.getElementById('dino_info').innerHTML='автопилот';
        gameOn = false;
    }
}, 10);
