/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from './state';
import api from './api';
import privacy from './privacy';

/**
 * Determines if a specified timestamp is stale (in the past).
 *
 * @param {string} ts timestamp
 * @returns {boolean} true if stale, otherwise false
 */
const isStale = ts => (!ts || new Date(ts).getTime() < Date.now());

const shouldSync = ({pixelId, hashedEmail, hashedPuid}) => {
  // pixelId is required
  if (!pixelId) {
    return false;
  }

  const {
    hashedEmail: cachedHashedEmail,
    hashedPuid: cachedHashedPuid,
    expires,
  } = state.getLocalData();

  const hashedEmailExists = hashedEmail || cachedHashedEmail;
  const hashedPuidExists = hashedPuid || cachedHashedPuid;
  const hashedEmailChanged = hashedEmail && hashedEmail !== cachedHashedEmail;
  const hashedPuidChanged = hashedPuid && hashedPuid !== cachedHashedPuid;
  return (hashedEmailExists || hashedPuidExists)
    && (hashedEmailChanged || hashedPuidChanged || isStale(expires));
};

const sync = {};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} hashedEmail - (optional) hashed email.  hashedEmail or hashedPuid must be provided
 * @param {string} hashedPuid - (optional) publisher user identifier. hashedEmail or hashedPuid must be provided
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncIds = ({
  pixelId,
  hashedEmail,
  hashedPuid,
  yahoo1p,
}) => {
  if (!shouldSync({pixelId, hashedEmail, hashedPuid})) {
    return;
  }

  privacy.getPrivacyData((privacyData) => {
    const localData = state.getLocalData();
    const latestHashedEmail = hashedEmail || localData.hashedEmail;
    const latestHashedPuid = hashedPuid || localData.hashedPuid;

    // call UPS to get connectid
    const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
    const {protocol, host, pathname} = window.location;
    const data = {
      ...latestHashedEmail ? {he: latestHashedEmail} : {},
      ...latestHashedPuid ? {puid: latestHashedPuid} : {},
      ...privacyData.gdprApplies !== undefined ? {gdpr: privacyData.gdprApplies} : {},
      ...privacyData.tcString !== undefined ? {gdpr_consent: privacyData.tcString} : {},
      ...privacyData.uspString !== undefined ? {us_privacy: privacyData.uspString} : {},
      ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
      v: 1,
      url: `${protocol}//${host}${pathname}`,
    };

    api.sendRequest(url, data, response => {
      if (response) {
        state.setLocalData({
          ...latestHashedEmail ? {hashedEmail: latestHashedEmail} : {},
          ...latestHashedPuid ? {hashedPuid: latestHashedPuid} : {},
          connectid: response.connectid,
          ttl: response.ttl,
        });
      }
    });
  });
};

export default sync;
