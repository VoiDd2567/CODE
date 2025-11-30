const { exec } = require('child_process');
const Redis = require('ioredis');

const REDIS_PORT = 6379;
const CONTAINER_NAME = 'redis-temp';

async function ensureRedis() {
    await startRedisContainer();
    await waitForRedis();
    console.log("Redis started and ready!");
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

async function waitForRedis() {
    const maxAttempts = 30; // 15 seconds total

    for (let i = 0; i < maxAttempts; i++) {
        const client = new Redis({
            port: REDIS_PORT,
            host: '127.0.0.1',
            lazyConnect: true,
            connectTimeout: 1000,
            maxRetriesPerRequest: 1,
            retryDelayOnFailover: 100,
        });

        try {
            await client.connect();
            await client.ping();
            client.disconnect();
            return;
        } catch (err) {
            client.disconnect();
            if (i === maxAttempts - 1) {
                throw new Error('Redis failed to start within timeout period');
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

module.exports = { ensureRedis };