let cards = document.querySelector('.cards');
let sectionBody = document.querySelector('.section-body');
    
let initHomepage = async () => {
    try{
        // query players and curret ad ext gameweek from graphql
        let query = `{ players(by_form: true, first: 6) { web_name now_cost team element_type cost_change_event total_points form ict_index selected_by_percent } nextGameWeek: gameweek(is_next: true) { ...GameWeekFields deadline_time } currentGameWeek: gameweek(is_current: true) { ...GameWeekFields chip_plays { chip_name num_played } } } fragment GameWeekFields on Gameweek { id }`
        let response = await graphQlQueryFetch(query);
        
        let players = response.data.players;
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
        let margin = {top: 10, right: 10, bottom: 60, left: 50},
        width = sectionBody.scrollWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(".chips-bar")
        .append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");

        
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
    }catch(err){
        throw err;
    }
}
initHomepage();