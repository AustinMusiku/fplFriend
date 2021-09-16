let cards = document.querySelector('.cards');
    
    let initHomepage = async () => {
        try{
            let container = document.querySelector('.container');
            let radar = document.querySelector('.radar');

            let captainStats = document.querySelector('.captain-stats');
            let vcaptainStats = document.querySelector('.vcaptain-stats');


            const players = await getAllPlayers();
            const gw = await getGw()
            const currentGw = parseInt(gw[0].id);

            //
            //ON FIRE PLAYERS
            //

            //
            // CAPTAINS TABLE
            //
            let captains = players.filter(captain => captain.now_cost > 70);
            console.log(captains.sort((a,b)=> b.bps - a.bps))

            let computedCaptains = captains.map(async captain => {  
                let captainEvents = await getPlayerEventsById(captain.id);
                let history = parseInt(captain.form)*0.3 + parseInt(captain.points_per_game)*0.3 + parseInt(captain.ict_index)*0.4;
                let fdr = captainEvents.fixtures[0].difficulty;
                let index = (history*0.3 + (5 - parseInt(fdr)*0.7)).toFixed(2);

                return {
                    ...captain,
                    fdr: fdr,
                    opponent: captainEvents.fixtures[0].is_home? captainEvents.fixtures[0].team_a: captainEvents.fixtures[0].team_h,
                    captaincy: index
                }
            })

            Promise.all(computedCaptains)
                .then(captains => {
                    let sortedCaptains = captains
                        .sort((a,b) => (b.captaincy) - (a.captaincy))
                        .filter(captain => captain.chance_of_playing_next_round != 0)
                        .slice(0, 15)

                    sortedCaptains.forEach(captain => {
                        let rowfields = `
                            <td>${captain.web_name}</td>
                            <td class="fix-${captain.fdr} caption">${evaluateTeam(captain.opponent)}</td>
                            <td>${captain.captaincy}</td>
                        `
                        let row = document.createElement('tr');
                        row.innerHTML = rowfields;
                        document.querySelector('table').appendChild(row);
                    })

                    let topTwo = sortedCaptains.slice(0,2);
                    const topId = topTwo[0].id;

                    // draw radar chart
                    let captainColor = '#f09292';
                    let viceCaptainColor = '#3a4257';
                    let captainFill = '#f092927d';
                    let viceCaptainFill = '#3a42577d';

                    let radarData = topTwo.map(player => {
                        return {
                            label: player.web_name,
                            data: [ 
                                parseInt(player.influence)/100,
                                parseInt(player.threat)/100,
                                parseInt(player.creativity)/100
                            ],
                            backgroundColor: player.id === topId ? captainFill: viceCaptainFill,
                            borderColor: player.id === topId ? captainColor: viceCaptainColor,
                            pointBackgroundColor: player.id === topId ? captainColor: viceCaptainColor,
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: player.id === topId ? captainColor: viceCaptainColor
                        }
                    })
                    const myChart = new Chart(radar, {
                        type: 'radar',
                        data: {
                            labels: ['influence', 'threat', 'creativity'],
                            datasets: radarData
                        },
                        options: {
                            elements: { 
                                line: { borderWidth: 1 },
                                point: { pointRadius: 1 }
                            }
                          }
                    });

                    let count = 0;
                    console.log(radarData);
                    topTwo.forEach( async (player) => {
                        // let photo = await fetch(`${imagesUrl}${player.code}.png`);
                        // let photoBlob = await photo.blob();
                        // let imageObjectUrl = URL.createObjectURL(photoBlob);
                        // let baseBlobUrl = 'blob:http://192.168.8.137:3000';
                        // let topLevelBlobUrl = imageObjectUrl.slice(26);
                        // let blobUrl = `${baseBlobUrl}${topLevelBlobUrl}`
                        
                    let stats = count == 0 ? captainStats : vcaptainStats;

                    let playerCardBottom = `
                                            <div class="column-heading"> 
                                                <p class="mini-heading ">${player.web_name}</p>
                                                <p class="mini-txt accent-font">${evaluatePosition(player.element_type)}</p>
                                            </div>
                                            
                                            <p>${player.total_points}</p>
                                            <p>${player.goals_scored}</p>
                                            <p>${player.assists}</p>
                                            <p>${player.now_cost/10} m</p>
                                            <p>${player.selected_by_percent}%</p>
                                            `
                    stats.innerHTML = playerCardBottom;
                    count++;
                });
                })


            
        }catch(err){
            console.error(err);
        }
    }
    
    initHomepage();