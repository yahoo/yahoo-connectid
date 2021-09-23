/* Copyright Verizon Media, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import connectid from './connectid';
import sync from './sync';
import sha256 from './sha256';

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
        "abc": {
          "connectid": {
            "value": "abc_connectid",
            "lastUpdated": "2020-07-29T12:35:51.361Z"
          }
        }
      };
      localStorage.setItem('vm-connectid', JSON.stringify(state));

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

    it('should initiate sync', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345, email: 'abc'}, done);
      expect(sync.syncIds).toHaveBeenCalledWith(
        {
          pixelId: 12345,
          hashedEmail: 'abc',
        }
      );
    });

    it('should initiate sync', done => {
      spyOn(sync, 'syncIds');
      connectid.getIds({pixelId: 12345, email: 'abc', gdpr: true, gdprConsent: 'C012345', usPrivacy: '1---', vm1p: true}, done);
      expect(sync.syncIds).toHaveBeenCalledWith(
        {
          pixelId: 12345,
          hashedEmail: 'abc',
          gdpr: true,
          gdprConsent: 'C012345',
          usPrivacy: '1---',
          vm1p: true
        }
      );
    });

    it('should hash email if raw email is passed in', done => {
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'computeHash').and.callFake((str, callback) => {
        callback('fake_hashed_email');
      });
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345,
          hashedEmail: 'fake_hashed_email',
        });
        done();
      });
    });

    it('should fail gracefully when hashing if browser does not support crypto', done => {
      spyOn(sync, 'syncIds');
      spyOn(sha256, 'computeHash').and.callFake((str, callback) => {
        callback('');
      });
      connectid.getIds({pixelId: 12345, email: 'abc@foo.com'}, () => {
        expect(sync.syncIds).toHaveBeenCalledWith({
          pixelId: 12345
        });
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
      connectid.getIds({enail: 'abc'}, () => {
        expect(sync.syncIds).not.toHaveBeenCalled();
        done();
      });
    });
  });
});