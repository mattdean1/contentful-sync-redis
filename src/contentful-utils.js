const debug = require(`debug`)(`contentful-sync-redis:contentful`)

// create an object with content ID as keys
exports.createEntriesMap = entries => {
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
exports.resolve = (content, entriesMap) => {
  try {
    // content is an array
    if (Array.isArray(content)) {
      return content.map(x => this.resolve(x, entriesMap))
    }
    // content is an entry with fields
    if (content.sys && content.sys.type === `Entry`) {
      const fieldNames = Object.keys(content.fields)
      fieldNames.forEach(fieldName => {
        groupFieldByLocale(content.fields, fieldName, entriesMap)
      })
      return content
    }
    // Content is a reference
    if (
      content.sys &&
      content.sys.type === `Link` &&
      content.sys.linkType === `Entry`
    ) {
      return this.resolve(entriesMap[content.sys.id], entriesMap)
    }
    // content is a value
    return content
  } catch (err) {
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
const groupFieldByLocale = (fields, fieldName, entriesMap) => {
  const locales = Object.keys(fields[fieldName])
  locales.forEach(locale => {
    // content.fields.locale.fieldName
    if (!fields[locale]) {
      fields[locale] = {}
    }
    fields[locale][fieldName] = this.resolve(
      fields[fieldName][locale],
      entriesMap
    )
    // remove un-grouped data
    delete fields[fieldName][locale]
  })
  // remove un-grouped data
  delete fields[fieldName]
}
