function TER (c) {
  this.container = c;
  this._initialize ();
} // TER

(function () {

  /* Based on HTML Standard's definition of "global date and time
     string", but allows Unicode 5.1.0 White_Space where it was
     allowed in earlier drafts of HTML5. */
  var globalDateAndTimeStringPattern = /^([0-9]{4,})-([0-9]{2})-([0-9]{2})(?:[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+(?:T[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]*)?|T[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]*)([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.([0-9]+))?)?[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]*(?:Z|([+-])([0-9]{2}):([0-9]{2}))$/;

  /* HTML Standard's definition of "date string" */
  var dateStringPattern = /^([0-9]{4,})-([0-9]{2})-([0-9]{2})$/;

  function parseTimeElement (el) {
    var datetime = el.getAttribute ('datetime');
    if (datetime === null) {
      datetime = el.textContent;

      /* Unicode 5.1.0 White_Space */
      datetime = datetime.replace
                     (/^[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/, '')
                         .replace
                     (/[\u0009-\u000D\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+$/, '');
    }

    if (m = datetime.match (globalDateAndTimeStringPattern)) {
      if (m[1] < 100) {
        return new Date (NaN);
      } else if (m[8] && (m[9] > 23 || m[9] < -23)) {
        return new Date (NaN);
      } else if (m[8] && m[10] > 59) {
        return new Date (NaN);
      }
      var d = new Date (Date.UTC (m[1], m[2] - 1, m[3], m[4], m[5], m[6] || 0));
      if (m[1] != d.getUTCFullYear () ||
          m[2] != d.getUTCMonth () + 1 ||
          m[3] != d.getUTCDate () ||
          m[4] != d.getUTCHours () ||
          m[5] != d.getUTCMinutes () ||
          (m[6] || 0) != d.getUTCSeconds ()) {
        return new Date (NaN); // bad date error.
      }
      if (m[7]) {
        var ms = (m[7] + "000").substring (0, 3);
        d.setMilliseconds (ms);
      }
      if (m[9] != null) {
        var offset = parseInt (m[9], 10) * 60 + parseInt (m[10], 10);
        offset *= 60 * 1000;
        if (m[8] == '-') offset *= -1;
        d = new Date (d.valueOf () - offset);
      }
      d.hasDate = true;
      d.hasTime = true;
      d.hasTimezone = true;
      return d;
    } else if (m = datetime.match (dateStringPattern)) {
      if (m[1] < 100) {
        return new Date (NaN);
      }
      /* For old browsers (which don't support the options parameter
         of `toLocaleDateString` method) the time value is set to
         12:00, so that most cases are covered. */
      var d = new Date (Date.UTC (m[1], m[2] - 1, m[3], 12, 0, 0));
      if (m[1] != d.getUTCFullYear () ||
          m[2] != d.getUTCMonth () + 1 ||
          m[3] != d.getUTCDate ()) {
        return new Date (NaN); // bad date error.
      }
      d.hasDate = true;
      return d;
    } else {
      return new Date (NaN);
    }
  } // parseTimeElement

  function setDateContent (el, date) {
    if (!el.getAttribute ('title')) {
      el.setAttribute ('title', el.textContent);
    }
    if (!el.getAttribute ('datetime')) {
      var r = '';
      r = date.getUTCFullYear (); // JS does not support years 0001-0999
      r += '-' + ('0' + (date.getUTCMonth () + 1)).slice (-2);
      r += '-' + ('0' + date.getUTCDate ()).slice (-2);
      el.setAttribute ('datetime', r);
    }
    el.textContent = date.toLocaleDateString (navigator.language, {"timeZone": "UTC"});
  } // setDateContent

  function setMonthDayDateContent (el, date) {
    if (!el.getAttribute ('title')) {
      el.setAttribute ('title', el.textContent);
    }
    if (!el.getAttribute ('datetime')) {
      var r = '';
      r = date.getUTCFullYear (); // JS does not support years 0001-0999
      r += '-' + ('0' + (date.getUTCMonth () + 1)).slice (-2);
      r += '-' + ('0' + date.getUTCDate ()).slice (-2);
      el.setAttribute ('datetime', r);
    }

    var lang = navigator.language;
    if (new Date ().toLocaleString (lang, {timeZone: 'UTC', year: "numeric"}) ===
        date.toLocaleString (lang, {timeZone: 'UTC', year: "numeric"})) {
      el.textContent = date.toLocaleDateString (lang, {
        "timeZone": "UTC",
        month: "numeric",
        day: "numeric",
      });
    } else {
      el.textContent = date.toLocaleDateString (lang, {
        "timeZone": "UTC",
      });
    }
  } // setDateContent

  function setDateTimeContent (el, date) {
    if (!el.getAttribute ('title')) {
      el.setAttribute ('title', el.textContent);
    }
    if (!el.getAttribute ('datetime')) {
      // XXX If year is outside of 1000-9999, ...
      el.setAttribute ('datetime', date.toISOString ());
    }

    var tzoffset = el.getAttribute ('data-tzoffset');
    if (tzoffset !== null) {
      tzoffset = parseFloat (tzoffset);
      el.textContent = new Date (date.valueOf () + date.getTimezoneOffset () * 60 * 1000 + tzoffset * 1000).toLocaleString (navigator.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    } else {
      el.textContent = date.toLocaleString ();
    }
  } // setDateTimeContent

  function setAmbtimeContent (el, date) {
    if (!el.getAttribute ('title')) {
      el.setAttribute ('title', el.textContent);
    }
    if (!el.getAttribute ('datetime')) {
      // XXX If year is outside of 1000-9999, ...
      el.setAttribute ('datetime', date.toISOString ());
    }

    var text = TER.Delta.prototype.text;
    var dateValue = date.valueOf ();
    var nowValue = new Date ().valueOf ();

    var diff = dateValue - nowValue;
    if (diff < 0) diff = -diff;

    if (diff == 0) {
      el.textContent = text.now ();
      return;
    }

    var v;
    diff = Math.floor (diff / 1000);
    if (diff < 60) {
      v = text.second (diff);
    } else {
      var f = diff;
      diff = Math.floor (diff / 60);
      if (diff < 60) {
        v = text.minute (diff);
        f -= diff * 60;
        if (f > 0) v += text.sep () + text.second (f);
      } else {
        f = diff;
        diff = Math.floor (diff / 60);
        if (diff < 50) {
          v = text.hour (diff);
          f -= diff * 60;
          if (f > 0) v += text.sep () + text.minute (f);
        } else {
          f = diff;
          diff = Math.floor (diff / 24);
          if (diff < 100) {
            v = text.day (diff);
            f -= diff * 24;
            if (f > 0) v += text.sep () + text.hour (f);
          } else {
            return setDateTimeContent (el, date);
          }
        }
      }
    }

    if (dateValue < nowValue) {
      v = text.before (v);
    } else {
      v = text.after (v);
    }
    el.textContent = v;
  } // setAmbtimeContent

TER.prototype._initialize = function () {
  if (this.container.localName === 'time') {
    this._initTimeElement (this.container);
  } else {
    var els = this.container.getElementsByTagName ('time');
    var elsL = els.length;
    for (var i = 0; i < elsL; i++) {
      var el = els[i];
      if (!el) break; /* If <time> is nested */
      this._initTimeElement (el);
    }
  }
}; // TER.prototype._initialize

  TER.prototype._initTimeElement = function (el) {
    if (el.terUpgraded) return;
    el.terUpgraded = true;
    
    var self = this;
    this._replaceTimeContent (el);
    new MutationObserver (function (mutations) {
      self._replaceTimeContent (el);
    }).observe (el, {attributeFilter: ['data-tzoffset']});
  }; // _initTimeElement

  TER.prototype._replaceTimeContent = function (el) {
    var date = parseTimeElement (el);
    if (isNaN (date.valueOf ())) return;
    if (date.hasTimezone) { /* full date */
      setDateTimeContent (el, date);
    } else if (date.hasDate) {
      setDateContent (el, date);
    }
  }; // _replaceTimeContent

  TER.Delta = function (c) {
    TER.apply (this, [c]);
  }; // TER.Delta
  TER.Delta.prototype = new TER (document.createElement ('time'));

  TER.Delta.prototype._replaceTimeContent = function (el) {
    var date = parseTimeElement (el);
    if (isNaN (date.valueOf ())) return;
    if (date.hasTimezone) { /* full date */
      setAmbtimeContent (el, date);
    } else if (date.hasDate) {
      setDateContent (el, date);
    }
  }; // _replaceTimeContent

  (function (selector) {
    if (!selector) return;

    var replaceContent = function (el) {
      var date = parseTimeElement (el);
      if (isNaN (date.valueOf ())) return;
      var format = el.getAttribute ('data-format');
      if (format === 'datetime') {
        setDateTimeContent (el, date);
      } else if (format === 'date') {
        setDateContent (el, date);
      } else if (format === 'monthday') {
        setMonthDayDateContent (el, date);
      } else if (format === 'ambtime') {
        setAmbtimeContent (el, date);
      } else { // auto
        if (date.hasTimezone) { /* full date */
          setDateTimeContent (el, date);
        } else if (date.hasDate) {
          setDateContent (el, date);
        }
      }
    }; // replaceContent
    
    var op = function (el) {
      if (el.terUpgraded) return;
      el.terUpgraded = true;

      replaceContent (el);
      new MutationObserver (function (mutations) {
        replaceContent (el);
      }).observe (el, {attributeFilter: ['datetime', 'data-tzoffset']});
    }; // op
    
    var mo = new MutationObserver (function (mutations) {
      mutations.forEach (function (m) {
        Array.prototype.forEach.call (m.addedNodes, function (e) {
          if (e.nodeType === e.ELEMENT_NODE) {
            if (e.matches && e.matches (selector)) op (e);
            Array.prototype.forEach.call (e.querySelectorAll (selector), op);
          }
        });
      });
    });
    mo.observe (document, {childList: true, subtree: true});
    Array.prototype.forEach.call (document.querySelectorAll (selector), op);

  }) (document.currentScript.getAttribute ('data-time-selector') ||
      document.currentScript.getAttribute ('data-selector') /* backcompat */);
}) ();

TER.Delta.Text = {};

TER.Delta.Text.en = {
  day: function (n) {
    return n + ' day' + (n == 1 ? '' : 's');
  },
  hour: function (n) {
    return n + ' hour' + (n == 1 ? '' : 's');
  },
  minute: function (n) {
    return n + ' minute' + (n == 1 ? '' : 's');
  },
  second: function (n) {
    return n + ' second' + (n == 1 ? '' : 's');
  },
  before: function (s) {
    return s + ' ago';
  },
  after: function (s) {
    return 'in ' + s;
  },
  now: function () {
    return 'just now';
  },
  sep: function () {
    return ' ';
  }
};

TER.Delta.Text.ja = {
  day: function (n) {
    return n + '日';
  },
  hour: function (n) {
    return n + '時間';
  },
  minute: function (n) {
    return n + '分';
  },
  second: function (n) {
    return n + '秒';
  },
  before: function (s) {
    return s + '前';
  },
  after: function (s) {
    return s + '後';
  },
  now: function () {
    return '今';
  },
  sep: function () {
    return '';
  }
};

(function () {
  var lang = navigator.language;
  if (lang.match (/^[jJ][aA](?:-|$)/)) {
    TER.Delta.prototype.text = TER.Delta.Text.ja;
  } else {
    TER.Delta.prototype.text = TER.Delta.Text.en;
  }
})();

if (window.TEROnLoad) {
  TEROnLoad ();
}

/*

Usage:

Just insert:

  <script src="path/to/time.js" data-time-selector="time" async></script>

... where the |data-time-selector| attribute value is a selector that
only matches with |time| elements that should be processed.  Then any
|time| element matched with the selector when the script is executed,
as well as any |time| element matched with the selector inserted after
the script's execution, is processed appropriately.  E.g.:

  <time>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date and time in the user's locale
       dependent format, such as "20 December 2008 11:27 PM" -->

  <time>2008-12-20</time>
  <time data-format=date>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date in the user's locale dependent
       format, such as "20 December 2008" -->

  <time>2008-12-20</time>
  <time data-format=date>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date in the user's locale dependent
       format, such as "20 December 2008" but the year component is
       omitted if it is same as this year, such as "December 20" in
       case it's 2008. -->

  <time data-format=ambtime>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as an "ambtime" in English or Japanese
       depending on the user's language preference, such as "2 hours
       ago" -->

When the |time| element's |datetime| or |data-tzoffset| attribute
value is changed, the element's content is updated appropriately.
(Note that the element's content's mutation is ignored.)

For backward compatibility with previous versions of this script, if
there is no |data-time-selector| or |data-selector| attribute, the
script does nothing by default, except for defining the |TER| global
property.  By invoking |new TER (/element/)| or |new TER.Delta
(/element/)| constructor, where /element/ is an element node, any
|time| element in the /element/ subtree (or /element/ itself if it is
a |time| element) is processed appropriately.  The |TER| constructor
is equivalent to no |data-format| attribute and the |TER.Delta|
constructor is equivalent to |data-format=ambtime|.

Repository:

Latest version of this script is available in Git repository
<https://github.com/wakaba/timejs>.

Specification:

HTML Standard <https://html.spec.whatwg.org/#the-time-element>.

This script interprets "global date and time string" using older
parsing rules as defined in previous versions of the HTML spec, which
is a willful violation to the current HTML Living Standard.

*/

/* ***** BEGIN LICENSE BLOCK *****
 *
 * Copyright 2008-2019 Wakaba <wakaba@suikawiki.org>.  All rights reserved.
 *
 * Copyright 2017 Hatena <http://hatenacorp.jp/>.  All rights reserved.
 *
 * This program is free software; you can redistribute it and/or 
 * modify it under the same terms as Perl itself.
 *
 * Alternatively, the contents of this file may be used 
 * under the following terms (the "MPL/GPL/LGPL"), 
 * in which case the provisions of the MPL/GPL/LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of the MPL/GPL/LGPL, and not to allow others to
 * use your version of this file under the terms of the Perl, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the MPL/GPL/LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the Perl or the MPL/GPL/LGPL.
 *
 * "MPL/GPL/LGPL":
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * <https://www.mozilla.org/MPL/>
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is TER code.
 *
 * The Initial Developer of the Original Code is Wakaba.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Wakaba <wakaba@suikawiki.org>
 *   Hatena <http://hatenacorp.jp/>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
