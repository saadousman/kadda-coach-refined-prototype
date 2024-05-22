document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('points').innerText = '1500';
    document.getElementById('username').innerText = 'JohnDoe';
});

const questions = [
    {
        video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        question: 'What is the color of the sky in the video?',
        answers: ['Red', 'Blue', 'Green', 'Yellow'],
        correct: 1
    },
    // Add more questions as needed
];

let currentQuestionIndex = 0;
let points = 1500;

function startGame(gameTitle) {
    document.getElementById('main-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    document.getElementById('game-title').innerText = gameTitle;

    if (gameTitle === 'Game 1') {
        document.getElementById('game-1').classList.remove('d-none');
    } else if (gameTitle === 'Game 2') {
        document.getElementById('comprehension-game').classList.remove('d-none');
        loadQuestion();
    }
}

function goBackToMain() {
    document.getElementById('main-screen').classList.remove('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('game-1').classList.add('d-none');
    document.getElementById('comprehension-game').classList.add('d-none');
    document.getElementById('feedback-popup').classList.add('d-none');
    document.getElementById('congrats-popup').classList.add('d-none');
    currentQuestionIndex = 0;
    updateProgressBar();
}

function playWord() {
    const audio = new Audio('path_to_your_audio_file.mp3');
    audio.play();
    document.getElementById('feedback').innerText = 'Listen to the word and try to pronounce it!';
}

function recordPronunciation() {
    // Mock recording functionality
    document.getElementById('feedback').innerText = 'Recording...';
    setTimeout(() => {
        document.getElementById('feedback').innerText = 'Your pronunciation is great!';
    }, 2000);
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showCongrats();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    document.getElementById('video-container').innerHTML = `<iframe width="100%" height="315" src="${questionData.video}" frameborder="0" allowfullscreen></iframe>`;
    document.getElementById('question').innerText = questionData.question;
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    questionData.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-secondary', 'answer-btn');
        button.innerText = answer;
        button.onclick = () => checkAnswer(index);
        answersContainer.appendChild(button);
    });
}

function checkAnswer(index) {
    const questionData = questions[currentQuestionIndex];
    if (index === questionData.correct) {
        points += 100;
        document.getElementById('feedback-message').innerText = 'Correct!';
    } else {
        points -= 50;
        document.getElementById('feedback-message').innerText = 'Incorrect!';
    }
    document.getElementById('points').innerText = points;
    document.getElementById('feedback-popup').classList.remove('d-none');
}

function nextQuestion() {
    currentQuestionIndex++;
    updateProgressBar();
    document.getElementById('feedback-popup').classList.add('d-none');
    loadQuestion();
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function showCongrats() {
    document.getElementById('game-container').classList.add('d-none');
    document.getElementById('congrats-popup').classList.remove('d-none');
    showFireworks();
}

function showFireworks() {
    const fireworksContainer = document.getElementById('fireworks-container');
    // Add fireworks animation logic here
}

function shareAchievement() {
    if (navigator.share) {
        navigator.share({
            title: 'Kadda Coach',
            text: 'I completed the comprehension game!',
            url: window.location.href
        });
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}
