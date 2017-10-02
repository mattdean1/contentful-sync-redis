const debug = require(`debug`)(`contentful-sync-redis:contentful`)

// create an object with content ID as keys
const createEntriesMap = entries => {
  try {
    return entries.reduce(
      (accu, entry) => Object.assign(accu, { [entry.sys.id]: entry }),
      {}
    )
  } catch (err) {
    debug(`entries: %O`, entries)
  }
}

// Recursive func used to resolve links
const resolve = (content, entriesMap) => {
  try {
    // content is an array
    if (Array.isArray(content)) {
      return content.map(x => resolve(x, entriesMap))
    }
    // content is an entry with fields
    if (
      content &&
      content.sys &&
      (content.sys.type === `Entry` || content.sys.type === `Asset`)
    ) {
      return groupFieldsByLocale(content, entriesMap)
    }
    // Content is a reference to another entry
    if (
      content &&
      content.sys &&
      content.sys.type === `Link` &&
      content.sys.linkType === `Entry`
    ) {
      return resolve(entriesMap[content.sys.id], entriesMap)
    }

    //Content is an asset
    if (
      content &&
      content.sys &&
      content.sys.type === `Link` &&
      content.sys.linkType === `Asset`
    ) {
      return resolve(entriesMap[content.sys.id], entriesMap)
    }

    // content is a value
    return content
  } catch (err) {
    debug(`Error resolving: %s`, err)
    debug(`Could not resolve content: %O`, content)
    // Don't throw error since a missing entry is probably better than crashing the program
    return {}
  }
}

/*
groups fields by locale e.g.

original:
const fields = {
  title: { `en_US`: `value` },
  subtitle: { `en_US`: `value`},
}

grouped:
const fields = {
  `en_US`: {
    title:  `value`,
    subtitle: `value`
  }
}
*/
const groupFieldsByLocale = (entry, entriesMap) => {
  try {
    const newEntry = { sys: entry.sys, fields: {} }
    Object.keys(entry.fields).forEach(fieldName => {
      const locales = Object.keys(entry.fields[fieldName])
      locales.forEach(localeName => {
        // add locale property if it doesn't exist already
        if (!newEntry.fields[localeName]) {
          newEntry.fields[localeName] = {}
        }

        newEntry.fields[localeName][fieldName] = resolve(
          entry.fields[fieldName][localeName],
          entriesMap
        )
      })
    })
    return newEntry
  } catch (err) {
    debug(`Error grouping fields by locale: %s`, err)
    debug(`Entry: %O`, entry)
    return entry
  }
}

module.exports = {
  createEntriesMap,
  resolve,
}
