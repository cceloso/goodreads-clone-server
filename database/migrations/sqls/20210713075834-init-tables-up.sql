-- USERS

CREATE TABLE `users` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` CHAR(60) NOT NULL,
    `dateCreated` DATETIME NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_userName ON `users` (`userName`);
CREATE INDEX idx_userName_email ON `users` (`userName`, `email`);


CREATE PROCEDURE `getUserById`(
	IN `p_id` INT
)
BEGIN
	SELECT *  FROM `users`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `getUserByUsernameOrEmail`(
	IN `p_usernameOrEmail` VARCHAR(255)
)
BEGIN
	SELECT *  FROM `users`
    WHERE `username` = `p_usernameOrEmail` OR `email` = `p_usernameOrEmail`;
END;

CREATE PROCEDURE `postUser`(
	IN `p_firstName` VARCHAR(255),
    IN `p_lastName` VARCHAR(255),
    IN `p_userName` VARCHAR(255),
    IN `p_email` VARCHAR(255),
    IN `p_password` CHAR(60),
    IN `p_imageUrl` VARCHAR(255),
    IN `p_role` VARCHAR(255)
)
BEGIN
	INSERT INTO `users` (`firstName`, `lastName`, `userName`, `email`, `password`, `dateCreated`, `imageUrl`, `role`)
    VALUES (`p_firstName`, `p_lastName`, `p_userName`, `p_email`, `p_password`, NOW(), `p_imageUrl`, `p_role`);

    SELECT * FROM `users`
    WHERE `userName` = `p_userName`;
END;

CREATE PROCEDURE `putUser`(
	IN `p_id` INT,
	IN `p_firstname` VARCHAR(255),
    IN `p_lastname` VARCHAR(255),
    IN `p_username` VARCHAR(255),
    IN `p_email` VARCHAR(255),
    IN `p_password` CHAR(60),
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
	UPDATE `users`
    SET `firstname` = `p_firstname`, `lastname` = `p_lastname`, `username` = `p_username`, `email` = `p_email`, `password` = `p_password`, `imageUrl` = `p_imageUrl`
    WHERE `id` = `p_id`;

    SELECT * FROM `users`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteUser`(
	IN `p_id` INT
)
BEGIN
	DELETE FROM `users`
    WHERE `id` = `p_id`;
END;


-- BOOKS

CREATE TABLE `books` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `isbn` VARCHAR(255) NOT NULL,
    `publisher` VARCHAR(255) NOT NULL,
    `published` VARCHAR(4) NOT NULL,
    `description` TEXT NOT NULL,
    `genres` JSON NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `totalRating` FLOAT(10, 2) NOT NULL,
    `averageRating` FLOAT(3, 2) NOT NULL,
    `ratingCtr` INT NOT NULL,
    CONSTRAINT `titleAndAuthor` UNIQUE(`title`, `author`)
);

CREATE INDEX idx_title ON `books` (`title`);
CREATE INDEX idx_author_title ON `books` (`author`, `title`);

CREATE PROCEDURE `getBook`(
	IN `p_id` INT
)
BEGIN
	SELECT *  FROM `books`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `getBooks`()
BEGIN
	SELECT *  FROM `books`
    ORDER BY `title`;
END;

CREATE PROCEDURE `getBooksByAuthor`(
	IN `p_author` VARCHAR(255)
)
BEGIN
	SELECT * FROM `books`
    WHERE `author` = `p_author`
    ORDER BY `title`;
END;

CREATE PROCEDURE `getBooksByGenre`(
	IN `p_genre` VARCHAR(255)
)
BEGIN
	SELECT * FROM `books`
    WHERE `JSON_CONTAINS`(`genres`, `p_genre`)
    ORDER BY `title`;
END;

CREATE PROCEDURE `searchBooksByTitleOrAuthor`(
    IN `p_searchParam` VARCHAR(255)
)
BEGIN
	SELECT *  FROM `books`
    WHERE `title` LIKE `p_searchParam` OR `author` LIKE `p_searchParam`
    ORDER BY `title`;
END;

