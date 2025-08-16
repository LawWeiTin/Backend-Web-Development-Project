document.addEventListener("DOMContentLoaded", function () {

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


    // Javascript to display the regions

    let items = document.querySelectorAll('.slider .list .item');
    let next = document.getElementById('next');
    let prev = document.getElementById('prev');
    let thumbnails = document.querySelectorAll('.thumbnail .item');

    // config param
    let countItem = items.length;
    let itemActive = 0;
    // event next click
    next.onclick = function(){
        itemActive = itemActive + 1;
        if(itemActive >= countItem){
            itemActive = 0;
        }
        showSlider();
    }
    //event prev click
    prev.onclick = function(){
        itemActive = itemActive - 1;
        if(itemActive < 0){
            itemActive = countItem - 1;
        }
        showSlider();
    }
    // auto run slider
    let refreshInterval = setInterval(() => {
        next.click();
    }, 5000)
    function showSlider(){
        // remove item active old
        let itemActiveOld = document.querySelector('.slider .list .item.active');
        let thumbnailActiveOld = document.querySelector('.thumbnail .item.active');
        itemActiveOld.classList.remove('active');
        thumbnailActiveOld.classList.remove('active');

        // active new item
        items[itemActive].classList.add('active');
        thumbnails[itemActive].classList.add('active');
        setPositionThumbnail();

        // clear auto time run slider
        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            next.click();
        }, 5000)
    }

    function setPositionThumbnail () {
        let thumbnailActive = document.querySelector('.thumbnail .item.active');
        let rect = thumbnailActive.getBoundingClientRect();
        if (rect.left < 0 || rect.right > window.innerWidth) {
            thumbnailActive.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
        }
    }

    // click thumbnail
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            itemActive = index;
            showSlider();
        })
    })


    // Travelling and exploring the regions here

    const token = localStorage.getItem("token");
    let userRegion;

    function loadUserRegion(callback) {
        fetchMethod(currentUrl + '/api/users/verify', function(responseStatus, responseData) {
            userRegion = responseData[0].region;
            if (typeof callback === "function") {
                callback();
            }
        }, 'GET', null, token);
    }
    

    items.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('active')) {
                // Get the region name from the active slider item.
                const regionName = item.querySelector('.regionName').textContent.trim();
                // Get the region image (assuming the <img> is the first child).
                const currentPicture = item.firstElementChild.src.split(`http://localhost:3000`)[1];
    
                // Ensure we load the user region before proceeding
                loadUserRegion(function() {
                    // Now that userRegion is updated, check if it matches the clicked region
                    if (regionName === userRegion) {
                        // User is already in this region – show the explore modal.
                        fetchMethod(currentUrl + '/api/map', (responseStatus, responseData) => {
                            const region = responseData.find(reg => reg.region_name == regionName);
                            document.getElementById('exploreModal').innerHTML = `
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content bg-dark text-light">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="exploreModalLabel">Explore and dive deeper!</h5>
                                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body" id="exploreInfo">
                                        <div>
                                            <h5>Explore <strong>${region.region_name}</strong>?</h5>
                                            <div class="modalRegionPicture">
                                                <img src="${currentPicture}" alt="picture_of_region" class="regionImg">
                                            </div>
                                            <div id="regionInfo" class="my-3"> 
                                                ${region.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Nahhhh</button>
                                        <button type="button" class="btn btn-primary" id="confirmExploreButton">Yes, Explore!</button>
                                    </div>
                                </div>
                            </div>
                            `;
                            (new bootstrap.Modal(document.getElementById('exploreModal'))).show();
                            document.getElementById("confirmExploreButton").addEventListener("click", function (event) {
                                event.stopPropagation();
                                userExplore(region);
                            });
                        });
                    } else {
                        // User is not in the clicked region – show the travel modal.
                        fetchMethod(currentUrl + '/api/map', (responseStatus, responseData) => {
                            const region = responseData.find(reg => reg.region_name == regionName);
                            document.getElementById('travelModal').innerHTML = `
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content bg-dark text-light">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="travelModalLabel">Travel Confirmation</h5>
                                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body" id="regionInformation">
                                        <div>
                                            <h5>Do you want to travel to <strong>${region.region_name}</strong>?</h5>
                                            <div class="modalRegionPicture">
                                                <img src="${currentPicture}" alt="picture_of_region" class="regionImg">
                                            </div>
                                            <div id="regionInfo" class="my-3"> 
                                                ${region.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Nahhhh</button>
                                        <button type="button" class="btn btn-primary" id="confirmTravelButton">Yes, Travel!</button>
                                    </div>
                                </div>
                            </div>
                            `;
                            (new bootstrap.Modal(document.getElementById('travelModal'))).show();
                            document.getElementById("confirmTravelButton").addEventListener("click", function (event) {
                                event.stopPropagation();
                                userTravel(region);
                            });
                        });
                    }
                });
            }
        });
    });

    function userTravel (region) {
        const callbackForTravel = (responseStatus, responseData) => {
            const modal = bootstrap.Modal.getInstance(document.getElementById(`travelModal`));
            if (responseStatus === 200) {
                showToast(responseData.message, "primary", `<i class="fa-solid fa-location-dot"></i>`);
                modal.hide();
                loadUserRegion();
            } else {
                showToast(responseData.message, "danger", `<i class="fa-solid fa-xmark"></i>`);
                modal.hide();
            }
        }

        fetchMethod(currentUrl + `/api/map/${region.region_id}`, callbackForTravel, 'PUT', null, token)
    }

    function userExplore (region) {
        const callbackToVerifyUser = (responseStatus, responseData) => {
            const modal = bootstrap.Modal.getInstance(document.getElementById(`exploreModal`));
            if (responseStatus === 200) {
                console.log("Access granted! Exploring this region...")
                window.location.href = `dungeonsOrTrading.html?region_id=${region.region_id}`
            } else {
                showToast("Log in to explore this region!", "primary", `<i class="fa-solid fa-location-dot"></i>`);
                modal.hide();
            }
        }

        fetchMethod(currentUrl + `/api/users/verify`, callbackToVerifyUser, 'GET', null, token)
    }

    
})