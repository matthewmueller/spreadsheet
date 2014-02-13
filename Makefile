
build: components index.js spreadsheet.css
	@component build

components: component.json
	@component install --dev

clean:
	rm -fr build components

.PHONY: clean
