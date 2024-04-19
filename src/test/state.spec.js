/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import state from '../state';

const LOCALSTORAGE_KEY = 'connectId';

describe('state', () => {
  const now = new Date();
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime());
    localStorage.clear();
    document.cookie = 'abc=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'connectId=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  afterEach(() => {
    clock.restore();
    localStorage.clear();
  });

  describe('getCookie', () => {
    it('should return value of specified cookie', () => {
      document.cookie = 'abc=123';
      expect(state.getCookie('abc')).toBe('123');
    });

    it('should return empty string if specified cookie does not exist', () => {
      expect(state.getCookie('def')).toBe('');
    });
  });

  describe('getLocalData', () => {
    it('should return local data', () => {
      document.cookie = `connectId=${JSON.stringify({abc: 234})}`;
      expect(state.getLocalData()).toEqual({abc: 234});
    });
  });

  describe('setLocalData', () => {
    it('should store state for specified user in local storage', () => {
      const mockState = {
        connectId: 'def_connectId',
        he: 'def',
      };

      const expectedStoredValue = {
        he: 'def',
        connectId: 'def_connectId',
      };

      state.setLocalData(mockState);
      expect(JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY))).toEqual(expectedStoredValue);
    });

    it('should store state for specified user in cookie', () => {
      const mockState = {
        connectId: 'def_connectId',
        he: 'def',
      };
      const expectedStoredValue = {
        he: 'def',
        connectId: 'def_connectId',
      };
      const cookieSpy = spyOnProperty(document, 'cookie', 'set');
      spyOn(document, 'cookie')
      state.setLocalData(mockState);
      const expectedValue = 'connectId={"connectId":"def_connectId","he":"def"};Max-Age=31536000;Domain=aol.com;path=/;Secure;SameSite=None';
      expect(cookieSpy).toHaveBeenCalledWith(expectedValue);
    });

    it('should not throw an exception if invalid state is provided', () => {
      expect(() => {
        state.setLocalData({he: 'abc', connectId: null});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({he: 'abc', connectId: 123});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({he: 'abc', connectId: true});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({he: 'abc', connectId: undefined});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({});
      }).not.toThrow();
    });
  });
});
