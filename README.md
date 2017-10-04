[![Build Status](https://travis-ci.org/mattdean1/contentful-sync-redis.svg?branch=master)](https://travis-ci.org/mattdean1/contentful-sync-redis)

# contentful-sync-redis

> Keep an up-to-date copy of your Contentful space in Redis

#### What does this package do?

- Keeps a copy of your Contentful space in Redis, using the [Contentful Sync API](https://www.contentful.com/developers/docs/concepts/sync/).
- Provides a helper function to resolve [Links](https://www.contentful.com/developers/docs/concepts/links/) inside your entries.

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
	.then(entries => yourFunction(entries))
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



### Get Entries and Resolve Links

A wrapper function that calls `getEntries` and then `resolveReferences`.

```javascript
cf.getResolvedEntries(entries) // returns a promise containing the resolved entries
```

###

### Resolving Links

Dereferences links to other entries/assets in your content and groups fields by locale. Pass in an array of entries.

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

### Assets
Contentful doesn't resolve assets when they are linked to from an entry. To deal with this we download asset objects in the `sync` method. These are stored in Redis and resolved in the same way as any other link. An asset object will look like the following once resolved:

```
{
  fields: {
    "en-US": {
      title: `AWS S3`,
      file: {
        url: `//images.contentful.com/im67laxslxvo/4jM3XYHBusdsd0UACAIMeAgA86/87f6d5a43d8asd6495abe84e4ec5012ad66/AWS_S3.png`,
        details: {
          size: 30165,
          image: {
            width: 445,
            height: 250,
          },
        },
        fileName: `AWS S3.png`,
        contentType: `image/png`,
      },
    },
  },
}
```

If you just want to get all the assets stored simply use the `getAssets` method.

###  Logging

See the [debug module](https://www.npmjs.com/package/debug). Use the package name (`contentful-sync-redis`) as the string in the environment variable.


# Release Map / Changelog

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

### 0.4

- [x] Add sugar function to get entries and resolve references with a single call

### 1.0

- [ ] Support old versions of Node using webpack

### Later releases / To do

- Plugin functionality to allow for other databases
- Support filtering content
- Support assets

# Contributions

All contributions welcome! Please feel free to open an issue/PR :smile:
