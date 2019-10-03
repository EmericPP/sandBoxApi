require("@babel/register");

import uuidv4 from 'uuid/v4'
import config from "../config";


let db

module.exports = (_db) => {
    db = _db
    return Tasks
}

class Tasks {
    static getAll(max, todolistId) {
        return new Promise((resolve, reject) => {
            const sqlStringWithTodolistId = todolistId ? `WHERE todolistId = ${db.escape(todolistId)}` : ''
            if (max) {
                if(max <= 0 || isNaN(max)) {
                    reject(config.errors.wrongMaxValue)
                } else {
                    db.query(`SELECT * FROM tasks ${sqlStringWithTodolistId} ORDER BY indexNum DESC LIMIT 0, ?`, [parseInt(max)])
                        .then( (results) => resolve(results))
                        .catch((err) => reject(err.message))
                }
            } else {
                db.query(`SELECT * FROM tasks ${sqlStringWithTodolistId} ORDER BY indexNum DESC`)
                    .then( (results) => resolve(results))
                    .catch((err) => reject(err.message))
            }
        })
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM tasks WHERE id = ?', [id])
                .then((results) => {(results.length < 1)
                        ? reject(config.errors.idIsMissing)
                        : resolve(results[0])
                })
                .catch((err) => reject(err.message))
        })
    }

    static add(title, todoListId) {
        return new Promise((resolve, reject) => {
            //verifier si les données sont au bon format
            if (!title || title.trim() === '') {
                return reject(config.errors.titleIsMissing)
            } else {
                title = title.trim()
                const uuid = uuidv4()
                const searchTaskWithTitle = () => db.query('SELECT * FROM tasks WHERE title = ?', [title])
                const searchIfTodolistExist = () => db.query('SELECT * FROM todolists WHERE id = ?', [todoListId])
                const insertInTasks = () => db.query('INSERT INTO tasks(id, title, todolistId, isChecked) VALUES(?, ?, ?, ?)', [uuid, title, todoListId, 0])
                const getTask = () => db.query('SELECT * FROM tasks WHERE title = ?', [title])

                return (async function() {
                    try {
                        const tasksWithSameTitle = await searchTaskWithTitle();
                        if(tasksWithSameTitle.length >= 1) return reject(config.errors.sameTitle)
                        const todolistIds = await searchIfTodolistExist();
                        if(todolistIds.length < 1) return reject('todolist doesnt exist')
                        await insertInTasks();
                        const results = await getTask();
                        return resolve(results[0]);
                    } catch (e) {
                        return reject(e.message)
                    }
                })()
            }
        })
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
        const checkIdExist = () => db.query('SELECT * FROM tasks WHERE id = ?', [id])
        const deleteTask = () => db.query('DELETE FROM tasks WHERE id = ?', [id])

        return (async function() {
            try {
                const tasksWithId = await checkIdExist()
                if (tasksWithId.length < 1) return reject(config.errors.idIsMissing)
                await deleteTask()
                return resolve(`${id} ${config.success.delete}`)
            } catch(e) {
                return reject(e.message)
            }
        })()
    })}

    static update(id, {title, todolistId, isChecked}) {
        return new Promise((resolve, reject) => {


            // Functions in order to update task
            const updateTask = (id, params) => {
                // Build SetSqlString with optionals parameters (title, boolean, todolistId)
                let setSqlQtring = '', paramsKeys = Object.entries(params)
                for (let i = 0; i < paramsKeys.length; i++) {
                    setSqlQtring += `${paramsKeys[i][0]} = ${db.escape(paramsKeys[i][1])}${i < paramsKeys.length - 1 ? ', ' : ''}`
                }
                return db.query(`UPDATE tasks SET ${setSqlQtring} WHERE id = ?`, [id])
            }
            const getUpdatedTask = async function(params) {
                try {
                    await updateTask(id, params)
                    const updatedTask = db.query('SELECT * FROM tasks WHERE id = ? ', [id])
                    resolve(updatedTask)
                } catch(e) {
                    return reject(e.message)
                }
            }


            // Verify integrity of params with bdd and call updateTask function
            const checkIdExist = () => db.query('SELECT * FROM tasks WHERE id = ?', [id])
            const getTitle = () => db.query('SELECT * FROM tasks WHERE id != ? AND title = ?', [id, title.trim()])
            const getTodolist = () => db.query('SELECT id FROM todolists WHERE id = ? ', [todolistId])
            return (async function() {
                try {
                    const results = await checkIdExist()
                    if(results.length < 1) return reject(config.errors.idIsMissing)

                    let params = {}
                    if (title) {
                        const titleWithSameName = await getTitle();
                        if(titleWithSameName.length > 0) return reject('name already exist')
                        params = {...params, title}
                    }

                    if (todolistId) {
                        const todolist = await getTodolist()
                        if(todolist.length < 1) return reject('todolist doesnt exist')
                        params = {...params, todolistId}
                    }

                    if (isChecked !== undefined) {
                        if (typeof isChecked !== 'boolean') return reject('isChecked nest pas un booleen')
                        params = {...params, isChecked}
                    }

                    if (title === undefined && todolistId === undefined && isChecked === undefined) {
                        return reject('le body est vide')
                    }
                    return getUpdatedTask(params);
                } catch (e) {
                    return reject(e.message)
                }
            })()
        })}



}