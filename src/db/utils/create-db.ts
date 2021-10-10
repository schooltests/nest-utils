const pg = require('pg');

const config: { user: string | null; password: string | null; port: string | null; host: string | null } = {
  user: null,
  password: null,
  port: null,
  host: null,
};

let dbName: string | null = null;

const validateConfig = () => {
  const errors = [];
  if (!~process.argv.indexOf('--u')) {
    errors.push('--u userName');
  } else {
    config.user = process.argv[process.argv.indexOf('--u') + 1];
  }

  if (!~process.argv.indexOf('--pass')) {
    errors.push('--pass password');
  } else {
    config.password = process.argv[process.argv.indexOf('--pass') + 1];
  }

  if (!~process.argv.indexOf('--p')) {
    errors.push('--p port');
  } else {
    config.port = process.argv[process.argv.indexOf('--p') + 1];
  }

  if (!~process.argv.indexOf('--h')) {
    errors.push('--h host');
  } else {
    config.host = process.argv[process.argv.indexOf('--h') + 1];
  }

  if (!~process.argv.indexOf('--n')) {
    errors.push('--n db name');
  } else {
    dbName = process.argv[process.argv.indexOf('--n') + 1];
  }

  if (errors.length) {
    throw new Error('Specify ' + errors.join(' '));
  }
};

validateConfig();

const createdb = async () => {
  try {
    const client = new pg.Client(config);
    console.log(client.user);
    await client.connect();
    await client.query(`create database ${dbName};`);
    console.log(`database ${dbName} created`);
    await client.end();
  } catch (error) {
    throw new Error(error);
  }
};

setTimeout(() => createdb(), 0);
