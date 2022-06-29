/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';

const userOptedOut = () => {
  let optOut = false;
  try {
    optOut = window.localStorage.getItem('connectIdOptOut');
  } catch (e) {
  }
  return optOut === '1';
};

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported, however
 * additional IDs (e.g. LiveRamp, LiveIntent, Merkle) may be supported in the future.
 *
 * @param {Object} config - config
 * @param {number} config.pixelId - (required) publisher specific pixel id
 * @param {string?} config.email - (optional) A raw or hashed email.  An email is determined to be raw if it contains
 * @param {string?} config.puid - (optional) Publisher's user identifier
 * an "@" character.  If no email is provided, the most recently provided email will be used.
 * @param {boolean} config.gdpr - (required) true if GDPR applies, otherwise false
 * @param {string?} config.gdprConsent - (optional) GDPR consent string.  Only required when GDPR applies
 * @param {string?} config.usPrivacy - (optional)
 * @param {boolean} config.yahoo1p - true if used in a Yahoo O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = (config, callback) => {
  const {email, puid, ...otherParams} = config;

  if (userOptedOut()) {
    state.clear();
    callback({});
    return;
  }

  sha256.getHashedIdentifier(email, hashedEmail => {
    sha256.getHashedIdentifier(puid, hashedPuid => {
      callback(state.getConnectId({hashedEmail, hashedPuid}));
      sync.syncIds({hashedEmail, hashedPuid, ...otherParams,});
    });
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}