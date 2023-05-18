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
  });

  afterEach(() => {
    clock.restore();
    localStorage.clear();
  });

  describe('setLocalData', () => {
    it('should store state for specified user', () => {
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
