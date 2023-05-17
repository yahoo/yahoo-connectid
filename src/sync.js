/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import state from './state';
import api from './api';
import privacy from './privacy';

const TTL = 24 * 60 * 60 * 1000;

/**
 * Determines if a specified timestamp is stale (older than TTL)
 *
 * @param {string} ts timestamp
 * @returns {boolean} true if stale, otherwise false
 */
const isStale = ts => (!ts || (new Date(ts).getTime() + TTL) < Date.now());

const shouldSync = ({pixelId, he, puid}) => {
  // pixelId is required
  if (!pixelId) {
    return false;
  }

  const {
    he: cachedHe,
    puid: cachedPuid,
    lastSynced,
  } = state.getLocalData();

  const heExists = he || cachedHe;
  const puidExists = puid || cachedPuid;
  const heChanged = he && he !== cachedHe;
  const puidChanged = puid && puid !== cachedPuid;
  return (heExists || puidExists) && (heChanged || puidChanged || isStale(lastSynced));
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
    const latestPuid = puid || localData.puid;

    // call UPS to get connectId
    const url = `https://ups.analytics.yahoo.com/ups/${pixelId}/fed`;
    const {protocol, host, pathname} = window.location;
    const data = {
      ...latestHe ? {he: latestHe} : {},
      ...latestPuid ? {puid: latestPuid} : {},
      ...privacyData.gdprApplies !== undefined ? {gdpr: privacyData.gdprApplies} : {},
      ...privacyData.tcString !== undefined ? {gdpr_consent: privacyData.tcString} : {},
      ...privacyData.uspString !== undefined ? {us_privacy: privacyData.uspString} : {},
      ...yahoo1p !== undefined ? {'1p': yahoo1p} : {},
      v: 1,
      url: `${protocol}//${host}${pathname}`,
    };

    api.sendRequest(url, data, response => {
      if (response) {
        state.setLocalData({
          connectId: response.connectId,
          he: latestHe,
          puid: latestPuid,
          lastUsed: state.getLocalData().lastUsed,
          lastSynced: Date.now(),
        });
      }
    });
  });
};

export default sync;
