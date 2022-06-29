/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from "./state";
import api from './api';

const sync = {};

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

const shouldSync = ({pixelId, hashedEmail, hashedPuid}) => {
  // pixelId is required
  if (!pixelId) {
    return false;
  }

  const {
    hashedEmail: cachedHashedEmail,
    hashedPuid: cachedHashedPuid,
    lastUpdated,
  } = state.getLocalData();

  const hashedEmailExists = hashedEmail || cachedHashedEmail;
  const hashedPuidExists = hashedPuid || cachedHashedPuid;
  const hashedEmailChanged = hashedEmail && hashedEmail !== cachedHashedEmail;
  const hashedPuidChanged = hashedPuid && hashedPuid !== cachedHashedPuid;
  const connectidIsStale = !isRecentTimestamp(lastUpdated);
  return (hashedEmailExists || hashedPuidExists) &&
    (hashedEmailChanged || hashedPuidChanged || connectidIsStale);
};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} hashedEmail - (optional) hashed email.  hashedEmail or hashedPuid must be provided
 * @param {string} hashedPuid - (optional) publisher user identifier. hashedEmail or hashedPuid must be provided
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Required if GDPR applies.
 * @param {string?} usPrivacy - (optional)
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncIds = ({
  pixelId,
  hashedEmail,
  hashedPuid,
  gdpr,
  gdprConsent,
  usPrivacy,
  yahoo1p,
}) => {
  if (!shouldSync({pixelId, hashedEmail, hashedPuid})) {
    return;
  }

  const localData = state.getLocalData();
  const latestHashedEmail = hashedEmail || localData.hashedEmail;
  const latestHashedPuid = hashedPuid || localData.hashedPuid;

  // call UPS to get connectid
  const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
  const data = {
    ...latestHashedEmail ? {he: latestHashedEmail} : {},
    ...latestHashedPuid ? {puid: latestHashedPuid} : {},
    ...gdpr !== undefined ? {gdpr} : {},
    ...gdprConsent !== undefined ? {gdpr_consent: gdprConsent} : {},
    ...usPrivacy !== undefined ? {us_privacy: usPrivacy} : {},
    ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
  };

  api.sendRequest(url, data, response => {
    if (response) {
      state.setConnectId({
        ...latestHashedEmail ? {hashedEmail: latestHashedEmail} : {},
        ...latestHashedPuid ? {hashedPuid: latestHashedPuid} : {},
        connectid: response.connectid,
      });
    }
  });
};

export default sync;