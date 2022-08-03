/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import privacy from "./privacy";

describe('privacy', () => {

  describe('getPrivacyData', () => {
    it('should return values from CMP', done => {
      window.__tcfapi = (command, version, callback) => {
        callback({
          eventStatus: 'tcloaded',
          gdprApplies: true,
          tcString: 'def'
        }, true);
      };
      window.__uspapi = (command, version, callback) => {
        callback({
          uspString: '1---'
        }, true);
      };

      privacy.getPrivacyData((privacyData, success) => {
        expect(privacyData.uspString).toBe('1---');
        expect(privacyData.tcString).toBe('def');
        expect(privacyData.gdprApplies).toBe(true);
        expect(success).toBe(true);
        delete window.__tcfapi;
        delete window.__uspapi;
        done();
      })
    });

    it('should return failure result if CMP call fails', done => {
      window.__tcfapi = (command, version, callback) => {
        callback({cmpStatus: 'error'}, false);
      };
      window.__uspapi = (command, version, callback) => {
        callback({}, false);
      };
      privacy.getPrivacyData((privacyData, success) => {
        expect(privacyData.uspString).toBeUndefined();
        expect(privacyData.tcString).toBeUndefined();
        expect(privacyData.gdprApplies).toBeUndefined();
        expect(success).toBe(false);
        delete window.__tcfapi;
        delete window.__uspapi;
        done();
      })
    });
  });

});