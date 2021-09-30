let cards = document.querySelector('.cards');
let container = document.querySelector('.container');
let nextGameweekContainer = document.querySelector('.next-gameweek-container')
let ppmTable = document.querySelector('.ppm-table')
    
let initHomepage = async () => {
    try{
        // query players and gameweeks from graphql
        let graphqlQuery = `{ players(trim_extras: true, differentials: true) {web_name selected_by_percent form bps now_cost total_points chance_of_playing_next_round minutes} currentGameWeek: gameweek(is_current: true){id}}`
        let graphqlResponse = await graphQlQueryFetch(graphqlQuery)
        let players = graphqlResponse.data.players;

        const gw = graphqlResponse.data.currentGameWeek;
        const gwId = gw.id;
        // update next gameweek container
        nextGameweekContainer.innerHTML = gwId+1
        //
        // DIFFERENTIALS SCATTER PLOT
        // set the dimensions and margins of the graph
        let margin = {top: 10, right: 10, bottom: 50, left: 40},
            width = container.scrollWidth - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select("#differentials-graph")
        .append("svg")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // X label
        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+ (width/2) +',' + (height+30) + ')')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text('momentum');

        // Y label
        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(-25,' + height/2 + ')rotate(-90)')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text('owership (%)');

        // compute differentials
        let differentials = players
            .sort((a,b) => b.now_cost - a.now_cost)
            .filter(differential => differential.now_cost > 50);
        // map through differetials and add a momentum field for each player
        let computedDifferentials =  differentials.map(differential => {
            return {
                name: differential.web_name,
                ownership: differential.selected_by_percent,
                momentum: differential.form*0.5 + differential.bps*0.5
            }
        })

        let sortedDifferentials = computedDifferentials.sort((a,b) => b.momentum - a.momentum);
        let maxmomentum = Math.ceil(sortedDifferentials[0].momentum);

        // Add X axis
        let x = d3.scaleLinear()
        .domain([0, maxmomentum+5])
        .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5));
  
        // Add Y axis
        let y = d3.scaleLinear()
        .domain([0, 12])
        .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add dots
        svg.append('g')
        .selectAll("dot")
        .data(computedDifferentials)
        .enter()
        .append("circle")
            .attr("cx", 0 )
            .attr("cy", height )
            .attr('data-name', d => `${d.name}`)
            .attr("r", 3)
            .style("fill", "#f09292")

        // Add labels
        svg.append("g")
        .selectAll("text")
        .data(computedDifferentials)
        .enter()
        .append("text")
            .attr('class', 'scatter-plot-labels')
            .attr("font-family", "Space Grotesk")
            .attr("font-size", 10)
            .style('fill', '#000')
            .attr("dy", "0.35em")
            .attr("x", d => x(d.momentum)+4)
            .attr("y", d => y(d.ownership))
            .attr('display', 'none')
            .text(d => d.name);

        const observer = new IntersectionObserver((entries) => {
            if(entries[0].intersectionRatio > 0){
                // Animate dots...
                svg.selectAll("circle")
                .transition()
                .duration(400)
                .attr("cx", d => x(d.momentum) )
                .attr("cy", d => y(d.ownership) )
                .delay((d,i) => i*70)
                // ...and their labels
                svg.selectAll('.scatter-plot-labels')
                .transition()
                .duration(400)
                .attr('display', 'block')
                .delay((d,i) => i*72)
            }
        })
        const target = document.querySelector('#differentials-graph');
        observer.observe(target);
        document.querySelector('#differentials-graph').querySelector('.asynchronous').classList.add('invisible');
        //
        // PRICE PER MILLION TABLE
        // map through players array ad add a ppm(price per million field for all players)
        let computedPpm = players.map( player => {
            let ppm = (player.total_points/(player.now_cost/10)).toFixed(2);
            return {
                ...player,
                ppm: ppm
            }
        })

        let sortedPpm = computedPpm.sort((a,b) => (b.ppm) - (a.ppm)).slice(0, 15)
        let rowHeadFields =`
            <th>Name (price)</th>
            <th>Points</th>
            <th>Ppm</th>
        `
        // append table headings
        let rowHeads = document.createElement('tr');
        rowHeads.innerHTML = rowHeadFields;
        ppmTable.append(rowHeads)
        // append each player to table
        sortedPpm.forEach(player => {
            let rowfields = `
            <td>${player.web_name} <span class="caption">(${player.now_cost/10} m)</span></td>
            <td>${player.total_points}</td>
            <td>${player.ppm}</td>
            `
            let row = document.createElement('tr');
            row.innerHTML = rowfields;
            row.classList.add('tall');
            document.querySelector('table').appendChild(row);
        })
        // remove spinner
        ppmTable.previousElementSibling.classList.add('invisible');
    }catch(err){
        console.error(err);
    }
}
initHomepage();