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
            // PRICE PER MILLION TABLE
            //
            let ppmPlayers = players.filter(player => player.selected_by_percent < 15 );

            let computedPpm = ppmPlayers.map( player => {
                let ppm = (player.total_points/(player.now_cost/10)).toFixed(2);

                return {
                    ...player,
                    ppm: ppm
                }
            })

            let sortedPpm = computedPpm
                .sort((a,b) => (b.ppm) - (a.ppm))
                // .filter(captain => captain.chance_of_playing_next_round != 0)
                .slice(0, 15)

            sortedPpm.forEach(player => {
                let rowfields = `
                    <td>${player.web_name} <span class="caption">(${player.now_cost/10} m)</span></td>
                    <td>${player.total_points}</td>
                    <td>${player.ppm}</td>
                `
                let row = document.createElement('tr');
                row.innerHTML = rowfields;
                document.querySelector('table').appendChild(row);
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
                    })
                })

        }catch(err){
            console.error(err);
        }
    }
    
    initHomepage();