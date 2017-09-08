import Ember from 'ember';
import mapboxgl from 'mapbox-gl';
import { task } from 'ember-concurrency';
import carto from '../utils/carto';

const { computed } = Ember;
const { reads } = computed;


const zoningSQL = 'SELECT *, LEFT(zonedist, 2) as primaryzone FROM support_zoning_zd';
const zdFillLayer = {
  id: 'zd',
  type: 'fill',
  source: 'zoning',
  'source-layer': 'layer0',
  paint: {
    'fill-color': {
      property: 'primaryzone',
      type: 'categorical',
      stops: [
        ['BP', '#666666'],
        ['C1', '#ff0000'],
        ['C2', '#ff0000'],
        ['C3', '#ff0000'],
        ['C4', '#ff0000'],
        ['C5', '#ff0000'],
        ['C6', '#ff0000'],
        ['C7', '#ff0000'],
        ['C8', '#ff0000'],
        ['M1', '#E362FB'],
        ['M2', '#E362FB'],
        ['M3', '#E362FB'],
        ['PA', '#78D271'],
        ['R1', '#F2F618'],
        ['R2', '#F2F618'],
        ['R3', '#F2F618'],
        ['R4', '#F2F618'],
        ['R5', '#F2F618'],
        ['R6', '#F2F618'],
        ['R7', '#F2F618'],
        ['R8', '#F2F618'],
        ['R9', '#F2F618'],
      ],
    },
    'fill-opacity': 0.3,
    'fill-antialias': true,
  },
};

const zdLineLayer = {
  id: 'zd-lines',
  type: 'line',
  source: 'zoning',
  'source-layer': 'layer0',
  paint: {
    'line-opacity': {
      stops: [
        [12, 0],
        [13, 0.2],
      ],
    },
    'line-width': {
      stops: [
        [13, 1],
        [14, 3],
      ],
    },
  },
};

const paint = {
  labels: {
    'text-color': '#626262',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': {
      stops: [
        [
          12,
          0,
        ],
        [
          13,
          1,
        ],
      ],
    },
  },
  co_labels: {
    'text-color': 'rgba(255, 0, 0, 1)',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
  },
};

const zdLabelLayer = {
  id: 'zd_labels',
  source: 'zoning',
  type: 'symbol',
  'source-layer': 'layer0',
  paint: paint.labels,
  layout: {
    'symbol-placement': 'point',
    'text-field': '{zonedist}',
    'text-size': {
      stops: [
        [
          10,
          8,
        ],
        [
          14,
          16,
        ],
      ],
    },
  },
};

const plutoSQL = 'SELECT the_geom_webmercator, bbl, address FROM support_mappluto';

const plutoFillLayer = {
  id: 'pluto-fill',
  type: 'fill',
  source: 'pluto',
  minzoom: 15,
  'source-layer': 'layer0',
  paint: {
    'fill-opacity': 0,
  },
};

const plutoLineLayer = {
  id: 'pluto-line',
  type: 'line',
  source: 'pluto',
  minzoom: 15,
  'source-layer': 'layer0',
  paint: {
    'line-width': 0.5,
    'line-color': 'rgba(130, 130, 130, 1)',
    'line-opacity': {
      stops: [
        [15, 0],
        [16, 1],
      ],
    },
  },
};

const highlightedLotLayer = {
  id: 'highlighted-lot',
  type: 'fill',
  source: 'highlighted-lot',
  paint: {
    'fill-opacity': 1,
    'fill-color': 'steelblue',
  },
};

export default Ember.Component.extend({
  classNames: ['map-container'],

  lat: 40.7071266,

  lng: -74,

  zoom: 10.2,

  highlightedLotFeature: null,

  highlightedLotSource: Ember.computed('highlightedLotFeature', function () {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [this.get('highlightedLotFeature')],
      },
    };
  }),

  highlightedLotLayer,

  zoningSourcePromise: task(function* () {
    return yield carto.getVectorTileTemplate([zoningSQL])
      .then(zoningTemplate => ({
        type: 'vector',
        tiles: [zoningTemplate],
      }));
  }).restartable().on('didInsertElement'),
  zoningSource: reads('zoningSourcePromise.last.value'),

  zdFillLayer,
  zdLineLayer,
  zdLabelLayer,

  plutoSourcePromise: task(function* () {
    return yield carto.getVectorTileTemplate([plutoSQL])
      .then(plutoTemplate => ({
        type: 'vector',
        tiles: [plutoTemplate],
        minzoom: 12,
      }));
  }).restartable().on('didInsertElement'),
  plutoSource: reads('plutoSourcePromise.last.value'),

  plutoFillLayer,
  plutoLineLayer,

  actions: {
    handleMapLoad(map) {
      map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.moveLayer('building');
      setTimeout(() => { map.setPaintProperty('building', 'fill-opacity', 0.4); }, 1000);
    },

    handleMouseover(e) {
      const feature = e.target.queryRenderedFeatures(e.point, { layers: ['pluto-fill'] })[0];

      if (feature) {
        const { bbl } = feature.properties;

        e.target.getCanvas().style.cursor = 'pointer';

        const prevFeature = this.get('highlightedLotFeature');
        if (!prevFeature || prevFeature.properties.bbl !== bbl) {
          this.set('highlightedLotFeature', feature);
        }
      } else {
        e.target.getCanvas().style.cursor = '';
        this.set('mouseoverLocation', null);
      }
    },

    handleMouseleave() {
      this.set('mouseoverLocation', null);
    },
  },
});
