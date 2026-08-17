
// CONFIGURACIÓN
const CONFIG = {
    GAME_DURATION: 60,
    PLAYER_SPEED: 8,
    INITIAL_FALL_SPEED: 3,
    MAX_FALL_SPEED: 8,
    SPAWN_RATE: 1000,
    PEÑA_NAME: "LA HABITACIÓN DEL PÁNICO"
};

// ESTADO
let state = {
    score: 0,
    time: CONFIG.GAME_DURATION,
    isPlaying: false,
    playerX: 0,
    objects: [],
    keys: { left: false, right: false },
    record: localStorage.getItem('panico_record') || 0
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function init() {
    canvas.width = 800;
    canvas.height = 400;
    state.playerX = canvas.width / 2;
    
    // UI Events
    document.getElementById('btn-start').onclick = startGame;
    document.getElementById('btn-restart').onclick = startGame;
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = true;
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') state.keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') state.keys.right = false;
    });

    // Touch events
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    
    btnLeft.onpointerdown = () => state.keys.left = true;
    btnLeft.onpointerup = () => state.keys.left = false;
    btnRight.onpointerdown = () => state.keys.right = true;
    btnRight.onpointerup = () => state.keys.right = false;
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    state.score = 0;
    state.time = CONFIG.GAME_DURATION;
    state.isPlaying = true;
    document.getElementById('screen-start').classList.add('hidden');
    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    
    // Spawn loop
    const spawner = setInterval(() => {
        if(state.isPlaying) spawnObject();
        else clearInterval(spawner);
    }, CONFIG.SPAWN_RATE);
    
    // Timer
    const timer = setInterval(() => {
        if(state.isPlaying) {
            state.time--;
            if(state.time <= 0) endGame();
        } else {
            clearInterval(timer);
        }
    }, 1000);
}

function spawnObject() {
    state.objects.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        speed: CONFIG.INITIAL_FALL_SPEED + (CONFIG.GAME_DURATION - state.time) * 0.1
    });
}

function update() {
    if(!state.isPlaying) return;
    
    if(state.keys.left && state.playerX > 0) state.playerX -= CONFIG.PLAYER_SPEED;
    if(state.keys.right && state.playerX < canvas.width - 60) state.playerX += CONFIG.PLAYER_SPEED;
    
    state.objects.forEach((obj, i) => {
        obj.y += obj.speed;
        
        // Collision
        if (obj.y > 300 && obj.y < 350 && obj.x > state.playerX - 20 && obj.x < state.playerX + 40) {
            state.score++;
            state.objects.splice(i, 1);
            document.getElementById('hud-score').innerText = `PUNTOS: ${state.score.toString().padStart(4, '0')}`;
        }
        
        if (obj.y > canvas.height) state.objects.splice(i, 1);
    });
    
    document.getElementById('hud-time').innerText = `TIEMPO: 00:${state.time.toString().padStart(2, '0')}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Door
    ctx.fillStyle = "#add8e6";
    ctx.fillRect(100, 50, 150, 250);
    
    // Draw Player
    ctx.fillStyle = "#fff";
    ctx.fillRect(state.playerX, 320, 50, 60);
    
    // Draw Objects
    ctx.fillStyle = "#ff0";
    state.objects.forEach(obj => ctx.fillRect(obj.x, obj.y, 30, 40));
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    state.isPlaying = false;
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('screen-gameover').classList.remove('hidden');
    if(state.score > state.record) {
        state.record = state.score;
        localStorage.setItem('panico_record', state.record);
    }
    document.getElementById('go-stats').innerText = `PUNTUACIÓN: ${state.score} | RÉCORD: ${state.record}`;
}

init();
