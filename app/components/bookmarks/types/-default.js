import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import gtag from 'labs-zola/utils/gtag';
import layout from '../../../templates/components/bookmarks/types/-default';

export default class DefaultBookmark extends Component {
  @service
  metrics;

  layout = layout;

  items = [];

  @action
  deleteBookmark(bookmark) {
    bookmark.deleteRecord();
    bookmark.save();

    gtag('event', 'delete_bookmark', {
      event_category: 'Bookmark',
      event_action: 'Deleted Bookmark',
    });
  }

  @action
  async captureBookmarkDownload(format) {
    gtag('event', 'download_bookmark', {
      event_category: 'Download',
      event_action: `Downloaded Bookmark as ${format}`,
    });

    // GA
    this.get('metrics').trackEvent('GoogleAnalytics', {
      eventCategory: 'Download',
      eventAction: `Downloaded Bookmark as ${format}`,
      eventLabel: 'Export',
    });
  }
}
