let leafletMap, timeline, shapeChart, monthChart, timeChart, durationChart, visList;

// Get the search bar and button elements
const searchBar = document.getElementById("word-search");
const searchButton = document.getElementById("search-button");
const resetButton = document.getElementById("reset-button");
const descButton = document.getElementById('toggle-info');
const description = document.getElementById('info');

// Get the full data and inverted index data
let data, invertedIndexData;

Promise.all([
  d3.csv('data/ufo_sightings.csv'),
  // d3.csv('data/ufoSample.csv'),
  d3.json('data/inverted_index_data.json')
])
.then(([_data, _inverted_index_data]) => {
    data = _data;

    invertedIndexData = _inverted_index_data.map(wordObj => {
        let word = wordObj.word;
        let docs = wordObj.indexes;
        let freq = wordObj.length;
        return {
            text: word,
            size: freq,
            indexes: docs
        };
    }).filter(word => word !== null);

    console.log(data[0]);
    console.log(data.length);

    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");

    data.forEach(d => {
      // console.log(d);

      const [datePart, timePart] = d.date_time.split(' ');
      const [hourStr, minuteStr] = timePart.split(':');
      const hour = parseInt(hourStr, 10);
      const [month, day, year] = datePart.split('/');
      const encounter_length = parseInt(d.encounter_length);
      d.tod = +hour;
      d.year = +year;
      d.month = +month;

      d.encounter_length = +encounter_length;

      d.latitude = +d.latitude; //make sure these are not strings
      d.longitude = +d.longitude; //make sure these are not strings
    
      d.date_time = parseTime(d.date_time);
      // Group into 10-year intervals by rounding down the year
      d.decade = Math.floor(d.date_time.getFullYear() / 5) * 5;

      const date = new Date(d.date_time);
      d.hour = date.getHours(); // getHours to get the hour of the sighting
      d.month = date.getMonth();
    });
    
    // Initialize the colorBy value
    let colorBy = "year";

    // Get the values that are in the dropdowns
    const colorOption = document.getElementById("color-by-option");

    colorOption.addEventListener("change", (event) => {
      colorBy = event.target.value;
      updateMapColor();
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#leaflet-map', legendElement: '#map-legend'}, data, colorBy);

    timeline = new Timeline({parentElement: '#timeline'}, data);
    // Wrap the two charts per row in a container div
    // const chartRow1 = d3.select("body").append("div").attr("class", "chart-row");
    // const chartRow2 = d3.select("body").append("div").attr("class", "chart-row");

    // Append the charts to their respective container divs
    shapeChart = new ShapeChart({parentElement: '#shape1'}, data);
    monthChart = new MonthChart({parentElement: '#month1'}, data);
    timeChart = new TimeChart({parentElement: '#time1'}, data);
    durationChart = new DurationChart({parentElement: '#duration1'}, data);
    wordCloud = new WordCloud({parentElement: '#wordcloud'}, invertedIndexData, data);

    // Function to update the scatterplot class
    function updateMapColor() {
      leafletMap.colorBy = colorOption.value;
      leafletMap.updateVis();
    }

    visList = [leafletMap, timeline, shapeChart, monthChart, timeChart, durationChart];

  })
  .catch(error => console.error(error));

// listen for a custom event from html elements which contain the visualizations
// event is triggered by a brush start 
// then call for brush to be reset on every other visualization

d3.selectAll('.parent').on('brush-start', function(event){
  searchBar.value='';
  visList.filter(d => d.config.parentElement.slice(1) != event.srcElement.id).forEach(function(d) {d.resetBrush();});
});

d3.selectAll('.parent').on('brush-selection', function(event){
  visList.filter(d => d.config.parentElement.slice(1) != event.srcElement.id)
      .forEach(function(d) {
          d.updateFromBrush(event.detail.brushedData);
  });
});

// Add an event listener to the search bar for the 'keydown' event
searchBar.addEventListener("keydown", (event) => {
  // Check if the key pressed was 'Enter'
  if (event.key === "Enter") {
    // Prevent the default action to stop the form from being submitted
    event.preventDefault();
    // Trigger the click event on the search button
    searchButton.click();
  }
});

// Add an event listener to the search button
searchButton.addEventListener("click", () => {
  // Get the search term
  const searchTerm = searchBar.value.trim();

  // If the search bar is not empty, proceed with the search
  if (searchTerm !== "") {
    // reset all charts
    d3.select('#wordcloud')
      .node()
      .dispatchEvent(new CustomEvent('brush-start', {}));

    // Find the word object for the search term in the inverted index data
    const wordObj = invertedIndexData.find(wordObj => wordObj.text == searchTerm);

    if (wordObj) {
        let filteredData = wordObj.indexes.map(index => data[index]);

        // Print the filtered data
        console.log(`Search Box - Data associated with '${searchTerm}':`, filteredData);
        d3.select('#wordcloud')
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}));

    } else {
        // If the word object is not found, print a message
        console.log(`Search Box -No data associated with '${searchTerm}'`);

        // Create a popup message
        const popup = document.createElement("div");
        popup.textContent = "Word not in data. Please try again!";
        popup.style.position = "absolute";
        popup.style.backgroundColor = "#f44336"; // Red
        popup.style.color = "white";
        popup.style.padding = "10px";
        popup.style.borderRadius = "5px";
        popup.style.top = searchBar.getBoundingClientRect().top + "px";
        popup.style.left = searchBar.getBoundingClientRect().left + "px";
        popup.style.opacity = "1";
        popup.style.transition = "opacity 0.5s"; // Transition over 1 second

        // Add the popup to the body
        document.body.appendChild(popup);

        // After 2 seconds, start fading out the popup
        setTimeout(() => {
          popup.style.opacity = "0";
        }, 1000);

        // After 3 seconds (1 second after the fade out starts), remove the popup
        setTimeout(() => {
          document.body.removeChild(popup);
        }, 1500);
    }
    searchBar.value = searchTerm;
  }
});

// resets other visualizations
resetButton.addEventListener("click", () => {
  // reset all charts
  d3.select('#wordcloud')
    .node()
    .dispatchEvent(new CustomEvent('brush-start', {}));

  leafletMap.reset();

  searchBar.value = '';


  // d3.select('#wordcloud')
  //   .node()
  //   .dispatchEvent(new CustomEvent('brush-selection', {detail:{
  //       brushedData: data
  //   }}));
});

descButton.addEventListener('click', () => {
  if (description.style.display === 'none'){
    descButton.innerHTML = 'Hide Info';
    description.style.display = 'block'
  }
  else{
    descButton.innerHTML = 'Show Info';
    description.style.display = 'none'
  }
})