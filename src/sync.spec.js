/* Copyright Verizon Media, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import api from './api';
import sync from './sync';
import state from './state';

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
    it('should trigger id sync logic', () => {
      spyOn(sync, 'syncHashedEmail');
      sync.syncIds({pixelId: 12345, hashedEmail: 'abc'});
      expect(sync.syncHashedEmail).toHaveBeenCalledWith({pixelId: 12345, hashedEmail: 'abc'});
    });
  });

  describe('syncHashedEmail', () => {
    it('should sync connectid', () => {
      spyOn(api, 'sendRequest');
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: 'abc'
      }, jasmine.anything());
    });

    it('should not sync connectid if already synced recently', () => {
      const mockState = {
        abc: {
          connectid: {
            value: 'abc_connectid',
            lastUpdated: new Date(now.getTime() - 71 * 60 * 60 * 1000).toISOString()
          }
        },
      };
      localStorage.setItem('vm-connectid', JSON.stringify(mockState));

      spyOn(api, 'sendRequest');
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: ''});
      expect(api.sendRequest).not.toHaveBeenCalled();
    });

    it('should sync connectid if already synced, but not recently', () => {
      const mockState = {
        abc: {
          connectid: {
            value: 'abc_connectid',
            lastUpdated: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
      };
      localStorage.setItem('vm-connectid', JSON.stringify(mockState));

      spyOn(api, 'sendRequest');
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(api.sendRequest).toHaveBeenCalled();
    });

    it('should store connectid (returned as connectid) in state', () => {
      spyOn(state, 'setUserState');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectid: 'fake_connectid'});
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setUserState).toHaveBeenCalledWith(
        'abc',
        {
          connectid: {
            value: 'fake_connectid',
            lastUpdated: now.toISOString()
          }
        }
      );
    });

    it('should store connectid (returned as vmuid) in state', () => {
      spyOn(state, 'setUserState');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({vmuid: 'fake_connectid'});
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setUserState).toHaveBeenCalledWith(
        'abc',
        {
          connectid: {
            value: 'fake_connectid',
            lastUpdated: now.toISOString()
          }
        }
      );
    });

    it('should not update state if no connectid provided', () => {
      spyOn(state, 'setUserState');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback();
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setUserState).not.toHaveBeenCalled();
    });
  });
});