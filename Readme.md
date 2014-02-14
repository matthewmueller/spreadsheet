
# spreadsheet

  create spreadsheets with excel-like features

  ![spreadsheet](https://i.cloudup.com/3TK3f5Cg6V.png)

## Installation

  Install with [component(1)](http://component.io):

    $ component install matthewmueller/spreadsheet

## Example

```js
var Spreadsheet = require('spreadsheet');
var spreadsheet = Spreadsheet();
document.body.appendChild(spreadsheet.el);

spreadsheet
  .select('B1, C1, D1').insert(['Revenues', 'Expenses', 'Profit']).addClass('bold')
  .select('A2:A9').insert(years([1, 2, 3, 4, 5, 6, 7, 8])).addClass('bold')
  .select('B2:B9').insert([10, 12, 32, 43, 53, 23, 32, 43]).format('$').editable()
  .select('C2:C9').insert([32, 11, 22, 33, 45, 42, 10, 32]).format('$').editable()
  .select('D2:D9').calc(':B - :C').format('$')

function years(arr) {
  return arr.map(function(item) {
    return 'Year ' + item;
  })
}
```

## API

### Spreadsheet()

Create a new spreadsheet

#### Spreadsheet#select(sel)

Create a selection on the spreadsheet. Selections can be a single cell, block, entire row, or an entire column. Selections have their own set of methods

```js
spreadsheet
  .select('A1') // Select the cell A1
  .select('A1:H9') // Select a block A1 to A9
  .select(':2') // Select the entire 2nd row
  .select(':A') // Select the entire A column
  .select('D4, A10:F3, :3, :C') // Select many
```

### Selection

#### Selection#insert(arr)

Insert cells into the spreadsheet.

```js
spreadsheet
  .select('A1:A9').insert([1, 2, 3, 4, 5, 6]);
```

#### Selection#calc(expr)

Calculate an `expr`. Reacts to changes in other cells. Automatically resolves columns and rows.

```js
spreadsheet
  .select('A1').calc(':B + :C * 100') // resolves to: A1 = B1 + C1
```

You can also do a one-off calculation:

```js
spreadsheet
  .select('A1').calc('B4 * C9 + 10')
```

#### Selection#format(format)

Set the format of the cell. This function current supports:

```js
spreadsheet.select('A1:A9').format('$') // dollar
spreadsheet.select('B1:B9').format('%') // percentages
```

#### Selection#editable()

Set the cells in the selection to be editable

```js
spreadsheet.select('A1:A9').editable()
```

#### Selection#addClass(class)

Add a class to each cell in the selection.

```js
spreadsheet.select('A1:A9').addClass('bold')
```

## License

  MIT
