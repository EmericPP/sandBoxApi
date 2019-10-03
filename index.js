const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const config = require("./assets/config")
const mysql = require('promise-mysql')

const app = express()
const expressSwagger = require('express-swagger-generator')(app);
let options = {
    swaggerDefinition: {
        info: {
            title: 'SandBoxAPI',
        },
        host: 'localhost:3000',
        basePath: '/api/v1',
        produces: [
            "application/json",
            "application/xml"
        ],
    },
    basedir: __dirname, //app absolute path
    files: ['./assets/routes/todolists.js', './assets/routes/tasks.js'], //Path to the API handle folder
};
expressSwagger(options)


mysql.createConnection({
    host     : config.db.host,
    database : config.db.database,
    user     : config.db.user,
    password : config.db.password
}).then((db) => {
    console.log('connected')
    // dès qu'une requête de type options est envoyé à une url de l'api
    // le serveur répond qu'il accepte les méthodes GET, PUT, POST, DELETE et OPTIONS
    app.use(function(request, response, next) {
        response.header("Access-Control-Allow-Origin", "*");
        response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(morgan('dev'))
/*
    app.use(config.rootAPI + 'users', users);
*/
    app.use(config.rootAPI + 'todolists', require('./assets/routes/todolists')(db))
    app.use(config.rootAPI + 'tasks', require('./assets/routes/tasks')(db))
    app.use((req, res, next) => {
        res.status(404).send('Oh page not found !')
    });
    app.listen(config.port, 'localhost', () => console.log('Server is running'));

}).catch((err) => {
    console.log('error connecting : ' + err.stack)
})


