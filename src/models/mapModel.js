const pool = require('../services/db');

////////////////////////////////////////////////////////////////////////
// GET /
// Get all regions.
////////////////////////////////////////////////////////////////////////

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Region;
    `

    pool.query(SQLSTATEMENT, callback)
}


////////////////////////////////////////////////////////////////////////
// PUT /:region_id
// Player travel. 
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Middleware used to check if player and region exists.
////////////////////////////////////////////////////////////////////////

// module.exports.checkUserAndRegion = (data, callback) => {
//     const SQLSTATEMENT = `
//     SELECT
//     CASE
//         WHEN EXISTS (SELECT 1 FROM Player WHERE player_id = ?) 
//              AND EXISTS (SELECT 1 FROM Region WHERE region_id = ?) THEN 'Both'
//         WHEN EXISTS (SELECT 1 FROM Player WHERE player_id = ?) THEN 'Player'
//         WHEN EXISTS (SELECT 1 FROM Region WHERE region_id = ?) THEN 'Region'
//         ELSE 'None'
//     END AS existence_status;
//     `

//     const VALUES = [data.player_id, data.region_id, data.player_id, data.region_id]

//     pool.query(SQLSTATEMENT, VALUES, callback)
// }

////////////////////////////////////////////////////////////////////////
// Middleware used to obtain a player's region
////////////////////////////////////////////////////////////////////////

module.exports.getUserRegion = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT region
    FROM User
    WHERE user_id = ?;
    `

    const VALUES = [data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Middleware used to check if player is trading.
////////////////////////////////////////////////////////////////////////

module.exports.selectUsersTrading = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT DISTINCT t.user1_id, t.user2_id
    FROM Trade t
    WHERE t.trade_status = 'Pending' AND
        (t.user1_id IN (
        SELECT pm2.user_id FROM
        (SELECT * FROM User WHERE user_id = ?) p 
        INNER JOIN PartyMembers pm ON p.user_id = pm.user_id
        INNER JOIN PartyMembers pm2 ON pm.party_id = pm2.party_id
    ) OR 
        t.user2_id IN (
        SELECT pm2.user_id FROM
        (SELECT * FROM User WHERE user_id = ?) p 
        INNER JOIN PartyMembers pm ON p.user_id = pm.user_id
        INNER JOIN PartyMembers pm2 ON pm.party_id = pm2.party_id
    ) OR 
		(SELECT trade_id WHERE trade_status = 'Pending' AND user1_id = ?) OR (SELECT trade_id WHERE trade_status='Pending' AND user2_id = ?)
    );
    `

    const VALUES = [data.user_id, data.user_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Middleware used to obtain the region's level requirement
////////////////////////////////////////////////////////////////////////

module.exports.getRegionLevelRequirement = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        COALESCE(
            (SELECT MIN(u2.level) 
            FROM PartyMembers AS pm
            INNER JOIN User AS u2 ON u2.user_id = pm.user_id
            WHERE pm.party_id = (SELECT party_id FROM PartyMembers WHERE user_id = u.user_id)
            ),
            u.level
        ) AS level
    FROM User AS u
    WHERE u.user_id = ?;

    SELECT level_requirement 
    FROM Region
    WHERE region_id = ?;
    `

    const VALUES = [data.user_id, data.region_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Player travel
////////////////////////////////////////////////////////////////////////


module.exports.updateUserRegion = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET region = (
        SELECT region_name 
        FROM Region 
        WHERE region_id = ?
    ) 
    WHERE user_id = ? OR user_id IN (
        SELECT user_id
        FROM PartyMembers
        WHERE party_id = (
            SELECT party_id
            FROM PartyMembers
            WHERE user_id = ?
        )
    );
    `

    const VALUES = [data.region_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback);
}

////////////////////////////////////////////////////////////////////////
// GET /dungeons
// Get all available dungeons.
////////////////////////////////////////////////////////////////////////

