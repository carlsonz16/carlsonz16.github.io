class WordCloud {
    constructor(_config, _invertedIndex, _fullData) {
        this.config = {
            parentElement: _config.parentElement,
            width: 500,
            height: 400
        };
        this.words = _invertedIndex;
        this.fullData = _fullData;
        this.initVis();
    }

    initVis() {
        this.draw();
    }

    draw() {
        let words = this.words;

        words.sort((a, b) => b.size - a.size);
        words = words.slice(0, 100);
        const fontSizeScale = d3.scaleLinear()
            .domain([d3.min(words, d => d.size), d3.max(words, d => d.size)])
            .range([10, 70]);

        this.layout = d3.layout.cloud()
            .size([this.config.width, this.config.height])
            .words(words)
            .padding(5)
            .rotate(() => 0)
            .font("Impact")
            .fontSize(d => fontSizeScale(d.size))
            .on("end", this.drawWords.bind(this));

        this.layout.start();
    }

    drawWords(words) {
        d3.select(this.config.parentElement).append("svg")
            .attr("width", this.layout.size()[0])
            .attr("height", this.layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => d.size + "px")
            .style("font-family", "Impact")
            .style("fill", "steelblue")
            .attr("text-anchor", "middle")
            .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
            .text(d => d.text)
            .on("click", (event, d) => {
                // reset all charts
                d3.select(this.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-start', {}));

                // set search box to word clicked on
                document.getElementById("word-search").value = d.text;

                let filteredData = d.indexes.map(index => this.fullData[index]);
                console.log("WordCloud - Data associated with '" + d.text + "':", filteredData);
                d3.select(this.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}));
            });
    }
}

