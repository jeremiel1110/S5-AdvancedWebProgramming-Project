-- Migration script:
-- 1. Replace 'Staff' role with specific hotel roles (Receptionist, Housekeeping, Restaurant, Maintenance)
-- 2. Assign To-Do lists and Presets to 0..N roles (to_do_role, preset_role)
-- 3. Keep user_to_do to track which members have joined a To-Do list

USE hotel_todo_db;

SET SQL_SAFE_UPDATES = 0;

-- 1. Create the To-Do <-> Role association table (0..N roles per To-Do)
CREATE TABLE IF NOT EXISTS to_do_role (
    to_do_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (to_do_id, role),
    CONSTRAINT fk_tdr_todo
        FOREIGN KEY (to_do_id) REFERENCES to_do(to_do_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Create the Preset <-> Role association table (0..N roles per Preset)
CREATE TABLE IF NOT EXISTS preset_role (
    preset_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (preset_id, role),
    CONSTRAINT fk_pr_preset
        FOREIGN KEY (preset_id) REFERENCES preset(preset_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Ensure the User <-> To-Do table exists (tracks members who joined a To-Do list)
CREATE TABLE IF NOT EXISTS user_to_do (
    user_id INT NOT NULL,
    to_do_id INT NOT NULL,
    PRIMARY KEY (user_id, to_do_id),
    CONSTRAINT fk_utd_user
        FOREIGN KEY (user_id) REFERENCES user_(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_utd_todo
        FOREIGN KEY (to_do_id) REFERENCES to_do(to_do_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Update existing users from 'Staff' to the new roles (using PK user_id > 0 for Safe Update Mode compatibility)
UPDATE user_ SET role = 'Housekeeping' WHERE email = 'alice@hotel.com' AND user_id > 0;
UPDATE user_ SET role = 'Receptionist' WHERE email = 'lucas.bernard@hotel.com' AND user_id > 0;
UPDATE user_ SET role = 'Housekeeping' WHERE email = 'sophie.laurent@hotel.com' AND user_id > 0;
UPDATE user_ SET role = 'Maintenance'  WHERE email = 'marc.petit@hotel.com' AND user_id > 0;
UPDATE user_ SET role = 'Restaurant'   WHERE email = 'emma.rousseau@hotel.com' AND user_id > 0;
UPDATE user_ SET role = 'Housekeeping' WHERE role = 'Staff' AND user_id > 0;

-- 5. Copy any existing user_to_do roles into to_do_role so custom To-Do lists keep their role visibility
INSERT IGNORE INTO to_do_role (to_do_id, role)
SELECT DISTINCT utd.to_do_id, u.role
FROM user_to_do utd
JOIN user_ u ON u.user_id = utd.user_id
WHERE u.role <> 'Manager';

-- 6. Ensure demo To-Do lists have their appropriate role assignments
INSERT IGNORE INTO to_do_role (to_do_id, role)
SELECT to_do_id, 'Housekeeping' FROM to_do WHERE to_do_title IN (
    'Clean UP Room 1228',
    'Check-out cleaning - Room 204',
    'Stay-over cleaning - Room 310',
    'Pre-arrival inspection - Room 512',
    'Deep cleaning - Room 407'
);

INSERT IGNORE INTO to_do_role (to_do_id, role)
SELECT to_do_id, 'Receptionist' FROM to_do WHERE to_do_title IN (
    'Pre-arrival inspection - Room 512'
);

INSERT IGNORE INTO to_do_role (to_do_id, role)
SELECT to_do_id, 'Maintenance' FROM to_do WHERE to_do_title IN (
    'Fix leaking tap - Room 118',
    'Maintenance check - Room 221'
);

INSERT IGNORE INTO to_do_role (to_do_id, role)
SELECT to_do_id, 'Restaurant' FROM to_do WHERE to_do_title IN (
    'Breakfast setup - Dining Room'
);

-- 7. Ensure demo Presets have their appropriate role assignments
INSERT IGNORE INTO preset_role (preset_id, role)
SELECT preset_id, 'Housekeeping' FROM preset WHERE preset_title IN (
    'Check-out room cleaning',
    'Stay-over cleaning',
    'Pre-arrival inspection',
    'Deep cleaning'
);

INSERT IGNORE INTO preset_role (preset_id, role)
SELECT preset_id, 'Receptionist' FROM preset WHERE preset_title IN (
    'Pre-arrival inspection'
);

INSERT IGNORE INTO preset_role (preset_id, role)
SELECT preset_id, 'Maintenance' FROM preset WHERE preset_title IN (
    'Maintenance check'
);

INSERT IGNORE INTO preset_role (preset_id, role)
SELECT preset_id, 'Restaurant' FROM preset WHERE preset_title IN (
    'Breakfast setup'
);

SET SQL_SAFE_UPDATES = 1;
