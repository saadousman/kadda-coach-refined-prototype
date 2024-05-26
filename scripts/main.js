function goBackToMain() {
    location.href = 'index.html';
}

function goBackToDifficulty() {
    location.reload();
}

function shareAchievement() {
    if (navigator.share) {
        navigator.share({
            title: 'Kadda Coach',
            text: 'I completed the game and scored high! Check out this awesome GIF!',
            url: 'https://giphy.com/embed/xT0GqssRweIhlz209i'
        });
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}
