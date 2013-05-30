/*
 * majaX
 *
 * Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  https://github.com/simonwaldherr/majaX.js/
 * Version: 0.1.7
 */

/*jslint browser: true, white: true, plusplus: true, indent: 2, regexp: true, forin: true */
/*global ActiveXObject */
/*exported majaX */

function majaX(data, successcallback, errorcallback) {
  "use strict";
  var url, method, port, type, faildata, ajax, ajaxTimeout, mimes, mimetype, senddata, sendkeys, sendstring, regex, urlparts = {}, i = 0;

  function countChars(string, split) {
    string = string.split(split);
    if (typeof string === 'object') {
      return string.length - 1;
    }
    return 0;
  }

  if (data.url === undefined) {
    return false;
  }

  regex = /((http[s]?:\/\/)?([\.:\/?&]+)?([^\.:\/?&]+)?)/gm;
  urlparts.regex = data.url.match(regex);
  urlparts.clean = {
    'protocol': '',
    'domain': '',
    'port': '',
    'path': '',
    'fileextension': '',
    'query': ''
  };
  for (i = 0; i < urlparts.regex.length; i++) {
    if (countChars(urlparts.regex[i], '://') === 1) {
      urlparts.clean.protocol = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split('://')[0];
      urlparts.clean.domain = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split('://')[1];
    } else if ((countChars(urlparts.regex[i], '/') === 0) && (countChars(urlparts.regex[i], ':') === 0) && (urlparts.clean.path === '')) {
      urlparts.clean.domain += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    } else if ((countChars(urlparts.regex[i], ':') === 1) && (urlparts.clean.path === '')) {
      urlparts.clean.port = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split(':')[1];
    } else if ((countChars(urlparts.regex[i], '?') === 0) && (countChars(urlparts.regex[i], '&') === 0)) {
      urlparts.clean.path += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    } else {
      urlparts.clean.query += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    }
  }
  if (urlparts.clean.query === '') {
    urlparts.clean.fileextension = urlparts.clean.path.split('.')[urlparts.clean.path.split('.').length - 1];
  } else {
    urlparts.clean.fileextension = urlparts.clean.path.split('.')[urlparts.clean.path.split('.').length - 2];
  }

  mimes = {
    'txt': 'text/plain',
    'json': 'application/json',
    'atom': 'application/atom+xml',
    'rss': 'application/rss+xml',
    'soap': 'application/soap+xml',
    'xml': 'application/xml',
    'svg': 'image/svg+xml',
    'css': 'text/css',
    'csv': 'text/csv',
    'html': 'text/html',
    'vcf': 'text/vcard'
  };

  url = data.url === undefined ? false : data.url;
  method = data.method === undefined ? 'GET' : data.method;
  port = data.port === undefined ? urlparts.clean.port === undefined ? '80' : urlparts.clean.port : data.port;
  type = data.type === undefined ? urlparts.clean.fileextension === undefined ? 'plain' : urlparts.clean.fileextension : data.type;
  mimetype = data.mimetype === undefined ? mimes[urlparts.clean.fileextension] === undefined ? 'text/plain' : mimes[urlparts.clean.fileextension] : data.mimetype;
  senddata = data.data === undefined ? false : data.data;
  faildata = data.faildata === undefined ? false : data.faildata;

  if (method === 'DEBUG') {
    return {
      "url": url,
      "urlparts": urlparts.clean,
      "port": port,
      "type": type,
      "mime": mimetype,
      "data": data
    };
  }

  function escapeHtmlEntities(text) {
    return text.replace(/[\u00A0-\u2666<>\&]/g, function (c) {
        return '&' + (escapeHtmlEntities.entityTable[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';';
      });
  }
  escapeHtmlEntities.entityTable = {
    34: 'quot',
    38: 'amp',
    39: 'apos',
    60: 'lt',
    62: 'gt',
    160: 'nbsp',
    161: 'iexcl',
    162: 'cent',
    163: 'pound',
    164: 'curren',
    165: 'yen',
    166: 'brvbar',
    167: 'sect',
    168: 'uml',
    169: 'copy',
    170: 'ordf',
    171: 'laquo',
    172: 'not',
    173: 'shy',
    174: 'reg',
    175: 'macr',
    176: 'deg',
    177: 'plusmn',
    178: 'sup2',
    179: 'sup3',
    180: 'acute',
    181: 'micro',
    182: 'para',
    183: 'middot',
    184: 'cedil',
    185: 'sup1',
    186: 'ordm',
    187: 'raquo',
    188: 'frac14',
    189: 'frac12',
    190: 'frac34',
    191: 'iquest',
    192: 'Agrave',
    193: 'Aacute',
    194: 'Acirc',
    195: 'Atilde',
    196: 'Auml',
    197: 'Aring',
    198: 'AElig',
    199: 'Ccedil',
    200: 'Egrave',
    201: 'Eacute',
    202: 'Ecirc',
    203: 'Euml',
    204: 'Igrave',
    205: 'Iacute',
    206: 'Icirc',
    207: 'Iuml',
    208: 'ETH',
    209: 'Ntilde',
    210: 'Ograve',
    211: 'Oacute',
    212: 'Ocirc',
    213: 'Otilde',
    214: 'Ouml',
    215: 'times',
    216: 'Oslash',
    217: 'Ugrave',
    218: 'Uacute',
    219: 'Ucirc',
    220: 'Uuml',
    221: 'Yacute',
    222: 'THORN',
    223: 'szlig',
    224: 'agrave',
    225: 'aacute',
    226: 'acirc',
    227: 'atilde',
    228: 'auml',
    229: 'aring',
    230: 'aelig',
    231: 'ccedil',
    232: 'egrave',
    233: 'eacute',
    234: 'ecirc',
    235: 'euml',
    236: 'igrave',
    237: 'iacute',
    238: 'icirc',
    239: 'iuml',
    240: 'eth',
    241: 'ntilde',
    242: 'ograve',
    243: 'oacute',
    244: 'ocirc',
    245: 'otilde',
    246: 'ouml',
    247: 'divide',
    248: 'oslash',
    249: 'ugrave',
    250: 'uacute',
    251: 'ucirc',
    252: 'uuml',
    253: 'yacute',
    254: 'thorn',
    255: 'yuml',
    402: 'fnof',
    913: 'Alpha',
    914: 'Beta',
    915: 'Gamma',
    916: 'Delta',
    917: 'Epsilon',
    918: 'Zeta',
    919: 'Eta',
    920: 'Theta',
    921: 'Iota',
    922: 'Kappa',
    923: 'Lambda',
    924: 'Mu',
    925: 'Nu',
    926: 'Xi',
    927: 'Omicron',
    928: 'Pi',
    929: 'Rho',
    931: 'Sigma',
    932: 'Tau',
    933: 'Upsilon',
    934: 'Phi',
    935: 'Chi',
    936: 'Psi',
    937: 'Omega',
    945: 'alpha',
    946: 'beta',
    947: 'gamma',
    948: 'delta',
    949: 'epsilon',
    950: 'zeta',
    951: 'eta',
    952: 'theta',
    953: 'iota',
    954: 'kappa',
    955: 'lambda',
    956: 'mu',
    957: 'nu',
    958: 'xi',
    959: 'omicron',
    960: 'pi',
    961: 'rho',
    962: 'sigmaf',
    963: 'sigma',
    964: 'tau',
    965: 'upsilon',
    966: 'phi',
    967: 'chi',
    968: 'psi',
    969: 'omega',
    977: 'thetasym',
    978: 'upsih',
    982: 'piv',
    8226: 'bull',
    8230: 'hellip',
    8242: 'prime',
    8243: 'Prime',
    8254: 'oline',
    8260: 'frasl',
    8472: 'weierp',
    8465: 'image',
    8476: 'real',
    8482: 'trade',
    8501: 'alefsym',
    8592: 'larr',
    8593: 'uarr',
    8594: 'rarr',
    8595: 'darr',
    8596: 'harr',
    8629: 'crarr',
    8656: 'lArr',
    8657: 'uArr',
    8658: 'rArr',
    8659: 'dArr',
    8660: 'hArr',
    8704: 'forall',
    8706: 'part',
    8707: 'exist',
    8709: 'empty',
    8711: 'nabla',
    8712: 'isin',
    8713: 'notin',
    8715: 'ni',
    8719: 'prod',
    8721: 'sum',
    8722: 'minus',
    8727: 'lowast',
    8730: 'radic',
    8733: 'prop',
    8734: 'infin',
    8736: 'ang',
    8743: 'and',
    8744: 'or',
    8745: 'cap',
    8746: 'cup',
    8747: 'int',
    8756: 'there4',
    8764: 'sim',
    8773: 'cong',
    8776: 'asymp',
    8800: 'ne',
    8801: 'equiv',
    8804: 'le',
    8805: 'ge',
    8834: 'sub',
    8835: 'sup',
    8836: 'nsub',
    8838: 'sube',
    8839: 'supe',
    8853: 'oplus',
    8855: 'otimes',
    8869: 'perp',
    8901: 'sdot',
    8968: 'lceil',
    8969: 'rceil',
    8970: 'lfloor',
    8971: 'rfloor',
    9001: 'lang',
    9002: 'rang',
    9674: 'loz',
    9824: 'spades',
    9827: 'clubs',
    9829: 'hearts',
    9830: 'diams',
    338: 'OElig',
    339: 'oelig',
    352: 'Scaron',
    353: 'scaron',
    376: 'Yuml',
    710: 'circ',
    732: 'tilde',
    8194: 'ensp',
    8195: 'emsp',
    8201: 'thinsp',
    8204: 'zwnj',
    8205: 'zwj',
    8206: 'lrm',
    8207: 'rlm',
    8211: 'ndash',
    8212: 'mdash',
    8216: 'lsquo',
    8217: 'rsquo',
    8218: 'sbquo',
    8220: 'ldquo',
    8221: 'rdquo',
    8222: 'bdquo',
    8224: 'dagger',
    8225: 'Dagger',
    8240: 'permil',
    8249: 'lsaquo',
    8250: 'rsaquo',
    8364: 'euro'
  };

  function getText(string) {
    var re = /<([^<>]*)>([^\/]*)<(\/[^<>]*)>/gmi;
    return string.replace(re, '');
  }

  function getXMLasObject(xmlstring) {
    var xmlroot = document.createElement('div'),
      foo = {};
    xmlroot.innerHTML = xmlstring;

    function returnChilds(element, node, deep) {
      var i, ii, obj, key, plaintext, returnArray = [],
        childs = node.childNodes.length;
      ii = 0;
      for (i = 0; i < childs; i++) {
        if (node.childNodes[i].localName !== null) {
          element[ii] = {};
          for (key in node.childNodes[i]) {
            obj = node.childNodes[i][key];
            if ((typeof obj === 'string') || (typeof obj === 'number')) {
              if ((key !== 'accessKey') && (key !== 'baseURI') && (key !== 'className') && (key !== 'contentEditable') && (key !== 'dir') && (key !== 'namespaceURI') && (obj !== "") && (key !== key.toUpperCase()) && (obj !== 0) && (key !== 'childs') && (key !== 'textContent') && (key !== 'nodeType') && (key !== 'tabIndex') && (key !== 'innerHTML') && (key !== 'outerHTML')) {
                element[ii][key] = obj;
              } else if ((key === 'innerHTML') || (key === 'outerHTML')) {
                element[ii][key] = escapeHtmlEntities(obj);
              }
            }
          }
          plaintext = getText(node.childNodes[i].innerHTML).trim();
          if (plaintext !== "") {
            element[ii].textContent = plaintext;
          }
          if (node.childNodes[i].childNodes.length > 1) {
            element[ii].childs = returnChilds(returnArray, node.childNodes[i], deep + 1);
          }
          ii++;
        }
      }
      return element;
    }
    return returnChilds(foo, xmlroot, 1);
  }

  function getCSVasArray(csvstring) {
    var regexCSV, arrayCSV, arrMatches, strMatchedDelimiter, strMatchedValue, strDelimiter = ';';

    function cleanArray(actual) {
      var newArray = [],
        clean, i = 0;
      for (i = 0; i < actual.length; i++) {
        if ((typeof actual[i] === 'string') || (typeof actual[i] === 'number')) {
          newArray.push(actual[i]);
        } else if (typeof actual[i] === 'object') {
          clean = cleanArray(actual[i]);
          if (clean[0] !== '') {
            newArray.push(cleanArray(actual[i]));
          }
        }
      }
      return newArray;
    }

    regexCSV = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    arrayCSV = [[]];
    arrMatches = regexCSV.exec(csvstring);

    while (arrMatches) {
      strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
        arrayCSV.push([]);
      }
      if (arrMatches[2]) {
        strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
      } else {
        strMatchedValue = arrMatches[3];
      }
      arrayCSV[arrayCSV.length - 1].push(strMatchedValue);
      arrMatches = regexCSV.exec(csvstring);
    }
    return cleanArray(arrayCSV);
  }

  ajax = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : (XMLHttpRequest && new XMLHttpRequest()) || null;
  ajaxTimeout = window.setTimeout(function () {
      ajax.abort();
    }, 6000);

  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4) {
      if (ajax.status === 200) {
        clearTimeout(ajaxTimeout);
        if (ajax.status !== 200) {
          errorcallback(faildata, ajax);
        } else {
          type = type.toLowerCase();
          if (method === 'API') {
            if (urlparts.clean.domain === 'github.com') {
              var jsoncontent = JSON.parse(ajax.responseText);
              if (jsoncontent.content !== undefined) {
                jsoncontent.content = window.atob(jsoncontent.content.replace(/\n/gmi, ''));
                successcallback(jsoncontent, ajax);
              } else {
                successcallback(JSON.parse(ajax.responseText), ajax);
              }
            }
          } else {
            if (type === 'json') {
              successcallback(JSON.parse(ajax.responseText), ajax);
            } else if (type === 'xml') {
              successcallback(getXMLasObject(ajax.responseText), ajax);
            } else if (type === 'csv') {
              successcallback(getCSVasArray(ajax.responseText), ajax);
            } else {
              successcallback(ajax.responseText, ajax);
            }
          }
        }
      }
    }
  };

  i = 0;
  sendstring = '';
  if (senddata !== false) {
    for (sendkeys in senddata) {
      if (i !== 0) {
        sendstring += '&';
      }
      sendstring += sendkeys + '=' + senddata[sendkeys];
      i++;
    }
  }

  if (method === 'API') {
    if (urlparts.clean.domain === 'github.com') {
      type = 'json';
      if (urlparts.clean.path.split('/')[3] === undefined) {
        ajax.open('GET', 'https://api.github.com/repos/' + urlparts.clean.path.split('/')[1] + '/' + urlparts.clean.path.split('/')[2] + '/contents/', true);
        ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        ajax.send();
      } else {
        ajax.open('GET', 'https://api.github.com/repos/' + urlparts.clean.path.split('/')[1] + '/' + urlparts.clean.path.split('/')[2] + '/contents/' + urlparts.clean.path.split('/', 4)[3], true);
        ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        ajax.send();
      }
    }
  } else if (method === 'GET') {
    if (sendstring !== '') {
      if (urlparts.clean.query !== '') {
        url = url + '&' + sendstring;
      } else {
        url = url + '?' + sendstring;
      }
    }
    ajax.open('GET', url, true);
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send();
  } else if (method === 'POST') {
    ajax.open('POST', url, true);
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send(sendstring);
  } else {
    ajax.open(method, url, true);
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send();
  }
}
