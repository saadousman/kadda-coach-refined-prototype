document.addEventListener('DOMContentLoaded', function() {
    // Example of how to update points and username dynamically
    document.getElementById('points').innerText = '1500';
    document.getElementById('username').innerText = 'JohnDoe';
});

function startGame(gameTitle) {
    document.getElementById('main-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    document.getElementById('game-title').innerText = gameTitle;
}

function goBackToMain() {
    document.getElementById('main-screen').classList.remove('d-none');
    document.getElementById('game-screen').classList.add('d-none');
}
