// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')
const mapController = require('../controllers/mapController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// Get all available regions inside map
router.get('/', mapController.getAllRegion)

// Player travel
// Request body: player_id
router.put('/:region_id', 
    jwtMiddleware.verifyToken,
    mapController.userRegion, 
    mapController.checkRegionLevelRequirement, 
    mapController.checkIfUserTrading,
    mapController.travelRegion
)

// View all dungeons available
router.get('/dungeons', mapController.getAllDungeons)

// View all dungeons inside a region
router.get('/:region_id/dungeons', mapController.getRegionById, mapController.getDungeonByRegion)


// Fight a dungeon.
// Only a party can enter a dungeon. If a player wants to solo, he will still need to create a party, but no need to invite anyone.
// If successfully defeat a dungeon, players inside the party will receive random loot. ( Lower chance of getting higher tier items. )
router.post('/dungeons/:dungeon_id', 
    mapController.validateDungeonFight, 
    mapController.checkRegionOfDungeonAndParty, 
    mapController.fightDungeon, 
    mapController.recordDungeonAttempts, 
    mapController.distributeLoot
)


// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;