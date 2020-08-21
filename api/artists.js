const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const artistsRouter = express.Router();

artistsRouter.param('artistId', (req, res, next, artistId) => {
    const sql = 'SELECT * FROM Artist WHERE id = $artistId';
    const values = {$artistId: artistId};
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: rows});
        }
    })
})

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
})

artistsRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
    VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    }

    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        }
        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, row) => {
            if (err) {
                next(err);
            } else {
                res.status(201).json({artist: row});
            }
        });
    });
})

artistsRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    const sql = `UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId`;
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    }

    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({artist: row});
                }
            });
        }
    });
})

artistsRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId';
    const values = {$artistId: req.params.artistId};

    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({artist: row});
                }
            })
        }
    })
})

module.exports = artistsRouter;