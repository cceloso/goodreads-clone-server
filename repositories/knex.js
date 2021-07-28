const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : "db_server",
        user : "root",
        password : "password",
        database : "mydb",
        port: 3306
    }
});

module.exports = knex;