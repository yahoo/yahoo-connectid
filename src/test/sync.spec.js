/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import api from '../api';
import sync from '../sync';
import state from '../state';
import connectId from '../connectid';
import {MOCK_GDPR_TCSTRING, mockPrivacySignals} from './mockPrivacySignals';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const MOCK_HASH_EMAIL = '7d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c91';
const MOCK_HASH_PUID = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
const MOCK_CONNECTID = 'mock-connectId';

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
    // call api

    it('should call api', () => {
      spyOn(api, 'sendRequest');
      sync.syncIds({pixelId: 12345, he: MOCK_HASH_EMAIL});
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: MOCK_HASH_EMAIL,
        v: 1,
        url: 'http://localhost:9876/context.html',
      }, jasmine.anything());
    });

    it('should not call api if no identifiers available', done => {
      spyOn(api, 'sendRequest');
      connectId.getIds({
        pixelId: 12345,
        yahoo1p: true,
      }, () => {
        expect(api.sendRequest).not.toHaveBeenCalled();
      });
      done();
    });

    it('should not call api if no pixel id provided', done => {
      spyOn(api, 'sendRequest');
      connectId.getIds({
        he: MOCK_HASH_EMAIL,
        yahoo1p: true,
      }, () => {
        expect(api.sendRequest).not.toHaveBeenCalled();
      });
      done();
    });

    it('should not call api if local data is available and not stale', done => {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({
        he: MOCK_HASH_EMAIL,
        connectId: 'abc_connectId',
        expires: Date.now() + 1000,
      }));

      spyOn(api, 'sendRequest');
      connectId.getIds({pixelId: 123, email: MOCK_HASH_EMAIL}, () => {
        expect(api.sendRequest).not.toHaveBeenCalled();
        done();
      });
    });

    it('should pass parameters to api', () => {
      spyOn(api, 'sendRequest');
      sync.syncIds({
        pixelId: 12345,
        he: MOCK_HASH_EMAIL,
        puid: MOCK_HASH_PUID,
        yahoo1p: true,
      });
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: MOCK_HASH_EMAIL,
        puid: MOCK_HASH_PUID,
        '1p': true,
        v: 1,
        url: 'http://localhost:9876/context.html',
      }, jasmine.anything());
    });

    it('should pass privacy signals to api', () => {
      mockPrivacySignals(false, '1---', true, true);
      spyOn(api, 'sendRequest');
      sync.syncIds({
        pixelId: 12345,
        he: MOCK_HASH_EMAIL,
      });
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: MOCK_HASH_EMAIL,
        gdpr: true,
        gdpr_consent: MOCK_GDPR_TCSTRING,
        us_privacy: '1---',
        v: 1,
        url: 'http://localhost:9876/context.html',
      }, jasmine.anything());
    });

    // cache response

    it('should cache connectId for he', () => {
      spyOn(state, 'setLocalData');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectId: MOCK_CONNECTID, ttl: 24});
      });

      sync.syncIds({pixelId: 12345, he: MOCK_HASH_EMAIL});
      expect(state.setLocalData).toHaveBeenCalledWith(
        {
          connectId: MOCK_CONNECTID,
          he: MOCK_HASH_EMAIL,
          ttl: 24,
        },
      );
    });

    it('should cache connectId for puid', () => {
      spyOn(state, 'setLocalData');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectId: MOCK_CONNECTID, ttl: 24});
      });

      sync.syncIds({pixelId: 12345, puid: MOCK_HASH_PUID});
      expect(state.setLocalData).toHaveBeenCalledWith(
        {
          connectId: MOCK_CONNECTID,
          puid: MOCK_HASH_PUID,
          ttl: 24,
        },
      );
    });

    it('should cache connectId for he and puid', () => {
      spyOn(state, 'setLocalData');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectId: MOCK_CONNECTID, ttl: 24});
      });

      sync.syncIds({pixelId: 12345, he: MOCK_HASH_EMAIL, puid: MOCK_HASH_PUID});
      expect(state.setLocalData).toHaveBeenCalledWith(
        {
          connectId: MOCK_CONNECTID,
          he: MOCK_HASH_EMAIL,
          puid: MOCK_HASH_PUID,
          ttl: 24,
        },
      );
    });

    it('should update cache even when no connectId provided', () => {
      spyOn(state, 'setLocalData');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({});
      });

      sync.syncIds({pixelId: 12345, he: MOCK_HASH_EMAIL});
      expect(state.setLocalData).toHaveBeenCalledWith(
        {
          he: MOCK_HASH_EMAIL,
          connectId: undefined,
          ttl: undefined,
        },
      );
    });
  });
});
