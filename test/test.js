const assert = require(`assert`) // node.js core module

const ClassInstance = require(`../index`)
const contentfulUtils = require(`../src/contentful-utils`)
const resolveTestData = require(`./resolve-test-data`)

describe(`Package`, () => {
  describe(`Public API`, () => {
    let instance

    beforeEach(() => {
      // Create a new Rectangle object before every test.
      instance = new ClassInstance(`fakestring`, `fakestring`)
    })

    it(`should have a sync method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.sync, `function`)
    })
    it(`should have a getEntries method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.getEntries, `function`)
    })
    it(`should have a resolveReferences method`, () => {
      assert.equal(typeof instance, `object`)
      assert.equal(typeof instance.resolveReferences, `function`)
    })
  })

  describe(`Resolving references`, () => {
    it(`should map test data correctly`, () => {
      assert.deepEqual(
        contentfulUtils.createEntriesMap(resolveTestData.raw),
        resolveTestData.mapped
      )
    })
    it(`should resolve test data correctly`, () => {
      assert.deepEqual(
        contentfulUtils.resolve(resolveTestData.raw, resolveTestData.mapped),
        resolveTestData.resolved
      )
    })
  })
})
