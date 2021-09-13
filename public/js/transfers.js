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

        let transfersIn = players
            .sort((a,b) => b.transfers_in - a.transfers_in).slice(0, 10).map(transfer => { 
                return{
                    name: transfer.web_name,
                    ins: transfer.transfers_in
                }
            })

        let transfersOut = players
            .sort((a,b) => b.transfers_out - a.transfers_out).slice(0, 10).map(transfer => { 
                return{
                    name: transfer.web_name,
                    outs: transfer.transfers_out
                }
            })
        console.log(transfersOut)

        // transfer ins
        let margin = {top: 10, right: 10, bottom: 50, left: 60},
            width = sectionBlock.scrollWidth - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        let svg = d3.select(".bar-ins")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // X axis
        let x = d3.scaleBand()
            .range([ 0, width ])
            .domain(transfersIn.map(d => d.name))
            .padding(0.2);
            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, transfersIn[0].ins])
            .range([ height, 0]);
            svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
        .data(transfersIn)
        .enter()
        .append("rect")
            .attr("x", d => x(d.name))
            .attr("y", d => y(d.ins))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.ins))
            .attr("fill", "#3a4257");

        //
        // transfer outs
        //
        //
        let svg2 = d3.select(".bar-outs")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // X axis
        let x2 = d3.scaleBand()
            .range([ 0, width ])
            .domain(transfersOut.map(d => d.name))
            .padding(0.2);
            svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x2))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Add Y axis
        let y2 = d3.scaleLinear()
            .domain([0, transfersOut[0].outs])
            .range([ height, 0]);
            svg2.append("g")
            .call(d3.axisLeft(y2));
        // Bars
        svg2.selectAll("mybar")
            .data(transfersOut)
            .enter()
            .append("rect")
                .attr("x", d => x2(d.name))
                .attr("y", d => y2(d.outs))
                .attr("width", x2.bandwidth())
                .attr("height", d => height - y2(d.outs))
                .attr("fill", "#f09292")



        // SENSIBLE TRANSFERS
        // PREMIUM 10 < X
        let premiums = players.filter(player => player.now_cost >= 100);

        let computedPremiums = premiums.map(async player => {  
            let playerEvents = await getPlayerEventsById(player.id);
            let history = parseInt(player.form)*0.3 + parseInt(player.points_per_game)*0.7;
            let fdr1 = playerEvents.fixtures[0].difficulty;
            let fdr2 = playerEvents.fixtures[1].difficulty;
            let fdr3 = playerEvents.fixtures[2].difficulty;
            let fdr4 = playerEvents.fixtures[3].difficulty;
            let fdr5 = playerEvents.fixtures[4].difficulty;
            let fdr6 = playerEvents.fixtures[5].difficulty;
            let avgFdr = (fdr1+fdr2+fdr3+fdr4+fdr5+fdr6)/4
            let index = (history*0.3 + (5 - parseInt(avgFdr)*0.7)).toFixed(2);

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

        Promise.all(computedPremiums)
            .then(players => {
                let sortedPlayers = players
                // player.chance_of_playing_next_round != 0
                    .sort((a,b) => (b.pci) - (a.pci))
                    // .slice(0, 10)

                let rowHeads =`
                    <th>Name</th>
                    <th>gw${currentGw+1}</th>
                    <th>gw${currentGw+2}</th>
                    <th>gw${currentGw+3}</th>
                    <th>gw${currentGw+4}</th>
                    <th>gw${currentGw+5}</th>
                    <th>gw${currentGw+6}</th>`

                    let row = document.createElement('tr');
                    row.innerHTML = rowHeads;
                    document.querySelector('.premium-table').appendChild(row);

                sortedPlayers.forEach(player => {
                    let rowfields = `
                        <td>${player.web_name} <span class="caption">(${player.now_cost/10}m)</td>
                        <td class="fix-${player.fdr1} caption">${evaluateTeam(player.opponent1)}</td>
                        <td class="fix-${player.fdr2} caption">${evaluateTeam(player.opponent2)}</td>
                        <td class="fix-${player.fdr3} caption">${evaluateTeam(player.opponent3)}</td>
                        <td class="fix-${player.fdr4} caption">${evaluateTeam(player.opponent4)}</td>
                        <td class="fix-${player.fdr5} caption">${evaluateTeam(player.opponent5)}</td>
                        <td class="fix-${player.fdr6} caption">${evaluateTeam(player.opponent6)}</td>
                    `
                    let row = document.createElement('tr');
                    row.innerHTML = rowfields;
                    document.querySelector('.premium-table').appendChild(row);
                })
            })
        
        // MID-RANGE 6.6 < X < 9.9
        let midRangers = players.filter(player => player.now_cost > 66 && player.now_cost < 99);

        let computedmidRange = midRangers.map(async player => {  
            let playerEvents = await getPlayerEventsById(player.id);
            let history = parseInt(player.form)*0.3 + parseInt(player.points_per_game)*0.7;
            let fdr1 = playerEvents.fixtures[0].difficulty;
            let fdr2 = playerEvents.fixtures[1].difficulty;
            let fdr3 = playerEvents.fixtures[2].difficulty;
            let fdr4 = playerEvents.fixtures[3].difficulty;
            let fdr5 = playerEvents.fixtures[4].difficulty;
            let fdr6 = playerEvents.fixtures[5].difficulty;
            let avgFdr = (fdr1+fdr2+fdr3+fdr4+fdr5+fdr6)/4
            let index = (history*0.3 + (5 - parseInt(avgFdr)*0.7)).toFixed(2);

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

        Promise.all(computedmidRange)
            .then(players => {
                let sortedPlayers = players
                // player.chance_of_playing_next_round != 0
                    .sort((a,b) => (b.pci) - (a.pci))
                    .slice(0, 10)

                let rowHeads =`
                    <th>Name</th>
                    <th>gw${currentGw+1}</th>
                    <th>gw${currentGw+2}</th>
                    <th>gw${currentGw+3}</th>
                    <th>gw${currentGw+4}</th>
                    <th>gw${currentGw+5}</th>
                    <th>gw${currentGw+6}</th>`

                    let row = document.createElement('tr');
                    row.innerHTML = rowHeads;
                    document.querySelector('.mid-range-table').appendChild(row);

                sortedPlayers.forEach(player => {
                    let rowfields = `
                    <td>${player.web_name} <span class="caption">(${player.now_cost/10}m)</td>
                        <td class="fix-${player.fdr1} caption">${evaluateTeam(player.opponent1)}</td>
                        <td class="fix-${player.fdr2} caption">${evaluateTeam(player.opponent2)}</td>
                        <td class="fix-${player.fdr3} caption">${evaluateTeam(player.opponent3)}</td>
                        <td class="fix-${player.fdr4} caption">${evaluateTeam(player.opponent4)}</td>
                        <td class="fix-${player.fdr5} caption">${evaluateTeam(player.opponent5)}</td>
                        <td class="fix-${player.fdr6} caption">${evaluateTeam(player.opponent6)}</td>
                    `
                    let row = document.createElement('tr');
                    row.innerHTML = rowfields;
                    document.querySelector('.mid-range-table').appendChild(row);
                })
            })

        // BUDGET 0 < X < 6.5
        let budgets = players
            .filter(player => player.now_cost < 66)
            .sort((a,b) => b.ict_index - a.ict_index)
            .slice(0, 30)

        let computedBudgets = budgets.map(async player => {  
            let playerEvents = await getPlayerEventsById(player.id);
            let history = parseInt(player.form)*0.3 + parseInt(player.points_per_game)*0.7;
            let fdr1 = playerEvents.fixtures[0].difficulty;
            let fdr2 = playerEvents.fixtures[1].difficulty;
            let fdr3 = playerEvents.fixtures[2].difficulty;
            let fdr4 = playerEvents.fixtures[3].difficulty;
            let fdr5 = playerEvents.fixtures[4].difficulty;
            let fdr6 = playerEvents.fixtures[5].difficulty;
            let avgFdr = (fdr1+fdr2+fdr3+fdr4+fdr5+fdr6)/4
            let index = (history*0.3 + (5 - parseInt(avgFdr)*0.7)).toFixed(2);

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

        Promise.all(computedBudgets)
            .then(players => {
                let sortedPlayers = players
                // player.chance_of_playing_next_round != 0
                    .sort((a,b) => (b.pci) - (a.pci))
                    .slice(0, 10)

                let rowHeads =`
                    <th>Name</th>
                    <th>gw${currentGw+1}</th>
                    <th>gw${currentGw+2}</th>
                    <th>gw${currentGw+3}</th>
                    <th>gw${currentGw+4}</th>
                    <th>gw${currentGw+5}</th>
                    <th>gw${currentGw+6}</th>`

                    let row = document.createElement('tr');
                    row.innerHTML = rowHeads;
                    document.querySelector('.budget-table').appendChild(row);

                sortedPlayers.forEach(player => {
                    let rowfields = `
                        <td>${player.web_name} <span class="caption mini-txt">(${player.now_cost/10}m)</td>
                        <td class="fix-${player.fdr1} caption">${evaluateTeam(player.opponent1)}</td>
                        <td class="fix-${player.fdr2} caption">${evaluateTeam(player.opponent2)}</td>
                        <td class="fix-${player.fdr3} caption">${evaluateTeam(player.opponent3)}</td>
                        <td class="fix-${player.fdr4} caption">${evaluateTeam(player.opponent4)}</td>
                        <td class="fix-${player.fdr5} caption">${evaluateTeam(player.opponent5)}</td>
                        <td class="fix-${player.fdr6} caption">${evaluateTeam(player.opponent6)}</td>
                    `
                    let row = document.createElement('tr');
                    row.innerHTML = rowfields;
                    document.querySelector('.budget-table').appendChild(row);
                })
            })
        
        }catch(err){
            console.log(err);
        }
}
initHomepage();