/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const LOCALSTORAGE_KEY = 'vm-connectid';

/**
 * Read state from Local Storage
 *
 * @returns {Object}
 */
const getState = () => {
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
  }

  return state;
};

/**
 * Write state to Local Storage
 *
 * @param {Object} state
 */
const setState = state => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch (e) {
  }
};

/**
 * Read state for a specified user based on their hashed email
 *
 * @param {string} hashedEmail
 * @returns {{connectid: *}}
 */
const getUserState = hashedEmail => {
  return {
    ...getState()[hashedEmail] || {}
  };
};

/**
 * Write state for a specified user based on their hashed email
 *
 * @param {string} hashedEmail
 * @param {Object} userState
 */
const setUserState = (hashedEmail, userState) => {
  const state = {
    ...getState(),
    [hashedEmail]: userState,
  };

  setState(state);
};

/**
 * Provides most recently provided hashed email
 *
 * @returns {?string}
 */
const getMostRecentHashedEmail = () => {
  return getState().mostRecentHashedEmail;
};

/**
 * Stores most recently provided hashed email
 *
 * @param {string} hashedEmail
 */
const setMostRecentHashedEmail = hashedEmail => {
  const state = {
    ...getState(),
    mostRecentHashedEmail: hashedEmail,
  };

  setState(state);
};

export default {
  getUserState,
  setUserState,
  getMostRecentHashedEmail,
  setMostRecentHashedEmail,
};
