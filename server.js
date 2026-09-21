const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// JSONBin.io 配置
const API_KEY = '$2a$10$PUNN3P.c5FnMC6dTwKTFX.70aARXNZ08fvBhjE8r3J3Cil7FvFZma';
const BIN_ID = '6ab1643bac6210605ae66521';
const API_BASE_URL = `api.jsonbin.io/v3/b/${BIN_ID}`;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// 封装 JSONBin.io 请求
function jsonbinRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.jsonbin.io',
      port: 443,
      path: `/${path}`,
      method: method,
      headers: {
        'X-Access-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// 获取所有数据
async function getAllData() {
  try {
    const result = await jsonbinRequest('GET', API_BASE_URL);
    return result.record || { users: {}, lastUpdate: null };
  } catch (e) {
    console.log('初始化数据库...');
    return { users: {}, lastUpdate: null };
  }
}

// 保存所有数据
async function saveAllData(data) {
  await jsonbinRequest('PUT', API_BASE_URL, data);
  return true;
}

// API 路由
app.get('/api/data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const allData = await getAllData();
    const userData = allData.users[userId] || { records: [], goals: {} };
    res.json({
      records: userData.records || [],
      goals: userData.goals || {},
      lastSync: allData.lastUpdate
    });
  } catch (e) {
    console.error('获取数据失败:', e);
    res.json({ records: [], goals: {}, lastSync: null });
  }
});

app.post('/api/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { records, goals, clientLastSync } = req.body;

    const allData = await getAllData();

    // 初始化用户数据
    if (!allData.users[userId]) {
      allData.users[userId] = { records: [], goals: {} };
    }

    // 合并记录
    const existingIds = new Set(allData.users[userId].records.map(r => r.id));
    const newRecords = records.filter(r => !existingIds.has(r.id));
    allData.users[userId].records = [...allData.users[userId].records, ...newRecords];

    // 合并目标
    allData.users[userId].goals = { ...allData.users[userId].goals, ...goals };
    allData.lastUpdate = new Date().toISOString();

    await saveAllData(allData);

    res.json({
      records: allData.users[userId].records,
      goals: allData.users[userId].goals,
      lastSync: allData.lastUpdate
    });
  } catch (e) {
    console.error('同步失败:', e);
    res.status(500).json({ error: '同步失败' });
  }
});

app.post('/api/records/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const record = req.body;

    const allData = await getAllData();
    if (!allData.users[userId]) {
      allData.users[userId] = { records: [], goals: {} };
    }
    allData.users[userId].records.unshift(record);
    allData.lastUpdate = new Date().toISOString();

    await saveAllData(allData);
    res.json({ success: true, record });
  } catch (e) {
    console.error('保存记录失败:', e);
    res.status(500).json({ error: '保存失败' });
  }
});

app.delete('/api/records/:userId/:recordId', async (req, res) => {
  try {
    const { userId, recordId } = req.params;
    const allData = await getAllData();

    if (allData.users[userId]) {
      allData.users[userId].records = allData.users[userId].records.filter(r => r.id !== parseInt(recordId));
      allData.lastUpdate = new Date().toISOString();
      await saveAllData(allData);
    }

    res.json({ success: true });
  } catch (e) {
    console.error('删除记录失败:', e);
    res.status(500).json({ error: '删除失败' });
  }
});

app.post('/api/goals/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { monthKey, categoryId, value } = req.body;

    const allData = await getAllData();
    if (!allData.users[userId]) {
      allData.users[userId] = { records: [], goals: {} };
    }
    if (!allData.users[userId].goals[monthKey]) {
      allData.users[userId].goals[monthKey] = {};
    }
    allData.users[userId].goals[monthKey][categoryId] = value;
    allData.lastUpdate = new Date().toISOString();

    await saveAllData(allData);
    res.json({ success: true, goals: allData.users[userId].goals });
  } catch (e) {
    console.error('保存目标失败:', e);
    res.status(500).json({ error: '保存失败' });
  }
});

app.delete('/api/goals/:userId/:monthKey/:categoryId', async (req, res) => {
  try {
    const { userId, monthKey, categoryId } = req.params;
    const allData = await getAllData();

    if (allData.users[userId] && allData.users[userId].goals[monthKey]) {
      delete allData.users[userId].goals[monthKey][categoryId];
      allData.lastUpdate = new Date().toISOString();
      await saveAllData(allData);
    }

    res.json({ success: true, goals: allData.users[userId]?.goals || {} });
  } catch (e) {
    console.error('删除目标失败:', e);
    res.status(500).json({ error: '删除失败' });
  }
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
║  云端访问: https://${PORT === 3000 ? 'your-app' : 'localhost'}:${PORT}
║  每个人数据独立存储                        ║
╚═══════════════════════════════════════════╝
  `);
});
