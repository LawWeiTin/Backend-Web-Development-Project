const pool = require('../services/db');

////////////////////////////////////////////////////////////////////////
// QUESTION 4 (POST /users)
////////////////////////////////////////////////////////////////////////

module.exports.selectChallengeName = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM FitnessChallenge
    WHERE challenge = ?;
    `

    const VALUES = [data.challenge]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO FitnessChallenge (challenge, creator_id, skillpoints)
    VALUES (?, ?, ?);
    `

    const VALUES = [data.challenge, data.user_id, data.skillpoints]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

module.exports.selectById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM FitnessChallenge
    WHERE challenge_id = ?;
    `

    const VALUES = [data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 5 (GET /users)
////////////////////////////////////////////////////////////////////////


module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM FitnessChallenge;
    `

    pool.query(SQLSTATEMENT, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 6 (PUT /challenges/{challenge_id})
////////////////////////////////////////////////////////////////////////

module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE FitnessChallenge
    SET challenge = ?, skillpoints = ?
    WHERE challenge_id = ?;
    `

    const VALUES = [data.challenge, data.skillpoints, data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 7 (DELETE /challenges/{challenge_id})
////////////////////////////////////////////////////////////////////////

module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
    DELETE FROM FitnessChallenge
    WHERE challenge_id = ?;
    `

    const VALUES = [data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

////////////////////////////////////////////////////////////////////////
// QUESTION 8 (POST /challenges/{challenge_id}/)
////////////////////////////////////////////////////////////////////////

module.exports.checkUserChallenge = (data, callback) => {

    // Check if exists in both tables. If only one table, return that table. If no table, return None. If both table, return Both.
    const SQLSTATEMENT = `
    SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM User WHERE user_id = ?) 
             AND EXISTS (SELECT 1 FROM FitnessChallenge WHERE challenge_id = ?) THEN 'Both'
        WHEN EXISTS (SELECT 1 FROM User WHERE user_id = ?) THEN 'User'
        WHEN EXISTS (SELECT 1 FROM FitnessChallenge WHERE challenge_id = ?) THEN 'FitnessChallenge'
        ELSE 'None'
    END AS existence_status;
    `

    const VALUES = [data.user_id, data.challenge_id, data.user_id, data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.markComplete = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User
    SET skillpoints = skillpoints + (
        CASE WHEN ? THEN
            (SELECT skillpoints FROM FitnessChallenge WHERE challenge_id = ?)
        ELSE 5
        END
    )
    WHERE user_id = ?;


    INSERT INTO 
    UserCompletion (user_id, challenge_id, completed, notes)
    VALUES (?, ?, ?, ?);
    `

    const VALUES = [
        // This is for update statement
        data.completed,
        data.challenge_id,
        data.user_id,
        // This is for insert statement
        data.user_id,
        data.challenge_id, 
        data.completed, 
        data.notes
    ]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


module.exports.selectCompleteById = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCompletion
    WHERE complete_id = ?;
    `

    const VALUES = [data.complete_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// QUESTION 9 (GET /challenges/{challenge_id}/)
////////////////////////////////////////////////////////////////////////


module.exports.selectParticipants = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, completed, creation_date, notes FROM UserCompletion
    WHERE challenge_id = ?;
    `

    const VALUES = [data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}




////////////////////////////////////////////////////////////////////////
// GET ALL FITNESS CHALLENGE COMPLETIONS TODAY
////////////////////////////////////////////////////////////////////////


module.exports.selectDailies = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT SUM(c.skillpoints) AS dailySkillpoints
    FROM UserCompletion uc
    INNER JOIN FitnessChallenge c ON uc.challenge_id = c.challenge_id
    WHERE uc.user_id = ?
    AND DATE(uc.creation_date) = CURDATE();

    SELECT u.user_id, pm.party_id, success
    FROM User u
    INNER JOIN PartyMembers pm
    ON pm.user_id = u.user_id
    INNER JOIN DungeonAttempts da
    ON da.party_id = pm.party_id
    WHERE u.user_id = ? AND DATE(da.attempt_time) = CURDATE();
    `

    const VALUES = [data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// CLAIM DAILIES
////////////////////////////////////////////////////////////////////////


module.exports.claimDailies = (data, callback) => {
    const SQLSTATEMENT = `
    -- Declare user_id as the specific user to insert the item into
    SET @user_id = ?;  -- Replace with the target user's user_id

    -- Randomly choose a legendary item (Weapon, Armour, or Spell)
    -- Randomly select a category (Weapon, Armour, or Spell)
    SET @item_type = (SELECT CASE
        WHEN RAND() < 0.33 THEN 'Weapon'
        WHEN RAND() < 0.66 THEN 'Armour'
        ELSE 'Spell'
    END);

    -- Randomly select a legendary item based on the selected category
    SET @item_id = (SELECT item_id
        FROM (
            SELECT weapon_id AS item_id, 'Weapon' AS item_type FROM Weapons WHERE rarity = 'Legendary' 
            UNION ALL
            SELECT armour_id AS item_id, 'Armour' AS item_type FROM Armour WHERE rarity = 'Legendary' 
            UNION ALL
            SELECT spell_id AS item_id, 'Spell' AS item_type FROM Spells WHERE rarity = 'Legendary'
        ) AS legendary_items
        ORDER BY RAND()
        LIMIT 1);

    DROP PROCEDURE IF EXISTS InsertLegendaryItem;

    CREATE PROCEDURE InsertLegendaryItem(IN p_user_id INT, IN p_item_id INT, IN p_item_type VARCHAR(20))
    BEGIN
        IF p_item_type = 'Weapon' THEN
            INSERT INTO WeaponInventory (user_id, weapon_id, is_equipped) 
            VALUES (p_user_id, p_item_id, FALSE);
        ELSEIF p_item_type = 'Armour' THEN
            INSERT INTO ArmourInventory (user_id, armour_id, is_equipped) 
            VALUES (p_user_id, p_item_id, FALSE);
        ELSEIF p_item_type = 'Spell' THEN
            INSERT INTO SpellInventory (user_id, spell_id, is_equipped) 
            VALUES (p_user_id, p_item_id, FALSE);
        END IF;
    END;

    CALL InsertLegendaryItem(@user_id, @item_id, @item_type);


    UPDATE User
    SET daily = TRUE
    WHERE user_id = ?;
    `

    const VALUES = [data.user_id, data.user_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



////////////////////////////////////////////////////////////////////////
// GET ALL CHALLENGE COMPLETIONS
////////////////////////////////////////////////////////////////////////


module.exports.selectAllUserCompletions = (callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM UserCompletion;
    `

    pool.query(SQLSTATEMENT, callback)
}


////////////////////////////////////////////////////////////////////////
// POST CHALLENGE REVIEW
////////////////////////////////////////////////////////////////////////


module.exports.insertReviewForChallenge = (data, callback) => {
    const SQLSTATEMENT = `
    INSERT INTO Review (user_id, challenge_id, rating, message) 
    VALUES (?, ?, ?, ?);
    `

    const VALUES = [data.user_id, data.challenge_id, data.rating, data.review]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// UPDATE CHALLENGE REVIEW
////////////////////////////////////////////////////////////////////////


module.exports.updateReview = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE Review
    SET rating = ?, message = ?
    WHERE user_id = ? AND challenge_id = ?;
    `

    const VALUES = [data.rating, data.review, data.user_id, data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// GET ALL REVIEWS FOR A SPECIFIC CHALLENGE
////////////////////////////////////////////////////////////////////////


module.exports.selectAllReviewsByChallengeId = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT r.review_id, r.challenge_id, r.rating, r.user_id, r.message, u.username, u.email
    FROM Review r
    INNER JOIN User u 
    ON u.user_id = r.user_id
    WHERE r.challenge_id = ?;
    `

    const VALUES = [data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}


////////////////////////////////////////////////////////////////////////
// GET BEST AND WORST REVIEWS FOR A SPECIFIC CHALLENGE
////////////////////////////////////////////////////////////////////////


module.exports.selectBestAndWorstReviews = (data, callback) => {
    const SQLSTATEMENT = `
    (SELECT r.*, u.username
    FROM Review r
    INNER JOIN User u ON r.user_id = u.user_id
    WHERE r.challenge_id = ?
    AND r.rating = (
            SELECT MIN(rating) 
            FROM Review 
            WHERE challenge_id = ? 
            AND rating < (SELECT MAX(rating) FROM Review WHERE challenge_id = ?)
        )
    ORDER BY RAND() 
    LIMIT 1)
    UNION ALL
    (SELECT r.*, u.username
    FROM Review r
    INNER JOIN User u ON r.user_id = u.user_id
    WHERE r.challenge_id = ?
    AND r.rating = (SELECT MAX(rating) FROM Review WHERE challenge_id = ?)
    ORDER BY RAND() 
    LIMIT 1);
    `

    const VALUES = [data.challenge_id, data.challenge_id, data.challenge_id, data.challenge_id, data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}



////////////////////////////////////////////////////////////////////////
// SELECT DISTINCT USER FROM REVIEW SO THAT THEY CANNOT REVIEW TWICE
////////////////////////////////////////////////////////////////////////


module.exports.selectAllUserFromReviews = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT user_id, rating, message
    FROM Review
    WHERE challenge_id = ?;
    `

    const VALUES = [data.challenge_id]

    pool.query(SQLSTATEMENT, VALUES, callback)
}

