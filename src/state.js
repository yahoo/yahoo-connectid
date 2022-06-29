/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const LOCALSTORAGE_KEY = 'yahoo-connectid';

/**
 * Determines if a specified timestamp is considered recent.
 *
 * @param {string} timestamp
 * @returns {boolean} true if recent, otherwise false
 */
const isRecentTimestamp = timestamp => {
  if (!timestamp) {
    return false;
  }

  const now = new Date();
  const then = new Date(timestamp);
  const syncFrequencyHours = 15 * 24; // 15 days
  const millisecondsInOneHour = 1000 * 60 * 60;
  return (now - then) / millisecondsInOneHour < syncFrequencyHours;
};

const getConnectId = ({hashedEmail, puid} = {}) => {
  let localData;
  try {
    localData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    localData = {};
  }

  // if no identifiers provided or identifiers match local data
  // return locally stored connectid
  if ((!hashedEmail && !puid) ||
    (localData.hashedEmail && !hashedEmail) ||
    (hashedEmail && hashedEmail === localData.hashedEmail) ||
    (localData.puid && !puid) ||
    (puid && puid === localData.puid)) {
    return {
      ...localData.hashedEmail ? {hashedEmail: localData.hashedEmail} : {},
      ...localData.puid ? {puid: localData.puid} : {},
      connectid: localData.connectid,
      isStale: !isRecentTimestamp(localData.lastUpdated),
    };
  }

  return {};
};

const setConnectId = ({hashedEmail, puid, connectid} = {}) => {
  const localData = getConnectId();
  if (hashedEmail || puid) {
    const data = {
      connectid,
      hashedEmail: hashedEmail || localData.hashedEmail,
      puid: puid || localData.puid,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch (e) {
    }
  }
};

const clear = () => {
  localStorage.removeItem('yahoo-connectid');
};

export default {
  getConnectId,
  setConnectId,
  clear,
};
