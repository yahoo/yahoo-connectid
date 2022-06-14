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

  let data;
  try {
    data = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || {};
  } catch (e) {
    data = {};
  }

  // if no identifier provided or identifier matches local data
  // return locally stored connectid
  if ((!hashedEmail) ||
    (hashedEmail && hashedEmail === data.hashedEmail)) {
    if (!data.connectid) {
      return {};
    }
    return {
      hashedEmail: data.hashedEmail,
      connectid: data.connectid,
      isStale: !isRecentTimestamp(data.lastUpdated),
    };
  }

  return {};
};

const setConnectId = (data) => {
  const hashedEmail = data ? data.hashedEmail : null;
  const connectid = data ? data.connectid : null;

  if (connectid && (hashedEmail)) {
    const data = {
      connectid,
      hashedEmail,
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
