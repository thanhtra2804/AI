const { pool } = require("./pool");

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = {
  query,
};
