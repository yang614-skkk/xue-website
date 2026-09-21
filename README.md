# 硅基员工 - 成长打卡系统

一款支持云端同步的成长打卡应用，可安装到桌面使用。

## 快速部署

### 方式一：Railway（最简单，推荐）

1. 访问 https://railway.app
2. 用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 上传本项目到 GitHub，连接即可
5. 自动部署，获得公网地址

### 方式二：Render

1. 访问 https://render.com
2. 用 GitHub 登录
3. 点击 "New" → "Web Service"
4. 连接 GitHub 仓库
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. 部署完成获得地址

### 方式三：Replit（无需服务器）

1. 访问 https://replit.com
2. 创建新 Repl，选择 Node.js
3. 上传所有文件
4. 点击 Run 即可
5. 分享 Repl 链接

### 方式四：Vercel + 云数据库

需要额外配置云数据库（MongoDB Atlas 免费额度）

### 方式五：直接使用（当前方式）

```bash
npm install
npm start
# 访问 http://localhost:3000
# 同一局域网内其他设备用 http://你的IP:3000
```

## 功能特性

- 📚 6种打卡类别：读书、瑜伽、冥想、复盘、记账、听课
- 🎯 月度目标设定与追踪
- 📅 日历视图与补打卡
- 📊 月度复盘与数据统计
- ☁️ 云端数据同步（部署后）
- 📥 Markdown格式导出

## 部署后配置

部署到云端后，可以：
1. 生成公开访问链接分享给他人
2. 他人直接访问网址即可使用
3. 所有数据存储在云端，自动同步
