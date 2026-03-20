export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    console.log('Detail - req.url:', req.url);
    console.log('Detail - id:', id);

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