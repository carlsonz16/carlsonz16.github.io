# The Truth Is Out There!

Built by Alexandru Dediu, Andrew Gerstenslager, Nick Murray, and Zach Carlson

[Live Webpage](https://adediu25.github.io/vis-proj2/)

This web application visualizes UFO sightings reported to the National UFO Reporting Center using various methods.
Visualizations in this application allow the user to make individual conclusions about sighting data and trends by providing various views of the data.
Sighting location is visualized using an interactive map.
Bar graphs display sighting count by various attributes.
A word cloud and word search give insight into the text descriptions associated with the sightings.
Users are also given the option to select a subset of the data from any visualization which will update the other visualization to reflect the selection.
Thus, a user is able to focus on any portion of data to aid in forming conclusions from the data.

## Data

The data visualized within this application consists of UFO sightings reported to the [National UFO Reporting Center](https://nuforc.org/). 
The visualized dataset contains 80,332 reported sightings from across the globe.

Below is a list of attributes included for each sighting in the dataset:
- Date and time of sighting
- City or area of sighting
- Country 
- UFO Shape
- Length of encounter in seconds
- Described encounter length (natural language description)
- Description of UFO encounter
- Date of report
- Latitude and longitude of sighting


## Visualization Components

### Map

The map is situated at the top of the page and is focused on the USA by default. 

#### Using the Map

Moving the map: Click and drag anywhere on the map to pan the map.

Zooming the map: Scrolling to zoom is disabled by default.
After clicking on the map, scroll zooming is enabled, and clicking outside of the map will disable it again.
Otherwise, zooming can always be done with the plus and minus buttons in the upper left corner. 

Changing map baselayer: Hovering over the layer button in the upper right corner will reveal 3 options for the map baselayer: street map, satellite, and topographic.

![image](https://github.com/adediu25/vis-proj2/assets/71360172/2d7d84a8-e1d7-44d5-b9f5-16c714aeca31)

#### Data Interactions

Details on demand: Hovering the cursor over any data point on the map will reveal more detailed information about that sighting within a tooltip.

![image](https://github.com/adediu25/vis-proj2/assets/71360172/d9a18bf2-918f-42e0-8fcd-949f19176c86)

Coloring options: By default, the data points are colored by the year of the sighting.
The color scale is shown below the map.
The dropdown menu above the map provides different options for coloring.
Chosing a different option will update the points on the map to their new color.

![image](https://github.com/adediu25/vis-proj2/assets/71360172/16db1e2e-11c5-42c2-8937-98d87f36a265)


### Word Filtering

Next to the map there are two filtering options using text: a wordcloud and a search bar. Both serve a similar purpose of filtering data to keywords. 

The wordcloud has the top 100 words displayed with size as the display to show the relative frequency. 

When a word is clicked on or a word in the inverted index is searched in the search box, the data and charts will automatically adjust to display only the indexes that contain the word in the description. 

There is also a reset button to clear the selection. 

### Bar Charts

The application includes 5 bar charts, each visualizing data using a different attributes. 

The first chart is a timeline which displays the number of sightings by year.

The chart at the top left of the grid of 4 charts displays the number of sightings by UFO shape.

The chart at the top right of the grid of 4 charts displays the number of sightings by month.

The chart at the bottom left of the grid of 4 charts displays the number of sightings by time of day.

The chart at the bottom right of the grid of 4 charts displays the number of sightings by encounter length, grouped into 5 bins.

#### Interactions

The following interactions works identically on all bar charts.

Details on demand: Hovering the cursor over any bar on the chart will reveal more detailed information about that group of data.

![image](https://github.com/adediu25/vis-proj2/assets/71360172/690d8501-087e-4a7f-a6fb-c3aa293b224d)

Brushing: click and drag horizontally to make a brushing selection on the chart.
Any bars within the brush selection will be selected.
The other bar charts and map will update to visualize only the data that has been selected. 

![image](https://github.com/adediu25/vis-proj2/assets/71360172/c6256e25-d775-41bd-a752-f56e127b0e4a)


## Visual Design

### UI Layout

The layout and sizing was designed on a 1080p monitor with 125% scaling in the Windows settings. The rendering of the web page may be unexpected with different screen sizes and scalings.

The UI layout is mainly based on the preliminary sketched, detailed below.
We decided to have the map and word filtering at the top as they are the most interesting parts of the application.
Grouping all the bar charts together makes most sense since they show data in a similar way.

### Color

We decided on choosing steel blue for the basic chart coloring, like the bars and words in the word cloud. 
It is a familiar color that really fits with anything.
We did not think there was any reason to have a color scheme for the timeline as we essentially just made a bar chart.

When brushing on a bar chart, unselected bars on that chart will change to gray.
This will help in highlighting which data has been selected.

#### Map Data Point Coloring

We chose different colorings depending on the nature of the attribute.

Year: years are ordinal, we use `interpolateOranges`, a sequential color scheme from D3. We chose orange because it the least amount of color conflict with all of the map base layers.

Month: months are ordinal, but a year is also cyclical. 
Thus, we decided to use the D3 cyclical scheme `interpolateRainbow`.

Time of Day: time of day is ordinal but also cyclical like months are. 
Thus, we decided to use the D3 cyclical scheme `interpolateRainbow`.

Encounter Length: encounter length is continuous and sequential. 
We decided to color data points based on bins to protect from outliers on the top end.
The size of each sequential bin is twice as wide as the last.
We also use the orange color scheme here for the same reasons as above.

Here we chose encounter length as an option instead of UFO shape because there are too many unique shapes for a categorical color scheme to work effectively.

### Sketches

The first sketch has the initial thoughts we had for a the map, timeline and bar charts and their layout on the page. 
The second sketch shows alternate ideas for the visualizations and layout, as well as including a search option for the text analysis, which we ended up implementing.
These sketches provided us with a clear and achievable goal for the application.

![image](https://github.com/adediu25/vis-proj2/assets/71360172/13101ae9-c4e4-45d1-b4e4-1cec88b6bb40)

![image](https://github.com/adediu25/vis-proj2/assets/71360172/95efae37-034e-4e19-a77d-6a34aea289d4)


## Visualization Discoveries

Selecting the word "light" or "lights" and looking at the shapes graph below you can indeed see the disproportionate number of "light" shaped objects in the distribution showing a strong correlation between description and the shape. The same pattern can be seen for the word/shape combinations for most of the shapes including fireball, triangular/triangle, orb, and circular to name a few.  

As to be exptected, lots of the top words include color, shapes, directions and adjectives all associated with ufos.

Encounters with green in the description are relatively short.

Most of the encounters from 1906 to 1994 are "disk" shaped which is the most common pop culture representation of an alien space craft.

The greatest amount of sightings by time were at midnight, and of those sightings, the greatest amount of shape reported was a light.

The number of sighting peaks in the summer months of June, July, and August. This makes sense as people are spending more time outside.

There were reported encounter lengths that lasted for a full day, which seems crazy.

## Development Process

Source code can be accessed at [GitHub](https://github.com/adediu25/vis-proj2), and a live version is hosted on [GitHub Pages](https://adediu25.github.io/vis-proj2/).
Otherwise, hosting the repository on a server and accessing the index.html file will have the running app.

The two libraries used in creating this application are [D3](https://d3js.org/) and [Leaflet](https://leafletjs.com/).
Leaflet is used to implement the interactive map.
D3 is used to develop all the other visualizations and manage data in the application.

The inverted index data is preprocessed to save on compute time in the site itself. 
Before precomputing the data as another file to read in, the latency to open the site was 10-20 seconds which adds up with constant refreshing. 
This preprocessing was done in Python using the pandas, json, and nltk (natural language processing toolkit) libraries. 
Pandas read in the csv and tokenized and processed each description, then nltk was used in conjunction with some python dictionaries to construct the inverted index while nltk was used to eliminate stop words, and finally the json library was used to write a json file for the js frontend to read in. 

The data read in is ready to go and is used by both the search bar and the wordcloud.
The search bar would allow the user to find words not in the wordcloud. 
With how we preprocessed the data, we did not keep the stopwords in. 
This could always be changed by saving an additional flag such that the wordcloud does not display words with the stop flag set to true. 
The search bar also has a feature to have a popup display if the word searched for is not in the inverted index. 
Selecting or searching a relevant word will then update the vis with the appropriate indexes.

The code for the color scale legend (`legend.js`) is adapted from this source: https://observablehq.com/@d3/color-legend

### Code Structure
***data/***
- generate_idf.ipynb
  - loads in ufo_sightings.csv
  - preprocesses the data
  - creates idf json
  - saves out data
- ufo_sightings.csv
  - primary data source
  - all data is in reference to this file
- inverted_index_data.json
  - stores the inverted index for all non stop words
  - also stores the length of the inverted index
- ufoSample.csv
  - truncated dataset used during development for faster performance during testing

***js/***
- main.js
  - loads sightings dataset
  - loads word inverted index data
  - instantiates all visualization objects
  - handles inter-visualization updates
  - handles word search logic with search bar
- leafletMap.js
  - initializes leaflet map with custom options
  - handles drawing of data points
  - handles color updates
  - calls legend function
- durationChart.js, timeChart.js, monthChart.js, shapeChart.js, timeline.js
  - all files are very similar, they implement the respective visualizations
  - initialize chart
  - groups data based on respective attribute (timeline is by year)
  - update chart after brush selection
  - fire update after brush selection
- wordcloud.js
  - handles plotting the words
  - takes top 100 words and bounds their frequencies to 15-70 px
  - on a word click will call the charts/map to update their data
 
Below is the abstracted workflow of how visualizations are updated upon a brush selection:

1. User starts brushing
2. Object sends event to parent element signaling a brush start
3. Event handled in main.js, calls `resetBrush()` on all other visualization objects. This ensures max one brush is active at once across the whole page
4. User ends brush selection
5. Object sends event to parent element signaling brush end and includes the filtered data set
6. Event handled in main.js, calls `updateFromBrush(filteredData)` on all other visualization objects
7. Each visualization object updates the visualization using the filtered data

## Member Contributions

### Alexandru Dediu

- Project management (code reviews, task planning and division, organizing repository, etc)
- Color choices and component layout and sizing
- Base leaflet map with ability to change base layer
- Bar chart brushing selection functionality
- Implemented all chart updates on brush or word filtering selection

### Andrew Gerstenslager

- Created the word cloud and search bar components. 
- Wrote the script to preprocess the text data for indexing words.
- Implemented filtering data on word cloud selection or search bar input.

### Nick Murray

- Implemented changing map data coloring (dropdown input, event listeners, scales, color scales, etc)
- css changes

### Zachary Carlson

- Built base bar charts (timeline, and 4 additional bar charts)

## Video Demo

[Youtube Link](https://youtu.be/yyWZ17pefXk)
