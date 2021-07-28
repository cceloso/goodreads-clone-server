const knex = require('./knex');
const { nanoid } = require('nanoid');

const genresRepo = {
    getAllGenres: () => {
        return knex.raw("CALL getAllGenres()")
        .finally(() => knex.destroy);
    },

    getGenre: (genreId) => {
        return knex.raw("CALL getGenre(?)", [genreId])
        .finally(() => knex.destroy);
    },

    getGenreByName: (name) => {
        return knex.raw("CALL getGenreByName(?)", [name])
        .finally(() => knex.destroy);
    },

    addGenre: (genreId, newGenre) => {
        console.log(newGenre);
        return knex.raw("CALL postGenre(?, ?)", [genreId, newGenre.name])
        .finally(() => knex.destroy);
    },

    editGenre: (genreId, updatedGenre) => {
        console.log(genreId);
        console.log(updatedGenre);
        return knex.raw("CALL putGenre(?, ?)", [genreId, updatedGenre.name])
        .finally(() => knex.destroy);
    },

    deleteGenre: (genreId) => {
        return knex.raw("CALL deleteGenre(?)", [genreId])
        .finally(() => knex.destroy);
    },
};

module.exports = genresRepo;