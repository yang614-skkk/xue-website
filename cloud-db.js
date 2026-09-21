/**
 * 使用 JSONBin.io 作为免费云数据库
 */
const API_KEY = '$2a$10$PUNN3P.c5FnMC6dTwKTFX.70aARXNZ08fvBhjE8r3J3Cil7FvFZma';
const BIN_ID = '6ab1643bac6210605ae66521';

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
