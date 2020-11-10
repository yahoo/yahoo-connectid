/* Copyright Verizon Media, Licensed under the terms of the MIT license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';

/**
 * @param {string} email - (required) raw or hashed email
 * @param callback
 */
const getHashedEmail = (email, callback) => {
  if (email.indexOf('@') < 0) {
    callback(email);
  } else {
    sha256.computeHash(email, callback);
  }
};

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported, however
 * additional IDs (e.g. LiveRamp, LiveIntent, Merkle) may be supported in the future.
 *
 * @param {number} pixelId - (required) publisher specific pixel id
 * @param {string?} email - (required) A raw or hashed email.  An email is determined to be raw if it contains
 * an "@" character.
 * @param {boolean} gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} gdprConsent - (optional) GDPR consent string.  Only required when GDPR applies
 * @param {boolean} vm1p - true if used in a Verizon Media O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = (
  {
    pixelId,
    email,
    gdpr,
    gdprConsent,
    vm1p,
  },
  callback
) => {
  // pixelId and email are required parameters
  if (!pixelId || !email) {
    callback({});
    return;
  }

  // compute hashed email
  getHashedEmail(email, hashedEmail => {
    // sync ids for hashed email
    sync.syncIds({
      pixelId,
      ...hashedEmail ? {hashedEmail} : {},
      ...gdpr !== undefined ? {gdpr} : {},
      ...gdprConsent !== undefined ? {gdprConsent} : {},
      ...vm1p !== undefined ? {vm1p} : {},
    });

    // return locally stored ids for hashed email.  This responds immediately.  It does not wait for the sync
    // process to complete.
    const userState = state.getUserState(hashedEmail);
    const connectId = userState.connectId ? userState.connectId.value : undefined;
    callback(connectId ? {connectId} : {});
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}