export const MOCK_GDPR_TCSTRING = 'mock_tcstring';

export const mockPrivacySignals = (localOptout, gpp, gppSid, gdprApplies, uspString, purpose1) => {
  window.localStorage.removeItem('connectIdOptOut');
  delete window.__tcfapi;
  delete window.__uspapi;
  delete window.__gpp;

  if (localOptout !== undefined) {
    window.localStorage.setItem('connectIdOptOut', localOptout ? '1' : '0');
  }

  if (gpp || gppSid) {
    window.__gpp = (command, callback) => {
      const response = {
        pingData: {
          cmpStatus: 'loaded',
          signalStatus: 'ready',
          gppString: gpp,
          applicableSections: gppSid,
        },
      };
      callback(response, true);
    };
  }

  if (uspString) {
    window.__uspapi = (command, version, callback) => {
      callback({uspString}, true);
    };
  }

  if (gdprApplies !== undefined) {
    window.__tcfapi = (command, version, callback) => {
      const response = {
        eventStatus: 'tcloaded',
        gdprApplies,
      };
      if (gdprApplies) {
        response.tcString = MOCK_GDPR_TCSTRING;
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
