/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import connectId from '../connectid';
import sync from '../sync';
import sha256 from '../sha256';
import {mockPrivacySignals} from './mockPrivacySignals';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const MOCK_HASH_VALUE = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

const mockGetHashedIdentifier = (id, callback) => {
  callback(id ? MOCK_HASH_VALUE : id);
};

const noop = () => {
};

describe('connectId', () => {
  describe('getIds', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    // opt-out

    it('should clear local cache if connectIdOptOut is set', () => {
      mockPrivacySignals(true);
      const state = {
        he: 'abc',
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('connectIdOptOut', '1');
      connectId.getIds({pixelId: 123, email: 'abc'}, noop);
      expect(window.localStorage.getItem(LOCALSTORAGE_KEY)).toBe(null);
    });

    it('should clear local cache if _pbjs_id_optout is set', () => {
      mockPrivacySignals(true);
      const state = {
        he: 'abc',
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('_pbjs_id_optout', '1');
      connectId.getIds({pixelId: 123, email: 'abc'}, noop);
      expect(window.localStorage.getItem(LOCALSTORAGE_KEY)).toBe(null);
    });

    it('should clear local cache if _pubcid_optout is set', () => {
      mockPrivacySignals(true);
      const state = {
        he: 'abc',
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('_pubcid_optout', '1');
      connectId.getIds({pixelId: 123, email: 'abc'}, noop);
      expect(window.localStorage.getItem(LOCALSTORAGE_KEY)).toBe(null);
    });

    it('should not clear local cache if connectIdOptOut is not 1', () => {
      mockPrivacySignals(false, '1---', false);
      const state = {
        he: 'abc',
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('connectIdOptOut', '2');
      connectId.getIds({pixelId: 123, email: 'abc'}, noop);
      expect(window.localStorage.getItem(LOCALSTORAGE_KEY)).not.toBe(null);
    });

    it('should not initate sync if connectOptOut is 1', done => {
      mockPrivacySignals(true);
      window.localStorage.setItem('connectIdOptOut', '1');
      spyOn(sync, 'syncIds');
      connectId.getIds({pixelId: 123, email: 'abc'}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should sync if connectIdOptOut is not 1', done => {
      mockPrivacySignals(false, '1---', false);
      spyOn(sync, 'syncIds');
      connectId.getIds({pixelId: 123, email: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalled();
        done();
      });
    });

    // callback

    it('should return stored user state', done => {
      mockPrivacySignals(false, '1---', false);
      const he = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const state = {
        he,
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectId.getIds({pixelId: 12345, email: he}, response => {
        expect(response).toEqual({
          connectId: 'abc_connectId',
        });
        done();
      });
    });

    it('should return empty object if no state is available', done => {
      mockPrivacySignals(false, '1---', false);
      connectId.getIds({pixelId: 12345, email: 'abc'}, response => {
        expect(response).toEqual({});
        done();
      });
    });

    it('should return empty object if no state is stored for provided email', done => {
      mockPrivacySignals(false, '1---', false);
      const he = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const state = {
        he,
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectId.getIds({pixelId: 12345, email: 'differentHashedEmail'}, response => {
        expect(response).toEqual({});
        done();
      });
    });

    it('should return stored state for specified email', done => {
      mockPrivacySignals(false, '1---', false);
      const he = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const state = {
        he,
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectId.getIds({pixelId: 12345, email: he}, response => {
        expect(response).toEqual({
          connectId: 'abc_connectId',
        });
        done();
      });
    });

    it('should return stored state for specified puid', done => {
      mockPrivacySignals(false, '1---', false);
      const puid = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const state = {
        puid,
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectId.getIds({pixelId: 12345, puid}, response => {
        expect(response).toEqual({
          connectId: 'abc_connectId',
        });
        done();
      });
    });

    it('should return stored state if cached email exists but none passed in', done => {
      mockPrivacySignals(false, '1---', false);
      const he = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const state = {
        he,
        connectId: 'abc_connectId',
        lastSynced: 1596026151361,
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      connectId.getIds({pixelId: 12345}, response => {
        expect(response).toEqual({
          connectId: 'abc_connectId',
        });
        done();
      });
    });

    // hashing

    it('should hash email if raw email is passed in', done => {
      mockPrivacySignals(false, '1---', false);
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      connectId.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          he: MOCK_HASH_VALUE,
          puid: undefined,
          yahoo1p: undefined,
        });
        done();
      });
    });

    it('should hash puid if raw puid is passed in', done => {
      mockPrivacySignals(false, '1---', false);
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      connectId.getIds({pixelId: 12345, puid: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          he: undefined,
          puid: MOCK_HASH_VALUE,
          yahoo1p: undefined,
        });
        done();
      });
    });

    it('should exclude raw ids if browser does not support crypto', done => {
      const crypto = window.crypto;
      Object.defineProperty(window, 'crypto', {value: null});
      mockPrivacySignals(false, '1---', false);
      spyOn(sync, 'syncIds');
      connectId.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds.calls.first().args[0].he).toBeUndefined();
        done();
      });
      Object.defineProperty(window, 'crypto', {value: crypto});
    });

    // syncing

    it('should sync', done => {
      mockPrivacySignals(false, '1---', false);
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      spyOn(sync, 'syncIds');
      connectId.getIds({pixelId: 12345, email: 'abc'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith(
          {
            pixelId: 12345,
            he: MOCK_HASH_VALUE,
            puid: undefined,
            yahoo1p: undefined,
          },
        );
        done();
      });
    });
  });
});
