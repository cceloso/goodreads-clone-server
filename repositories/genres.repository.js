const knex = require('./knex');

const genresRepo = {
    getGenre: (genre) => {
        return knex.raw("CALL getGenre(?)", [genre]);
    },

    getGenres: () => {
        return knex.raw("CALL getGenres()");
    }
};

module.exports = genresRepo;