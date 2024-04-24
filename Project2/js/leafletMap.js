class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _colorBy) {
    this.config = {
      parentElement: _config.parentElement,
      legendElement: _config.legendElement
    }
    this.data = _data;
    this.colorBy = _colorBy;
    this.fullData = this.data;
    this.resettingBrush = false;
    this.updatingFromBrush = false;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    vis.radiusSize = 3;

    // Initialize the color scale based on the selected option
    switch (vis.colorBy) {
      case 'year':
        vis.colorScale = d3.scaleSequential()
          .domain(d3.extent(vis.data, d => d.year))
          .interpolator(d3.interpolateOranges);
        vis.legendTitle = 'Year';
        break;
      case 'month':
        vis.colorScale = d3.scaleSequential()
          .domain([1, 12]) // Months range from 1 to 12
          .interpolator(d3.interpolateRainbow);
        vis.legendTitle = 'Month';
        break;
      case 'tod':
        vis.colorScale = d3.scaleSequential()
          .domain([0, 23])
          .interpolator(d3.interpolateRainbow);
        vis.legendTitle = 'Time of Day (24 hr)';
        break;
      case 'encounter_length':
        vis.colorScale = d3.scaleThreshold()
          .domain([60, 300, 600, 1800, 3600, 21600, 43200, 86400])
          .range(d3.schemeOranges[8]);
        vis.legendTitle = 'Encounter Length (seconds)';
        break;
      default:
        vis.colorScale = d3.scaleSequential()
          .domain(d3.extent(vis.data, d => d.year))
          .interpolator(d3.interpolateOranges);
          vis.legendTitle = 'Year';
    }

    // Loop through each data point and assign a color based on the selected option
    vis.data.forEach(d => {
      switch (vis.colorBy) {
        case 'year':
          d.colorFill = vis.colorScale(d.year);
          break;
        case 'month':
          d.colorFill = vis.colorScale(d.month);
          break;
        case 'tod':
          d.colorFill = vis.colorScale(d.tod);
          break;
        case 'encounter_length':
          d.colorFill = vis.colorScale(d.encounter_length);
          break;
        default:
          d.colorFill = vis.colorScale(d.year);
      }
    });

    // Satellite Map
    vis.satUrl = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}'
    vis.satAttr = 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'

    // Street Map
    vis.streetUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    vis.streetAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    // Topo Map
    vis.topoUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    vis.base_layers = {
      'Street Map': L.tileLayer(vis.streetUrl, {
        attribution: vis.streetAttr,
        ext: 'png'
      }),
      'Satellite': L.tileLayer(vis.satUrl, {
        attribution: vis.satAttr,
        ext: 'png'
      }),
      'Topographic': L.tileLayer(vis.topoUrl, {
        attribution: vis.topoAttr,
        ext: 'png'
      }),
    }

    vis.theMap = L.map('leaflet-map', {
      center: [40, -80],
      zoom: 4,
      layers: [vis.base_layers['Street Map']],
      scrollWheelZoom: false
    });

    // only zoom with scroll after map click, disable after clicking on map
    vis.theMap.on('focus', () => { vis.theMap.scrollWheelZoom.enable(); });
    vis.theMap.on('blur', () => { vis.theMap.scrollWheelZoom.disable(); });

    vis.layerControl = L.control.layers(vis.base_layers, {}).addTo(vis.theMap);

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data.filter(d => d.latitude && d.longitude))
                    .join('circle')
                        .attr("fill", d => d.colorFill) 
                        .attr("stroke", "black")
                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", 3)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", "red") //change the fill
                              .attr('r', vis.radiusSize + 1); //change radius

                            //create a tool tip
                            d3.select('#tooltip')
                                .style('opacity', 1)
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(`<div class="tooltip-label">City: ${d.city_area}<br/>
                                      Year: ${d.year}<br/>
                                      Month: ${d.month}<br/>
                                      Time of Day (24h): ${d.tod}<br/>
                                      Encounter Length: ${vis.formatEncounterLength(d.encounter_length)}<br/></div>`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", d => d.colorFill) //change the fill
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

                          })
                        .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
                           // vis.newZoom = vis.theMap.getZoom()+2;
                           // if( vis.newZoom > 18)
                           //  vis.newZoom = 18; 
                           // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                          });
    
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });

    legend({
      color: vis.colorScale,
      parentElement: vis.config.legendElement,
      title: vis.legendTitle
    })
  }

  updateVis() {
    let vis = this;

    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data.filter(d => d.latitude && d.longitude))
                    .join('circle')
                        .attr("fill", d => d.colorFill) 
                        .attr("stroke", "black")
                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
                        .attr("r", 3)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", "red") //change the fill
                              .attr('r', vis.radiusSize + 1); //change radius

                            //create a tool tip
                            d3.select('#tooltip')
                                .style('opacity', 1)
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(`<div class="tooltip-label">City: ${d.city_area}<br/>
                                      Year: ${d.year}<br/>
                                      Month: ${d.month}<br/>
                                      Time of Day (24h): ${d.tod}<br/>
                                      Encounter Length: ${vis.formatEncounterLength(d.encounter_length)}<br/></div>`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", d => d.colorFill) //change the fill
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

                          })
                        .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
                           // vis.newZoom = vis.theMap.getZoom()+2;
                           // if( vis.newZoom > 18)
                           //  vis.newZoom = 18; 
                           // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                          });

    // Update the color scale and colors of data points based on the selected option
    switch (vis.colorBy) {
      case 'year':
        vis.colorScale = d3.scaleSequential()
          .domain(d3.extent(vis.data, d => d.year))
          .interpolator(d3.interpolateOranges);
        vis.legendTitle = 'Year';
        break;
      case 'month':
        vis.colorScale = d3.scaleSequential()
          .domain([1, 12]) // Months range from 1 to 12
          .interpolator(d3.interpolateRainbow);
        vis.legendTitle = 'Month';
        break;
      case 'tod':
        vis.colorScale = d3.scaleSequential()
          .domain([0, 24]) // Time of day ranges from 0 to 24
          .interpolator(d3.interpolateRainbow);
        vis.legendTitle = 'Time of Day (24h)';
        break;
      case 'encounter_length':
        vis.colorScale = d3.scaleThreshold()
          .domain([60, 300, 600, 1800, 3600, 21600, 43200, 86400])
          .range(d3.schemeOranges[8]);
        vis.legendTitle = 'Encounter Length (seconds)';
        break;
      default:
        vis.colorScale = d3.scaleSequential()
          .domain(d3.extent(vis.data, d => d.year))
          .interpolator(d3.interpolateOranges);
          vis.legendTitle = 'Year';
    }

    // Loop through each data point and update its color
    vis.data.forEach(d => {
      switch (vis.colorBy) {
        case 'year':
          d.colorFill = vis.colorScale(d.year);
          break;
        case 'month':
          d.colorFill = vis.colorScale(d.month);
          break;
        case 'tod':
          d.colorFill = vis.colorScale(d.tod);
          break;
        case 'encounter_length':
          d.colorFill = vis.colorScale(d.encounter_length);
          break;
        default:
          d.colorFill = vis.colorScale(d.year);
      }
    });

    legend({
      color: vis.colorScale,
      parentElement: vis.config.legendElement,
      title: vis.legendTitle
    })

    // Update visualization with new colors
    vis.Dots.attr("fill", d => d.colorFill);

    //want to see how zoomed in you are? 
    console.log(vis.theMap.getZoom()); //how zoomed am I
    console.log(vis.theMap.getCenter());
    
    //want to control the size of the radius to be a certain number of meters? 
    // vis.radiusSize = 3; 

    if( vis.theMap.getZoom() > 12 ){
      let metresPerPixel = 40075016.686 * Math.abs(Math.cos(vis.theMap.getCenter().lat * Math.PI/180)) / Math.pow(2, vis.theMap.getZoom()+8);
      let desiredMetersForPoint = 100; //or the uncertainty measure... =) 
      vis.radiusSize = desiredMetersForPoint / metresPerPixel;
    }

    console.log(vis.radiusSize);
   
   //redraw based on new zoom- need to recalculate on-screen position
    // vis.Dots
    //   .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
    //   .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
    //   .attr("r", vis.radiusSize)
    //   .attr("fill", d => d.colorFill);

  }


  renderVis() {
    let vis = this;

    //not using right now... 
 
  }

  resetBrush(){
    // let vis = this;
    // vis.data = vis.fullData;
    // vis.updateVis();
    return
    
    
    vis.resettingBrush = true;
    vis.brushG.call(vis.brush.clear);
    vis.updateVis();
    vis.resettingBrush = false;
  }

  reset(){
    let vis = this;
    vis.data = vis.fullData;
    vis.updateVis();
  }

  updateFromBrush(brushedData){
    let vis = this;

    vis.updatingFromBrush = true;
    vis.data = brushedData;
    vis.updateVis();
    vis.updatingFromBrush = false;
    // vis.data = vis.fullData;
  }

  formatEncounterLength(seconds) {
    if (seconds < 60) {
      return `${seconds} second(s)`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute(s) ${remainingSeconds} second(s)`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour(s) ${remainingMinutes} minute(s)`;
    }
  }

}
