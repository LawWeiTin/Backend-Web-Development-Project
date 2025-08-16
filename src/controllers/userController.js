const model = require('../models/userModel')

////////////////////////////////////////////////////////////////////////
// QUESTION 1 (POST /users)
////////////////////////////////////////////////////////////////////////

module.exports.checkUsernameAndEmail = (req, res, next) => {

    if (req.body.username == undefined || req.body.email == undefined) {
        res.status(400).json({
            message: 'Missing username or email!'
        })
        return
    }

    const data = {
        username: req.body.username,
        email: req.body.email
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkUsername ${error}`);
            res.status(500).json(error);
        } else {
            let currentUser = req.params.user_id;

            if ((results[0].length > 0 && results[0][0].user_id != currentUser) && (results[1].length > 0 && results[1][0].user_id != currentUser)) {
                res.status(409).json({ message: ["Username already taken!", "Email already taken!"], error: "both" })
            } else if (results[0].length > 0 && results[0][0].user_id != currentUser) {
                res.status(409).json({ message: 'Username already taken!', error: "username" })
            } else if (results[1].length > 0 && results[1][0].user_id != currentUser) {
                res.status(409).json({ message: "Email already taken!", error: "email" })
            } else {
                next();
            }
        }
    }

    model.selectByUsernameAndEmail(data, callback);
}

module.exports.createNewUser = (req, res, next) => {

    const data = {
        username: req.body.username,
        skillpoints: req.body.skillpoints !== undefined ? req.body.skillpoints : 0,
        email: req.body.email,
        password: res.locals.hash
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error createNewUser ${error}`);
            res.status(500).json(error);
        } else {
            res.locals.user_id = results.insertId
            next();
        }
    }

    model.insertSingle(data, callback);
}



module.exports.getUserById = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getUserById ${error}`);
            res.status(500).json(error);
        } else {
            res.status((req.method =='GET' ? 200 : 201)).json(results)
        }
    }

    model.selectById(data, callback);
}


////////////////////////////////////////////////////////////////////////
// QUESTION 2 (GET /users)
////////////////////////////////////////////////////////////////////////

module.exports.getAllUser = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllUser ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Currently no users!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectAll(callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 3 (PUT /users/{user_id})
////////////////////////////////////////////////////////////////////////


module.exports.checkUserId = (req, res, next) => {

    if (req.body.username == undefined || req.body.skillpoints == undefined) {
        res.status(400).json({
            message: 'Missing username or skillpoints!'
        })
        return
    }

    const data = {
        id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkUserId ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "User not found!" })
            } else {
                next();
            }
        }
    }

    model.selectById(data, callback)
}



module.exports.updateUserById = (req, res, next) => {

    const data = {
        username: req.body.username,
        skillpoints: req.body.skillpoints,
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error updateUserById ${error}`)
            res.status(500).json(error)
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "User is not found!" })
            } else {
                req.user_id = req.params.user_id
                next();
            }
        }
    }

    model.updateById(data, callback)
}


//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////

module.exports.login = (req, res, next) => {
    if (req.body.password === undefined || req.body.username === undefined || req.body.username === "" || req.body.password === "") {
        res.status(400).json({ message: "Password and username must be defined!" })
        return
    }

    const data = {
        username: req.body.username
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error login: ", error)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "User not found!" })
            } else {
                res.locals.user_id = results[0].user_id
                res.locals.hash = results[0].password
                next();
            }
        }
    }

    model.selectByUsernameAndEmail(data, callback)
}


//////////////////////////////////////////////////////
// UPDATE USER PROFILE PICTURE
//////////////////////////////////////////////////////

module.exports.updateProfilePicture = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        profile: req.body.profile
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateProfilePicture: ", error)
            res.status(500).json(error)
        } else {
            res.status(200).json({ message: "Successfully updated!" })
        }
    }

    model.updateProfileById(data, callback)
}

//////////////////////////////////////////////////////
// GET CHALLENGE LEADERBOARD
//////////////////////////////////////////////////////

module.exports.getChallengeLeaderboard = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getUserLeaderboard ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "No fitness challenges have been completed!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectChallengeLeaderboard(callback)
}

//////////////////////////////////////////////////////
// GET USER LEADERBOARD
//////////////////////////////////////////////////////

module.exports.getUserLeaderboard = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getPowerLeaderboard ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "No users yet!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectUserLeaderboard(callback)
}



////////////////////////////////////////////////////////////////////////
// GET /users/class
////////////////////////////////////////////////////////////////////////

// Use this to view all the classes available
// We can use this to choose what class we want for our players

module.exports.getAllClasses = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllClasses ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json(results)
        }
    }

    model.selectAllClasses(callback);
}

////////////////////////////////////////////////////////////////////////
// PUT /users/class
////////////////////////////////////////////////////////////////////////


module.exports.swapUserClass = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        class_id: req.params.class_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error swapUserClass ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({ message: "User's class successfully updated!" })
        }
    }

    model.updateUserClass(data, callback);
}

//////////////////////////////////////////////////////
// GET /users/allinventory
//////////////////////////////////////////////////////

module.exports.getAllInventory = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getUserInventory ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Nobody has any items yet... :(" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectAllInventory(callback);
}




//////////////////////////////////////////////////////
// GET /users/userinventory
//////////////////////////////////////////////////////

module.exports.getUserInventory = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getUserInventory ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "No items inside inventory! Fight some dungeons to get loot!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectUserInventory(data, callback);
}





////////////////////////////////////////////////////////////////////////
// PUT /users/equip
////////////////////////////////////////////////////////////////////////

module.exports.checkInventoryExist = (req, res, next) => {

    const data = {
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type
    }

    const callback = (error, results, fields) => {
        if (error) {
            if (error.message == "item_type") {
                res.status(404).json({ message: "Please check the request body. Only weapon, spell or armour allowed." })
            } else {
                console.error(`Error checkInventoryExist ${error}`)
                res.status(500).json({ Error: "Internal Server Error" })
            }
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Item does not exist in inventory!" })
            } else {
                next();
            }
        }
    }

    model.selectInventoryById(data, callback)
}


module.exports.checkClassForEquip = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkClassForEquip ${error}`)
            res.status(500).json({ Error: error.message })
        } else {
            if (results[0][0].class_id != results[1][0].class_id) {
                res.status(403).json({ message: `The item is only available to the ${results[1][0].equipment_class} class! This player's class is ${results[0][0].user_class}!`})
            } else {
                req.itemName = results[1][0].name
                next();
            }
        }
    }

    model.getUserAndItemClass(data, callback)
}


module.exports.equipItem = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error equipItem ${error}`)
            res.status(500).json({ Error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: `${req.body.item_type.toUpperCase()}: ${req.itemName} equipped successfully.` });
        }
    }

    // Update the inventory and equip the item
    model.equipItem(data, callback)
}

////////////////////////////////////////////////////////////////////////
// PUT /users/unequip
////////////////////////////////////////////////////////////////////////

module.exports.unequipItem = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error equipItem ${error}`)
            res.status(500).json({ Error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: `${req.body.item_type.toUpperCase()}: ${req.itemName} unequipped successfully.` });
        }
    }

    // Update the inventory and equip the item
    model.unequipItem(data, callback)
}




////////////////////////////////////////////////////////////////////////
// PUT /users/:user_id/trade
////////////////////////////////////////////////////////////////////////

module.exports.updateUserTradeStatus = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error updateUserTradeStatus ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            res.status(200).json({ message: "Accepted! Waiting for other user to accept..." })
        }
    }

    model.updateAccept(data, callback)
}



