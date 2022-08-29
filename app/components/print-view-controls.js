import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import gtag from 'labs-zola/utils/gtag';

export default class PrintViewControls extends Component {
  classNames = ['print-view--controls', 'align-middle'];

  @service('print')
  printSvc;

  @service
  metrics;

  widowResize() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const resizeEvent = window.document.createEvent('UIEvents');
        resizeEvent.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(resizeEvent);
        resolve();
      }, 300);
    });
  }

  @action
  async disablePrintView() {
    gtag('event', 'print', {
      event_category: 'Print',
      event_action: 'Disabled print view',
    });
    // GA
    this.get('metrics').trackEvent('GoogleAnalytics', {
      eventCategory: 'Print',
      eventAction: 'Disabled print view',
      eventLabel: 'export',
    });

    this.set('printSvc.enabled', false);

    await this.widowResize();
  }

  async click() {
    await this.widowResize();
  }
}
