/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const getTCFData = callback => {
  if (!window.__tcfapi) {
    callback(false);
    return;
  }

  window.__tcfapi('addEventListener', 2, (response, success) => {
    if (!success || response.cmpStatus === 'error') {
      callback(false);
    } else if (response.eventStatus === 'tcloaded' || response.eventStatus === 'useractioncomplete') {
      const purpose1 = response.purpose && response.purpose.consents && response.purpose.consents[1];
      callback(true, response.gdprApplies, response.tcString, purpose1);
    }
  });
};

const getUSPData = callback => {
  if (!window.__uspapi) {
    callback(false);
    return;
  }

  window.__uspapi('getUSPData', null, (response, success) => {
    callback(true, response.uspString);
  });
};

const getLocalOptOut = () => {
  let optOut = false;
  try {
    optOut = window.localStorage.getItem('connectIdOptOut');
  } catch (e) {
  }
  return optOut === '1';
};

const getPrivacyData = callback => {
  const localOptOut = getLocalOptOut();
  if (localOptOut) {
    callback({optOut: true});
    return;
  }

  getUSPData((uspDataSuccess, uspString) => {
    if (!uspDataSuccess || uspString[2] === 'Y') {
      callback({optOut: true});
      return;
    }

    getTCFData((tcfDataSuccess, gdprApplies, tcString, purpose1) => {
      if (gdprApplies && !purpose1) {
        callback({optOut: true});
        return;
      }
      callback({optOut: false, uspString, gdprApplies, tcString});
    });
  });
};

export default {
  getPrivacyData
};