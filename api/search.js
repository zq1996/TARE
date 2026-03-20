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
    console.log('Vercel - req.path:', req.path);
    console.log('Vercel - req.query:', JSON.stringify(req.query));
    console.log('Vercel - pathname:', pathname);
    console.log('Vercel - keyword:', keyword);
    console.log('Vercel - id:', id);

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
    const APP_ID = '83768d9ad4';
    const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

    const searchUrl = `https://web5.mukaku.com/prod/api/v1/getVideoList?sb=${encodeURIComponent(keyword)}&page=1&limit=24&app_id=${APP_ID}&identity=${IDENTITY}`;
    console.log('searchUrl:', searchUrl);

    try {
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://web5.mukaku.com/search',
                'Origin': 'https://web5.mukaku.com',
                'Host': 'web5.mukaku.com',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
        });

        console.log('response status:', response.status);

        const text = await response.text();
        console.log('response text length:', text.length);
        console.log('response text preview:', text.substring(0, 300));

        const data = JSON.parse(text);

        console.log('data.success:', data.success);
        console.log('data.data exists:', !!data.data);
        if (data.data) {
            console.log('data.data keys:', Object.keys(data.data));
            console.log('data.data.data is array:', Array.isArray(data.data.data));
            console.log('data.data.data length:', data.data.data?.length || 0);
        }

        let items = [];
        if (data.success && data.data) {
            if (data.data.data && Array.isArray(data.data.data)) {
                items = data.data.data;
            } else if (data.data.list && Array.isArray(data.data.list)) {
                items = data.data.list;
            } else if (data.data.result && Array.isArray(data.data.result)) {
                items = data.data.result;
            } else if (data.data.videos && Array.isArray(data.data.videos)) {
                items = data.data.videos;
            }
        }

        console.log('Found items count:', items.length);

        items.forEach(item => {
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
    } catch (error) {
        console.log('Mukaku search error:', error.message);
        console.log('Mukaku search error stack:', error.stack);
    }
}

async function getVideoDetail(id) {
    const APP_ID = '83768d9ad4';
    const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

    try {
        const detailUrl = `https://web5.mukaku.com/prod/api/v1/getVideoDetail?id=${id}&app_id=${APP_ID}&identity=${IDENTITY}`;

        const response = await fetch(detailUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://web5.mukaku.com/mv/${id}`,
                'Origin': 'https://web5.mukaku.com',
                'Host': 'web5.mukaku.com',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
        });

        const data = await response.json();

        if (data.success && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.log('Mukaku detail error:', error.message);
        throw error;
    }
}
