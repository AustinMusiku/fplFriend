 
    let initHomepage = async () => {
        try{
            let container = document.querySelector('.container');
            let teams = await getAllTeams();

            console.log(teams)

            let computedTransfers = players.map(async player => {  
                let playerEvents = await getPlayerEventsById(player.id);
                let history = parseInt(player.form)*0.3 + parseInt(player.points_per_game)*0.7;
                let fdr1 = playerEvents.fixtures[0].difficulty;
                let fdr2 = playerEvents.fixtures[1].difficulty;
                let fdr3 = playerEvents.fixtures[2].difficulty;
                let fdr4 = playerEvents.fixtures[3].difficulty;
                let avgFdr = (fdr1+fdr2+fdr3+fdr4)/4
                let index = (history*0.3 + (5 - parseInt(avgFdr)*0.7)).toFixed(2);

                return {
                    ...player,
                    fdr1: fdr1,
                    fdr2: fdr2,
                    fdr3: fdr3,
                    fdr4: fdr4,
                    opponent1: playerEvents.fixtures[0].is_home? playerEvents.fixtures[0].team_a: playerEvents.fixtures[0].team_h,
                    opponent2: playerEvents.fixtures[1].is_home? playerEvents.fixtures[1].team_a: playerEvents.fixtures[1].team_h,
                    opponent3: playerEvents.fixtures[2].is_home? playerEvents.fixtures[2].team_a: playerEvents.fixtures[2].team_h,
                    opponent4: playerEvents.fixtures[3].is_home? playerEvents.fixtures[3].team_a: playerEvents.fixtures[3].team_h,
                    pci: index
                }
            })

            Promise.all(computedTransfers)
                .then(players => {
                    console.log(players)
                    let sortedPlayers = players
                    // player.chance_of_playing_next_round != 0
                        .sort((a,b) => (b.pci) - (a.pci))
                        // .slice(0, 10)

                    sortedPlayers.forEach(player => {
                        console.log(`${player.web_name} -> ${player.pci}`)
                        let rowfields = `
                            <td>${player.web_name}</td>
                            <td class="fix-${player.fdr1} caption">${evaluateTeam(player.opponent1)}</td>
                            <td class="fix-${player.fdr2} caption">${evaluateTeam(player.opponent2)}</td>
                            <td class="fix-${player.fdr3} caption">${evaluateTeam(player.opponent3)}</td>
                            <td class="fix-${player.fdr4} caption">${evaluateTeam(player.opponent4)}</td>
                        `
                        let row = document.createElement('tr');
                        row.innerHTML = rowfields;
                        document.querySelector('.premium-table').appendChild(row);
                    })
                })
            }catch(err){
                console.log(err);
            }
    }
    initHomepage();