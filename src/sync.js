/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from './state';
import api from './api';
import privacy from './privacy';

const CONNECTID_TTL = 24 * 60 * 60 * 1000;
const PUID_TTL = 30 * 24 * 60 * 60 * 1000;

/**
 * Determines if a specified timestamp is stale (older than CONNECTID_TTL)
 *
 * @param {string} ts timestamp
 * @returns {boolean} true if stale, otherwise false
 */
const isStale = (ts, ttl) => (!ts || (new Date(ts).getTime() + ttl) < Date.now());

const shouldIgnoreTTL = () => {
  const O_AND_O_DOMAINS = [
    'yahoo.com',
    'aol.com',
    'aol.ca',
    'aol.de',
    'aol.co.uk',
    'engadget.com',
    'techcrunch.com',
    'autoblog.com',
  ];

  // ignore TTL and sync immediately if we landed on an O&O domain from a different domain
  const getEtldPlus1 = url => {
    const regex = /[\w]+\.([\w]+|co.uk)$/;
    try {
      return (new URL(url).hostname).match(regex)[0];
    } catch (ignore) {
      // this may also throw an exception, but it will be caught in the code below that calls getEtldPlus1
      return (new URL(`https://${url}`).hostname).match(regex)[0];
    }
  }

  try {
    const previousETLDP1 = getEtldPlus1(document.referrer);
    const currentETLDP1 = getEtldPlus1(window.location.hostname);
    return !!previousETLDP1 && (previousETLDP1 !== currentETLDP1) && O_AND_O_DOMAINS.indexOf(currentETLDP1) > -1;
  } catch (ignore) {
    return false;
  }
}

const shouldSync = ({pixelId, he, puid}) => {
  // pixelId is required
  if (!pixelId) {
    return false;
  }

  const {
    he: cachedHe,
    puid: cachedPuid,
    ttl,
    lastSynced,
  } = state.getLocalData();

  const heChanged = he && he !== cachedHe;
  const puidChanged = puid && puid !== cachedPuid;
  return heChanged || puidChanged || shouldIgnoreTTL() || isStale(lastSynced, ttl || CONNECTID_TTL);
};

const sync = {};

/**
 * Calls UPS endpoint to retrieve ConnectID, and stores the result in Local Storage
 *
 * @param {number} pixelId - (required) pixel id
 * @param {string} he - (optional) hashed email.  he or puid must be provided
 * @param {string} puid - (optional) publisher user identifier. he or puid must be provided
 * @param {boolean} yahoo1p - true if used in a Yahoo O&O page, otherwise false
 */
sync.syncIds = ({
  pixelId,
  he,
  puid,
  yahoo1p,
}) => {
  if (!shouldSync({pixelId, he, puid})) {
    return;
  }

  privacy.getPrivacyData((privacyData) => {
    const localData = state.getLocalData();
    const latestHe = he || localData.he;
    let latestPuid = puid;
    if (!puid && localData.puid && !isStale(localData.lastUsed, PUID_TTL)) {
      // use cached puid if no puid passed in and connectId used recently
      latestPuid = localData.puid;
    }

    // call UPS to get connectId
    const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
    const {protocol, host, pathname} = window.location;
    const data = {
      ...latestHe ? {he: latestHe} : {},
      ...latestPuid ? {puid: latestPuid} : {},
      ...privacyData.gpp !== undefined ? {gpp: privacyData.gpp} : {},
      ...privacyData.gppSid !== undefined ? {gpp_sid: privacyData.gppSid} : {},
      ...privacyData.gdprApplies !== undefined ? {gdpr: privacyData.gdprApplies} : {},
      ...privacyData.tcString !== undefined ? {gdpr_consent: privacyData.tcString} : {},
      ...privacyData.uspString !== undefined ? {us_privacy: privacyData.uspString} : {},
      ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
      v: 1,
      url: `${protocol}//${host}${pathname}`,
    };

    api.sendRequest(url, data, (response = {}) => {
      state.setLocalData({
        connectId: response.connectId,
        he: latestHe,
        puid: latestPuid || response.puid,
        ttl: Math.min(response.ttl || 24, 24) * 60 * 60 * 1000,
        lastUsed: Date.now(),
        lastSynced: Date.now(),
      });
    });
  });
};

export default sync;
