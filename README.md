# searhbar-js
Search bar with filters

## Usage

### Create container with input box and link to toggle filters

```html

<div id="search_bar">
	<input type="text" name="q"/>
</div>

<a id="advanced">Advanced</a>

```

### Create container for filters

```html

<div id="search_filters">
	<label>Year: <input type="text" name="year"></label>
	<label>Month: <input type="text" name="month"></label>
</div>

```

### Include JS and CSS

```html

<link rel="stylesheet" href="searhbar.css"/>
<script type="text/javascript" src="searchbar.js"></script>
<script type="text/javascript">
	jQuery(function($) {
		$('#search_bar').searchbar({
			'filters_container': '#search_filters',
			'filters_link': '#advanced'
		});
	});
</script>

```