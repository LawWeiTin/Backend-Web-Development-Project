document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    // Get references to elements
    const changePictureBtn = document.getElementById('change-picture-btn');
    const pictureSelector = document.getElementById('picture-selector');

    // Show the picture selection box when the 'Change Picture' button is clicked
    changePictureBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        pictureSelector.classList.toggle('show');
    });

    // Close the picture selector when clicking outside of it
    document.addEventListener('click', function(event) {
        // Check if the click was outside the button and picture selector
        if (!changePictureBtn.contains(event.target) && !pictureSelector.contains(event.target)) {
            pictureSelector.classList.remove('show');
        }
    });

    document.getElementById("picture-selector").addEventListener("click", function(event) {
        // Check if the clicked element is a "Complete" button
        if (event.target && event.target.classList.contains("profile-option")) {
            const profile = event.target.getAttribute("data-profile-path");
            console.log(`Changing profile picture to ${profile}`);
    
            const callback = (responseStatus, responseData) => {
                console.log("responseStatus:", responseStatus);
                console.log("responseData:", responseData);

                window.location.href = "profile.html";
            }

            const data = {
                profile: profile
            }
        
            fetchMethod(currentUrl + '/api/users/profile', callback, "PUT", data, token)
        }
    });



})