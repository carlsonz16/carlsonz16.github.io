let data; // Declare data as a global variable
let stopwords; // Declare stopwords as a global variable
let profanity;
let characterInfo = [];
let seasonInfo = [];
let allInfo = {character:'All', inverted_index:{}, season_episode_pairs: []};
// chart objects
let profanityChart;
let wordCloud;
let allCloud;
let characterLine;
let wordLine;

const description = document.getElementById('info');
const descButton = document.getElementById('toggle-info');
const searchBar = document.getElementById("character-search");
const searchButton = document.getElementById("search-button");
const phraseSelect = document.getElementById('phrase-select');
const phraseSearch = document.getElementById('word-search');
const phraseSearchButton = document.getElementById('search-button-word');

// Load CSV file and process data
Promise.all([
    d3.csv('data/season_csvs/Season-1.csv'),
    d3.csv('data/season_csvs/Season-2.csv'),
    d3.csv('data/season_csvs/Season-3.csv'),
    d3.csv('data/season_csvs/Season-4.csv'),
    d3.csv('data/season_csvs/Season-5.csv'),
    d3.csv('data/season_csvs/Season-6.csv'),
    d3.csv('data/season_csvs/Season-7.csv'),
    d3.csv('data/season_csvs/Season-8.csv'),
    d3.csv('data/season_csvs/Season-9.csv'),
    d3.csv('data/season_csvs/Season-10.csv'),
    d3.csv('data/season_csvs/Season-11.csv'),
    d3.csv('data/season_csvs/Season-12.csv'),
    d3.csv('data/season_csvs/Season-13.csv'),
    d3.csv('data/season_csvs/Season-14.csv'),
    d3.csv('data/season_csvs/Season-15.csv'),
    d3.csv('data/season_csvs/Season-16.csv'),
    d3.csv('data/season_csvs/Season-17.csv'),
    d3.csv('data/season_csvs/Season-18.csv'),
    d3.csv('data/season_csvs/Season-19.csv'),
    d3.csv('data/season_csvs/Season-20.csv'),
    d3.csv('data/season_csvs/Season-21.csv'),
    d3.csv('data/season_csvs/Season-22.csv'),
    d3.csv('data/season_csvs/Season-23.csv'),
    d3.csv('data/season_csvs/Season-24.csv'),
    d3.csv('data/season_csvs/Season-25.csv'),
    d3.csv('data/season_csvs/Season-26.csv'),
]).then(loadedData => {
    data = loadedData.flat(); // Flatten the array of arrays into a single array

    // Process each line to be just the words as a list
    data = data.map(d => {
        d.words = filterStopwordsAndPunctuation(d.Line);
        return d;
    });

    let dataIndex = 0; // Add this line before the forEach loop

    data.forEach(d => {
        // Find the existing entry for the character
        let characterEntry = characterInfo.find(entry => entry.character === d.Character);
        let seasonEntry = seasonInfo.find(entry => entry.character === d.Season);
        
        // If the character doesn't exist in the inverted index data yet, create a new entry
        if (!characterEntry) {
            characterEntry = {
                character: d.Character,
                inverted_index: {},
                season_episode_pairs: [],
                episode_profanity_pairs: []
            };
            characterInfo.push(characterEntry);
        }

        if (!seasonEntry) {
            seasonEntry = {
                character: d.Season,
                inverted_index: {},
                season_episode_pairs: []
            };
            seasonInfo.push(seasonEntry);
        }
        
        // Update the inverted index and season_episode_pairs
        let wordCounts = d.words.reduce((counts, word) => {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {});


        Object.entries(wordCounts).forEach(([word, count]) => {
            // characters
            if (!characterEntry.inverted_index[word]) {
                characterEntry.inverted_index[word] = [];
            }
            characterEntry.inverted_index[word].push({index: dataIndex, frequency: count});

            // seasons
            if (!seasonEntry.inverted_index[word]) {
                seasonEntry.inverted_index[word] = [];
            }
            seasonEntry.inverted_index[word].push({index: dataIndex, frequency: count});

            // all
            if (!allInfo.inverted_index[word]) {
                allInfo.inverted_index[word] = [];
            }
            allInfo.inverted_index[word].push({index: dataIndex, frequency: count});
        });
        let pair = {season: d.Season, episode: d.Episode, dialogues: 1};

        let profanityCount = d.words.reduce((total,word) => {
            return profanity.includes(word) ? total+1 : total;
        }, 0)
        let profanityPair = {season: d.Season, episode: d.Episode, profanity: profanityCount}

        // update season episode pairs
        // characters
        let existingPair = characterEntry.season_episode_pairs.find(e => e.season === pair.season && e.episode === pair.episode);
        if (existingPair) {
            existingPair.dialogues++;
        } else {
            characterEntry.season_episode_pairs.push(pair);
        }

        // seasons
        existingPair = seasonEntry.season_episode_pairs.find(e => e.season === pair.season && e.episode === pair.episode);
        if (existingPair) {
            existingPair.dialogues++;
        } else {
            seasonEntry.season_episode_pairs.push(pair);
        }

        // all
        existingPair = allInfo.season_episode_pairs.find(e => e.season === pair.season && e.episode === pair.episode);
        if (existingPair) {
            existingPair.dialogues++;
        } else {
            allInfo.season_episode_pairs.push(pair);
        }

        let existingProfanity = characterEntry.episode_profanity_pairs.find(e => e.episode === profanityPair.season && e.season === profanityPair.season);
        if (existingProfanity){
            existingProfanity.profanity++;
        } else {
            characterEntry.episode_profanity_pairs.push(profanityPair);
        }

        dataIndex++; // Increment dataIndex at the end of the loop
    });

    // count profanity
    characterInfo.forEach(characterEntry => {
        let seasonCounts = characterEntry.episode_profanity_pairs.reduce((counts, pair) => {
            counts["All"] = counts["All"] ? counts["All"]+pair.profanity : pair.profanity;
            counts[pair.season] = counts[pair.season] ? counts[pair.season]+pair.profanity : pair.profanity;
            return counts;
        }, {});

        characterEntry.seasonProfanityCount = seasonCounts;
    });

    createForceGraph(data); 
    // console.log(data);
    // console.log(characterInfo);

    // Get the 4th character's info
    let characterEntry = characterInfo[3];
    wordCloud = new WordCloud({parentElement: '#wordcloud'}, characterEntry, data.length);    // Get the entries of the inverted_index object and sort them by total frequency
    allCloud = new WordCloud({parentElement: '#allcloud'}, allInfo, data.length);
    profanityChart = new ProfanityChart({parentElement: '#char-profanity'}, characterInfo);
    characterLine = new CharacterBar({parentElement: '#character-linechart'}, characterEntry);       
    wordLine = new WordBar({parentElement: '#phrase-linechart'}, seasonInfo, "guys")
    setCharacterImage(characterEntry.character);

    // Take the top 10 most used words
    
}).catch(error => console.error(error));

d3.select("#season-select").on("input", function(){
    let season = +this.value;

    if (this.value == "All"){
        profanityChart.season = this.value;
    }else{
        profanityChart.season = season;
    }   
    profanityChart.updateVis();

    if (this.value === "All") {
        renderInvertedIndex(allInfo,'#allcloud');
        document.getElementById('char-profanity-name').innerText = "Profanity by Character All Seasons";
        document.getElementById('bar1-name').innerText = "Dialogue Lines by Character All Seasons";
        document.getElementById('bar2-name').innerText = "Episode Appearances by Character All Seasons";
    }
    else {
        renderInvertedIndex(seasonInfo.find(e => e.character == season),'#allcloud');
        document.getElementById('char-profanity-name').innerText = "Profanity by Character Season " + season;
        document.getElementById('bar1-name').innerText = "Dialogue Lines by Character Season " + season;
        document.getElementById('bar2-name').innerText = "Episode Appearances by Character Season " + season;
    }
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
});

searchBar.addEventListener("keydown", (event) => {
    // Check if the key pressed was 'Enter'
    if (event.key === "Enter") {
      // Prevent the default action to stop the form from being submitted
      event.preventDefault();
      // Trigger the click event on the search button
      searchButton.click();
    }
});

searchButton.addEventListener("click", () => {
    const searchTerm = searchBar.value.trim().toLowerCase();

    if (searchTerm !== "") {
        const characterEntry = characterInfo.find(e => e.character.toLowerCase() === searchTerm);

        if (characterEntry){
            renderInvertedIndex(characterEntry, '#wordcloud');
            characterLine.data = characterEntry;
            characterLine.updateVis();
            document.getElementById('character-linechart-name').innerText = "Dialogue by Season for " + characterEntry.character;
        } else {
            // Create a popup message
            const popup = document.createElement("div");
            popup.textContent = "Character not found. Please try again!";
            // popup.style.position = "absolute";
            popup.style.backgroundColor = "#f44336"; // Red
            popup.style.color = "white";
            popup.style.padding = "10px";
            popup.style.borderRadius = "5px";
            // popup.style.top = searchBar.getBoundingClientRect().top + "px";
            // popup.style.left = searchBar.getBoundingClientRect().left + "px";
            popup.style.opacity = "1";
            popup.style.transition = "opacity 0.5s"; // Transition over 1 second

            // Add the popup to the body
            document.getElementById('search-container').appendChild(popup);

            // After 2 seconds, start fading out the popup
            setTimeout(() => {
                popup.style.opacity = "0";
            }, 1000);

            // After 3 seconds (1 second after the fade out starts), remove the popup
            setTimeout(() => {
                document.getElementById('search-container').removeChild(popup);
            }, 1500);
        }
    }
});

// phraseSelect.addEventListener('input', function(){
//     let characterEntry = wordCloud.characterEntry;
//     let seasonEntry = allCloud.characterEntry;
    
//     wordCloud = renderInvertedIndex(characterEntry, "#wordcloud");
//     allCloud = renderInvertedIndex(seasonEntry,'#allcloud');
// });

phraseSearch.addEventListener("keydown", (event) => {
    // Check if the key pressed was 'Enter'
    if (event.key === "Enter") {
      // Prevent the default action to stop the form from being submitted
      event.preventDefault();
      // Trigger the click event on the search button
      phraseSearchButton.click();
    }
});

phraseSearchButton.addEventListener("click", () => {
    const searchTerm = phraseSearch.value.trim().toLowerCase();

    if (searchTerm !== "") {
        const wordEntry = allInfo.inverted_index[searchTerm];

        if (wordEntry){
            wordLine.word = searchTerm;
            wordLine.updateVis();
            document.getElementById('phrase-linechart-name').innerText = "Word/Phrase Frequency by Season: " + searchTerm;
        } else {
            // Create a popup message
            const popup = document.createElement("div");
            popup.textContent = "Word not in data. Please try again!";
            // popup.style.position = "absolute";
            popup.style.backgroundColor = "#f44336"; // Red
            popup.style.color = "white";
            popup.style.padding = "10px";
            popup.style.borderRadius = "5px";
            // popup.style.top = searchBar.getBoundingClientRect().top + "px";
            // popup.style.left = searchBar.getBoundingClientRect().left + "px";
            popup.style.opacity = "1";
            popup.style.transition = "opacity 0.5s"; // Transition over 1 second

            // Add the popup to the body
            document.getElementById('search-container-word').appendChild(popup);

            // After 2 seconds, start fading out the popup
            setTimeout(() => {
                popup.style.opacity = "0";
            }, 1000);

            // After 3 seconds (1 second after the fade out starts), remove the popup
            setTimeout(() => {
                document.getElementById('search-container-word').removeChild(popup);
            }, 1500);
        }
    }
});

function print_character_top_words(characterEntry){

    let sortedWords = Object.entries(characterEntry.inverted_index).sort((a, b) => {
        let totalFrequencyA = a[1].reduce((total, {frequency}) => total + frequency, 0);
        let totalFrequencyB = b[1].reduce((total, {frequency}) => total + frequency, 0);
        return totalFrequencyB - totalFrequencyA;
    });
    let topWords = sortedWords.slice(0, 10);

    console.log(`The most used words by ${characterEntry.character} are:`);
    topWords.forEach(([word, occurrences]) => {
        let totalFrequency = occurrences.reduce((total, {frequency}) => total + frequency, 0);
        console.log(`${word}: ${totalFrequency} times`);
    });

};

function setCharacterImage(name) {
    const characterImageElement = document.getElementById('character-image');
    switch (name.toLowerCase()) {
        case 'cartman':
            characterImageElement.src = 'images/cartman.jpg';
            break;
        case 'kyle':
            characterImageElement.src = 'images/kyle.jpg';
            break;
        case 'stan':
            characterImageElement.src = 'images/stan.jpg';
            break;
        case 'kenny':
            characterImageElement.src = 'images/kenny.jpg';
            break;
        case 'butters':
            characterImageElement.src = 'images/butters.jpg';
            break;
        case 'chef':
            characterImageElement.src = 'images/chef.jpg';
            break;
        case 'clyde':
            characterImageElement.src = 'images/clyde.jpg';
            break;
        case 'ike':
            characterImageElement.src = 'images/ike.jpg';
            break;
        case 'jimmy':
            characterImageElement.src = 'images/jimmy.jpg';
            break;
        case 'mr. garrison':
            characterImageElement.src = 'images/mrGarrison.jpg';
            break;
        case 'garrison':
            characterImageElement.src = 'images/mrGarrison.jpg';
            break;
        case 'mr. mackey':
            characterImageElement.src = 'images/mrMackey.jpg';
            break;
        case 'randy':
            characterImageElement.src = 'images/randy.jpg';
            break;
        case 'token':
            characterImageElement.src = 'images/tolkien.jpg';
            break;
        case 'tolkien':
            characterImageElement.src = 'images/tolkien.jpg';
            break;
        case 'wendy':
            characterImageElement.src = 'images/wendy.jpg';
            break;
        case 'gerald':
            characterImageElement.src = 'images/gerald.jpg';
            break;
        case 'sharon':
            characterImageElement.src = 'images/sharon.jpg';
            break;
        case 'sheila':
            characterImageElement.src = 'images/sheila.jpg';
            break;
        case 'liane':
            characterImageElement.src = 'images/liane.jpg';
            break;
        case 'craig':
            characterImageElement.src = 'images/craig.jpg';
            break;
        case 'stephen':
            characterImageElement.src = 'images/stephen.jpg';
            break;
        case 'linda':
            characterImageElement.src = 'images/linda.jpg';
            break;
        case 'tweek':
            characterImageElement.src = 'images/tweek.jpg';
            break;
        case 'announcer':
            characterImageElement.src = 'images/announcer.jpg';
            break;
        case 'pc principal':
            characterImageElement.src = 'images/pcPrincipal.jpg';
            break;
        case 'heidi':
            characterImageElement.src = 'images/heidi.jpg';
            break;
        case 'jimbo':
            characterImageElement.src = 'images/jimbo.jpg';
            break;
        case 'jesus':
            characterImageElement.src = 'images/jesus.jpg';
            break;
        case 'principal victoria':
            characterImageElement.src = 'images/principalVictoria.jpg';
            break;
        case 'scott':
            characterImageElement.src = 'images/scott.jpg';
            break;
        case 'mayor':
            characterImageElement.src = 'images/mayor.jpg';
            break;
        case 'mrs. garrison':
            characterImageElement.src = 'images/mrsGarrison.jpg';
            break;
        case 'terrance':
            characterImageElement.src = 'images/terranceAndPhillip.jpg';
            break;
        case 'phillip':
            characterImageElement.src = 'images/terranceAndPhillip.jpg';
            break;
        case 'shelly':
            characterImageElement.src = 'images/shelly.jpg';
            break;
        case 'bebe':
            characterImageElement.src = 'images/bebe.jpg';
            break;
        case 'mr. hankey':
            characterImageElement.src = 'images/mrHankey.jpg';
            break;
        case 'stuart':
            characterImageElement.src = 'images/stuart.jpg';
            break;
        case 'pip':
            characterImageElement.src = 'images/pip.jpg';
            break;
        case 'michael':
            characterImageElement.src = 'images/michael.jpg';
            break;
        case 'yates':
            characterImageElement.src = 'images/yates.jpg';
            break;
        case 'satan':
            characterImageElement.src = 'images/satan.jpg';
            break;
        case 'timmy':
            characterImageElement.src = 'images/timmy.jpg';
            break;
        case 'santa':
            characterImageElement.src = 'images/santa.jpg';
            break;
        case 'towelie':
            characterImageElement.src = 'images/towelie.jpg';
            break;
        default:
            characterImageElement.src = 'images/cartman.jpg';
            break;
    }
}
