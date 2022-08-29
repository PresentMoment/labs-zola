import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import gtag from 'labs-zola/utils/gtag';

export default class BookmarkButton extends Component {
  bookmarkableModel = null;

  @service
  store;

  @service
  metrics;

  // we don't know what kind of model this is
  // we only know that it's bookmarkable
  @computed('bookmarkableModel.bookmark')
  get saved() {
    return this.bookmarkableModel.bookmark;
  }

  @action
  async toggleSaved() {
    const { bookmark } = this.bookmarkableModel;
    const resolvedBookmark = await bookmark;

    if (resolvedBookmark) {
      gtag('event', 'delete_bookmark', {
        event_category: 'Bookmark',
        event_action: 'Deleted Bookmark',
      });

      resolvedBookmark.deleteRecord();
      resolvedBookmark.save();
    } else {
      this.createBookmark();
    }
  }

  @action
  async createBookmark() {
    gtag('event', 'bookmark', {
      event_category: 'Bookmark',
      event_action: 'Used Bookmark',
    });

    // GA
    this.get('metrics').trackEvent('GoogleAnalytics', {
      eventCategory: 'Bookmark',
      eventAction: 'Used Bookmark',
    });

    const { bookmarkableModel } = this;

    await this.store.createRecord('bookmark', {
      bookmark: bookmarkableModel,
    }).save();
  }
}
