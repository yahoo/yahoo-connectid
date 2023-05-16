/* Copyright Yahoo, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sinon from 'sinon';
import api from '../api';

describe('api', () => {
  describe('sendRequest', () => {
    let xhr; let
      requests;

    beforeEach(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = req => {
        requests.push(req);
      };
    });

    afterEach(() => {
      xhr.restore();
    });

    it('should call UPS to fetch ConnectID', () => {
      api.sendRequest('mock_url', {he: 'abc'}, sinon.fake());

      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('mock_url?he=abc');
    });

    it('should call UPS to fetch ConnectID when no hashed email is provided', () => {
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
        {'Content-Type': 'application/json'},
        '{"connectid": "fake_ connectid"}',
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
