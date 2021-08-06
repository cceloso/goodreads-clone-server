const knex = require('./knex');

const genresRepo = {
    getGenres: () => {
        return knex.raw("CALL getGenres()");
    }
};

module.exports = genresRepo;