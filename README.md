Verizon Media ConnectID JavaScript Module Integration Method
==========

The Verizon Media ConnectID is designed to enable ad tech platforms to recognize and match users consistently across the open web. The Verizon Media ConnectID is built on top of Verizon Media's robust and proprietary ID Graph, delivering a higher find rate of audiences on publishers' sites user targeting. This module is compatible with all major browsers and IE11.

Terms of Use
------------

ALL INTEGRATIONS MUST BE APPROVED AND REGISTERED prior to use by the Verizon Media Account team. Contact your account manager for more information.

All use of the Verizon Media ConnectID, associated APIs, code, and scripts and data are subject to the [Verizon Media Master Terms and Conditions](https://www.verizonmedia.com/policies/us/en/verizonmedia/terms/advertising/masterterms/masterterms-322/index.html) and the [Verizon Media ConnectID Addendum](https://yahoo.secure.force.com/tnc/tc?id=VMID-Addendum-v1). Advertiser uses are subject to the [Verizon Media Pixel and Custom Audience Policy.](https://www.verizonmedia.com/policies/xw/en/verizonmedia/privacy/enterprise/pixelandcustomaudience/index.html)

Integration
-----------

1.  <p>Install the package into the project using npm by running the following command in the terminal.</p>

        npm install @vzm/verizon-media-connectid

1.  Add one of the following into the source code. The module includes source code written in ES6 in the src directory as well as transpiled and minified into ES5 in the dist directory.
    -   ES5: import connectId from @vzm/verizon-media-connectid
    -   ES6: import connectId from @vzm/verizon-media-connectid/src/connectid

1.  Get the Verizon Media  ConnectID by adding the following into the source code. Please note it must be run on the first party domain of the website.

        // code running on a first party domain ...
        
        const params = {
          pixelId: ..., // publisher specific pixel id
          email: ..., // raw or a SHA-256 hashed of a lowercase and trimmed of   
          // white space email address
          gdpr: ..., // true if user is under gdpr jurisdiction, otherwise false
          gdpr_consent: ... // gdpr consent string (required if gdpr is true)
        };
        
        const callback = ids => {
          // ids is a map of id type to value, for example {connectid: 'abc123'}
          // pass ids.connectid in request to ad server
        };
        
        connectId.getIds(params, callback);

    If a raw email is provided then a SHA-256 hash of the raw email will be used for syncing and local storage.