const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "goodreads_mysql",
        user : "root",
        password : "password",
        database : "mydb",
        port: 3306
    }
});

module.exports = knex;