const Redis = require("ioredis");
const redis = new Redis();
const logger = require("../../scripts/Logging")

class getCache {
    static async getUser(findBy) { return await this.#getByQuery(findBy, ["_id", "username", "email"]) }

    static async getClass(id) { return await this.#getById(id, "class") }

    static async getExercise(id) { return await this.#getById(id, "exercise"); }

    static async getExerciseSolution(findBy) { return await this.#getByQuery(findBy, ["_id", "userId", "exerciseId"]) }

    static async getSession(findBy) { return await this.#getByQuery(findBy, ["userId", "sessionId"]) }

    static async getRegistrationCode(findBy) { return await this.#getByQuery(findBy, ["_id", "sessionId", "email"]) }

    static async getCourse(findBy) { return await this.#getByQuery(findBy, ["_id", "creator"]) }

    static async #getById(id, item) {
        this.#validateQuery(id, ["_id"]);
        const key = `${item}:${id}`;
        return await this.#checkKey(key)
    }

    static async #getByQuery(findBy, allowed) {
        this.#validateQuery(findBy, allowed);
        const key = `user:${JSON.stringify(findBy)}`;
        return await this.#checkKey(key)
    }

    static #validateQuery(query, allowedFields) {
        const keys = Object.keys(query);
        const forbidden = keys.filter(key => !allowedFields.includes(key));

        if (forbidden.length > 0) {
            throw new Error(`Query contains forbidden fields: ${forbidden.join(", ")}`);
        }
    }

    static async #checkKey(key) {
        const cached = await redis.get(key);
        const data = JSON.parse(cached)
        if (data && typeof data === "object" && !Array.isArray(data)) return data;
        return key
    }
}

class setCache {
    static async set(cacheKey, item, ttl) {
        try {
            await redis.set(cacheKey, JSON.stringify(item), "EX", ttl);
        } catch (err) {
            logger.error("FAILED: Faield to set cache: " + err)
        }
    }
}

class deleteCache {
    static async deleteUser(user) {
        await deleteCache.deleteWithQuery(user, "user", ["_id", "username", "email"]);
    }
    static async deleteClass(classId) {
        await deleteCache.deleteWithId(classId, "class");
    }
    static async deleteExercise(exerciseId) {
        await deleteCache.deleteWithId(exerciseId, "exercise");
    }
    static async deleteExerciseSolution(solution) {
        await deleteCache.deleteWithQuery(solution, "user", ["_id", "userId", "exerciseId"]);
    }
    static async deleteSession(session) {
        await deleteCache.deleteWithQuery(session, "user", ["userId", "sessionId"]);
    }
    static async deleteRegistrationCode(code) {
        await deleteCache.deleteWithQuery(code, "user", ["_id", "sessionId", "email"]);
    }
    static async deleteCourse(course) {
        await deleteCache.deleteWithQuery(course, "user", ["_id", "creator"]);
    }

    static async deleteWithId(id, itemName) {
        try {
            const key = `${itemName}:${id}`;
            await redis.del(key);
        } catch (err) {
            logger.error(`FAILED: Failed to delete ${itemName} cache by id: ` + err);
        }
    }

    static async deleteWithQuery(item, itemName, query) {
        try {
            const values = query.map(f => item[f]).filter(Boolean);

            for (const value of values) {
                let cursor = 0;
                do {
                    const [newCursor, keys] = await redis.scan(cursor, "MATCH", `${itemName}:*${value}*`, "COUNT", 100);
                    cursor = Number(newCursor);
                    if (keys.length > 0) {
                        await redis.del(keys);
                    }
                } while (cursor !== 0);
            }
        } catch (err) {
            logger.error("FAILED: Failed to delete user cache: " + err);
        }
    }
}


module.exports = { getCache, setCache, deleteCache }