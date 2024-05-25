document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('points').innerText = '0';
    document.getElementById('username').innerText = 'JohnDoe';
});

let currentQuestionIndex = 0;
let points = 0;
let questions = [];
let currentGame = '';
let player;
let isPlayerReady = false;

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
    questions = [];
    if (player) {
        player.destroy();
        player = null;
        isPlayerReady = false;
    }
    document.getElementById('points').innerText = points;
    document.getElementById('feedback-popup').classList.add('d-none');
    document.getElementById('next-button').classList.add('d-none');
    document.getElementById('video-container').innerHTML = '<div id="loader" class="loader"></div><div id="player"></div>';
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
            currentQuestionIndex = 0;
            loadQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert(`Failed to load questions. Please check the console for more details.`);
            goBackToDifficulty();
        });
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showCongrats();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    document.getElementById('video-container').innerHTML = '<div id="loader" class="loader"></div><div id="player"></div>';
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

    if (!isPlayerReady) {
        initializeYouTubePlayer(questionData.video, questionData.start, questionData.end);
    } else {
        player.cueVideoById({
            videoId: questionData.video,
            startSeconds: questionData.start,
            endSeconds: questionData.end
        });
    }
}

function initializeYouTubePlayer(videoId, startSeconds, endSeconds) {
    player = new YT.Player('player', {
        height: '200',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'start': startSeconds,
            'end': endSeconds,
            'loop': 1,
            'controls': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    const questionData = questions[currentQuestionIndex];
    player.cueVideoById({
        videoId: questionData.video,
        startSeconds: questionData.start,
        endSeconds: questionData.end
    });
    document.getElementById('loader').classList.add('d-none');
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        const questionData = questions[currentQuestionIndex];
        player.seekTo(questionData.start);
    }
}

function checkAnswer(index) {
    const questionData = questions[currentQuestionIndex];
    let feedbackMessage;
    if (index === questionData.correct) {
        points += 10;
        feedbackMessage = 'Correct!';
        document.getElementById('next-button').classList.remove('d-none');
        
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
            url: 'https://giphy.com/embed/xT0GqssRweIhlz209i'
        });
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}

// Load YouTube IFrame API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
