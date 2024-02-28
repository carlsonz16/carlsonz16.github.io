
let data, scatterplot;
d3.csv('data/national_health_data.csv')
  .then(_data => {
    data = _data;
    data.forEach(d => {
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
    
    scatterplot = new Scatterplot({ parentElement: '#scatterplot', currentXLabel: "Median Household Income", currentYLabel: "Education less that High School Percent"}, data);
    scatterplot.updateVis();

    // Listener for the x-axis selector
    d3.select('#dataX').on('change', function() {
      const selectedX = d3.select(this).property('value');
      const newLabel = selectedX.replace(/_/g, ' ');
      scatterplot.setXVariable(selectedX);
      scatterplot.updateXAxisLabel(newLabel)
      scatterplot.updateAxes();
    });

    // Listener for the y-axis selector
    d3.select('#dataY').on('change', function() {
      const selectedY = d3.select(this).property('value');
      const newLabel = selectedY.replace(/_/g, ' ');
      scatterplot.setYVariable(selectedY);
      scatterplot.updateYAxisLabel(newLabel);
      scatterplot.updateAxes();
    });
  })
  .catch(error => console.error(error));

d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedStatuses = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    selectedStatuses.push(d3.select(this).attr('data-status'));
  });

  // Filter data accordingly and update vis
  scatterplot.data = data.filter(d => selectedStatuses.includes(d.urban_rural_status));
  scatterplot.updateVis();
});