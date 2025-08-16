
const model = require('../models/tradeModel')


////////////////////////////////////////////////////////////////////////
// GET /trades
////////////////////////////////////////////////////////////////////////

module.exports.getAllTrades = (req, res, next) => {
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllTrades ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Currently no trades!"})
            } else {
                res.status(200).json(results)
            }
        }
    }
    
    model.selectAll(callback)
}

////////////////////////////////////////////////////////////////////////
// GET /trades/:trade_id
////////////////////////////////////////////////////////////////////////


module.exports.getTradeById = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getTradeById ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Trade does not exist!"})
            } else {
                if (results[0].trade_status == 'Accepted' || results[0].trade_status == 'Cancelled') {
                    res.status(409).json({ message: "This trade has already been completed!" })
                } else {
                    next();
                }
            }
        }
    }
    
    model.selectById(data, callback)
}

module.exports.getAllItemsInsideTrade = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllItemsInsideTrade ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "There are currently no items inside the trade yet!" })
            } else {
                res.status(200).json(results)
            }
        }
    }
    
    model.selectItemsByTrade(data, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /trades
////////////////////////////////////////////////////////////////////////

// Simple check for whether players exist.

// module.exports.checkPlayerExistenceForTrading = (req, res, next) => {

//     const data = {
//         user1_id: res.locals.user_id,
//         user2_id: req.body.user2_id
//     }

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error(`Error checkPlayerExistenceForTrading ${error}`)
//             res.status(500).json({ Error: "Internal Server Error" })
//         } else {
//             if (results[0][0].player1 && results[1][0].player2) {
//                 next();
//             } else {
//                 if (results[0][0].player1) {
//                     res.status(404).json({ message: "Player2 does not exist!" })
//                 } else if (results[1][0].player2) {
//                     res.status(404).json({ message: "Player1 does not exist!" })
//                 } else {
//                     res.status(404).json({ message: "Both players do not exist!" })
//                 }
//             }
//         }
//     }

//     model.selectPlayerForTrading(data, callback)
// }

module.exports.checkIfUserTrading = (req, res, next) => {

    const data = {
        user1_id: res.locals.user_id,
        user2_id: req.body.user2_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkIfUserTrading ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            if (results.length == 0) {
                next();
            } else {
                res.status(403).json({ message: "User already inside another trade!" })
            }
        }
    }

    model.selectUserAlreadyTrading(data, callback)
}


module.exports.checkRegionOfUser = (req, res, next) => {

    const data = {
        user2_id: req.body.user2_id
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkRegionOfPlayer ${error}`)
            res.status(500).json(error)
        } else {
            if (results[0].region == 'City Center') {
                next();
            } else {
                res.status(403).json({ message: "Users must be at City Center to trade!" })
            }
        }
    }
    
    model.selectRegionOfUsers(data, callback)
}


module.exports.initiateTrade = (req, res, next) => {
    
    const data = {
        user1_id: res.locals.user_id,
        user2_id: req.body.user2_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error initiateTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            res.status(201).json({ message: "Trade initiated!" })
        }
    }

    model.insertSingleTrade(data, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /trades/:trade_id
////////////////////////////////////////////////////////////////////////

// module.exports.checkPlayerAndTrade = (req, res, next) => {

//     if (req.body.player_id == undefined) {
//         res.status(400).json({ message: "player_id is missing!" })
//         return
//     }
    
//     const data = {
//         player_id: req.body.player_id,
//         trade_id: req.params.trade_id
//     }

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error(`Error checkPlayerAndTrade ${error}`)
//             res.status(500).json(error)
//         } else {
//             if (results[0].length == 0 && results[1].length == 0) {
//                 res.status(404).json({ message: "Both player and trade do not exist!" })
//             } else if (results[0].length == 0) {
//                 res.status(404).json({ message: "Player does not exist!" })
//             } else if (results[1].length == 0) {
//                 res.status(404).json({ message: "Trade does not exist!" })
//             } else {
//                 if (results[1][0].trade_status == 'Accepted' || results[1][0].trade_status == 'Cancelled') {
//                     res.status(403).json({ message: "This trade has already been completed!" })
//                 } else {
//                     next();
//                 }
//             }
//         }
//     }
    
//     model.selectTradeAndPlayerById(data, callback)
// }


module.exports.checkItemOwner = (req, res, next) => {

    if (req.body.item_type == undefined || req.body.inventory_id == undefined) {
        res.status(400).json({
            message: 'Missing item_type or inventory_id!'
        })
        return
    }

    const data = {
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type,
        player_id: req.body.player_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkItemOwner ${error}`)
            res.status(500).json({ Error: error.message })
        } else {

            if (results[0].length == 0) {
                res.status(404).json({ message: "Item not found!" })
            } else if (results[1].length == 0) {
                res.status(409).json({ message: "Player does not own this item!" })
            } else {
                next();
            }
        }
    }

    model.selectInventoryOwner(data, callback)
}


