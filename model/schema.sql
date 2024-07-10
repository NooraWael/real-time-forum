-- Enable foreign key constraint checking
PRAGMA foreign_keys = ON;

-- Create a 'user' table
CREATE TABLE
    IF NOT EXISTS users (
        username TEXT PRIMARY KEY, -- confirm if unique will help in checking for existing usernames (return error?)
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        status TEXT,
        role TEXT DEFAULT 'user'
            CONSTRAINT chk_role CHECK (role IN ('user', 'mod', 'admin')), -- Checking if role is one of these, just in case!
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- add just because!
    );

-- Create a 'posts' table
CREATE TABLE
    IF NOT EXISTS posts (
        post_id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL, -- author
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER, -- To implement a trigger?
        dislikes INTEGER, -- To implement a trigger?
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author) REFERENCES users (username)
    );

-- Create a 'comments' table
CREATE TABLE
    IF NOT EXISTS comments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER, -- To implement a trigger?
        dislikes INTEGER, -- To implement a trigger?
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts (post_id),
        FOREIGN KEY (author) REFERENCES users (username)
    );

-- Create a 'categories' table
CREATE TABLE
    IF NOT EXISTS categories (
        cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    );

-- Create a 'post category' table
CREATE TABLE
    IF NOT EXISTS post_category (
        post_id INTEGER NOT NULL,
        cat_id INTEGER NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts (post_id),
        FOREIGN KEY (cat_id) REFERENCES categories (cat_id)
    );

-- Create a 'likes' table
CREATE TABLE
    IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY,
        post_id INTEGER NOT NULL,
        comment_id INTEGER,
        username TEXT NOT NULL,
        isLike boolean,
        FOREIGN KEY (post_id) REFERENCES posts (post_id),
        FOREIGN KEY (comment_id) REFERENCES comments (comment_id),
        FOREIGN KEY (username) REFERENCES users (username)
    );

    CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
);


-- Create a 'sessions' table
CREATE TABLE
    IF NOT EXISTS sessions (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        -- token INTEGER,
        FOREIGN KEY (username) REFERENCES users (username)
    );

CREATE TRIGGER IF NOT EXISTS update_likes AFTER INSERT ON likes
    BEGIN
        UPDATE posts
        SET likes = likes + CASE WHEN NEW.comment_id IS NULL AND NEW.isLike = 1 THEN 1 ELSE 0 END,
            dislikes = dislikes + CASE WHEN NEW.comment_id IS NULL AND NEW.isLike = 0 THEN 1 ELSE 0 END
        WHERE post_id = NEW.post_id;

        UPDATE comments
        SET likes = likes + CASE WHEN NEW.comment_id IS NOT NULL AND NEW.isLike = 1 THEN 1 ELSE 0 END,
            dislikes = dislikes + CASE WHEN NEW.comment_id IS NOT NULL AND NEW.isLike = 0 THEN 1 ELSE 0 END
        WHERE comment_id = NEW.comment_id;
    END;


CREATE TRIGGER IF NOT EXISTS update_likes_after_delete AFTER DELETE ON likes
    BEGIN
        UPDATE posts
        SET likes = likes - CASE WHEN OLD.comment_id IS NULL AND OLD.isLike = 1 THEN 1 ELSE 0 END,
            dislikes = dislikes - CASE WHEN OLD.comment_id IS NULL AND OLD.isLike = 0 THEN 1 ELSE 0 END
        WHERE post_id = OLD.post_id;
    
        UPDATE comments
        SET likes = likes - CASE WHEN OLD.comment_id IS NOT NULL AND OLD.isLike = 1 THEN 1 ELSE 0 END,
            dislikes = dislikes - CASE WHEN OLD.comment_id IS NOT NULL AND OLD.isLike = 0 THEN 1 ELSE 0 END
        WHERE comment_id = OLD.comment_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_on_change AFTER UPDATE ON likes 
    BEGIN
        UPDATE posts
        SET likes = (SELECT COUNT(*) FROM likes WHERE post_id = NEW.post_id AND comment_id IS NULL AND isLike = 1),
        dislikes = (SELECT COUNT(*) FROM likes WHERE post_id = NEW.post_id AND comment_id IS NULL AND isLike = 0)
        WHERE post_id = NEW.post_id;

        UPDATE comments
        SET likes = (SELECT COUNT(*) FROM likes WHERE comment_id = NEW.comment_id AND isLike = 1),
            dislikes = (SELECT COUNT(*) FROM likes WHERE comment_id = NEW.comment_id AND isLike = 0)
        WHERE comment_id = NEW.comment_id;
    END;
