document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('points').innerText = '0';
    document.getElementById('username').innerText = 'JohnDoe';
});

let currentQuestionIndex = 0;
let points = 0;
let questions = [];
let currentGame = '';

function showDifficultySelection(game) {
    currentGame = game;
    document.getElementById('main-screen').classList.add('d-none');
    document.getElementById('difficulty-screen').classList.remove('d-none');
}

function startGame(difficulty) {
    resetGameState();
    document.getElementById('logo-container').classList.add('d-none');
    document.getElementById('difficulty-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    document.getElementById('game-title').innerText = `${difficulty} ${currentGame} Game`;

    loadQuestions(difficulty);
}

function goBackToMain() {
    resetGameState();
    document.getElementById('logo-container').classList.remove('d-none');
    document.getElementById('main-screen').classList.remove('d-none');
    document.getElementById('difficulty-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('congrats-page').classList.add('d-none');
}

function goBackToDifficulty() {
    resetGameState();
    document.getElementById('difficulty-screen').classList.remove('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('congrats-page').classList.add('d-none');
}

function resetGameState() {
    currentQuestionIndex = 0;
    points = 0;
    document.getElementById('points').innerText = points;
    document.getElementById('feedback-popup').classList.add('d-none');
    document.getElementById('next-button').classList.add('d-none');
    document.getElementById('video-container').innerHTML = '';
    document.getElementById('question').innerText = '';
    document.getElementById('answers-container').innerHTML = '';
    updateProgressBar();
}

function loadQuestions(difficulty) {
    const filePath = difficulty === 'Easy'
        ? `content/easy${currentGame}Questions.json`
        : `content/advanced${currentGame}Questions.json`;
    
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestion();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showCongrats();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '<div id="loader" class="loader"></div>';
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '200';
    iframe.src = questionData.video;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.classList.add('rounded-frame');
    iframe.onload = function() {
        document.getElementById('loader').classList.add('d-none');
        iframe.classList.remove('d-none');
    };
    iframe.classList.add('d-none');
    videoContainer.appendChild(iframe);
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
    let feedbackMessage;
    if (index === questionData.correct) {
        points += 10;
        feedbackMessage = 'Correct!';
        document.getElementById('next-button').classList.remove('d-none');
        
        // Check if it's the last question
        if (currentQuestionIndex === questions.length - 1) {
            document.getElementById('next-button').innerText = 'Finish';
            document.getElementById('next-button').onclick = showCongrats;
        } else {
            document.getElementById('next-button').innerText = 'Next Question';
            document.getElementById('next-button').onclick = nextQuestion;
        }
    } else {
        points -= 1;
        feedbackMessage = 'Incorrect!';
        document.getElementById('next-button').classList.add('d-none');
    }
    document.getElementById('points').innerText = points;
    document.getElementById('feedback-message').innerText = feedbackMessage;
    document.getElementById('feedback-popup').classList.remove('d-none');

    if (index !== questionData.correct) {
        setTimeout(() => {
            document.getElementById('feedback-popup').classList.add('d-none');
        }, 2000);
    }
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
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('feedback-popup').classList.add('d-none');
    document.getElementById('congrats-page').classList.remove('d-none');
    document.getElementById('final-score').innerText = `Your final score is: ${points}`;
}

function shareAchievement() {
    if (navigator.share) {
        navigator.share({
            title: 'Kadda Coach',
            text: 'I completed the comprehension game and scored high! Check out this awesome GIF!',
            url: 'https://giphy.com/embed/xT0GqssRweIhlz209i' // Link to the GIF
        });
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}
