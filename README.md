# 影视搜索工具

一个用于搜索电影、电视剧种子的工具，支持查看详情和复制磁力链接下载。

## 在线访问

### GitHub Pages + Vercel 部署

- **工具集首页**: https://tare-project-9lhfuixbh-zq1996s-projects.vercel.app/
- **影视搜索**: https://tare-project-9lhfuixbh-zq1996s-projects.vercel.app/movie-search.html

## 本地开发

### 环境要求

- Node.js 14+

### 安装依赖

```bash
npm install
```

### 启动本地服务

```bash
node local-server.js
```

服务启动后访问：
- 工具集首页: http://localhost:3000/
- 影视搜索: http://localhost:3000/movie-search.html

## 部署到 Vercel

### 方式一：GitHub 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 https://vercel.com
3. 点击 "New Project" 导入你的 GitHub 仓库
4. 配置：
   - Framework Preset: Other
   - Build Command: 留空
   - Output Directory: 留空
5. 点击 Deploy

### 方式二：Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

## 项目结构

```
mytool/
├── index.html              # 工具集首页
├── movie-search.html       # 影视搜索页面
├── detail.html             # 影视详情页面
├── local-server.js         # 本地开发服务器
├── package.json            # Node.js 依赖
├── vercel.json             # Vercel 配置
├── api/
│   └── search.js           # Vercel Serverless API
├── .gitignore             # Git 忽略配置
└── README.md              # 本文件
```

## API 接口

### 搜索影视

```
GET /api/search?keyword=关键词
```

### 获取详情

```
GET /api/detail?id=视频ID
```

## 注意事项

1. **目标网站**: 使用 mukaku 影视资源网 API
2. **稳定性**: 第三方网站可能随时更换域名或接口
3. **局限性**: 仅供学习交流使用

## License

MIT