CREATE PROCEDURE `getTitleAndAuthor`(
	IN `p_id` INT
)
BEGIN
	SELECT `title`, `author` FROM `books`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `postBook`(
	IN `p_title` VARCHAR(255),
    IN `p_author` VARCHAR(255),
    IN `p_isbn` VARCHAR(255),
    IN `p_publisher` VARCHAR(255),
    IN `p_published` VARCHAR(4),
    IN `p_description` TEXT,
    IN `p_genres` JSON,
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
	INSERT INTO `books` (`title`, `author`, `isbn`, `publisher`, `published`, `description`, `genres`, `imageUrl`, `totalRating`, `averageRating`, `ratingCtr`)
    VALUES (`p_title`, `p_author`, `p_isbn`, `p_publisher`, `p_published`, `p_description`, `p_genres`, `p_imageUrl`, 0, 0, 0);

    SELECT * FROM `books`
    WHERE `title` = `p_title` AND `author` = `p_author`;
END;

CREATE PROCEDURE `putBook`(
    IN `p_id` INT,
    IN `p_title` VARCHAR(255),
    IN `p_author` VARCHAR(255),
    IN `p_isbn` VARCHAR(255),
    IN `p_publisher` VARCHAR(255),
    IN `p_published` VARCHAR(4),
    IN `p_description` TEXT,
    IN `p_genres` JSON,
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
	UPDATE `books`
    SET `title` = `p_title`, `author` = `p_author`, `isbn` = `p_isbn`, `publisher` = `p_publisher`, `published` = `p_published`, `description` = `p_description`, `genres` = `p_genres`, `imageUrl` = `p_imageUrl`
    WHERE `id` = `p_id`;

    SELECT * FROM `books`
    WHERE `title` = `p_title` AND `author` = `p_author`;
END;

CREATE PROCEDURE `deleteBook`(
	IN `p_id` INT
)
BEGIN
	DELETE FROM `books`
    WHERE `id` = `p_id`;
END;


-- GENRES

CREATE TABLE `genres` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) UNIQUE NOT NULL
);

CREATE PROCEDURE `postGenre`(
	IN `p_name` VARCHAR(255)
)
BEGIN
	INSERT IGNORE INTO `genres` (`name`)
    VALUES (`p_name`);
END;

CREATE PROCEDURE `getGenre`(
    IN `p_name` VARCHAR(255)
)
BEGIN
	SELECT *  FROM `genres`
    WHERE `name` = `p_name`;
END;

CREATE PROCEDURE `getGenres`()
BEGIN
	SELECT *  FROM `genres`;
END;


-- REVIEW

CREATE TABLE `reviews` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `rating` FLOAT(3, 2) NOT NULL,
    `review` TEXT NOT NULL,
    `dateCreated` DATETIME NOT NULL,
    `bookId` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    CONSTRAINT `bookAndUser` UNIQUE(`bookId`, `userId`)
);

CREATE INDEX idx_bookId ON `reviews` (`bookId`);
CREATE INDEX idx_userId ON `reviews` (`userId`);
CREATE INDEX idx_dateCreated ON `reviews` (`dateCreated`);
CREATE INDEX idx_bookId_userId ON `reviews` (`bookId`, `userId`);

