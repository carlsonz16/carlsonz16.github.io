function renderInvertedIndex(characterEntry, parentElement) {
    
    // Clear the previous content
    const container = d3.select(parentElement);
    container.selectAll('*').remove();

    // Update the character's name
    if (parentElement == "#wordcloud") {
        d3.select(parentElement+'-name').text(characterEntry.character);
        // Set the character's image
        setCharacterImage(characterEntry.character);
    }
    else {
        if (characterEntry.character == "All"){
            d3.select(parentElement+'-name').text("All Dialogue");
        }else {
            d3.select(parentElement+'-name').text("Season "+characterEntry.character + " Dialogue");
        } 
    }

    // Create a new WordCloud instance and draw it
    return new WordCloud({parentElement: parentElement}, characterEntry);
}



class WordCloud {
    constructor(_config, _characterEntry, _totalDatasetLength) {
        this.config = {
            parentElement: _config.parentElement,
            width: 500,
            height: 300,
            phraseLength: _config.phraseLength || 1
        };
        this.characterEntry = _characterEntry;
        this.invertedIndex = _characterEntry.inverted_index;
        this.totalDatasetLength = _totalDatasetLength;
        this.initVis();
        console.log()
        console.log(this.invertedIndex);
    }

    initVis() {
        this.svg = d3.select(this.config.parentElement)
            .append('svg')
            .attr('width', this.config.width)
            .attr('height', this.config.height);
        this.draw();
    }

    draw() {
        let words = Object.keys(this.invertedIndex).map(word => {
            let docs = this.invertedIndex[word];
            let freq = docs.reduce((total, {frequency}) => total + frequency, 0);
            return {
                text: word,
                size: freq,
                frequency: freq, // added this line
                indexes: docs.map(({index}) => index)
            };
        });

        // select gram length
        // words = words.filter(d => d.text.split(" ").length == this.config.phraseLength);
        // words = words.filter(d => d.text.split(" ").length == 1);

        words.sort((a, b) => b.size - a.size);
        words = words.slice(0, 100);

        let minLogFreq = Math.sqrt(d3.min(words, d => d.size));
        let maxLogFreq = Math.sqrt(d3.max(words, d => d.size));

        this.colorScale = d3.scaleLinear()
            .domain([minLogFreq, maxLogFreq])
            .range(['#66DFE7', '#001416']);

        const fontSizeScale = d3.scaleLinear()
            .domain([d3.min(words, d => d.size), d3.max(words, d => d.size)])
            .range([10, 70]);

        d3.layout.cloud()
            .size([this.config.width, this.config.height])
            .words(words)
            .padding(5)
            .rotate(() => 0)
            .font("Impact")
            .fontSize(d => fontSizeScale(d.size))
            .on("end", this.drawWords.bind(this))
            .start();
    }

    drawWords(words) {
        // Create a tooltip
        const tooltip = d3.select(this.config.parentElement)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#fff")
            .style("border", "1px solid #000")
            .style("padding", "5px");
    
        this.svg.append("g")
                .attr("transform", "translate(" + this.config.width / 2 + "," + this.config.height / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => d.size + "px")
                .style("font-family", "Impact")
                .style("fill", d => this.colorScale(d.size)) // Apply color scale here
                .attr("text-anchor", "middle")
                .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text(d => d.text)
                .on("mouseover", function(event, d) {
                    d3.select(event.target).style('fill', 'blue');
                    // Show the tooltip with the word and its frequency
                    tooltip.style("visibility", "visible")
                        .style("left", event.pageX + "px") // set the horizontal position
                        .style("top", event.pageY + "px") // set the vertical position
                        .html("Word: " + d.text + "<br/>Frequency: " + d.frequency);
                })
                .on("mouseout", (event, d) => { // Use arrow function here
                    // Hide the tooltip
                    d3.select(event.target).style('fill', this.colorScale(d.size));
                    tooltip.style("visibility", "hidden");
                })
                .on("click", d => { 
                    //pass
                });
    }
}