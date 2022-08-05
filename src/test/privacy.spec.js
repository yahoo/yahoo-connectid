/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import privacy from "../privacy";
import {MOCK_GDPR_TCSTRING, mockPrivacySignals} from './mockPrivacySignals';

describe('privacy', () => {

  describe('getPrivacyData', () => {
    it('should return values from CMP', done => {
      mockPrivacySignals(false, '1---', true, true);

      privacy.getPrivacyData((privacyData) => {
        expect(privacyData.optOut).toBe(false);
        expect(privacyData.uspString).toBe('1---');
        expect(privacyData.tcString).toBe(MOCK_GDPR_TCSTRING);
        expect(privacyData.gdprApplies).toBe(true);
        done();
      })
    });

    it('should return failure result if CMP call fails', done => {
      mockPrivacySignals();

      privacy.getPrivacyData((privacyData) => {
        expect(privacyData.optOut).toBe(true);
        expect(privacyData.uspString).toBeUndefined();
        expect(privacyData.tcString).toBeUndefined();
        expect(privacyData.gdprApplies).toBeUndefined();
        done();
      })
    });
  });

});