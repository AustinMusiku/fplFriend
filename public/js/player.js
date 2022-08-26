let sectionBody = document.querySelector('.section-body');
const playerSearchForm = document.querySelector('.player-search');
const playerSearchFormField = document.querySelector('#playerAutoComplete');
const playerSummary = document.querySelector('.player-summary');
let historyTable = document.querySelector('.history-table');
let fixturesTable = document.querySelector('.fixtures-table');
let ownershipChart = document.querySelector('.player-points-chart');
let priceChart = document.querySelector('.player-price-chart');

const playerDetailFetch = async (playerId) => {
    const query = ` { 
        player(id: ${playerId}) { 
        web_name chance_of_playing_next_round news team element_type first_name second_name now_cost cost_change_event total_points 
        event_points selected_by_percent form ict_index

        pastFixtures { total_points value selected was_home minutes round team_h_score team_a_score opponent_team } 
        UpcomingFixtures { team_h team_a event kickoff_time is_home difficulty } 
        } }`
    const graphQlResponse = await graphQlQueryFetch(query);
    const data = graphQlResponse.data;
    return data;
}

const updatePlayerHeader = player => {
    // load player header information
    playerSummary.innerHTML = `
    <div class="player-name">
                <p class="${evaluteAlert(player.chance_of_playing_next_round)} caption">${player.news}</p>
                <p class="caption">${evaluateTeam(player.team)}</p>
                <p class="mini-txt accent">${evaluatePosition(player.element_type)}</p>
                <h1 class="sub-heading"> ${player.first_name} ${player.second_name}</h1>
            </div>

            <div class="player-price"> 
                <p class="sub-heading">${player.now_cost/10}<span class="mini-txt">m</span></p> </p>
                <div class="price-indicator ${evalutePriceChange(player.cost_change_event)}"></div>
            </div>

            <div class="player-meta">
                <div class="meta-stat stat1">
                    <p class="mini-txt">Pts</p>
                    <p class="">${player.total_points}</p>
                </div>
                <div class="meta-stat stat2">
                    <p class="mini-txt">Own</p>
                    <p class="">${player.selected_by_percent} %</p>
                </div>
                <div class="meta-stat stat3">
                    <p class="mini-txt">Form</p>
                    <p class="">${player.form}</p>
                </div>
                <div class="meta-stat stat4">
                    <p class="mini-txt">Ict</p>
                    <p class="">${player.ict_index}</p>
                </div>
            </div>`
}

const updateHistoryTable = history => {
    // clear any table data 
    historyTable.innerHTML = '';
    // table row heads
    let rowHeads = document.createElement('tr');
    rowHeads.innerHTML = ` 
        <th>gw</th>
        <th>opp</th>
        <th>pts</th>
        <th>mins</th>`
    historyTable.append(rowHeads);
    
    // create a row field for a player
    history.reverse().forEach( hist => {
        let rowfields = document.createElement('tr');
        rowfields.innerHTML = `
            <td>${hist.round}</td>
            <td class="caption">${evaluateTeam(hist.opponent_team)}(${hist.was_home ? "H" : "A"})  <span class="${hist.was_home ? "accent-font" : ""}">${hist.team_h_score}</span> - <span class="${!hist.was_home ? "accent-font" : ""}" >${hist.team_a_score}</span></td>
            <td>${hist.total_points}</td>
            <td>${hist.minutes}</td>`
        historyTable.append(rowfields);
    })

    // reset history array to normal order; reverse history array
    history.reverse();
}

const updateFixturesTable = fixtures => {
    // clear any table data 
    fixturesTable.innerHTML = '';

    // table row heads
    let rowHeads = document.createElement('tr');
    rowHeads.innerHTML = `
                    <th>Date</th>
                    <th>gw</th>
                    <th>opponent</th>`
    
    fixturesTable.append(rowHeads)             
    fixtures.forEach(fix => {
        // create a row field for a player 
        let rowfields = document.createElement('tr');
        rowfields.innerHTML = `
                        <td caption">${new Date(fix.kickoff_time).toString().substr(0, 11)}</td>
                        <td caption">${fix.event}</td>
                        <td class="fix-${fix.difficulty} caption">${evaluateTeam(fix.is_home ? fix.team_a : fix.team_h)} (${ fix.is_home ? 'H' : 'A' })</td>
                      `
        fixturesTable.append(rowfields);
    })
}

