// required from main.js and browser.js to make compatible with
// Node fs and web-fs.
module.exports = function(fs, Buffer){


  var Through = require('through')

  return function(filePath, sampleRate){

    // outfile
    var fileStream = fs.createWriteStream(filePath)
    fileStream.write(getWaveHeader(sampleRate, 0))

    fileStream.on('open', function(){
      stream.url = fileStream.url
    })

    var stream = Through(function(data){

      var buffer = new Buffer(data[0].length * 4)
      var view = new DataView(buffer)
      for (var i=0;i<data[0].length;i++){
        var offset = i * 4
        write16BitPCM(view, offset, data[0][i])
        write16BitPCM(view, offset + 2, data[1][i])
      }

      this.queue(buffer)

    }, function(){

      this.queue(null)

      // rewrite header
      fileStream.once('close', function(){
        fs.stat(filePath, function(err, stat){
          fileStream = fs.createWriteStream(filePath, {flags: 'r+', start:0, end:43})
          fileStream.once('open', function(){
            fileStream.write(getWaveHeader(sampleRate, stat.size - 44))
            fileStream.on('close', function(){
              stream.emit('close')
            })
            fileStream.destroy()
          })
        })
      })

    })

    stream.pipe(fileStream)
    return stream
  }

  function write16BitPCM(output, offset, data){
    var s = Math.max(-1, Math.min(1, data));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  function writeString(view, offset, string){
    for (var i = 0; i < string.length; i++){
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function getWaveHeader(sampleRate, length){
    length = length || 0
    var headerBuffer = new Buffer(44)
    var view = new DataView(headerBuffer)
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 32 + length, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 2, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, length, true);
    return headerBuffer
  }


}
