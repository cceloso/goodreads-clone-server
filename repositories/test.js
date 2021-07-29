const knex = require('../controllers/knex');
const { nanoid } = require('nanoid');

let bookId = "VKHMmhWu7g11J0VkhGVZi";
let genreId = nanoid();
let genreName = "adventure";

knex.raw("CALL postBookGenre(?, ?, ?)", [bookId, genreId, genreName])
    .then((ret) => {
        console.log("Returned value:");
		console.log(ret[0][1].affectedRows);
        const result = ret[0][0];
        if(result.length != 0) {
            console.log(result);
        } else {
            console.log("No books with that genre");
        }
    })
    .catch((err) => {
		console.log(err);
        console.log(`Error code: ${err.code}`);
        console.log(`Error message: ${err.sqlMessage}`);
        // throw err;
    })
    .finally(() => {
        knex.destroy();
    });