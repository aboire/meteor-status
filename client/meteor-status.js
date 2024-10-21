import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

import './meteor-status.html';

const meteorStatusI18n = {
  en: {
    disconnected: 'Disconnected from server, trying to reconnect in %delay%s.',
    connecting: 'Disconnected from server, trying to reconnect...',
    retry: 'Retry now',
  },
  es: {
    disconnected: 'Desconectado del servidor, reconectando en %delay% segundos.',
    retry: 'Reintentar ahora',
  },
  fr: {
    disconnected: 'Déconnecté du serveur, prochaine tentative de reconnexion dans %delay%s.',
    connecting: 'Déconnecté du serveur, reconnexion en cours...',
    retry: 'Réessayer',
  },
  zh: {
    disconnected: '从服务器断开连接，%delay%秒后将尝试重新链接。',
    retry: '现在再试',
  },
  ar: {
    disconnected: 'انقطع الاتصال، جاري اعادة المحاولة خلال %delay%ث.',
    retry: 'جرب الآن',
  },
};

Template.meteorStatus.onCreated(function () {
  const instance = this;

  instance.updateCountdownTimeout = null;
  instance.nextRetry = new ReactiveVar(0);
  instance.options = {
    style: true,
    lang: 'en',
    position: 'bottom',
    showLink: true,
    msgText: '',
    textDisconnect: '',
    textConnecting: '',
    linkText: '',
    overlay: false,
  };

  // get template params
  if (Template.currentData()) {
    Object.keys(instance.options).forEach((property) => {
      if (Template.currentData()[property] !== undefined) {
        instance.options[property] = Template.currentData()[property];
      }
    });
  }

  // set tracker for retry delay
  Tracker.autorun(function () {
    // set nextRetry delay update
    if (Meteor.status().status === 'waiting') {
      instance.updateCountdownTimeout = Meteor.setInterval(function () {
        instance.nextRetry.set(Math.round((Meteor.status().retryTime - (new Date()).getTime()) / 1000));
      }, 1000);
    } else {
      instance.nextRetry.set(0);
      Meteor.clearInterval(instance.updateCountdownTimeout);
    }
  });
});

Template.meteorStatus.helpers({
  langMessage() {
    const lang = meteorStatusI18n[Template.instance().options.lang];

    // if connecting or 0 seconds until next retry show 'connecting' text
    if ((Meteor.status().status === 'connecting' || Template.instance().nextRetry.get() === 0)) {
      if (Template.instance().options.textConnecting) {
        return Template.instance().options.textConnecting;
      } if (lang.connecting) {
        return lang.connecting;
      }
    } else {
      // keep msgText for backward compatibility
      const customDisconnectText = Template.instance().options.textDisconnect || Template.instance().options.msgText;
      if (customDisconnectText) {
        return customDisconnectText.replace('%delay%', Template.instance().nextRetry.get());
      }
    }

    return lang.disconnected.replace('%delay%', Template.instance().nextRetry.get());
  },
  langRetryLink() {
    if (Template.instance().options.linkText) {
      return Template.instance().options.linkText;
    }
    return meteorStatusI18n[Template.instance().options.lang].retry;
  },
  isStyled() {
    return Template.instance().options.style;
  },
  showLink() {
    return Template.instance().options.showLink;
  },
  position() {
    if (Template.instance().options.overlay) {
      return 'meteor-status-overlay';
    }
    if (Template.instance().options.position === 'top') {
      return 'meteor-status-top';
    }
    return 'meteor-status-bottom';
  },
  show() {
    // only show alert if disconnected, if not manually disconnected (status == 'offline'), if at least second retry
    if (!Meteor.status().connected && Meteor.status().status !== 'offline' && Meteor.status().retryCount > 2) {
      return true;
    }
    return false;
  },
});

Template.meteorStatus.events({
  'click a.meteor-status-retry'() {
    if (Meteor.status().status !== 'connecting') {
      Meteor.reconnect();
    }
    return false;
  },
});
