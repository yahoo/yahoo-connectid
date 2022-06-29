/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const LOCALSTORAGE_KEY = 'yahoo-connectid';

const pick = function (obj, props) {
  if (!obj || !props) return {};
  const picked = {};
  props.forEach(prop => {
    picked[prop] = obj[prop];
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

const getConnectId = ({hashedEmail, puid} = {}) => {
  const localData = getLocalData();
  // if no ids provided or any id matches, return connectid
  if ((!hashedEmail && !puid) ||
    hashedEmail && hashedEmail === localData.hashedEmail ||
    puid && puid === localData.puid) {
    return pick(localData, ['connectid']);
  }
  return {};
};

const setConnectId = (data = {}) => {
  const updatedData = {
    ...pick(getLocalData(), ['hashedEmail', 'puid', 'connectid']),
    ...pick(data, ['hashedEmail', 'puid', 'connectid']),
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
