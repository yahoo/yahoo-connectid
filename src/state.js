/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const LOCALSTORAGE_KEY = 'yahoo-connectid';

const pick = function (obj, props) {
  if (!obj || !props) return {};
  const picked = {};
  props.forEach(prop => {
    if (obj[prop] !== undefined) {
      picked[prop] = obj[prop];
    }
  });
  return picked;
};

const getLocalData = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};

const getConnectId = ({hashedEmail, hashedPuid} = {}) => {
  const localData = getLocalData();
  // if no ids provided or any id matches, return connectid
  if ((!hashedEmail && !hashedPuid) ||
    !hashedEmail && !!localData.hashedEmail ||
    hashedEmail && hashedEmail === localData.hashedEmail ||
    !hashedPuid && !!localData.hashedPuid ||
    hashedPuid && hashedPuid === localData.hashedPuid) {
    return pick(localData, ['connectid']);
  }
  return {};
};

const setConnectId = (data = {}) => {
  const updatedData = {
    ...pick(getLocalData(), ['hashedEmail', 'hashedPuid', 'connectid']),
    ...pick(data, ['hashedEmail', 'hashedPuid', 'connectid']),
    lastUpdated: new Date().toISOString(),
  }
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedData));
  } catch (e) {
  }
};

const clear = () => {
  localStorage.removeItem('yahoo-connectid');
};

export default {
  getLocalData,
  getConnectId,
  setConnectId,
  clear,
};
