module.exports = (socket) => {
    const responsesController = require('./responses.controller');
    
    const genresRepo = require('../repositories/genres.repository');

    return {
        getGenres: (req, res) => {
            genresRepo.getGenres()
            .then((val) => {
                let genres = val[0][0];
                responsesController.sendData(res, 200, genres);
            })
            .catch((err) => {
                responsesController.sendError(res, 404, err, "BAD_REQUEST");
            });
        }
    }
}
