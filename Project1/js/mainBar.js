// Load data and initialize bar chart using 'chartData' as the variable
let chartData, barChart;
d3.csv('data/national_health_data.csv')
  .then(_chartData => {
    chartData = _chartData;
    // Convert string properties to numbers
    chartData.forEach(d => {
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

    d3.select('#dataBar1').on('change', function() {
      const selectedData = d3.select(this).property('value');
      const newLabel = selectedData.replace(/_/g, ' ');
      barChart.changeData(selectedData);
      barChart.changeLegend(newLabel);
    });

    d3.select('#dataBar2').on('change', function() {
      const selectedData = d3.select(this).property('value');
      const newLabel = selectedData.replace(/_/g, ' ');
      barChart1.changeData(selectedData);
      barChart1.changeLegend(newLabel);
    });
    
    // Initialize bar chart with the processed data
    barChart = new BarChart({ parentElement: '#barChart', dataProperty: 'median_household_income', legendTitle: 'Median Household Income'}, chartData);
    barChart1 = new BarChart({ parentElement: '#barChart1', dataProperty: 'poverty_perc', legendTitle: 'Poverty Perc'}, chartData);
    barChart.updateVis();
    barChart1.updateVis();


  })
  .catch(error => console.error(error));