module.exports.selectAllDungeons = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Dungeons;
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// GET /:region_id/dungeons
// Getting all dungeons inside a specific region.
////////////////////////////////////////////////////////////////////////

// Middleware used to check if region exists.

module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Region
    WHERE region_id = ?;
    `

    const VALUES = [data.region_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.selectDungeonsByRegion = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Dungeons
    WHERE region_id = ?;
    `

    const VALUES = [data.region_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /dunngeons/:dungeon_id
// Fighting dungeons. 
// Party must be inside the same region as the dungeon. If not, must travel.
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
// Middleware used to check if party and dungeon exists.
////////////////////////////////////////////////////////////////////////


module.exports.checkPartyAndDungeon = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        EXISTS(SELECT 1 FROM Party WHERE party_id = ?) AS partyExists,
        EXISTS(SELECT 1 FROM Dungeons WHERE dungeon_id = ?) AS dungeonExists;
    `

    const VALUES = [data.party_id, data.dungeon_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Middleware used to check if party's region is the same as the dungeon's
////////////////////////////////////////////////////////////////////////

module.exports.selectRegionByDungeonAndParty = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT region_id 
    FROM Dungeons 
    WHERE dungeon_id = ?;

    SELECT r.region_id
    FROM PartyMembers AS pm
    INNER JOIN User u ON u.user_id = pm.user_id
    INNER JOIN Region r ON r.region_name = u.region
    WHERE pm.party_id = ?
    LIMIT 1;
    `

    const VALUES = [data.dungeon_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Middleware used to get the stats of the party and the dungeon's power level.
////////////////////////////////////////////////////////////////////////


module.exports.selectDungeonAndPartyStats = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        p.party_id,
        p.party_name,
        MIN(u.level) AS min_level,
        SUM((c.base_health + (u.level * 5))) +
        SUM((c.base_attack + (u.level * 5))) +
        SUM((c.base_defense + (u.level * 5))) +
        SUM((c.base_mana + (u.level * 5))) +
        SUM(CASE WHEN wi.weapon_id IS NOT NULL THEN w.damage ELSE 0 END) +
        SUM(CASE WHEN si.spell_id IS NOT NULL THEN s.power ELSE 0 END) +
        SUM(CASE WHEN ai.armour_id IS NOT NULL THEN a.defense ELSE 0 END) AS total_power
    FROM 
        Party AS p
    INNER JOIN 
        PartyMembers AS pm ON p.party_id = pm.party_id
    INNER JOIN 
        User AS u ON pm.user_id = u.user_id
    LEFT JOIN 
        WeaponInventory AS wi ON u.user_id = wi.user_id AND wi.is_equipped = TRUE
    LEFT JOIN 
        SpellInventory AS si ON u.user_id = si.user_id AND si.is_equipped = TRUE
    LEFT JOIN 
        ArmourInventory AS ai ON u.user_id = ai.user_id AND ai.is_equipped = TRUE
    LEFT JOIN 
        Weapons AS w ON wi.weapon_id = w.weapon_id
    LEFT JOIN 
        Spells AS s ON si.spell_id = s.spell_id
    LEFT JOIN 
        Armour AS a ON ai.armour_id = a.armour_id
    INNER JOIN
        Classes AS c ON u.class_id = c.class_id -- Join the Classes table to get base stats
    WHERE 
        p.party_id = ?
    GROUP BY 
        p.party_id;

    SELECT dungeon_strength 
    FROM Dungeons
    WHERE dungeon_id = ?;
    `

    const VALUES = [data.party_id, data.dungeon_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Middleware used to record the dungeon attempt. Used in creating the leaderboard.
////////////////////////////////////////////////////////////////////////

module.exports.insertAttempts = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO DungeonAttempts (dungeon_id, party_id, success)
    VALUES (?, ?, ?);
    `

    const VALUES = [data.dungeon_id, data.party_id, data.success]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// Distributing the loot after completing a dungeon.
////////////////////////////////////////////////////////////////////////

module.exports.generateAndDistributeLoot = (data, callback) => {
    const SQLSTATEMENT = `
    DROP PROCEDURE IF EXISTS GenerateLootForParty;

    CREATE PROCEDURE GenerateLootForParty(IN party_id INT, IN dungeon INT)
    BEGIN
        DECLARE user_id INT;
        DECLARE loot_type VARCHAR(50);
        DECLARE random_rarity VARCHAR(50);
        DECLARE item_id INT;
        DECLARE item_count INT;
        DECLARE random_id INT;
        DECLARE done INT DEFAULT 0;
        DECLARE dungeon_difficulty ENUM('Easy', 'Medium', 'Hard');
        
        DECLARE player_cursor CURSOR FOR
            SELECT pm.user_id
            FROM PartyMembers pm
            JOIN Party pty ON pm.party_id = pty.party_id
            WHERE pty.party_id = party_id;

        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

        SELECT difficulty INTO dungeon_difficulty
        FROM Dungeons
        WHERE dungeon_id = dungeon;

        -- Open the cursor to loop through all players in the party
        OPEN player_cursor;

        -- Loop through all players in the party
        read_loop: LOOP
            -- Fetch the next user_id from the cursor
            FETCH NEXT FROM player_cursor INTO user_id;

            IF done THEN
                LEAVE read_loop;
            END IF;

            -- Randomly choose loot type (Weapon, Spell, or Armour) for this player
            SET loot_type = CASE
                WHEN FLOOR(RAND() * 3) = 0 THEN 'Weapon'
                WHEN FLOOR(RAND() * 3) = 1 THEN 'Spell'
                ELSE 'Armour'
            END;    

            -- Adjust rarity probabilities based on dungeon difficulty
            IF dungeon_difficulty = 'Easy' THEN
                SET random_rarity = CASE
                    WHEN RAND() <= 0.80 THEN 'Common'
                    WHEN RAND() <= 0.95 THEN 'Rare'
                    ELSE 'Legendary'
                END;
            ELSEIF dungeon_difficulty = 'Medium' THEN
                SET random_rarity = CASE
                    WHEN RAND() <= 0.60 THEN 'Common'
                    WHEN RAND() <= 0.85 THEN 'Rare'
                    ELSE 'Legendary'
                END;
            ELSEIF dungeon_difficulty = 'Hard' THEN
                SET random_rarity = CASE
                    WHEN RAND() <= 0.40 THEN 'Common'
                    WHEN RAND() <= 0.75 THEN 'Rare'
                    ELSE 'Legendary'
                END;
            END IF;


            IF loot_type = 'Weapon' THEN
                -- Get random weapon ID with the chosen rarity for this player
                SELECT weapon_id INTO item_id 
                FROM Weapons 
                WHERE rarity = random_rarity 
                ORDER BY RAND() 
                LIMIT 1;

                INSERT INTO WeaponInventory (user_id, weapon_id)
                VALUES (user_id, item_id);

            ELSEIF loot_type = 'Spell' THEN
                -- Get random spell ID with the chosen rarity for this player
                SELECT spell_id INTO item_id 
                FROM Spells 
                WHERE rarity = random_rarity 
                ORDER BY RAND() 
                LIMIT 1;

                INSERT INTO SpellInventory (user_id, spell_id)
                VALUES (user_id, item_id);

            ELSE
                -- Get random armor ID with the chosen rarity for this player
                SELECT armour_id INTO item_id 
                FROM Armour 
                WHERE rarity = random_rarity 
                ORDER BY RAND() 
                LIMIT 1;

                INSERT INTO ArmourInventory (user_id, armour_id)
                VALUES (user_id, item_id);
            END IF;

        END LOOP;

        -- Close and deallocate the cursor
        CLOSE player_cursor;
    END;


    CALL GenerateLootForParty(?, ?);
    `

    const VALUES = [data.party_id, data.dungeon_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



