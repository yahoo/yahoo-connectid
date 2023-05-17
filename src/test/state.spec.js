/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import state from '../state';

const LOCALSTORAGE_KEY = 'yahoo-connectid';
const MOCK_HASH_EMAIL = '7d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c91';
const MOCK_HASH_PUID = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
const MOCK_HASH_PUID_ALT = '9d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c93';
const MOCK_CONNECTID = 'mock-connectid';

describe('state', () => {
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

  describe('getConnectId', () => {
    it('should return empty object if no state is stored', () => {
      expect(state.getConnectId(undefined)).toEqual({});
    });

    it('should return empty object if no state is stored for provided email', () => {
      expect(state.getConnectId({hashedEmail: MOCK_HASH_EMAIL})).toEqual({});
    });

    it('should return stored state for specified email', () => {
      const mockState = {
        hashedEmail: MOCK_HASH_EMAIL,
        connectid: MOCK_CONNECTID,
      };

      const expectedResult = {
        connectid: MOCK_CONNECTID,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId({hashedEmail: MOCK_HASH_EMAIL})).toEqual(expectedResult);
    });

    it('should return stored state for specified puid', () => {
      const mockState = {
        hashedPuid: MOCK_HASH_PUID,
        connectid: MOCK_CONNECTID,
      };

      const expectedResult = {
        connectid: MOCK_CONNECTID,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId({hashedPuid: MOCK_HASH_PUID})).toEqual(expectedResult);
    });

    it('should return stored state if cached email exists but none passed in', () => {
      const mockState = {
        hashedEmail: MOCK_HASH_EMAIL,
        hashedPuid: MOCK_HASH_PUID,
        connectid: MOCK_CONNECTID,
      };

      const expectedResult = {
        connectid: MOCK_CONNECTID,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId({hashedPuid: MOCK_HASH_PUID_ALT})).toEqual(expectedResult);
    });
  });

  describe('setLocalData', () => {
    it('should store state for specified user', () => {
      const mockState = {
        connectid: 'def_connectid',
        hashedEmail: 'def',
      };

      const expectedStoredValue = {
        hashedEmail: 'def',
        connectid: 'def_connectid',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      };

      state.setLocalData(mockState);
      expect(localStorage.getItem(LOCALSTORAGE_KEY)).toEqual(JSON.stringify(expectedStoredValue));
    });

    it('should not throw an exception if invalid state is provided', () => {
      expect(() => {
        state.setLocalData({hashedEmail: 'abc', connectid: null});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({hashedEmail: 'abc', connectid: 123});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({hashedEmail: 'abc', connectid: true});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({hashedEmail: 'abc', connectid: undefined});
      }).not.toThrow();
      expect(() => {
        state.setLocalData({});
      }).not.toThrow();
    });
  });
});
