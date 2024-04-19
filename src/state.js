/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

const STORAGE_KEY = 'connectId';

const getCookie = (storageKey = STORAGE_KEY) => {
  const name = `${storageKey}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = (ca[i] || '').trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

const setCookie = (value) => {
  const maxAge = 365 * 24 * 60 * 60;
  let domain;
  try {
    domain = window.location.hostname.match(/[\w-]+\.([\w]+|co.uk)$/)[0];
  } catch (e) {
    // ignore
  }
  document.cookie = `${STORAGE_KEY}=${value};Max-Age=${maxAge};Domain=${domain};path=/;Secure;SameSite=None`;
};

const clearCookie = () => {
  document.cookie = `${STORAGE_KEY}=;Max-Age=0;path=/;Secure;SameSite=None`;
};

const getLocalStorage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    return {};
  }
};

const setLocalStorage = json => {
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    // ignore
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

const getLocalData = () => {
  let json = getCookie();
  if (!json) {
    json = getLocalStorage();
    if (json) {
      setCookie(json);
    }
  }

  try {
    return JSON.parse(json) || {};
  } catch (e) {
    return {};
  }
};

const setLocalData = (data = {}) => {
  try {
    const json = JSON.stringify(data);
    setCookie(json);
    setLocalStorage(json);
  } catch (e) {
    // ignore
  }
};

const clearLocalData = () => {
  clearCookie();
  clearLocalStorage();
};

export default {
  getCookie,
  getLocalData,
  setLocalData,
  clearLocalData,
};
