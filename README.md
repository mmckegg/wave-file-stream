wave-file-stream
===

Transform stream that turns raw 32bit Float PCM data into 16bit Wave stream (adding header). 

## Deprecated

Use [wav](https://github.com/TooTallNate/node-wav) instead.

## Install

```bash
$ npm install wave-file-stream
```

## Example

```js
var fs = require('web-fs') // for browser usage - works with plain old node fs too!
var WaveStream = require('wave-file-stream')

var stream = WaveStream({
  sampleRate: 48000,
  channelCount: 2,
  bitDepth: 16
})

stream.write(new Buffer(16bit_PCM_samples))

var fileStream = fs.createWriteStream('test.wav')
recorder.pipe(fileStream)

// optionally go back and rewrite header with updated length
stream.on('header', function(header){ 
  fileStream.on('close', function(){
    var headerStream = fs.createWriteStream(filePath, {flags: 'r+', start:0, end:43})
    headerStream.write(header)
    headerStream.end()
  })
})

stream.end()
```