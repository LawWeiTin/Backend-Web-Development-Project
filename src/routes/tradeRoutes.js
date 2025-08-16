// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')
const controller = require('../controllers/tradeController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################


// Get all trades that are pending, accepted or cancelled.
router.get('/', controller.getAllTrades)

// Get all items inside a specific trade.
router.get('/:trade_id', controller.getTradeById, controller.getAllItemsInsideTrade)


// Create a trade.
// Request body: user2_id
router.post('/', 
    jwtMiddleware.verifyToken,
    controller.checkIfUserTrading, 
    controller.checkRegionOfUser, 
    controller.initiateTrade
)

// Add an item to the trade. This item will be transferred to other player's inventory when trade finished.
// Request body: item_type, inventory_id
router.post('/:trade_id', 
    jwtMiddleware.verifyToken, 
    controller.checkIfItemAlreadyInsideTrade,
    controller.placeItemsForTrade
)

// Removing an item from the trade. 
// Request body: item_type, inventory_id
router.delete('/:trade_id', 
    jwtMiddleware.verifyToken,
    controller.removingItemFromTrade
)


// Accepting or cancelling a pending trade. Put status: true if accepting, else put status: false.
// Request body: user1_id, user2_id, status
router.put('/:trade_id', 
    controller.acceptTrade,
    controller.shiftItemsIntoInventory, 
    controller.finishTrade
)


// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;