/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from "./state";
import api from './api';

const sync = {};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} hashedEmail - (required) hashed email
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Required if GDPR applies.
 * @param {string?} usPrivacy - (optional)
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncHashedEmail = ({
  pixelId,
  hashedEmail,
  gdpr,
  gdprConsent,
  usPrivacy,
  yahoo1p,
}) => {
  // pixelId and hashedEmail are required
  if (!pixelId || !hashedEmail) {
    return;
  }

  // call UPS to get connectid
  const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
  const data = {
    he: hashedEmail,
    ...gdpr !== undefined ? {gdpr} : {},
    ...gdprConsent !== undefined ? {gdpr_consent: gdprConsent} : {},
    ...usPrivacy !== undefined ? {us_privacy: usPrivacy} : {},
    ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
  };

  api.sendRequest(url, data, response => {
    if (response) {
      state.setConnectId({
        hashedEmail,
        connectid: response.connectid,
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