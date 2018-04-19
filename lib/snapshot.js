'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Wraps a jsdom call and returns the full page */

var publicUrl = process.env.PUBLIC_URL;
var publicUrlHost = publicUrl && _url2.default.parse(publicUrl).host;

exports.default = function (protocol, host, path, delay) {
  return new Promise(function (resolve, reject) {
    var reactSnapshotRenderCalled = false;
    var url = protocol + '//' + host + path;
    _jsdom2.default.env({
      url: url,
      headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" },
      resourceLoader: function resourceLoader(resource, callback) {
        if (resource.url.host === host) {
          resource.defaultFetch(callback);
        } else if (publicUrl && resource.url.host === publicUrlHost) {
          var mappedLocaleResourceUrl = resource.url.format().replace(publicUrl, protocol + '//' + host);
          resource.url = _url2.default.parse(mappedLocaleResourceUrl);
          resource.defaultFetch(callback);
        } else {
          callback();
        }
      },

      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
      },
      virtualConsole: _jsdom2.default.createVirtualConsole().sendTo(console),
      created: function created(err, window) {
        if (err) return reject(err);
        if (!window) return reject('Looks like no page exists at ' + url);
        window.reactSnapshotRender = function () {
          reactSnapshotRenderCalled = true;
          setTimeout(function () {
            resolve(window);
          }, delay);
        };
      },
      done: function done(err, window) {
        if (!reactSnapshotRenderCalled) {
          reject("'render' from react-snapshot was never called. Did you replace the call to ReactDOM.render()?");
        }
      }
    });
  });
};

module.exports = exports['default'];