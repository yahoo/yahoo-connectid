/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported, however
 * additional IDs (e.g. LiveRamp, LiveIntent, Merkle) may be supported in the future.
 *
 * @param {number} params.pixelId - (required) publisher specific pixel id
 * @param {string?} params.email - (optional) A raw or hashed email.  An email is determined to be raw if it contains
 * @param {string?} params.puid - (optional) Publisher's user identifier
 * an "@" character.  If no email is provided, the most recently provided email will be used.
 * @param {boolean} params.gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} params.gdprConsent - (optional) GDPR consent string.  Only required when GDPR applies
 * @param {string?} params.usPrivacy - (optional)
 * @param {boolean} params.yahoo1p - true if used in a Yahoo O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = (params, callback) => {
  const {
    email,
    puid,
    ...otherParams
  } = params;

  try {
    const optOut = window.localStorage.getItem('connectIdOptOut');
    if (optOut === '1') {
      state.clear();
      callback({});
      return;
    }
  } catch (e) {
  }

  if (!params.pixelId) {
    callback({});
    return;
  }

  sha256.getHashedIdentifier(email, hashedEmail => {
    sha256.getHashedIdentifier(puid, hashedPuid => {
      callback(state.getConnectId({hashedEmail, puid: hashedPuid}));
      sync.syncIds({
        ...otherParams,
        hashedEmail,
        puid: hashedPuid,
      });
    });
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}