from bs4 import BeautifulSoup
import requests as rq
import csv
import re

season_urls = {
    20:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty",
    21:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-One",
    22:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-Two",
    23:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-Three",
    24:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-Four",
    25:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-Five",
    26:"https://southpark.fandom.com/wiki/Portal:Scripts/Season_Twenty-Six"
}

def get_episode_urls(season_url):
    season_doc = rq.get(season_url)

    seasonSoup = BeautifulSoup(season_doc.content, "html.parser")
    episodes = seasonSoup.find_all(attrs={"class":"wikia-gallery-item"})

    episode_urls = []
    for ep in episodes:
        episode_urls.append(ep.find('a', href=True)['href'])

    return ["https://southpark.fandom.com" + url for url in episode_urls]

def parse_episode(episode_url, season, episode):
    episode_doc = rq.get(episode_url)
    epSoup = BeautifulSoup(episode_doc.content, 'html.parser')
    script_table = epSoup.find_all('table', attrs={"class":"headerscontent"})[1]

    # get all rows of table, skipping first two since they are the table header
    rows = script_table.find_all('tr')[2:]

    script_lines = []
    for row in rows:
        # grab character cell and line cell
        try:
            (character, line) = row.find_all('td')
        except ValueError:
            continue

        # Character element will not have a span if it is a scene description
        # so we skip scene descriptions
        ch_span = character.find('span')
        if ch_span:
            script_line = {}
            script_line['Season'] = season
            script_line['Episode'] = episode
            script_line['Character'] = ch_span.text

            # regular expression will remove anything within brackets
            script_line['Line'] = re.sub("\[.*?\]", "", line.text)

            # character actions are wrapped in <i> tags
            # this removes them from each line
            # actions = line.find_all('i')
            # for action in actions:
            #     action.extract()
            # script_line['Line'] = line.text

            script_lines.append(script_line)

    return script_lines

if __name__ == "__main__":
    for season, url in season_urls.items():
        season_script = []
        episodes = get_episode_urls(url)

        for idx, episode in enumerate(episodes):
            season_script += parse_episode(episode,season,idx+1)

        # Write csv file
        file_name = 'season_csvs/Season-' + str(season) + '.csv'
        with open(file_name, 'w', newline='',encoding='utf_8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=['Season','Episode','Character','Line'])

            writer.writeheader()
            writer.writerows(season_script)
