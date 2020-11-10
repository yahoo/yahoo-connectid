/* Copyright Verizon Media, Licensed under the terms of the MIT license. See LICENSE file in project root for terms. */

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
    it('should sync connectId', () => {
      spyOn(api, 'sendRequest');
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(api.sendRequest).toHaveBeenCalledWith('https://ups.analytics.yahoo.com/ups/12345/fed', {
        he: 'abc'
      }, jasmine.anything());
    });

    it('should not sync connectId if already synced recently', () => {
      const mockState = {
        abc: {
          connectId: {
            value: 'abc_connectId',
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

    it('should sync connectId if already synced, but not recently', () => {
      const mockState = {
        abc: {
          connectId: {
            value: 'abc_connectId',
            lastUpdated: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
      };
      localStorage.setItem('vm-connectid', JSON.stringify(mockState));

      spyOn(api, 'sendRequest');
      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(api.sendRequest).toHaveBeenCalled();
    });

    it('should store connectId in state', () => {
      spyOn(state, 'setUserState');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({vmuid: 'fake_connectId'});
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setUserState).toHaveBeenCalledWith(
        'abc',
        {
          connectId: {
            value: 'fake_connectId',
            lastUpdated: now.toISOString()
          }
        }
      );
    });

    it('should not update state if no connectId provided', () => {
      spyOn(state, 'setUserState');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback();
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setUserState).not.toHaveBeenCalled();
    });
  });
});