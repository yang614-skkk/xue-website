/**
 * 使用 JSONBin.io 作为免费云数据库
 * 注册 https://jsonbin.io 免费获取 API Key
 */
const API_KEY = 'YOUR_API_KEY_HERE'; // 替换为你的 API Key
const BIN_ID = 'YOUR_BIN_ID_HERE';   // 替换为你的 Bin ID

const API_BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function loadData() {
  const res = await fetch(API_BASE_URL, {
    headers: {
      'X-Access-Key': API_KEY
    }
  });
  const data = await res.json();
  return data.record || { records: [], goals: {} };
}

async function saveData(data) {
  await fetch(API_BASE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': API_KEY
    },
    body: JSON.stringify(data)
  });
}

module.exports = { loadData, saveData };
