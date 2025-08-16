document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    // Get party_id from the URL parameters
    let url = new URL(document.URL);
    let urlParams = url.searchParams;
    let party_id = urlParams.get("party_id");

    // Global variable to store the current user id.
    let current_user_id;

    // Toast function (unchanged)
    function showToast(message, type = "primary", icon = '<i class="fa-solid fa-check"></i>') {
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

        // Append to toast container (assumes toastContainer is defined in your HTML)
        toastContainer.appendChild(toastEl);

        // Initialize and show toast
        let toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();

        // Remove toast from DOM after hiding
        toastEl.addEventListener("hidden.bs.toast", function () {
            toastEl.remove();
        });
    }

    // First, fetch the current user id.
    fetchMethod(currentUrl + '/api/users/verify', function (responseStatus, responseData) {
        if (responseStatus === 200 && responseData.length > 0) {
            current_user_id = responseData[0].user_id;
        }
        // Once we have the current user's id, load the party details.
        loadPartyDetails();
    }, 'GET', null, token);

    // Function to load party details and members.
    function loadPartyDetails() {
        fetchMethod(currentUrl + `/api/party/${party_id}/members`, function (responseStatus, responseData) {
            console.log(responseData);
            if (responseStatus === 200 && responseData.length > 0) {
                // Update party header.
                document.getElementById("partyName").textContent = responseData[0].party_name;
                document.getElementById("partyDescription").textContent = responseData.description || "";
                
                // Clear any existing members.
                const membersContainer = document.getElementById("membersContainer");
                membersContainer.innerHTML = "";
                
                // Build member cards.
                responseData.forEach(member => {
                    const col = document.createElement("div");
                    col.className = "col-md-3 col-sm-6 mb-3";
                    col.innerHTML = `
                        <div class="card member-card h-100">
                            <div class="card-body text-center">
                                <h5 class="card-title">${member.username}</h5>
                                <p class="card-text">
                                    <small class="text-muted">${member.user_id === member.leader_id ? 'Leader' : 'Member'}</small>
                                </p>
                            </div>
                        </div>
                    `;
                    membersContainer.appendChild(col);
                });

                // Check if the current user is the leader.
                // We assume that responseData[0].leader_id contains the party leader's id.
                if (current_user_id && responseData[0].leader_id && current_user_id === responseData[0].leader_id) {
                    function loadPartyRequests() {
                        fetchMethod(currentUrl + `/api/party/${party_id}/request`, function(responseStatus, responseData) {
                            const partyRequestsSection = document.getElementById("partyRequests");
                            let requestsHTML = "";
                    
                            if (responseStatus === 200) {
                                if (responseData && responseData.length > 0) {
                                    // Loop through all requests and build HTML for each.
                                    responseData.forEach(request => {
                                        requestsHTML += `
                                            <div class="card bg-secondary text-light my-4 p-3">
                                                <p>
                                                    <strong id="username">${request.username}</strong> has requested to join the party.
                                                </p>
                                                <div class="d-flex justify-content-end gap-2">
                                                    <button class="btn btn-success btn-sm accept-btn" data-user-id="${request.user_id}">Accept</button>
                                                    <button class="btn btn-danger btn-sm reject-btn" data-user-id="${request.user_id}">Reject</button>
                                                </div>
                                            </div>
                                        `;
                                    });
                                } else {
                                    requestsHTML = `
                                        <div class="card bg-secondary text-light my-4 p-3">
                                            <p>No pending requests.</p>
                                        </div>
                                    `;
                                }
                            }
                    
                            partyRequestsSection.innerHTML = `
                                <h2 class="text-center">Party Requests</h2>
                                <hr>
                                ${requestsHTML}
                            `;
                            partyRequestsSection.style.display = "block";
                    
                            // Attach event listeners to all accept buttons.
                            const acceptButtons = partyRequestsSection.querySelectorAll(".accept-btn");
                            acceptButtons.forEach(btn => {
                                btn.addEventListener("click", function() {
                                    const userId = this.getAttribute("data-user-id");
                                    // Accept request: POST '/api/party/:party_id'
                                    fetchMethod(currentUrl + `/api/party/${party_id}`, function (responseStatus, responseData) {
                                        if (responseStatus === 201) {
                                            showToast(`${document.getElementById("username").innerHTML} accepted!`, "success");
                                            // Optionally refresh requests and party details.
                                            loadPartyRequests();
                                            loadPartyDetails();
                                            loadDeleteParty();
                                        } else {
                                            showToast(responseData.message, "danger", "X");
                                        }
                                    }, "POST", { user_id: userId });
                                });
                            });
                    
                            // Attach event listeners to all reject buttons.
                            const rejectButtons = partyRequestsSection.querySelectorAll(".reject-btn");
                            rejectButtons.forEach(btn => {
                                btn.addEventListener("click", function() {
                                    const userId = this.getAttribute("data-user-id");
                                    // Reject request: DELETE '/api/party/:party_id/request'
                                    fetchMethod(currentUrl + `/api/party/${party_id}/request`, function (responseStatus, responseData) {
                                        if (responseStatus === 204) {
                                            showToast(`${document.getElementById("username").innerHTML} rejected!`, "success");
                                            // Refresh the list after a successful rejection.
                                            loadPartyRequests();
                                            loadPartyDetails();
                                        } else {
                                            showToast("Cannot reject...", "success", "X");
                                        }
                                    }, "DELETE", { user_id: userId });
                                });
                            });
                        }, "GET", null, token);
                    }

                    loadPartyRequests();
                } else {
                    // Hide the party requests section if it exists.
                    const partyRequestsSection = document.getElementById("partyRequests");
                    if (partyRequestsSection) {
                        partyRequestsSection.style.display = "none";
                    }
                }
            } else {
                console.error("Failed to load party details.");
            }
        });
    }

    // Event listener for the "Send Request to Join Party" button.
    document.getElementById("joinRequestButton").addEventListener("click", function () {
        // Example POST data. Adjust the payload as needed.
        fetchMethod(currentUrl + `/api/party/${party_id}/request`, function (responseStatus, responseData) {
            if (responseStatus === 201) {
                showToast(responseData.message, "success");
                loadPartyDetails();
            } else {
                showToast(responseData.message, "danger", "X");
            }
        }, "POST", null, token);
    });


    // const callbackForLeavingParty = (responseStatus, responseData) => {
    //     const user = responseData.find(member => member.user_id == current_user_id);

    //     if (user){
    //         if (user.role == 'Member') {
    //             // show leave party button
    //             // This button will send an API request to DELETE /api/party/:party_id/leave
    //         } else {

    //             // show delete entire party button
    //             // This button will send an API request to DELETE /api/party/:party_id


    //             if (responseData.length === 1) {
    //                 // enable that button. Only can delete party if only leader left 
    //             } else {
    //                 // disable that button. Only can delete party if only leader left 
    //             }
    //         }
    //     } else {
    //         // Dont show leave party button
    //     }
    // }

    function loadDeleteParty () {
        fetchMethod(currentUrl + `/api/users/verify`, (responseStatus, responseData) => {
            const user_id = responseData[0].user_id;
            const callbackForLeavingParty = (responseStatus, responseData) => {
                const user = responseData.find(member => member.user_id == user_id);
            
                if (user) {
                    if (user.role === 'Member') {
                        // Show leave party button for regular members.
                        const leaveButton = document.getElementById("leavePartyButton");
                        leaveButton.classList.remove("d-none");
                        leaveButton.addEventListener("click", function () {
                            fetchMethod(currentUrl + `/api/party/${party_id}/leave`, (responseStatus, responseData) => {
                                if (responseStatus === 200) {
                                    window.location.reload();
                                }
                            }, "DELETE", null, token);
                        });
                    } else {
                        // For the leader: show the delete party button.
                        const deleteButton = document.getElementById("deletePartyButton");
                        deleteButton.classList.remove("d-none");
                        // Enable delete only if the leader is the only member left.
                        if (responseData.length === 1) {
                            deleteButton.disabled = false;
                        } else {
                            deleteButton.disabled = true;
                        }
                        deleteButton.addEventListener("click", function () {
                            fetchMethod(currentUrl + `/api/party/${party_id}`, (responseStatus, responseData) => {
                                if (responseStatus === 200) {
                                    window.location.href = `showAllParty.html`
                                }
                            }, "DELETE", null, token);
                        });
                    }
                } else {
                    // If the user is not in the party, do not show any leave/delete options.
                    document.getElementById("partyLeaveSection").style.display = "none";
                }
            };
            
            fetchMethod(currentUrl + `/api/party/${party_id}/members`, callbackForLeavingParty);
        }, "GET", null, token);
    }

    loadDeleteParty();
});