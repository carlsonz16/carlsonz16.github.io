class ProfanityChart {
    constructor(_config, _data, season="All") {
        // Configuration object with defaults
        // Important: depending on your vis and the type of interactivity you need
        // you might want to use getter and setter methods for individual attributes
        this.config = {
          parentElement: _config.parentElement,
          containerWidth: _config.containerWidth || 700,
          containerHeight: _config.containerHeight || 400,
          margin: _config.margin || {top: 20, right: 5, bottom: 20, left: 50},
          tooltipPadding: _config.tooltipPadding || 10,
        }
        this.season = season;
        this.data = _data;
        this.fullData = this.data;
        this.resettingBrush = false;
        this.updatingFromBrush = false;
        this.initVis();
      }

    initVis(){
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
                .attr("width", vis.config.containerWidth)
                .attr("height", vis.config.containerHeight)

        // vis.brushG = vis.svg.append('g')
        //     .attr('class', 'brush');
        
        vis.chart = vis.svg
            .append("g")
                .attr("transform",`translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize scales
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append titles

        vis.svg.append('text')
            .attr('class', 'y-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Number of Profanities');
        
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // filters out characters that do not appear in the season
        let filtered = vis.data.filter(d => d.seasonProfanityCount[vis.season]);

        // grab top 10 for charting
        vis.top10 = filtered.toSorted((a,b) => b.seasonProfanityCount[vis.season] - a.seasonProfanityCount[vis.season]).slice(0,10);

        console.log(vis.top10);

        vis.xScale.domain(vis.top10.map(d => d.character));
        vis.yScale.domain([0, d3.max(vis.top10, d => d.seasonProfanityCount[vis.season])]);
        
        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        const bars = vis.chart.selectAll('.bar')
            .data(vis.top10)
        .join('rect')
            .attr('class', 'bar')
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.yScale(0) - vis.yScale(d.seasonProfanityCount[vis.season]))
            .attr('y', d => vis.yScale(d.seasonProfanityCount[vis.season]))
            .attr('x', d => vis.xScale(d.character))
            .attr('fill', '#00B8C4');

        bars
            .on('mousemove', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">${d.character}</div>
                    <div><i>Profanities: ${d.seasonProfanityCount[vis.season]}</i></div>
                `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
        
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}