-- USERS

CREATE TABLE `users` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `firstname` VARCHAR(48) NOT NULL,
    `lastname` VARCHAR(48) NOT NULL,
    `username` VARCHAR(48) UNIQUE NOT NULL,
    `email` VARCHAR(128) UNIQUE NOT NULL,
    `password` VARCHAR(48) NOT NULL,
    `createdAt` DATE NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `role` VARCHAR(16) NOT NULL
);

CREATE PROCEDURE `postUser`(
    IN `p_id` VARCHAR(48),
	IN `p_firstname` VARCHAR(48),
    IN `p_lastname` VARCHAR(48),
    IN `p_username` VARCHAR(48),
    IN `p_email` VARCHAR(128),
    IN `p_password` VARCHAR(48),
    IN `p_imageUrl` VARCHAR(255),
    IN `p_role` VARCHAR(48)
)
BEGIN
	INSERT INTO `users` (`id`, `firstname`, `lastname`, `username`, `email`, `password`, `createdAt`, `imageUrl`, `role`)
    VALUES (`p_id`, `p_firstname`, `p_lastname`, `p_username`, `p_email`, `p_password`, NOW(), `p_imageUrl`, `p_role`);
END;

CREATE PROCEDURE `getAllUsers`()
BEGIN
	SELECT *  FROM `users`;
END;

-- CREATE PROCEDURE `getUser`(
-- 	IN `p_id` VARCHAR(48)
-- )
-- BEGIN
-- 	SELECT *  FROM `users`
--     WHERE `id` = `p_id`;
-- END;

