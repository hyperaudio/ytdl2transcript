/**
 * Bundle of ytdl2transcript
 * Generated: 2019-12-13
 * Version: 1.0.0
 * License: MIT
 * Author: Laurian Gridinoc <laurian@gridinoc.name> (https://gridinoc.com)
 */

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/* eslint-disable no-use-before-define */

/* eslint-disable no-unused-expressions */

/* eslint-disable no-console */

/* eslint-disable no-shadow */

/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
var fs = require('fs');

var xml2js = require('xml2js');

var vtt = require('vtt.js');

var shortid = require('shortid');

var _require = require('../input/subs.info.json'),
    subtitles = _require.subtitles;

var _require2 = require('../input/auto-subs.info.json'),
    automatic_captions = _require2.automatic_captions;

var generateID = function generateID() {
  var id = null;

  do {
    id = shortid.generate();
  } while (!id.match(/^[a-z]([0-9]|[a-z])+([0-9a-z]+)[a-z]$/i));

  return id;
};

var moreMagic = function moreMagic(paragraphs) {
  return paragraphs.reverse().reduce(function (acc, p) {
    if (!p.end && acc.length > 0) p.end = acc[0].start;

    if (!p.words || p.words.length === 0) {
      p.words = p.text.split(' ').reduce(function (acc, text, index, words) {
        return [].concat(_toConsumableArray(acc), [{
          id: generateID(),
          start: p.start + Math.floor(index * (p.end - p.start) / words.length),
          end: p.start + Math.floor((index + 1) * (p.end - p.start) / words.length),
          offset: index === 0 ? 0 : acc.map(function (_ref) {
            var text = _ref.text;
            return text;
          }).join(' ').length + 1,
          length: text.length,
          text: text
        }]);
      }, []);
    }

    return [p].concat(_toConsumableArray(acc));
  }, []);
};

var main = function main() {
  var queue = [['subs', subtitles], ['auto-subs', automatic_captions]].reduce(function (acc, _ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        type = _ref3[0],
        subs = _ref3[1];

    return [].concat(_toConsumableArray(acc), _toConsumableArray(Object.entries(subs).reduce(function (acc, _ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          lang = _ref5[0],
          formats = _ref5[1];

      return [].concat(_toConsumableArray(acc), _toConsumableArray(formats.map(function (_ref6) {
        var ext = _ref6.ext;
        return {
          lang: lang,
          ext: ext,
          type: type,
          file: "".concat(type, ".").concat(lang, ".").concat(ext)
        };
      })));
    }, [])));
  }, []).filter(function (_ref7) {
    var file = _ref7.file;
    return fs.existsSync("./input/".concat(file));
  }); // .filter(({ lang }) => lang === 'ro');
  // .slice(0, 1);

   console.log(JSON.stringify(queue, null, 2));
  queue.forEach(function (_ref8) {
    var lang = _ref8.lang,
        type = _ref8.type,
        ext = _ref8.ext,
        file = _ref8.file;

    switch (ext) {
      case 'srv3':
        convertSRV3(file, lang);
        break;

      case 'ttml':
        convertTTML(file, lang);
        break;

      case 'vtt':
        convertVTT(file, lang);
        break;

      default:
        console.warn("Unknown format ".concat(ext));
        break;
    }
  });
};

