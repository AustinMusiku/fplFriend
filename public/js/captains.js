let cards = document.querySelector('.cards');
let radar = document.querySelector('.radar');
let captainStats = document.querySelector('.captain-stats');
let vcaptainStats = document.querySelector('.vcaptain-stats');
    
let initHomepage = async () => {
    try{
        // query players and gameweek from graphql
        let query = `{players(captains:true){ id web_name now_cost form points_per_game bps chance_of_playing_next_round assists goals_scored total_points influence threat creativity selected_by_percent element_type UpcomingFixtures(first: 1){ difficulty is_home team_h team_a } } gameweek(is_current: true){     id } }`
        let graphqlResponse = await graphQlQueryFetch(query);
        let players = graphqlResponse.data.players;
        const gwId = graphqlResponse.data.gameweek.id;
        //
        // CAPTAINS TABLE
        // create opponent, fdr(fixture difficulty rating), and captaincy field for each player
        let captains = players.map(captain => {
            let history = captain.form*0.3 + captain.points_per_game*0.3 + (captain.bps/gwId)*0.4;
            return {
                ...captain,
                fdr: captain.UpcomingFixtures[0].difficulty,
                opponent: captain.UpcomingFixtures[0].is_home? captain.UpcomingFixtures[0].team_a: captain.UpcomingFixtures[0].team_h,
                captaincy: (history*0.3 + (5 - captain.UpcomingFixtures[0].difficulty*0.7)).toFixed(2)
            }
        })
        
        let sortedCaptains = captains.sort((a,b) => (b.captaincy) - (a.captaincy)).slice(0, 15)

        // populate captains table
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

        // draw radar chart
        // select top two players on the captains table 
        let topTwo = sortedCaptains.slice(0,2);
        // topId == captains Id == player id of top element in captains table
        const topId = topTwo[0].id;

        // pick captain and vice colours
        let captainColor = '#f09292';
        let viceCaptainColor = '#3a4257';
        let captainFill = '#f092927d';
        let viceCaptainFill = '#3a42577d';

        let radarData = topTwo.map(player => {
            return {
                label: player.web_name,
                data: [ 
                    player.influence,
                    player.threat,
                    player.creativity
                ],
                backgroundColor: player.id === topId ? captainFill: viceCaptainFill,
                borderColor: player.id === topId ? captainColor: viceCaptainColor
            }
        })
        // instantiate chart
        const myChart = new Chart(radar, {
            type: 'radar',
            data: {
                labels: ['influence', 'threat', 'creativity'],
                datasets: radarData
            },
            options: {
                elements: {  line: { borderWidth: 1 }, point: { pointRadius: 1 } }
            }
        });
        // instatiate counter variable with 0
        let count = 0;
        topTwo.forEach( async (player) => {
        // When 0, populate captain column otherwise fill vice captain column
        let stats = count == 0 ? captainStats : vcaptainStats;

        let playerCardBottom = `
        <div class="column-heading"> 
            <p class="mini-heading ">${player.web_name}</p>
            <p class="mini-txt accent-font">${evaluatePosition(player.element_type)}</p>
        </div>
        <p>${player.total_points}</p>
        <p>${player.goals_scored}</p>
        <p>${player.assists}</p>
        <p>${player.bps}</p>
        <p>${player.fdr}</p>
        <p>${player.now_cost/10} m</p>
        <p>${player.selected_by_percent}%</p>`
        stats.innerHTML = playerCardBottom;
        count++;
    });

    }catch(err){
        throw err;
    }
}
initHomepage();