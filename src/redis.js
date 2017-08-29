const debug = require(`debug`)(`contentful-sync-redis:redis`)
const redis = require(`redis`)
const bluebird = require(`bluebird`)

exports.createClient = url => new Redis(url)

class Redis {
  constructor(url) {
    //Promisify Redis operations so now we can e.g. await client.getAsync
    bluebird.promisifyAll(redis.RedisClient.prototype)
    this.client = redis.createClient(url || `redis://localhost:6379`)
    this.client.on(`error`, function(err) {
      debug(err)
    })
  }

  /*
    Storing a single entry
  */
  async storeEntry(entry) {
    try {
      return await this.client.setAsync(
        `contentful:entry:${entry.sys.id}`,
        JSON.stringify(entry)
      )
    } catch (err) {
      debug(`Error storing entry: %O`, entry)
      throw new Error(err)
    }
  }
  async removeEntry(entry) {
    try {
      return await this.client.delAsync(`contentful:entry:${entry.sys.id}`)
    } catch (err) {
      debug(`Error removing entry: %O`, entry)
      throw new Error(err)
    }
  }

  /*
    Storing multiple entries
  */
  async getAllEntries() {
    debug(`Getting all entries from cache`)
    try {
      // Filter keys by our naming convention
      const entryKeys = await this.client.keysAsync(`contentful:entry:*`)
      const entries = await this.client.mgetAsync(entryKeys)
      return entries.map(JSON.parse)
    } catch (err) {
      debug(`Error getting entries from cache: %s`, err)
      throw new Error(err)
    }
  }
  async storeEntries(entries) {
    debug(`Storing %d entries`, entries.length)
    try {
      return await Promise.all(entries.map(this.storeEntry))
    } catch (err) {
      debug(`Error storing entries: %O`, entries)
    }
  }
  async removeEntries(entries) {
    debug(`Removing %d entries`, entries.length)
    try {
      return await Promise.all(entries.map(this.removeEntry))
    } catch (err) {
      debug(`Error removing entries: %O`, entries)
    }
  }
}
