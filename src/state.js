/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const LOCALSTORAGE_KEY = 'yahoo-connectid';

const getLocalData = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};

const setLocalData = (data = {}) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
};

const clearLocalData = () => {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

export default {
  getLocalData,
  setLocalData,
  clearLocalData,
};
