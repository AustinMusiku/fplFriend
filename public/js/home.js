let cards = document.querySelector('.cards');
let sectionBody = document.querySelector('.section-body');

let players, finishedGws, currentGw, nextGw;

// set the dimensions and margins of graphs
const MARGIN = {top: 10, right: 10, bottom: 60, left: 45},
HEIGHT = 400 - MARGIN.top - MARGIN.bottom;
let WIDTH = sectionBody.scrollWidth - MARGIN.left - MARGIN.right;
    
let initHomepage = async () => {
    try{
        
        // query players and curret ad ext gameweek from graphql
        let query = `{ players(by_points: true, first: 6) { id web_name now_cost team element_type cost_change_event total_points form ict_index selected_by_percent } nextGameWeek: gameweek(is_next: true) { ...GameWeekFields deadline_time } currentGameWeek: gameweek(is_current: true) { ...GameWeekFields chip_plays { chip_name num_played } } gameweeks(is_finished: true){ id avg_points highest_score } }  fragment GameWeekFields on Gameweek { id }`
        let response = await graphQlQueryFetch(query);
        
        players = response.data.players;
        finishedGws = response.data.gameweeks;
        currentGw = response.data.currentGameWeek;
        nextGw = response.data.nextGameWeek;

        localStorage.setItem('nextGw', JSON.stringify(nextGw));

        // DEADLINE BANNER
        updateDeadlineBanner();

        // ON FIRE PLAYERS
        // generate card for each player
        players.forEach(player => {
            let priceChange = player.cost_change_event;
            let playerCard = `  
            <div class="card-heading">
                <p class="caption">${evaluateTeam(player.team)}</p>
                <div class="card-stat1"> 
                    <p class="mini-txt accent">${evaluatePosition(player.element_type)}</p>
                </div>
                <a href="/player/${player.id}" class="mini-heading no-underline">${player.web_name}</a>
            </div>
            <div class="card-body">
                <div class="card-body-top">
                    <div class="card-stat2"> 
                        <p class="">${player.now_cost/10} <span class="mini-txt">m</span></p> </p>
                        <div class="price-indicator ${evalutePriceChange(priceChange)}"></div>
                    </div>
                </div>
                <div class="card-body-bottom">
                    <div class="card-stat stat1">
                        <p class="">${player.total_points}<p class="mini-txt">Pts</p></p>
                    </div>
                    <div class="card-stat stat2">
                        <p class="mini-txt">Form</p>
                        <p class="caption">${player.form}</p>
                    </div>
                    <div class="card-stat stat3">
                        <p class="mini-txt">Ict</p>
                        <p class="caption">${player.ict_index}</p>
                    </div>
                    <div class="card-stat stat4">
                        <p class="mini-txt">Sb</p>
                        <p class="caption">${player.selected_by_percent}%</p>
                    </div>
                </div>
            </div> `;
            let card = document.createElement('div');
            card.innerHTML = playerCard;
            card.classList.add('card');
            cards.appendChild(card);
        });

        // CHIPS BAR
        updateChipsBar();

        // AVG POINTS CHART
        updatePointsLineChart();
        
    }catch(err){
        throw err;
    }
}
initHomepage();

function updateDeadlineBanner() {    
    const nextGameweekContainer = document.querySelector('.next-gameweek-number');
    const deadline = document.querySelector('.deadline');

    if(!nextGw) {
        deadline.innerHTML = 'Season is over';
        return;
    }

    nextGameweekContainer.innerHTML = nextGw.id;
    // get and update deadline time
    const date = new Date(nextGw.deadline_time);
    let [hours, minutes] = [date.getHours(), date.getMinutes()];
    minutes = minutes == '0' ? '00' : minutes;
    const day = date.toString().substring(0,10);
    deadline.innerHTML = `${day}, ${hours}:${minutes}hrs`;
}

