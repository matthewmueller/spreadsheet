
build: components spreadsheet.css template.js
	@component build

components: component.json
	@component install --dev

dist: components dist-build dist-minify

dist-build:
	@component build -o dist -n spreadsheet -s Spreadsheet

dist-minify: dist/spreadsheet.js
	@curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		--data-urlencode "js_code@$<" \
		http://closure-compiler.appspot.com/compile \
		> $<.tmp
	@mv $<.tmp dist/spreadsheet.min.js

clean:
	rm -fr build components

.PHONY: build clean template.js
