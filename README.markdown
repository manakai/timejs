time.js
=======

## Usage

```html
<script>
  window.onload = function () {
    new TER (document.body);
  };
</script>
<script src="time.js" charset=utf-8></script>

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
<script src="time.js" charset=utf-8></script>

<time>2008-12-20T23:27+09:00</time>
<!-- Will be rendered like "2 minutes ago" in English or Japanese -->
```

## LICENSE

See: [LICENSE file](./LICENSE)
