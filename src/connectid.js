/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';

const isLocallyOptedOut = () => {
  try {
    const localOptOut = window.localStorage.getItem('connectIdOptOut');
    const prebidOptOut1 = window.localStorage.getItem('_pbjs_id_optout');
    const prebidOptOut2 = window.localStorage.getItem('_pubcid_optout');
    return localOptOut === '1' || prebidOptOut1 || prebidOptOut2;
  } catch (e) {
    return false;
  }
};

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported, however
 * additional IDs (e.g. LiveRamp, LiveIntent, Merkle) may be supported in the future.
 *
 * @param {number} pixelId - (required) publisher specific pixel id
 * @param {string?} email - (optional) A raw or hashed email.  An email is determined to be raw if it contains
 * @param {string?} puid - (optional) Publisher's user identifier
 * an "@" character.  If no email is provided, the most recently provided email will be used.
 * @param {boolean?} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = ({pixelId, email, puid, yahoo1p}, callback) => {
  if (isLocallyOptedOut()) {
    state.clearLocalData();
    callback({});
    return;
  }

  sha256.getHashedIdentifier(email, hashedEmail => {
    sha256.getHashedIdentifier(puid, hashedPuid => {
      sync.syncIds({pixelId, hashedEmail, hashedPuid, yahoo1p});
      callback(state.getConnectId({hashedEmail, hashedPuid}));
    });
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}
