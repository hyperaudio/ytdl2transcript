.PHONY: output clean
.DEFAULT_GOAL := output

output: input/subs.info.json input/auto-subs.info.json
	./node_modules/.bin/babel-node src/index.js

input/subs.info.json:
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format srv3/ttml/vtt \
		--output "input/subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format ttml \
		--output "input/subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format vtt \
		--output "input/subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"

input/auto-subs.info.json:
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format srv3/ttml/vtt --write-auto-sub \
		--output "input/auto-subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format ttml --write-auto-sub \
		--output "input/auto-subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"
	youtube-dl --continue --retries 5 --write-info-json \
		--no-check-certificate --ignore-errors \
		--no-overwrites --skip-download \
		--all-subs --sub-format vtt --write-auto-sub \
		--output "input/auto-subs.%(ext)s" \
		"https://www.youtube.com/watch?v=hB7aGnfLB-8"

clean:
	rm -f ./input/*
	rm -f ./debug/*
	rm -f ./output/*
