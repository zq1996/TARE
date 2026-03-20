const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const axios = require('axios');

const PORT = 3000;

const APP_ID = '83768d9ad4';
const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const keyword = query.keyword ? decodeURIComponent(query.keyword) : undefined;
    const id = query.id ? decodeURIComponent(query.id) : undefined;

    if (pathname === '/api/search') {
        if (!keyword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '请输入搜索关键词' }));
            return;
        }

        const results = [];

        try {
            await searchMukaku(keyword, results);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                results: results.slice(0, 30)
            }));
        } catch (error) {
            console.error('Search error:', error.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                results: []
            }));
        }
    } else if (pathname === '/api/detail') {
        if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '请输入视频ID' }));
            return;
        }

        try {
            const result = await getVideoDetail(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                result: result
            }));
        } catch (error) {
            console.error('Detail error:', error.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: error.message
            }));
        }
    } else if (pathname === '/' || pathname === '/index.html' || pathname === '/movie-search.html' || pathname === '/detail.html') {
        let filePath = pathname === '/' ? '/index.html' : pathname;
        const fullPath = path.join(__dirname, filePath);
        
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
                        if (err2) {
                            res.writeHead(404);
                            res.end('Not Found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data2);
                        }
                    });
                } else {
                    res.writeHead(500);
                    res.end('Server Error');
                }
            } else {
                const ext = path.extname(fullPath);
                const contentType = mimeTypes[ext] || 'text/plain';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else {
        const fullPath = path.join(__dirname, pathname);
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                const ext = path.extname(fullPath);
                const contentType = mimeTypes[ext] || 'text/plain';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
});

async function searchMukaku(keyword, results) {
    try {
        const searchUrl = `https://web5.mukaku.com/prod/api/v1/getVideoList?sb=${encodeURIComponent(keyword)}&page=1&limit=24&app_id=${APP_ID}&identity=${IDENTITY}`;
        
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://web5.mukaku.com/search',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh_CN'
            }
        });

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
    const APP_ID = '83768d9ad4';
    const IDENTITY = '23734adac0301bccdcb107c4aa21f96c';

    try {
        const detailUrl = `https://web5.mukaku.com/prod/api/v1/getVideoDetail?id=${id}&app_id=${APP_ID}&identity=${IDENTITY}`;
        console.log('Detail URL:', detailUrl);
        
        const response = await axios.get(detailUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `https://web5.mukaku.com/mv/${id}`,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh_CN'
            }
        });

        console.log('Detail response success:', response.data.success);
        console.log('Detail response data:', response.data.data ? 'exists' : 'null');
        console.log('Full response:', JSON.stringify(response.data).substring(0, 500));

        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log('Mukaku detail error:', error.message);
        throw error;
    }
}

server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`✅ 服务已启动！`);
    console.log(`   工具集首页: http://localhost:${PORT}/`);
    console.log(`   影视搜索:   http://localhost:${PORT}/movie-search.html`);
    console.log(`========================================`);
});
