const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

const executeQuery = async (query, values) => {
  const connection = await pool.promise().getConnection();

  const [data] = await connection.query(query, values);

  connection.release();

  return data;
};

module.exports = { executeQuery };
