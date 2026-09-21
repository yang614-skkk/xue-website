const express = require('express');
const cors = require('cors');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = lowdb(adapter);

// 初始化数据结构
db.defaults({
  records: [],
  goals: {},
  users: {}
}).write();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// API 路由
app.get('/api/data', (req, res) => {
  const records = db.get('records').value();
  const goals = db.get('goals').value();
  res.json({ records, goals, lastSync: new Date().toISOString() });
});

app.post('/api/sync', (req, res) => {
  const { records, goals, clientLastSync } = req.body;

  // 获取服务器数据
  const serverRecords = db.get('records').value();
  const serverGoals = db.get('goals').value();

  // 简单的合并策略：以客户端数据为准，追加新记录
  const clientRecordIds = new Set(records.map(r => r.id));
  const newRecords = serverRecords.filter(r => !clientRecordIds.has(r.id));
  const mergedRecords = [...records, ...newRecords];

  // 合并目标
  const mergedGoals = { ...serverGoals, ...goals };

  // 保存到服务器
  db.set('records', mergedRecords).write();
  db.set('goals', mergedGoals).write();

  res.json({
    records: mergedRecords,
    goals: mergedGoals,
    lastSync: new Date().toISOString()
  });
});

app.post('/api/records', (req, res) => {
  const record = req.body;
  db.get('records').unshift(record).write();
  res.json({ success: true, record });
});

app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  db.get('records').remove({ id: parseInt(id) }).write();
  res.json({ success: true });
});

app.post('/api/goals', (req, res) => {
  const { monthKey, categoryId, value } = req.body;
  const goals = db.get('goals').value();
  if (!goals[monthKey]) goals[monthKey] = {};
  goals[monthKey][categoryId] = value;
  db.set('goals', goals).write();
  res.json({ success: true, goals });
});

app.delete('/api/goals/:monthKey/:categoryId', (req, res) => {
  const { monthKey, categoryId } = req.params;
  const goals = db.get('goals').value();
  if (goals[monthKey]) {
    delete goals[monthKey][categoryId];
    db.set('goals', goals).write();
  }
  res.json({ success: true, goals });
});

// 服务 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     🤖 硅基员工 - 成长打卡系统            ║
╠═══════════════════════════════════════════╣
║  本地访问: http://localhost:${PORT}
║  局域网:   http://你的IP:${PORT}
║                                           ║
║  📌 安装到桌面（桌面快捷方式）:           ║
║  将浏览器中的页面添加到主屏幕即可         ║
╚═══════════════════════════════════════════╝
  `);
});
