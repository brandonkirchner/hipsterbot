var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE users (ID INT PRIMARY KEY NOT NULL, NAME TEXT NOT NULL, HIPSTERPOINTS INT)');

query.on('end', function() { client.end(); });
