class ChoroplethMap {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 0, right: 0, bottom: 0, left: 0},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150,
      dataProperty: _config.dataProperty || 'median_household_income', // Dynamically configure the data property
      legendTitle: _config.legendTitle || 'Data Value' // Dynamic legend title
    }
    this.data = _data;
    this.initVis();
  }

  mapUpdate(variable){
    this.config.dataProperty =variable;
    this.updateVis();
  }

  updateTitle(variable){
    this.config.legendTitle = variable
    this.updateVis();
  }
  
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.projection = d3.geoAlbersUsa();
    vis.geoPath = d3.geoPath().projection(vis.projection);

    vis.colorScale = d3.scaleLinear()
        .range(['#cfe2f2', '#0d306b'])
        .interpolate(d3.interpolateHcl);

    vis.linearGradient = vis.svg.append('defs').append('linearGradient')
        .attr("id", "legend-gradient");

    vis.legend = vis.chart.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);
    
    vis.legendRect = vis.legend.append('rect')
        .attr('width', vis.config.legendRectWidth)
        .attr('height', vis.config.legendRectHeight);

    vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text(vis.config.legendTitle);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    const dataPropertyValues = d3.extent(vis.data.objects.counties.geometries, d => d.properties[vis.config.dataProperty] ? d.properties[vis.config.dataProperty] : 0);
    
    vis.colorScale.domain(dataPropertyValues);

    vis.legendTitle.text(vis.config.legendTitle);

    vis.legendStops = [
      { color: '#cfe2f2', value: dataPropertyValues[0], offset: "0%"},
      { color: '#0d306b', value: dataPropertyValues[1], offset: "100%"}
    ];
    

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const countries = topojson.feature(vis.data, vis.data.objects.counties)

    vis.projection.fitSize([vis.width, vis.height], countries);

    const countyPath = vis.chart.selectAll('.county')
        .data(countries.features)
      .join('path')
        .attr('class', 'county')
        .attr('d', vis.geoPath)
        .attr('fill', d => {
          if (d.properties[vis.config.dataProperty] != null) {
            return vis.colorScale(d.properties[vis.config.dataProperty]);
          } else {
            return 'url(#lightstripe)';
          }
        });

    countyPath
        .on('mousemove', (event,d) => {
          const dataValue = d.properties[vis.config.dataProperty] ? `<strong>${d.properties[vis.config.dataProperty]}</strong>` : 'No data available'; 
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.properties.name}</div>
              <div>${dataValue} ${vis.config.legendTitle}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    vis.legend.selectAll('.legend-label')
        .data(vis.legendStops)
      .join('text')
        .attr('class', 'legend-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('y', 20)
        .attr('x', (d,index) => {
          return index == 0 ? 0 : vis.config.legendRectWidth;
        })
        .text(d => Math.round(d.value * 10 ) / 10);

    vis.linearGradient.selectAll('stop')
        .data(vis.legendStops)
      .join('stop')
        .attr('offset', d => d.offset + '%')
        .attr('stop-color', d => d.color);

    vis.legendRect.attr('fill', 'url(#legend-gradient)');
  }
}
