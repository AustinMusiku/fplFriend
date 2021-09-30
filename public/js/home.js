let cards = document.querySelector('.cards');
let sectionBody = document.querySelector('.section-body');
    
let initHomepage = async () => {
    try{
        // query players and curret ad ext gameweek from graphql
        let query = `{ players(by_form: true, first: 6) { web_name now_cost team element_type cost_change_event total_points form ict_index selected_by_percent } nextGameWeek: gameweek(is_next: true) { ...GameWeekFields deadline_time } currentGameWeek: gameweek(is_current: true) { ...GameWeekFields chip_plays { chip_name num_played } } gameweeks(is_finished: true){ id avg_points highest_score } }  fragment GameWeekFields on Gameweek { id }`
        let response = await graphQlQueryFetch(query);
        
        let players = response.data.players;
        let finishedGws = response.data.gameweeks;
        const currentGw = response.data.currentGameWeek;
        const nextGw = response.data.nextGameWeek;

        //
        // DEADLINE BANNER
        //
        const nextGameweekContainer = document.querySelector('.next-gameweek-number');
        const deadline = document.querySelector('.deadline');
        nextGameweekContainer.innerHTML = nextGw.id;
        // get and update deadline time
        const date = new Date(nextGw.deadline_time);
        let [hours, minutes] = [date.getHours(), date.getMinutes()];
        minutes = minutes == '0' ? '00' : minutes;
        const day = date.toString().substring(0,10);
        deadline.innerHTML = `${day}, ${hours}:${minutes}hrs`;

        //
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
                <p class="mini-heading ">${player.web_name}</p>
            </div>
            <div class="card-body">
                <div class="card-body-top">
                    <div class="card-stat2"> 
                        <p>${player.now_cost/10} <span class="mini-txt">m</span></p> </p>
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

        //
        // CHIPS BAR
        //
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

        // set the dimensions and margins of the graph
        let margin = {top: 10, right: 10, bottom: 60, left: 45},
        width = sectionBody.scrollWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(".chips-bar")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

        
        // X axis
        let x = d3.scaleBand()
        .range([ 0, width ])
        .domain(chips.map(d => d.chip_name))
        .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        let y = d3.scaleLinear()
        .domain([0, maxChip])
        .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add horizontal grid lines
        const yAxisGrid = d3.axisLeft(y)
            .tickSize(-(width))
            .tickFormat('')
            .ticks(10);
        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid);

        // Add Y label
        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate( -35,'+ height/2 + ')rotate(-90)')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text('plays (millions)');

        // Add a bar for each chip
        svg.selectAll("mybar")
        .data(chips)
        .enter()
        .append("rect")
        .attr("x", d => x(d.chip_name))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(0))
        .attr("fill", "#3a4257")
            
        // animate bars upon scrollig into view
        let barAnimation = (entries) => {
            if(entries[0].intersectionRatio > 0){
                svg.selectAll("rect")
                .transition()
                .duration(800)
                .attr("y", d => y(d.num_played))
                .attr("height", d => height - y(d.num_played))
                .delay((d,i) => i*100)
            }
        }
        let observer = new IntersectionObserver(barAnimation)
        let target = document.querySelector('.chips-bar')
        observer.observe(target);


        //
        // AVG POINTS CHART
        // append the svg object to the body of the page
        let svg2 = d3.select(".avg-points-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        
            // Add X axis
            let x2 = d3.scaleLinear()
                .domain([1, d3.max(finishedGws, gw => gw.id)])
                .range([ 0, width ]);
                svg2.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x2).ticks(finishedGws.length));
                

            // Add Y axis
            let y2 = d3.scaleLinear()
                .domain([0, d3.max(finishedGws, gw => +gw.highest_score+20 )])
                .range([ height, 0 ]);
                svg2.append("g")
                .call(d3.axisLeft(y2));

            // X label
            svg2.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate('+ (width/2) +',' + (height+30) + ')')
                .attr('class','axis-label')
                .style('font-family', 'Space Grotesk')
                .style('font-size', 14)
                .text('gameweek');

            // Y label
            svg2.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(-35,' + height/2 + ')rotate(-90)')
                .attr('class','axis-label')
                .style('font-family', 'Space Grotesk')
                .style('font-size', 14)
                .text('points');
            
            // Add horizontal grid lines
            const yAxisGrid2 = d3.axisLeft(y2)
                .tickSize( -(width) )
                .tickFormat('')
                .ticks(10);
            svg2.append('g')
                .attr('class', 'y axis-grid')
                .call(yAxisGrid2);

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
            let lineChartObserver = new IntersectionObserver(chartAnimation)
            let lineChartTarget = document.querySelector('.avg-points-chart')
            lineChartObserver.observe(lineChartTarget);

    }catch(err){
        throw err;
    }
}
initHomepage();