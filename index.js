const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const newspapers = [
    {
        name: 'cityam',
        address: 'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: 'https://www.theguardian.com'
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    },
    {
        name: 'nyt',
        address: 'https://www.nytimes.com/international/section/climate',
        base: 'https://www.nytimes.com'
    },
    {
        name: 'latimes',
        address: 'https://www.latimes.com/environment',
        base: 'https://www.latimes.com'
    },
    {
        name: 'smh',
        address: 'https://www.smh.com.au/environment/climate-change',
        base: 'https://www.smh.com.au'
    },
    {
        name: 'climate',
        address: 'https://www.climate.gov/news-features/all',
        base: 'https://www.climate.gov'
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        base: 'https://www.bbc.co.uk'
    },
    {
        name: 'es',
        address: 'https://www.standard.co.uk/topic/climate-change',
        base: 'https://www.standard.co.uk'
    },
    {
        name: 'sun',
        address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
        base: 'https://www.thesun.co.uk'
    },
    {
        name: 'dm',
        address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
        base: 'https://www.dailymail.co.uk'
    },
    {
        name: 'nyp',
        address: 'https://nypost.com/tag/climate-change/',
        base: 'https://nypost.com'
    },
    {
        name: 'aljazeera',
        address: 'https://www.aljazeera.com/search/climate',
        base: 'https://www.aljazeera.com'
    },
    {
        name: 'forbes',
        address: 'https://www.forbes.com/search/?q=climate',
        base: 'https://www.forbes.com'
    },
    {
        name: 'nature',
        address: 'https://www.nature.com/subjects/climate-change',
        base: 'https://www.nature.com'
    },
    {
        name: 'scientificamerican',
        address: 'https://www.scientificamerican.com/environment/',
        base: 'https://www.scientificamerican.com'
    },
    {
        name: 'vox',
        address: 'https://www.vox.com/climate',
        base: 'https://www.vox.com'
    },
    {
        name: 'ecowatch',
        address: 'https://www.ecowatch.com/climate-change',
        base: 'https://www.ecowatch.com'
    },
    {
        name: 'huffpost',
        address: 'https://www.huffpost.com/impact/green',
        base: 'https://www.huffpost.com'
    },
    ,
    {
        name: 'huffpost',
        address: 'https://www.huffpost.com/impact/green',
        base: 'https://www.huffpost.com'
    },
    {
        name:'lenta',
        address:'https://lenta.ru/search?query=climate#size=10|sort=2|domain=1|modified,format=yyyy-MM-dd',
        base:'https://lenta.ru'
    }
];

const articles = [];

// Fetching articles from all newspapers
const fetchArticles = async () => {
    await Promise.all(newspapers.map(async (newspaper) => {
        try {
            const response = await axios.get(newspaper.address);
            const html = response.data;
            const $ = cheerio.load(html);
            /*
            $('img').each(function () {
                let photo = $(this).attr('src');
                console.log(photo);
            });
            */
            $('a').each(function () {
                const title = $(this).text().trim();
                if (title.toLowerCase().includes('climate')) {
                    let url = $(this).attr('href');
                    console.log(this);
                    // Handle relative URLs
                    if (url && url.startsWith('/')) {
                        url = newspaper.base + url;
                    } else if (url && !url.startsWith('http')) {
                        url = newspaper.base + '/' + url;
                    }

                    articles.push({
                        title,
                        url,
                        source: newspaper.name,
                    });
                }
            });
        } catch (err) {
            console.log(`Error fetching articles from ${newspaper.name}:`, err.message);
        }
    }));
};

// Initial fetch when the server starts
fetchArticles();

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API');
});

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find(n => n.name === newspaperId);

    if (!newspaper) {
        return res.status(404).json({ message: 'Newspaper not found' });
    }

    try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);
        const specificArticles = [];

        $('a').each(function () {
            const title = $(this).text();
            if (title.toLowerCase().includes('climate') || title.toLowerCase().includes('климат')) {
                const url = $(this).attr('href');
                specificArticles.push({
                    title,
                    url: url && (url.startsWith('/') ? newspaper.base + url : url),
                    source: newspaperId
                });
            }
        });

        res.json(specificArticles);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching articles from this newspaper' });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));