const generateLineChart = async (chart, history) => {
    // clear any chart data 
    chart.innerHTML = '';

    // set the dimensions and margins of the graph
    let margin = {top: 10, right: 10, bottom: 60, left: 45},
    width = sectionBody.scrollWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    let svg = d3.select(`.${chart.getAttribute('class')}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    // Add X axis
    let x = d3.scaleLinear()
        .domain([1, d3.max(history, gw => gw.round)])
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(history.length));
    
    let maxSelected = d3.max(history, gw => gw.selected);
    let minDomain = d3.min(history, gw => chart == priceChart ? ((gw.value/10)-0.2) : 0 )
    let maxDomain = d3.max(history, gw => chart == priceChart ? ((gw.value/10)+0.2) : (gw.selected)/(evaluatePrefix(maxSelected)))

    // Add Y axis
    let y = d3.scaleLinear()
        .domain([minDomain, maxDomain])
        .range([ height, 0 ]);
        svg.append("g")
        .call(d3.axisLeft(y).ticks(chart == priceChart ? 5 : 10));

    // X label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate('+ (width/2) +',' + (height+30) + ')')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text('gameweek');

    // Y label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(-35,' + height/2 + ')rotate(-90)')
        .attr('class','axis-label')
        .style('font-family', 'Space Grotesk')
        .style('font-size', 14)
        .text( chart == priceChart ? `price(millions)` : `ownership ${((evaluatePrefix(maxSelected)) == 1000000) ? '(millions)' : (evaluatePrefix(maxSelected) == 1000) ? '(thousands)' : ''}`);
    
    // Add horizontal grid lines
    const yAxisGrid = d3.axisLeft(y)
        .tickSize( -(width) )
        .tickFormat('')
        .ticks(10);
    svg.append('g')
        .attr('class', 'y axis-grid')
        .call(yAxisGrid);

    // plot the line
    const path = svg.append("path")
        .datum(history)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 23, 81, 0.8)")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(gw => x(gw.round))
            .y(gw => y(chart == priceChart ? gw.value/10 : gw.selected/(evaluatePrefix(maxSelected))))
            )

    // get length of the plotted line 
    const pathLength = path.node().getTotalLength();

    // set stroke-dashoffset and stroke-dasharray for both lines
    path
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-dasharray', pathLength);
    
    // animate lines upon scrollig into view
    let chartAnimation = (entries) => {
        if(entries[0].intersectionRatio > 0){
            // animate avg and highest points line
            svg.selectAll('path')
                .transition()
                .ease(d3.easeExpInOut)
                .duration(3000)
                .attr('stroke-dashoffset', 0)
        
        }
    }
    let chartObserver = new IntersectionObserver(chartAnimation)
    chartObserver.observe(chart);
}

const playerSearch = async (e) => {
    e.preventDefault();
    const formValue = playerSearchFormField.value;
    let searchedPlayer = playerArray.find(player => player.playerName == formValue );
    // let player = await playerDetailFetch(searchedPlayer.id)
    playerSearchForm.setAttribute('action', `/player/${searchedPlayer.id}`);
    console.log(playerSearchForm.getAttribute('action'));
    playerSearchForm.submit();
}

playerSearchForm.addEventListener('submit', playerSearch)

const initHomepage = async () => {
    try {
        let playerId = renderedPlayer.id || 1;

        const query = ` { players { first_name second_name id } player(id: ${playerId}) { web_name chance_of_playing_next_round news team element_type first_name second_name now_cost cost_change_event total_points event_points selected_by_percent form ict_index pastFixtures { total_points value selected was_home minutes round team_h_score team_a_score opponent_team } UpcomingFixtures { team_h team_a event kickoff_time is_home difficulty } } }`
        // desctructure graphql response
        const graphQlResponse = await graphQlQueryFetch(query);
        let players = graphQlResponse.data.players;
        let player = graphQlResponse.data.player;
        let history = graphQlResponse.data.player.pastFixtures;
        let fixtures = graphQlResponse.data.player.UpcomingFixtures;

        playerArray = players.map(player => {
            return {
                playerName : `${player.first_name} ${player.second_name}`,
                id: player.id
            }
        })
        playerNames = players.map(player => `${player.first_name} ${player.second_name}` )
        console.log(fixtures);

        //
        // update player header info
        // 
        updatePlayerHeader(player)

        //
        // update player tables
        // configure toggle btns
        let historyBtn = document.querySelector('.history-btn');
        let fixturesBtn = document.querySelector('.fixtures-btn');

        historyBtn.addEventListener('click', (e) => {
            let btn = e.target;
            if(!btn.classList.contains('primary')){
                btn.classList.add('primary')
                fixturesBtn.classList.remove('primary')

                fixturesTable.classList.add('invisible')
                historyTable.classList.remove('invisible')
            }
        })
        
        fixturesBtn.addEventListener('click', (e) => {
            let btn = e.target;
            if(!btn.classList.contains('primary')){
                btn.classList.add('primary')
                historyBtn.classList.remove('primary')

                historyTable.classList.add('invisible')
                fixturesTable.classList.remove('invisible')
            }
        })
        // history table
        updateHistoryTable(history)

        // fixtures table
        updateFixturesTable(fixtures)

        //
        // update player charts
        // price chart
        generateLineChart(priceChart, history)
        // ownership chart
        generateLineChart(ownershipChart, history)

        function autocomplete(inp, arr) {
            /*the autocomplete function takes two arguments,
            the text field element and an array of possible autocompleted values:*/
            var currentFocus;
            /*execute a function when someone writes in the text field:*/
            inp.addEventListener("input", function(e) {
                var a, b, i, val = this.value;
                /*close any already open lists of autocompleted values*/
                closeAllLists();
                if (!val) { return false;}
                currentFocus = -1;
                /*create a DIV element that will contain the items (values):*/
                a = document.createElement("DIV");
                a.setAttribute("id", this.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");
                /*append the DIV element as a child of the autocomplete container:*/
                this.parentNode.appendChild(a);
                /*for each item in the array...*/
                for (i = 0; i < arr.length; i++) {
                    /*check if the item starts with the same letters as the text field value:*/
                    if (arr[i].toUpperCase().includes(val.toUpperCase())) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    // b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML = `<p class="mini-txt">${arr[i]}</p>`;
                    // b.innerHTML += `<p class="mini-txt">${arr[i].substr(val.length)}</p>`;
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                        b.addEventListener("click", function(e) {
                        /*insert the value for the autocomplete text field:*/
                        inp.value = this.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                    }
                }
            });
            /*execute a function presses a key on the keyboard:*/
            inp.addEventListener("keydown", function(e) {
                var x = document.getElementById(this.id + "autocomplete-list");
                if (x) x = x.getElementsByTagName("div");
                if (e.keyCode == 40) {
                    /*If the arrow DOWN key is pressed,
                    increase the currentFocus variable:*/
                    currentFocus++;
                    /*and and make the current item more visible:*/
                    addActive(x);
                } else if (e.keyCode == 38) { //up
                    /*If the arrow UP key is pressed,
                    decrease the currentFocus variable:*/
                    currentFocus--;
                    /*and and make the current item more visible:*/
                    addActive(x);
                } else if (e.keyCode == 13) {
                    /*If the ENTER key is pressed, prevent the form from being submitted,*/
                    e.preventDefault();
                    if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                    }
                }
            });
            function addActive(x) {
                /*a function to classify an item as "active":*/
                if (!x) return false;
                /*start by removing the "active" class on all items:*/
                removeActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                /*add class "autocomplete-active":*/
                x[currentFocus].classList.add("autocomplete-active");
            }
            function removeActive(x) {
                /*a function to remove the "active" class from all autocomplete items:*/
                for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
                }
            }
            function closeAllLists(elmnt) {
                /*close all autocomplete lists in the document,
                except the one passed as an argument:*/
                var x = document.getElementsByClassName("autocomplete-items");
                for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
                }
            }
            }
            /*execute a function when someone clicks in the document:*/
            document.addEventListener("click", function (e) {
                closeAllLists(e.target);
            });

        }
        autocomplete(document.getElementById("playerAutoComplete"), playerNames);
        
    } catch (err) {
        throw err
    }
}

initHomepage()