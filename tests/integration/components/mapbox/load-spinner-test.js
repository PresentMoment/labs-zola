import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mapbox/load-spinner', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.map = {
      instance: {
        on() {},
        off() {},
      },
    };

    await render(hbs`
      {{mapbox/load-spinner
        map = map.instance
      }}
    `);

    assert.equal(this.element.textContent.trim(), '');
  });
});
