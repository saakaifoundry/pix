import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import isValid from '../utils/email-validator';
import config from 'pix-live/config/environment';

const FORM_CLOSED = 'FORM_CLOSED';
const FORM_OPENED = 'FORM_OPENED';
const FORM_SUBMITTED = 'FORM_SUBMITTED';

export default Component.extend({

  store: service(),

  classNames: ['feedback-panel'],

  assessment: null,
  challenge: null,
  collapsible: true,

  _status: null,
  _email: null,
  _content: null,
  _error: null,

  isFormClosed: equal('_status', FORM_CLOSED),
  isFormOpened: equal('_status', FORM_OPENED),
  isFormSubmitted: equal('_status', FORM_SUBMITTED),

  didReceiveAttrs() {
    this._super(...arguments);
    this._reset();
  },

  _reset() {
    this.set('_email', null);
    this.set('_content', null);
    this.set('_error', null);
    this.set('_status', this._getDefaultStatus());
  },

  _closeForm() {
    this.set('_status', FORM_CLOSED);
    this.set('_error', null);
  },

  _getDefaultStatus() {
    return this.get('collapsible') ? FORM_CLOSED : FORM_OPENED;
  },

  _scrollToPanel: function() {
    $('html,body').animate({
      scrollTop: $('.feedback-panel__view').offset().top - 15
    }, config.APP.SCROLL_DURATION);
  },

  actions: {

    openFeedbackForm() {
      this.set('_status', FORM_OPENED);
      this._scrollToPanel();
    },

    cancelFeedback() {
      this._closeForm();
    },

    sendFeedback() {
      const email = this.get('_email');
      if(!isEmpty(email) && !isValid(email)) {
        this.set('_error', 'Vous devez saisir une adresse mail valide.');
        return;
      }

      const content = this.get('_content');
      if(isEmpty(content) || isEmpty(content.trim())) {
        this.set('_error', 'Vous devez saisir un message.');
        return;
      }

      const store = this.get('store');
      const assessment = this.get('assessment');
      const challenge = this.get('challenge');

      const feedback = store.createRecord('feedback', {
        email: this.get('_email'),
        content: this.get('_content'),
        assessment,
        challenge
      });
      feedback.save()
        .then(() => this.set('_status', FORM_SUBMITTED));
    }
  }
});
