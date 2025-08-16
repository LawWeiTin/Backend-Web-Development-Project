document.addEventListener("DOMContentLoaded", function () {

    const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
    
        const users = document.getElementById("users");
        if (responseData.message === "Currently no users!") {
            users.innerHTML = `
            <h1 class="text-center p-5">
                ${responseData.message} :(
            </h1>
            `
        } else {
            responseData.forEach(user => {
                const displayItem = document.createElement("div");
                displayItem.className = "col-md-4 p-3";
                displayItem.innerHTML = `
                <div class="card p-5">
                    <div class="d-flex justify-content-center align-items-center">
                        <img src="${user.profile}" class="rounded-circle" alt="${user.username}'s profile picture" width=250 height=250>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-center mb-5">${user.username}</h5>
                        <p class="card-text">
                            <strong>Level:</strong> ${user.level} <br>
                            <strong>Region:</strong> ${user.region} <br>
                            <strong>Skillpoints:</strong> ${user.skillpoints}
                        </p>
                        <a href="singleUserInfo.html?user_id=${user.user_id}" class="btn btn-primary">View Profile</a>
                    </div>
                </div>
                `;
                users.appendChild(displayItem);
            });
        }
    }



    fetchMethod(currentUrl + '/api/users', callback)
})

