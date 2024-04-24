class Timeline {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        };
        this.data = _data;
        this.fullData = this.data;
        this.resettingBrush = false;
        this.updatingFromBrush = false;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Aggregate data by year and sort
        const sightingsByYear = d3.group(vis.data, d => d.year);
        let countsByYear = Array.from(sightingsByYear, ([year, records]) => ({year, count: records.length}));
        countsByYear.sort((a, b) => a.year - b.year);

        // Set the dimensions and margins of the graph
        const margin = {top: 20, right: 40, bottom: 50, left: 60},
            width = window.innerWidth - margin.left - margin.right - 75,
            height = 300 - margin.top - margin.bottom;

        vis.height = height;

        // Set the ranges and domains
        vis.xScale = d3.scaleBand().range([0, width]).padding(0.1).domain(countsByYear.map(d => d.year)),
        vis.yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(countsByYear, d => d.count)]);

        vis.svg = d3.select(vis.config.parentElement)
            .append('div')
            .style("text-align", "center")
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        vis.chart = vis.svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`); 
        
        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush')

        vis.brush = d3.brushX()
            .extent([[0,0], [width, height]]);

        // Add the x Axis
        vis.xAxisG = vis.chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .style("text-anchor", "end") 
            .attr("dx", "-.8em") 
            .attr("dy", "-.5em") 
            .attr("transform", "rotate(-90)"); 


        // Add the y Axis
        vis.yAxisG = vis.chart.append("g")
            .call(d3.axisLeft(vis.yScale));

        // Add x axis label
        vis.svg.append("text")
            .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 40})`)
            .style("text-anchor", "middle")
            .text("Year");

        // Add y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (height / 2) - margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style('font-size', '14px')
            .text("Number of Sightings");


        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // Aggregate data by year and sort
        const sightingsByYear = d3.group(vis.data, d => d.year);
        vis.countsByYear = Array.from(sightingsByYear, ([year, records]) => ({year, count: records.length}));
        vis.countsByYear.sort((a, b) => a.year - b.year);

        vis.yScale.domain([0, d3.max(vis.countsByYear, d => d.count)]);

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // Append the rectangles for the bar chart
        vis.chart.selectAll(".bar")
            .data(vis.countsByYear)
        .join('rect')
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.year))
            .attr("width", vis.xScale.bandwidth())
            .attr("y", d => vis.yScale(d.count))
            .attr("height", d => vis.height - vis.yScale(d.count))
            .attr("fill", "steelblue");

        const tooltip = d3.select(".tooltip");

        const bars = vis.chart.selectAll('.bar');

        vis.svg.selectAll(".bar")
        .on("mousemove", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.year} </strong><br>Sightings: ${d.count}`)
                .style("left", (event.pageX - 60) + "px")
                .style("top", (event.pageY - 70) + "px");
        })
        .on("mouseleave", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('mousedown', (event, d) => {
            let brush_element = vis.svg.select('.overlay').node();
            let new_event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                pageX: event.pageX,
                pageY: event.pageY,
                clientX: event.clientX,
                clientY: event.clientY
            })
            brush_element.dispatchEvent(new_event);
        });

        vis.yAxisG.call(d3.axisLeft(vis.yScale));

        vis.brushG.call(vis.brush.on('end', function({selection}) {
            if (selection){
                const [x0, x1] = selection;
                bars
                    .style("fill", "lightgray")
                    .filter(d => x0 <= vis.xScale(d.year) + vis.xScale.bandwidth() && vis.xScale(d.year) < x1)
                    .style("fill", "steelblue")
                    .data();
            }
            else {
                bars.style("fill", "steelblue");
            }
            
            if(!vis.resettingBrush && !vis.updatingFromBrush && selection){
                const [x0, x1] = selection;

                let filteredData = vis.data.filter(d => x0 <= vis.xScale(d.year) + vis.xScale.bandwidth() && vis.xScale(d.year) < x1);

                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}));
            }
            else if(!vis.resettingBrush && !vis.updatingFromBrush && !selection){
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: vis.fullData
                    }}));
            }

        })
        .on('start', function(){
            if (!vis.resettingBrush){
                // vis.data = vis.fullData;
                vis.updateVis();
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-start', {}));
            }
        }));
    }

    resetBrush(){
        let vis = this;
        vis.resettingBrush = true;
        vis.brushG.call(vis.brush.clear);
        vis.updateVis();
        vis.resettingBrush = false;
    }

    updateFromBrush(brushedData){
        let vis = this;

        vis.updatingFromBrush = true;
        vis.data = brushedData;
        vis.updateVis();
        vis.updatingFromBrush = false;
        vis.data = vis.fullData;
    }
}

// class Timeline {
//     /**
//    * Class constructor with basic configuration
//    * @param {Object}
//    * @param {Array}
//    */
//   constructor(_config, _data) {
//     this.config = {
//       parentElement: _config.parentElement,
//     }
//     this.data = _data;
//     this.initVis();
//   }

//   initVis(){
//     let vis = this;

//     // Aggregate data by decade and sort
//     const sightingsByDecade = d3.group(vis.data, d => d.decade);
//     let countsByDecade = Array.from(sightingsByDecade, ([decade, records]) => ({decade, count: records.length}));
//     countsByDecade = countsByDecade.sort((a, b) => a.decade - b.decade); // Ensure sorted by decade

//     // Determine the range of decades
//     const minDecade = d3.min(countsByDecade, d => d.decade);
//     const maxDecade = d3.max(countsByDecade, d => d.decade);
//     const decades = Array.from(new Array((maxDecade - minDecade) / 5 + 1), (val, index) => minDecade + index * 5);

//     // Set the dimensions and margins of the graph
//     const margin = {top: 20, right: 20, bottom: 30, left: 40},
//         width = 960 - margin.left - margin.right,
//         height = 500 - margin.top - margin.bottom;

//     // Set the ranges
//     const x = d3.scaleBand().range([0, width]).padding(0.1).domain(decades),
//         y = d3.scaleLinear().range([height, 0]);

//     vis.svg = d3.select(vis.config.parentElement)
//         .append('svg')
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)

//     vis.chart = vis.svg
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Scale the range of the data in the domains
//     y.domain([0, d3.max(countsByDecade, d => d.count)]);

//     // Append the rectangles for the bar chart
//     vis.svg.selectAll(".bar")
//         .data(countsByDecade)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => x(d.decade))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.count))
//         .attr("height", d => height - y(d.count))
//         .attr("fill", "#3498db");

//     // Add the x Axis
//     vis.svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x).tickFormat(d3.format("d")));

//     // Add the y Axis
//     vis.svg.append("g")
//         .call(d3.axisLeft(y));

//     // Add x axis label
//     vis.svg.append("text")
//         .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 20})`)
//         .style("text-anchor", "middle")
//         .text("Decade");

//     // Add y axis label
//     vis.svg.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0)
//         .attr("x", 0 - (height / 2) - margin.top)
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .text("Number of Sightings");

//     // Tooltip
//     const tooltip = d3.select(".tooltip");

//     vis.svg.selectAll(".bar")
//         .on("mouseover", (event, d) => {
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(`${d.decade}-${d.decade+5} </strong><br>Sightings: ${d.count}`)
//                 .style("left", (event.pageX - 60) + "px")
//                 .style("top", (event.pageY - 70) + "px");
//         })
//         .on("mouseout", () => {
//             tooltip.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//         });
//   }
// }
