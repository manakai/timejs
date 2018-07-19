time.js
=======

## Usage

```html
<script>
  window.onload = function () {
    new TER (document.body);
  };
</script>
<script src="time.js"></script>

<time>2008-12-20T23:27+09:00</time>
<!-- Will be rendered appropriately in the user's locale -->
```

... or:

```html
<script>
  window.onload = function () {
    new TER.Delta (document.body);
  };
</script>
<script src="time.js"></script>

<time>2008-12-20T23:27+09:00</time>
<!-- Will be rendered like "2 minutes ago" in English or Japanese -->
```

The |data-tzoffset| attribute can be specified for `time` elements.
If specified, its value must be a valid floating-point number
representing the number of seconds of the offset between the UTC and
the local time used to generate the element's content.  If the local
time is earlier than the UTC, the number must be positive.  If this
attribute is not specified, the browser's local time is used.

## LICENSE

See: [LICENSE file](./LICENSE)
