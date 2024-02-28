class Scatterplot {
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 600, 
        margin: _config.margin || {top: 25, right: 20, bottom: 60, left: 60}, 
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.currentXLabel= _config.currentXLabel || 'Data Value';
      this.currentYLabel= _config.currentYLabel || 'Data Value';  
      this.data = _data;
      this.initVis();
      
    }

    setXVariable(variable) {
      this.xValue = d => d[variable];
      this.currentXLabel = variable.replace(/_/g, ' '); // Convert variable name to label
      // Update x-axis title
      this.chart.select('.x-axis-title').text(this.currentXLabel);
    }
  
    setYVariable(variable) {
      this.yValue = d => d[variable];
      this.currentYLabel = variable.replace(/_/g, ' '); // Convert variable name to label
      // Update y-axis title
      this.chart.select('.y-axis-title').text(this.currentYLabel);
    }

    updateXAxisLabel(newLabel) {
      this.chart.select('.x-axis-title')
          .text(newLabel);
    }
    
    // Method to update the Y-axis label
    updateYAxisLabel(newLabel) {
      this.chart.select('.y-axis-title')
          .text(newLabel);
    }
  
    // Use this method to integrate the update logic for scales and axes
    updateAxes() {
      // Update scales
      this.xScale.domain([d3.min(this.data, this.xValue), d3.max(this.data, this.xValue)]);
      this.yScale.domain([0, d3.max(this.data, this.yValue)]);
  
      // Update axes
      this.xAxisG.call(this.xAxis);
      this.yAxisG.call(this.yAxis);
  
      // Call updateVis to refresh the visualization
      this.updateVis();
    }

    
    initVis() {
        let vis = this;
  
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales
        vis.colorScale = d3.scaleOrdinal()
            .range(['#d3eecd', '#7bc77e', '#2a8d46'])
            .domain(['Rural', 'Small City', 'Urban']);
      
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
      
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
  
      // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(6)
            .tickSize(-vis.height - 10)
            .tickPadding(10);
      
        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSize(-vis.width - 10)
            .tickPadding(10);
  
      // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');
  
      // Append axis titles
        vis.chart.append('text')
            .attr('class', 'axis-title x-axis-title')
            .attr('transform', `translate(${vis.width / 2}, ${vis.height + 40})`)
            .style('text-anchor', 'middle')
            .text('Median Household Income');
  
        vis.chart.append('text')
            .attr('class', 'axis-title y-axis-title')
            .attr('transform', `rotate(-90)`)
            .attr('y', 0 - vis.config.margin.left)
            .attr('x', 0 - (vis.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle') 
            .text('Education less than High School percent');
    
        vis.colorValue = d => d.urban_rural_status;
        vis.xValue = d => d.median_household_income;
        vis.yValue = d => d.education_less_than_high_school_percent;
    }
  
    updateVis() {
      let vis = this;
      
      // Set the scale input domains
      vis.xScale.domain([d3.min(vis.data, vis.xValue), d3.max(vis.data, vis.xValue)]);
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
  
      // Add circles
      vis.circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.display_name)
        .join('circle')
            .attr('class', 'point')
            .attr('r', 5) // Adjusted for visibility
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('fill', d => vis.colorScale(vis.colorValue(d)));
  
      // Tooltip event listeners
      vis.circles
          .on('mouseover', (event, d) => {

            const xValue = vis.xValue(d); // Current x value
            const yValue = vis.yValue(d); 

            d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
              .html(`
                <div class="tooltip-title">${d.display_name}</div>
                <ul>
                  <li>${this.currentXLabel}: ${xValue}</li>
                  <li>${this.currentYLabel}: ${yValue}</li>
                </ul>
              `);
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });
      
      // Update the axes/gridlines
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove());
    }
  }
  