-- Demo data: more users, To Do lists (with their tasks and assigned roles) and presets (with their tasks and assigned roles).
--
-- Run it after schema.sql (and seed.sql) in MySQL Workbench, with "Execute the whole script".
-- It can be run several times: a user, a To Do list or a preset that already exists is skipped,
-- and nothing already in the database is modified or duplicated.
-- The tasks and the assigned roles of a list (or of a preset) are only added when
-- the list (or the preset) is created by this script.
--
-- All the accounts created here use the password: password123

USE hotel_todo_db;

-- 1. Users (an email is only added if it does not exist yet)
INSERT INTO user_ (user_lastname, user_firstname, email, password_hash, role)
SELECT v.lastname, v.firstname, v.email, v.password_hash, v.role
FROM (
    SELECT 'Moreau' AS lastname, 'Claire' AS firstname, 'claire.moreau@hotel.com' AS email, '$2b$12$9qQY3rDtLcKwZqJVyIjQe.90kmEIWm80QyqmU0Ces2kE2W5SmSfju' AS password_hash, 'Manager' AS role
    UNION ALL SELECT 'Bernard', 'Lucas', 'lucas.bernard@hotel.com', '$2b$12$9qQY3rDtLcKwZqJVyIjQe.90kmEIWm80QyqmU0Ces2kE2W5SmSfju', 'Receptionist'
    UNION ALL SELECT 'Laurent', 'Sophie', 'sophie.laurent@hotel.com', '$2b$12$9qQY3rDtLcKwZqJVyIjQe.90kmEIWm80QyqmU0Ces2kE2W5SmSfju', 'Housekeeping'
    UNION ALL SELECT 'Petit', 'Marc', 'marc.petit@hotel.com', '$2b$12$9qQY3rDtLcKwZqJVyIjQe.90kmEIWm80QyqmU0Ces2kE2W5SmSfju', 'Maintenance'
    UNION ALL SELECT 'Rousseau', 'Emma', 'emma.rousseau@hotel.com', '$2b$12$9qQY3rDtLcKwZqJVyIjQe.90kmEIWm80QyqmU0Ces2kE2W5SmSfju', 'Restaurant'
) AS v
WHERE NOT EXISTS (SELECT 1 FROM user_ u WHERE u.email = v.email);


-- 2. To Do lists, with their tasks and the roles assigned to them

-- Check-out cleaning - Room 204 (3 tasks done out of 6)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '204', 'Check-out cleaning - Room 204', 'Full cleaning after the guest left', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Check-out cleaning - Room 204');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Strip the bed and change the sheets' AS title, 'King size sheets' AS description, 1 AS done
    UNION ALL SELECT 'Clean the bathroom', 'Shower, toilet, sink and mirror', 1
    UNION ALL SELECT 'Vacuum and mop the floor', '', 1
    UNION ALL SELECT 'Dust the furniture and clean the windows', '', 0
    UNION ALL SELECT 'Empty the bins', '', 0
    UNION ALL SELECT 'Restock towels and toiletries', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Check-out cleaning - Room 204'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Housekeeping'
FROM to_do t
WHERE t.to_do_title = 'Check-out cleaning - Room 204'
AND @created = 1;

-- Stay-over cleaning - Room 310 (all the tasks are done)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '310', 'Stay-over cleaning - Room 310', 'Daily cleaning for a guest who stays', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'manager@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Stay-over cleaning - Room 310');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Make the bed' AS title, '' AS description, 1 AS done
    UNION ALL SELECT 'Replace the used towels', '', 1
    UNION ALL SELECT 'Empty the bins', '', 1
    UNION ALL SELECT 'Restock the toiletries', '', 1
) AS v
JOIN to_do t ON t.to_do_title = 'Stay-over cleaning - Room 310'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Housekeeping'
FROM to_do t
WHERE t.to_do_title = 'Stay-over cleaning - Room 310'
AND @created = 1;

