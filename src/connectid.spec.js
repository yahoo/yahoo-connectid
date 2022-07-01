/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import connectid from './connectid';
import sync from './sync';
import api from './api';
import sha256 from './sha256';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const MOCK_HASH_VALUE = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

const mockGetHashedIdentifier = (id, callback) => {
  callback(id ? MOCK_HASH_VALUE : id);
};

describe('connectid', () => {
  describe('getIds', () => {

    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    // opt-out

    it('should clear local cache if connectIdOptOut is 1', () => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "expires": 1596026151361
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('connectIdOptOut', '1');
      connectid.getIds({pixelId: 123, email: 'abc'}, () => {});
      expect(window.localStorage.getItem('yahoo-connectid')).toBe(null);
    });

    it('should not clear local cache if connectIdOptOut is not 1', () => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "expires": 1596026151361
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('connectIdOptOut', '2');
      connectid.getIds({pixelId: 123, email: 'abc'}, () => {});
      expect(window.localStorage.getItem('yahoo-connectid')).not.toBe(null);
    });

    it('should not initate sync if connectOptOut is 1', done => {
      window.localStorage.setItem('connectIdOptOut', '1');
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 123, email: 'abc'}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should sync if connectIdOptOut is not 1', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 123, email: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalled();
        done();
      });
    });

    // callback

    it('should return stored user state', done => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "expires": 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectid.getIds({pixelId: 12345, email: 'abc'}, response => {
        expect(response).toEqual({
          connectid: 'abc_connectid'
        });
        done();
      });
    });

    it('should return empty object if no state is available', done => {
      connectid.getIds({pixelId: 12345, email: 'abc'}, response => {
        expect(response).toEqual({});
        done();
      });
    });

    // hashing

    it('should hash email if raw email is passed in', done => {
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          hashedEmail: MOCK_HASH_VALUE,
          hashedPuid: undefined,
        });
        done();
      });
    });

    it('should hash puid if raw puid is passed in', done => {
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      connectid.getIds({pixelId: 12345, puid: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          hashedEmail: undefined,
          hashedPuid: MOCK_HASH_VALUE,
        });
        done();
      });
    });

    it('should fail gracefully when hashing if browser does not support crypto', done => {
      spyOn(api, 'sendRequest');
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(api.sendRequest).not.toHaveBeenCalled();
        done();
      });
    });

    // syncing

    it('should sync', done => {
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345, email: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith(
          {
            pixelId: 12345,
            hashedEmail: MOCK_HASH_VALUE,
            hashedPuid: undefined,
          }
        );
        done();
      });
    });

  });
});