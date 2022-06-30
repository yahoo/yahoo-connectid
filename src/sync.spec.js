/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import api from './api';
import sync from './sync';
import state from './state';

const LOCALSTORAGE_KEY = 'yahoo-connectid';

describe('sync', () => {
  const now = new Date();
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime());
    localStorage.clear();
  });

  afterEach(() => {
    clock.restore();
    localStorage.clear();
  });

  describe('syncIds', () => {
    it('should sync connectid', () => {
      spyOn(api, 'sendRequest');
      sync.syncIds({pixelId: 12345, hashedEmail: 'abc'});
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: 'abc'
      }, jasmine.anything());
    });

    it('should store connectid for hashedEmail in state', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectid: 'fake_connectid'});
      });

      sync.syncIds({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setConnectId).toHaveBeenCalledWith(
        {
          connectid: 'fake_connectid',
          hashedEmail: 'abc',
        }
      );
    });

    it('should store connectid for hashedPuid in state', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectid: 'fake_connectid'});
      });

      sync.syncIds({pixelId: 12345, hashedPuid: 'puid'});
      expect(state.setConnectId).toHaveBeenCalledWith(
        {
          connectid: 'fake_connectid',
          hashedPuid: 'puid',
        }
      );
    });

    it('should store connectid for hashedEmail and hashedPuid in state', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectid: 'fake_connectid'});
      });

      sync.syncIds({pixelId: 12345, hashedEmail: 'abc', hashedPuid: 'puid'});
      expect(state.setConnectId).toHaveBeenCalledWith(
        {
          connectid: 'fake_connectid',
          hashedEmail: 'abc',
          hashedPuid: 'puid',
        }
      );
    });

    it('should not update state if no connectid provided', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback();
      });

      sync.syncIds({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setConnectId).not.toHaveBeenCalled();
    });

    it('should sync connectid for puid', () => {
      spyOn(api, 'sendRequest');
      sync.syncIds({pixelId: 12345, hashedPuid: 'abc'});
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        puid: 'abc'
      }, jasmine.anything());
    });

    it('should sync connectid with privacy flags', () => {
      spyOn(api, 'sendRequest');
      sync.syncIds({
        pixelId: 12345,
        hashedPuid: 'abc',
        gdpr: 1,
        gdprConsent: 'consent',
        usPrivacy: '1---',
        yahoo1p: true
      });
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        puid: 'abc',
        gdpr: 1,
        gdpr_consent: 'consent',
        us_privacy: '1---',
        '1p': true,
      }, jasmine.anything());
    });
  });
});