module.exports.checkIfPlayerInsideTrade = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkIfPlayerInsideTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            if (results[0].player1_id == req.body.player_id || results[0].player2_id == req.body.player_id) {
                next();
            } else {
                res.status(403).json({ message: "Player is not inside this trade!" })
            }
        }
    }

    model.selectPlayerByTrade(data, callback)
}


module.exports.checkIfItemAlreadyInsideTrade = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        trade_id: req.params.trade_id,
        item_type: req.body.item_type,
        inventory_id: req.body.inventory_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkIfItemAlreadyInsideTrade ${error}`)
            if (error.message == "item_type") {
                res.status(400).json({ message: "Only 'weapon', 'spell', or 'armour' are allowed inside item_type" })
            } else {
                res.status(500).json({ Error: "Internal Server Error" })
            }
        } else {
            // this if else statement is to check if item already inside the trade
            if (results.length == 0) {
                next();
            } else {
                res.status(409).json({ message: "Item already placed inside trade!" })
            }
        }
    }

    model.selectTradeItemById(data, callback)
}


module.exports.placeItemsForTrade = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        trade_id: req.params.trade_id,
        item_type: req.body.item_type,
        inventory_id: req.body.inventory_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error placeItemsForTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            res.status(200).json({
                message: `${results[1][0].username} (user_id: ${results[1][0].user_id}) has placed an item!`,
                item: {
                    class: results[1][0].class_name, 
                    name: results[1][0].name,
                    PowerOrDefense: results[1][0].power_or_defense
                }
            })
        }
    }

    model.insertTradeItem(data, callback)
}


////////////////////////////////////////////////////////////////////////
// DELETE /trades/:trade_id
////////////////////////////////////////////////////////////////////////

// Reuses the same middleware as adding items into the trade.

module.exports.removingItemFromTrade = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id,
        user_id: res.locals.user_id,
        inventory_id: req.body.inventory_id,
        item_type: req.body.item_type
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error removingItemFromTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            res.status(200).json({ message: "Item has been successfully removed." })
        }
    }

    model.removeItemFromTrade(data, callback)
}


////////////////////////////////////////////////////////////////////////
// PUT /trades/:trade_id
////////////////////////////////////////////////////////////////////////

// Check for correct players inside the trade.
// Cases such as if:
// We created the trade using player1_id: 1 and player2_id: 2. Then, we accidentally put player1_id: 2 and player2_id: 1
// Or if player that is not inside the trade is here.

// module.exports.checkPlayer1Player2 = (req, res, next) => {

//     const data = {
//         player1_id: req.body.player1_id,
//         player2_id: req.body.player2_id
//     }

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error(`Error checkPlayer1Player2 ${error}`)
//             res.status(500).json({ Error: "Internal Server Error" })
//         } else {
//             // Basically if we created the trade using player1_id: 1 and player2_id: 2
//             // If we accidentally put player1_id: 2 and player2_id: 1
//             // Will throw this response. Same for any other combination than the one used for initiating the trade.
//             if (results.length == 0) {
//                 res.status(404).json({ message: "Players are not correct! Check their positions (whether player 1 and 2 have been swapped) or whether they are inside the trade!" })
//             } else {
//                 next();
//             }
//         }
//     }

//     model.selectPlayer1Player2(data, callback)
// }

// stop the entire middleware if player decides to decline

module.exports.acceptTrade = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id,
        user1_id: req.body.user1_id,
        user2_id: req.body.user2_id,
        status: req.body.status
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error acceptTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            if (req.body.status) {
                next();
            } else {
                res.status(200).json({ message: "Trade has been cancelled." })
            }
        }
    }

    model.updateTradeById(data, callback)
}

// Move the respective items into each player's inventory.

module.exports.shiftItemsIntoInventory = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id,
        user1_id: req.body.user1_id,
        user2_id: req.body.user2_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error shiftItemsIntoInventory ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            next();
        }
    }

    model.insertTradeItemIntoUserInventory(data, callback)
}

// Send a nice message that trade is completed.

module.exports.finishTrade = (req, res, next) => {

    const data = {
        trade_id: req.params.trade_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error finishTrade ${error}`)
            res.status(500).json({ Error: "Internal Server Error" })
        } else {
            res.status(200).json({ message: "Trade finished!" })
        }
    }

    model.deleteTradeById(data, callback)
}

