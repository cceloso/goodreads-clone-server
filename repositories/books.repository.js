const knex = require('./knex');

const booksRepo = {
    getAllBooks: () => {
        return knex.raw("CALL getAllBooks()")
        .finally(() => knex.destroy);
    },

    getBook: (bookId) => {
        return knex.raw("CALL getBook(?)", [bookId])
        .finally(() => knex.destroy);
    },

    getBooksByGenre: (genreId) => {
        return knex.raw("CALL getBooksByGenre(?)", [genreId])
        .finally(() => knex.destroy);
    },

    getBookGenre: (id) => {
        return knex.raw("CALL getBookGenre(?)", [id])
        .finally(() => knex.destroy);
    },

    postBookGenre: (bookId, genreId, genreName) => {
        return knex.raw("CALL postBookGenre(?, ?, ?)", [bookId, genreId, genreName])
        .finally(() => knex.destroy);
    },

    deleteBookGenre: (bookId, genreName) => {
        return knex.raw("CALL deleteBookGenre(?, ?)", [bookId, genreName])
        .finally(() => knex.destroy);
    },

    getBookGenreIds: (id) => {
        return knex.raw("CALL getBookGenreIds(?)", [id])
        .finally(() => knex.destroy);
    },

    addBook: (bookId, authorId, newBook) => {
        return knex.raw("CALL postBook(?, ?, ?, ?, ?, ?, ?, ?, ?)", [bookId, newBook.title, authorId, newBook.author, newBook.isbn, newBook.publisher, newBook.published, newBook.description, newBook.imageUrl])
        .finally(() => knex.destroy);
    },

    editBook: (bookId, authorId, updatedBook) => {
        console.log(bookId);
        console.log(updatedBook);
        return knex.raw("CALL putBook(?, ?, ?, ?, ?, ?, ?, ?, ?)", [bookId, updatedBook.title, authorId,  updatedBook.author, updatedBook.isbn, updatedBook.publisher, updatedBook.published, updatedBook.description, updatedBook.imageUrl])
        .finally(() => knex.destroy);
    },

    deleteBook: (bookId) => {
        return knex.raw("CALL deleteBook(?)", [bookId])
        .finally(() => knex.destroy);
    },

    postBookAndGenre: (bookId, genreId) => {
        return knex.raw("CALL postBookAndGenre(?, ?)", [bookId, genreId])
        .finally(() => knex.destroy);
    },

    deleteBookAndGenre: (bookId, genreId) => {
        return knex.raw("CALL deleteBookAndGenre(?, ?)", [bookId, genreId])
        .finally(() => knex.destroy);
    }
};

module.exports = booksRepo;