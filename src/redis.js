const debug = require(`debug`)(`contentful-sync-redis:redis`)
const redis = require(`redis`)
const bluebird = require(`bluebird`)

//Promisify Redis operations so now we can e.g. await client.getAsync
bluebird.promisifyAll(redis.RedisClient.prototype)

exports.createClient = url => new Redis(url)

class Redis {
  constructor(url) {
    this.client = redis.createClient(url || `redis://localhost:6379`)
    this.client.on(`error`, function(err) {
      debug(err)
    })
  }

  /*
    Storing a single entry
  */
  async storeEntry(entry) {
    this.store(`contentful:entry:${entry.sys.id}`, entry)
  }

  async storeAsset(asset) {
    this.store(`contentful:asset:${asset.sys.id}`, asset)
  }

  async removeEntry(entry) {
    this.remove(`contentful:entry:${entry.sys.id}`)
  }

  async removeAsset(asset) {
    this.remove(`contentful:asset:${asset.sys.id}`)
  }

  async store(key, entry) {
    try {
      return await this.client.setAsync(key, JSON.stringify(entry))
    } catch (err) {
      debug(`Error storing entry: %O`, entry)
      throw new Error(err)
    }
  }

  async remove(key) {
    try {
      return await this.client.delAsync(key)
    } catch (err) {
      debug(`Error removing entry: %O`, key)
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

  async getAllAssets() {
    debug(`Getting all assets from cache`)
    try {
      // Filter keys by our naming convention
      const entryKeys = await this.client.keysAsync(`contentful:asset:*`)
      const assets = await this.client.mgetAsync(entryKeys)
      return assets.map(JSON.parse)
    } catch (err) {
      debug(`Error getting assets from cache: %s`, err)
      throw new Error(err)
    }
  }

  async getAll() {
    debug(`Getting all entries from cache`)
    try {
      // Filter keys by our naming convention
      const entryKeys = await this.client.keysAsync(`contentful:*`)
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
      return await Promise.all(entries.map(entry => this.storeEntry(entry)))
    } catch (err) {
      debug(`Error storing entries: %O`, entries)
      throw new Error(err)
    }
  }
  async removeEntries(entries) {
    debug(`Removing %d entries`, entries.length)
    try {
      return await Promise.all(entries.map(entry => this.removeEntry(entry)))
    } catch (err) {
      debug(`Error removing entries: %O`, entries)
      throw new Error(err)
    }
  }

  async storeAssets(assets) {
    debug(`Storing %d assets`, assets.length)
    try {
      return await Promise.all(assets.map(asset => this.storeAsset(asset)))
    } catch (err) {
      debug(`Error storing assets: %O`, assets)
      throw new Error(err)
    }
  }

  async removeAssets(assets) {
    debug(`Removing %d assets`, assets.length)
    try {
      return await Promise.all(assets.map(asset => this.removeAsset(asset)))
    } catch (err) {
      debug(`Error removing assets: %O`, assets)
      throw new Error(err)
    }
  }
}
