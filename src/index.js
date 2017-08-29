const debug = require(`debug`)(`contentful-sync-redis:contentful`)
const createContentfulClient = require(`contentful`).createClient

const createRedisClient = require(`./redis`).createClient
const { resolve, createEntriesMap } = require(`./contentful-utils`)

module.exports = class ContentfulSyncRedis {
  constructor({ space, token, contentfulHost, redisHost }) {
    this.client = createContentfulClient({
      space,
      token,
      resolveLinks: false,
      host: contentfulHost || `cdn.contentful.com`,
    })
    this.db = createRedisClient(redisHost)
    this.syncToken = false
    this.lastResolvedContent = {
      content: false,
      resolved: false,
    }
  }

  // Get all entries from cache (making sure cache is up to date via syncing first)
  async getEntries() {
    debug(`Getting entries`)
    try {
      await this.sync()
      return await this.db.getAllEntries()
    } catch (err) {
      debug(`Error getting entries: %s`, err)
      throw new Error(err)
    }
  }

  // Called before geting data from CF, ensures cache is up to date
  async sync() {
    debug(`Syncing`)
    try {
      // Filter by entries only on initial sync since later syncs don't support it
      let query = this.syncToken
        ? { nextSyncToken: this.syncToken }
        : { initial: true, type: `Entry` }
      query.resolveLinks = false
      const clientSyncResponse = await this.client.sync(query)

      if (clientSyncResponse.nextSyncToken === this.syncToken) {
        debug(`No updates since last sync`)
        return Promise.resolve()
      }

      debug(`Sync updates found, updating cache...`)
      this.syncToken = clientSyncResponse.nextSyncToken
      const { entries, deletedEntries } = clientSyncResponse
      // Use promise.all so these execute in parallel
      await Promise.all([
        this.db.storeEntries(entries),
        this.db.removeEntries(deletedEntries),
      ])
      return Promise.resolve()
    } catch (err) {
      debug(`Error syncing contentful: %s`, err)
      throw new Error(err)
    }
  }

  // Resolve references to other entries in an array of contentful entries
  async resolveReferences(entries) {
    try {
      const stringifiedContent = JSON.stringify(entries)
      // If we already resolved links for this content, return the stored data
      if (this.lastResolvedContent.content === stringifiedContent) {
        debug(`Resolved entries found in cache`)
        return this.lastResolvedContent.resolved
      }

      debug(`Resolving entries...`)
      const entriesMap = createEntriesMap(entries)
      const resolvedEntries = resolve(entries, entriesMap)
      this.lastResolvedContent = {
        content: stringifiedContent,
        resolved: resolvedEntries,
      }
      debug(`Returning resolved entries`)
      return resolvedEntries
    } catch (err) {
      debug(`Failed resolving references for entries: %O`, entries)
      throw new Error(err)
    }
  }
}
