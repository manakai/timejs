time.js
=======

## Usage

Just insert:

```html
  <script src="path/to/time.js" data-time-selector="time" async></script>
```

... where the |data-time-selector| attribute value is a selector that
only matches with |time| elements that should be processed.  Then any
|time| element matched with the selector when the script is executed,
as well as any |time| element matched with the selector inserted after
the script's execution, is processed appropriately.  E.g.:

```html
  <time>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date and time, e.g.
       "20 December 2008 11:27:00 PM" -->

  <time>2008-12-20</time>
  <time data-format=date>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date, e.g. "20 December 2008" -->

  <time data-format=monthday>2008-12-20</time>
  <time data-format=monthday>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date, e.g. "20 December 2008" but the
       year component is omitted if it is same as this year, e.g.
       "December 20" if it's 2008. -->

  <time data-format=monthdaytime>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as a date and time, e.g.
       "20 December 2008 11:27:00 PM" but the year component is omitted
       if it is same as this year, e.g. "December 20 11:27:00 PM" if
       it's 2008. -->

  <time data-format=ambtime>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as an "ambtime" in English or Japanese
       depending on the user's language preference, such as "2 hours
       ago", if the date is within 100 days from "today" -->

  <time data-format=deltatime>2008-12-20T23:27+09:00</time>
  <!-- Will be rendered as an "ambtime" in English or Japanese
       depending on the user's language preference, such as "2 hours
       ago" -->
```

When the `time` element's `datetime` or `data-tzoffset` attribute
value is changed, the element's content is updated appropriately.
(Note that the element's content's mutation is ignored.)

The '--timejs-serialization' CSS property can be used to specify the
date and time serialization format.  This version supports following
serializations:

  Property value     Output example
  -----------------  ----------------------------------
  'auto' (default)   (platform dependent)
  'dtsjp1'           令和元(2019)年9月28日 1時23分45秒
  'dtsjp2'           R1(2019).9.28 1:23:45
  'dtsjp3'           2019(R1)/9/28 1:23:45

For backward compatibility with previous versions of this script, if
there is no `data-time-selector` or `data-selector` attribute, the
script does nothing by default, except for defining the `TER` global
property.  By invoking `new TER (/element/)` or `new TER.Delta
(/element/)` constructor, where /element/ is an element node, any
`time` element in the /element/ subtree (or /element/ itself if it is
a `time` element) is processed appropriately.  The `TER` constructor
is equivalent to no `data-format` attribute and the `TER.Delta`
constructor is equivalent to `data-format=ambtime`.

## LICENSE

See: [LICENSE file](./LICENSE)
