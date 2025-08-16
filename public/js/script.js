// document.addEventListener("DOMContentLoaded", function () {
//     // Toggle the profile panel and overlay when the profile picture is clicked
//     document.getElementById('profilePic').addEventListener('click', function(event) {
//         event.stopPropagation(); // Prevent click from propagating to the document (so the panel doesn't immediately close)
        
//         // Toggle the profile panel and overlay visibility
//         document.getElementById('profilePanel').classList.toggle('active');
//         document.getElementById('overlay').classList.toggle('active');
//     });

//     // Close the profile panel and overlay when clicking outside of it
//     document.addEventListener('click', function(event) {
//         const panel = document.getElementById('profilePanel');
//         const overlay = document.getElementById('overlay');
//         const profilePic = document.getElementById('profilePic');

//         // Check if the click was outside the profile panel and the profile picture
//         if (!panel.contains(event.target) && !profilePic.contains(event.target)) {
//         // Close the panel and overlay if clicked outside
//         panel.classList.remove('active');
//         overlay.classList.remove('active');
//         }
//     });
// })