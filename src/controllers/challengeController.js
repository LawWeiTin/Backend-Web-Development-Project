
const model = require('../models/challengeModel')
////////////////////////////////////////////////////////////////////////
// QUESTION 4 (POST /challenges)
////////////////////////////////////////////////////////////////////////

module.exports.validateChallengeName = (req, res, next) => {

    const data = {
        challenge: req.body.challenge
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getChallengeById ${error}`);
            res.status(500).json({ Error: error.sqlMessage });
        } else {
            if (results.length == 0) {
                next();
            } else {
                res.status(409).json({ message: "Another challenge with that same name already exists!" })
            }
        }
    }

    model.selectChallengeName(data, callback);
}


module.exports.createNewChallenge = (req, res, next) => {

    const data = {
        challenge: req.body.challenge,
        user_id: req.body.user_id,
        skillpoints: req.body.skillpoints
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error createNewChallenge ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            req.challenge_id = results.insertId;
            req.code = 201;
            next();
        }
    }

    model.insertSingle(data, callback);
}

module.exports.getChallengeById = (req, res, next) => {

    const data = {
        challenge_id: req.challenge_id || req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getChallengeById ${error}`);
            res.status(500).json({ Error: error.sqlMessage });
        } else {
            res.status(req.code).json(results)
        }
    }

    model.selectById(data, callback);
}

////////////////////////////////////////////////////////////////////////
// QUESTION 5 (POST /challenges)
////////////////////////////////////////////////////////////////////////

module.exports.getAllChallenge = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllChallenge ${error}`);
            res.status(500).json({ Error: error.sqlMessage });
        } else {
            res.status(200).json(results)
        }
    }

    model.selectAll(callback);
}


////////////////////////////////////////////////////////////////////////
// QUESTION 6 (PUT /challenges/{challenge_id})
////////////////////////////////////////////////////////////////////////

module.exports.validateChallengeAndUser = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id,
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkChallenge ${error}`)
            res.status(500).json(error)
        } else {
            switch (results[0].existence_status) {
                case 'Both':
                    next();
                    break
                case 'User':
                    res.status(404).json({ message: 'Only user_id exists!' })
                    break
                case 'FitnessChallenge':
                    res.status(404).json({ message: 'Only challenge_id exists!' })
                    break
                case 'None':
                    res.status(404).json({ message: 'Both user_id and challenge_id does not exist!' })
                    break
            }
        }
    }

    model.checkUserChallenge(data, callback);
}


module.exports.checkForCorrectCreator = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkForCorrectCreator ${error}`)
            res.status(500).json(error)
        } else {
            if (results[0].creator_id != req.body.user_id) {
                res.status(403).json({ message: "Only the creator can alter the challenge!" })
            } else {
                next();
            }
        }
    }

    model.selectById(data, callback)
}


module.exports.updateChallengeById = (req, res, next) => {

    const data = {
        challenge: req.body.challenge,
        skillpoints: req.body.skillpoints,
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error updateChallengeById ${error}`)
            res.status(500).json(error)
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Challenge is not found!" })
            } else {
                req.code = 200
                next();
            }
        }
    }

    model.updateById(data, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 7 (DELETE /challenges/{challenge_id})
////////////////////////////////////////////////////////////////////////

module.exports.deleteChallengeById = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error deleteChallengeById ${error}`)
            res.status(500).json({ Error: error.sqlMessage })
        } else {
            if (results.affectedRows == 0) {
                res.status(404).json({ message: "Challenge is not found!" })
            } else {
                res.status(204).send()
            }
        }
    }

    model.deleteById(data, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 8 (POST /challenges/{challenge_id}/)
////////////////////////////////////////////////////////////////////////

module.exports.checkChallenge = (req, res, next) => {
    const data = {
        challenge_id: req.params.challenge_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkChallenge ${error}`)
            res.status(500).json(error)
        } else {
            switch (results[0].existence_status) {
                case 'Both':
                    next();
                    break
                case 'User':
                    res.status(404).json({ message: 'Only user_id exists!' })
                    break
                case 'FitnessChallenge':
                    res.status(404).json({ message: 'Only challenge_id exists!' })
                    break
                case 'None':
                    res.status(404).json({ message: 'Both user_id and challenge_id does not exist!' })
                    break
            }
        }
    }

    model.checkUserChallenge(data, callback);
}

