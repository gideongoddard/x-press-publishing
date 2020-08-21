const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const seriesRouter = express.Router();

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE id = $seriesId';
    const values = {$seriesId: seriesId};
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.series = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({series: rows});
        }
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
})

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = `INSERT INTO Series (name, description)
    VALUES ($name, $description)`;
    const values = {
        $name: name,
        $description: description
    };

    if (!name || !description) {
        return res.sendStatus(400);
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        }
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, row) => {
            if (err) {
                next(err);
            } else {
                res.status(201).json({series: row});
            }
        })
    })
})

module.exports = seriesRouter;