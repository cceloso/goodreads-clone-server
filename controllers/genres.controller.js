const responsesController = require('./responses.controller');
const genresRepo = require('../repositories/genres.repository');
const { nanoid } = require('nanoid');

const controller = {
    getGenres: (req, res) => {
        genresRepo.getGenres()
        .then((val) => {
            let genres = val[0][0];
            res.status(200).json(genres);
            resolve(genres);
        })
        .catch((err) => {
            errorCode = 500;
            res.status(500).json(responsesController.createErrorMessage(500, "Server-side error.", "ERROR"));
        });
    }
};

module.exports = controller;