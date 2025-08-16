document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    // Add click event listeners to all class buttons.
    const buttons = document.querySelectorAll('.class-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {

            const class_id = this.querySelector('.button-text').getAttribute('data-class-id');

            const callback = (responseStatus, responseData) => {
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 300); // Duration matches the buttonClick animation
            }

            fetchMethod(currentUrl + `/api/users/${class_id}/class`, callback, "PUT", null, token)

            // Add the 'clicked' class to trigger a rebound animation.
            this.classList.add('clicked');
        });
    });
})