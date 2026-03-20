export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { keyword, id } = req.query;

    const pathname = req.url.split('?')[0];

    console.log('Vercel - req.url:', req.url);
    console.log('Vercel - pathname:', pathname);
    console.log('Vercel - keyword:', keyword);

    if (pathname === '/api/search' || req.query.path === 'search' || req.path === '/search') {
        if (!keyword) {
            return res.status(400).json({ success: false, message: '请输入搜索关键词' });
        }

        const results = [];

        try {
            await searchMukaku(keyword, results);

            return res.json({
                success: true,
                results: results.slice(0, 30)
            });
        } catch (error) {
            console.error('Search error:', error.message);
            return res.json({
                success: true,
                results: results.slice(0, 30)
            });
        }
    }

    if (pathname === '/api/detail' || req.query.path === 'detail' || req.path === '/detail' || (id && !keyword)) {
        if (!id) {
            return res.status(400).json({ success: false, message: '请输入视频ID' });
        }

        try {
            const result = await getVideoDetail(id);
            return res.json({
                success: true,
                result: result
            });
        } catch (error) {
            console.error('Detail error:', error.message);
            return res.json({
                success: false,
                message: error.message
            });
        }
    }

    return res.status(404).json({ success: false, message: 'Not Found' });
}

async function searchMukaku(keyword, results) {
    const axios = require('axios');

    const APP_ID = '83768d9ad4';
    const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

    try {
        const searchUrl = `https://web5.mukaku.com/prod/api/v1/getVideoList?sb=${encodeURIComponent(keyword)}&page=1&limit=24&app_id=${APP_ID}&identity=${IDENTITY}`;
        console.log('searchUrl:', searchUrl);

        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://web5.mukaku.com/search',
                'Origin': 'https://web5.mukaku.com',
                'Host': 'web5.mukaku.com',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        });

        console.log('response status:', response.status);
        console.log('response data success:', response.data.success);
        console.log('response data count:', response.data.data?.data?.length || 0);

        const data = response.data;

        if (data.success && data.data && data.data.data) {
            data.data.data.forEach(item => {
                results.push({
                    id: item.idcode || item.id || '',
                    title: item.title || '未知标题',
                    poster: item.image || '',
                    desc: item.abstract || item.alias || '',
                    size: item.definition || '',
                    url: `https://web5.mukaku.com/mv/${item.idcode}`,
                    type: 'magnet',
                    source: 'web5.mukaku.com',
                    doubanScore: item.doub_score || '',
                    year: item.years || '',
                    quality: item.zqxd || ''
                });
            });
        }
    } catch (error) {
        console.log('Mukaku search error:', error.message);
    }
}

async function getVideoDetail(id) {
    const axios = require('axios');

    const APP_ID = '83768d9ad4';
    const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

    try {
        const detailUrl = `https://web5.mukaku.com/prod/api/v1/getVideoDetail?id=${id}&app_id=${APP_ID}&identity=${IDENTITY}`;

        const response = await axios.get(detailUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://web5.mukaku.com/mv/${id}`,
                'Origin': 'https://web5.mukaku.com',
                'Host': 'web5.mukaku.com',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        });

        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log('Mukaku detail error:', error.message);
        throw error;
    }
}
