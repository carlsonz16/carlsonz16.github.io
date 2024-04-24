document.addEventListener('DOMContentLoaded', function() {
    const mainCharacters = ['Kyle', 'Cartman', 'Kenny', 'Stan', 'Butters', 'Randy', 'Mr. Garrison', 'Jimmy', 'Mr. Mackey', 'Chef'];

    // Colors picked by color of characters' hats
    const colors = {
        'Kyle': '#55B949',     
        'Cartman': '#00B8C4',  
        'Kenny': '#F26F03',    
        'Stan': '#4D7DBD'      
    };

    const defaultColor = '#d9b99b';

    Promise.all([
        d3.csv('data/season_csvs/Season-1.csv'),
        d3.csv('data/season_csvs/Season-2.csv'),
        d3.csv('data/season_csvs/Season-3.csv'),
        d3.csv('data/season_csvs/Season-4.csv'),
        d3.csv('data/season_csvs/Season-5.csv'),
        d3.csv('data/season_csvs/Season-6.csv'),
        d3.csv('data/season_csvs/Season-7.csv'),
        d3.csv('data/season_csvs/Season-8.csv'),
        d3.csv('data/season_csvs/Season-9.csv'),
        d3.csv('data/season_csvs/Season-10.csv'),
        d3.csv('data/season_csvs/Season-11.csv'),
        d3.csv('data/season_csvs/Season-12.csv'),
        d3.csv('data/season_csvs/Season-13.csv'),
        d3.csv('data/season_csvs/Season-14.csv'),
        d3.csv('data/season_csvs/Season-15.csv'),
        d3.csv('data/season_csvs/Season-16.csv'),
        d3.csv('data/season_csvs/Season-17.csv'),
        d3.csv('data/season_csvs/Season-18.csv'),
        d3.csv('data/season_csvs/Season-19.csv'),
        d3.csv('data/season_csvs/Season-20.csv'),
        d3.csv('data/season_csvs/Season-21.csv'),
        d3.csv('data/season_csvs/Season-22.csv'),
        d3.csv('data/season_csvs/Season-23.csv'),
        d3.csv('data/season_csvs/Season-24.csv'),
        d3.csv('data/season_csvs/Season-25.csv'),
        d3.csv('data/season_csvs/Season-26.csv'),
    ]).then(function(season_csvs) {
        const drawChart = (seasonIndex) => {
            let allLines = seasonIndex === 'All' ? season_csvs.flat() : season_csvs[seasonIndex - 1];

            // Create a map to count episodes for each character
            const episodeCounts = {};

            // Iterate over each line to populate the episodeCounts map
            allLines.forEach((line, index) => {
                const character = line.Character;
                const episode = line.Episode;
                const season = line.Season;
                const uniqueEpisodeId = `Season ${season} - Episode ${episode}`;

                if (mainCharacters.includes(character)) {
                    if (!episodeCounts[character]) {
                        episodeCounts[character] = new Set();
                    }
                    episodeCounts[character].add(uniqueEpisodeId);
                }
            });

            //console.log('Episode counts:', episodeCounts); // Debugging statement to check episode counting

            // Convert the Set counts to simple counts of episodes
            const data = Object.keys(episodeCounts).map(character => ({
                character: character,
                episodes: episodeCounts[character].size
            }));

            // Clear the previous chart
            d3.select("#bar-chart2").selectAll("*").remove();

            // Set up the dimensions of the chart
            const margin = { top: 20, right: 20, bottom: 70, left: 70 };
            const width = 960 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            // Create the x and y scales
            const x = d3.scaleBand()
                .range([0, width])
                .padding(0.1)
                .domain(data.map(d => d.character));

            const y = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(data, d => d.episodes)]);

            // Append the svg object to the div
            const svg = d3.select("#bar-chart2").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Tooltip setup
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background", "#fff")
                .style("border", "1px solid #000")
                .style("padding", "5px");

            // Create the bars and set their colors based on the character
            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.character))
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.episodes))
                .attr("height", d => height - y(d.episodes))
                .attr("fill", d => colors[d.character] || defaultColor)  // Apply color based on character
                .on("mouseover", function(event, d) {
                    tooltip.style("visibility", "visible")
                           .html(`Character: ${d.character}<br>Episodes: ${d.episodes}`)
                           .style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip.style("top", (event.pageY - 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });

            // Add the x Axis with a label
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.append("text")
                .attr("class", "label")
                .attr("x", width / 2)
                .attr("y", width / 2)
                .style("text-anchor", "middle")
                .text("Character");

            // Add the y Axis with a label
            svg.append("g")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", -height/2)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Number of Episode Appearances");
        };

        // Initial draw
        drawChart('All');

        // Setup event listener for the dropdown
        document.getElementById('season-select').addEventListener('change', function() {
            const season = this.value;
            drawChart(season);
        });
    }).catch(error => console.error('Error loading CSV:', error));
});
