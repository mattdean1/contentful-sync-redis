[![Build Status](https://travis-ci.org/mattdean1/contentful-sync-redis.svg?branch=master)](https://travis-ci.org/mattdean1/contentful-sync-redis)

# contentful-sync-redis

> Keep an up-to-date copy of your Contentful space in Redis

#### What does this package do?

It keeps a copy of your Contentful space in Redis, using the [Contentful Sync API](https://www.contentful.com/developers/docs/concepts/sync/).

#### Why wouldn't I use the Contentful Javascript SDK?

The Contentful JS SDK is a only thin wrapper on top of their API, and it can be tedious to [implement the Sync API](https://www.contentful.com/developers/docs/javascript/tutorials/using-the-sync-api-with-js/) in every project.

# Setup

### Installation

```
npm install --save contentful-sync-redis
```

###  Environment variables

| Name      | Value                                    | Default                |
| --------- | ---------------------------------------- | ---------------------- |
| REDIS_URL | Redis URL                                | redis://localhost:6379 |
|           |                                          |                        |
| DEBUG     | See the [debug module](https://www.npmjs.com/package/debug) |                        |


# Usage

### Initialisation

```javascript
const Contentful = require(`contentful-sync-redis`)

// host can be either preview.contentful.com or the default cdn.contentful.com
// recommended to manage space_id and access_token via environment variables
const cf = new Contentful(contentful_space_id, contentful_access_token[, host])

// perform the initial download of content
cf.sync() //returns a promise
```



### Get Entries

```javascript
// return all entries in the contentful space, after making sure the cache is synced
cf.getEntries() // returns a promise
```



### Resolve Links

```javascript
// dereferences links to other entries in your content
cf.getEntries()
	.then(entries => cf.resolveReferences(entries))
```

e.g.

```javascript
cf.resolveReferences([
    {
    "sys": { ... },
    "fields": {
      "title": {
        "en-US": "Home"
      },
      "summary": {
        "en-US": "This is the homepage, it talks about the site "
      },
      "sections": {
        "en-US": [
          {
            "sys": {
              "type": "Link",
              "linkType": "Entry",
              "id": "6Gz0vGZmAoSgOSAM2Ks4gW"
            }
          },
          {
            "sys": {
              "type": "Link",
              "linkType": "Entry",
              "id": "S9n6QORFyEeKEUaGS2Ym4"
            }
          }
        ]
      }
    }
  },
])
```
Returns a Promise which resolves to:
```   
{
    "sys": { ... },
    "fields": {
      "title": {
        "en-US": "Home"
      },
      "summary": {
        "en-US": "This is the homepage, it talks about the site "
      },
      "sections": {
        "en-US": [
          {
            "sys": { ... },
            "fields": {
              "title": {
                "en-US": "About us"
              },
              "content": {
                "en-US": "Made by Matt Dean and Sam Stenton"
              }
            }
          },
          {
            "sys": { ... },
            "fields": {
              "title": {
                "en-US": "Introduction"
              },
              "content": {
                "en-US": "Hi this is the search accelerator"
              }
            }
          }
        ]
      }
    }
  },
```
Where 'sections' is a multi-reference field



# Release Map

### MVP - 0.1

[x] Implement Sync API
[x] `resolveReferences` helper function
[x] Preview API supported

### 0.2

[x] Tests using Mocha
[x] CI integration using Travis
[x] Contribution guidelines

### 1.0

- Support old versions of Node using webpack

### Later releases / To do

- Plugin functionality to allow for other databases
- Support filtering content
- Support assets

# Contributions

All contributions welcome! Please feel free to open an issue/PR :smile:
