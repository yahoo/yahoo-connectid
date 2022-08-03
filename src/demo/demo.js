/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import $ from 'jquery';
import connectid from '../connectid';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const LOCALSTORAGE_KEY_DEMO = 'yahoo-connectid-demo';

const GDPR_CONSENT_ALLOWED = 'CPdBusAPdBusAAOACBENCYCoAP_AAH_AACiQIlNd_X__bX9n-_7_6ft0cY1f9_r3ruQzDhfFs-8F3L_W_LwX32E7NF36pq4KmR4ku1bBIQFtHMnUDUmxaolVrzHsak2cpyNKI7JkknsZe2dYGF9Pn9lD-YKZ7_5_9_f52T_9_9_-39z3_9f___dt_-__-vjfV599n_v9fV_789Kf9____-_-___4IQQ_AJMNW4gC7EscCbQMIoQQIwrCQqAUAEFAMLRBYAODgp2VgEusIWACAVARgRAgxBRgwCAAACAJCIAJACwQCIAiAQAAgARAIQAETAILACwMAgABANCxACgAECQgyICI5TAgIgSCglsrEEoK9DTCAOssAKBRGxUACJAABSAgJCwcAwBICXCyQJMULwAw0AGAAIIlCIAMAAQRKFQAYAAgiUA';
const GDPR_CONSENT_NOTALLOWED = 'CPdIUkAPdIUkAAOACCENCaCgAAAAAAAAACiQAAAAAABhoAMAAQRKEQAYAAgiUKgAwABBEoA';

let localStorageDataJson = '';

const setPrivacyPreferences = value => {
  const mockPrivacySignals = (localAllowed, uspAllowed, gdprAllowed) => {
    window.localStorage.removeItem('connectIdOptOut');
    delete window.__tcfapi;
    delete window.__uspapi;

    if (localAllowed !== null) {
      window.localStorage.setItem('connectIdOptOut', localAllowed ? '0' : '1');
    }

    if (gdprAllowed !== null) {
      window.__tcfapi = (command, version, callback) => {
        callback({
          eventStatus: 'tcloaded',
          gdprApplies: gdprAllowed !== null,
          ...gdprAllowed !== null ? {tcString: gdprAllowed ? GDPR_CONSENT_ALLOWED : GDPR_CONSENT_NOTALLOWED} : {},
        }, true);
      };
    }

    if (uspAllowed !== null) {
      window.__uspapi = (command, version, callback) => {
        callback({
          uspString: uspAllowed ? '1---' : '1YYN'
        }, true);
      };
    }
  };

  switch (value) {
  case 'local_notallowed':
    mockPrivacySignals(false, true, true);
    break;
  case 'usp_allowed':
    mockPrivacySignals(null, true, null);
    break;
  case 'usp_notallowed':
    mockPrivacySignals(null, false, null);
    break;
  case 'gdpr_allowed':
    mockPrivacySignals(null, null, true);
    break;
  case 'gdpr_notallowed':
    mockPrivacySignals(null, null, false);
    break;
  default:
    mockPrivacySignals(null, null, null);
  }
}

const renderLocalStorageData = () => {
  const json = window.localStorage.getItem(LOCALSTORAGE_KEY);
  localStorageDataJson = json;
  const data = JSON.stringify(JSON.parse(json));
  $('#localStorageData').text(data);
};

const callGetIds = () => {
  const demoState = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY_DEMO) || '{}');
  document.getElementById('pixelId').value = demoState.pixelId || '';
  document.getElementById('email').value = demoState.email || '';
  document.getElementById('puid').value = demoState.puid || '';
  document.getElementById('privacy').value = demoState.privacy || 'none';

  setPrivacyPreferences(demoState.privacy);

  // get ids from yahoo-connectid module
  connectid.getIds(
    demoState,
    ids => {
      document.getElementById('getIdsResponse').innerHTML = `${JSON.stringify(ids, null, 2)}`;
    });
};

(() => {
  document.getElementById('execute').onclick = evt => {
    const pixelId = document.getElementById('pixelId').value;
    const email = document.getElementById('email').value;
    const puid = document.getElementById('puid').value;
    const privacy = document.getElementById('privacy').value;
    window.localStorage.setItem(LOCALSTORAGE_KEY_DEMO, JSON.stringify({
      pixelId,
      email,
      puid,
      privacy
    }));

    callGetIds();
  };

  document.getElementById('reset').onclick = evt => {
    window.localStorage.removeItem(LOCALSTORAGE_KEY);
    const pixelId = document.getElementById('pixelId').value;
    window.localStorage.setItem(LOCALSTORAGE_KEY_DEMO, JSON.stringify({pixelId}));
    callGetIds();
  };

  setInterval(renderLocalStorageData, 250);
  callGetIds();
})();
