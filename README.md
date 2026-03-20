# 影视搜索工具

一个用于搜索电影、电视剧种子的工具，支持查看详情和复制磁力链接下载。

---

## 在线访问

### Vercel 部署

- **工具集首页**: https://taretool-git-ppschedule-zq1996s-projects.vercel.app/
- **影视搜索**: https://taretool-git-ppschedule-zq1996s-projects.vercel.app/movie-search.html
- **影视详情**: https://taretool-git-ppschedule-zq1996s-projects.vercel.app/detail.html

---

## 功能特性

- 🔍 模糊搜索电影、电视剧
- 🎬 展示海报、名称、简介、豆瓣评分、年份、画质
- 📋 详情页展示所有下载资源（磁力链接）
- 🔗 一键复制磁力链接
- 🌐 支持本地和线上自动切换

---

## 技术架构

### 整体架构

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   用户浏览器          │────▶│   Vercel Serverless  │────▶│  mukaku 影视API    │
│  (静态前端页面)       │◀────│   (Node.js 爬虫)     │◀────│  (第三方资源站)     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5, CSS3, JavaScript (原生) |
| 后端 | Node.js (Vercel Serverless Functions) |
| 部署 | Vercel (Serverless + 静态托管) |
| 数据源 | mukaku 影视资源网 API |

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `index.html` | 工具集首页，展示所有工具入口 |
| `movie-search.html` | 影视搜索页面，搜索并展示结果列表 |
| `detail.html` | 影视详情页面，展示下载资源（磁力链接） |
| `config.js` | 配置文件，管理本地/线上 API 地址 |
| `local-server.js` | 本地开发服务器（同时提供静态页面和 API） |
| `api/search.js` | Vercel Serverless API（搜索和详情接口） |
| `package.json` | Node.js 依赖配置 |

---

## 本地开发

### 环境要求

- Node.js 14+ (建议使用 Node.js 18+)

### 安装依赖

```bash
npm install
```

依赖包说明：
- `axios`: HTTP 请求库，用于调用第三方 API
- `cheerio`: HTML 解析库（本地开发使用）

### 启动本地服务

```bash
node local-server.js
```

服务启动后：
- 工具集首页: http://localhost:3000/
- 影视搜索: http://localhost:3000/movie-search.html

### 本地测试 API

```bash
# 搜索接口
curl "http://localhost:3000/api/search?keyword=疯狂动物城2"

# 详情接口
curl "http://localhost:3000/api/detail?id=26817136"
```

---

## 配置文件说明

### config.js

```javascript
const Config = {
    // 本地开发配置
    local: {
        apiBase: 'http://localhost:3000'
    },
    // 生产环境配置（Vercel）
    production: {
        apiBase: 'https://taretool-git-ppschedule-zq1996s-projects.vercel.app'
    },
    // 自动判断当前环境
    getCurrent() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocal ? this.local : this.production;
    }
};
```

**工作原理**：
- 前端页面通过 `Config.getCurrent().apiBase` 获取 API 地址
- 访问 `localhost` 时自动使用本地服务
- 访问 Vercel 域名时自动使用线上 API

---

## API 接口文档

### 搜索影视

```
GET /api/search?keyword=关键词
```

**请求示例**:
```
/api/search?keyword=疯狂动物城
```

**响应示例**:
```json
{
  "success": true,
  "results": [
    {
      "id": "26817136",
      "title": "疯狂动物城2",
      "poster": "https://img.bbegge.com/i/2026/01/27/6977beb03424f.png",
      "desc": "...",
      "size": "WEB-1080P,杜比视界,WEB-4K,蓝光原盘",
      "url": "https://web5.mukaku.com/mv/26817136",
      "type": "magnet",
      "source": "web5.mukaku.com",
      "doubanScore": "8.4",
      "year": "2025",
      "quality": "1080P蓝光"
    }
  ]
}
```

### 获取详情

```
GET /api/detail?id=视频ID
```

**请求示例**:
```
/api/detail?id=26817136
```

**响应示例**:
```json
{
  "success": true,
  "result": {
    "id": 91545,
    "idcode": "26817136",
    "title": "疯狂动物城2",
    "image": "https://img.bbegge.com/...",
    "doub_score": "8.4",
    "years": "2025",
    "abstract": "...",
    "director": "...",
    "performer": "...",
    "ecca": {
      "WEB-4K": [
        {
          "zname": "疯狂动物城2[国英多音轨+简繁英字幕]...",
          "zsize": "10.48 GB",
          "zqxd": "WEB-4K",
          "zlink": "magnet:?xt=urn:btih:..."
        }
      ]
    }
  }
}
```

---

## 部署到 Vercel

### 部署步骤

1. **推送代码到 GitHub**

   ```bash
   git add -A
   git commit -m "添加影视搜索工具"
   git push origin ppschedule
   ```

2. **Vercel 自动部署**
   - Vercel 会监听 GitHub 仓库变化，自动部署
   - 无需额外配置，使用默认设置即可

### Vercel 配置说明

本项目**不需要** `vercel.json` 配置文件，使用 Vercel 默认行为：

- **静态文件**: 自动托管根目录下的 HTML 文件
- **Serverless Functions**: 自动识别 `api/` 目录下的 JS 文件

### 部署常见问题

1. **404 错误**
   - 检查是否误添加了 `vercel.json` 导致配置冲突
   - 确保 GitHub 仓库代码已推送

2. **API 请求失败**
   - 检查 config.js 中的 production API 地址是否正确
   - 第三方 API (mukaku) 可能不稳定

---

## 项目结构

```
mytool/
├── index.html              # 工具集首页
├── movie-search.html       # 影视搜索页面
├── detail.html            # 影视详情页面
├── config.js              # 配置文件（本地/线上自动切换）
├── local-server.js         # 本地开发服务器
├── package.json           # Node.js 依赖
├── README.md              # 项目文档
├── .gitignore            # Git 忽略配置
├── js/
│   └── lunar.min.js       # 农历库（原有文件）
├── api/
│   └── search.js          # Vercel Serverless API
└── dadschedule.html        # 原有排班工具
```

---

## 第三方 API 说明

### 数据源

本工具使用 [mukaku](https://web5.mukaku.com/) 影视资源网的公开 API：

**搜索 API**:
```
https://web5.mukaku.com/prod/api/v1/getVideoList
```

**详情 API**:
```
https://web5.mukaku.com/prod/api/v1/getVideoDetail
```

### 注意事项

1. **稳定性风险**: 第三方网站可能随时更换域名或接口
2. **仅供学习**: 本工具仅供学习交流使用
3. **法律责任**: 请遵守当地法律法规使用

---

## 更新日志

### v1.0.0
- 实现影视搜索功能
- 实现详情页展示磁力链接
- 支持本地/线上自动切换

---

## License

MIT
