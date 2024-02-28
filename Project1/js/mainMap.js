Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const countyPopulationData = data[1];

  // Convert necessary strings to numbers
  countyPopulationData.forEach(d => {
    d.poverty_perc = +d.poverty_perc;
    d.median_household_income = +d.median_household_income;
    d.education_less_than_high_school_percent = +d.education_less_than_high_school_percent;
    d.air_quality = +d.air_quality;
    d.park_access = +d.park_access;
    d.percent_inactive = +d.percent_inactive;
    d.percent_smoking = +d.percent_smoking;
    d.elderly_percentage = +d.elderly_percentage;
    d.number_of_hospitals = +d.number_of_hospitals;
    d.number_of_primary_care_physicians = +d.number_of_primary_care_physicians;
    d.percent_no_heath_insurance = +d.percent_no_heath_insurance;
    d.percent_high_blood_pressure = +d.percent_high_blood_pressure;
    d.percent_coronary_heart_disease = +d.percent_coronary_heart_disease;
    d.percent_stroke = d.percent_stroke;
    d.percent_high_cholesterol = d.percent_high_cholesterol;
  });

  // Deep copy of geoData for different maps
  const geoDataForMap1 = JSON.parse(JSON.stringify(geoData));
  const geoDataForMap2 = JSON.parse(JSON.stringify(geoData));

  // Enhance geoData with corresponding data for each map
  geoDataForMap1.objects.counties.geometries.forEach(geo => {
    const match = countyPopulationData.find(d => d.cnty_fips === geo.id);
    if (match) {
      Object.keys(match).forEach(key => {
        geo.properties[key] = match[key];
      });
    }
  });
  

  geoDataForMap2.objects.counties.geometries.forEach(geo => {
    const match = countyPopulationData.find(d => d.cnty_fips === geo.id);
    if (match) {
      Object.keys(match).forEach(key => {
        geo.properties[key] = match[key];
      });
    }
  });

  d3.select('#dataMap1').on('change', function() {
    const newData = d3.select(this).property('value');
    const newLabel = newData.replace(/_/g, ' ');
    choroplethMap.mapUpdate(newData);
    choroplethMap.updateTitle(newLabel);
  });

  d3.select('#dataMap2').on('change', function() {
    const newData = d3.select(this).property('value');
    const newLabel = newData.replace(/_/g, ' ');
    choroplethMap1.mapUpdate(newData);
    choroplethMap1.updateTitle(newLabel);
  });

  // Initialize the maps with their respective datasets and configurations
  const choroplethMap = new ChoroplethMap({ 
    parentElement: '#map',
    dataProperty: 'median_household_income', // Specify the property to visualize
    legendTitle: 'Median Household Income' // Custom legend title for this map
  }, geoDataForMap1);

  const choroplethMap1 = new ChoroplethMap({ 
    parentElement: '#map1',
    dataProperty: 'poverty_perc', // Specify the property for this map
    legendTitle: 'Poverty Percentage' // Custom legend title for this map
  }, geoDataForMap2);
  
})
.catch(error => console.error(error));
