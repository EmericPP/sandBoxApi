import uuidv4 from 'uuid/v4'
import config from "../config";


let db

module.exports = (_db) => {
    db = _db
    return Todolists
}

class Todolists {
    static getAll(max) {
        return new Promise((resolve, reject) => {
            if (max) {
                if(max <= 0 || isNaN(max)) {
                    reject(config.errors.wrongMaxValue)
                } else {
                    db.query(`SELECT * FROM todolists ORDER BY indexNum DESC LIMIT 0, ?`, [parseInt(max)])
                        .then( (results) => resolve(results))
                        .catch((err) => reject(err.message))
                }
            } else {
                db.query('SELECT * FROM todolists ORDER BY indexNum DESC')
                    .then( (results) => resolve(results))
                    .catch((err) => reject(err.message))
            }
        })
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM todolists WHERE id = ?', [id])
                .then((results) => {(results.length < 1)
                        ? reject(config.errors.idIsMissing)
                        : resolve(results[0])
                })
                .catch((err) => reject(err.message))
        })
    }

    static addTodolist(title) {
        return new Promise((resolve, reject) => {
            //verifier si les données sont au bon format
            if (!title || title.trim() === '') {
                return reject(config.errors.titleIsMissing)
            } else {
                title = title.trim()
                const uuid = uuidv4()
                db.query('SELECT * FROM todolists WHERE title = ?', [title])
                    .then((results) => {
                        if(results.length >= 1) {
                            return reject(config.errors.sameTitle)
                        } else {
                            return db.query('INSERT INTO todolists(id, title) VALUES(?, ?)', [uuid, title])

                        }
                    })
                    .then( () => {
                        return db.query('SELECT * FROM todolists WHERE title = ?', [title])
                    })
                    .then((results) => resolve(results))
                    .catch((err) => reject(err.message))


            }
        })
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM todolists WHERE id = ?', [id])
                .then((results) => {
                    return (results.length < 1)
                    ? reject(config.errors.idIsMissing)
                    : db.query('DELETE FROM todolists WHERE id = ?', [id])})
                .then( (err, results) => {
                    resolve(`${id} ${config.success.delete}`)
                })
                .catch((err) => reject(err.message))
    })}

    static updateTitle(id, title) {
        return new Promise((resolve, reject) => {
            if (!title || title.trim() === '')           {
                return reject(config.errors.titleIsMissing)
            }
            title = title.trim()
            db.query('SELECT * FROM todolists WHERE id = ?', [id])
                .then( (results) => {
                    console.log('je passe 0')
                    return results.length < 1
                        ? reject(config.errors.idIsMissing)
                        : db.query('SELECT * FROM todolists WHERE id != ? AND title = ?', [id, title])
                })
                .then((results) => {
                    console.log('je passe 1', results)
                    return results.length > 0
                        ? reject(config.errors.sameTitle)
                        : db.query('UPDATE todolists SET title = ? WHERE id = ?', [title, id])

                })
                .then( () => {
                    console.log('je passe 2')
                    return db.query('SELECT * FROM todolists WHERE id = ?', [id])

                })
                .then( (results) => {
                    console.log('je passe 3')
                    resolve(results)
                })
                .catch((err) => reject(err.message))
        })}
}