function updateChipsBar() {
    const pastGameweekContainer = document.querySelector('.past-gameweek-number');
    pastGameweekContainer.innerHTML = currentGw.id;

    // map through chips array and divide plays by 1000000
    let chips = currentGw.chip_plays.map(chip => { 
        return{
            chip_name: chip.chip_name,
            num_played: chip.num_played/1000000
        }
    });
    const chipNumbers = chips.map(chip => chip.num_played);
    const maxChip = Math.max(...chipNumbers)

    // append the svg object to the body of the page
    if(document.querySelector(".chips-bar > svg")){
        document.querySelector(".chips-bar").removeChild(document.querySelector(".chips-bar > svg"))
    }
    let svg = d3.select(".chips-bar")
        .append("svg")
        .attr("width", WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
            .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");

    
    // X axis
    let x = d3.scaleBand()
        .range([ 0, WIDTH ])
        .domain(chips.map(d => d.chip_name))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + HEIGHT + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    // Add Y axis
    let y = d3.scaleLinear()
    .domain([0, maxChip])
    .range([ HEIGHT, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add horizontal grid lines
   addHorizontalLines(svg, y);

    // Add Y label
    addYLabel(svg, 'plays (millions)')

    // Add a bar for each chip
    svg.selectAll("mybar")
        .data(chips)
        .enter()
        .append("rect")
        .attr("x", d => x(d.chip_name))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", d => HEIGHT - y(0))
        .attr("fill", "#3a4257")
        
    // animate bars upon scrollig into view
    let barAnimation = (entries) => {
        if(entries[0].intersectionRatio > 0){
            svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", d => y(d.num_played))
            .attr("height", d => HEIGHT - y(d.num_played))
            .delay((d,i) => i*100)
        }
    }
    addIntObserver(barAnimation, '.chips-bar')
}

function updatePointsLineChart() {
    if(document.querySelector(".avg-points-chart > svg")){
        document.querySelector(".avg-points-chart").removeChild(document.querySelector(".avg-points-chart > svg"))
    }
    let svg2 = d3.select(".avg-points-chart")
        .append("svg")
        .attr("width", WIDTH + MARGIN.left + MARGIN.right)
        .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
        .append("g")
            .attr("transform","translate(" + MARGIN.left + "," + MARGIN.top + ")");
    
    // Add X axis
    let x2 = d3.scaleLinear()
        .domain([1, d3.max(finishedGws, gw => gw.id)])
        .range([ 0, WIDTH ]);
        svg2.append("g")
        .attr("transform", "translate(0," + HEIGHT + ")")
        .call(d3.axisBottom(x2).ticks(finishedGws.length > 15 && WIDTH < 663 ? 15 : finishedGws.length));
        

    // Add Y axis
    let y2 = d3.scaleLinear()
        .domain([0, d3.max(finishedGws, gw => +gw.highest_score+20 )])
        .range([ HEIGHT, 0 ]);
        svg2.append("g")
        .call(d3.axisLeft(y2));

    // X label
    addXLabel(svg2, 'gameweek');

    // Y label
    addYLabel(svg2, 'points');
    
    // Add horizontal grid lines
    addHorizontalLines(svg2, y2)

    // Add the avg points line
    const avgPath = svg2.append("path")
        .datum(finishedGws)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 23, 81, 0.8)")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(gw => x2(gw.id))
            .y(gw => y2(gw.avg_points))
            )
    
    // Add the highest points line
    const highestPath = svg2.append("path")
        .datum(finishedGws)
        .attr("fill", "none")
        .attr("stroke", "#3a425799")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
                .x(gw => x2(gw.id))
                .y(gw => y2(gw.highest_score))
            )

    // get length of average points line and highest points line  
    const avgPathLength = avgPath.node().getTotalLength();
    const highestPathLength = highestPath.node().getTotalLength();

    // set stroke-dashoffset and stroke-dasharray for both lines
    avgPath
        .attr('stroke-dashoffset', avgPathLength)
        .attr('stroke-dasharray', avgPathLength);

    highestPath
        .attr('stroke-dashoffset', highestPathLength)
        .attr('stroke-dasharray', highestPathLength);

    
    // animate lines upon scrollig into view
    let chartAnimation = (entries) => {
        if(entries[0].intersectionRatio > 0){
            // animate avg and highest points line
            svg2.selectAll('path')
                .transition()
                .ease(d3.easeExpInOut)
                .duration(3000)
                .attr('stroke-dashoffset', 0)
        
        }
    }

    addIntObserver(chartAnimation, '.avg-points-chart')
}

function addXLabel(svg, text) {
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+ (WIDTH/2) +',' + (HEIGHT+30) + ')')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text(text);
}

function addYLabel(svg, text) {
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(-35,' + HEIGHT/2 + ')rotate(-90)')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text(text);
}
function addHorizontalLines(svg, y) {
    const yAxisGrid = d3.axisLeft(y)
        .tickSize(-(WIDTH))
        .tickFormat('')
        .ticks(10);
    svg.append('g')
        .attr('class', 'y axis-grid')
        .call(yAxisGrid);
}

function addIntObserver(observer, target){
    let observerNode = new IntersectionObserver(observer)
    let targetNode = document.querySelector(target)
    observerNode.observe(targetNode);
}

// render charts on screen resize
window.addEventListener('resize', () => {
    WIDTH = sectionBody.scrollWidth - MARGIN.left - MARGIN.right;
    updateChipsBar();
    updatePointsLineChart();
})