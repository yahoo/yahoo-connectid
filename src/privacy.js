/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const getTCFData = (providedPrivacyData, callback) => {
  // if privacy data was provided, pass it back
  if (providedPrivacyData.gdprApplies !== undefined &&
    (Number(providedPrivacyData.gdprApplies) === 0 || providedPrivacyData.tcString)) {
    callback({
      tcString: providedPrivacyData.tcString,
      gdprApplies: providedPrivacyData.gdprApplies,
    }, true);
    return;
  }

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

const getUSPData = (providedPrivacyData, callback) => {
  // if privacy data was provided, pass it back
  if (providedPrivacyData.uspString) {
    callback({uspString: providedPrivacyData.uspString}, true);
    return;
  }

  if (!window.__uspapi) {
    callback(undefined, false);
    return;
  }

  window.__uspapi('getUSPData', null, (response, success) => {
    callback(success ? {uspString: response.uspString} : undefined, success);
  });
};

export const getPrivacyData = (providedPrivacyData, callback) => {
  getUSPData(providedPrivacyData, (uspData, uspDataSuccess) => {
    getTCFData(providedPrivacyData, (tcfData, tcfDataSuccess) => {
      callback({...uspData, ...tcfData}, uspDataSuccess && tcfDataSuccess);
    });
  });
};
