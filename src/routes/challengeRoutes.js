// ##############################################################
// REQUIRE MODULES
// ##############################################################
const express = require('express')
const challengeController = require('../controllers/challengeController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')

// ##############################################################
// CREATE ROUTER
// ##############################################################
const router = express.Router()

// ##############################################################
// DEFINE ROUTES
// ##############################################################

// 4. POST /challenges
router.post('/', challengeController.validateChallengeName, challengeController.createNewChallenge, challengeController.getChallengeById)
// 5. GET /challenges
router.get('/', challengeController.getAllChallenge)
// 6. PUT /challenges/{challenge_id}
router.put('/:challenge_id', challengeController.validateChallengeAndUser, challengeController.checkForCorrectCreator, challengeController.updateChallengeById, challengeController.getChallengeById)
// 7. DELETE /challenges/{challenge_id}
router.delete('/:challenge_id', challengeController.deleteChallengeById)



// CA2

// Get all daily user completions for the day
router.get('/daily', jwtMiddleware.verifyToken, challengeController.getDailies)
// Claim dailies
router.post('/daily', jwtMiddleware.verifyToken, challengeController.claimDailies)
// Get all challenge completions
router.get('/completions', challengeController.getAllChallengeCompletions)
// Create a challenge review
router.post('/:challenge_id/review', jwtMiddleware.verifyToken, challengeController.createReviewForChallenge)
// Update a challenge review
router.put('/:challenge_id/review', jwtMiddleware.verifyToken, challengeController.updateReviewForChallenge)
// Get all reviews for a specific challenge
router.get('/:challenge_id/review', challengeController.getAllReviewByChallenge)
// Get best and worst reviews for a specific challenge
router.get('/:challenge_id/review/bestandworst', challengeController.getBestAndWorstReview)
// Get the users who have reviewed yet. This is to prevent the an user from reviewing twice. If User wants to change his/her review, can update.
router.get('/:challenge_id/all_user_reviews', jwtMiddleware.verifyToken, challengeController.getAllUserWhoReviewed)




// 8. POST /challenges/{challenge_id}/
router.post('/:challenge_id', jwtMiddleware.verifyToken, challengeController.checkChallenge, challengeController.markChallengeComplete, challengeController.getCompletionById)
// 9. GET /challenges/{challenge_id}/
router.get('/:challenge_id', jwtMiddleware.verifyToken, challengeController.getAllParticipants)

// ##############################################################
// EXPORT ROUTER
// ##############################################################
module.exports = router;