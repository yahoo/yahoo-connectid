/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

/**
 * Generate SHA-256 hash
 *
 * @param {string} str
 * @param {Function} callback - (optional) Called when hash operation is complete
 */
const computeHash = (str, callback) => {
  if (typeof str !== 'string' || !str) {
    callback();
  } else if (!window.crypto || !crypto.subtle || !crypto.subtle.digest) {
    // browser does not support crypto API, fail gracefully.  IE11 does not support this API
    callback(str.indexOf('@') > -1 ? undefined : str);
  } else {
    const msgBuffer = new TextEncoder('utf-8').encode(str.trim().toLowerCase());
    crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      callback(hashArray.map(b => (`00${b.toString(16)}`).slice(-2)).join(''));
    });
  }
};

/**
 * Determines if a string is a valid sha256 hash
 * @param str
 */
const isValidHash = str => {
  const regex = /^[a-f0-9]{64}$/gi;
  return regex.test(str || '');
};

/**
 * @param {string} identifier - raw or hashed id
 * @param callback
 */
const getHashedIdentifier = (identifier, callback) => {
  if (!identifier) {
    callback(undefined);
  } else if (isValidHash(identifier)) {
    callback(identifier);
  } else {
    computeHash(identifier, callback);
  }
};

export default {
  getHashedIdentifier,
};
