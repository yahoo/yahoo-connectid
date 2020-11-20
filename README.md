# Verizon Media ConnectID JS Module

## Description

The Verizon Media ConnectID is designed to enable ad tech platforms to recognize and match users consistently across the open web. The Verizon Media ConnectID is built on top of Verizon Media's
robust and proprietary ID Graph, delivering a higher find rate of audiences on publishers' sites user targeting.

## Terms of Use

All use of the Verizon Media ConnectID, associated APIs, code, and scripts, and data are subject to the Verizon Media Master Terms and Conditions here:

https://www.verizonmedia.com/policies/us/en/verizonmedia/terms/advertising/masterterms/masterterms-322/index.html

And Verizon Media ConnectID Addendum here:

https://yahoo.secure.force.com/tnc/tc?id=VMID-Addendum-v1

Advertiser uses are subject to the Verizon Media Pixel and Custom Audience Policy here:

https://www.verizonmedia.com/policies/xw/en/verizonmedia/privacy/enterprise/pixelandcustomaudience/index.html

ALL INTEGRATIONS MUST BE APPROVED AND REGISTERED prior to use by the Verizon Media Account team. Contact your account manager for more information.





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
3. The getIds method returns the locally cached Verizon Media ConnectID associated with that email (if available).  Local Storage 
is used for caching these IDs
4. The getIds method then calls Verizon Media's Pixel Server to retrieve the Verizon Media ConnectID if it is not available locally.

If a raw email is provided, a SHA-256 hash of the email will be used for syncing and local storage.  A raw email 
is identified by the existence of an "@" character in the value.

The Local Storage key used to cache the ConnectID is "vm-connectid"

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

// code running on a first party domain ...

const params = {
  pixelId: ..., // publisher specific pixel id
  email: ..., // raw or hashed email
  gdpr: ..., // true if user is under gdpr jurisdiction, otherwise false
  gdpr_consent: ... // gdpr consent string (required if gdpr is true)
};

connectId.getIds(params, ids => {
  // ids is a map of id type to value, for example {connectid: 'abc123'}
  // pass ids.connectid in request to ad server
});
```

## Browser Compatibility

This module is compatible with all major browsers and IE11.
