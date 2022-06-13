/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from './state';
import sinon from "sinon";

const LOCALSTORAGE_KEY = 'yahoo-connectid';

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
      expect(state.getConnectId('abc')).toEqual({});
    });

    it('should return stored state for specified user', () => {
      const mockState = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
      };

      const expectedResult = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
        isStale: true,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId('abc')).toEqual(expectedResult);
    });

    it('should return true for isStale if not updated recently', () => {
      const mockState = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
        lastUpdated: new Date('January 1, 2022 03:24:00'),
      };

      const expectedResponse = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
        isStale: true,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId('abc')).toEqual(expectedResponse);
    });

    it('should return false for isStale if updated recently', () => {
      const mockState = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
        lastUpdated: new Date(),
      };

      const expectedResponse = {
        hashedEmail: 'abc',
        connectid: 'abc_connectid',
        isStale: false,
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mockState));
      expect(state.getConnectId('abc')).toEqual(expectedResponse);
    });
  });

  describe('setConnectId', () => {
    it('should store state for specified user', () => {
      const mockState = {
        connectid: 'def_connectid',
        hashedEmail: 'def',
      };

      const expectedStoredValue = {
        connectid: 'def_connectid',
        hashedEmail: 'def',
        lastUpdated: new Date(),
      };

      state.setConnectId(mockState);
      expect(localStorage.getItem(LOCALSTORAGE_KEY)).toEqual(JSON.stringify(expectedStoredValue));
    });

    it('should not throw an exception if invalid state is provided', () => {
      expect(() => {
        state.setConnectId(null);
      }).not.toThrow();
      expect(() => {
        state.setConnectId(123);
      }).not.toThrow();
      expect(() => {
        state.setConnectId(true);
      }).not.toThrow();
      expect(() => {
        state.setConnectId(undefined);
      }).not.toThrow();
      expect(() => {
        state.setConnectId('def');
      }).not.toThrow();
    });
  });
});