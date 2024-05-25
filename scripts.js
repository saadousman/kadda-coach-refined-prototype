document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('points').innerText = '0';
    document.getElementById('username').innerText = 'JohnDoe';
});

// Initialize variables
let currentQuestionIndex = 0;
let points = 0;
let questions = [];
let currentGame = '';
let player;
let isPlayerReady = false;

// Show difficulty selection screen
function showDifficultySelection(game) {
    currentGame = game;
    document.getElementById('main-screen').classList.add('d-none');
    document.getElementById('difficulty-screen').classList.remove('d-none');
}

// Start the game with selected difficulty
function startGame(difficulty) {
    resetGameState();
    document.getElementById('logo-container').classList.add('d-none');
    document.getElementById('difficulty-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.remove('d-none');
    document.getElementById('game-title').innerText = `${difficulty} ${currentGame} Game`;

    loadQuestions(difficulty);
}

// Go back to main screen
function goBackToMain() {
    resetGameState();
    document.getElementById('logo-container').classList.remove('d-none');
    document.getElementById('main-screen').classList.remove('d-none');
    document.getElementById('difficulty-screen').classList.add('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('congrats-page').classList.add('d-none');
}

// Go back to difficulty selection screen
function goBackToDifficulty() {
    resetGameState();
    document.getElementById('difficulty-screen').classList.remove('d-none');
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('congrats-page').classList.add('d-none');
}

// Reset the game state
function resetGameState() {
    currentQuestionIndex = 0;
    points = 0;
    questions = [];
    if (player) {
        player.stopVideo();
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

// Load questions based on difficulty
function loadQuestions(difficulty) {
    const filePath = difficulty === 'Easy'
        ? `content/easy${currentGame}Questions.json`
        : `content/advanced${currentGame}Questions.json`;
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;
            loadQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert(`Failed to load questions from ${filePath}. Please check the console for more details.`);
            goBackToDifficulty();
        });
}

// Load a question
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showCongrats();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '<div id="loader" class="loader"></div><div id="player"></div>';
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

    if (isPlayerReady) {
        player.loadVideoById({
            videoId: questionData.video,
            startSeconds: questionData.start,
            endSeconds: questionData.end
        });
        document.getElementById('loader').classList.add('d-none');
    } else {
        onYouTubeIframeAPIReady();
    }
}

// Initialize YouTube IFrame API
function onYouTubeIframeAPIReady() {
    const questionData = questions[currentQuestionIndex];
    player = new YT.Player('player', {
        height: '200',
        width: '100%',
        videoId: questionData.video,
        playerVars: {
            'start': questionData.start,
            'end': questionData.end,
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

// YouTube player ready event
function onPlayerReady(event) {
    event.target.playVideo();
    isPlayerReady = true;
    document.getElementById('loader').classList.add('d-none');
}

// YouTube player state change event
function onPlayerStateChange(event) {
    const questionData = questions[currentQuestionIndex];
    if (event.data == YT.PlayerState.ENDED) {
        player.seekTo(questionData.start);
    }
}

// Check the selected answer
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

// Load the next question
function nextQuestion() {
    currentQuestionIndex++;
    updateProgressBar();
    document.getElementById('feedback-popup').classList.add('d-none');
    loadQuestion();
}

// Update the progress bar
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// Show the congratulations screen
function showCongrats() {
    document.getElementById('game-screen').classList.add('d-none');
    document.getElementById('feedback-popup').classList.add('d-none');
    document.getElementById('congrats-page').classList.remove('d-none');
    document.getElementById('final-score').innerText = `Your final score is: ${points}`;
}

// Share the achievement
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

// Load YouTube IFrame API
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
