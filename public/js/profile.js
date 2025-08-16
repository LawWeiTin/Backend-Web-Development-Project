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

    const callbackForUserContent = (responseStatus, responseData) => {
        if (responseStatus == 200) {

            const jwt_user = responseData[0];

            fetchMethod(currentUrl + '/api/users', (responseStatus, responseData) => {

                const profilePicture = document.getElementById('profile-picture');
                const user = responseData.find(user => user.user_id == jwt_user.user_id);
    
                const username = user.username;
                const skillpoints = user.skillpoints;
                const profile = user.profile;
                const className = user.class_name;
                const userRegion = user.region;
                const health = user.health;
                const attack = user.attack;
                const defense = user.defense;
                const mana = user.mana;
                const totalpower = user.total_power;
    
                document.getElementById("introduction").textContent = 'Hey, ' + username + "!";
                document.getElementById("username").textContent = username;
                document.getElementById("skillpoints").innerHTML = `<strong>Skillpoints:&nbsp;</strong>${skillpoints}`;
                document.getElementById("email").innerHTML = `<strong>Email:&nbsp;</strong>${jwt_user.email}`;
                document.getElementById("class").innerHTML = `<strong>Class:&nbsp;</strong>${className}`;
                document.getElementById("region").innerHTML = `<strong>Region:&nbsp;</strong>${userRegion}`;
                document.getElementById("health").innerHTML = health;
                document.getElementById("attack").innerHTML = attack;
                document.getElementById("defense").innerHTML = defense;
                document.getElementById("mana").innerHTML = mana;
                document.getElementById("totalpower").innerHTML = totalpower;
                profilePicture.src = profile;
            })
        } else {
            console.log("Token expired")
        }
    }

    function checkDailyCompletion(user_id) {
        const dailySkillpointsPercentage = document.getElementById("dailySkillpointsPercentage");
        const dailyDungeonPercentage = document.getElementById("dailyDungeonPercentage");

        fetchMethod(currentUrl + '/api/users', (responseStatus, responseData) => {
            let user = responseData.find(user => user.user_id === user_id);

            if (dailySkillpointsPercentage.textContent === "Finished!" &&
                dailyDungeonPercentage.textContent === "Finished!") {
        
                if (!document.getElementById("claimDailyButton")) {
                    const claimButton = document.createElement("button");
                    claimButton.id = "claimDailyButton";
                    claimButton.className = "btn btn-success w-100 mt-3";
                    claimButton.textContent = "Claim a legendary weapon!!!";
        
                    document.getElementById("daily").appendChild(claimButton);
        
                    // Attach event listener to send the POST request when clicked
                    claimButton.addEventListener("click", function () {
                        fetchMethod(currentUrl + "/api/challenges/daily", (responseStatus, responseData) => {
                            if (responseStatus === 200) {
                                showToast("Congratulations! Your legendary weapon has been claimed!", "success");
                                // Mark as claimed for this user
                                claimButton.textContent = "Claimed!";
                                claimButton.disabled = true;
                                // Refresh the inventory.
                                fetchMethod(currentUrl + '/api/users/userinventory', callbackForUserInventory, "GET", null, token);
                            } else {
                                console.error("Error claiming legendary weapon:", responseData);
                            }
                        }, "POST", null, token);
                    });
                }
                
                // If the user has already claimed the reward, display a disabled button.
                if (user.daily) {
                    const dailyBtn = document.getElementById("claimDailyButton");
                    dailyBtn.id = "claimDailyButton";
                    dailyBtn.className = "btn btn-secondary w-100 mt-3";
                    dailyBtn.textContent = "Claimed!";
                    dailyBtn.disabled = true;
                }
            }
        })

    }
    
    // Existing callback for updating daily quest progress
    const callbackForDailies = (responseStatus, responseData) => {
    
        const dailySkillpoints = document.getElementById("dailySkillpoints");
        const dailyDungeon = document.getElementById("dailyDungeon");
        const skillpointProgress = (responseData.results[0][0].dailySkillpoints / 250) * 100;
        const dungeonProgress = (responseData.results[1][0] == null ? 0 : responseData.results[1].filter(attempt => attempt.success === 1).length) * 100;
    
        dailySkillpoints.style.width = `${skillpointProgress}%`;
        dailyDungeon.style.width = `${dungeonProgress}%`;
    
        const dailySkillpointsPercentage = document.getElementById("dailySkillpointsPercentage");
        const dailyDungeonPercentage = document.getElementById("dailyDungeonPercentage");
    
        dailySkillpointsPercentage.textContent = skillpointProgress >= 100 ? "Finished!" : `${skillpointProgress.toFixed(0)}%`;
        dailyDungeonPercentage.textContent = dungeonProgress >= 100 ? "Finished!" : `${dungeonProgress.toFixed(0)}%`;
    
        checkDailyCompletion(responseData.user_id);
    };

    function callbackForUserInventory(responseStatus, responseData) {
        // Get the container where inventory items will be displayed.
        const inventoryContainer = document.getElementById("inventoryContainer");
        inventoryContainer.innerHTML = ""; // Clear previous content

        if (responseStatus === 200) {
            if (!responseData || responseData.length === 0) {
                inventoryContainer.innerHTML = "<p>No items in your inventory.</p>";
            } else {
                // Create a row to hold the Bootstrap columns.
                const row = document.createElement("div");
                row.className = "row";

                // Loop through each item in the responseData array.
                responseData.forEach(item => {
                    const isEquipped = item.item_is_equipped ? true : false;
                    const col = document.createElement("div");
                    col.className = "col-md-4 mb-3";

                    col.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${item.item_name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${item.item_type}</h6>
                                <p class="card-text"><strong>Rarity:</strong> ${item.item_rarity}</p>
                                <p class="card-text"><strong>${item.item_type == 'Armour' ? 'Defense' : 'Attack'}:</strong> ${item.item_stat}</p>
                                <p class="card-text"><strong>Class:</strong> ${item.class_name}</p>
                            </div>
                            <div class="card-footer text-center">
                                <button class="btn equip-btn btn-sm rounded-4 w-100 ${isEquipped ? 'btn-danger' : 'btn-success'}"
                                    data-item-type="${item.item_type}" data-inventory-id="${item.inventory_id}">
                                    ${isEquipped ? 'Unequip' : 'Equip'}
                                </button>
                            </div>
                        </div>
                    `;

                    const btn = col.querySelector(".equip-btn");
                    btn.addEventListener("click", function () {
                        const currentlyEquipped = btn.textContent.trim() === "Unequip";
                        const endpoint = currentlyEquipped ? "/api/users/unequip" : "/api/users/equip";
                        const data = { item_type: item.item_type, inventory_id: item.inventory_id };

                        fetchMethod(currentUrl + endpoint, function (responseStatus, responseData) {
                            if (responseStatus === 200) {
                                if (currentlyEquipped) {
                                    btn.textContent = "Equip";
                                    btn.classList.remove("btn-danger");
                                    btn.classList.add("btn-success");
                                    showToast(responseData.message, "success");
                                } else {
                                    btn.textContent = "Unequip";
                                    btn.classList.remove("btn-success");
                                    btn.classList.add("btn-danger");
                                    showToast(responseData.message, "success");
                                    const allEquipButtons = document.querySelectorAll(".equip-btn[data-item-type='" + item.item_type + "']");
                                    allEquipButtons.forEach(otherBtn => {
                                        if (otherBtn.getAttribute("data-inventory-id") !== item.inventory_id.toString()) {
                                            otherBtn.textContent = "Equip";
                                            otherBtn.classList.remove("btn-danger");
                                            otherBtn.classList.add("btn-success");
                                        }
                                    });
                                }
                                fetchMethod(currentUrl + '/api/users/verify', callbackForUserContent, "GET", null, token)
                            } else {
                                showToast(responseData.message, "danger", "X");
                            }
                        }, "PUT", data, token);
                    });

                    row.appendChild(col);
                });
                inventoryContainer.appendChild(row);
            }
        } else {
            inventoryContainer.innerHTML = `<p class="text-center">${responseData.message || "Unknown error occurred."}</p>`;
        }
    }

    fetchMethod(currentUrl + '/api/users/userinventory', callbackForUserInventory, "GET", null, token);

    // Obtain the user_id through JWT
    fetchMethod(currentUrl + "/api/users/verify", callbackForUserContent, "GET", null, token);
    fetchMethod(currentUrl + "/api/challenges/daily", callbackForDailies, "GET", null, token);
    

})