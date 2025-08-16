document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");
    const toastContainer = document.getElementById("toastContainer");
    let user_id, party_id;

    // Get party_id and region_id from the URL parameters
    let url = new URL(document.URL);
    let urlParams = url.searchParams;
    let region_id = urlParams.get("region_id");

    // Toast helper function
    function showToast(message, type = "primary", icon = '<i class="fa-solid fa-check"></i>') {
        let toastEl = document.createElement("div");
        toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
        toastEl.setAttribute("role", "alert");
        toastEl.setAttribute("aria-live", "assertive");
        toastEl.setAttribute("aria-atomic", "true");
        toastEl.innerHTML = `
            <div class="d-flex m-3">
                <div class="toast-body">
                    <strong>${icon}&nbsp;&nbsp;${message}</strong>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toastEl);
        let toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener("hidden.bs.toast", function () {
            toastEl.remove();
        });
    }

    // -----------------------------
    // Party and User Verification
    // -----------------------------
    const partyContainer = document.getElementById("party-row");

    // First, verify the user to get the user_id.
    fetchMethod(currentUrl + '/api/users/verify', function (responseStatus, responseData) {
        if (responseStatus === 200) {
            user_id = responseData[0].user_id;
        }
        // Then, check if the user is in a party.
        fetchMethod(currentUrl + `/api/party/members`, function (responseStatus, responseData) {
            if (responseStatus === 200) {
                const partyObj = responseData.find(party => party.user_id == user_id);
                if (partyObj) {
                    party_id = partyObj.party_id;
                    fetchMethod(currentUrl + `/api/party/${party_id}/members`, callbackForGetUserParty);
                } else {
                    partyContainer.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center w-100">
                        <div class="text-center">
                            <p>You are not in any party yet.</p>
                            <a href="showAllParty.html" class="btn btn-primary">Browse Parties</a>
                        </div>
                    </div>
                    `;
                }
            } else {
                partyContainer.innerHTML = `
                <div class="d-flex align-items-center justify-content-center w-100">
                    <div class="text-center">
                        <p>You are not in any party yet.</p>
                        <a href="showAllParty.html" class="btn btn-primary">Browse Parties</a>
                    </div>
                </div>
                `;
            }
        });
    }, "GET", null, token);

    // Render party members using a Bootstrap grid (4 columns per row).
    function renderParty(members) {
        const maxColumns = 4;
        partyContainer.innerHTML = "";
        const row = document.createElement("div");
        row.className = "row w-100";
        for (let i = 0; i < maxColumns; i++) {
            const col = document.createElement("div");
            col.className = "col-md-3 mb-3";
            if (i < members.length) {
                col.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title">${members[i].username}</h5>
                            <p class="card-text">
                                ${
                                  members[i].user_id === members[i].leader_id
                                    ? '<span class="badge bg-warning text-dark">Leader</span>'
                                    : '<span class="badge bg-secondary">Member</span>'
                                }
                            </p>
                        </div>
                    </div>
                `;
            } else if (i === members.length) {
                col.innerHTML = `
                    <div class="card h-100 border" style="cursor: pointer;">
                        <div class="card-body d-flex align-items-center justify-content-center">
                            <h1 class="mb-0">+</h1>
                        </div>
                    </div>
                `;
                col.querySelector(".card").addEventListener("click", function () {
                    window.location.href = "singlePartyInfo.html?party_id=" + party_id;
                });
            }
            row.appendChild(col);
        }
        partyContainer.appendChild(row);
    }

    const callbackForGetUserParty = function (responseStatus, responseData) {
        if (responseStatus === 200) {
            renderParty(responseData);
        } else {
            partyContainer.innerHTML = `<p class="text-center">Failed to load party members.</p>`;
        }
    };

    // -----------------------------
    // Dungeon and Trade Section
    // -----------------------------
    function loadDungeonAndTrade() {
        let dungeonContainer = document.getElementById("dungeon-container");
        fetchMethod(currentUrl + `/api/map/${region_id}/dungeons`, function (responseStatus, dungeonData) {
            if (responseStatus === 200 && dungeonData.length > 0) {
                const dungeon = dungeonData[0];
                dungeonContainer.innerHTML = `
                    <h2 class="text-center my-4">Dungeon: ${dungeon.dungeon_name || ""}</h2>
                    <div class="text-center w-100" style="height: 60vh; overflow: hidden;">
                        <img src="${dungeon.dungeon_image}" class="img-fluid rounded rounded-5" 
                             style="object-fit: cover; object-position: 50% 30%; width: 100%; height: 100%;" 
                             alt="Dungeon Placeholder">
                    </div>
                    <div class="text-center mt-3">
                        <button id="fightDungeonBtn" class="btn btn-danger">Fight Dungeon</button>
                    </div>
                `;
                document.getElementById("fightDungeonBtn").addEventListener("click", function () {
                    const data = { party_id: party_id };
                    fetchMethod(currentUrl + `/api/map/dungeons/${dungeon.dungeon_id}`, function (responseStatus, responseData) {
                        if (responseStatus === 200) {
                            let message = responseData.message;
                            let outcome = message.includes("Victory");
                            showToast(message, outcome ? "success" : "warning", outcome ? `<i class="fa-solid fa-coins"></i>` : `<i class="fa-solid fa-user-xmark"></i>`);
                        } else {
                            showToast(responseData.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                        }
                    }, "POST", data, token);
                });
            } else {
                checkActiveTrade(dungeonContainer);
            }
        });
    }

    // Check if an active trade exists.
    function checkActiveTrade(dungeonContainer) {
        fetchMethod(currentUrl + '/api/trades', function (responseStatus, tradeData) {
            if (responseStatus === 200) {
                const activeTrade = tradeData.find(trade => (trade.user1_id == user_id || trade.user2_id == user_id) && trade.trade_status == 'Pending');
                if (activeTrade) {
                    // Load and render trade items.
                    loadTradeItems(activeTrade);
                } else {
                    // No active trade: show the "Find Trade" button and modal.
                    dungeonContainer.innerHTML = `
                        <div class="text-center mb-4" id="findTradeButton">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#tradeModal">
                                Find Trade
                            </button>
                        </div>
                        <!-- Trade Modal -->
                        <div class="modal fade" id="tradeModal" tabindex="-1" aria-labelledby="tradeModalLabel" aria-hidden="true">
                            <div class="modal-dialog modal-xl">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="tradeModalLabel">Available Users</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <h2 class="text-center text-black">Send Trade Requests!</h2>
                                        <hr class="text-black">
                                        <div class="row" id="displayTradeUser"></div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    loadTradeUsers();
                }
            } else {
                // No active trade: show the "Find Trade" button and modal.
                dungeonContainer.innerHTML = `
                    <div class="text-center mb-4" id="findTradeButton">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#tradeModal">
                            Find Trade
                        </button>
                    </div>
                    <!-- Trade Modal -->
                    <div class="modal fade" id="tradeModal" tabindex="-1" aria-labelledby="tradeModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="tradeModalLabel">Available Users</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <h2 class="text-center text-black">Send Trade Requests!</h2>
                                    <hr class="text-black">
                                    <div class="row" id="displayTradeUser"></div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                loadTradeUsers();
            }
        });
    }

    // Called after a trade request has been sent and an active trade exists.
    function loadTradeItems(tradeObj) {
        fetchMethod(
        currentUrl + '/api/trades/' + tradeObj.trade_id,
        function (responseStatus, tradeItemsData) {
            if (responseStatus === 200) {
                renderTradeLayout(tradeItemsData, tradeObj);
            } else if (responseStatus === 404) {
                // No items placed yet; treat as an empty trade.
                renderTradeLayout([], tradeObj);
            } else {
                showToast("Failed to load trade items", "danger", `<i class="fa-solid fa-xmark"></i>`);
            }
        }, "GET", null, token);
    }

    function renderTradeLayout(tradeItemsData, tradeObj) {
        let dungeonContainer = document.getElementById("dungeon-container");
        const yourItems = tradeItemsData[0].filter(item => item.user_id == user_id);
        const otherItems = tradeItemsData[0].filter(item => item.user_id != user_id);
        
        // Helper to build HTML rows (2 columns per row) for a set of items.
        function renderItems(items, includePlus) {
            let html = "";
            for (let i = 0; i < items.length; i += 2) {
                html += `<div class="row mb-2">`;
                // First column.
                html += `<div class="col-md-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    ${renderTradeItem(items[i])}
                                </div>
                            </div>
                         </div>`;
                // Second column.
                if (i + 1 < items.length) {
                    html += `<div class="col-md-6">
                                <div class="card text-center">
                                    <div class="card-body">
                                        ${renderTradeItem(items[i+1])}
                                    </div>
                                </div>
                             </div>`;
                } else if (includePlus) {
                    // If odd number and this is your section, display plus button.
                    html += `<div class="col-md-6 d-flex align-items-center justify-content-center">
                                <button class="btn btn-outline-primary addItemBtn">+</button>
                             </div>`;
                } else {
                    html += `<div class="col-md-6"></div>`;
                }
                html += `</div>`;
            }
            // If no items exist and plus should be shown.
            if (items.length === 0 && includePlus) {
                html += `<div class="row mb-2">
                            <div class="col-md-6 d-flex align-items-center justify-content-center">
                                <button class="btn btn-outline-primary addItemBtn">+</button>
                            </div>
                         </div>`;
            }
            // If items count is even and plus should be shown, add an extra row.
            if (includePlus && items.length > 0 && items.length % 2 === 0) {
                html += `<div class="row mb-2">
                            <div class="col-md-6 d-flex align-items-center justify-content-center">
                                <button class="btn btn-outline-primary addItemBtn">+</button>
                            </div>
                         </div>`;
            }
            return html;
        }
    
        // Helper to render a single trade item.
        function renderTradeItem(item) {
            return `<div>
                        <h5 class="card-title">${item.item_name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${item.item_type}</h6>
                        <p class="card-text"><strong>Rarity:</strong> ${item.item_rarity}</p>
                        <p class="card-text"><strong>Class:</strong> ${item.class_name}</p>
                        <p class="card-text"><strong>${item.item_type == 'Armour' ? 'Defense' : 'Attack'}:</strong> ${item.item_stat}</p>
                    </div>`;
        }
    
        // Build the complete trade layout, including the Accept/Decline row.
        dungeonContainer.innerHTML = `
            <h1 class="text-center">Trading</h1>
            <hr>
            <div class="container">
                <div class="row">
                    <!-- Your Trade Section -->
                    <div class="col-md-6">
                        <h2 class="text-center">Your Trade</h2>
                        <div id="yourTradeTable">
                            ${renderItems(yourItems, true)}
                        </div>
                    </div>
                    <!-- Other User's Trade Section -->
                    <div class="col-md-6">
                        <h2 class="text-center">Other User's Trade</h2>
                        <div id="otherTradeTable">
                            ${renderItems(otherItems, false)}
                        </div>
                    </div>
                </div>
                <!-- Accept/Decline Trade Buttons -->
                <div class="row mt-4">
                    <div class="col-md-6">
                        <button id="declineTradeBtn" class="btn btn-danger w-100">Decline Trade</button>
                    </div>
                    <div class="col-md-6">
                        <button id="acceptTradeBtn" class="btn btn-success w-100">Accept Trade</button>
                    </div>
                </div>
            </div>
        `;
    
        // Attach click listener on the plus button in your section to open the inventory modal.
        document.querySelectorAll(".addItemBtn").forEach(button => {
            button.addEventListener("click", function () {
                let inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
                inventoryModal.show();   
                loadUserInventory(tradeObj.trade_id, loadTradeItems);
            });
        });
        
        fetchMethod(currentUrl + `/api/trades`, (responseStatus, responseData) => {

            const trade = responseData.find(trade => (trade.user1_id == user_id || trade.user2_id == user_id) && trade.trade_status == 'Pending');

            // Attach dummy event handlers for Accept/Decline trade buttons.
            document.getElementById("declineTradeBtn").addEventListener("click", function () {
                fetchMethod(currentUrl + `/api/trades/${tradeObj.trade_id}`, (responseStatus, responseData) => {
                    loadDungeonAndTrade();
                    showToast("Trade declined... :(", "warning", `<i class="fa-solid fa-xmark"></i>`);
                }, "PUT", { status: false, user1_id: trade.user1_id, user2_id: trade.user2_id }, token);
            });
            
            document.getElementById("acceptTradeBtn").addEventListener("click", function () {

                fetchMethod(currentUrl + `/api/users/trades`, (responseStatus, responseData) => {
                    if (responseStatus === 200) {
                        showToast(responseData.message, "success", `<i class="fa-brands fa-dropbox"></i>`);
                        
                        fetchMethod(currentUrl + '/api/users', (responseStatus, responseData) => {
                            const user1_status = responseData.find(user => user.user_id == trade.user1_id);
                            const user2_status = responseData.find(user => user.user_id == trade.user2_id);

                            if (user2_status.accepted && user1_status.accepted) {
                                fetchMethod(currentUrl + `/api/trades/${tradeObj.trade_id}`, (responseStatus, responseData) => {
                                    loadDungeonAndTrade();
                                    showToast("Trade accepted!!!", "success", `<i class="fa-solid fa-gift"></i>`);
                                }, "PUT", { status: true, user1_id: trade.user1_id, user2_id: trade.user2_id }, token);
                            }
                        })
                    } else {
                        showToast(responseData.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                    }
                }, "PUT", null, token)


            });
        })
    }
    

    // Load trade users into the trade modal (for initiating a new trade).
    function loadTradeUsers() {
        fetchMethod(currentUrl + '/api/users', function (responseStatus, responseData) {
            const displayTradeUser = document.getElementById("displayTradeUser");
            let modal = bootstrap.Modal.getInstance(document.getElementById(`tradeModal`));

            if (!modal) {
                modal = new bootstrap.Modal(document.getElementById(`tradeModal`));
            }

            displayTradeUser.innerHTML = "";
            if (responseStatus === 200) {
                responseData.forEach(user => {
                    if (user.user_id !== user_id) {
                        const tradeUser = document.createElement('div');
                        tradeUser.classList.add('col-md-4');
                        tradeUser.innerHTML = `
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title text-center">${user.username}</h5>
                                    <p class="card-text"><strong>Level:</strong> ${user.level}</p>
                                    <p class="card-text"><strong>Region:</strong> ${user.region}</p>
                                    <button data-user-id="${user.user_id}" class="btn btn-success sendTradeRequest">
                                        Send trade request
                                    </button>
                                </div>
                            </div>
                        `;
                        displayTradeUser.appendChild(tradeUser);
                    }
                });
                document.querySelectorAll('.sendTradeRequest').forEach(button => {
                    button.addEventListener('click', function (event) {
                        const targetUserId = event.target.getAttribute('data-user-id');
                        const data = { user2_id: targetUserId };
                        fetchMethod(currentUrl + '/api/trades', function (responseStatus, responseData) {
                            modal.hide();
                            if (responseStatus === 201) {
                                showToast("Trade initiated!", "success", `<i class="fa-brands fa-dropbox"></i>`);
                                checkActiveTrade(document.getElementById("dungeon-container"));
                            } else {
                                showToast(responseData.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                            }
                        }, "POST", data, token);
                    });
                });
            } else {
                displayTradeUser.innerHTML = `
                    <h3 class="col-12 text-center text-black">No users available to trade... :(</h3>
                `;
            }
            if (responseData.length == 1) {
                displayTradeUser.innerHTML = `
                    <h3 class="col-12 text-center text-black">No users available to trade... :(</h3>
                `;
            }
        });
    }

    function loadInventoryButton(inventory_id, item_type, trade_id, callback) {
        let html, user_item;
    
        fetchMethod(currentUrl + `/api/trades/${trade_id}`, (responseStatus, responseData) => {
            if (responseStatus === 200) {
                user_item = responseData[0].find(item => (item.item_type == item_type) && (item.inventory_id == inventory_id));
    
                if (user_item) {
                    html = `
                        <button class="btn btn-danger removeFromTradeBtn" 
                            data-inventory-id="${inventory_id}" 
                            data-item-type="${item_type}">
                            Remove from trade
                        </button>
                    `;
                } else {
                    html = `
                        <button class="btn btn-primary placeForTradeBtn" 
                            data-inventory-id="${inventory_id}" 
                            data-item-type="${item_type}">
                            Place for trade
                        </button>
                    `;
                }
            }
    
            // Call the callback function with the generated HTML
            callback(html);
        });
    }
    

    // Load the current user's inventory for trading.
    function loadUserInventory(trade_id, reload) {
        fetchMethod(currentUrl + '/api/users/userinventory', function (responseStatus, inventoryData) {
            const inventoryContainer = document.getElementById("inventoryContainer");
            inventoryContainer.innerHTML = "";
            if (responseStatus === 200) {
                let html = "";
                for (let i = 0; i < inventoryData.length; i += 3) {
                    html += `<div class="row mb-2">`;
                    for (let j = i; j < i + 3 && j < inventoryData.length; j++) {
                        html += `<div class="col-md-4">
                                    <div class="card mb-3 h-100">
                                        <div class="card-body text-center" id="invInfo">
                                            <h5 class="card-title">${inventoryData[j].item_name}</h5>
                                            <h6 class="card-subtitle mb-2 text-muted">${inventoryData[j].item_type}</h6>
                                            <p class="card-text"><strong>Rarity:</strong> ${inventoryData[j].item_rarity}</p>
                                            <p class="card-text"><strong>Class:</strong> ${inventoryData[j].class_name}</p>
                                            <p class="card-text"><strong>${inventoryData[j].item_type == 'Armour' ? 'Defense' : 'Attack'}:</strong> ${inventoryData[j].item_stat}</p>
                                            <div id="button-container-${j}"></div> 
                                        </div>
                                    </div>
                                </div>`;

                    // Now call the function to load the button asynchronously
                    loadInventoryButton(inventoryData[j].inventory_id, inventoryData[j].item_type, trade_id, function(buttonHtml) {
                        // Update the button inside the specific item card after async completion
                        document.getElementById(`button-container-${j}`).innerHTML = buttonHtml;

                        const button = document.getElementById(`button-container-${j}`).querySelector(".placeForTradeBtn, .removeFromTradeBtn");
                        if (button) {
                            button.addEventListener("click", function (event) {
                                const inventoryId = event.target.getAttribute("data-inventory-id");
                                const item_type = event.target.getAttribute("data-item-type");
                                const data = { inventory_id: inventoryId, item_type: item_type };

                                if (event.target.classList.contains("placeForTradeBtn")) {
                                    fetchMethod(currentUrl + `/api/trades/${trade_id}`, function (responseStatus, responseData) {
                                        if (responseStatus === 200) {
                                            showToast(responseData.message, "success", `<i class="fa-solid fa-check"></i>`);
                                            event.target.innerText = "Remove from trade";
                                            event.target.classList.remove("btn-primary", "placeForTradeBtn");
                                            event.target.classList.add("btn-danger", "removeFromTradeBtn");

                                            // Refresh the trade items
                                            fetchMethod(currentUrl + `/api/trades`, (responseStatus, responseData) => {
                                                const tradeObj = responseData.find(trade => (trade.user1_id == user_id || trade.user2_id == user_id) && trade.trade_status == 'Pending');
                                                reload(tradeObj);
                                            });
                                        } else {
                                            showToast(responseData.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                                        }
                                    }, "POST", data, token);
                                } else if (event.target.classList.contains("removeFromTradeBtn")) {
                                    // Handle remove from trade button click
                                    fetchMethod(currentUrl + `/api/trades/${trade_id}`, function (delStatus, delResponse) {
                                        if (delStatus === 200) {
                                            showToast("Item removed from trade", "success", `<i class="fa-solid fa-check"></i>`);
                                            // Change the button text back to "Place for trade"
                                            event.target.innerText = "Place for trade";
                                            event.target.classList.remove("btn-danger", "removeFromTradeBtn");
                                            event.target.classList.add("btn-primary", "placeForTradeBtn");
                                            // Refresh the trade items
                                            fetchMethod(currentUrl + `/api/trades`, (responseStatus, responseData) => {
                                                const tradeObj = responseData.find(trade => (trade.user1_id == user_id || trade.user2_id == user_id) && trade.trade_status == 'Pending');
                                                reload(tradeObj);
                                            });
                                        } else {
                                            showToast(delResponse.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                                        }
                                    }, "DELETE", data, token);
                                }
                            });
                        }
                    });
                    }      
                    html += `</div>`;       
                }
                inventoryContainer.innerHTML = html;
            } else {
                inventoryContainer.innerHTML = `<p class="text-center">No inventory items found.</p>`;
            }
        }, "GET", null, token);
    }


    // Append Inventory Modal HTML to the document body.
    const inventoryModalHTML = `
       <div class="modal fade" id="inventoryModal" tabindex="-1" aria-labelledby="inventoryModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl">
             <div class="modal-content">
                <div class="modal-header">
                   <h5 class="modal-title" id="inventoryModalLabel">Your Inventory</h5>
                   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                   <div class="row" id="inventoryContainer"></div>
                </div>
                <div class="modal-footer">
                   <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
             </div>
          </div>
       </div>
    `;
    document.body.insertAdjacentHTML('beforeend', inventoryModalHTML);

    // Finally, load the dungeon (and then check for active trade).
    loadDungeonAndTrade();
});
