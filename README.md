wave-file-stream
===

PCM Wave File stream for Node and browsers using Web FileSystem API (via web-fs). 

## Install

```bash
$ npm install wave-file-stream
```

## Example

```js
var WaveStream = require('wave-file-stream')

var stream = WaveStream('/test.wav', 44100)
stream.write([RAW_32float_SAMPLES])
stream.end()
```