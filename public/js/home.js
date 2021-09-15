let cards = document.querySelector('.cards');
    
    let initHomepage = async () => {
        try{
            let container = document.querySelector('.container');

            const offset = el => {
                let rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
            }

            const players = await getAllPlayers();
            let sorted = players.sort((a,b) => (b.event_points) - (a.event_points)).slice(0, 6);
            const gw = await getGw()
            const currentGw = parseInt(gw[0].id);

            //
            //ON FIRE PLAYERS
            //
            sorted.forEach( async (player) => {
                    let playerEvents = await getPlayerEventsById(player.id);
                    let prevVal = playerEvents.history[playerEvents.history.length-1].value/10;
                    // let photo = await fetch(`${imagesUrl}${player.code}.png`);
                    // let photoBlob = await photo.blob();
                    // let imageObjectUrl = URL.createObjectURL(photoBlob);
                    // console.log(imageObjectUrl);
                    let playerCard = `  <div class="card-heading">
                                            <p class="caption">${evaluateTeam(player.team)}</p>
                                            <div class="card-stat1"> 
                                                <p class="mini-txt accent-font">${evaluatePosition(player.element_type)}</p>
                                            </div>
                                            <p class="mini-heading ">${player.web_name}</p>
                                        </div>
                                        <div class="card-body">
                                            <div class="card-body-top">
                                                <div class="card-stat2"> 
                                                    <p>
                                                        ${player.now_cost/10}
                                                        <span class="mini-txt">m</span></p>
                                                    </p>
                                                    <div class="price-indicator ${evalutePriceChange(prevVal, (player.now_cost/10))}"></div>
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
            // CAPTAINS TABLE
            //
            let captains = players.filter(captain => captain.now_cost > 70);

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
                })


            //
            //
            // DIFFERENTIALS SCATTER PLOT
            // 
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
                .text('potential');
            
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
                .filter(differential => differential.now_cost < 110 && differential.now_cost > 60 && differential.selected_by_percent < 20 && differential.minutes > (currentGw*90)/2);

            let computedDifferentials =  differentials.map(async differential => {
                let differentialEvents = await getPlayerEventsById(differential.id);

                return {
                    name: differential.web_name,
                    ownership: differential.selected_by_percent,
                    potential: (parseInt(differential.form)*0.2 + parseInt(differential.points_per_game)*0.5 + parseInt(differential.ict_index)*0.3)*0.4 + (5 - parseInt(differentialEvents.fixtures[0].difficulty)*0.6)
                }
            })
            
            //Read the data
            Promise.all(computedDifferentials)
                .then(differentials => {
                    // sort array to pick max and min potential values
                    let sortedDifferentials = differentials.sort((a,b) => b.potential - a.potential);
                    let maxPotential = Math.ceil(sortedDifferentials[0].potential);
                    let minPotential = Math.floor(sortedDifferentials[sortedDifferentials.length - 1].potential);
                    
                    // Add X axis
                    let x = d3.scaleLinear()
                                .domain([minPotential, maxPotential+0.5])
                                .range([ 0, width ]);
                                svg.append("g")
                                .attr("transform", "translate(0," + height + ")")
                                .call(d3.axisBottom(x).ticks(5));
                        
                    // Add Y axis
                    let y = d3.scaleLinear()
                        .domain([0, 20])
                        .range([ height, 0]);
                        svg.append("g")
                        .call(d3.axisLeft(y));

                    // Add dots
                    svg.append('g')
                        .selectAll("dot")
                        .data(differentials)
                        .enter()
                        .append("circle")
                            .attr("cx", 0 )
                            .attr("cy", height )
                            .attr('data-name', d => `${d.name}`)
                            .attr("r", 4)
                            .style("fill", "#f09292")

                    // Add labels
                    svg.append("g")
                        .selectAll("text")
                        .data(differentials)
                        .enter()
                        .append("text")
                            .attr('class', 'scatter-plot-labels')
                            .attr("font-family", "Space Grotesk")
                            .attr("font-size", 10)
                            .style('fill', '#000')
                            .attr("dy", "0.35em")
                            .attr("x", d => x(d.potential)+7)
                            .attr("y", d => y(d.ownership))
                            .attr('display', 'none')
                            .text(d => d.name);

                    let diffs = document.querySelector('.diffs');
                    let diffsGraphTop = offset(diffs).top+200;
    
                    document.addEventListener('scroll', () => {
                        if(scrollY > diffsGraphTop){
                            // Animate dots and their labels
                            svg.selectAll("circle")
                                .transition()
                                .duration(400)
                                .attr("cx", d => x(d.potential) )
                                .attr("cy", d => y(d.ownership) )
                            .delay((d,i) => i*70)
                            svg.selectAll('.scatter-plot-labels')
                                .transition()
                                .duration(400)
                                .attr('display', 'block')
                                .delay((d,i) => i*72)
                        }
                        console.log(scrollY, diffsGraphTop);
                    })
                })

        }catch(err){
            console.error(err);
        }
    }
    
    initHomepage();