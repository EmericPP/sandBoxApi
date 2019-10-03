require("@babel/register");
import express from 'express'
import {success, error} from '../utils/response'


let Todolists

module.exports = (_db) => {
    Todolists = require('../classes/Todolists')(_db)
    return router
}

const router = express.Router()

/**
 * @route GET /todolists
 * @group Todolists - Operations about todolists
 * @param {string} max.query
 */

/**
 * @route POST /todolists
 * @group Todolists - Operations about todolists
 * @param {string} title.body.required
 */

router.route('/')
    .get((req, res) => {
        Todolists.getAll(req.query.max)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err)))
    })
    .post((req, res) => {
        Todolists.addTodolist(req.body.title)
            .then((results) => res.json(success(results)))
            .catch((err) => res.status(400).json(error(err)))
    })



/**
 * @route DELETE /todolists/{id}
 * @group Todolists - Operations about todolists
 * @param {string} id.path.required
 */


/**
 * @route GET /todolists/{id}
 * @group Todolists - Operations about todolists
 * @param {string} id.path.required
 */

/**
 * @route PUT /todolists/{id}
 * @group Todolists - Operations about todolists
 * @param {string} id.path.required
 * @param {string} title.body.required
 */

router.route('/:todolist_id')
    .put((req, res) => {
        Todolists.updateTitle(req.params.todolist_id, req.body.title)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err, 400)))
    })

    .delete((req, res, next) => {
        Todolists.delete(req.params.todolist_id)
            .then((results) => res.json(success(`${req.params.todolist_id} a bien été supprimée`)))
            .catch((err) => res.json(error(err)))
    })

    .get((req, res) => {
        Todolists.getById(req.params.todolist_id)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err)))
    })
