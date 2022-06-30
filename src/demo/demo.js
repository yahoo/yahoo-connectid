/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import $ from 'jquery';
import connectid from '../connectid';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const LOCALSTORAGE_KEY_DEMO = 'yahoo-connectid-demo';

let localStorageDataJson = '';

const renderLocalStorageData = () => {

  const json = window.localStorage.getItem(LOCALSTORAGE_KEY);

  if (json === localStorageDataJson) {
    return;
  }
  localStorageDataJson = json;

  const data = JSON.stringify(JSON.parse(json), null, 2);

  // display results
  $('#localStorageData').text(data);
};

const callGetIds = () => {
  const demoState = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY_DEMO) || '{}');
  document.getElementById('pixelId').value = demoState.pixelId || '';
  document.getElementById('email').value = demoState.email || '';
  document.getElementById('puid').value = demoState.puid || '';
  document.getElementById('gdpr').value = demoState.gdpr || '0';
  document.getElementById('gdprConsent').value = demoState.gdprConsent || '';
  document.getElementById('usPrivacy').value = demoState.usPrivacy || '';

  // get ids from yahoo-connectid module
  connectid.getIds(
    demoState,
    ids => {
      // display results
      document.getElementById('getIdsResponse').innerHTML = `// ${JSON.stringify(ids)}`;
    });
};

(() => {
  document.getElementById('execute').onclick = evt => {
    const pixelId = document.getElementById('pixelId').value;
    const email = document.getElementById('email').value;
    const puid = document.getElementById('puid').value;
    const gdpr = document.getElementById('gdpr').value;
    const gdprConsent = document.getElementById('gdprConsent').value;
    const usPrivacy = document.getElementById('usPrivacy').value;
    window.localStorage.setItem(LOCALSTORAGE_KEY_DEMO, JSON.stringify({
      pixelId,
      email,
      puid,
      gdpr,
      gdprConsent,
      usPrivacy
    }));

    callGetIds();
  };

  document.getElementById('reset').onclick = evt => {
    window.localStorage.clear();
    window.localStorage.removeItem(LOCALSTORAGE_KEY_DEMO);
    callGetIds();
  };

  setInterval(renderLocalStorageData, 250);
  callGetIds();
})();