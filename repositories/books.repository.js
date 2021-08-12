const knex = require('./knex');
const redis = require('./redis');

const addOrEditBookOnRedis = (bookObject) => {
    const genresStr = JSON.parse(bookObject.genres).join(',');

    const redisObject = {
        id: bookObject.id,
        title: bookObject.title,
        author: bookObject.author,
        isbn: bookObject.isbn,
        publisher: bookObject.publisher,
        published: bookObject.published,
        description: bookObject.description,
        genres: genresStr,
        imageUrl: bookObject.imageUrl,
        totalRating: bookObject.totalRating,
        averageRating: bookObject.averageRating,
        ratingCtr: bookObject.ratingCtr
    };
    
    redis.hmset(`books:${bookObject.id}`, redisObject);
};

const booksRepo = {
    getBook: (bookId) => {
        return redis.hgetall(`books:${bookId}`);
    },

    getBooks: () => {
        return knex.raw("CALL getBooks()");
    },

    getBooksByAuthor: (author) => {
        return knex.raw("CALL getBooksByAuthor(?)", [author]);
    },

    getBooksByGenre: (genreId) => {
        return knex.raw("CALL getBooksByGenre(?)", [JSON.stringify(genreId)]);
    },

    searchBooksByTitleOrAuthor: (searchParam) => {
        return knex.raw("CALL searchBooksByTitleOrAuthor(?)", [searchParam]);
    },

    getTitleAndAuthor: (bookId) => {
        return knex.raw("CALL getTitleAndAuthor(?)", [bookId]);
    },

    addBook: (newBook) => {
        return knex.raw("CALL postBook(?, ?, ?, ?, ?, ?, ?, ?)", [newBook.title, newBook.author, newBook.isbn, newBook.publisher, newBook.published, newBook.description, JSON.stringify(newBook.genres), newBook.imageUrl])
        .then((val) => {
            const bookObject = val[0][0][0];
            addOrEditBookOnRedis(bookObject);
        })
    },

    editBook: (bookId, updatedBook) => {
        return knex.raw("CALL putBook(?, ?, ?, ?, ?, ?, ?, ?, ?)", [bookId, updatedBook.title, updatedBook.author, updatedBook.isbn, updatedBook.publisher, updatedBook.published, updatedBook.description, JSON.stringify(updatedBook.genres), updatedBook.imageUrl])
        .then((val) => {
            const bookObject = val[0][0][0];
            addOrEditBookOnRedis(bookObject);
        })
    },

    deleteBook: (bookId) => {
        return knex.raw("CALL deleteBook(?)", [bookId])
        .then(() => redis.del(`books:${bookId}`));
    },
};

module.exports = booksRepo;