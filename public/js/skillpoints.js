document.addEventListener("DOMContentLoaded", function () {

    // Skillpoints bar
    const barElement = document.getElementById('skillpoints'); // The progress bar element

    // Function to update the skillpoints bar
    function updateBar() {
        let totalPoints = parseInt(localStorage.getItem('totalPoints') || '0');
        // Calculate the width of the bar based on skill points (0 to 250)
        const width = (totalPoints / 250) * 100;
        barElement.style.width = `${width}%`;
    }

    // Function to reset skill points at the start of a new day
    function resetSkillPoints() {
        const currentTime = new Date();
        const lastReset = localStorage.getItem('lastReset');

        if (!lastReset || new Date(lastReset).toDateString() !== currentTime.toDateString()) {
            localStorage.setItem('totalPoints', 0); // Reset points in localStorage
            updateBar(); // Reset the progress bar
            localStorage.setItem('lastReset', currentTime.toString()); // Store the current date as last reset
        }
    }


    resetSkillPoints();
    updateBar();
});