-- Pre-arrival inspection - Room 512 (1 task done out of 4)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '512', 'Pre-arrival inspection - Room 512', 'Last check before the guest arrives', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Pre-arrival inspection - Room 512');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Check the lights, the TV and the air conditioning' AS title, '' AS description, 0 AS done
    UNION ALL SELECT 'Test the safe', '', 0
    UNION ALL SELECT 'Check the water pressure and the hot water', '', 1
    UNION ALL SELECT 'Check the minibar and the welcome items', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Pre-arrival inspection - Room 512'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, v.role
FROM (
    SELECT 'Receptionist' AS role
    UNION ALL SELECT 'Housekeeping'
) AS v
JOIN to_do t ON t.to_do_title = 'Pre-arrival inspection - Room 512'
WHERE @created = 1;

-- Fix leaking tap - Room 118 (1 task done out of 3)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '118', 'Fix leaking tap - Room 118', 'The bathroom tap drips: repair it before the next guest', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'manager@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Fix leaking tap - Room 118');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Locate the leak' AS title, '' AS description, 1 AS done
    UNION ALL SELECT 'Replace the tap cartridge', 'Spare parts are in the maintenance room', 0
    UNION ALL SELECT 'Test the tap and clean up', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Fix leaking tap - Room 118'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Maintenance'
FROM to_do t
WHERE t.to_do_title = 'Fix leaking tap - Room 118'
AND @created = 1;

-- Deep cleaning - Room 407 (2 tasks done out of 5)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '407', 'Deep cleaning - Room 407', 'Periodic deep cleaning of the room', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Deep cleaning - Room 407');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Turn and clean the mattress' AS title, '' AS description, 1 AS done
    UNION ALL SELECT 'Wash the curtains', '', 1
    UNION ALL SELECT 'Clean behind and under the furniture', '', 0
    UNION ALL SELECT 'Descale the shower and the taps', '', 0
    UNION ALL SELECT 'Clean the air vents and the filters', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Deep cleaning - Room 407'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Housekeeping'
FROM to_do t
WHERE t.to_do_title = 'Deep cleaning - Room 407'
AND @created = 1;

-- Maintenance check - Room 221 (no task done yet)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT '221', 'Maintenance check - Room 221', 'Technical check of the room', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'manager@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Maintenance check - Room 221');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Check the plumbing for leaks' AS title, '' AS description, 0 AS done
    UNION ALL SELECT 'Check the electrical outlets and the lights', '', 0
    UNION ALL SELECT 'Check the door lock and the keycard reader', '', 0
    UNION ALL SELECT 'Check the smoke detector', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Maintenance check - Room 221'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Maintenance'
FROM to_do t
WHERE t.to_do_title = 'Maintenance check - Room 221'
AND @created = 1;

-- Breakfast setup - Dining Room (2 tasks done out of 4)
INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id, created_at)
SELECT 'Dining Room', 'Breakfast setup - Dining Room', 'Opening of the morning breakfast service', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM to_do WHERE to_do_title = 'Breakfast setup - Dining Room');
SET @created = ROW_COUNT();

INSERT INTO task (task_title, task_description, task_done, to_do_id)
SELECT v.title, v.description, v.done, t.to_do_id
FROM (
    SELECT 'Set the tables' AS title, '' AS description, 1 AS done
    UNION ALL SELECT 'Fill the coffee machines and the juice dispensers', '', 1
    UNION ALL SELECT 'Set out the buffet items', '', 0
    UNION ALL SELECT 'Check the allergen labels', '', 0
) AS v
JOIN to_do t ON t.to_do_title = 'Breakfast setup - Dining Room'
WHERE @created = 1;

INSERT INTO to_do_role (to_do_id, role)
SELECT t.to_do_id, 'Restaurant'
FROM to_do t
WHERE t.to_do_title = 'Breakfast setup - Dining Room'
AND @created = 1;


-- 3. Presets (reusable To Do lists), created by the manager Claire Moreau

-- Check-out room cleaning
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Check-out room cleaning', 'Standard cleaning after a guest checks out', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Check-out room cleaning');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Strip the bed and change the sheets' AS title, '' AS description
    UNION ALL SELECT 'Clean the bathroom', 'Shower, toilet, sink and mirror'
    UNION ALL SELECT 'Vacuum and mop the floor', ''
    UNION ALL SELECT 'Dust the furniture and clean the windows', ''
    UNION ALL SELECT 'Empty the bins', ''
    UNION ALL SELECT 'Restock towels and toiletries', ''
    UNION ALL SELECT 'Check the minibar', ''
) AS v
JOIN preset p ON p.preset_title = 'Check-out room cleaning'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, 'Housekeeping'
FROM preset p
WHERE p.preset_title = 'Check-out room cleaning'
AND @created = 1;

