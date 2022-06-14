/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from "./state";
import api from './api';

const sync = {};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} hashedEmail - (optional) hashed email.  hashedEmail or puid must be provided
 * @param {string} puid - (optional) publisher user identifier. hashedEmail or puid must be provided
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Required if GDPR applies.
 * @param {string?} usPrivacy - (optional)
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncIds = ({
  pixelId,
  hashedEmail,
  puid,
  gdpr,
  gdprConsent,
  usPrivacy,
  yahoo1p,
}) => {
  // pixelId and either hashedEmail or puid are required
  if (!pixelId || (!hashedEmail && !puid)) {
    return;
  }

  // call UPS to get connectid
  const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
  const data = {
    ...hashedEmail ? {he: hashedEmail} : {},
    ...puid ? {puid} : {},
    ...gdpr !== undefined ? {gdpr} : {},
    ...gdprConsent !== undefined ? {gdpr_consent: gdprConsent} : {},
    ...usPrivacy !== undefined ? {us_privacy: usPrivacy} : {},
    ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
  };

  api.sendRequest(url, data, response => {
    if (response) {
      state.setConnectId({
        ...hashedEmail ? {hashedEmail} : {},
        ...puid ? {puid} : {},
        connectid: response.connectid,
      });
    }
  });
};

export default sync;