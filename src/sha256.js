/* Copyright Verizon Media, Licensed under the terms of the MIT license. See LICENSE file in project root for terms. */

/**
 * Generate SHA-256 hash
 *
 * @param {string} str
 * @param {Function} callback - (optional) Called when hash operation is complete
 */
const computeHash = (str, callback) => {
  if (typeof str !== 'string' || !str) {
    callback('');
  } else if (!window.crypto || !crypto.subtle || !crypto.subtle.digest) {
    // browser does not support crypto API, fail gracefully.  IE11 does not support this API
    callback('');
  } else {
    const msgBuffer = new TextEncoder('utf-8').encode(str.trim().toLowerCase());
    crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      callback(hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join(''));
    });
  }
};

export default {
  computeHash,
};