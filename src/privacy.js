/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const getTCFData = callback => {
  if (!window.__tcfapi) {
    callback(undefined, false);
    return;
  }

  window.__tcfapi('addEventListener', 2, (response, success) => {
    if (!success || response.cmpStatus === 'error') {
      callback(undefined, false);
      return;
    }

    if (response.eventStatus === 'tcloaded' || response.eventStatus === 'useractioncomplete') {
      callback({
        tcString: response.tcString,
        gdprApplies: response.gdprApplies,
      }, true);
    }
  });
};

const getUSPData = callback => {
  if (!window.__uspapi) {
    callback(undefined, false);
    return;
  }

  window.__uspapi('getUSPData', null, (response, success) => {
    callback(success ? {uspString: response.uspString} : undefined, success);
  });
};

const getPrivacyData = callback => {
  getUSPData((uspData, uspDataSuccess) => {
    getTCFData((tcfData, tcfDataSuccess) => {
      callback({...uspData, ...tcfData}, uspDataSuccess && tcfDataSuccess);
    });
  });
};

export default {
  getPrivacyData
};