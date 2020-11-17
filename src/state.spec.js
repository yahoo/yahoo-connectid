/* Copyright Verizon Media, Licensed under the terms of the MIT license. See LICENSE file in project root for terms. */

import state from './state';

describe('state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getUserState', () => {
    it('should return default object if no state is stored for specified user', () => {
      expect(state.getUserState(undefined)).toEqual({});
      expect(state.getUserState('abc')).toEqual({});
    });

    it('should return stored state for specified user', () => {
      const mockState = {
        abc: {
          connectid: 'abc_connectid'
        },
      };
      localStorage.setItem('vm-connectid', JSON.stringify(mockState));
      expect(state.getUserState('abc')).toEqual(mockState.abc);
    });
  });

  describe('setUserState', () => {
    it ('should store state for specified user', () => {
      const mockState = {
        abc: {foo: 'bar'},
      };

      state.setUserState('abc', mockState.abc);
      expect(localStorage.getItem('vm-connectid')).toEqual(JSON.stringify(mockState));
    });

    it ('should not throw an exception if invalid state is provided', () => {
      expect(() => {state.setUserState('abc', null);}).not.toThrow();
      expect(() => {state.setUserState('abc', 123);}).not.toThrow();
      expect(() => {state.setUserState('abc', true);}).not.toThrow();
      expect(() => {state.setUserState('abc', undefined);}).not.toThrow();
      expect(() => {state.setUserState('abc', 'def');}).not.toThrow();
    });
  });
});