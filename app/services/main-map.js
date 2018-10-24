import Service from '@ember/service';
import { computed } from '@ember-decorators/object';
import $ from 'jquery';
import pointLayer from '../layers/point-layer';

const DEFAULT_BOUNDS = [-73.9, 40.690913, -73.832692, 40.856654];

export default class MainMapService extends Service {
  mapInstance = null;

  selected = null;

  currentZoom = null;

  currentMeasurement = null;

  drawMode = null;

  shouldFitBounds = false;

  @computed('selected')
  get bounds() {
    const selected = this.get('selected');
    const { mapInstance } = this;
    if (mapInstance) {
      mapInstance.resize();
    }

    if (selected) {
      return selected.get('bounds');
    }
    return DEFAULT_BOUNDS;
  }

  pointLayer = pointLayer;

  currentAddress = null;

  drawnFeature = null;

  @computed('drawnFeature')
  get drawnFeatureSource() {
    const feature = this.get('drawnFeature');
    return {
      type: 'geojson',
      data: feature,
    };
  }

  @computed('currentAddress')
  get addressSource() {
    const currentAddress = this.get('currentAddress');
    return {
      type: 'geojson',
      data: {
        type: 'Point',
        coordinates: currentAddress,
      },
    };
  }

  @computed('selected')
  isSelectedBoundsOptions() {
    const selected = this.get('selected');
    const el = $('.map-container');  // eslint-disable-line
    const height = el.height();
    const width = el.width();

    const fullWidth = window.innerWidth;
    // width of content area on large screens is 5/12 of full
    const contentWidth = (fullWidth / 12) * 5;
    // on small screens, no offset
    const offset = fullWidth < 1024 ? 0 : -((width - contentWidth) / 2);
    const padding = Math.min(height, (width - contentWidth)) / 2.5;

    // get type of selected feature so we can do dynamic padding
    const type = selected ? selected.constructor.modelName : null;

    return {
      padding: selected && (type !== 'zoning-district') && (type !== 'commercial-overlay') ? padding : 0,
      offset: [offset, 0],
    };
  }

  resetBounds() {
    const { mapInstance } = this;
    if (mapInstance) {
      mapInstance.resize();
    }
    this.set('selected', null);
  }
}
