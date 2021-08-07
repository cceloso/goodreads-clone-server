-- USERS

CREATE TABLE `users` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` CHAR(60) NOT NULL,
    `dateCreated` TIMESTAMP NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL
);

CREATE TABLE `users_indexed` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) UNIQUE NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` CHAR(60) NOT NULL,
    `dateCreated` TIMESTAMP NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_userName ON `users_indexed` (`userName`);
CREATE INDEX idx_userName_email ON `users_indexed` (`userName`, `email`);


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
	
    INSERT INTO `users_indexed` (`firstName`, `lastName`, `userName`, `email`, `password`, `dateCreated`, `imageUrl`, `role`)
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
    `published` YEAR NOT NULL,
    `description` TEXT NOT NULL,
    `genres` JSON NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `totalRating` FLOAT(10, 2) NOT NULL,
    `averageRating` FLOAT(3, 2) NOT NULL,
    `ratingCtr` INT NOT NULL,
    CONSTRAINT `titleAndAuthor` UNIQUE(`title`, `author`)
);

CREATE TABLE `books_indexed` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `isbn` VARCHAR(255) NOT NULL,
    `publisher` VARCHAR(255) NOT NULL,
    `published` YEAR NOT NULL,
    `description` TEXT NOT NULL,
    `genres` JSON NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `totalRating` FLOAT(10, 2) NOT NULL,
    `averageRating` FLOAT(3, 2) NOT NULL,
    `ratingCtr` INT NOT NULL,
    CONSTRAINT `titleAndAuthor` UNIQUE(`title`, `author`)
);

CREATE INDEX idx_title ON `books_indexed` (`title`);
CREATE INDEX idx_author_title ON `books_indexed` (`author`, `title`);

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

CREATE PROCEDURE `postBook`(
	IN `p_title` VARCHAR(255),
    IN `p_author` VARCHAR(255),
    IN `p_isbn` VARCHAR(255),
    IN `p_publisher` VARCHAR(255),
    IN `p_published` YEAR,
    IN `p_description` TEXT,
    IN `p_genres` JSON,
    IN `p_imageUrl` VARCHAR(255)
)
BEGIN
	INSERT INTO `books` (`title`, `author`, `isbn`, `publisher`, `published`, `description`, `genres`, `imageUrl`, `totalRating`, `averageRating`, `ratingCtr`)
    VALUES (`p_title`, `p_author`, `p_isbn`, `p_publisher`, `p_published`, `p_description`, `p_genres`, `p_imageUrl`, 0, 0, 0);

    INSERT INTO `books_indexed` (`title`, `author`, `isbn`, `publisher`, `published`, `description`, `genres`, `imageUrl`, `totalRating`, `averageRating`, `ratingCtr`)
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
    IN `p_published` YEAR,
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


-- GENRES NEW

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


-- REVIEW NEW

CREATE TABLE `reviews` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `rating` FLOAT(3, 2) NOT NULL,
    `review` TEXT NOT NULL,
    `dateCreated` DATE NOT NULL,
    `bookId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    CONSTRAINT `bookAndUser` UNIQUE(`bookId`, `userId`)
);

CREATE TABLE `reviews_indexed` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `rating` FLOAT(3, 2) NOT NULL,
    `review` TEXT NOT NULL,
    `dateCreated` DATE NOT NULL,
    `bookId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    CONSTRAINT `bookAndUser` UNIQUE(`bookId`, `userId`)
);

CREATE INDEX idx_bookId ON `reviews_indexed` (`bookId`);
CREATE INDEX idx_userId ON `reviews_indexed` (`userId`);
CREATE INDEX idx_bookId_userId ON `reviews_indexed` (`bookId`, `userId`);

