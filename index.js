require('dotenv').config();
const connect = require('./lib/util/connect');

const { createServer } = require('http');
const app = require('./lib/app');

const port = process.env.PORT;

connect(process.env.MONGODB_URI);
const server = createServer(app);

server.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Listening on ${port}`);
});
