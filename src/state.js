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

const getConnectId = (ids) => {
  const hashedEmail = (ids || {}).hashedEmail;
  const puid = (ids || {}).puid;

  let data;
  try {
    data = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    data = {};
  }

  // if no identifiers provided or identifiers match local data
  // return locally stored connectid
  if ((!hashedEmail && !puid) ||
    (hashedEmail && hashedEmail === data.hashedEmail) ||
    (puid && puid === data.puid)) {
    if (!data.connectid) {
      return {};
    }
    return {
      ...data.hashedEmail ? {hashedEmail: data.hashedEmail} : {},
      ...data.puid ? {puid: data.puid} : {},
      connectid: data.connectid,
      isStale: !isRecentTimestamp(data.lastUpdated),
    };
  }

  return {};
};

const setConnectId = (data) => {
  const hashedEmail = data ? data.hashedEmail : null;
  const puid = data ? data.puid : null;
  const connectid = data ? data.connectid : null;

  if (connectid && (hashedEmail || puid)) {
    const data = {
      connectid,
      hashedEmail,
      puid,
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
