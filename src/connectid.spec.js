/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import connectid from './connectid';
import sync from './sync';
import sha256 from './sha256';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const mockHashedIdentifier = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

const mockGetHashedIdentifier = (id, callback) => {
  callback(id ? mockHashedIdentifier : '');
};

describe('connectid', () => {
  describe('getIds', () => {

    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should return stored user state', done => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "lastUpdated": "2020-07-29T12:35:51.361Z"
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

    it('should initiate sync when email provided', done => {
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345, email: 'abc'}, done);
      expect(sync.syncIds).toHaveBeenCalledWith(
        {
          pixelId: 12345,
          hashedEmail: mockHashedIdentifier,
        }
      );
    });

    it('should initiate sync when email and privacy flags are set', done => {
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      spyOn(sync, 'syncIds');
      connectid.getIds({
        pixelId: 12345,
        email: 'abc',
        gdpr: true,
        gdprConsent: 'C012345',
        usPrivacy: '1---',
        yahoo1p: true
      }, done);
      expect(sync.syncIds).toHaveBeenCalledWith(
        {
          pixelId: 12345,
          hashedEmail: mockHashedIdentifier,
          gdpr: true,
          gdprConsent: 'C012345',
          usPrivacy: '1---',
          yahoo1p: true
        }
      );
    });

    it('should not initiate sync if no email available', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({
        pixelId: 12345,
        gdpr: true,
        gdprConsent: 'C012345',
        usPrivacy: '1---',
        yahoo1p: true
      }, done);
      expect(sync.syncIds).not.toHaveBeenCalled();
    });

    it('should hash email if raw email is passed in', done => {
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'getHashedIdentifier').and.callFake(mockGetHashedIdentifier);
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          hashedEmail: mockHashedIdentifier,
        });
        done();
      });
    });

    it('should fail gracefully when hashing if browser does not support crypto', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not initate sync if no email is passed in', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not initate sync if no pixelId is passed in', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({email: 'abc'}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not initate sync if local data is available and not stale', done => {
      const state = {
        "hashedEmail": mockHashedIdentifier,
        "connectid": "abc_connectid",
        "lastUpdated": new Date(),
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));

      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 123, email: mockHashedIdentifier}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });

    it('should clear local cache if connectIdOptOut is set to 1', () => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "lastUpdated": "2020-07-29T12:35:51.361Z"
      };
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
      window.localStorage.setItem('connectIdOptOut', '1');
      connectid.getIds({pixelId: 123, email: 'abc'}, () => {});
      expect(window.localStorage.getItem('yahoo-connectid')).toBe(null);
    });

    it('should not clear local cache if connectIdOptOut is not set to 2', () => {
      const state = {
        "hashedEmail": "abc",
        "connectid": "abc_connectid",
        "lastUpdated": "2020-07-29T12:35:51.361Z"
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
  });
});