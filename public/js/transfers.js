let initHomepage = async () => {
    try{
        let sectionBlock = document.querySelector('.section-block');
        let container = document.querySelector('.container');
        let players = await getAllPlayers();
        const gw = await getGw()
        const currentGw = parseInt(gw[0].id);

        //
        // MARKET TRENDS
        //

        let topTransfers = players
            .sort((a,b) => (b.transfers_in_event + b.transfers_out_event) - (a.transfers_in_event + a.transfers_out_event))
            .slice(0, 20)
            .map(transfer => { 
                return{
                    id: transfer.id,
                    name: transfer.web_name,
                    ins: transfer.transfers_in_event/1000000,
                    outs: transfer.transfers_out_event/1000000
                }
            })
        let names = topTransfers.map(player => player.name);

        // transfer ins
        let margin = {top: 10, right: 10, bottom: 60, left: 40},
            width = sectionBlock.scrollWidth - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

            
        // append the svg object to the body of the page
        let svg = d3.select(".bar-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


        // List of subgroups
        let subgroups = ['ins', 'outs'];

        // List of groups
        let groups = names

        // Add X axis
        let x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.25])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, topTransfers[0].ins+topTransfers[0].outs])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));
        
        // Add Y label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate( -30,'+ height/2 + ')rotate(-90)')
            .attr('class','axis-label')
            .style('font-family', 'Space Grotesk')
            .style('font-size', 14)
            .text('transfers (millions)');

        const yAxisGrid = d3.axisLeft(y)
            .tickSize(-(width))
            .tickFormat('')
            .ticks(10);
        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid);

        // color palette = one color per subgroup
        let color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#3a4257','rgba(255, 23, 81, 0.8)'])

        //stack the data per subgroup
        let stackedData = d3.stack()
            .keys(subgroups)
            (topTransfers)

        // Show the bars
        svg.append("g")
        .selectAll("g")
        // group per group
        .data(stackedData)
        .enter()
        .append("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            // loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.name))
            .attr("y", d => y(0))
            .attr("height", 0)
            .attr("width", x.bandwidth())

        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .delay((d,i) => i*50)
        
        
        // SENSIBLE TRANSFERS

        let mapTableArray = async (array) => {
            return array.map(async player => {  
                let playerEvents = await getPlayerEventsById(player.id);
                let fdr1 = parseInt(playerEvents.fixtures[0].difficulty);
                let fdr2 = parseInt(playerEvents.fixtures[1].difficulty);
                let fdr3 = parseInt(playerEvents.fixtures[2].difficulty);
                let fdr4 = parseInt(playerEvents.fixtures[3].difficulty);
                let fdr5 = parseInt(playerEvents.fixtures[4].difficulty);
                let fdr6 = parseInt(playerEvents.fixtures[5].difficulty);
                let avgFdr = (fdr1+fdr2+fdr3+fdr4+fdr5+fdr6)/6
                let index = (5 - avgFdr)*20+player.bps*0.1;
    
                return {
                    ...player,
                    fdr1: fdr1,
                    fdr2: fdr2,
                    fdr3: fdr3,
                    fdr4: fdr4,
                    fdr5: fdr5,
                    fdr6: fdr6,
                    opponent1: playerEvents.fixtures[0].is_home? playerEvents.fixtures[0].team_a: playerEvents.fixtures[0].team_h,
                    opponent2: playerEvents.fixtures[1].is_home? playerEvents.fixtures[1].team_a: playerEvents.fixtures[1].team_h,
                    opponent3: playerEvents.fixtures[2].is_home? playerEvents.fixtures[2].team_a: playerEvents.fixtures[2].team_h,
                    opponent4: playerEvents.fixtures[3].is_home? playerEvents.fixtures[3].team_a: playerEvents.fixtures[3].team_h,
                    opponent5: playerEvents.fixtures[4].is_home? playerEvents.fixtures[4].team_a: playerEvents.fixtures[4].team_h,
                    opponent6: playerEvents.fixtures[5].is_home? playerEvents.fixtures[5].team_a: playerEvents.fixtures[5].team_h,
                    pci: index
                }
            })
        }

        let rowHeads =` <th class="sticky-cell">Name</th>
                        <thead>
                            <th>gw${currentGw+1}</th>
                            <th>gw${currentGw+2}</th>
                            <th>gw${currentGw+3}</th>
                            <th>gw${currentGw+4}</th>
                            <th>gw${currentGw+5}</th>
                            <th>gw${currentGw+6}</th>
                        </thead>`
        let generateRowFields = (player) => {
            let rowfields = `
                        <td class="sticky-cell">${player.web_name} <span class="caption">(${player.now_cost/10}m)</td>
                        <tbody>
                            <td class="fix-${player.fdr1} caption">${evaluateTeam(player.opponent1)}</td>
                            <td class="fix-${player.fdr2} caption">${evaluateTeam(player.opponent2)}</td>
                            <td class="fix-${player.fdr3} caption">${evaluateTeam(player.opponent3)}</td>
                            <td class="fix-${player.fdr4} caption">${evaluateTeam(player.opponent4)}</td>
                            <td class="fix-${player.fdr5} caption">${evaluateTeam(player.opponent5)}</td>
                            <td class="fix-${player.fdr6} caption">${evaluateTeam(player.opponent6)}</td>
                        </tbody>
                    `
            return rowfields;
        }

        // PREMIUM 10 < X
        let premiums = players.filter(player => player.now_cost >= 100);

        let computedPremiums = mapTableArray(premiums);

        computedPremiums
            .then(premiumsPromises => {
                Promise.all(premiumsPromises)
                    .then(players => {
                        let sortedPlayers = players.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10)
                        // append table headings
                        let row = document.createElement('tr');
                        row.innerHTML = rowHeads;
                        document.querySelector('.premium-table').appendChild(row);
                        // append each player to table
                        sortedPlayers.forEach(player => {
                            let rowfields = generateRowFields(player);
                            let row = document.createElement('tr');
                            row.innerHTML = rowfields;
                            document.querySelector('.premium-table').appendChild(row);
                        })
                    })
            })
        
        
        // MID-RANGE 6.6 < X < 9.9
        let midRangers = players.filter(player => player.now_cost > 66 && player.now_cost < 99);

        let computedMidRange = mapTableArray(midRangers)

        computedMidRange
            .then(midRangersPromises => {
                Promise.all(midRangersPromises)
                    .then(players => {
                        let sortedPlayers = players.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10)
                        // append table heading
                        let row = document.createElement('tr');
                        row.innerHTML = rowHeads;
                        document.querySelector('.mid-range-table').appendChild(row);
                        // append each player to table
                        sortedPlayers.forEach(player => {
                            let rowfields = generateRowFields(player);
                            let row = document.createElement('tr');
                            row.innerHTML = rowfields;
                            document.querySelector('.mid-range-table').appendChild(row);
                        })
                    })
            })

        // BUDGET 0 < X < 6.5
        let budgets = players
            .filter(player => player.now_cost < 66)
            .sort((a,b) => b.ict_index - a.ict_index)
            .slice(0, 30)

        let computedBudgets = mapTableArray(budgets)

        computedBudgets
            .then(budgetPromises => {
                Promise.all(budgetPromises)
                    .then(players => {
                        let sortedPlayers = players.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10)
                        
                        // append table headings
                        let row = document.createElement('tr');
                        row.innerHTML = rowHeads;
                        document.querySelector('.budget-table').appendChild(row);
                        // append each player to table
                        sortedPlayers.forEach(player => {
                            let rowfields = generateRowFields(player);
                            let row = document.createElement('tr');
                            row.innerHTML = rowfields;
                            document.querySelector('.budget-table').appendChild(row);
                        })
                    })
            })
        
        }catch(err){
            console.log(err);
        }
}
initHomepage();