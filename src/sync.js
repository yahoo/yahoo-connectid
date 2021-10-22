/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from "./state";
import api from './api';

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

const sync = {};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} hashedEmail - (required) hashed email
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Required if GDPR applies.
 * @param {string?} usPrivacy - (optional)
 * @param {boolean} vm1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncHashedEmail = ({
  pixelId,
  hashedEmail,
  gdpr,
  gdprConsent,
  usPrivacy,
  vm1p,
}) => {
  if (!pixelId || !hashedEmail) {
    // pixelId and hashedEmail are required
    return;
  }

  const userState = state.getUserState(hashedEmail);
  if (userState.connectid) {
    const wasSyncedRecently = isRecentTimestamp(userState.connectid.lastUpdated);
    if (wasSyncedRecently) {
      // don't sync if hashedEmail was already synced recently
      return;
    }
  }

  // call UPS to get connectid
  const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
  const data = {
    he: hashedEmail,
    ...gdpr !== undefined ? {gdpr} : {},
    ...gdprConsent !== undefined ? {gdpr_consent: gdprConsent} : {},
    ...usPrivacy !== undefined ? {us_privacy: usPrivacy} : {},
    ...vm1p !== undefined ? {'1p': vm1p} : {},
  };

  api.sendRequest(url, data, response => {
    if (response) {
      // store connectid in local state
      state.setUserState(hashedEmail, {
        ...userState,
        connectid: {
          value: response.vmuid || response.connectid,
          lastUpdated: new Date().toISOString(),
        },
      });
    }
  });
};

/**
 * Currently, only ConnectID is supported.  Therefore, this function just calls syncHashedEmail.  Once more IDs
 * become supported, this function should be updated to call multiple sync functions.
 *
 * @param {object} params - (required) Should include hashedEmail, gdpr, and gdprConsent properties
 */
sync.syncIds = (params) => {
  if (params.hashedEmail) {
    sync.syncHashedEmail(params);
  }
};

export default sync;