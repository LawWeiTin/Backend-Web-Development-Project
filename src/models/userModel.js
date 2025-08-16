const pool = require('../services/db');

////////////////////////////////////////////////////////////////////////
// QUESTION 1 (POST /users)
////////////////////////////////////////////////////////////////////////

module.exports.selectByUsernameAndEmail = (data, callback) => {
    let SQLSTATEMENT = `
    SELECT user_id, password
    FROM User
    WHERE username = ?;
    `

    let VALUES = [data.username]

    if (data.email) {
        SQLSTATEMENT += `
        SELECT email, user_id FROM User
        WHERE email = ?;
        `
        VALUES.push(data.email)
    }

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO User (username, skillpoints, email, password)
    VALUES (?, ?, ?, ?);
    `

    const VALUES = [data.username, data.skillpoints, data.email, data.password]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, username, skillpoints, email, profile, region, class_name
    FROM User u 
    INNER JOIN Classes c
    ON u.class_id = c.class_id
    WHERE user_id = ?;
    `

    const VALUES = [data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 2 (GET /users)
////////////////////////////////////////////////////////////////////////


module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT 
    u.user_id, 
    u.username, 
    u.skillpoints, 
    u.profile, 
    u.level, 
    c.class_name, 
    u.region, 
    u.accepted,
    u.daily,
    (c.base_health + (u.level * 5)) AS health,
    (c.base_attack + (u.level * 5)) AS attack,
    (c.base_defense + (u.level * 5)) AS defense,
    (c.base_mana + (u.level * 5)) AS mana,
    SUM(
        (c.base_health + (u.level * 5)) + 
        (c.base_attack + (u.level * 5)) + 
        (c.base_defense + (u.level * 5)) + 
        (c.base_mana + (u.level * 5)) +
        CASE WHEN wi.weapon_id IS NOT NULL THEN w.damage ELSE 0 END + 
        CASE WHEN si.spell_id IS NOT NULL THEN s.power ELSE 0 END + 
        CASE WHEN ai.armour_id IS NOT NULL THEN a.defense ELSE 0 END
    ) AS total_power
    FROM User u
    INNER JOIN 
        Classes c ON c.class_id = u.class_id
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
    GROUP BY u.user_id, u.username, u.skillpoints, u.profile, u.level, c.class_name, u.region, u.accepted, c.base_health, c.base_attack, c.base_defense, c.base_mana;
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 3 (PUT /users/{user_id})
////////////////////////////////////////////////////////////////////////

module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET username = ?, skillpoints = ?
    WHERE user_id = ?;
    `

    const VALUES = [data.username, data.skillpoints, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// BONUS: FITNESS CHALLENGE LEADERBOARD
////////////////////////////////////////////////////////////////////////

module.exports.selectChallengeLeaderboard = (callback) => {
    const SQLSTATEMENT = `
    SELECT 
        u.user_id,
        u.skillpoints,
        u.username,
        COUNT(uc.complete_id) AS challenges_completed
    FROM User AS u
    INNER JOIN UserCompletion AS uc ON u.user_id = uc.user_id
    WHERE uc.completed = TRUE
    GROUP BY u.user_id
    ORDER BY challenges_completed DESC;
    `

    pool.query(SQLSTATEMENT, callback)
}


////////////////////////////////////////////////////////////////////////
// BONUS: USER LEADERBOARD
////////////////////////////////////////////////////////////////////////

module.exports.selectUserLeaderboard = (callback) => {
    const SQLSTATEMENT = `
    SELECT u.username, 
    SUM((c.base_health + (u.level * 5))) 'Health', 
    SUM((c.base_attack + (u.level * 5))) + SUM(CASE WHEN wi.weapon_id IS NOT NULL THEN w.damage ELSE 0 END) + SUM(CASE WHEN si.spell_id IS NOT NULL THEN s.power ELSE 0 END) 'Attack',
    SUM((c.base_defense + (u.level * 5))) + SUM(CASE WHEN ai.armour_id IS NOT NULL THEN a.defense ELSE 0 END) 'Defense',
    SUM((c.base_mana + (u.level * 5))) 'Mana',
    SUM((c.base_health + (u.level * 5))) +
    SUM((c.base_attack + (u.level * 5))) +
    SUM((c.base_defense + (u.level * 5))) +
    SUM((c.base_mana + (u.level * 5))) +
    SUM(CASE WHEN wi.weapon_id IS NOT NULL THEN w.damage ELSE 0 END) +
    SUM(CASE WHEN si.spell_id IS NOT NULL THEN s.power ELSE 0 END) +
    SUM(CASE WHEN ai.armour_id IS NOT NULL THEN a.defense ELSE 0 END) AS Power
    FROM User u
    LEFT JOIN WeaponInventory wi on u.user_id = wi.user_id AND wi.is_equipped = TRUE
    LEFT JOIN SpellInventory si on u.user_id = si.user_id AND si.is_equipped = TRUE
    LEFT JOIN ArmourInventory ai on u.user_id = ai.user_id AND ai.is_equipped = TRUE
    LEFT JOIN Weapons w on w.weapon_id = wi.weapon_id
    LEFT JOIN Spells s on s.spell_id = si.spell_id
    LEFT JOIN Armour a on a.armour_id = ai.armour_id
    INNER JOIN Classes c on u.class_id = c.class_id
    GROUP BY u.user_id
    ORDER BY Power DESC;
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// UPDATE PROFILE PICTURE
////////////////////////////////////////////////////////////////////////

module.exports.updateProfileById = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET profile = ?
    WHERE user_id = ?;
    `

    const VALUES = [data.profile, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// GET ALL CLASSES
////////////////////////////////////////////////////////////////////////

module.exports.selectAllClasses = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Classes;
    `

    pool.query(SQLSTATEMENT, callback)
}


////////////////////////////////////////////////////////////////////////
// UPDATE USER'S CLASS
////////////////////////////////////////////////////////////////////////

module.exports.updateUserClass = (data, callback) => {

    const SQLSTATEMENT = `
        UPDATE User
        SET class_id = ?
        WHERE user_id = ?;

        UPDATE WeaponInventory
        SET is_equipped = FALSE
        WHERE user_id = ? AND is_equipped = TRUE;

        UPDATE SpellInventory
        SET is_equipped = FALSE
        WHERE user_id = ? AND is_equipped = TRUE;

        UPDATE ArmourInventory
        SET is_equipped = FALSE
        WHERE user_id = ? AND is_equipped = TRUE;
    `
    const VALUES = [data.class_id, data.user_id, data.user_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


//////////////////////////////////////////////////////
// GET ALL OF A USER'S INVENTORY
//////////////////////////////////////////////////////

module.exports.selectAllInventory = (callback) => {
    const SQLSTATEMENT = `
    SELECT 
        'Weapon' AS item_type,
        inventory_id,
        weapon_name AS item_name,
        rarity AS item_rarity,
        damage AS item_stat,
        is_equipped AS item_is_equipped,
        class_name,
        user_id
    FROM 
        WeaponInventory AS weapon
    INNER JOIN 
        Weapons AS w ON weapon.weapon_id = w.weapon_id
    INNER JOIN
        Classes AS c ON c.class_id = w.class_id

    UNION ALL

    SELECT 
        'Spell' AS item_type,
        inventory_id,
        spell_name AS item_name,
        rarity AS item_rarity,
        power AS item_stat,
        is_equipped AS item_is_equipped,
        class_name,
        user_id
    FROM 
        SpellInventory AS spell
    INNER JOIN 
        Spells AS s ON spell.spell_id = s.spell_id
    INNER JOIN
        Classes AS c ON c.class_id = s.class_id

    UNION ALL

    SELECT 
        'Armour' AS item_type,
        inventory_id,
        armour_name AS item_name,
        rarity AS item_rarity,
        defense AS item_stat,
        is_equipped AS item_is_equipped,
        class_name,
        user_id
    FROM 
        ArmourInventory AS ai
    INNER JOIN 
        Armour AS a ON ai.armour_id = a.armour_id
    INNER JOIN
        Classes AS c ON c.class_id = a.class_id
    `

    pool.query(SQLSTATEMENT, callback)
}




//////////////////////////////////////////////////////
// GET ALL OF A USER'S INVENTORY
//////////////////////////////////////////////////////

module.exports.selectUserInventory = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        'Weapon' AS item_type,
        inventory_id,
        weapon_name AS item_name,
        rarity AS item_rarity,
        damage AS item_stat,
        is_equipped AS item_is_equipped,
        class_name
    FROM 
        WeaponInventory AS weapon
    INNER JOIN 
        Weapons AS w ON weapon.weapon_id = w.weapon_id
    INNER JOIN
        Classes AS c ON c.class_id = w.class_id
    WHERE 
        user_id = ?

    UNION ALL

    SELECT 
        'Spell' AS item_type,
        inventory_id,
        spell_name AS item_name,
        rarity AS item_rarity,
        power AS item_stat,
        is_equipped AS item_is_equipped,
        class_name
    FROM 
        SpellInventory AS spell
    INNER JOIN 
        Spells AS s ON spell.spell_id = s.spell_id
    INNER JOIN
        Classes AS c ON c.class_id = s.class_id
    WHERE 
        user_id = ?

    UNION ALL

    SELECT 
        'Armour' AS item_type,
        inventory_id,
        armour_name AS item_name,
        rarity AS item_rarity,
        defense AS item_stat,
        is_equipped AS item_is_equipped,
        class_name
    FROM 
        ArmourInventory AS ai
    INNER JOIN 
        Armour AS a ON ai.armour_id = a.armour_id
    INNER JOIN
        Classes AS c ON c.class_id = a.class_id
    WHERE 
        user_id = ?
    `

    const VALUES = [data.user_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}




////////////////////////////////////////////////////////////////////////
// PUT /users/equip
////////////////////////////////////////////////////////////////////////


module.exports.selectInventoryById = (data, callback) => {
    let SQLSTATEMENT;

    if (data.item_type === 'weapon' || data.item_type === 'Weapon') {
        SQLSTATEMENT = `
            SELECT 1 FROM WeaponInventory
            WHERE inventory_id = ?;
        `
    } else if (data.item_type === 'spell' || data.item_type === 'Spell') {
        SQLSTATEMENT = `
            SELECT 1 FROM SpellInventory
            WHERE inventory_id = ?;
        `
    } else if (data.item_type === 'armour' || data.item_type === 'Armour') {
        SQLSTATEMENT = `
            SELECT 1 FROM ArmourInventory
            WHERE inventory_id = ?;
        `
    } else {
        callback(new Error('item_type'))
        return 
    }

    const VALUES = [data.inventory_id]


    pool.query(SQLSTATEMENT, VALUES, callback)
}


// module.exports.selectInventoryOwner = (data, callback) => {
//     let SQLSTATEMENT;

//     if (data.item_type === 'weapon' || data.item_type === 'Weapon') {
//         SQLSTATEMENT = `
//             SELECT 1 FROM WeaponInventory
//             WHERE inventory_id = ? AND user_id = ?;
//         `
//     } else if (data.item_type === 'spell' || data.item_type === 'Spell') {
//         SQLSTATEMENT = `
//             SELECT 1 FROM SpellInventory
//             WHERE inventory_id = ? AND user_id = ?;
//         `
//     } else if (data.item_type === 'armour' || data.item_type === 'Armour') {
//         SQLSTATEMENT = `
//             SELECT 1 FROM ArmourInventory
//             WHERE inventory_id = ? AND user_id = ?;
//         `
//     } else {
//         return callback(new Error('Please check the request body. Only weapon, spell or armour allowed.'))
//     }

//     const VALUES = [data.inventory_id, data.user_id]

//     pool.query(SQLSTATEMENT, VALUES, callback)
// }


module.exports.getUserAndItemClass = (data, callback) => {
    let SQLSTATEMENT = `
        SELECT u.class_id, class_name AS user_class
        FROM User AS u
        INNER JOIN Classes AS c ON u.class_id = c.class_id
        WHERE user_id = ?;
    `

    if (data.item_type === 'weapon' || data.item_type === 'Weapon') {
        SQLSTATEMENT += `
            SELECT w.class_id, c.class_name AS equipment_class, w.weapon_name AS name
            FROM WeaponInventory AS wi
            INNER JOIN Weapons AS w ON wi.weapon_id = w.weapon_id
            INNER JOIN Classes AS c ON w.class_id = c.class_id
            WHERE wi.inventory_id = ?;
        `
    } else if (data.item_type === 'spell' || data.item_type === 'Spell') {
        SQLSTATEMENT += `
            SELECT s.class_id, c.class_name AS equipment_class, s.spell_name AS name
            FROM SpellInventory AS si
            INNER JOIN Spells AS s ON si.spell_id = s.spell_id
            INNER JOIN Classes AS c ON c.class_id = s.class_id
            WHERE si.inventory_id = ?;
        `
    } else if (data.item_type === 'armour' || data.item_type === 'Armour') {
        SQLSTATEMENT += `
            SELECT a.class_id, c.class_name AS equipment_class, a.armour_name AS name
            FROM ArmourInventory AS ai
            INNER JOIN Armour AS a ON ai.armour_id = a.armour_id
            INNER JOIN Classes AS c ON c.class_id = a.class_id
            WHERE ai.inventory_id = ?;
        `
    } else {
        return callback(new Error('Please check the url. Only weapon, spell or armour allowed.'))
    }

    const VALUES = [data.user_id, data.inventory_id]


    pool.query(SQLSTATEMENT, VALUES, callback)
}



module.exports.equipItem = (data, callback) => {
    let SQLSTATEMENT;
    if (data.item_type === 'weapon' || data.item_type === 'Weapon') {
        SQLSTATEMENT = `
        UPDATE WeaponInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;

        UPDATE WeaponInventory 
        SET is_equipped = TRUE
        WHERE user_id = ? AND inventory_id = ?;
        `
    } else if (data.item_type === 'spell' || data.item_type === 'Spell') {
        SQLSTATEMENT = `

        UPDATE SpellInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;

        UPDATE SpellInventory 
        SET is_equipped = TRUE
        WHERE user_id = ? AND inventory_id = ?;
        `
    } else if (data.item_type === 'armour' || data.item_type === 'Armour') {
        SQLSTATEMENT = `
        UPDATE ArmourInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;

        UPDATE ArmourInventory 
        SET is_equipped = TRUE
        WHERE user_id = ? AND inventory_id = ?;
        `
    } else {
        return callback(new Error('Please check the url. Only weapon, spell or armour allowed.'));
    }

    const VALUES = [data.user_id, data.user_id, data.inventory_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

////////////////////////////////////////////////////////////////////////
// PUT /users/unequip
////////////////////////////////////////////////////////////////////////


module.exports.unequipItem = (data, callback) => {
    let SQLSTATEMENT;
    if (data.item_type === 'weapon' || data.item_type === 'Weapon') {
        SQLSTATEMENT = `
        UPDATE WeaponInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;
        `
    } else if (data.item_type === 'spell' || data.item_type === 'Spell') {
        SQLSTATEMENT = `

        UPDATE SpellInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;
        `
    } else if (data.item_type === 'armour' || data.item_type === 'Armour') {
        SQLSTATEMENT = `
        UPDATE ArmourInventory
        SET is_equipped = FALSE
        WHERE user_id = ?;
        `
    } else {
        return callback(new Error('Please check the url. Only weapon, spell or armour allowed.'));
    }

    const VALUES = [data.user_id, data.user_id, data.inventory_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}



////////////////////////////////////////////////////////////////////////
// PUT /users/unequip
////////////////////////////////////////////////////////////////////////


module.exports.updateAccept = (data, callback) => {
    
    const SQLSTATEMENT = `
    UPDATE User 
    SET accepted = TRUE 
    WHERE user_id = ?;
    `

    const VALUES = [data.user_id];
    
    pool.query(SQLSTATEMENT, VALUES, callback);
}

