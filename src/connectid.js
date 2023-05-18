/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';
import state from './state';
import sync from './sync';
import privacy from './privacy';

/**
 * Provides locally stored IDs mapped to the provided email.  Currently, only the ConnectID is supported.*
 * @param {number} pixelId - (required) publisher specific pixel id
 * @param {string?} email - (optional) A raw or hashed email.  An email is determined to be raw if it contains
 *    an "@" character.  If no email is provided, the most recently provided email will be used.
 * @param {string?} puid - (optional) Publisher's user identifier
 * @param {boolean?} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 * @param {Function} callback - (required)
 */
const getIds = ({pixelId, email, puid, yahoo1p}, callback) => {
  if (privacy.isLocallyOptedOut()) {
    state.clearLocalData();
    callback({});
    return;
  }

  sha256.getHashedIdentifier(email, hashedEmail => {
    sha256.getHashedIdentifier(puid, hashedPuid => {
      sync.syncIds({pixelId, he: hashedEmail, puid: hashedPuid, yahoo1p});
      const localData = state.getLocalData();
      if (
        (!hashedEmail && !hashedPuid)
        || (!hashedEmail && !!localData.he) || (hashedEmail && hashedEmail === localData.he)
        || (!hashedPuid && !!localData.puid) || (hashedPuid && hashedPuid === localData.puid)
      ) {
        // if no ids provided or any id matches, return connectId
        callback({connectId: localData.connectId});
      } else {
        callback({});
      }
      if (localData.connectId) {
        state.setLocalData({...localData, lastUsed: Date.now()});
      }
    });
  });
};

export default {getIds};
if (typeof exports !== 'undefined') {
  exports.getIds = getIds;
}
