/* Copyright Verizon Media, Licensed under the terms of the Apache 2.0 license. See LICENSE file in project root for terms. */

import sha256 from './sha256';

describe('sha256', () => {
  describe('computeHash', () => {
    // commented out until the crypto API is polyfilled into test harness
    xit('should hash string', done => {
      const testStrings = [
        {
          raw: 'abc',
          hashed: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
        },
        {
          raw: 'test@foo.com',
          hashed: '899d3387a5c5a7555d51d2f0a0b7b50e397fe481fd9a58fafb389b7dc94e11f6'
        }
      ];

      sha256.computeHash(testStrings[0].raw, hash1 => {
        expect(hash1).toBe(testStrings[0].hashed);
        sha256.computeHash(testStrings[1].raw, hash2 => {
          expect(hash2).toBe(testStrings[1].hashed);
          done();
        });
      });
    });

    it('should return empty string if empty string is provided', done => {
      sha256.computeHash(undefined, hash1 => {
        expect(hash1).toBe('');
        sha256.computeHash(null, hash2 => {
          expect(hash2).toBe('');
          sha256.computeHash('', hash3 => {
            expect(hash3).toBe('');
            done();
          });
        });
      });
    });

    it('should return empty string if non-string value is provided',  done => {
      sha256.computeHash(1, hash1 => {
        expect(hash1).toBe('');
        sha256.computeHash(true, hash2 => {
          expect(hash2).toBe('');
          done();
        });
      });
    });
  });
});