CREATE PROCEDURE `getReviews`(
	IN `p_bookId` INT
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `bookId` = `p_bookId`;
END;

CREATE PROCEDURE `getReviewsByUser`(
    IN `p_userId` INT
)
BEGIN
	SELECT *  FROM `reviews`
    WHERE `userId` = `p_userId`;
END;

CREATE PROCEDURE `postReview`(
    IN `p_rating` FLOAT(3, 2),
    IN `p_review` TEXT,
    IN `p_bookId` INT,
    IN `p_userId` INT,
    IN `p_userName` VARCHAR(255)
)
BEGIN
	INSERT INTO `reviews` (`rating`, `review`, `dateCreated`, `bookId`, `userId`, `userName`)
    VALUES (`p_rating`, `p_review`, CURDATE(), `p_bookId`, `p_userId`, `p_userName`);

	INSERT INTO `reviews_indexed` (`rating`, `review`, `dateCreated`, `bookId`, `userId`, `userName`)
    VALUES (`p_rating`, `p_review`, CURDATE(), `p_bookId`, `p_userId`, `p_userName`);

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


-- COMMENTS NEW

CREATE TABLE `comments` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `comment` TEXT NOT NULL,
    `dateCreated` TIMESTAMP NOT NULL,
    `bookId` INT NOT NULL,
    `reviewId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL
);

CREATE TABLE `comments_indexed` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `comment` TEXT NOT NULL,
    `dateCreated` TIMESTAMP NOT NULL,
    `bookId` INT NOT NULL,
    `reviewId` INT NOT NULL,
    `userId` INT NOT NULL,
    `userName` VARCHAR(255) NOT NULL
);

CREATE INDEX idx_reviewId ON `comments_indexed` (`reviewId`);

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
    WHERE `reviewId` = `p_reviewId`;
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

    INSERT INTO `comments_indexed` (`comment`, `dateCreated`, `bookId`, `reviewId`, `userId`, `userName`)
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


-- SEED BOOKS

CALL `postBook`("1984", "George Orwell", "B003JTHWKU", "Secker & Warburg", 1949, "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell's nightmarish vision of a totalitarian, bureaucratic world and one poor stiff's attempt to find individuality. The brilliance of the novel is Orwell's prescience of modern life—the ubiquity of television, the distortion of the language—and his ability to construct such a thorough version of hell. Required reading for students since it was published, it ranks among the most terrifying novels ever written.", '["classics", "fiction", "science-fiction", "literature", "novels", "politics", "fantasy", "adult"]', "./1984.png");
CALL `postBook`("The Giver", "Lois Lowry", "0385732554", "Houghton Mifflin", 1993, "The Giver, the 1994 Newbery Medal winner, has become one of the most influential novels of our time. The haunting story centers on twelve-year-old Jonas, who lives in a seemingly ideal, if colorless, world of conformity and contentment. Not until he is given his life assignment as the Receiver of Memory does he begin to understand the dark, complex secrets behind his fragile community. This movie tie-in edition features cover art from the movie and exclusive Q&A with members of the cast, including Taylor Swift, Brenton Thwaites and Cameron Monaghan.", '["young-adult", "fiction", "classics", "science-fiction", "fantasy", "children''s"]', "./the_giver.png");
CALL `postBook`("The Alchemist", "Paulo Coelho", "0062315005", "Harper One", 1988, "Paulo Coelho's enchanting novel has inspired a devoted following around the world. This story, dazzling in its powerful simplicity and soul-stirring wisdom, is about an Andalusian shepherd boy named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure buried near the Pyramids. Along the way he meets a Gypsy woman, a man who calls himself king, and an alchemist, all of whom point Santiago in the direction of his quest. No one knows what the treasure is, or if Santiago will be able to surmount the obstacles in his path. But what starts out as a journey to find worldly goods turns into a discovery of the treasure found within. Lush, evocative, and deeply humane, the story of Santiago is an eternal testament to the transforming power of our dreams and the importance of listening to our hearts.", '["fiction", "classics", "fantasy", "philosophy", "novels", "spirituality", "self-help", "literature", "adventure", "inspirational"]', "./The_Alchemist.jpg");
CALL `postBook`("Divergent", "Veronica Roth", "0062024035", "Katherine Tegen Books", 2012, "In Beatrice Prior's dystopian Chicago world, society is divided into five factions, each dedicated to the cultivation of a particular virtue—Candor (the honest), Abnegation (the selfless), Dauntless (the brave), Amity (the peaceful), and Erudite (the intelligent). On an appointed day of every year, all sixteen-year-olds must select the faction to which they will devote the rest of their lives. For Beatrice, the decision is between staying with her family and being who she really is—she can't have both. So she makes a choice that surprises everyone, including herself.\nDuring the highly competitive initiation that follows, Beatrice renames herself Tris and struggles alongside her fellow initiates to live out the choice they have made. Together they must undergo extreme physical tests of endurance and intense psychological simulations, some with devastating consequences. As initiation transforms them all, Tris must determine who her friends really are—and where, exactly, a romance with a sometimes fascinating, sometimes exasperating boy fits into the life she's chosen. But Tris also has a secret, one she's kept hidden from everyone because she's been warned it can mean death. And as she discovers unrest and growing conflict that threaten to unravel her seemingly perfect society, she also learns that her secret might help her save those she loves . . . or it might destroy her.", '["young-adult", "science-fiction", "fiction", "fantasy", "romance", "apocalyptic", "action", "adventure"]', "./Divergent.jpg");
CALL `postBook`("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "1234", "Scholastic Inc", 1997, "Harry Potter's life is miserable. His parents are dead and he's stuck with his heartless relatives, who force him to live in a tiny closet under the stairs. But his fortune changes when he receives a letter that tells him the truth about himself: he's a wizard. A mysterious visitor rescues him from his relatives and takes him to his new home, Hogwarts School of Witchcraft and Wizardry.\n\nAfter a lifetime of bottling up his magical powers, Harry finally feels like a normal kid. But even within the Wizarding community, he is special. He is the boy who lived: the only person to have ever survived a killing curse inflicted by the evil Lord Voldemort, who launched a brutal takeover of the Wizarding world, only to vanish after failing to kill Harry.\n\nThough Harry's first year at Hogwarts is the best of his life, not everything is perfect. There is a dangerous secret object hidden within the castle walls, and Harry believes it's his responsibility to prevent it from falling into evil hands. But doing so will bring him into contact with forces more terrifying than he ever could have imagined.\n\nFull of sympathetic characters, wildly imaginative situations, and countless exciting details, the first installment in the series assembles an unforgettable magical world and sets the stage for many high-stakes adventures to come.", '["fantasy", "fiction", "young-adult", "children''s", "adventure", "classics"]', "./Harry_Potter_and_the_Sorcerer_s_Stone.jpg");
CALL `postBook`("The Lightning Thief", "Rick Riordan", "0786838655", "Disney Hyperion Books", 2005, "Percy Jackson is a good kid, but he can't seem to focus on his schoolwork or control his temper. And lately, being away at boarding school is only getting worse - Percy could have sworn his pre-algebra teacher turned into a monster and tried to kill him. When Percy's mom finds out, she knows it's time that he knew the truth about where he came from, and that he go to the one place he'll be safe. She sends Percy to Camp Half Blood, a summer camp for demigods (on Long Island), where he learns that the father he never knew is Poseidon, God of the Sea. Soon a mystery unfolds and together with his friends—one a satyr and the other the demigod daughter of Athena - Percy sets out on a quest across the United States to reach the gates of the Underworld (located in a recording studio in Hollywood) and prevent a catastrophic war between the gods.", '["fantasy", "young-adult", "fiction", "children''s", "adventure", "mythology"]', "./The_Lightning_Thief.jpg");
CALL `postBook`("The Hunger Games", "Suzanne Collins", "0439023483", "Scholastic Press", 2008, "In the ruins of a place once known as North America lies the nation of Panem, a shining Capitol surrounded by twelve outlying districts. The Capitol is harsh and cruel and keeps the districts in line by forcing them all to send one boy and one girl between the ages of twelve and eighteen to participate in the annual Hunger Games, a fight to the death on live TV. \\n Sixteen-year-old Katniss Everdeen, who lives alone with her mother and younger sister, regards it as a death sentence when she steps forward to take her sister's place in the Games. But Katniss has been close to dead before—and survival, for her, is second nature. Without really meaning to, she becomes a contender. But if she is to win, she will have to start making choices that weight survival against humanity and life against love.", '["young-adult", "fiction", "science-fiction", "fantasy", "romance", "adventure", "apocalyptic", "action"]', "./The_Hunger_Games.jpg");
CALL `postBook`("Pride and Prejudice", "Jane Austen", "1234", "Modern Library", 2000, "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work 'her own darling child' and its vivacious heroine, Elizabeth Bennet, 'as delightful a creature as ever appeared in print.' The romantic clash between the opinionated Elizabeth and her proud beau, Mr. Darcy, is a splendid performance of civilized sparring. And Jane Austen's radiant wit sparkles as her characters dance a delicate quadrille of flirtation and intrigue, making this book the most superb comedy of manners of Regency England.", '["classics", "fiction", "romance", "historical", "literature", "novels", "adult"]', "./Pride_and_Prejudice.jpg");
