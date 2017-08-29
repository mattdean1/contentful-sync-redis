[![Build Status](https://travis-ci.org/mattdean1/contentful-sync-redis.svg?branch=master)](https://travis-ci.org/mattdean1/contentful-sync-redis)

# contentful-sync-redis

> Keep an up-to-date copy of your Contentful space in Redis

#### What does this package do?

It keeps a copy of your Contentful space in Redis, using the [Contentful Sync API](https://www.contentful.com/developers/docs/concepts/sync/).

#### Why wouldn't I use the Contentful Javascript SDK?

The Contentful JS SDK is a only thin wrapper on top of their API, and it can be tedious to [implement the Sync API](https://www.contentful.com/developers/docs/javascript/tutorials/using-the-sync-api-with-js/) in every project.

# Install

```
npm install --save contentful-sync-redis
```

# Usage

```javascript
const ContentfulSyncRedis = require('contentful-sync-redis')
const cf = new ContentfulSyncRedis({ space: 'space_id', token: 'access_token' })
cf.getEntries()
	.then(entries => cf.resolveReferences(entries))
	.then(resolvedEntries => yourFunction(resolvedEntries))
```

# API

### Initialisation

Initialise the module using the `new` operator, passing in the mandatory values for:

 - Contentful space ID
 - Contentful access token

 Optionally, also pass in:

  - Contentful API host
     - Default: `cdn.contentful.com`
- Redis URL
  - Default: `redis://localhost:6379`

```javascript
const ContentfulSyncRedis = require('contentful-sync-redis')
const cf = new ContentfulSyncRedis({
	space: 'string',
	token: 'string',
	contentfulHost: 'optionalString',
	redisHost: 'optionalString',
})
```

### Synchronisation

Perform the initial download of content to Redis - it's often worth calling this just after initialisation

```javascript
cf.sync() // returns an empty promise
```

### Getting Entries

Return all entries in the Contentful space, after making sure the cache is synced.

You can use this without calling `sync()` beforehand.

```javascript
cf.getEntries() // returns a promise containing the entries
```


### Resolving Links

Dereferences links to other entries in your content and groups fields by locale. Pass in an array of entries.

```javascript
cf.resolveReferences(entries) // returns a promise containing the resolved entries
```

e.g.

```javascript
cf.resolveReferences([
	{
	  sys: { ... },
	  fields: {
	    title: {
	      "en-US": `Home`,
	    },
	    summary: {
	      "en-US": `This is the homepage, it talks about the site `,
	    },
	    sections: {
	      "en-US": [
	        {
	          sys: {
	            type: `Link`,
	            linkType: `Entry`,
	            id: `6Gz0vGZmAoSgOSAM2Ks4gW`,
	          },
	        },
	        {
	          sys: {
	            type: `Link`,
	            linkType: `Entry`,
	            id: `S9n6QORFyEeKEUaGS2Ym4`,
	          },
	        },
	      ],
	    },
	  },
	}
])
```

Returns a Promise which resolves to:
```javascript
{
  sys: { ... },
  fields: {
    "en-US": {
      title: `Home`,
      summary: `This is the homepage, it talks about the site `,
      sections: [
        {
          sys: { ... },
          fields: {
            "en-US": {
              title: `About us`,
              content: `Made by Matt Dean`,
            },
          },
        },
        {
          sys: { ... },
          fields: {
            "en-US": {
              title: `Introduction`,
              content: `Hi this is contentful-sync-redis`,
            },
          },
        },
      ],
    },
  },
}
```

Where 'sections' is a multi-reference field

###  Logging

See the [debug module](https://www.npmjs.com/package/debug). Use the package name (`contentful-sync-redis`) as the string in the environment variable.


# Release Map

### MVP - 0.1

 - [x] Implement Sync API
 - [x] `resolveReferences` helper function
 - [x] Preview API supported

### 0.2

 - [x] Tests using Mocha
 - [x] CI integration using Travis
 - [x] Contribution guidelines

### 0.3

 - [x] Group fields by locale
 - [x] No longer configure Redis client using an environment variable

### 1.0

- [ ] Support old versions of Node using webpack

### Later releases / To do

- Plugin functionality to allow for other databases
- Support filtering content
- Support assets

# Contributions

All contributions welcome! Please feel free to open an issue/PR :smile:
