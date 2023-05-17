/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const DEFAULT_TTL = 24; // 24 HOURS
const LOCALSTORAGE_KEY = 'yahoo-connectid';

const pick = (obj, props) => {
  if (!obj || !props) return {};
  const picked = {};
  props.forEach(prop => {
    if (obj[prop] !== undefined) {
      picked[prop] = obj[prop];
    }
  });
  return picked;
};

const computeExpiration = (hours = DEFAULT_TTL) => {
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  return expires;
};

const getLocalData = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
};

const getConnectId = ({he, puid} = {}) => {
  const localData = getLocalData();
  // if no ids provided or any id matches, return connectId
  if (
    (!he && !puid)
    || (!he && !!localData.he)
    || (he && he === localData.he)
    || (!puid && !!localData.puid)
    || (puid && puid === localData.puid)
  ) {
    return pick(localData, ['connectId']);
  }
  return {};
};

const setLocalData = (data = {}) => {
  const expires = computeExpiration(data.ttl).getTime();
  const updatedData = {
    ...pick(getLocalData(), ['he', 'puid']),
    ...pick(data, ['he', 'puid', 'connectId']),
    expires,
  };
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedData));
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
  getConnectId,
};
