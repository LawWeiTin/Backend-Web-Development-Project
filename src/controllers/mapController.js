const model = require('../models/mapModel')

////////////////////////////////////////////////////////////////////////
// GET /
// Get all regions.
////////////////////////////////////////////////////////////////////////

module.exports.getAllRegion = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllRegion ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json(results)
        }
    }

    model.selectAll(callback)
}

////////////////////////////////////////////////////////////////////////
// GET /dungeons
// Get all available dungeons.
////////////////////////////////////////////////////////////////////////

module.exports.getAllDungeons = (req, res, next) => {

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getAllDungeons ${error}`)
            res.status(500).json(error)
        } else {
            res.status(200).json(results)
        }
    }

    model.selectAllDungeons(callback)
}


////////////////////////////////////////////////////////////////////////
// GET /:region_id/dungeons
// Getting all dungeons inside a specific region.
////////////////////////////////////////////////////////////////////////

// Checking if the region exists first.

module.exports.getRegionById = (req, res, next) => {

    const data = {
        region_id: req.params.region_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getRegionById ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "Region does not exist!" })
            } else {
                next();
            }
        }
    }

    model.selectById(data, callback)
}


module.exports.getDungeonByRegion = (req, res, next) => {

    const data = {
        region_id: req.params.region_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error getDungeonByRegion ${error}`)
            res.status(500).json(error)
        } else {
            if (results.length == 0) {
                res.status(404).json({ message: "This region does not have any dungeons." })
            } else {
                res.status(200).json(results)
            }
        }
    }

    model.selectDungeonsByRegion(data, callback)
}

////////////////////////////////////////////////////////////////////////
// PUT /:region_id
// Player travel. 
// Must meet level requirement, and cannot be currently inside a trade.
////////////////////////////////////////////////////////////////////////

// Checking if both player and region exists. Don't need validation for this in CA2

// module.exports.checkUserAndRegion = (req, res, next) => {

//     const data = {
//         region_id: req.params.region_id,
//         player_id: req.body.player_id
//     }

//     const callback = (error, results, fields) => {
//         if (error) {
//             console.error(`Error validate: ${error}`);
//             res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             switch (results[0].existence_status) {
//                 case 'Both':
//                     next();
//                     break
//                 case 'User':
//                     res.status(404).json({ message: 'Region does not exist!' })
//                     break
//                 case 'Region':
//                     res.status(404).json({ message: 'Player does not exist!' })
//                     break
//                 case 'None':
//                     res.status(404).json({ message: 'Both Region and Player does not exist!' })
//                     break
//             }
//         }
//     }


//     model.checkUserAndRegion(data, callback)
// }

// Checking the current region of the player.
// We don't want any redundant travelling

module.exports.userRegion = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error userRegion: ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If player is already inside his/her desired region, inform you.
            if (results[0].region_id == req.params.region_id) {
                res.status(400).json({ message: "Player is already inside this region." })
            } else {
                next();
            }
        }
    }

    model.getUserRegion(data, callback);
}

// Checking the level requirement of the desired region. If met, continue.

module.exports.checkRegionLevelRequirement = (req, res, next) => {

    const data = {
        region_id: req.params.region_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkRegionLevelRequirement: ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Checking for the player's level requirement.
            // Also, if player is inside a party, instead of taking the level of the player inside the body, we take the level of the party member with the lowest level.
            if (results[0][0].level < results[1][0].level_requirement) {
                res.status(403).json({ message: "Level requirements not met!" })
            } else {
                next();
            }
        }
    }

    model.getRegionLevelRequirement(data, callback)
}

// Checking if the player is trading.
// Cannot travel while trading because players can only trade inside the City Center.

module.exports.checkIfUserTrading = (req, res, next) => {

    const data = {
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkIfPlayerTrading: ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // If player is not found in any trade, proceed to travel. Else, 403 Forbidden.
            if (results.length == 0) {
                next();
            } else {
                res.status(403).json({ message: "User is inside a trade! Cannot travel during a trade." })
            }
        }
    }

    model.selectUsersTrading(data, callback)
}

