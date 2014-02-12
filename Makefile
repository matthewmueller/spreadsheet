
build: components index.js table.css template.html
	@component build

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
