const pool = require('../services/db');


////////////////////////////////////////////////////////////////////////
// Reusable model
////////////////////////////////////////////////////////////////////////

module.exports.selectPartyById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Party
    WHERE party_id = ?;
    `

    const VALUES = [data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// GET /
// Get all parties.
////////////////////////////////////////////////////////////////////////

module.exports.selectAllParty = (callback) => {
    const SQLSTATEMENT = `
    SELECT pm.*, p.leader_id
    FROM PartyMembers pm
    INNER JOIN Party p
    ON p.party_id = pm.party_id;
    `

    pool.query(SQLSTATEMENT, callback)
}


////////////////////////////////////////////////////////////////////////
// GET /members
// Get all users who are currently members of parties.
////////////////////////////////////////////////////////////////////////

module.exports.selectAllMembersOfParty = (callback) => {
    const SQLSTATEMENT = `
    SELECT P.party_id, P.party_name, PM.user_id, PM.role, U.username
    FROM Party P
    LEFT JOIN PartyMembers PM ON PM.party_id = P.party_id
    LEFT JOIN User U ON U.user_id = PM.user_id
    ORDER BY RAND();
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// GET /:party_id/members
////////////////////////////////////////////////////////////////////////

// *This model is reused later on.

module.exports.selectMemberByParty = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        pm.user_id,
        p.leader_id,
        pm.role,
        p.party_name,
        u.username,
        u.level,
        c.class_name,
        -- Health = Base health from class + (level * 5) 
        (c.base_health + (u.level * 5)) AS health,
        -- Attack = Base attack from class + (level * 5) + weapon attack + spell power
        CAST((c.base_attack + (u.level * 5) + COALESCE(SUM(w.damage), 0) + COALESCE(SUM(s.power), 0)) AS UNSIGNED) AS attack,
        -- Defense = Base defense from class + (level * 5) + armor defense
        CAST((c.base_defense + (u.level * 5) + COALESCE(SUM(a.defense), 0)) AS UNSIGNED) AS defense,
        -- Mana = Base mana from class + (level * 5)
        (c.base_mana + (u.level * 5)) AS mana
    FROM 
        PartyMembers pm
    INNER JOIN 
        Party p ON p.party_id = pm.party_id
    INNER JOIN 
        User u ON pm.user_id = u.user_id
    INNER JOIN 
        Classes c ON u.class_id = c.class_id
    LEFT JOIN 
        WeaponInventory wi ON wi.user_id = u.user_id AND wi.is_equipped = TRUE
    LEFT JOIN 
        Weapons w ON wi.weapon_id = w.weapon_id
    LEFT JOIN 
        ArmourInventory ai ON ai.user_id = u.user_id AND ai.is_equipped = TRUE
    LEFT JOIN 
        Armour a ON ai.armour_id = a.armour_id
    LEFT JOIN 
        SpellInventory si ON si.user_id = u.user_id AND si.is_equipped = TRUE
    LEFT JOIN 
        Spells s ON si.spell_id = s.spell_id
    WHERE 
        pm.party_id = ?
    GROUP BY 
        pm.user_id, u.username, pm.role, u.level, c.class_name, c.base_health, c.base_attack, c.base_defense, c.base_mana;
    `;
    const VALUES = [data.party_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

////////////////////////////////////////////////////////////////////////
// POST /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.selectExistingRequest = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM PartyRequests
    WHERE party_id = ? AND user_id = ?;
    `

    const VALUES = [data.party_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.insertSingleRequest = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO PartyRequests (user_id, party_id) 
    VALUES (?, ?);
    `
    const VALUES = [data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// GET /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.selectAllPartyRequest = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM PartyRequests pr
    INNER JOIN User u 
    ON u.user_id = pr.user_id
    WHERE party_id = ?;
    `

    const VALUES = [data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// DELETE /:party_id/request
////////////////////////////////////////////////////////////////////////

module.exports.deletePartyRequest = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM PartyRequests 
    WHERE user_id = ? AND party_id = ?;
    `

    const VALUES = [data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// POST /
////////////////////////////////////////////////////////////////////////

// Check if party name exists already or if player already inside a party.

module.exports.checkParty = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM Party WHERE party_name = ?) 
             AND EXISTS (SELECT 1 FROM PartyMembers WHERE user_id = ?) THEN 'Party name already exists, and user is already inside an existing party!'
        WHEN EXISTS (SELECT 1 FROM Party WHERE party_name = ?) THEN 'Party name already exists!'
        WHEN EXISTS (SELECT 1 FROM PartyMembers WHERE user_id = ?) THEN 'User is already inside an existing party!'
        ELSE 'Continue'
    END AS existence_status;
    `

    const VALUES = [
        data.party_name, 
        data.leader_id,
        data.party_name,
        data.leader_id
    ]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

// Check if player exists. The function on top doesn't exactly do that, it just checks for any instances of a player inside the PartyMembers table.

module.exports.checkPlayer = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Player 
    WHERE player_id = ?;
    `
    const VALUES = [data.player_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

// Creation of party.

module.exports.insertParty = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Party 
    (party_name, leader_id) 
    VALUES (?, ?);

    SET @insert = LAST_INSERT_ID();

    INSERT INTO PartyMembers 
    (party_id, user_id, role) 
    VALUES ((SELECT @insert), ?, 'Leader');
    
    INSERT INTO PartyHistory (user_id, party_id, status)
    VALUES (?, (SELECT @insert), 'Active');
    `
    const VALUES = [data.party_name, data.leader_id, data.leader_id, data.leader_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// POST /:party_id
////////////////////////////////////////////////////////////////////////

// Check if player and party exists, and also if player already inside another party.

module.exports.selectUserMember = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id
    FROM PartyMembers 
    WHERE user_id = ?;
    `
    const VALUES = [data.user_id, data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// SELECT 
// EXISTS (SELECT 1 FROM User WHERE user_id = ?) AS user_exists,
// EXISTS (SELECT 1 FROM PartyMembers WHERE user_id = ?) AS party_member_exists,
// EXISTS (SELECT 1 FROM Party WHERE party_id = ?) AS party_exists;

// Check if player inside the same region as the players in the party.

module.exports.selectRegionByUser = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT region 
    FROM User 
    WHERE user_id = ?;

    SELECT r.region_name AS region
    FROM Party AS p
    INNER JOIN User u ON u.user_id = p.leader_id
    INNER JOIN Region r ON u.region = r.region_name
    WHERE p.party_id = ?;
    `
    const VALUES = [data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// Player joining

module.exports.insertPartyMember = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO PartyMembers 
    (party_id, user_id, role) 
    VALUES (?, ?, 'Member');

    INSERT INTO PartyHistory (user_id, party_id, status)
    VALUES (?, ?, 'Active');

    DELETE FROM PartyRequests
    WHERE user_id = ? AND party_id = ?;
    `

    const VALUES = [data.party_id, data.user_id, data.user_id, data.party_id, data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// DELETE /:party_id/leave
////////////////////////////////////////////////////////////////////////

// Check if player is the leader of the party.
// If player is the leader, cannot leave. The only way the leader can leave the party is by disbanding the party.

module.exports.selectPartyLeader = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT pm.user_id, pm.role
    FROM Party AS p
    INNER JOIN PartyMembers AS pm ON p.party_id = pm.party_id
    WHERE p.party_id = ?;
    `
    const VALUES = [data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

// Player leaving

module.exports.deletePartyMember = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM PartyMembers WHERE user_id = ?;

    UPDATE PartyHistory
    SET leave_date = CURRENT_TIMESTAMP, status = 'Left'
    WHERE user_id = ? AND party_id = ? AND status = 'Active';
    `
    const VALUES = [data.user_id, data.user_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}




////////////////////////////////////////////////////////////////////////
// DELETE /:party_id
////////////////////////////////////////////////////////////////////////

// Reused the earlier selectPartyLeader function to check if player inside the request body is the party leader. 
// Only the party leader can disband the party.

module.exports.deletePartyById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM PartyMembers WHERE party_id = ?;

    DELETE FROM Party WHERE party_id = ?;

    DELETE FROM PartyRequests WHERE party_id = ?;

    UPDATE PartyHistory
    SET status = 'Inactive'
    WHERE party_id = ?;
    `
    const VALUES = [data.party_id, data.party_id, data.party_id, data.party_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


