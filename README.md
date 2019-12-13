# YTDL2TRAMSCRIPT

Experiments in converting YT subtitle formats to a JSON transcript with word-level timings.

<!-- _One liner + link to confluence page_
_Screenshot of UI - optional_ -->

## Setup
<!-- _stack - optional_
_How to build and run the code/app_ -->

git clone, cd into repo

Run `npm install` or `yarn`,

## Usage

run `make`

## System Architecture
<!-- _High level overview of system architecture_ -->
### ytdl subtitles and automatic captions formats 
ytdl can get subtitles or automatic captions in several formats: ttml, vtt, srv1, srv2, srv3; the 1st ytdl in the makefile tries to get srv3/ttml/vtt as preference order; the rest of the ytdl forces to get also ttml and vtt just to have something to test the conversion on the conversion script converts from srv3, ttml or vtt.


But from YT STT only srv3 and vtt has word timing, for now I process the real word timing only fron srv3, all the other ttml or vtt gets interpolated.

With youtubedl, you don't know if you always have srv3. So it falls back to the other formats. the precedence is srv3/ttml/vtt.

### non word level timing
Now, on the non-word-level timing, the timings per line overlap because stuff is displayed in 2 lines that shift up.

Basically I have to discard the end times for each line and set them to the start of the next line then I interpolate words.

I think I can fix the repetition, then next is to lift the timecodes for the words, it won't be in all the words; then most likely use stt-align-node to spread that to the rest of the words.

## Development env
 <!-- _How to run the development environment_
_Coding style convention ref optional, eg which linter to use_
_Linting, github pre-push hook - optional_ -->

- Requires node >= 12 
- youtube-dl.

## Build
<!-- _How to run build_ -->

_NA_


## Tests
<!-- _How to carry out tests_ -->

_NA_

## Deployment
<!-- _How to deploy the code/app into test/staging/production_ -->

on npm, _TBC_