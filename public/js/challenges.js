document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");
    const toastContainer = document.getElementById("toastContainer");

    function showToast(message, type = "primary", icon='<i class="fa-solid fa-check"></i>') {
        // Create toast element
        let toastEl = document.createElement("div");
        toastEl.className = `toast align-items-center text-bg-${type} border-0 show challengeNotifications`;
        toastEl.setAttribute("role", "alert");
        toastEl.setAttribute("aria-live", "assertive");
        toastEl.setAttribute("aria-atomic", "true");

        // Toast inner content
        toastEl.innerHTML = `
            <div class="d-flex m-3">
                <div class="toast-body">
                    <strong>${icon}&nbsp;&nbsp;${message}</strong>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        // Append to toast container
        toastContainer.appendChild(toastEl);

        // Initialize and show toast
        let toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();

        // Remove toast from DOM after hiding
        toastEl.addEventListener("hidden.bs.toast", function () {
            toastEl.remove();
        });
    }

    const callbackForGettingAllChallenge = (responseStatus, responseData) => {
        console.log("callbackForGettingAllChallenge status:", responseStatus);

        const challenges = document.getElementById("challenges");
        challenges.innerHTML = "";

        responseData.forEach(challenge => {

            const displayItem = document.createElement("div");
            displayItem.className =
            "col-md-4 p-3";

            displayItem.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${challenge.challenge}</h5>
                    <p class="card-text">
                        Skillpoints: ${challenge.skillpoints}
                    </p>

                    <!-- Best & Worst Reviews Section (Styled like "All Reviews") -->
                    <div class="best-worst-reviews">
                        <div class="card mb-2">
                            <div class="card-body">
                                <h6 class="card-title"><i class="fa-solid fa-face-smile"></i> Best Review</h6>
                                <p id="bestReview-${challenge.challenge_id}" class="card-text text-muted">Loading...</p>
                            </div>
                        </div>
                        <div class="card mb-2">
                            <div class="card-body">
                                <h6 class="card-title"><i class="fa-solid fa-face-sad-tear"></i> Worst Review</h6>
                                <p id="worstReview-${challenge.challenge_id}" class="card-text text-muted">Loading...</p>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between">
                        <a href="#" class="btn btn-primary completeChallenge" data-challenge-id="${challenge.challenge_id}">Complete</a>
                        <a href="#" class="btn btn-success review-button" id="review${challenge.challenge_id}"  data-bs-toggle="modal" data-bs-target="#exampleModal${challenge.challenge_id}">Rate</a>
                    </div>
                </div>
            </div>
            
            <!-- Modal -->
            <div class="modal fade" id="exampleModal${challenge.challenge_id}" tabindex="-1" aria-labelledby="exampleModalLabel${challenge.challenge_id}" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content text-black">
                        <div class="modal-header">
                            <p class="modal-title fs-5 text-center w-100 fw-bold" id="exampleModalLabel"><span style="text-transform: uppercase; letter-spacing: 10px;">Reviewing</span>:<br> ${challenge.challenge}</p>
                            <button type="button" class="btn-close position-absolute end-0 me-3" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div id="reviewSection-${challenge.challenge_id}">
                                <!-- User's review or rating form will be injected here -->
                            </div>
                            <div class="container mt-5">
                                <div class="row" id="challengeReview${challenge.challenge_id}">
                                    <!-- Cards will be injected here by JavaScript -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            challenges.appendChild(displayItem);

            const callbackToViewAllReviewsForChallenge = (responseStatus, responseData) => {
                const allReview = document.getElementById(`challengeReview${challenge.challenge_id}`);
            
                if (responseStatus === 200) {
                    allReview.innerHTML = ''; // Clear existing content before appending new reviews
            
                    responseData.forEach(review => {
                        const reviewCard = document.createElement('div');
                        reviewCard.classList.add('col-12', 'mb-4');
        
                        reviewCard.innerHTML = `
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${review.username}</h5>
                                    <div class="star-rating">${generateStarHTML(review.rating)}</div>
                                    <p class="card-text">${review.message === '-' ? '' : review.message}</p>
                                </div>
                            </div>
                        `;
        
                        allReview.appendChild(reviewCard);
                    });
                } else {
                    allReview.innerHTML = `
                        <div class="container">
                            <p class="fs-6 text-center">${responseData.message}</p>
                        </div>
                    `;
                }
            };


            const callbackForShowingForm = (responseStatus, responseData) => {
                if (responseStatus === 200) {
                    const reviewSection = document.getElementById(`reviewSection-${challenge.challenge_id}`);
                    const user_id = responseData.user_id;
            
                    const userReview = responseData.results.find(review => review.user_id === user_id);
    
                    if (userReview) {
                        // Show user's review
                        updateReviewUI(challenge.challenge_id, userReview.rating, userReview.message, callbackToViewAllReviewsForChallenge);
                    } else {
                        // User hasn't reviewed, show the form
                        renderReviewForm(reviewSection, challenge.challenge_id, callbackToViewAllReviewsForChallenge);
                    }
                }
            }

            fetchMethod(currentUrl + `/api/challenges/${challenge.challenge_id}/review/bestandworst`, (responseStatus, responseData) => {
                if (responseStatus === 200) {
                    updateBestWorstReview(challenge.challenge_id, responseData);
                } else {
                    document.getElementById(`bestReview-${challenge.challenge_id}`).textContent = "No reviews yet.";
                    document.getElementById(`worstReview-${challenge.challenge_id}`).textContent = "No reviews yet.";
                }
            })
            // fetchMethod(currentUrl + `/api/challenges/${challenge.challenge_id}`, callbackForCheckingUserCompletion, 'GET', null, token)
            fetchMethod(currentUrl + `/api/challenges/${challenge.challenge_id}/all_user_reviews`, callbackForShowingForm, 'GET', null, token)
            fetchMethod(currentUrl + `/api/challenges/${challenge.challenge_id}/review`, callbackToViewAllReviewsForChallenge)
        });
    }



    const generateStarInputs = (challengeId, selectedRating) => {
        let starsHTML = "";
        for (let i = 5; i >= 1; i--) {
            const checked = i === selectedRating ? "checked" : "";
            starsHTML += `
                <input type="radio" id="star${i}-${challengeId}" name="rate-${challengeId}" value="${i}" ${checked} />
                <label for="star${i}-${challengeId}" title="${i} stars"><i class="fa-solid fa-star"></i></label>
            `;
        }
        return starsHTML;
    };

    const generateStarHTML = (rating) => {
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i class="fa-solid fa-star ${i <= rating ? 'checked' : 'unchecked'}"></i>`;
        }
        return starsHTML;
    };

    const submitOrUpdateReview = (challengeId, callback, existingReview = null) => {
        const rating = document.querySelector(`input[name="rate-${challengeId}"]:checked`)?.value || 0;
        const reviewText = document.getElementById(`reviewTextarea-${challengeId}`).value.trim();
    
        if (!rating) {
            showToast("Please select a rating!", "danger", '<i class="fa-solid fa-xmark"></i>');
            return;
        }
        console.log(rating)
        const data = { 
            rating: rating, 
            review: reviewText 
        };

        const CRUD = existingReview ? 'PUT' : 'POST';
    
        fetchMethod(currentUrl + `/api/challenges/${challengeId}/review`, (responseStatus, responseData) => {
            if (responseStatus === 200) {
                showToast(existingReview ? "Review updated successfully!" : "Review submitted!", "success");
                // Update the modal UI dynamically instead of reloading
                updateReviewUI(challengeId, rating, reviewText, callback);
                // Update all the reviews from all users
                fetchMethod(currentUrl + `/api/challenges/${challengeId}/review`, callback, 'GET', null, token);


                fetchMethod(currentUrl + `/api/challenges/${challengeId}/review/bestandworst`, (responseStatus, responseData) => {
                    if (responseStatus === 200) {
                        updateBestWorstReview(challengeId, responseData); 
                    }
                });


                // Hide the modal after successful submission
                const modal = bootstrap.Modal.getInstance(document.getElementById(`exampleModal${challengeId}`));
                modal.hide();
            } else if (responseStatus === 401) {
                showToast("Log in to submit a review!", "danger");
            } else {
                showToast("Message too long! Try again.", "danger")
            }
        }, CRUD, data, token);
    };

    const renderReviewForm = (reviewSection, challengeId, callback, existingReview = null) => {
        const ratingValue = existingReview ? existingReview.rating : 0;
        const reviewMessage = existingReview ? existingReview.review : ""
        reviewSection.innerHTML = `
            <form class="rating-form" id="ratingForm-${challengeId}">
                <div class="rate">
                    ${generateStarInputs(challengeId, ratingValue)}
                </div>
                <div class="form-floating">
                    <textarea class="form-control" id="reviewTextarea-${challengeId}">${reviewMessage === '-' ? '' : reviewMessage}</textarea>
                    <label for="reviewTextarea-${challengeId}">Say anything!</label>
                </div>
                <button type="submit" class="btn btn-${existingReview ? 'warning' : 'success'} my-3 w-100">
                    ${existingReview ? 'Update Rating' : 'Submit Rating'}
                </button>
            </form>
        `;

        if (existingReview) {
            document.querySelector(`#star${existingReview.rating}-${challengeId}`).checked = true;
        }        

        document.getElementById(`ratingForm-${challengeId}`).addEventListener("submit", function (event) {
            event.preventDefault();
            const modal = bootstrap.Modal.getInstance(document.getElementById(`exampleModal${challengeId}`));

            const callbackForCheckingUserCompletion = (responseStatus, responseData) => {
                if (responseStatus === 200) {
                    const user_id = responseData.user_id;
                    const completed = responseData.results.find(completion => completion.user_id === user_id);

                    if (completed) {
                        submitOrUpdateReview(challengeId, callback, existingReview);
                    } else {
                        // Prevent modal from opening & show warning
                        modal.hide();
                        showToast("You must complete the challenge before reviewing!", "danger", '<i class="fa-solid fa-xmark"></i>');
                    }
                } else {
                    modal.hide();
                    showToast("Log in before rating!", "danger", '<i class="fa-solid fa-xmark"></i>');
                }
            };
    
            // Fetch user challenge completion status
            fetchMethod(currentUrl + `/api/challenges/${challengeId}`, callbackForCheckingUserCompletion, 'GET', null, token);
        
        });
    };
    
    // Update the UI after review submission
    const updateReviewUI = (challengeId, rating, reviewText, callback) => {
        const reviewSection = document.getElementById(`reviewSection-${challengeId}`);
        const existingReview = {
            rating: rating,
            review: reviewText
        }
        reviewSection.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Your Review</h5>
                    <div class="star-rating">${generateStarHTML(rating)}</div>
                    <p class="card-text">${reviewText}</p>
                    <button class="btn btn-warning updateReviewBtn w-100" data-challenge-id="${challengeId}">Update Review</button>
                </div>
            </div>
        `;
    
        // Attach event listener for updating review
        document.querySelector(`.updateReviewBtn[data-challenge-id="${challengeId}"]`).addEventListener("click", function () {
            renderReviewForm(reviewSection, challengeId, callback, existingReview);
        });
    };


    const updateBestWorstReview = (challengeId, responseData) => {
        const bestReview = responseData.at(-1);
        const worstReview = responseData[0];
        // Get elements for best and worst reviews
        const bestReviewElement = document.getElementById(`bestReview-${challengeId}`);
        const worstReviewElement = document.getElementById(`worstReview-${challengeId}`);
    
        // Format Best Review
        if (bestReview) {
            const reviewMessage = bestReview.message === "-" ? "" : `"${bestReview.message}"`;
            bestReviewElement.innerHTML = `
                <strong>${bestReview.username}</strong><br>
                <div class="star-rating my-2">${generateStarHTML(bestReview.rating)}</div>
                ${reviewMessage}
            `;
        } else {
            bestReviewElement.innerHTML = `<span class="text-muted">No best reviews... :(</span>`;
        }
    
        // Format Worst Review
        if (worstReview !== bestReview) {
            const reviewMessage = worstReview.message === "-" ? "" : `"${worstReview.message}"`;
            worstReviewElement.innerHTML = `
                <strong>${worstReview.username}</strong><br>
                <div class="star-rating my-2">${generateStarHTML(worstReview.rating)}</div>
                ${reviewMessage}
            `;
        } else {
            worstReviewElement.innerHTML = `<span class="text-muted">No worst reviews. Woohoo!</span>`;
        }
    };



    document.getElementById("challenges").addEventListener("click", function(event) {
        // Check if the clicked element is a "Complete" button
        if (event.target && event.target.classList.contains("completeChallenge")) {
            event.preventDefault();
            const challenge_id = event.target.getAttribute("data-challenge-id");
            console.log("Challenge to complete:", challenge_id);
    
            const callbackForCompletingChallenge = (responseStatus, responseData) => {
                console.log("callbackForCompletingChallenge status:", responseStatus);
                if (responseStatus === 201) {
                    showToast("Challenge Completed Successfully!", "success", '<i class="fa-brands fa-dribbble"></i>');
                } else {
                    showToast("Log in as a User to complete this challenge!", "danger", '<i class="fa-solid fa-xmark"></i>');
                }
            };

    
            fetchMethod(currentUrl + `/api/challenges/${challenge_id}`, callbackForCompletingChallenge, "POST", null, token);
        }
    }); 

    fetchMethod(currentUrl + '/api/challenges', callbackForGettingAllChallenge);




    fetchMethod(currentUrl + '/api/users/verify', (responseStatus, responseData) => {
        if (responseStatus === 200) {
            const user_id = responseData[0].user_id;
            const create = document.getElementById("create");
    
            const callbackForCreatingChallenges = (responseStatus, responseData) => {
                // Use strict equality comparison.
                const userChallenge = responseData.find(challenge => challenge.creator_id === user_id);
    
                // If a challenge exists, display it in a card with update and delete buttons.
                if (userChallenge) {
                    create.innerHTML = `
                        <div class="card my-5">
                            <div class="card-body">
                                <h5 class="card-title">${userChallenge.challenge}</h5>
                                <p class="card-text">Skill Points: ${userChallenge.skillpoints}</p>
                                <button class="btn btn-warning w-100" id="updateChallengeBtn" data-bs-toggle="modal" data-bs-target="#updateChallengeModal">
                                    Update Challenge
                                </button>
                                <button class="btn btn-danger w-100 my-3" id="deleteChallengeBtn" data-bs-toggle="modal" data-bs-target="#deleteChallengeModal">
                                    Delete Challenge
                                </button>
                            </div>
                        </div>
    
                        <!-- Update Challenge Modal -->
                        <div class="modal fade" id="updateChallengeModal" tabindex="-1" aria-labelledby="updateChallengeModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content text-black">
                                    <div class="modal-header">
                                        <p class="modal-title fs-5 text-center w-100 fw-bold" id="updateChallengeModalLabel">
                                            <span style="text-transform: uppercase; letter-spacing: 10px;">Update Challenge</span>
                                        </p>
                                        <button type="button" class="btn-close position-absolute end-0 me-3" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <!-- Bootstrap Floating Label Form for Update -->
                                        <form id="updateChallengeForm">
                                            <div class="form-floating mb-3">
                                                <input type="text" class="form-control" id="updateChallengeName" placeholder="Challenge Name" value="${userChallenge.challenge}" required>
                                                <label for="updateChallengeName">Challenge Name</label>
                                            </div>
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="updateSkillPoints" placeholder="Skill Points" value="${userChallenge.skillpoints}" max="200" min="0" required>
                                                <label for="updateSkillPoints">Skill Points (max 200)</label>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">Update Challenge</button>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <!-- Delete Challenge Modal -->
                        <div class="modal fade" id="deleteChallengeModal" tabindex="-1" aria-labelledby="deleteChallengeModalLabel" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content text-black">
                                    <div class="modal-header">
                                        <p class="modal-title fs-5 text-center w-100 fw-bold" id="deleteChallengeModalLabel">
                                            Confirm Deletion
                                        </p>
                                        <button type="button" class="btn-close position-absolute end-0 me-3" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <p>Are you sure you want to delete your challenge? This action cannot be undone.</p>
                                        <p>Please type <strong>DELETE</strong> in the box below to confirm:</p>
                                        <!-- Delete confirmation form -->
                                        <form id="deleteChallengeForm">
                                            <div class="form-floating mb-3">
                                                <input type="text" class="form-control" id="deleteConfirmInput" placeholder="Type DELETE to confirm" required>
                                                <label for="deleteConfirmInput">Type DELETE to confirm</label>
                                            </div>
                                            <button type="submit" class="btn btn-danger w-100">Delete Challenge</button>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
    
                    // Update challenge event listener.
                    const updateChallengeForm = document.getElementById('updateChallengeForm');
                    updateChallengeForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const updatedName = document.getElementById('updateChallengeName').value.trim();
                        let updatedSkillPoints = parseInt(document.getElementById('updateSkillPoints').value, 10);
    
                        if (isNaN(updatedSkillPoints) || updatedSkillPoints < 0) {
                            alert('Please enter a valid number of skill points.');
                            return;
                        }
                        if (updatedSkillPoints > 200) {
                            alert('Skill points cannot exceed 200.');
                            return;
                        }
    
                        const data = {
                            challenge: updatedName,
                            skillpoints: updatedSkillPoints,
                            user_id: user_id
                        };
    
                        // Send PUT request to update the challenge.
                        fetchMethod(currentUrl + '/api/challenges/' + userChallenge.challenge_id, (responseStatus, responseData) => {
                            if (responseStatus === 200) {
                                console.log('Challenge updated:', responseData);
                                // Close update modal and refresh window.
                                const updateModalEl = document.getElementById('updateChallengeModal');
                                const updateModal = bootstrap.Modal.getInstance(updateModalEl);
                                if (updateModal) {
                                    updateModal.hide();
                                }
                                window.location.reload();
                            } else {
                                console.error('Error updating challenge:', responseData);
                            }
                        }, "PUT", data, token);
                    });
    
                    // Delete challenge event listener.
                    const deleteChallengeForm = document.getElementById('deleteChallengeForm');
                    deleteChallengeForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const confirmationText = document.getElementById('deleteConfirmInput').value.trim();
                        // Double confirmation: ensure user types 'DELETE' exactly.
                        if (confirmationText !== 'DELETE') {
                            alert('Please type DELETE exactly to confirm deletion.');
                            return;
                        }
    
                        // Send DELETE request to delete the challenge.
                        fetchMethod(currentUrl + '/api/challenges/' + userChallenge.challenge_id, (responseStatus, responseData) => {
                            if (responseStatus === 200 || responseStatus === 204) {
                                console.log('Challenge deleted:', responseData);
                                // Close delete modal and refresh window.
                                const deleteModalEl = document.getElementById('deleteChallengeModal');
                                const deleteModal = bootstrap.Modal.getInstance(deleteModalEl);
                                if (deleteModal) {
                                    deleteModal.hide();
                                }
                                window.location.reload();
                            } else {
                                console.error('Error deleting challenge:', responseData);
                            }
                        }, "DELETE", null, token);
                    });
                } else {
                    // If no challenge exists, display the "create challenge" button and modal.
                    create.innerHTML = `
                        <a href="#" class="btn btn-primary" id="createUserChallenge" data-bs-toggle="modal" data-bs-target="#createChallenge">
                            Create Challenge
                        </a>
    
                        <!-- Create Challenge Modal -->
                        <div class="modal fade" id="createChallenge" tabindex="-1" aria-labelledby="createChallengeModal" aria-hidden="true">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content text-black">
                                    <div class="modal-header">
                                        <p class="modal-title fs-5 text-center w-100 fw-bold" id="createChallengeModal">
                                            <span style="text-transform: uppercase; letter-spacing: 10px;">Create Challenge</span>
                                        </p>
                                        <button type="button" class="btn-close position-absolute end-0 me-3" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <!-- Bootstrap Floating Label Form for Create -->
                                        <form id="challengeForm">
                                            <div class="form-floating mb-3">
                                                <input type="text" class="form-control" id="challengeName" placeholder="Challenge Name" required>
                                                <label for="challengeName">Challenge Name</label>
                                            </div>
                                            <div class="form-floating mb-3">
                                                <input type="number" class="form-control" id="skillPoints" placeholder="Skill Points" max="200" min="0" required>
                                                <label for="skillPoints">Skill Points (max 200)</label>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">Create Challenge</button>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
    
                    // Attach event listener for the create form submission.
                    const challengeForm = document.getElementById('challengeForm');
                    challengeForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        const challengeName = document.getElementById('challengeName').value.trim();
                        let skillPoints = parseInt(document.getElementById('skillPoints').value, 10);
    
                        if (isNaN(skillPoints) || skillPoints < 0) {
                            showToast('Please enter a valid number of skill points.', 'danger', '<i class="fa-solid fa-xmark"></i>');
                            return;
                        }
                        if (skillPoints > 200) {
                            showToast('Skill points cannot exceed 200.', 'danger', '<i class="fa-solid fa-xmark"></i>');
                            return;
                        }
    
                        const data = {
                            challenge: challengeName,
                            skillpoints: skillPoints,
                            user_id: user_id
                        };
    
                        // Send POST request to create the challenge.
                        fetchMethod(currentUrl + '/api/challenges', (responseStatus, responseData) => {
                            if (responseStatus === 201) {
                                console.log('Challenge created:', responseData);
                                // Close the create modal and refresh the window.
                                const createModalEl = document.getElementById('createChallenge');
                                const createModal = bootstrap.Modal.getInstance(createModalEl);
                                if (createModal) {
                                    createModal.hide();
                                }
                                window.location.reload();
                            } else {
                                console.error('Error creating challenge:', responseData);
                            }
                        }, "POST", data, token);
                    });
                }
            };
    
            // First, check if any challenge exists for the user.
            fetchMethod(currentUrl + '/api/challenges', callbackForCreatingChallenges);
        }
    }, "GET", null, token);
    
    
})

