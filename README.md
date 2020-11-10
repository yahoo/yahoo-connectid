# Verizon Media Unified ID JS Module

## Description

The Verizon Media Unified ID is designed to enable ad tech platforms to recognize and match users 
consistently across the open web. The Verizon Media Unified ID is built on top of Verizon Media's
 robust and proprietary ID Graph, delivering a higher find rate of audiences on publishers' sites
  user targeting that respects privacy.

The Verizon Media Unified ID honors privacy choices from our own Privacy Dashboard, as well as global privacy acts.

This module provides the VMUID (Verizon Media Unified ID) associated with a user's email address.

## Prerequisites

Node.js

## Installation

npm install npm-module-name-tbd

## Usage

This module is intended to be run in a browser on the first party domain, typically packaged with an ad tag. This 
module provides a method named <code>getIds</code>.  The interaction between the ad tag and the <code>getIds</code>
method are as follows.

1. Ad tag retrieves an email (raw or hashed) from the page.
2. Ad tag passes email to the <code>getIds</code> method in this module.  
3. The getIds method returns the locally cached VMUID associated with that email (if available).  Local Storage 
is used for caching these IDs
4. The getIds method then calls Verizon Media's Pixel Server to retrieve the VMUID if it is not available locally.

If a raw email is provided, a SHA-256 hash of the email will be used for syncing and local storage.  A raw email 
is identified by the existence of an "@" character in the value.

The Local Storage key used to cache the VMCID is "vm-connectid"

## Integration

This module includes source files written in ES6 in the src directory as well as transpiled and minified code in 
the dist directory.  Depending on the browsers you are targeting and how your project is set up, you may choose
how to import the module.

* Import the module
    * ES5: <code>import connectId from npm-module-name-tbd</code>
    * ES6: <code>import connectId from npm-module-name-tbd/src/connectid</code>
* Call <code>connectId.getIds(params, callback)</code> 
* The callback function will be called with all available mapped IDs

 ```
import connectId from 'npm-module-name-tbd';

// code running on first party domain ...

const params = {
  pixelId: ..., // publisher specific pixel id
  email: ..., // raw or hashed email
  gdpr: ..., // true if user is under gdpr jurisdiction, otherwise false
  gdpr_consent: ... // gdpr consent string (required if gdpr is true)
};

connectId.getIds(params, ids => {
  // ids is a map of id type to value, for example {vmuid: 'abc123'}
  // pass ids.vmuid in request to ad server
});
```

## Browser Compatibility

This module is compatible with all major browsers and IE11.
