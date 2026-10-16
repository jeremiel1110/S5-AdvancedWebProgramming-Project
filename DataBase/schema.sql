-- 1. Création de la base de données
CREATE DATABASE IF NOT EXISTS hotel_todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_todo_db;

-- 2. Table des utilisateurs (avec champs pour l'authentification)
CREATE TABLE IF NOT EXISTS user_ (
    user_id INT AUTO_INCREMENT,
    user_lastname VARCHAR(255) NOT NULL,
    user_firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- 3. Table des listes de To-Do
CREATE TABLE IF NOT EXISTS to_do (
    to_do_id INT AUTO_INCREMENT,
    to_do_location VARCHAR(255),
    to_do_title VARCHAR(255) NOT NULL,
    to_do_description TEXT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (to_do_id),
    CONSTRAINT fk_todo_owner 
        FOREIGN KEY (user_id) REFERENCES user_(user_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Table des tâches individuelles
CREATE TABLE IF NOT EXISTS task (
    task_id INT AUTO_INCREMENT,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_done BOOLEAN DEFAULT FALSE,
    to_do_id INT NOT NULL,
    PRIMARY KEY (task_id),
    CONSTRAINT fk_task_todo 
        FOREIGN KEY (to_do_id) REFERENCES to_do(to_do_id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Table d'association User <-> To-Do
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