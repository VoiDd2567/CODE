const { exec } = require('child_process');
const Redis = require('ioredis');

const REDIS_PORT = 6379;
const CONTAINER_NAME = 'redis-temp';

async function ensureRedis() {
    const client = new Redis({
        port: REDIS_PORT,
        host: '127.0.0.1',
        lazyConnect: true,
        connectTimeout: 10000,        // 10 seconds to establish connection
        commandTimeout: 5000,         // 5 seconds for individual commands
        retryDelayOnFailover: 100,    // Delay between retry attempts
        maxRetriesPerRequest: 3,
    });

    try {
        await startRedisContainer();
        await waitForRedis(client);  // Wait until Redis is really ready
        console.log("Redis started and ready!");
    } finally {
        client.disconnect();
    }
}

function startRedisContainer() {
    return new Promise((resolve, reject) => {
        exec(`docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Names}}"`, (err, stdout) => {
            if (err) return reject(err);

            if (!stdout.trim()) {
                exec(`docker run --name ${CONTAINER_NAME} -p ${REDIS_PORT}:6379 -d redis`, (err2) => {
                    if (err2) return reject(err2);
                    resolve();
                });
            } else {
                exec(`docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}`, (err3, state) => {
                    if (err3) return reject(err3);
                    if (state.trim() === 'true') resolve();
                    else {
                        exec(`docker start ${CONTAINER_NAME}`, (err4) => {
                            if (err4) return reject(err4);
                            resolve();
                        });
                    }
                });
            }
        });
    });
}

async function waitForRedis(client) {
    let connected = false;
    while (!connected) {
        try {
            await client.connect(); // Explicit connect
            await client.ping();
            connected = true;
        } catch {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

module.exports = { ensureRedis };
