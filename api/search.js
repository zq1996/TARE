export default async function handler(req, res) {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ success: false, message: '请输入搜索关键词' });
    }

    const results = [];

    try {
        await Promise.all([
            searchMukaku(keyword, results),
            searchYunso(keyword, results)
        ]);

        res.json({
            success: true,
            results: results.slice(0, 30)
        });
    } catch (error) {
        console.error('Search error:', error);
        res.json({
            success: true,
            results: results.slice(0, 30)
        });
    }
}

async function searchMukaku(keyword, results) {
    const axios = require('axios');
    const cheerio = require('cheerio');

    try {
        const searchUrl = `https://web5.mukaku.com/index.php/vod/search.html?searchword=${encodeURIComponent(keyword)}`;
        const response = await axios.get(searchUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://web5.mukaku.com/'
            }
        });

        const $ = cheerio.load(response.data);

        $('.module-item').each((i, el) => {
            if (i >= 15) return;

            const title = $(el).find('.module-item-title a').text().trim();
            const url = 'https://web5.mukaku.com' + $(el).find('.module-item-title a').attr('href');
            const poster = $(el).find('.module-item-cover .module-item-pic img').attr('data-src') || 
                          $(el).find('.module-item-cover .module-item-pic img').attr('src');

            results.push({
                title: title || '未知标题',
                poster: poster || '',
                desc: '',
                size: '',
                url: url,
                type: 'magnet',
                source: 'web5.mukaku.com'
            });
        });
    } catch (error) {
        console.log('Mukaku search error:', error.message);
    }
}

async function searchYunso(keyword, results) {
    const axios = require('axios');
    const cheerio = require('cheerio');

    try {
        const searchUrl = `https://www.yunso.net/index.php?s=/api/index/search&wd=${encodeURIComponent(keyword)}`;
        const response = await axios.get(searchUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.yunso.net/'
            }
        });

        const data = response.data;

        if (data && data.code === 1 && data.result) {
            data.result.slice(0, 15).forEach(item => {
                results.push({
                    title: item.title || item.name || '未知标题',
                    poster: item.pic || '',
                    desc: item.info || '',
                    size: item.size || '',
                    url: item.url || item.link || '',
                    type: 'pan',
                    source: 'yunso.net'
                });
            });
        }
    } catch (error) {
        console.log('Yunso search error:', error.message);
    }
}
