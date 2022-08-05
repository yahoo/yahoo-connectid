export const MOCK_GDPR_TCSTRING = 'mock_tcstring';

export const mockPrivacySignals = (localOptout, uspString, gdprApplies, purpose1) => {
  window.localStorage.removeItem('connectIdOptOut');
  delete window.__tcfapi;
  delete window.__uspapi;

  if (localOptout !== undefined) {
    window.localStorage.setItem('connectIdOptOut', localOptout ? '1' : '0');
  }

  if (uspString) {
    window.__uspapi = (command, version, callback) => {
      callback({uspString}, true);
    };
  }

  if (gdprApplies !== undefined) {
    window.__tcfapi = (command, version, callback) => {
      let response = {
        eventStatus: 'tcloaded',
        gdprApplies,
      };
      if (gdprApplies) {
        response.tcString = MOCK_GDPR_TCSTRING;
        response.purpose = {
          consents: {
            '1': purpose1,
          },
        };
      }
      callback(response, true);
    };
  }
};
