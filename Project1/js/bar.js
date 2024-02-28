class BarChart {
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 25, right: 20, bottom: 60, left: 80},
        tooltipPadding: _config.tooltipPadding || 15,
        dataProperty: _config.dataProperty || 'median_household_income',
        legendTitle: _config.legendTitle || 'Data Value' 
      }
      this.data = _data;
      this.initVis();
    }
    
    changeData(variable){
      this.config.dataProperty = variable;
      this.updateVis();
    }

    changeLegend(variable){
      this.chart.select('.y-axis-title').text(variable);
    }
  
    initVis() {
      let vis = this;
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .padding(0.1);
  
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]);
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale);
      vis.yAxis = d3.axisLeft(vis.yScale).ticks(6);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
  
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
  
      // Specify the value fields
      vis.xValue = d => d.urban_rural_status;
      vis.yValue = d => d[vis.config.dataProperty];
  
      // Initialize tooltip
      vis.tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #000")
        .style("border-radius", "5px")
        .style("padding", "10px");

        vis.chart.append('text')
            .attr('class', 'axis-title y-axis-title')
            .attr('transform', `rotate(-90)`)
            .attr('y', 0 - vis.config.margin.left) 
            .attr('x', 0 - (vis.height / 2)) 
            .attr('dy', '1em') 
            .style('text-anchor', 'middle')
            .text(vis.config.legendTitle); 
    }
  
    updateVis() {
      let vis = this;
    
      // Update scales
      vis.xScale.domain(vis.data.map(vis.xValue));
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
    
      // Calculate the height difference and filter out negative values
      let height_fix = d => vis.height - vis.yScale(vis.yValue(d));
      let filteredDataset = vis.data.filter(d => height_fix(d) >= 0);
    
      // Since the filtering is done, use filteredDataset instead of vis.data for drawing bars
      vis.chart.selectAll('.bar')
          .data(filteredDataset, vis.xValue) // Use filtered dataset
          .join('rect')
          .attr('class', 'bar')
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => height_fix(d)) 
          .attr('fill', '#69b3a2')
          .on("mouseover", function(event, d) {
            vis.tooltip.html(`Income: $${d.median_household_income}<br/>Poverty: ${d.poverty_perc}%<br/>Education < HS: ${d.education_less_than_high_school_percent}%`)
                .style("visibility", "visible");
          })
          .on("mousemove", function(event) {
            vis.tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
          })
          .on("mouseout", function() {
            vis.tooltip.style("visibility", "hidden");
          });

          vis.yValue = d => d[vis.config.dataProperty];
    
      // Update the axes

      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
    
  }
  