var convertVTT = function convertVTT(file, lang, type) {
  var cues, parser, paragraphs, transcript;
  return regeneratorRuntime.async(function convertVTT$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          global.navigator = {
            userAgent: ''
          };
          cues = [];
          parser = new vtt.WebVTT.Parser({
            VTTCue: vtt.VTTCue,
            VTTRegion: vtt.VTTRegion
          }, vtt.WebVTT.StringDecoder());

          parser.oncue = function (cue) {
            return cues.push(cue);
          };

          parser.parse(fs.readFileSync("./input/".concat(file), {
            encoding: 'utf-8'
          }));
          parser.flush();
           fs.writeFileSync("./debug/".concat(file, ".parsed.json"), JSON.stringify(cues, null, 2), 'utf8');
          paragraphs = moreMagic(cues.map(function (_ref9) {
            var startTime = _ref9.startTime,
                text = _ref9.text;
            var start = parseFloat(startTime) * 1e3;
            return {
              id: generateID(),
              start: start,
              text: text.trim()
            };
          }));
           fs.writeFileSync("./debug/".concat(file, ".paragraphs.json"), JSON.stringify(paragraphs, null, 2), 'utf8');
          transcript = {
            id: generateID(),
            lang: lang,
            paragraphs: paragraphs
          };
          fs.writeFileSync("./output/".concat(file, ".json"), JSON.stringify(transcript, null, 2), 'utf8');

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
};

var convertTTML = function convertTTML(file, lang) {
  var _ref10, _data$tt, _data$tt$body$, _data$tt$body$$div$;

  var data, paragraphs, transcript;
  return regeneratorRuntime.async(function convertTTML$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(xml2js.parseStringPromise(fs.readFileSync("./input/".concat(file), {
            encoding: 'utf-8'
          }), {
            attrkey: 'attrs',
            charkey: 'text',
            trim: true,
            explicitArray: true
          }));

        case 2:
          data = _context2.sent;
           fs.writeFileSync("./debug/".concat(file, ".parsed.json"), JSON.stringify(data, null, 2), 'utf8');
          paragraphs = moreMagic(((_ref10 = data === null || data === void 0 ? void 0 : (_data$tt = data.tt) === null || _data$tt === void 0 ? void 0 : (_data$tt$body$ = _data$tt.body[0]) === null || _data$tt$body$ === void 0 ? void 0 : (_data$tt$body$$div$ = _data$tt$body$.div[0]) === null || _data$tt$body$$div$ === void 0 ? void 0 : _data$tt$body$$div$.p) !== null && _ref10 !== void 0 ? _ref10 : []).map(function (_ref11) {
            var begin = _ref11.attrs.begin,
                text = _ref11.text;

            var _begin$split = begin.split(':'),
                _begin$split2 = _slicedToArray(_begin$split, 3),
                hh = _begin$split2[0],
                mm = _begin$split2[1],
                ss = _begin$split2[2];

            var start = (hh * 3600 + mm * 60 + ss) * 1e3;
            return {
              id: generateID(),
              start: start,
              text: text
            };
          }));
           fs.writeFileSync("./debug/".concat(file, ".paragraphs.json"), JSON.stringify(paragraphs, null, 2), 'utf8');
          transcript = {
            id: generateID(),
            lang: lang,
            paragraphs: paragraphs
          };
          fs.writeFileSync("./output/".concat(file, ".json"), JSON.stringify(transcript, null, 2), 'utf8');

        case 8:
        case "end":
          return _context2.stop();
      }
    }
  });
};

var convertSRV3 = function convertSRV3(file, lang) {
  var _ref12, _data$timedtext, _data$timedtext$body$;

  var data, paragraphs, transcript;
  return regeneratorRuntime.async(function convertSRV3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(xml2js.parseStringPromise(fs.readFileSync("./input/".concat(file), {
            encoding: 'utf-8'
          }), {
            attrkey: 'attrs',
            charkey: 'text',
            trim: true,
            explicitArray: true
          }));

        case 2:
          data = _context3.sent;
           fs.writeFileSync("./debug/".concat(file, ".parsed.json"), JSON.stringify(data, null, 2), 'utf8');
          paragraphs = moreMagic(((_ref12 = data === null || data === void 0 ? void 0 : (_data$timedtext = data.timedtext) === null || _data$timedtext === void 0 ? void 0 : (_data$timedtext$body$ = _data$timedtext.body[0]) === null || _data$timedtext$body$ === void 0 ? void 0 : _data$timedtext$body$.p) !== null && _ref12 !== void 0 ? _ref12 : []).filter(function (_ref13) {
            var s = _ref13.s,
                text = _ref13.text;
            return !!s || !!text;
          }).map(function (_ref14) {
            var t = _ref14.attrs.t,
                _ref14$s = _ref14.s,
                s = _ref14$s === void 0 ? [] : _ref14$s,
                text = _ref14.text;
            var start = parseInt(t, 10);
            var words = s.reduce(function (acc, _ref15, index) {
              var _ref15$attrs = _ref15.attrs,
                  _ref15$attrs$t = _ref15$attrs.t,
                  t = _ref15$attrs$t === void 0 ? 0 : _ref15$attrs$t,
                  _ref15$attrs$ac = _ref15$attrs.ac,
                  ac = _ref15$attrs$ac === void 0 ? 0 : _ref15$attrs$ac,
                  text = _ref15.text;
              return [].concat(_toConsumableArray(acc), [{
                id: generateID(),
                start: start + parseInt(t, 10),
                end: start + parseInt(t, 10) + parseInt(ac, 10),
                offset: index === 0 ? 0 : acc.map(function (_ref16) {
                  var text = _ref16.text;
                  return text;
                }).join(' ').length + 1,
                length: text.length,
                text: text
              }]);
            }, []);
            return {
              id: generateID(),
              start: start,
              end: words.length > 0 ? words[words.length - 1].end : null,
              text: text !== null && text !== void 0 ? text : words.map(function (_ref17) {
                var text = _ref17.text;
                return text;
              }).join(' '),
              words: words
            };
          }));
           fs.writeFileSync("./debug/".concat(file, ".paragraphs.json"), JSON.stringify(paragraphs, null, 2), 'utf8');
          transcript = {
            id: generateID(),
            lang: lang,
            paragraphs: paragraphs
          };
          fs.writeFileSync("./output/".concat(file, ".json"), JSON.stringify(transcript, null, 2), 'utf8');

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
};

main();
