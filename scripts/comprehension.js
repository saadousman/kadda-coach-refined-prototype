document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('points').innerText = '0';
    document.getElementById('username').innerText = 'JohnDoe';
});

let currentQuestionIndex = 0;
let points = 0;
let questions = [];
let player;
let isPlayerReady = false;
let isAPIReady = false;

function startGame(difficulty) {
    resetGameState();
    document.getElementById('difficulty-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    document.getElementById('game-title').innerText = `${difficulty} Comprehension Game`;

    loadQuestions(difficulty);
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
        ? 'content/easyComprehensionQuestions.json'
        : 'content/advancedComprehensionQuestions.json';
    
    fetch(filePath)
        .then(response => response.json())
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;
            loadQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert('Failed to load questions.');
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

    if (isAPIReady) {
        initializeYouTubePlayer(questionData.video, questionData.start, questionData.end);
    } else {
        console.log('YouTube API is not ready yet.');
    }
}

function initializeYouTubePlayer(videoId, startSeconds, endSeconds) {
    if (player) {
        player.destroy();
    }
    player = new YT.Player('player', {
        height: '200',
        width: '100%',
        videoId: videoId,
        playerVars: {
            start: startSeconds,
            end: endSeconds,
            loop: 1,
            controls: 0,
            modestbranding: 1
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready');
    isPlayerReady = true;
    document.getElementById('loader').classList.add('d-none');
    const questionData = questions[currentQuestionIndex];
    player.cueVideoById({
        videoId: questionData.video,
        startSeconds: questionData.start,
        endSeconds: questionData.end
    });
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

// Load YouTube IFrame API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
    isAPIReady = true;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    }
}

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