CREATE PROCEDURE `getReviews`(
	IN `p_bookId` INT
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `bookId` = `p_bookId`
    ORDER BY `dateCreated` DESC;
END;

CREATE PROCEDURE `getReviewByUserAndBook`(
    IN `p_userId` INT,
    IN `p_bookId` INT
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `userId` = `p_userId` AND `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `getReviewsByUser`(
    IN `p_userId` INT
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `userId` = `p_userId`
    ORDER BY `dateCreated` DESC;
END;

CREATE PROCEDURE `postReview`(
    IN `p_rating` FLOAT(3, 2),
    IN `p_review` TEXT,
    IN `p_bookId` INT,
    IN `p_title` VARCHAR(255),
    IN `p_author` VARCHAR(255),
    IN `p_userId` INT,
    IN `p_userName` VARCHAR(255)
)
BEGIN
	INSERT INTO `reviews` (`rating`, `review`, `dateCreated`, `bookId`, `title`, `author`, `userId`, `userName`)
    VALUES (`p_rating`, `p_review`, NOW(), `p_bookId`, `p_title`, `p_author`, `p_userId`, `p_userName`);

    SELECT * FROM `reviews`
    WHERE `bookId` = `p_bookId` AND `userId` = `p_userId`;
END;

CREATE PROCEDURE `putReview`(
	IN `p_id` INT,
    IN `p_rating` FLOAT(3, 2),
    IN `p_review` TEXT
)
BEGIN
    UPDATE `reviews`
    SET `rating` = `p_rating`, `review` = `p_review`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteReview`(
	IN `p_id` INT
)
BEGIN
    DELETE FROM `reviews`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteReviewsByBook`(
    IN `p_bookId` INT
)
BEGIN
    DELETE FROM `reviews`
    WHERE `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `deleteReviewsByUser`(
    IN `p_userId` INT
)
BEGIN
    DELETE FROM `reviews`
    WHERE `userId` = `p_userId`;
END;

CREATE PROCEDURE `getRating`(
    IN `p_id` INT
)
BEGIN
    SELECT `rating` FROM `reviews`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `changeTotalRating`(
    IN `p_id` INT,
    IN `p_oldRating` FLOAT(3, 2),
    IN `p_newRating` FLOAT(3, 2),
    IN `p_bookId` INT
)
BEGIN
    UPDATE `books`
    SET `totalRating` = `totalRating` - `p_oldRating` + `p_newRating`
    WHERE `id` = `p_bookId`;
END;

CREATE PROCEDURE `increaseTotalRating`(
    IN `p_rating` FLOAT(3, 2),
    IN `p_bookId` INT
)
BEGIN
    UPDATE `books`
    SET `totalRating` = `totalRating` + `p_rating`, `ratingCtr` = `ratingCtr` + 1
    WHERE `id` = `p_bookId`;
END;

CREATE PROCEDURE `decreaseTotalRating`(
    IN `p_id` INT,
    IN `p_rating` FLOAT(3, 2),
    IN `p_bookId` INT
)
BEGIN
    UPDATE `books`
    SET `totalRating` = `totalRating` - `p_rating`, `ratingCtr` = `ratingCtr` - 1
    WHERE `id` = `p_bookId`;
END;

CREATE PROCEDURE `updateAverageRating`(
    IN `p_bookId` INT
)
BEGIN
    DECLARE `v_ratingCtr` INT;

    SELECT `ratingCtr` INTO `v_ratingCtr` FROM `books`
    WHERE `id` = `p_bookId`;

    IF `v_ratingCtr` = 0 THEN
        UPDATE `books`
        SET `averageRating` = 0
        WHERE `id` = `p_bookId`;
    ELSE
        UPDATE `books`
        SET `averageRating` = `totalRating` / `ratingCtr`
        WHERE `id` = `p_bookId`;
    END IF;

    SELECT `averageRating` FROM `books`
    WHERE `id` = `p_bookId`;
END;


-- COMMENTS

CREATE TABLE `comments` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `comment` TEXT NOT NULL,
    `dateCreated` DATETIME NOT NULL,
    `bookId` INT NOT NULL,
    `reviewId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_reviewId ON `comments` (`reviewId`);
CREATE INDEX idx_dateCreated ON `comments` (`dateCreated`);

CREATE PROCEDURE `getComment`(
	IN `p_id` INT
)
BEGIN
	SELECT *  FROM `comments`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `getComments`(
	IN `p_reviewId` INT
)
BEGIN
	SELECT *  FROM `comments`
    WHERE `reviewId` = `p_reviewId`
    ORDER BY `dateCreated`;
END;

CREATE PROCEDURE `postComment`(
    IN `p_comment` TEXT,
    IN `p_bookId` INT,
    IN `p_reviewId` INT,
    IN `p_userId` INT,
    IN `p_userName` VARCHAR(255)
)
BEGIN
    INSERT INTO `comments` (`comment`, `dateCreated`, `bookId`, `reviewId`, `userId`, `userName`)
    VALUES (`p_comment`, NOW(), `p_bookId`, `p_reviewId`, `p_userId`, `p_userName`);

    SELECT * FROM `comments` WHERE `id` = (
        SELECT MAX(`id`) FROM `comments`
    );
END;

CREATE PROCEDURE `putComment`(
    IN `p_commentId` INT,
    IN `p_comment` TEXT
)
BEGIN
    UPDATE `comments`
    SET `comment` = `p_comment`
    WHERE `id` = `p_commentId`;
END;

CREATE PROCEDURE `deleteComment`(
    IN `p_commentId` INT
)
BEGIN
    DELETE FROM `comments`
    WHERE `id` = `p_commentId`;
END;

CREATE PROCEDURE `deleteCommentsByBook`(
    IN `p_bookId` INT
)
BEGIN
    DELETE FROM `comments`
    WHERE `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `deleteCommentsByReview`(
    IN `p_reviewId` INT
)
BEGIN
    DELETE FROM `comments`
    WHERE `reviewId` = `p_reviewId`;
END;

CREATE PROCEDURE `deleteCommentsByUser`(
    IN `p_userId` INT
)
BEGIN
    DELETE FROM `comments`
    WHERE `userId` = `p_userId`;
END;


-- FORUM TOPICS

CREATE TABLE `topics` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `flair` VARCHAR(255),
    `dateCreated` DATETIME NOT NULL,
    `lastUpdated` TIMESTAMP NOT NULL,
    `replyCtr` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_dateCreated ON `topics` (`dateCreated`);
-- CREATE INDEX idx_title_dateCreated ON `topics` (`title`, `dateCreated`);
-- CREATE INDEX idx_lastUpdated ON `topics` (`lastUpdated`);

CREATE PROCEDURE `getTopic`(
	IN `p_id` INT
)
BEGIN
	SELECT *  FROM `topics`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `getTopics`()
BEGIN
	SELECT *  FROM `topics`
    ORDER BY `dateCreated` DESC;
END;

CREATE PROCEDURE `getTopicsByFlair`(
    IN `p_flair` VARCHAR(255)
)
BEGIN
	SELECT *  FROM `topics`
    WHERE `flair` = `p_flair`
    ORDER BY `dateCreated` DESC;
END;

CREATE PROCEDURE `getTopicsByUser`(
    IN `p_userId` INT
)
BEGIN
	SELECT *  FROM `topics`
    WHERE `userId` = `p_userId`
    ORDER BY `dateCreated` DESC;
END;

CREATE PROCEDURE `searchTopics`(
    IN `p_searchParam` VARCHAR(255)
)
BEGIN
	SELECT *  FROM `topics`
    WHERE `title` LIKE `p_searchParam`
    ORDER BY `dateCreated` DESC, `title`;
END;

CREATE PROCEDURE `postTopic`(
    IN `p_title` TEXT,
    IN `p_content` TEXT,
    IN `p_flair` VARCHAR(255),
    IN `p_userId` INT,
    IN `p_userName` VARCHAR(255)
)
BEGIN
    INSERT INTO `topics` (`title`, `content`, `flair`, `dateCreated`, `replyCtr`, `userId`, `userName`)
    VALUES (`p_title`, `p_content`, `p_flair`, NOW(), 0, `p_userId`, `p_userName`);

    SELECT * FROM `topics` WHERE `id` = (
        SELECT MAX(`id`) FROM `topics`
    );
END;

CREATE PROCEDURE `putTopic`(
    IN `p_id` INT,
    IN `p_title` TEXT,
    IN `p_content` TEXT,
    IN `p_flair` VARCHAR(255)
)
BEGIN
    UPDATE `topics`
    SET `title` = `p_title`, `content` = `p_content`, `flair` = `p_flair`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteTopic`(
    IN `p_id` INT
)
BEGIN
    DELETE FROM `topics`
    WHERE `id` = `p_id`;
END;


-- FORUM REPLIES

CREATE TABLE `replies` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `dateCreated` DATETIME NOT NULL,
    `lastUpdated` TIMESTAMP NOT NULL,
    `topicId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_dateCreated ON `replies` (`dateCreated`);
CREATE INDEX idx_lastUpdated ON `replies` (`lastUpdated`);

CREATE PROCEDURE `getReply`(
	IN `p_replyId` INT,
	IN `p_topicId` INT
)
BEGIN
	SELECT *  FROM `replies`
    WHERE `id` = `p_replyId` AND `topicId` = `p_topicId` ;
END;

CREATE PROCEDURE `getReplies`(
    IN `p_topicId` INT
)
BEGIN
	SELECT *  FROM `replies`
    WHERE `topicId` = `p_topicId`
    ORDER BY `dateCreated`;
END;

CREATE PROCEDURE `postReply`(
    IN `p_content` TEXT,
    IN `p_topicId` INT,
    IN `p_userId` INT,
    IN `p_userName` VARCHAR(255)
)
BEGIN
    INSERT INTO `replies` (`content`, `dateCreated`, `lastUpdated`, `topicId`, `userId`, `userName`)
    VALUES (`p_content`, NOW(), NOW(), `p_topicId`, `p_userId`, `p_userName`);

    SELECT * FROM `replies` WHERE `id` = (
        SELECT MAX(`id`) FROM `replies`
    );
END;

CREATE PROCEDURE `putReply`(
    IN `p_id` INT,
    IN `p_content` TEXT,
    IN `p_topicId` INT
)
BEGIN
    UPDATE `replies`
    SET `content` = `p_content`
    WHERE `id` = `p_id` AND `topicId` = `p_topicId`;
END;

CREATE PROCEDURE `deleteReply`(
    IN `p_id` INT,
    IN `p_topicId` INT
)
BEGIN
    DELETE FROM `replies`
    WHERE `id` = `p_id` AND `topicId` = `p_topicId`;
END;

-- FORUM TOPIC AND REPLY

CREATE PROCEDURE `increaseReplyCtr`(
    IN `p_topicId` INT
)
BEGIN
    UPDATE `topics`
    SET `replyCtr` = `replyCtr` + 1
    WHERE `id` = `p_topicId`;
END;

CREATE PROCEDURE `decreaseReplyCtr`(
    IN `p_topicId` INT
)
BEGIN
    UPDATE `topics`
    SET `replyCtr` = `replyCtr` - 1
    WHERE `id` = `p_topicId`;
END;


-- SEED GENRES

CALL `postGenre`("adult");
CALL `postGenre`("biography");
CALL `postGenre`("chick-lit");
CALL `postGenre`("children's");
CALL `postGenre`("crime");
CALL `postGenre`("fantasy");
CALL `postGenre`("fiction");
CALL `postGenre`("graphic-novels");
CALL `postGenre`("historical-fiction");
CALL `postGenre`("history");
CALL `postGenre`("horror");
CALL `postGenre`("mystery");
CALL `postGenre`("paranormal");
CALL `postGenre`("politics");
CALL `postGenre`("romance");
CALL `postGenre`("science");
CALL `postGenre`("science-fiction");
CALL `postGenre`("suspense");
CALL `postGenre`("thriller");
CALL `postGenre`("young-adult");
CALL `postGenre`("art");
CALL `postGenre`("business");
CALL `postGenre`("classics");
CALL `postGenre`("comics");
CALL `postGenre`("contemporary");
CALL `postGenre`("cookbooks");
CALL `postGenre`("gay-and-lesbian");
CALL `postGenre`("humor-and-comedy");
CALL `postGenre`("manga");
CALL `postGenre`("memoir");
CALL `postGenre`("music");
CALL `postGenre`("nonfiction");
CALL `postGenre`("philosophy");
CALL `postGenre`("poetry");
CALL `postGenre`("psychology");
CALL `postGenre`("romance");
CALL `postGenre`("self-help");
CALL `postGenre`("spirituality");
CALL `postGenre`("sports");
CALL `postGenre`("travel");
CALL `postGenre`("apocalyptic");
CALL `postGenre`("politics");
CALL `postGenre`("literature");
CALL `postGenre`("adventure");
CALL `postGenre`("novels");
CALL `postGenre`("inspirational");
CALL `postGenre`("mythology");
CALL `postGenre`("historical");