// Travelling

module.exports.travelRegion = (req, res, next) => {

    const data = {
        region_id: req.params.region_id,
        user_id: res.locals.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error travelRegion: ${error}`);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: "User has travelled!" })
        }
    }

    model.updateUserRegion(data, callback);
}


////////////////////////////////////////////////////////////////////////
// POST /dunngeons/:dungeon_id
// Fighting dungeons. 
// Party must be inside the same region as the dungeon. If not, must travel.
////////////////////////////////////////////////////////////////////////

// Checking if party and dungeon exists.
// The reason I only allowed party is because most Dungeon games I've played required the player to create a 'lobby' or 'party' before entering a dungeon. 
// If I wanted to solo, I just didn't invite anyone. So I decided to adopt this idea because it allowed for more flexibility and standardization.

module.exports.validateDungeonFight = (req, res, next) => {

    if (!req.body.party_id) {
        res.status(400).json({ message: 'Need a party to fight a dungeon!' })
        return 
    }

    const data = {
        party_id: req.body.party_id,
        dungeon_id: req.params.dungeon_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error validateDungeonFight ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            if (results[0].partyExists && results[0].dungeonExists) {
                next();
            } else {
                if (!results[0].partyExists && !results[0].dungeonExists) {
                    res.status(404).json({ message: "Party and Dungeon do not exist!" })
                } else if (!results[0].partyExists) {
                    res.status(404).json({ message: 'Party does not exist!' })
                } else {
                    res.status(404).json({ message: 'Dungeon does not exist!' })
                }
            }
        }
    }

    model.checkPartyAndDungeon(data, callback)
}

// Checking the region of the party.
// If not same as dungeon, it wouldn't make sense how they would fight the dungeon.

module.exports.checkRegionOfDungeonAndParty = (req, res, next) => {

    const data = {
        dungeon_id: req.params.dungeon_id,
        party_id: req.body.party_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error checkRegionOfDungeonAndPlayer ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            // Checking if the party's region is the same as the dungeon.
            if (results[0][0].region_id == results[1][0].region_id) {
                next();
            } else {
                res.status(403).json({ message: "Party not in the same region as the dungeon! Travel if needed." })
                return
            }
        }
    }

    model.selectRegionByDungeonAndParty(data, callback)
}

// Fighting of dungeons
// outcome will be decided here.

module.exports.fightDungeon = (req, res, next) => {

    const data = {
        party_id: req.body.party_id,
        dungeon_id: req.params.dungeon_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error fightDungeon ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            // added math.random to make it more interesting 
            // parties whose powers do not meet the dungeon strength can still have a chance of defeating the dungeon.
            // higher the party's power, the higher the chance of defeating the dungeon.
            req.outcome = (Math.random() <= results[0][0].total_power / results[1][0].dungeon_strength) ? true : false
            next();
        }
    }

    model.selectDungeonAndPartyStats(data, callback);
}

// Recording the fights, so that I can make a leaderboard later on.

module.exports.recordDungeonAttempts = (req, res, next) => {

    const data = {
        dungeon_id: req.params.dungeon_id,
        party_id: req.body.party_id,
        success: req.outcome
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error recordDungeonAttempts ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            if (!req.outcome) {
                res.status(200).json({ message: "Defeated... Try raising your party's level by doing exercises or partying up with more players!" })
            } else {
                next();
            }
        }
    }

    model.insertAttempts(data, callback);
}

// Players inside the party being distributed loot. 

module.exports.distributeLoot = (req, res, next) => {

    const data = {
        party_id: req.body.party_id,
        dungeon_id: req.params.dungeon_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error(`Error distributeLoot ${error}`)
            res.status(500).json({ error: 'Internal Server Error' })
        } else {
            res.status(200).json({ message: "Victory! Players have been distributed loot!"})
        }
    }

    model.generateAndDistributeLoot(data, callback)
}
