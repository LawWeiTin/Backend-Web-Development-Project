document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");

    // Get party_id from the URL parameters
    let url = new URL(document.URL);
    let urlParams = url.searchParams;
    let user_id = urlParams.get("user_id");


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
            const profilePicture = document.getElementById('profile-picture');
            const user = responseData.find(user => user.user_id == user_id);

            const username = user.username;
            const skillpoints = user.skillpoints;
            const profile = user.profile;
            const userClass = user.class_name;
            const userRegion = user.region;
            const health = user.health;
            const attack = user.attack;
            const defense = user.defense;
            const mana = user.mana;
            const totalpower = user.total_power;

            document.getElementById("introduction").textContent += `${username}'s profile`;
            document.getElementById("username").textContent += username;
            document.getElementById("skillpoints").innerHTML += skillpoints;
            document.getElementById("class").innerHTML += userClass;
            document.getElementById("region").innerHTML += userRegion;
            document.getElementById("health").innerHTML += health;
            document.getElementById("attack").innerHTML += attack;
            document.getElementById("defense").innerHTML += defense;
            document.getElementById("mana").innerHTML += mana;
            document.getElementById("totalpower").innerHTML += totalpower;
            
            profilePicture.src = profile;
        } else {
            console.log("No users currently! Be the first by signing up!");
        }
    }


    function callbackForUserInventory(responseStatus, responseData) {

        // Get the container where inventory items will be displayed.
        const inventoryContainer = document.getElementById("inventoryContainer");
        inventoryContainer.innerHTML = ""; // Clear previous content
    
        if (responseStatus === 200) {

            const userInventory = responseData.filter(item => item.user_id = user_id);

            if (!userInventory || userInventory.length === 0) {
                inventoryContainer.innerHTML = "<p>No items in inventory.</p>";
            } else {
                // Create a row to hold the Bootstrap columns.
                const row = document.createElement("div");
                row.className = "row";
        
                // Loop through each item in the responseData array.
                userInventory.forEach(item => {
            
                    // Create a column for the item.
                    const col = document.createElement("div");
                    col.className = "col-md-4 mb-3";
            
                    // Build the card HTML for the inventory item.
                    col.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${item.item_name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${item.item_type}</h6>
                                <p class="card-text"><strong>Rarity:</strong> ${item.item_rarity}</p>
                                <p class="card-text"><strong>${item.item_type == 'Armour' ? 'Defense' : 'Attack'}:</strong> ${item.item_stat}</p>
                                <p class="card-text"><strong>Class:</strong> ${item.class_name}</p>
                            </div>
                        </div>
                    `;
            
                    row.appendChild(col);
                    
                });
                inventoryContainer.appendChild(row);
            }
        } else {
            inventoryContainer.innerHTML = `<p class="text-center">Error loading inventory: ${responseData.message || "Unknown error occurred."}</p>`;
        }
    }
      
    fetchMethod(currentUrl + "/api/users", callbackForUserContent);
    fetchMethod(currentUrl + '/api/users/allinventory', callbackForUserInventory);

})