
build: components spreadsheet.css template.js
	@component build

components: component.json
	@component install --dev

browserify: dist/spreadsheet.js
	@cat dist/spreadsheet.js | ./node_modules/.bin/derequire > dist/spreadsheet.b.tmp.js
	@./node_modules/.bin/browserify -s Spreadsheet dist/spreadsheet.b.tmp.js > dist/spreadsheet.browserify.js
	@rm dist/spreadsheet.b.tmp.js

dist: components dist-build browserify dist-minify

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
