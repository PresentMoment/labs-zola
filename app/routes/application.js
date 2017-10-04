import Ember from 'ember';
import sources from '../sources';
import carto from '../utils/carto2';

const { service } = Ember.inject;

export default Ember.Route.extend({
  mainMap: service(),

  model() {
    const cartoSourcePromises = Object.keys(sources)
      .filter(key => sources[key].type === 'cartovector')
      .map((key) => {
        const source = sources[key];
        const { minzoom = 0 } = source;

        return carto.getVectorTileTemplate(source['source-layers'])
          .then(template => ({
            id: source.id,
            type: 'vector',
            tiles: [template],
            minzoom,
          }));
      });

    return Promise.all(cartoSourcePromises);
  },

  afterModel() {
    this.get('mainMap').resetBounds();
  },
});