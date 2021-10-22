/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import api from './api';
import sinon from 'sinon';

describe('api', () => {
  describe('sendRequest', () => {
    let xhr, requests;

    beforeEach(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = function (req) {
        requests.push(req);
      };
    });

    afterEach(function () {
      xhr.restore();
    });

    it("should call UPS to fetch ConnectID", function () {
      api.sendRequest('mock_url', {he: 'abc'}, sinon.fake());

      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('mock_url?he=abc');
    });

    it("should call UPS to fetch ConnectID when no hashed email is provided", function () {
      api.sendRequest('mock_url', {}, sinon.fake());

      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('mock_url?');
    });

    it('should pass API response to callback', done => {
      api.sendRequest('mock url', {he: 'abc'}, response => {
        expect(response.connectid).toBe('fake_ connectid');
        done();
      });

      requests[0].respond(
        200,
        {"Content-Type": "application/json"},
        '{"connectid": "fake_ connectid"}'
      );
    });

    it('should pass empty response to callback when API fails', done => {
      api.sendRequest('mock url', {he: 'abc'}, response => {
        expect(response).toBe(undefined);
        done();
      });

      requests[0].respond(400);
    });

  });

});