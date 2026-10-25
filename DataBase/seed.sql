USE hotel_todo_db;

INSERT INTO user_ (user_lastname, user_firstname, email, password_hash, role) VALUES 
('Dupont', 'Jean', 'manager@hotel.com', 'hash_test_123', 'Manager'),
('Martin', 'Alice', 'alice@hotel.com', 'hash_test_456', 'Staff');

INSERT INTO to_do (to_do_location, to_do_title, to_do_description, user_id) VALUES 
('1228', 'Clean UP Room 1228', 'Nettoyage complet après départ client', 1);

INSERT INTO task (task_title, task_description, task_done, to_do_id) VALUES 
('Clean windows', 'Vérifier les traces sur la baie vitrée', true, 1),
('Change sheets', 'Mettre des draps propres taille King', false, 1);

INSERT INTO user_to_do (user_id, to_do_id) VALUES (2, 1);