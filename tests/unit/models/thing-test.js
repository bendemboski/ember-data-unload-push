import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { later } from '@ember/runloop';
import { settled } from '@ember/test-helpers';

module('Unit | Model | thing', function(hooks) {
  setupTest(hooks);

  test('pushing right after unloading gets models stick with isDestroying=true', async function(assert) {
    // put some data into the store
    let store = this.owner.lookup('service:store');
    store.pushPayload({
      data: [{
        id: 1,
        type: 'thing',
        attributes: {},
        relationships: {}
      }, {
        id: 2,
        type: 'thing',
        attributes: {},
        relationships: {}
      }]
    });
    // sanity check
    assert.deepEqual(store.peekAll('thing').mapBy('isDestroying'), [ false, false ]);

    // unload and re-push
    store.peekAll('thing').invoke('unloadRecord');
    store.pushPayload({
      data: [{
        id: 1,
        type: 'thing',
        attributes: {},
        relationships: {}
      }, {
        id: 2,
        type: 'thing',
        attributes: {},
        relationships: {}
      }]
    });

    // wait 100ms to be sure
    later(() => assert.deepEqual(store.peekAll('thing').mapBy('isDestroying'), [ false, false ]), 100);
    await settled();
  });

  test('syncing the live array fixes it', async function(assert) {
    // push some data into the store
    let store = this.owner.lookup('service:store');
    store.pushPayload({
      data: [{
        id: 1,
        type: 'thing',
        attributes: {},
        relationships: {}
      }, {
        id: 2,
        type: 'thing',
        attributes: {},
        relationships: {}
      }]
    });
    // sanity check
    assert.deepEqual(store.peekAll('thing').mapBy('isDestroying'), [ false, false ]);

    // unload and re-push, but this time force the live array to sync in between
    store.peekAll('thing').invoke('unloadRecord');
    store.peekAll('thing');
    store.pushPayload({
      data: [{
        id: 1,
        type: 'thing',
        attributes: {},
        relationships: {}
      }, {
        id: 2,
        type: 'thing',
        attributes: {},
        relationships: {}
      }]
    });

    assert.deepEqual(store.peekAll('thing').mapBy('isDestroying'), [ false, false ])
    later(() => assert.deepEqual(store.peekAll('thing').mapBy('isDestroying'), [ false, false ]), 100);
    await settled();
  });
});