-- Stay-over cleaning
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Stay-over cleaning', 'Daily cleaning for a guest who stays', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Stay-over cleaning');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Make the bed' AS title, '' AS description
    UNION ALL SELECT 'Replace the used towels', ''
    UNION ALL SELECT 'Empty the bins', ''
    UNION ALL SELECT 'Wipe the bathroom surfaces', ''
    UNION ALL SELECT 'Restock the toiletries if needed', ''
) AS v
JOIN preset p ON p.preset_title = 'Stay-over cleaning'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, 'Housekeeping'
FROM preset p
WHERE p.preset_title = 'Stay-over cleaning'
AND @created = 1;

-- Pre-arrival inspection
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Pre-arrival inspection', 'Last check before the guest arrives', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Pre-arrival inspection');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Check that the room is clean and the bed is made' AS title, '' AS description
    UNION ALL SELECT 'Check the lights, the TV and the air conditioning', ''
    UNION ALL SELECT 'Test the safe', ''
    UNION ALL SELECT 'Check the water pressure and the hot water', ''
    UNION ALL SELECT 'Check the minibar and the welcome items', ''
) AS v
JOIN preset p ON p.preset_title = 'Pre-arrival inspection'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, v.role
FROM (
    SELECT 'Receptionist' AS role
    UNION ALL SELECT 'Housekeeping'
) AS v
JOIN preset p ON p.preset_title = 'Pre-arrival inspection'
WHERE @created = 1;

-- Deep cleaning
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Deep cleaning', 'Periodic deep cleaning of a room', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Deep cleaning');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Turn and clean the mattress' AS title, '' AS description
    UNION ALL SELECT 'Wash the curtains', ''
    UNION ALL SELECT 'Clean behind and under the furniture', ''
    UNION ALL SELECT 'Descale the shower and the taps', ''
    UNION ALL SELECT 'Clean the air vents and the filters', ''
) AS v
JOIN preset p ON p.preset_title = 'Deep cleaning'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, 'Housekeeping'
FROM preset p
WHERE p.preset_title = 'Deep cleaning'
AND @created = 1;

-- Maintenance check
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Maintenance check', 'Technical check of a room', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Maintenance check');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Check the plumbing for leaks' AS title, '' AS description
    UNION ALL SELECT 'Check the electrical outlets and the lights', ''
    UNION ALL SELECT 'Check the door lock and the keycard reader', ''
    UNION ALL SELECT 'Check the smoke detector', ''
) AS v
JOIN preset p ON p.preset_title = 'Maintenance check'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, 'Maintenance'
FROM preset p
WHERE p.preset_title = 'Maintenance check'
AND @created = 1;

-- Breakfast setup
INSERT INTO preset (preset_title, preset_description, user_id, created_at)
SELECT 'Breakfast setup', 'Opening of the breakfast service', u.user_id, NOW()
FROM user_ u
WHERE u.email = 'claire.moreau@hotel.com'
AND NOT EXISTS (SELECT 1 FROM preset WHERE preset_title = 'Breakfast setup');
SET @created = ROW_COUNT();

INSERT INTO preset_task (preset_task_title, preset_task_description, preset_id)
SELECT v.title, v.description, p.preset_id
FROM (
    SELECT 'Set the tables' AS title, '' AS description
    UNION ALL SELECT 'Fill the coffee machines and the juice dispensers', ''
    UNION ALL SELECT 'Set out the buffet items', ''
    UNION ALL SELECT 'Check the allergen labels', ''
) AS v
JOIN preset p ON p.preset_title = 'Breakfast setup'
WHERE @created = 1;

INSERT INTO preset_role (preset_id, role)
SELECT p.preset_id, 'Restaurant'
FROM preset p
WHERE p.preset_title = 'Breakfast setup'
AND @created = 1;
