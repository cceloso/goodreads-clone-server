const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "localhost",
        user : "root",
        password : "password",
        database : "mydb",
        port: 3306
    }
});

module.exports = knex;