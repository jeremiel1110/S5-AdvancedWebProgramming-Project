USE hotel_todo_db;

UPDATE user_
SET password_hash = '$2b$12$U3Pel8.qRQrlTb5h..3wKeYxYCcsxzgpL.QnZAVtaJ5XX4Ym2zrXG'
WHERE email = 'manager@hotel.com' AND password_hash = 'hash_test_123';

UPDATE user_
SET password_hash = '$2b$12$eSYVnnyzzFXzC9of30i78e5BU49/ImxPHxO6bwAURVJUWo0yUZxpa'
WHERE email = 'alice@hotel.com' AND password_hash = 'hash_test_456';

SELECT email, LEFT(password_hash, 7) AS hash_start FROM hotel_todo_db.user_;