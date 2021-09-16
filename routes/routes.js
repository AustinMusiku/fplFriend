const express = require('express');

const router = express.Router();

const { 
    getFixtures,
    getPlayerEventsById,
    getPlayerDataById,
    getAllPlayers,
    getAllTeams,
    getPlayersByTeam,
    whatGameweek } = require('../controllers/fetchControllers')

// GET ROUTES
// get pages
router.get('/', (req, res) => res.render('pages/home'))
router.get('/transfers', (req, res) => res.render('pages/transfers'))
router.get('/captains', (req, res) => res.render('pages/captains'))
router.get('/differentials', (req, res) => res.render('pages/differentials'))

// get fixtures
router.get('/fixturesData', async (req, res) => { res.json(await getFixtures()) });

// get all players
router.get('/players', async (req, res) => { res.json(await getAllPlayers()) });

// get all teams info
router.get('/teams', async (req, res) => { res.json(await getAllTeams()) });

// get player info
router.get('/player/:id', async (req, res) => { res.json(await getPlayerDataById(req.params.id)) });

// get player events ( fixtures, history, etc )
router.get('/playerEvents/:id', async (req, res) => { res.json(await getPlayerEventsById(req.params.id)) });

// get players in team X
router.get('/playersin/:id', async (req, res) => { res.json(await getPlayersByTeam(req.params.id)) });

// get current gameweek
router.get('/whatgw', async (req, res) => { res.json(await whatGameweek()) });

module.exports = router;