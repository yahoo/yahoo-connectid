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

    it('should store connectid (returned as connectid) in state', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback({connectid: 'fake_connectid'});
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setConnectId).toHaveBeenCalledWith(
        {
          connectid: 'fake_connectid',
          hashedEmail: 'abc',
        }
      );
    });

    it('should not update state if no connectid provided', () => {
      spyOn(state, 'setConnectId');
      spyOn(api, 'sendRequest').and.callFake((apiUrl, data, callback) => {
        callback();
      });

      sync.syncHashedEmail({pixelId: 12345, hashedEmail: 'abc'});
      expect(state.setConnectId).not.toHaveBeenCalled();
    });
  });
});