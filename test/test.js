const assert = require(`assert`) // node.js core module

const ContentfulSyncRedis = require(`../`)
const contentfulUtils = require(`../src/contentful-utils`)
const resolveTestData = require(`./resolve-test-data`)

describe(`Package`, () => {
  describe(`Public API`, () => {
    let instance

    beforeEach(() => {
      // Create a new Rectangle object before every test.
      instance = new ContentfulSyncRedis({
        space: `fakestring`,
        token: `fakestring`,
      })
    })

    it(`should have a sync method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.sync, `function`)
    })
    it(`should have a getEntries method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.getEntries, `function`)
    })
    it(`should have a getAssets method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.getAssets, `function`)
    })
    it(`should have a getAll method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.getAll, `function`)
    })
    it(`should have a resolveReferences method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.resolveReferences, `function`)
    })
    it(`should have a getResolvedEntries method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.getResolvedEntries, `function`)
    })
  })

  describe(`Resolving functionality`, () => {
    it(`should return the same value when given a non-nested string`, () => {
      const str = `string`
      assert.equal(contentfulUtils.resolve(str), str)
    })

    it(`should return the same value when given a non-nested number`, () => {
      const int = 5
      assert.equal(contentfulUtils.resolve(int), int)
    })

    it(`should handle an array of values`, () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(contentfulUtils.resolve(array), array)
    })

    it(`should group fields by locale`, () => {
      const unresolvedEntry = {
        sys: { type: `Entry` },
        fields: {
          field1: {
            "en-US": `English1`,
            "de-DE": `Deutsch1`,
          },
          field2: {
            "en-US": `English2`,
            "de-DE": `Deutsch2`,
          },
        },
      }
      const resolvedEntry = {
        sys: { type: `Entry` },
        fields: {
          "en-US": {
            field1: `English1`,
            field2: `English2`,
          },
          "de-DE": {
            field1: `Deutsch1`,
            field2: `Deutsch2`,
          },
        },
      }
      assert.deepEqual(
        contentfulUtils.resolve(unresolvedEntry, {}),
        resolvedEntry
      )
    })

    it(`should resolve a single reference to another entry`, () => {
      // we include the locale here because a space will always have one
      const unresolvedEntry = {
        sys: { type: `Entry` },
        fields: {
          referenceField: {
            "en-US": {
              sys: {
                type: `Link`,
                linkType: `Entry`,
                id: `6Gz0vGZmAoSgOSAM2Ks4gW`,
              },
            },
          },
        },
      }
      const entryMapping = {
        "6Gz0vGZmAoSgOSAM2Ks4gW": {
          sys: { type: `Entry` },
          fields: {
            field1: {
              "en-US": `value`,
            },
          },
        },
      }
      const resolvedEntry = {
        sys: { type: `Entry` },
        fields: {
          "en-US": {
            referenceField: {
              sys: { type: `Entry` },
              fields: {
                "en-US": {
                  field1: `value`,
                },
              },
            },
          },
        },
      }

      assert.deepEqual(
        contentfulUtils.resolve(unresolvedEntry, entryMapping),
        resolvedEntry
      )
    })

    it(`should map test data correctly`, () => {
      assert.deepEqual(
        contentfulUtils.createEntriesMap(resolveTestData.raw),
        resolveTestData.mapped
      )
    })

    it(`should resolve test data correctly`, () => {
      const resolvedData = contentfulUtils.resolve(
        resolveTestData.raw,
        resolveTestData.mapped
      )
      assert.deepEqual(resolvedData, resolveTestData.resolved)
    })
  })
})
