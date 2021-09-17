let cards = document.querySelector('.cards');
    
    let initHomepage = async () => {
        try{
            let container = document.querySelector('.container');
            let sectionBody = document.querySelector('.section-body');

            const offset = el => {
                let rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
            }

            const players = await getAllPlayers();
            let sorted = players.sort((a,b) => (b.event_points) - (a.event_points)).slice(0, 6);
            const gws = await getGws()
            const gw = gws.filter(gw => gw.is_current == true);
            const currentGw = gw[0].id;
            const nextGw = gws.filter(gw => gw.id == currentGw+1);

            //
            // DEADLINE BANNER
            //
            const gameweekContainer = document.querySelector('.gameweek-number');
            const deadline = document.querySelector('.deadline');
            gameweekContainer.innerHTML = nextGw[0].id;
            
            const date = new Date(nextGw[0].deadline_time);
            const [hours, minutes] = [date.getHours(), date.getMinutes(), date.getDay(),date.getMonth()]
            const day = date.toString().substring(0,10)
            deadline.innerHTML = `${day}, ${hours}:${minutes}hrs`;


            //
            // CHIPS BAR
            //
            let chips = gw[0].chip_plays.map(chip => { 
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
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            
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

            // Add Y label
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate( -35,'+ height/2 + ')rotate(-90)')
                .attr('class','axis-label')
                .style('font-family', 'Space Grotesk')
                .style('font-size', 14)
                .text('plays (millions)');

            // Bars
            svg.selectAll("mybar")
                .data(chips)
                .enter()
                .append("rect")
                .attr("x", d => x(d.chip_name))
                .attr("y", d => y(0))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(0))
                .attr("fill", "#3a4257")
                
            let barAnimation = (entries) => {

                if(entries[0].intersectionRatio > 0){
                    // animate bars
                    svg.selectAll("rect")
                        .transition()
                        .duration(800)
                        .attr("y", d => y(d.num_played))
                        .attr("height", d => height - y(d.num_played))
                        .delay((d,i) => i*100)
                }else{
                }
            }

            let observer = new IntersectionObserver(barAnimation)
            let target = document.querySelector('.chips-bar')
            observer.observe(target);

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
            
        }catch(err){
            console.error(err);
        }
    }
    
    initHomepage();