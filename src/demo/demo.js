/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import $ from 'jquery';
import connectid from '../connectid';

const LOCALSTORAGE_KEY = 'connectId';
const LOCALSTORAGE_KEY_DEMO = 'connectId-demo';

// eslint-disable-next-line
const GDPR_CONSENT_ALLOWED = 'CPdBusAPdBusAAOACBENCYCoAP_AAH_AACiQIlNd_X__bX9n-_7_6ft0cY1f9_r3ruQzDhfFs-8F3L_W_LwX32E7NF36pq4KmR4ku1bBIQFtHMnUDUmxaolVrzHsak2cpyNKI7JkknsZe2dYGF9Pn9lD-YKZ7_5_9_f52T_9_9_-39z3_9f___dt_-__-vjfV599n_v9fV_789Kf9____-_-___4IQQ_AJMNW4gC7EscCbQMIoQQIwrCQqAUAEFAMLRBYAODgp2VgEusIWACAVARgRAgxBRgwCAAACAJCIAJACwQCIAiAQAAgARAIQAETAILACwMAgABANCxACgAECQgyICI5TAgIgSCglsrEEoK9DTCAOssAKBRGxUACJAABSAgJCwcAwBICXCyQJMULwAw0AGAAIIlCIAMAAQRKFQAYAAgiUA';
const GDPR_CONSENT_NOTALLOWED = 'CPdIUkAPdIUkAAOACCENCaCgAAAAAAAAACiQAAAAAABhoAMAAQRKEQAYAAgiUKgAwABBEoA';

const setPrivacyPreferences = (local, usp, gdpr) => {
  window.localStorage.removeItem('connectIdOptOut');
  delete window.__tcfapi;
  delete window.__uspapi;

  if (local !== 'unavailable') {
    window.localStorage.setItem('connectIdOptOut', local === 'allowed' ? '0' : '1');
  }

  if (usp !== 'unavailable') {
    let uspString;
    if (usp === 'does_not_apply') {
      uspString = '1---';
    } else {
      uspString = usp === 'allowed' ? '1YNN' : '1YYN';
    }
    window.__uspapi = (command, version, callback) => {
      callback({uspString}, true);
    };
  }

  if (gdpr !== 'unavailable') {
    const gdprApplies = gdpr !== 'does_not_apply';

    window.__tcfapi = (command, version, callback) => {
      const response = {
        eventStatus: 'tcloaded',
        gdprApplies,
      };
      if (gdprApplies) {
        let tcString;
        if (gdprApplies) {
          tcString = gdpr === 'allowed' ? GDPR_CONSENT_ALLOWED : GDPR_CONSENT_NOTALLOWED;
        }
        const purpose1 = !gdprApplies ? undefined : gdpr === 'allowed';

        response.tcString = tcString;
        response.purpose = {
          consents: {
            1: purpose1,
          },
        };
      }
      callback(response, true);
    };
  }
};

const renderLocalStorageData = () => {
  const json = window.localStorage.getItem(LOCALSTORAGE_KEY);
  const data = JSON.stringify(JSON.parse(json), null, 2);
  $('#localStorageData pre').text(data);
};

const callGetIds = () => {
  const demoState = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY_DEMO) || '{}');
  document.getElementById('pixelId').value = demoState.pixelId || '';
  document.getElementById('email').value = demoState.email || '';
  document.getElementById('puid').value = demoState.puid || '';
  document.getElementById('privacy_local').value = demoState.privacyLocal || 'unavailable';
  document.getElementById('privacy_usp').value = demoState.privacyUsp || 'does_not_apply';
  document.getElementById('privacy_gdpr').value = demoState.privacyGdpr || 'does_not_apply';

  setPrivacyPreferences(demoState.privacyLocal, demoState.privacyUsp, demoState.privacyGdpr);

  // get ids from yahoo-connectid module
  connectid.getIds(
    demoState,
    ids => {
      $('#getIdsResponse pre').text(`${JSON.stringify(ids, null, 2)}`);
    },
  );
};

(() => {
  document.getElementById('execute').onclick = () => {
    const pixelId = document.getElementById('pixelId').value;
    const email = document.getElementById('email').value;
    const puid = document.getElementById('puid').value;
    const privacyLocal = document.getElementById('privacy_local').value || 'unavailable';
    const privacyUsp = document.getElementById('privacy_usp').value || 'does_not_apply';
    const privacyGdpr = document.getElementById('privacy_gdpr').value || 'does_not_apply';
    window.localStorage.setItem(LOCALSTORAGE_KEY_DEMO, JSON.stringify({
      pixelId,
      email,
      puid,
      privacyLocal,
      privacyUsp,
      privacyGdpr,
    }));

    callGetIds();
  };

  document.getElementById('reset').onclick = () => {
    window.localStorage.removeItem(LOCALSTORAGE_KEY);
    document.cookie = `${LOCALSTORAGE_KEY}=;Max-Age=0;Domain=.test.com;path=/;Secure;SameSite=None`;

    const pixelId = document.getElementById('pixelId').value;
    const privacyLocal = document.getElementById('privacy_local').value || 'unavailable';
    const privacyUsp = document.getElementById('privacy_usp').value || 'does_not_apply';
    const privacyGdpr = document.getElementById('privacy_gdpr').value || 'does_not_apply';
    window.localStorage.setItem(LOCALSTORAGE_KEY_DEMO, JSON.stringify({
      pixelId,
      privacyLocal,
      privacyUsp,
      privacyGdpr,
    }));

    callGetIds();
  };

  setInterval(renderLocalStorageData, 500);
  callGetIds();
})();
