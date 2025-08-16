const model = require('../models/partyModel')

////////////////////////////////////////////////////////////////////////
// GET /
// Get all parties.
////////////////////////////////////////////////////////////////////////

module.exports.getAllParty = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Currently no parties!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectAllParty(callback)
}

////////////////////////////////////////////////////////////////////////
// GET /
// Get all parties.
////////////////////////////////////////////////////////////////////////

module.exports.getAllMembers = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllMembers ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Currently no parties!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectAllMembersOfParty(callback)
}


////////////////////////////////////////////////////////////////////////
// GET /:party_id/members
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Middleware to check if party exists.
////////////////////////////////////////////////////////////////////////

module.exports.getPartyById = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getPartyById ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Party does not exist!" })
            } else {
                next();
            }
        }
    }

    model.selectPartyById(data, callback);
}

// Display party members.

module.exports.getPartyMembers = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getPartyMembers ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Party does not exist!" })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectMemberByParty(data, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.checkIfRequestAlreadySent = (req, res, next) => {
    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkIfRequestAlreadySent ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            if (results.length == 0) {
                next();
            } else {
                res.status(409).json({ message: "Request already sent!" })
            }
        } 
    }

    model.selectExistingRequest(data, callback)
}


module.exports.requestToJoinParty = (req, res, next) => {
    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error requestToJoinParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(201).json({ message: "Request successfully sent!" })
        } 
    }

    model.insertSingleRequest(data, callback)
}

////////////////////////////////////////////////////////////////////////
// DELETE /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.rejectPartyRequest = (req, res, next) => {
    const data = {
        party_id: req.params.party_id,
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error rejectPartyRequest ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(204).send()
        } 
    }

    model.deletePartyRequest(data, callback)
}

////////////////////////////////////////////////////////////////////////
// GET /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.getAllPartyRequests = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllPartyRequests ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(200).json(results)
        } 
    }

    model.selectAllPartyRequest(data, callback)
}

////////////////////////////////////////////////////////////////////////
// DELETE /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.removePartyRequest = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error removePartyRequest ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(200).json({ message: "Request declined!" })
        } 
    }

    model.deletePartyRequest(data, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /
////////////////////////////////////////////////////////////////////////

// Check if party exists, or if user already inside another party.

module.exports.checkPartyExistence = (req, res, next) => {

    const data = {
        party_name: req.body.party_name,
        leader_id: res.locals.user_id || req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkPartyExistence ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results[0].existence_status == 'Continue') {
                next();
            } else {
                res.status(409).json({ message: results[0].existence_status })
            }
        }
    }

    model.checkParty(data, callback);
}

// Creating the party.

module.exports.createNewParty = (req, res, next) => {
    const data = {
        party_name: req.body.party_name,
        leader_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error createNewParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            req.party_id = results[0].insertId
            next();
        }
    }

    model.insertParty(data, callback);
}

// Displaying the created party.

module.exports.displayParty = (req, res, next) => {
    const data = {
        party_id: req.party_id || req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error displayParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json(results)
        }
    }

    model.selectPartyById(data, callback);
}

////////////////////////////////////////////////////////////////////////
// POST /:party_id
////////////////////////////////////////////////////////////////////////

// Checking if player exists and 

module.exports.validatePlayerPartyExistence = (req, res, next) => {

    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error validatePlayerPartyExistence ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            let user_id = results[0] ? results[0].user_id : undefined;
            if (!user_id) {
                next();
            }  else {
                if (req.method == "DELETE") {
                    next();
                } else {
                    res.status(403).json({ message: "User already inside a party!" })
                }
            }
        }
    };

    model.selectUserMember(data, callback);
}

module.exports.checkRegion = (req, res, next) => {

    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id || req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
                console.error(`Error checkRegion ${error}`);
                res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results[0][0].region == results[1][0].region) {
                next();
            } else {
                res.status(403).json({ message: "User needs to be in the same region as the leader!" })
            }
        }
    }

    model.selectRegionByUser(data, callback);
}


module.exports.joinParty = (req, res, next) => {

    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id || req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            if (error.sqlMessage === 'Full') {
                res.status(400).json({ message: "Party is full!" });
            } else {
                console.error(`Error joinParty ${error}`);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            next();
        }
    }

    model.insertPartyMember(data, callback);
}


// Display party members.


module.exports.displayPartyMembers = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error displayPartyMembers ${error}`)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json(results)
        }
    }

    model.selectMemberByParty(data, callback);
}



////////////////////////////////////////////////////////////////////////
// DELETE /:party_id/leave
////////////////////////////////////////////////////////////////////////

// Check if player is inside the party. If inside, perform one more check if he/she is the leader.
// If player is the leader, cannot leave. The only way the leader can leave the party is by disbanding the party.

module.exports.validatePartyMember = (req, res, next) => {

    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error validatePartyMember ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            // checks whether any player in the results has a player_id equal to the req.body.player_id. 
            // It returns true if such a player exists, and false otherwise.
            if (results.some(member => member.user_id == res.locals.user_id)) {
                if (results[0].user_id == req.res.locals.user_id.player_id) {
                    res.status(403).json({ message: "Party leader is unable to directly leave the party! He / she needs to disband the entire party if want to leave." })
                } else {
                    next();
                }
            } else {
                res.status(409).json({ message: "This player is not inside the party!" })
            }
        }
    }

    model.selectPartyLeader(data, callback)
}

// Player leaving the party.


module.exports.leaveParty = (req, res, next) => {

    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error leaveParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(200).json({ message: "Player left party." })
        }
    }

    model.deletePartyMember(data, callback)
}


////////////////////////////////////////////////////////////////////////
// DELETE /:party_id
////////////////////////////////////////////////////////////////////////

// Check if player inside the request body is the party leader. 
// Only the party leader can disband the party.

module.exports.validatePartyLeader = (req, res, next) => {
    const data = {
        party_id: req.params.party_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error validatePartyLeader ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            if (results.length === 0) {
                res.status(404).json({ message: "Party does not exist!" })
            } else if (results[0].player_id !== data.player_id) {
                res.status(403).json({ message: "Only the party leader can delete the party!" })
            } else {
                next();
            }
        }
    }

    model.selectPartyLeader(data, callback)
}

module.exports.disbandParty = (req, res, next) => {
    const data = {
        party_id: req.params.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error deleteParty ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(200).json({ message: "Party deleted successfully!" })
        }
    }

    model.deletePartyById(data, callback)
}

