/* Copyright Verizon Media, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

/**
 * Make XHR requests
 *
 * @param {string} url - (required)
 * @param {Object} data - the payload to send as query parameters
 * @param {Function} callback - (required) Called when API responds
 */
export const sendRequest = (url, data = {}, callback) => {
  let xhr = new XMLHttpRequest();

  let params = Object.keys(data)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

  xhr.onreadystatechange = function (e) {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) {
        try {
          callback(JSON.parse(xhr.responseText));
        } catch (e) {
          callback();
        }
      } else {
        callback();
      }
    }
  };

  try {
    xhr.withCredentials = true;
    xhr.open('GET', `${url}?${params}`, true);
    xhr.send(data);
  } catch (e) {
  }
};

export default {
  sendRequest,
};