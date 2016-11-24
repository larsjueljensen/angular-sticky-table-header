# angular-sticky-table-header

This is an Angular directive that will make an html table's header "sticky". 

If the height of the table exceeds that of the page, the table header will stay on top of
the page if you scroll past the content above it. Furthermore, if you have content below
the table and the last row slips under the header, the header will follow the last row when
scrolling further.

## Features

 * Simple to use. Just add _ng-sticky-header_ attribute to a _&lt;table&gt;_ element.
 * Works with multi-level headers
 * Table can contain images
 * There can be content both above and below the table
 * Works with multiple tables
 * Can watch for angular $scope changes and resize accordingly
 
## Usage

### Pre filled static HTML table
If you have a pre-filled table (perhaps server-side generated), it suffices to add 
an attribute to the &lt;table&gt; element like this: 
```HTML
    <table ng-sticky-header>
```
### Angular filled HTML table
When you fill your table with angular, you can add another attribute to the &lt;table&gt; element
so that it is possible for the directive to update it's position and size when the angular
model has been loaded and injected into the scope. It works like this:
```HTML
    <table ng-sticky-header ng-sticky-header-update="scopevalue">
```    
## Demo
[Click here to see the directive in action](http://htmlpreview.github.io/?https://github.com/larsjueljensen/angular-sticky-table-header/blob/master/showcase.html)

## Bugs
Feel free to report any issues you encounter.

## Disclaimer
The directive has for the time being been tested in Chrome and Safari.
