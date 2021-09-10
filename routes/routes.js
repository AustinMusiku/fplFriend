const express = require('express');

const router = express.Router();

const { 
    getFixtures,
    getPlayerEventsById,
    getPlayerDataById,
    getAllPlayers,
    getAllTeams,
    getPlayersByTeam } = require('../controllers/fetchControllers')

// GET ROUTES
//
router.get('/', (req, res) => {
    res.render('pages/home')
})

// get fixtures
router.get('/fixtures', async (req, res) => { res.json(await getFixtures()) });

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

module.exports = router;



// {// set the dimensions and margins of the graph
    // var margin = {top: 10, right: 30, bottom: 30, left: 50},
    //     width = 380 - margin.left - margin.right,
    //     height = 400 - margin.top - margin.bottom;
    
    // // append the svg object to the body of the page
    // var svg = d3.select("#differentials-graph")
    //   .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform",
    //           "translate(" + margin.left + "," + margin.top + ")");
    
    // //Read the data
    // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {
    
    //   // Add X axis
    //   var x = d3.scaleLinear()
    //     .domain([0, 4000])
    //     .range([ 0, width ]);
    //   svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));
    
    //   // Add Y axis
    //   var y = d3.scaleLinear()
    //     .domain([0, 500000])
    //     .range([ height, 0]);
    //   svg.append("g")
    //     .call(d3.axisLeft(y));
    
    //   // Add dots
    //   svg.append('g')
    //     .selectAll("dot")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //       .attr("cx", function (d) { return x(d.GrLivArea); } )
    //       .attr("cy", function (d) { return y(d.SalePrice); } )
    //       .attr("r", 1.5)
    //       .style("fill", "#69b3a2")
    
    // })}