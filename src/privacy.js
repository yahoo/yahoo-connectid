/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const getGPPData = callback => {
  if (typeof window.__gpp !== 'function') {
    callback({msg: 'API not found'}, false);
  } else {
    window.__gpp('addEventListener', (response, success) => {
      if (!success || response?.pingData?.cmpStatus === 'error') {
        callback({}, false);
      } else if (response?.pingData?.signalStatus === 'ready') {
        callback(response, true);
      }
    });
  }
};

const getTCFData = callback => {
  if (typeof window.__tcfapi !== 'function') {
    callback({msg: 'API not found'}, false);
  } else {
    window.__tcfapi('addEventListener', 2, (response, success) => {
      if (!success || response?.cmpStatus === 'error') {
        callback({}, false);
      } else if (response?.eventStatus === 'tcloaded' || response?.eventStatus === 'useractioncomplete') {
        callback(response, true);
      }
    });
  }
};

const getUSPData = callback => {
  if (typeof window.__uspapi !== 'function') {
    callback({msg: 'API not found'}, false);
  } else {
    window.__uspapi('getUSPData', null, (response, success) => {
      if (!success) {
        callback({}, false);
      } else {
        callback(response, true);
      }
    });
  }
};

const getPrivacyData = callback => {
  getGPPData((gppResponse, gppSuccess) => {
    getTCFData((tcfResponse, tcfSuccess) => {
      getUSPData((uspResponse, uspSuccess) => {
        callback({
          gpp: gppResponse?.pingData?.gppString,
          gppSid: gppResponse?.pingData?.applicableSections?.join(',') || '-1',
          uspString: uspResponse?.uspString,
          gdprApplies: tcfResponse?.gdprApplies,
          tcString: tcfResponse?.tcString,
        });
      });
    });
  });
};

const isLocallyOptedOut = () => {
  try {
    const localOptOut = window.localStorage.getItem('connectIdOptOut');
    const prebidOptOut1 = window.localStorage.getItem('_pbjs_id_optout');
    const prebidOptOut2 = window.localStorage.getItem('_pubcid_optout');
    return localOptOut === '1' || prebidOptOut1 || prebidOptOut2;
  } catch (e) {
    return false;
  }
};

export default {
  getPrivacyData,
  isLocallyOptedOut,
};
