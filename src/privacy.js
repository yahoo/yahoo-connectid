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
      callback(true, response.gdprApplies, response.tcString);
    }
  });
};

const getUSPData = callback => {
  if (!window.__uspapi) {
    callback(false);
    return;
  }

  window.__uspapi('getUSPData', null, (response) => {
    callback(true, response.uspString);
  });
};

const getPrivacyData = callback => {
  getUSPData((uspDataSuccess, uspString) => {
    getTCFData((tcfDataSuccess, gdprApplies, tcString) => {
      callback({uspString, gdprApplies, tcString});
    });
  });
};

export default {
  getPrivacyData,
};
