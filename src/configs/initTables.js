const pool = require("../services/db");

const SQLSTATEMENT = `

-- We drop these first to handle all the foreign key constraints
DROP TABLE IF EXISTS TradeItems;
DROP TABLE IF EXISTS Trade;
DROP TABLE IF EXISTS WeaponInventory;
DROP TABLE IF EXISTS SpellInventory;
DROP TABLE IF EXISTS ArmourInventory;

-- Section A Tables
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS FitnessChallenge;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS PartyHistory;
DROP TABLE IF EXISTS PartyRequests;
DROP TABLE IF EXISTS PartyMembers;
DROP TABLE IF EXISTS Party;
DROP TABLE IF EXISTS DungeonAttempts;
DROP TABLE IF EXISTS Dungeons;
DROP TABLE IF EXISTS Weapons;
DROP TABLE IF EXISTS Armour;
DROP TABLE IF EXISTS Spells;
DROP TABLE IF EXISTS Region;
DROP TABLE IF EXISTS Classes;

CREATE TABLE Classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(20) NOT NULL,
    base_health INT NOT NULL,
    base_defense INT NOT NULL,
    base_attack INT NOT NULL,
    base_mana INT NOT NULL
);

INSERT INTO Classes (class_name, base_health, base_attack, base_defense, base_mana) VALUES
('Warrior', 150, 10, 10, 100),
('Archer', 100, 20, 0, 100),
('Mage', 100, 5, 0, 200),
('Assassin', 75, 30, 0, 50),
('Rookie', 0, 0, 0, 0);

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    skillpoints INT DEFAULT 0,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    profile VARCHAR(100) DEFAULT '/pictures/defaultProfile.jpg',
    level INT DEFAULT 1,
    class_id INT DEFAULT 5,
    region VARCHAR(100) DEFAULT 'City Center',
    accepted BOOL NOT NULL DEFAULT FALSE,
    daily BOOL NOT NULL DEFAULT FALSE
);

INSERT INTO User (username, skillpoints, email, password) VALUES 
("admin", 998, "admin@admin.gmail.com", "youarenotallowedhere");

CREATE TABLE FitnessChallenge (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    challenge TEXT NOT NULL,
    skillpoints INT NOT NULL
);

INSERT INTO FitnessChallenge (creator_id, challenge, skillpoints) VALUES
(1, 'Complete 2.4km within 15 minutes', 50),
(1, 'Cycle around the island for at least 50km', 100),
(1, 'Complete a full marathon (42.2km)', 200),
(1, 'Hold a plank for 5 minutes', 50),
(1, 'Perform 100 push-ups in one session', 75);

CREATE TABLE UserCompletion (
    complete_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    completed BOOL NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);


CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    message VARCHAR(200) NOT NULL
);




CREATE TABLE Region (
    region_id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    level_requirement INT NOT NULL
);

INSERT INTO Region (region_name, description, level_requirement) VALUES
('City Center', 'A place where users spawn. Lots of markets to buy, sell or trade equipment and spells.', 0),
('Whispering Meadows', 'A serene plain filled with greenery. Perfect for beginners to train their skills.', 0),
('Frozen Wastes', 'A icy tundra where winds chill even the strongest.', 10),
('The Abyss', 'A dark, bottomless chasm filled with eerie sounds and horrors.', 20);

CREATE TABLE Dungeons (
    dungeon_id INT AUTO_INCREMENT PRIMARY KEY,
    dungeon_name VARCHAR(100) NOT NULL,
    region_id INT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    dungeon_strength INT NOT NULL,
    dungeon_image VARCHAR(100) NOT NULL
);

INSERT INTO Dungeons (dungeon_name, region_id, difficulty, dungeon_strength, dungeon_image) VALUES
('Blooming Centaur', 2, 'Easy', 1000, '/pictures/dungeon1.jpg'),
('Crystal Dragon', 3, 'Medium', 2400, '/pictures/dungeon2.jpg'),
('Leviathan', 4, 'Hard', 4000, '/pictures/dungeon3.jpg');

CREATE TABLE DungeonAttempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    dungeon_id INT NOT NULL,
    party_id INT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);

CREATE TABLE Weapons (
    weapon_id INT AUTO_INCREMENT PRIMARY KEY,
    weapon_name VARCHAR(100) NOT NULL,
    rarity ENUM('Common', 'Rare', 'Legendary') NOT NULL,
    damage INT NOT NULL,
    class_id INT NOT NULL
);

INSERT INTO Weapons (weapon_name, rarity, damage, class_id) VALUES
('Sword', 'Common', 20, 1),
('Bow', 'Common', 10, 2),
('Staff', 'Common', 10, 3),
('Dagger', 'Common', 30, 4),
('Frostbite Blade', 'Rare', 100, 1),
('Ice Bow', 'Rare', 50, 2),
('Iceheart Staff', 'Rare', 50, 3),
('Icicle', 'Rare', 125, 4),
('Whispering Blade', 'Legendary', 150, 1),
('Thunderbolt', 'Legendary', 100, 2),
('Soul Staff', 'Legendary', 100, 3),
('Cloud piercer', 'Legendary', 200, 4);

CREATE TABLE Armour (
    armour_id INT AUTO_INCREMENT PRIMARY KEY,
    armour_name VARCHAR(100) NOT NULL,
    rarity ENUM('Common', 'Rare', 'Legendary') NOT NULL,
    defense INT NOT NULL,
    class_id INT NOT NULL
);

INSERT INTO Armour (armour_name, rarity, defense, class_id) VALUES
('Leather Vest', 'Common', 20, 1),
('Rusty Chainmail', 'Common', 10, 2),
('Dusty Robe', 'Common', 10, 3),
('Shadow Cloak', 'Common', 20, 4),
('Iron Plate', 'Rare', 50, 1),
('Hunter Gear', 'Rare', 30, 2),
('Enchanted Robe', 'Rare', 30, 3),
('Assassin Shroud', 'Rare', 45, 4),
('Dragonscale Armour', 'Legendary', 125, 1),
('Eagle Feathered Wings', 'Legendary', 100, 2),
('Archmage Mantle', 'Legendary', 100, 3),
('Phantom Cloak', 'Legendary', 125, 4);

CREATE TABLE Spells (
    spell_id INT AUTO_INCREMENT PRIMARY KEY,
    spell_name VARCHAR(100) NOT NULL,
    rarity ENUM('Common', 'Rare', 'Legendary') NOT NULL,
    power INT NOT NULL,
    mana_cost INT NOT NULL, 
    class_id INT NOT NULL
);

INSERT INTO Spells (spell_name, rarity, power, mana_cost, class_id) VALUES
('Aegis', 'Common', 10, 50, 1),
('Dodge', 'Common', 10, 50, 2),
('Fireball', 'Common', 50, 50, 3),
('Speed Boost', 'Common', 10, 25, 4),
('Counter', 'Rare', 50, 75, 1),
('Explosive shots', 'Rare', 75, 75, 2),
('Ice beam', 'Rare', 125, 50, 3),
('Invisibility', 'Rare', 30, 25, 4),
('Lifesteal', 'Legendary', 50, 50, 1),
('Homing arrow', 'Legendary', 150, 100, 2),
('Lighting Strike', 'Legendary', 250, 100, 3),
('Assassinate', 'Legendary', 150, 100, 4);

CREATE TABLE WeaponInventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weapon_id INT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (weapon_id) REFERENCES Weapons(weapon_id) ON DELETE CASCADE
);

CREATE TABLE SpellInventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    spell_id INT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (spell_id) REFERENCES Spells(spell_id) ON DELETE CASCADE
);

CREATE TABLE ArmourInventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    armour_id INT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (armour_id) REFERENCES Armour(armour_id) ON DELETE CASCADE
);

CREATE TABLE Party (
    party_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for each party
    party_name VARCHAR(100) NOT NULL, -- Optional name for the party
    leader_id INT NOT NULL, -- The user who created the party
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When the party was created
);

CREATE TABLE PartyMembers (
    party_member_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for each party member
    party_id INT NOT NULL, -- Reference to the Party table
    user_id INT NOT NULL, -- Reference to the User table
    role ENUM('Leader', 'Member') DEFAULT 'Member'
);

CREATE TABLE PartyRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    party_id INT, 
    user_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PartyHistory (
    user_id INT NOT NULL,
    party_id INT NOT NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leave_date TIMESTAMP,
    status ENUM('Active', 'Left', 'Inactive') DEFAULT 'Active',  -- 'Active' if still in party, 'Left' if they left, 'Inactive' if party is deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Trade (
    trade_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL, -- User 1 (initiator)
    user2_id INT NOT NULL, -- User 2 (receiver)
    trade_status ENUM('Pending', 'Accepted', 'Cancelled') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TradeItems (
    trade_item_id INT AUTO_INCREMENT PRIMARY KEY,
    trade_id INT NOT NULL,
    user_id INT NOT NULL, -- The player offering the item
    item_type ENUM('Weapon', 'Armour', 'Spell') NOT NULL, -- Type of item (weapon, armor, spell)
    inventory_id INT NOT NULL, -- Item's ID,
    FOREIGN KEY (trade_id) REFERENCES Trade(trade_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);



-- Triggers to automatically execute after a certain action

CREATE TRIGGER update_player_level
BEFORE UPDATE ON User
FOR EACH ROW
BEGIN
    -- Set growth factor to control the exponential difficulty increase
    DECLARE growth_factor FLOAT DEFAULT 1.5;
    DECLARE required_skillpoints INT;
    
    SET required_skillpoints = 100;
    
    -- Loop through to find the level based on exponential skillpoints
    SET NEW.level = 0;
    WHILE NEW.skillpoints >= required_skillpoints DO
        SET NEW.level = NEW.level + 1;
        SET required_skillpoints = required_skillpoints * growth_factor;
    END WHILE;
END;

CREATE TRIGGER check_party_size
BEFORE INSERT ON PartyMembers
FOR EACH ROW
BEGIN
    DECLARE member_count INT;

    -- Count the current number of members in the party
    SELECT COUNT(*) INTO member_count
    FROM PartyMembers
    WHERE party_id = NEW.party_id;

    -- Prevent insertion if the party is full
    IF member_count >= 4 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Full';
    END IF;
END;

UPDATE User 
SET skillpoints = skillpoints + 1
WHERE user_id = 1;

`;

pool.query(SQLSTATEMENT, (error, results, fields) => {
    if (error) {
        console.error("Error creating tables:", error);
    } else {
        console.log("Tables created successfully!");
    }
    process.exit();
});