CREATE PROCEDURE `getUser`(
	IN `p_username` VARCHAR(48),
    IN `p_password` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `users`
    WHERE `username` = `p_username` AND `password` = `p_password`;
END;

CREATE PROCEDURE `loginUser`(
	IN `p_usernameOrEmail` VARCHAR(255),
    IN `p_password` VARCHAR(255)
)
BEGIN
	DECLARE `v_selectedUser` INT;
    -- DECLARE `v_loginResult` VARCHAR(255);
    DECLARE v_loginResult VARCHAR(255);
    
	SELECT COUNT(*) INTO `v_selectedUser`  FROM `users`
    WHERE (`username` = `p_usernameOrEmail` OR `email` = `p_usernameOrEmail`) AND `password` = `p_password`;
    
    IF `v_selectedUser` = 1 THEN
		SET v_loginResult = "SUCCESS";
	ELSE
		SELECT COUNT(*) INTO `v_selectedUser` FROM `users`
        WHERE `username` = `p_usernameOrEmail` OR `email` = `p_usernameOrEmail`;
        
        IF `v_selectedUser` = 1 THEN
			SET v_loginResult = "INVALID_PASSWORD";
		ELSE
			SET v_loginResult = "INVALID_USER";
		END IF;
	END IF;
    
    SELECT v_loginResult;
END;

CREATE PROCEDURE `putUser`(
	IN `p_id` VARCHAR(48),
	IN `p_firstname` VARCHAR(48),
    IN `p_lastname` VARCHAR(48),
    IN `p_username` VARCHAR(48),
    IN `p_email` VARCHAR(128),
    IN `p_password` VARCHAR(48),
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
	UPDATE `users`
    SET `firstname` = `p_firstname`, `lastname` = `p_lastname`, `username` = `p_username`, `email` = `p_email`, `password` = `p_password`, `imageUrl` = `p_imageUrl`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteUser`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	DELETE FROM `users`
    WHERE `id` = `p_id`;
END;


-- BOOKS

CREATE TABLE `authors` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE `books` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `isbn` VARCHAR(255) NOT NULL,
    `publisher` VARCHAR(255) NOT NULL,
    `published` YEAR NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `totalRating` FLOAT(3, 2) NOT NULL,
    `averageRating` FLOAT(3, 2) NOT NULL,
    `ratingCtr` INT NOT NULL,
    `reviewCtr` INT NOT NULL,
    FOREIGN KEY (`author`)
        REFERENCES `authors`(`name`)
        ON DELETE CASCADE,
    CONSTRAINT `titleAndAuthor` UNIQUE(`title`, `author`)
);

CREATE PROCEDURE `postBook`(
    IN `p_id` VARCHAR(48),
	IN `p_title` VARCHAR(255),
    IN `p_authorId` VARCHAR(48),
    IN `p_authorName` VARCHAR(255),
    IN `p_isbn` VARCHAR(255),
    IN `p_publisher` VARCHAR(255),
    IN `p_published` YEAR,
    IN `p_description` TEXT,
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
    CALL `postAuthor`(`p_authorId`, `p_authorName`);

	INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `publisher`, `published`, `description`, `imageUrl`, `totalRating`, `averageRating`, `ratingCtr`, `reviewCtr`)
    VALUES (`p_id`, `p_title`, `p_authorName`, `p_isbn`, `p_publisher`, `p_published`, `p_description`, `p_imageUrl`, 0, 0, 0, 0);

    CALL `postBookAuthor`(`p_id`, `p_authorId`, `p_authorName`);
END;

CREATE PROCEDURE `getAllBooks`()
BEGIN
	-- SELECT *  FROM `books`;
    SELECT `books`.*, GROUP_CONCAT(`genres`.`name`) AS `genres`
    FROM `books`
    INNER JOIN `booksAndGenres` ON `booksAndGenres`.`bookId` = `books`.`id`
    INNER JOIN `genres` ON `booksAndGenres`.`genreId` = `genres`.`id`
    GROUP BY `books`.`id`;
END;

CREATE PROCEDURE `getBook`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	-- SELECT *  FROM `books`
    -- WHERE `id` = `p_id`;
    SELECT `books`.*, GROUP_CONCAT(`genres`.`name`) AS `genres`
    FROM `books`
    INNER JOIN `booksAndGenres` ON `booksAndGenres`.`bookId` = `books`.`id`
    INNER JOIN `genres` ON `booksAndGenres`.`genreId` = `genres`.`id`
    WHERE `books`.`id` = `p_id`
    GROUP BY `books`.`id`;
END;

CREATE PROCEDURE `getBooksByGenre`(
	IN `p_name` VARCHAR(255)
)
BEGIN
	SELECT `books`.*
    FROM `books`
    INNER JOIN `booksAndGenres` ON `booksAndGenres`.`bookId` = `books`.`id`
    INNER JOIN `genres` ON `booksAndGenres`.`genreId` = `genres`.`id`
    WHERE `genres`.`name` = `p_name`
    GROUP BY `books`.`id`;
END;

CREATE PROCEDURE `getBookGenre`(
	IN `p_id` VARCHAR(48)
)
BEGIN
    SELECT GROUP_CONCAT(`genres`.`name`) AS `genres`
    FROM `books`
    INNER JOIN `booksAndGenres` ON `booksAndGenres`.`bookId` = `books`.`id`
    INNER JOIN `genres` ON `booksAndGenres`.`genreId` = `genres`.`id`
    WHERE `books`.`id` = `p_id`
    GROUP BY `books`.`id`;
END;

CREATE PROCEDURE `postBookGenre`(
	IN `p_bookId` VARCHAR(48),
	IN `p_genreId` VARCHAR(48),
	IN `p_genreName` VARCHAR(255)
)
BEGIN
    CALL `postGenre`(`p_genreId`, `p_genreName`);
    CALL `getGenreByName`(`p_genreName`, @`v_genreId`);
    SELECT @`v_genreId`;
    CALL `postBookAndGenre`(`p_bookId`, @`v_genreId`);
END;

CREATE PROCEDURE `deleteBookGenre`(
	IN `p_bookId` VARCHAR(48),
	IN `p_genreName` VARCHAR(255)
)
BEGIN
    CALL `getGenreByName`(`p_genreName`, @`v_genreId`);
    SELECT @`v_genreId`;
    CALL `deleteBookAndGenre`(`p_bookId`, @`v_genreId`);
END;

CREATE PROCEDURE `getBookGenreIds`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	SELECT GROUP_CONCAT(`genres`.`id`) as `genreIds`
    FROM `books`
    INNER JOIN `booksAndGenres` ON `booksAndGenres`.`bookId` = `books`.`id`
    INNER JOIN `genres` ON `booksAndGenres`.`genreId` = `genres`.`id`
    WHERE `books`.`id` = `p_id` 
    GROUP BY `books`.`id`;
END;

CREATE PROCEDURE `putBook`(
    IN `p_id` VARCHAR(48),
	IN `p_title` VARCHAR(255),
    IN `p_authorId` VARCHAR(255),
    IN `p_authorName` VARCHAR(255),
    IN `p_isbn` VARCHAR(255),
    IN `p_publisher` VARCHAR(255),
    IN `p_published` YEAR,
    IN `p_description` TEXT,
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
    SELECT @`v_authorName`:=`author`
    FROM `books`
    WHERE `id` = `p_id`;

    CALL `postAuthor`(`p_authorId`, `p_authorName`);

	UPDATE `books`
    SET `title` = `p_title`, `author` = `p_authorName`, `isbn` = `p_isbn`, `publisher` = `p_publisher`, `published` = `p_published`, `description` = `p_description`, `imageUrl` = `p_imageUrl`
    WHERE `id` = `p_id`;

    CALL `postBookAuthor`(`p_id`, `p_authorId`, `p_authorName`);

    IF @`v_authorName` != `p_authorName` THEN
        CALL `deleteBookAuthor`(`p_id`, @`v_authorName`);
    END IF;
END;

CREATE PROCEDURE `deleteBook`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	DELETE FROM `books`
    WHERE `id` = `p_id`;
END;


-- AUTHORS

CREATE PROCEDURE `postAuthor`(
    IN `p_id` VARCHAR(48),
	IN `p_name` VARCHAR(255)
)
BEGIN
	INSERT IGNORE INTO `authors` (`id`, `name`)
    VALUES (`p_id`, `p_name`);
END;

CREATE PROCEDURE `getAllAuthors`()
BEGIN
	SELECT *  FROM `authors`;
END;

CREATE PROCEDURE `getAuthor`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `authors`
    WHERE `id` = `p_id`;
END;

-- CREATE PROCEDURE `getGenreByName`(
-- 	IN `p_name` VARCHAR(255),
--     OUT `genreId` VARCHAR(48)
-- )
-- BEGIN
-- 	SELECT `id` INTO `genreId` FROM `genres`
--     WHERE `name` = `p_name`;
-- END;

CREATE PROCEDURE `putAuthor`(
	IN `p_id` VARCHAR(48),
	IN `p_name` VARCHAR(255)
)
BEGIN
	UPDATE `authors`
    SET `name` = `p_name`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteAuthor`(
	IN `p_id` VARCHAR(48)
)
BEGIN
    CALL `checkIfBookAndAuthorExists`(`p_id`, @`v_affectedRows`);
    SELECT @`v_affectedRows`;

    IF @`v_affectedRows` = 0 THEN
        DELETE FROM `authors`
        WHERE `id` = `p_id`;
    END IF;
END;


-- BOOKS AND AUTHORS

CREATE TABLE `booksAndAuthors` (
    `bookId` VARCHAR(48) NOT NULL,
    `authorId` VARCHAR(48) NOT NULL,
    FOREIGN KEY (`bookId`)
        REFERENCES `books`(`id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`authorId`)
        REFERENCES `authors`(`id`)
        ON DELETE CASCADE,
    CONSTRAINT `bookAndAuthor` UNIQUE(`bookId`, `authorId`)
);

CREATE PROCEDURE `postBookAndAuthor`(
    IN `p_bookId` VARCHAR(48),
	IN `p_authorId` VARCHAR(48)
)
BEGIN
	INSERT IGNORE INTO `booksAndAuthors` (`bookId`, `authorId`)
    VALUES (`p_bookId`, `p_authorId`);
END;

CREATE PROCEDURE `getAllBooksAndAuthors`()
BEGIN
	SELECT *  FROM `booksAndAuthors`;
END;

CREATE PROCEDURE `deleteBookAndAuthor`(
	IN `p_bookId` VARCHAR(48),
    IN `p_authorId` VARCHAR(48)
)
BEGIN
	DELETE FROM `booksAndAuthors`
    WHERE `bookId` = `p_bookId` AND `authorId` = `p_authorId`;
END;

CREATE PROCEDURE `getAuthorByName`(
	IN `p_name` VARCHAR(255),
    OUT `authorId` VARCHAR(48)
)
BEGIN
	SELECT `id` INTO `authorId` FROM `authors`
    WHERE `name` = `p_name`;
END;

CREATE PROCEDURE `postBookAuthor`(
	IN `p_bookId` VARCHAR(48),
	IN `p_authorId` VARCHAR(48),
	IN `p_authorName` VARCHAR(255)
)
BEGIN
    CALL `getAuthorByName`(`p_authorName`, @`v_authorId`);
    SELECT @`v_authorId`;
    CALL `postBookAndAuthor`(`p_bookId`, @`v_authorId`);
END;

CREATE PROCEDURE `deleteBookAuthor`(
	IN `p_bookId` VARCHAR(48),
	IN `p_authorName` VARCHAR(255)
)
BEGIN
    CALL `getAuthorByName`(`p_authorName`, @`v_authorId`);
    SELECT @`v_authorId`;
    CALL `deleteBookAndAuthor`(`p_bookId`, @`v_authorId`);
    CALL `deleteAuthor`(@`v_authorId`);
END;

CREATE PROCEDURE `checkIfBookAndAuthorExists`(
	IN `p_authorId` VARCHAR(48),
    OUT `v_affectedRows` INT
)
BEGIN
	SELECT COUNT(*) INTO `v_affectedRows` FROM `booksAndAuthors`
    WHERE `authorId` = `p_authorId`;
END;


-- GENRES

CREATE TABLE `genres` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) UNIQUE NOT NULL
);

CREATE PROCEDURE `postGenre`(
    IN `p_id` VARCHAR(48),
	IN `p_name` VARCHAR(255)
)
BEGIN
	INSERT IGNORE INTO `genres` (`id`, `name`)
    VALUES (`p_id`, `p_name`);
END;

CREATE PROCEDURE `getAllGenres`()
BEGIN
	SELECT *  FROM `genres`;
END;

CREATE PROCEDURE `getGenre`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `genres`
    WHERE `id` = `p_id`;
END;

-- CREATE PROCEDURE `getGenreByName`(
-- 	IN `p_name` VARCHAR(255)
-- )
-- BEGIN
-- 	SELECT `id` FROM `genres`
--     WHERE `name` = `p_name`;
-- END;

CREATE PROCEDURE `getGenreByName`(
	IN `p_name` VARCHAR(255),
    OUT `genreId` VARCHAR(48)
)
BEGIN
	SELECT `id` INTO `genreId` FROM `genres`
    WHERE `name` = `p_name`;
END;

CREATE PROCEDURE `putGenre`(
	IN `p_id` VARCHAR(48),
	IN `p_name` VARCHAR(255)
)
BEGIN
	UPDATE `genres`
    SET `name` = `p_name`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `deleteGenre`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	DELETE FROM `genres`
    WHERE `id` = `p_id`;
END;


-- BOOKS AND GENRES

CREATE TABLE `booksAndGenres` (
    `bookId` VARCHAR(48) NOT NULL,
    `genreId` VARCHAR(48) NOT NULL,
    FOREIGN KEY (`bookId`)
        REFERENCES `books`(`id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`genreId`)
        REFERENCES `genres`(`id`)
        ON DELETE CASCADE,
    CONSTRAINT `bookAndGenre` UNIQUE(`bookId`, `genreId`)
);

CREATE PROCEDURE `postBookAndGenre`(
    IN `p_bookId` VARCHAR(48),
	IN `p_genreId` VARCHAR(48)
)
BEGIN
	INSERT IGNORE INTO `booksAndGenres` (`bookId`, `genreId`)
    VALUES (`p_bookId`, `p_genreId`);
END;

CREATE PROCEDURE `getAllBooksAndGenres`()
BEGIN
	SELECT *  FROM `booksAndGenres`;
END;

CREATE PROCEDURE `deleteBookAndGenre`(
	IN `p_bookId` VARCHAR(48),
    IN `p_genreId` VARCHAR(48)
)
BEGIN
	DELETE FROM `booksAndGenres`
    WHERE `bookId` = `p_bookId` AND `genreId` = `p_genreId`;
END;


-- REVIEWS

CREATE TABLE `reviews` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `rating` FLOAT(3, 2) NOT NULL,
    `review` TEXT NOT NULL,
    `dateCreated` DATE NOT NULL,
    `bookId` VARCHAR(48) NOT NULL,
    `userId` VARCHAR(48) NOT NULL,
    FOREIGN KEY (`bookId`)
        REFERENCES `books`(`id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`userId`)
        REFERENCES `users`(`id`)
        ON DELETE CASCADE,
    CONSTRAINT `bookAndUser` UNIQUE(`bookId`, `userId`)
);

CREATE PROCEDURE `getAllReviews`(
	IN `p_bookId` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `getReview`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `postReview`(
    IN `p_id` VARCHAR(48),
    IN `p_rating` FLOAT(3, 2),
    IN `p_review` TEXT,
    IN `p_bookId` VARCHAR(48),
    IN `p_userId` VARCHAR(48)
)
BEGIN
-- 	Insert review
	INSERT INTO `reviews` (`id`, `rating`, `review`, `dateCreated`, `bookId`, `userId`)
    VALUES (`p_id`, `p_rating`, `p_review`, CURDATE(), `p_bookId`, `p_userId`);
   
-- Update total rating and rating counter
    UPDATE `books`
    SET `totalRating` = `totalRating` + `p_rating`, `ratingCtr` = `ratingCtr` + 1
    WHERE `id` = `p_bookId`;

-- Update average rating
    UPDATE `books`
    SET `averageRating` = `totalRating` / `ratingCtr`
    WHERE `id` = `p_bookId`;

-- Update review info if review is not empty 
    IF `p_review` IS NOT NULL OR LENGTH(`p_review`) != 0 THEN
		UPDATE `books`
		SET `reviewCtr` = `reviewCtr` + 1
		WHERE `id` = `p_bookId`;
    END IF;
END;

-- CREATE PROCEDURE `putReview`(
-- 	IN `p_id` VARCHAR(48),
--     IN `p_rating` FLOAT(3, 2),
--     IN `p_review` TEXT
-- )
-- BEGIN
-- 	UPDATE `reviews`
--     SET `rating` = `p_rating`, `review` = `p_review`
--     WHERE `id` = `p_id`;
-- END;

CREATE PROCEDURE `checkIfReviewExists`(
	IN `p_id` VARCHAR(48),
	IN `p_bookId` VARCHAR(48),
    OUT `v_affectedRows` INT
)
BEGIN
	SELECT COUNT(*) INTO `v_affectedRows` FROM `reviews`
    WHERE `id` = `p_id` AND `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `getRatingValue`(
	IN `p_id` VARCHAR(255),
    OUT `v_ratingValue` FLOAT(3, 2)
)
BEGIN
	SELECT `rating` INTO `v_ratingValue` FROM `reviews`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `putReview`(
	IN `p_id` VARCHAR(48),
    IN `p_rating` FLOAT(3, 2),
    IN `p_review` TEXT,
    IN `p_bookId` VARCHAR(48)
)
BEGIN
-- Check if book review exists
	CALL `checkIfReviewExists` (`p_id`, `p_bookId`, @`v_affectedRows`);
	SELECT @`v_affectedRows`;

    IF @`v_affectedRows` = 1 THEN
	-- Get rating value
		CALL `getRatingValue` (`p_id`, @`v_ratingValue`);
        
	-- Update review
		UPDATE `reviews`
		SET `rating` = `p_rating`, `review` = `p_review`
		WHERE `id` = `p_id`;

	-- Update total rating
		UPDATE `books`
		SET `totalRating` = `totalRating` - @`v_ratingValue` + `p_rating`
		WHERE `id` = `p_bookId`;
		
	-- Update average rating
		UPDATE `books`
		SET `averageRating` = `totalRating` / `ratingCtr`
		WHERE `id` = `p_bookId`;
    END IF;
END;

CREATE PROCEDURE `deleteReview`(
	IN `p_id` VARCHAR(48),
    IN `p_bookId` VARCHAR(48)
)
BEGIN
-- Check if book review exists
	CALL `checkIfReviewExists` (`p_id`, `p_bookId`, @`v_affectedRows`);
	SELECT @`v_affectedRows`;

    IF @`v_affectedRows` = 1 THEN
	-- Get rating value
		CALL `getRatingValue` (`p_id`, @`v_ratingValue`);
-- 		SELECT @`v_ratingValue`;

	-- Delete review
		DELETE FROM `reviews`
		WHERE `id` = `p_id` AND `bookId` = `p_bookId`;

	-- Update total rating, rating counter and review counter
		UPDATE `books`
		SET `totalRating` = `totalRating` - @`v_ratingValue`, `ratingCtr` = `ratingCtr` - 1, `reviewCtr` = `reviewCtr` - 1
		WHERE `id` = `p_bookId`;
		
	-- Update average rating
		UPDATE `books`
		SET `averageRating` = `totalRating` / `ratingCtr`
		WHERE `id` = `p_bookId`;
    END IF;
END;

-- COMMENTS

CREATE TABLE `comments` (
    `id` VARCHAR(48) NOT NULL PRIMARY KEY,
    `comment` TEXT NOT NULL,
    `createdAt` TIMESTAMP NOT NULL,
    `bookId` VARCHAR(48) NOT NULL,
    `reviewId` VARCHAR(48) NOT NULL,
    `userId` VARCHAR(48) NOT NULL,
    FOREIGN KEY (`bookId`)
        REFERENCES `books`(`id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`reviewId`)
        REFERENCES `reviews`(`id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`userId`)
        REFERENCES `users`(`id`)
        ON DELETE CASCADE
);

CREATE PROCEDURE `getAllComments`(
	IN `p_reviewId` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `comments`
    WHERE `reviewId` = `p_reviewId`;
END;

CREATE PROCEDURE `getComment`(
	IN `p_id` VARCHAR(48)
)
BEGIN
	SELECT *  FROM `comments`
    WHERE `id` = `p_id`;
END;

CREATE PROCEDURE `postComment`(
    IN `p_id` VARCHAR(48),
    IN `p_comment` TEXT,
    IN `p_bookId` VARCHAR(48),
    IN `p_reviewId` VARCHAR(48),
    IN `p_userId` VARCHAR(48)
)
BEGIN
-- Check if comment exists
	CALL `checkIfReviewExists` (`p_reviewId`, `p_bookId`, @`v_affectedRows`);
	SELECT @`v_affectedRows`;

	IF @`v_affectedRows` = 1 THEN
		-- 	Insert review
		INSERT INTO `comments` (`id`, `comment`, `createdAt`, `bookId`, `reviewId`, `userId`)
		VALUES (`p_id`, `p_comment`, NOW(), `p_bookId`, `p_reviewId`, `p_userId`);
    END IF;
END;

CREATE PROCEDURE `checkIfCommentExists`(
	IN `p_id` VARCHAR(48),
    IN `p_bookId` VARCHAR(48),
	IN `p_reviewId` VARCHAR(48),
    IN `p_userId` VARCHAR(48),
    OUT `v_affectedRows` INT
)
BEGIN
	SELECT COUNT(*) INTO `v_affectedRows` FROM `comments`
    WHERE `id` = `p_id` AND `bookId` = `p_bookId` AND `reviewId` = `p_reviewId` AND `userId` = `p_userId`;
END;

CREATE PROCEDURE `putComment`(
    IN `p_id` VARCHAR(48),
    IN `p_comment` TEXT,
    IN `p_bookId` VARCHAR(48),
    IN `p_reviewId` VARCHAR(48),
    IN `p_userId` VARCHAR(48)
)
BEGIN
-- Check if comment exists
	CALL `checkIfCommentExists` (`p_id`, `p_bookId`, `p_reviewId`, `p_userId`, @`v_affectedRows`);
	SELECT @`v_affectedRows`;

	IF @`v_affectedRows` = 1 THEN
		-- 	Update comment
        UPDATE `comments`
		SET `comment` = `p_comment`
		WHERE `id` = `p_id`;
    END IF;
END;

CREATE PROCEDURE `deleteComment`(
    IN `p_id` VARCHAR(48),
    IN `p_bookId` VARCHAR(48),
    IN `p_reviewId` VARCHAR(48),
    IN `p_userId` VARCHAR(48)
)
BEGIN
-- Check if comment exists
	CALL `checkIfCommentExists` (`p_id`, `p_bookId`, `p_reviewId`, `p_userId`, @`v_affectedRows`);
	SELECT @`v_affectedRows`;

	IF @`v_affectedRows` = 1 THEN
		-- 	Delete comment
        DELETE FROM `comments`
		WHERE `id` = `p_id`;
    END IF;
END;