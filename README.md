Yahoo ConnectID JavaScript Module Integration Method
==========

With the eventual demise of third party cookies, ad sellers need a solution to bridge the identity gap while continuing to generate revenue. Yahoo ConnectID is a cookieless solution that enables publishers to increase the monetization of their supply while employing targeting that respects user privacy.  This module is compatible with all major browsers and IE11.

Terms of Use
------------

ALL INTEGRATIONS MUST BE APPROVED AND REGISTERED prior to use by the Yahoo Account team. Contact your account manager for more information.

All use of the Yahoo ConnectID, associated APIs, code, and scripts and data are subject to the [Yahoo Master Terms and Conditions](https://legal.yahoo.com/us/en/yahoo/terms/advertising-322/index.html) and the [Yahoo ConnectID Addendum](https://yahoo.secure.force.com/tnc/tc?id=VMID-Addendum-v1). Advertiser uses are subject to the [Yahoo Pixel and Custom Audience Policy.](https://legal.yahoo.com/xw/en/yahoo/privacy/enterprise/pixelandcustomaudience/index.html)

Integration
-----------

1.  <p>Install the package into the project using npm by running the following command in the terminal.</p>

        npm install @yahoo/yahoo-connectid

1.  Add one of the following into the source code. The module includes source code written in ES6 in the src directory as well as transpiled and minified into ES5 in the dist directory.
    -   ES5: import connectId from @yahoo/yahoo-connectid
    -   ES6: import connectId from @yahoo/yahoo-connectid/src/connectid

1.  Get the Yahoo ConnectID by adding the following into the source code. Please note it must be run on the first party domain of the website.

        // code running on a first party domain ...
        
        const params = {
          pixelId: ..., // publisher specific pixel id
          email: ..., // raw or a SHA-256 hashed of a lowercase and trimmed of   
          // white space email address
          gdpr: ..., // (optional) true if user is under gdpr jurisdiction, otherwise false
          gdprConsent: ... // (optional) gdpr consent string (required if gdpr is true)
          usPrivacy: ... // (optional) US Privacy string
        };
        
        const callback = ids => {
          // ids is a map of id type to value, for example {connectid: 'abc123'}
          // pass ids.connectid in request to ad server
        };
        
        connectId.getIds(params, callback);

    If a raw email is provided then a SHA-256 hash of the raw email will be used for syncing and local storage.