module.exports.markChallengeComplete = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        completed: req.body.completed || true,
        notes: req.body.notes || 'Notes',
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error markChallengeComplete ${error}`)
            res.status(500).json(error)
        } else {
            req.complete_id = results[1].insertId
            next();
        }
    }

    model.markComplete(data, callback);
}

module.exports.getCompletionById = (req, res, next) => {

    const data = {
        complete_id: req.complete_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getCompletionById ${error}`)
            res.status(500).json(error)
        } else {
            res.status(201).json(results[0])
        }
    }

    model.selectCompleteById(data, callback)
}


////////////////////////////////////////////////////////////////////////
// QUESTION 9 (GET /challenges/{challenge_id}/)
////////////////////////////////////////////////////////////////////////


module.exports.getAllParticipants = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllParticipants ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({results: results, user_id: res.locals.user_id})
        }
    }

    model.selectParticipants(data, callback)
}



////////////////////////////////////////////////////////////////////////
// GET DAILY SKILLPOINTS GAINED BY USER THROUGH COMPLETING CHALLENGES
////////////////////////////////////////////////////////////////////////


module.exports.getDailies  = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getDailies ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({ results: results, user_id: res.locals.user_id })
        }
    }

    model.selectDailies(data, callback)
}


////////////////////////////////////////////////////////////////////////
// CLAIM DAILIES
////////////////////////////////////////////////////////////////////////


module.exports.claimDailies  = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error claimDailies ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({ message: "Dailies claimed!" })
        }
    }

    model.claimDailies(data, callback)
}


////////////////////////////////////////////////////////////////////////
// GET ALL USER COMPLETIONS
////////////////////////////////////////////////////////////////////////

module.exports.getAllChallengeCompletions = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllChallengeCompletions ${error}`);
            res.status(500).json({ Error: error.sqlMessage });
        } else {
            res.status(200).json(results)
        }
    }

    model.selectAllUserCompletions(callback);
}



////////////////////////////////////////////////////////////////////////
// POST REVIEW FOR CHALLENGE
////////////////////////////////////////////////////////////////////////


module.exports.createReviewForChallenge  = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        challenge_id: req.params.challenge_id,
        rating: req.body.rating,
        review: req.body.review || '-'
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error createReviewForChallenge ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({ message: "Review successfully created!" })
        }
    }

    model.insertReviewForChallenge(data, callback)
}

////////////////////////////////////////////////////////////////////////
// UPDATE REVIEW FOR CHALLENGE
////////////////////////////////////////////////////////////////////////

module.exports.updateReviewForChallenge  = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id,
        challenge_id: req.params.challenge_id,
        rating: req.body.rating,
        review: req.body.review || '-'
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error updateReviewForChallenge ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({ message: "Review updated successfully!" })
        }
    }

    model.updateReview(data, callback)
}

////////////////////////////////////////////////////////////////////////
// GET ALL REVIEW FOR A SPECIFIC CHALLENGE
////////////////////////////////////////////////////////////////////////

module.exports.getAllReviewByChallenge  = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllReviewByChallenge ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "There are no reviews for this challenge yet!"})
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectAllReviewsByChallengeId(data, callback)
}

////////////////////////////////////////////////////////////////////////
// GET ALL REVIEW FOR A SPECIFIC CHALLENGE
////////////////////////////////////////////////////////////////////////

module.exports.getBestAndWorstReview  = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getBestAndWorstReview ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json(results)
        }
    }

    model.selectBestAndWorstReviews(data, callback)
}


////////////////////////////////////////////////////////////////////////
// SELECT DISTINCT USER FROM REVIEW SO THAT THEY CANNOT REVIEW TWICE
////////////////////////////////////////////////////////////////////////

module.exports.getAllUserWhoReviewed  = (req, res, next) => {

    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllUserWhoReviewed ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json({
                results: results, 
                user_id: res.locals.user_id
            })
        }
    }

    model.selectAllUserFromReviews(data, callback)
}