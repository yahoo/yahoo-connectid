/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported, however
 * additional IDs (e.g. LiveRamp, LiveIntent, Merkle) may be supported in the future.
 *
 * @param {number} pixelId - (required) publisher specific pixel id
 * @param {string?} email - (optional) A raw or hashed email.  An email is determined to be raw if it contains
 * @param {string?} puid - (optional) Publisher's user identifier
 * an "@" character.  If no email is provided, the most recently provided email will be used.
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Only required when GDPR applies
 * @param {string?} usPrivacy - (optional)
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = (
  {
    pixelId,
    email,
    puid,
    gdpr,
    gdprConsent,
    usPrivacy,
    yahoo1p,
  },
  callback
) => {
  try {
    const optOut = window.localStorage.getItem('connectIdOptOut');
    if (optOut === '1') {
      state.clear();
      callback({});
      return;
    }
  } catch (e) {
  }

  if (!pixelId) {
    callback({});
    return;
  }

  sha256.getHashedIdentifier(email, hashedEmail => {
    sha256.getHashedIdentifier(puid, hashedPuid => {
      const localData = state.getConnectId({hashedEmail, puid: hashedPuid});
      if (!localData.connectid || localData.isStale) {
        const availableHashedEmail = hashedEmail || localData.hashedEmail;
        const availableHashedPuid = hashedPuid || localData.puid;
        if (availableHashedEmail || availableHashedPuid) {
          sync.syncIds({
            pixelId,
            ...availableHashedEmail ? {hashedEmail: availableHashedEmail} : {},
            ...availableHashedPuid ? {puid: availableHashedPuid} : {},
            ...gdpr !== undefined ? {gdpr} : {},
            ...gdprConsent !== undefined ? {gdprConsent} : {},
            ...usPrivacy !== undefined ? {usPrivacy} : {},
            ...yahoo1p !== undefined ? {yahoo1p} : {},
          });
        }
      }

      // return locally stored id.  This responds immediately.  It does not wait for the sync
      // process to complete.
      callback(localData && localData.connectid ? {
        connectid: localData.connectid
      } : {});
    });
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}