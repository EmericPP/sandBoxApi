require("@babel/register");
import express from 'express'
import {success, error} from '../utils/response'


let Tasks

module.exports = (_db) => {
    Tasks = require('../classes/Tasks')(_db)
    return router
}

const router = express.Router()

/**
 * @route GET /tasks
 * @group Tasks - Operations about tasks
 * @param {string} max.query
 */

/**
 * @route POST /tasks
 * @group Tasks - Operations about tasks
 * @param {string} title.body.required
 * @param {string} todolistId.body.required
 */

router.route('/')
    .get((req, res) => {
        Tasks.getAll(req.query.max, req.query.todolistId)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err)))
    })
    .post((req, res) => {
        Tasks.add(req.body.title, req.body.todolistId)
            .then((results) => res.json(success(results)))
            .catch((err) => res.status(400).json(error(err)))
    })



/**
 * @route DELETE /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required
 */

/**
 * @route GET /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required
 */

/**
 * @typedef Body
 * @property {string} title
 * @property {boolean} isChecked
 * @property {string} todolistId
 */
/**
 * @route PUT /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required
 * @param {Body.model} body.body.required
 */

router.route('/:task_id')
    .put((req, res) => {
        Tasks.update(req.params.task_id, req.body)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err, 400)))
    })

    .delete((req, res) => {
        Tasks.delete(req.params.task_id)
            .then(() => res.json(success(`${req.params.task_id} a bien été supprimée`)))
            .catch((err) => res.json(error(err)))
    })

    .get((req, res) => {
        Tasks.getById(req.params.task_id)
            .then((results) => res.json(success(results)))
            .catch((err) => res.json(error(err)))
    })
