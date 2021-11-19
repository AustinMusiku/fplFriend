let sectionBlock = document.querySelector('.section-block');
let premiumTable = document.querySelector('.premium-table');
let midRangeTable = document.querySelector('.mid-range-table');
let budgetTable = document.querySelector('.budget-table');

let initHomepage = async () => {
    try{
        // query data from graphql
        let query = ` { 
            mostTransfered: players(by_transfers: true){ web_name transfers_in_event transfers_out_event } 
            premiums: players(premiums: true, first: 10){ ... playerFields } 
            midRangers: players(mid_rangers: true, trim_extras: true){ ... playerFields } 
            budgets: players(budgets: true, trim_extras: true, first: 40){ ... playerFields } 
            currentGw: gameweek(is_current: true){ id } } 
            fragment playerFields on Player{ id web_name form bps minutes points_per_game now_cost UpcomingFixtures(first: 6){ difficulty is_home team_a team_h} } `
        let graphqlResponse = await graphQlQueryFetch(query);
        let mostTransfered = graphqlResponse.data.mostTransfered;
        let premiums = graphqlResponse.data.premiums;
        let midRangers = graphqlResponse.data.midRangers;
        let budgets = graphqlResponse.data.budgets;
        const gwId = graphqlResponse.data.currentGw.id;

        //
        // MARKET TRENDS
        // map through each of the top transfered players and divide each transfer value by 1000000
        let topTransfers = mostTransfered.map(transfer => { 
                return{
                    id: transfer.id,
                    name: transfer.web_name,
                    ins: transfer.transfers_in_event/1000000,
                    outs: transfer.transfers_out_event/1000000
                }
            })
        let names = topTransfers.map(player => player.name);

        // graph
        // define margins for chart
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
        
        // Add horizontal grid lines
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
            .range(['rgba(1,252,122,.8)','rgba(255, 23, 81, 0.8)'])

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

        // animate bar graph when in focus
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].intersectionRatio > 0){
                svg.selectAll("rect")
                    .transition()
                    .duration(800)
                    .attr("y", d => y(d[1]))
                    .attr("height", d => y(d[0]) - y(d[1]))
                    .delay((d,i) => i*50)
            }
        })
        const target = document.querySelector('.bar-chart');
        observer.observe(target)
        // remove spinner
        document.querySelector('.bar-chart').querySelector('.asynchronous').classList.add('invisible');

        // 
        // SENSIBLE TRANSFERS
        // map through each player and calculate an index field based on six upcoming fixtures and players bps(bonus points system)
        const computeIndices = array => {
            return array.map(player => {
                let fdr1 = player.UpcomingFixtures[0].difficulty;
                let fdr2 = player.UpcomingFixtures[1].difficulty;
                let fdr3 = player.UpcomingFixtures[2].difficulty;
                let fdr4 = player.UpcomingFixtures[3].difficulty;
                let fdr5 = player.UpcomingFixtures[4].difficulty;
                let fdr6 = player.UpcomingFixtures[5].difficulty;
                let history = (player.form*0.3 + player.points_per_game*0.3 + (player.bps/player.minutes)*0.4).toFixed(2);
                let avgFdr = ((fdr1+fdr2+fdr3+fdr4+fdr5+fdr6)/6).toFixed(2);
                let index = ((5 - avgFdr)*0.5 + history*0.5).toFixed(2);

                return {
                    ...player,
                    fdr1: fdr1,
                    fdr2: fdr2,
                    fdr3: fdr3,
                    fdr4: fdr4,
                    fdr5: fdr5,
                    fdr6: fdr6,
                    opponent1: player.UpcomingFixtures[0].is_home? player.UpcomingFixtures[0].team_a: player.UpcomingFixtures[0].team_h,
                    opponent2: player.UpcomingFixtures[1].is_home? player.UpcomingFixtures[1].team_a: player.UpcomingFixtures[1].team_h,
                    opponent3: player.UpcomingFixtures[2].is_home? player.UpcomingFixtures[2].team_a: player.UpcomingFixtures[2].team_h,
                    opponent4: player.UpcomingFixtures[3].is_home? player.UpcomingFixtures[3].team_a: player.UpcomingFixtures[3].team_h,
                    opponent5: player.UpcomingFixtures[4].is_home? player.UpcomingFixtures[4].team_a: player.UpcomingFixtures[4].team_h,
                    opponent6: player.UpcomingFixtures[5].is_home? player.UpcomingFixtures[5].team_a: player.UpcomingFixtures[5].team_h,
                    pci: index
                }
            })
        }

        // table row heads
        const rowHeads =` <th class="sticky-cell">Name</th>
                        <thead>
                            <th>gw${gwId+1}</th>
                            <th>gw${gwId+2}</th>
                            <th>gw${gwId+3}</th>
                            <th>gw${gwId+4}</th>
                            <th>gw${gwId+5}</th>
                            <th>gw${gwId+6}</th>
                        </thead>`

        // create a row field for a player                
        const generateRowFields = (player) => {
            let rowfields = `
                        <td class="sticky-cell"><a href="/player/${player.id}" class=" no-underline">${player.web_name} <span class="mini-txt">(${player.now_cost/10}m)</a></td>
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

        // generate table for each price range
        const generateTable = (tableName, sortedPlayers) => {
            // create and append table headings
            let row = document.createElement('tr');
            row.innerHTML = rowHeads;
            tableName.appendChild(row);
            // append each player to table
            sortedPlayers.forEach(player => {
                let rowfields = generateRowFields(player);
                let row = document.createElement('tr');
                row.innerHTML = rowfields;
                tableName.appendChild(row);
            })
            // remove spinner
            tableName.previousElementSibling.classList.add('invisible');
        }
        
        // PREMIUM 10 < X
        let computedPremiums = computeIndices(premiums);
        let sortedPremiums = computedPremiums.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10)
        generateTable(premiumTable, sortedPremiums);
        
        // MID-RANGE 6.6 < X < 9.9
        let computedMidRange = computeIndices(midRangers)
        let sortedMidRangers = computedMidRange.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10)
        generateTable(midRangeTable, sortedMidRangers)

        // BUDGET 0 < X < 6.5
        let computedBudgets = computeIndices(budgets);
        let sortedBudgets = computedBudgets.sort((a,b) => (b.pci) - (a.pci)).slice(0, 10);     
        generateTable(budgetTable, sortedBudgets)
        
    }catch(err){
        console.log(err);
    }
}
initHomepage();