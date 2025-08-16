document.addEventListener("DOMContentLoaded", function () {

    // Dummy callback for Card 1
    function callbackForCard1(responseStatus, responseData) {
        if (responseStatus === 200) {
            document.getElementById("card1-number").textContent = responseData.length;
            document.getElementById("card1-title").textContent = "Users";
            document.getElementById("card1-footer").textContent = "Be the first to join!";
        }
    }

    // Dummy callback for Card 2
    function callbackForCard2(responseStatus, responseData) {
        if (responseStatus === 200) {
            document.getElementById("card2-number").textContent = responseData.length;
            document.getElementById("card2-title").textContent = "Completed Challenges!";
            document.getElementById("card2-footer").textContent = "Fitness is key to life.";
        }
    }

    // Dummy callback for Card 3
    function callbackForCard3(responseStatus, responseData) {
        if (responseStatus === 200) {
            document.getElementById("card3-number").textContent = responseData.length;
            document.getElementById("card3-title").textContent = "Regions to explore!";
            document.getElementById("card3-footer").textContent = "Fight dungeons with your friends!";
        }
    }

    function callbackForChallengeLeaderboard(responseStatus, responseData) {
        if (responseStatus === 200) {
            const tbody = document.getElementById("challengeLeaderboardTableBody");
            tbody.innerHTML = ""; // Clear any existing rows.
            responseData.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.username}</td>
                <td>${row.challenges_completed}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function callbackForPowerLeaderboard(responseStatus, responseData) {
        if (responseStatus === 200) {
            const tbody = document.getElementById("userLeaderboardTableBody");
            tbody.innerHTML = ""; // Clear any existing rows.
            responseData.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.username}</td>
                <td>${row.Power}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Cards
    fetchMethod(currentUrl + '/api/users', callbackForCard1);
    fetchMethod(currentUrl + '/api/challenges/completions', callbackForCard2);
    fetchMethod(currentUrl + '/api/map', callbackForCard3);

    // Leaderboards
    fetchMethod(currentUrl + '/api/users/challengeleaderboard', callbackForChallengeLeaderboard);
    fetchMethod(currentUrl + '/api/users/powerleaderboard', callbackForPowerLeaderboard);
})