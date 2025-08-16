document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");
    const toastContainer = document.getElementById("toastContainer");

    function showToast(message, type = "primary", icon='<i class="fa-solid fa-check"></i>') {
        // Create toast element
        let toastEl = document.createElement("div");
        toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
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

    document.getElementById("createPartyForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Retrieve the party name input and trim any whitespace
        const partyNameInput = document.getElementById("partyName");
        const partyName = partyNameInput.value.trim();
        // Reset any previous validation error
        partyNameInput.classList.remove("is-invalid");


        if (partyName === "") {
            // Mark input as invalid and display error message
            partyNameInput.classList.add("is-invalid");
            document.getElementById("partyError").textContent = "Please enter a party name!";
            return; // Exit the function if validation fails
        }
    
        // Prepare the data for the API request
        const newPartyData = { 
            party_name: partyName 
        };

        const callbackForCreatingParty = (responseStatus, responseData) => {
            if (responseStatus === 201) {
                showToast("You have created your own party! Woohoo!", "success");
                fetchMethod(currentUrl + '/api/party/members', callbackForGetAllParty);
            } else {
                partyNameInput.classList.add("is-invalid");
                document.getElementById("partyError").textContent = responseData.message;
            }
        }
    
        // Call the API using your dummy fetchMethod (simulate a POST request)
        fetchMethod("/api/party", callbackForCreatingParty, "POST", newPartyData, token);
    })


    const callbackForGetAllParty = (responseStatus, responseData) => {
        const partiesContainer = document.getElementById("parties");
        partiesContainer.innerHTML = ""; // Clear any previous content

        if (responseStatus === 200) {
            // Group the flat rows by party_id
            const partiesMap = {};
        
            responseData.forEach(row => {
                // Create a new party entry if it doesn't exist in the map yet
                if (!partiesMap[row.party_id]) {
                partiesMap[row.party_id] = {
                    party_id: row.party_id,
                    party_name: row.party_name,
                    members: []
                };
                }
                // If the row contains member data (assume user_id is not null)
                if (row.user_id) {
                partiesMap[row.party_id].members.push({
                    user_id: row.user_id,
                    username: row.username, // Assuming this column exists
                    role: row.role
                });
                }
            });
        
            // Convert the parties map to an array for iteration
            const parties = Object.values(partiesMap);
        
            // Iterate over each party and generate its card
            parties.forEach(party => {
                // Build the HTML for the members list
                let membersHTML = "";
                if (party.members.length > 0) {
                party.members.forEach(member => {
                    membersHTML += `
                    <div class="member mb-2">
                        <p class="mb-0">
                        <strong>${member.username}</strong>
                        <small class="text-muted">(${member.role})</small>
                        </p>
                    </div>
                    `;
                });
                } else {
                membersHTML = `<p class="mb-0">No members yet.</p>`;
                }
        
                // Create the party card
                const displayItem = document.createElement("div");
                displayItem.className = "col-md-4 p-3";
                displayItem.innerHTML = `
                <div class="card p-4">
                    <div class="card-body">
                    <h5 class="card-title text-center mb-3">${party.party_name}</h5>
                    <hr>
                    <div class="party-members">
                        ${membersHTML}
                    </div>
                    <a href="singlePartyInfo.html?party_id=${party.party_id}" class="btn btn-primary mt-3">View Party</a>
                    </div>
                </div>
                `;
                partiesContainer.appendChild(displayItem);
            });
            } else {
            partiesContainer.innerHTML = `
                <h1 class="text-center p-5 text-white">
                ${responseData.message} :(
                </h1>
            `;
            }
        };

    fetchMethod(currentUrl + '/api/party/members', callbackForGetAllParty);
})