// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')
const userController = require('../controllers/userController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// 1. POST /users
router.post('/', userController.checkUsernameAndEmail, bcryptMiddleware.hashPassword, userController.createNewUser, jwtMiddleware.generateToken, jwtMiddleware.sendToken)
// 2. GET /users
router.get('/', userController.getAllUser)
// 3. PUT /users/{user_id}
// router.put('/:user_id', userController.checkUserId, userController.checkUsernameAndEmail, userController.updateUserById, userController.getUserById)

// CA2

// POST /users/login
router.post('/login', userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken)
// Get player information through JSON Web Token
router.get('/verify', jwtMiddleware.verifyToken, userController.getUserById)
// Update a user's profile picture
router.put('/profile', jwtMiddleware.verifyToken, userController.updateProfilePicture)
// Leaderboard for the most number of fitness challenges completed.
router.get('/challengeleaderboard', userController.getChallengeLeaderboard)
// Leaderboard for users with the most power
router.get('/powerleaderboard', userController.getUserLeaderboard)
// // View all available classes for player
// router.get('/class', userController.getAllClasses)
// Change a player's class
router.put('/:class_id/class', jwtMiddleware.verifyToken, userController.swapUserClass)
// Obtain a specific user's inventory
router.get('/allinventory', userController.getAllInventory)
// Obtain a specific user's inventory
router.get('/userinventory', jwtMiddleware.verifyToken, userController.getUserInventory)
// Users can equip items inside inventory.
router.put('/equip', jwtMiddleware.verifyToken, userController.checkInventoryExist, userController.checkClassForEquip, userController.equipItem)
// Users can equip items inside inventory.
router.put('/unequip', jwtMiddleware.verifyToken, userController.checkClassForEquip, userController.unequipItem)

router.put('/trades', jwtMiddleware.verifyToken, userController.updateUserTradeStatus)


// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;