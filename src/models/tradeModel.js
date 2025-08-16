const pool = require('../services/db')

////////////////////////////////////////////////////////////////////////
// GET /trades
////////////////////////////////////////////////////////////////////////

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Trade;
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// GET /trades/:trade_id
////////////////////////////////////////////////////////////////////////

module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT trade_id, trade_status
    FROM Trade
    WHERE trade_id = ?;
    `

    const VALUES = [data.trade_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.selectItemsByTrade = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT 
        ti.trade_item_id,
        ti.user_id,
        ti.inventory_id,
        ti.item_type,
        CASE 
            WHEN ti.item_type = 'Weapon' THEN w.weapon_name
            WHEN ti.item_type = 'Spell' THEN s.spell_name
            WHEN ti.item_type = 'Armour' THEN a.armour_name
        END AS item_name,
        CASE 
            WHEN ti.item_type = 'Weapon' THEN w.damage
            WHEN ti.item_type = 'Spell' THEN s.power
            WHEN ti.item_type = 'Armour' THEN a.defense
        END AS item_stat,
        CASE 
            WHEN ti.item_type = 'Weapon' THEN w.rarity
            WHEN ti.item_type = 'Spell' THEN s.rarity
            WHEN ti.item_type = 'Armour' THEN a.rarity
        END AS item_rarity,
        class_name
    FROM 
        TradeItems ti
    LEFT JOIN WeaponInventory wi ON ti.item_type = 'Weapon' AND ti.inventory_id = wi.inventory_id
    LEFT JOIN Weapons w ON wi.weapon_id = w.weapon_id
    LEFT JOIN SpellInventory si ON ti.item_type = 'Spell' AND ti.inventory_id = si.inventory_id
    LEFT JOIN Spells s ON si.spell_id = s.spell_id
    LEFT JOIN ArmourInventory ai ON ti.item_type = 'Armour' AND ti.inventory_id = ai.inventory_id
    LEFT JOIN Armour a ON ai.armour_id = a.armour_id
    INNER JOIN Classes c ON c.class_id IN (a.class_id, s.class_id, w.class_id)
    WHERE 
        ti.trade_id = ?;  -- Replace with the specific trade_id you want to query
    `

    const VALUES = [data.trade_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



////////////////////////////////////////////////////////////////////////
// POST /trades
////////////////////////////////////////////////////////////////////////

module.exports.selectPlayerForTrading = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT EXISTS(SELECT 1 FROM Player WHERE player_id = ?) AS player1;

    SELECT EXISTS(SELECT 1 FROM Player WHERE player_id = ?) AS player2;
    `

    const VALUES = [data.player1_id, data.player2_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.selectUserAlreadyTrading = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Trade
    WHERE (user1_id = ? OR user2_id = ? OR user1_id = ? OR user2_id = ?) AND trade_status = 'Pending';
    `

    const VALUES = [data.user1_id, data.user1_id, data.user2_id, data.user2_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.selectRegionOfUsers = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT region 
    FROM User
    WHERE user_id = ?;
    `

    const VALUES = [data.user2_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.insertSingleTrade = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Trade (user1_id, user2_id) 
    VALUES (?, ?);
    `

    const VALUES = [data.user1_id, data.user2_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



////////////////////////////////////////////////////////////////////////
// POST /trades/:trade_id/add
////////////////////////////////////////////////////////////////////////

module.exports.selectTradeAndPlayerById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM Player
    WHERE player_id = ?;

    SELECT trade_id, trade_status
    FROM Trade
    WHERE trade_id = ?;
    `

    const VALUES = [data.player_id, data.trade_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.selectInventoryOwner = (data, callback) => {
    let SQLSTATEMENT;

    if (data.item_type.toLowerCase() === 'weapon') {
        SQLSTATEMENT = `
            SELECT 1 FROM WeaponInventory
            WHERE inventory_id = ?;

            SELECT 1 FROM WeaponInventory
            WHERE inventory_id = ? AND player_id = ?;
        `
    } else if (data.item_type.toLowerCase() === 'spell') {
        SQLSTATEMENT = `
            SELECT 1 FROM SpellInventory
            WHERE inventory_id = ?;

            SELECT 1 FROM SpellInventory
            WHERE inventory_id = ? AND player_id = ?;
        `
    } else if (data.item_type.toLowerCase() === 'armour') {
        SQLSTATEMENT = `
            SELECT 1 FROM ArmourInventory
            WHERE inventory_id = ?;

            SELECT 1 FROM ArmourInventory
            WHERE inventory_id = ? AND player_id = ?;
        `
    } else {
        return callback(new Error('Please check the request body. Only weapon, spell or armour allowed.'))
    }

    const VALUES = [data.inventory_id, data.inventory_id, data.player_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.selectPlayerByTrade = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT player1_id, player2_id
    FROM Trade 
    WHERE trade_id = ?;
    `

    const VALUES = [data.trade_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



module.exports.selectTradeItemById = (data, callback) => {
    let SQLSTATEMENT = `
    SELECT trade_item_id 
    FROM TradeItems 
    WHERE trade_id = ? 
    AND user_id = ? 
    AND item_type = ? 
    AND inventory_id = ?;
    `

    const VALUES = [data.trade_id, data.user_id, data.item_type, data.inventory_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.insertTradeItem = (data, callback) => {

    let SQLSTATEMENT = `
    INSERT INTO TradeItems (trade_id, user_id, item_type, inventory_id)
    VALUES (?, ?, ?, ?);
    `

    if (data.item_type.toLowerCase() === 'weapon') {
        SQLSTATEMENT += `
        SELECT 
            u.user_id,
            c.class_name, 
            w.weapon_name AS name, 
            w.damage AS power_or_defense,
            u.username  -- This is the username of the player who added the item
        FROM WeaponInventory AS wi
        INNER JOIN Weapons AS w ON wi.weapon_id = w.weapon_id
        INNER JOIN Classes AS c ON w.class_id = c.class_id
        INNER JOIN User AS u ON wi.user_id = u.user_id 
        WHERE wi.inventory_id = ?;
        `
    } else if (data.item_type.toLowerCase() === 'spell') {
        SQLSTATEMENT += `
        SELECT 
            u.user_id,
            c.class_name, 
            s.spell_name AS name, 
            s.power AS power_or_defense,
            u.username  -- This is the username of the user who added the item
        FROM SpellInventory AS si
        INNER JOIN Spells AS s ON si.spell_id = s.spell_id
        INNER JOIN Classes AS c ON s.class_id = c.class_id
        INNER JOIN User AS u ON si.user_id = u.user_id 
        WHERE si.inventory_id = ?;
        `
    } else if (data.item_type.toLowerCase() === 'armour') {
        SQLSTATEMENT += `
        SELECT 
            u.user_id,
            c.class_name, 
            a.armour_name AS name, 
            a.defense AS power_or_defense,
            u.username  -- This is the username of the player who added the item
        FROM ArmourInventory AS ai
        INNER JOIN Armour AS a ON ai.armour_id = a.armour_id
        INNER JOIN Classes AS c ON a.class_id = c.class_id
        INNER JOIN User AS u ON ai.user_id = u.user_id 
        WHERE ai.inventory_id = ?;
        `
    } else {
        return callback(new Error('Please check the request body. Only item type of weapon, spell or armour allowed.'))
    }

    SQLSTATEMENT += `
    UPDATE User
    SET accepted = FALSE
    WHERE user_id IN (
        SELECT user1_id
        FROM Trade
        WHERE (user1_id = ? OR user2_id = ?) AND trade_status = 'Pending'
        UNION
        SELECT user2_id
        FROM Trade
        WHERE (user1_id = ? OR user2_id = ?) AND trade_status = 'Pending'
    );
    `


    const VALUES = [data.trade_id, data.user_id, data.item_type, data.inventory_id, data.inventory_id, data.user_id, data.user_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



////////////////////////////////////////////////////////////////////////
// DELETE /trades/:trade_id/remove
////////////////////////////////////////////////////////////////////////

// Reuses the same middleware as adding items into the trade.

module.exports.removeItemFromTrade = (data, callback) => {

    const SQLSTATEMENT = `
    DELETE FROM TradeItems
    WHERE trade_id = ?  
        AND user_id = ?  
        AND inventory_id = ?
        AND item_type = ?; 

    UPDATE User
    SET accepted = FALSE
    WHERE user_id IN (
        SELECT user1_id
        FROM Trade
        WHERE (user1_id = ? OR user2_id = ?) AND trade_status = 'Pending'
        UNION
        SELECT user2_id
        FROM Trade
        WHERE (user1_id = ? OR user2_id = ?) AND trade_status = 'Pending'
    );
    `

    const VALUES = [data.trade_id, data.user_id, data.inventory_id, data.item_type, data.user_id, data.user_id, data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// PUT /trades/:trade_id
////////////////////////////////////////////////////////////////////////

// module.exports.selectPlayer1Player2 = (data, callback) => {

//     const SQLSTATEMENT = `
//     SELECT trade_id 
//     FROM Trade 
//     WHERE player1_id = ? AND player2_id = ? AND trade_status = 'Pending';
//     `

//     const VALUES = [data.player1_id, data.player2_id]

//     pool.query(SQLSTATEMENT, VALUES, callback)
// }

module.exports.updateTradeById = (data, callback) => {

    let SQLSTATEMENT = `
    UPDATE User
    SET accepted = FALSE
    WHERE user_id IN (?, ?);
    `;

    if (data.status == true) {
        SQLSTATEMENT += `
        UPDATE Trade
        SET trade_status = 'Accepted'
        WHERE trade_id = ?;
        `
    } else {
        SQLSTATEMENT += `
        UPDATE Trade
        SET trade_status = 'Cancelled'
        WHERE trade_id = ?;

        DELETE FROM TradeItems
        WHERE trade_id = ?;
        `
    }


    const VALUES = [data.user1_id, data.user2_id, data.trade_id]

    if (!data.status) {
        VALUES.push(data.trade_id)
    }

    pool.query(SQLSTATEMENT, VALUES, callback)
}

// Move the respective items into each player's inventory.

module.exports.insertTradeItemIntoUserInventory = (data, callback) => {
    
    const SQLSTATEMENT = `
    -- Update Weapons from User 1 to User 2
    UPDATE WeaponInventory AS wi
    SET wi.user_id = ?, wi.is_equipped = FALSE
    WHERE wi.user_id = ? AND wi.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Weapon'
    );

    -- Update Armour from User 1 to User 2
    UPDATE ArmourInventory AS ai
    SET ai.user_id = ?, ai.is_equipped = FALSE
    WHERE ai.user_id = ? AND ai.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Armour'
    );

    -- Update Spells from User 1 to User 2
    UPDATE SpellInventory AS si
    SET si.user_id = ?, si.is_equipped = FALSE
    WHERE si.user_id = ? AND si.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Spell'
    );

    -- Update Weapons from User 2 to User 1
    UPDATE WeaponInventory AS wi
    SET wi.user_id = ?, wi.is_equipped = FALSE
    WHERE wi.user_id = ? AND wi.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Weapon'
    );

    -- Update Armour from User 2 to User 1
    UPDATE ArmourInventory AS ai
    SET ai.user_id = ?, ai.is_equipped = FALSE
    WHERE ai.user_id = ? AND ai.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Armour'
    );

    -- Update Spells from User 2 to User 1
    UPDATE SpellInventory AS si
    SET si.user_id = ?, si.is_equipped = FALSE
    WHERE si.user_id = ? AND si.inventory_id IN (
        SELECT ti.inventory_id
        FROM TradeItems AS ti
        WHERE ti.trade_id = ? AND ti.user_id = ?
        AND ti.item_type = 'Spell'
    );
    `


    const VALUES = [
        // Update Weapons from Player 1 to Player 2
        data.user2_id, data.user1_id, data.trade_id, data.user1_id,
    
        // Update Armour from Player 1 to Player 2
        data.user2_id, data.user1_id, data.trade_id, data.user1_id,
    
        // Update Spells from Player 1 to Player 2
        data.user2_id, data.user1_id, data.trade_id, data.user1_id,
    
        // Update Weapons from Player 2 to Player 1
        data.user1_id, data.user2_id, data.trade_id, data.user2_id,
    
        // Update Armour from Player 2 to Player 1
        data.user1_id, data.user2_id, data.trade_id, data.user2_id,
    
        // Update Spells from Player 2 to Player 1
        data.user1_id, data.user2_id, data.trade_id, data.user2_id
    ]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.deleteTradeById = (data, callback) => {

    const SQLSTATEMENT = `
    DELETE FROM TradeItems 
    WHERE trade_id = ?;
    `

    const VALUES = [data.trade_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



