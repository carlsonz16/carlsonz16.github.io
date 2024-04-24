class CharacterBar {
    constructor(_config, _data) {
        // Configuration object with defaults
        // Important: depending on your vis and the type of interactivity you need
        // you might want to use getter and setter methods for individual attributes
        this.config = {
          parentElement: _config.parentElement,
          containerWidth: _config.containerWidth || 500,
          containerHeight: _config.containerHeight || 400,
          margin: _config.margin || {top: 20, right: 5, bottom: 30, left: 50},
          tooltipPadding: _config.tooltipPadding || 10,
        }
        this.data = _data;
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
            .text('Number of Lines');

        // x axis
        vis.svg.append("text")
            .attr("transform", `translate(${vis.width / 2 + vis.config.margin.left},${vis.height + vis.config.margin.top + 30})`)
            .style("text-anchor", "middle")
            .text("Season");
        
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.seasonDialogues = [];
        vis.data.season_episode_pairs.forEach(d => {
            let dEntry = vis.seasonDialogues.find(e => e.season == +d.season);
            if (dEntry){
                dEntry.dialogues += d.dialogues;
            } else {
                dEntry = {
                    season: +d.season,
                    dialogues: d.dialogues
                };
                vis.seasonDialogues.push(dEntry);
            }
        });

        for (let i = 1; i < 27; i++) {
            let e = vis.seasonDialogues.find(x => x.season == i);

            if (!e){
                vis.seasonDialogues.push({
                    season: i,
                    dialogues: 0
                });
            }
        }

        vis.seasonDialogues.sort((a,b) => a.season - b.season);

        vis.xScale.domain(vis.seasonDialogues.map(d => d.season));
        vis.yScale.domain([0, d3.max(vis.seasonDialogues, d => d.dialogues)]);
        
        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        const bars = vis.chart.selectAll('.bar')
            .data(vis.seasonDialogues)
        .join('rect')
            .attr('class', 'bar')
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.yScale(0) - vis.yScale(d.dialogues))
            .attr('y', d => vis.yScale(d.dialogues))
            .attr('x', d => vis.xScale(d.season))
            .attr('fill', '#00B8C4');

        bars
            .on('mousemove', (event,d) => {
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                    <div class="tooltip-title">Season ${d.season}</div>
                    <div><i>Total lines: ${d.dialogues}</i></div>
                `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
        
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}