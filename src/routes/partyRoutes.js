// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')
const controller = require('../controllers/partyController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// View all parties.
router.get('/', controller.getAllParty)

// View all members of all parties.
router.get('/members', controller.getAllMembers)

// View all members inside a party.
router.get('/:party_id/members', controller.getPartyById, controller.getPartyMembers)

// Send a request to join a party
router.post('/:party_id/request', jwtMiddleware.verifyToken, controller.validatePlayerPartyExistence, controller.checkIfRequestAlreadySent, controller.requestToJoinParty)

// Reject a request
router.delete('/:party_id/request', controller.rejectPartyRequest)

// View all party requests.
router.get('/:party_id/request', controller.getAllPartyRequests)

// Create a party.
// Request body:
// player_id: the id of the player creating the party. He/she will also be the leader of the party.
// party_name: the name of the party.
router.post('/', jwtMiddleware.verifyToken, controller.checkPartyExistence, controller.createNewParty, controller.displayParty)


// Players joining a party
// Request body: player_id
router.post('/:party_id', controller.checkPartyExistence, controller.checkRegion, controller.joinParty, controller.displayPartyMembers)

// Player leaving a party
// Request body: player_id
router.delete('/:party_id/leave', jwtMiddleware.verifyToken, controller.validatePlayerPartyExistence, controller.validatePartyMember, controller.leaveParty)

// Disbanding party
// Request body: 
// player_id: the id of the party's leader.
router.delete('/:party_id', controller.validatePartyLeader, controller.disbandParty)


// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;