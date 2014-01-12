var Transform = require('stream').Transform
var util = require('util')

module.exports = WaveStream

util.inherits(WaveStream, Transform);

function WaveStream(opt){
  if (!(this instanceof WaveStream)){
    return new WaveStream(opt)
  }

  Transform.call(this)

  this.sampleRate = opt && opt.sampleRate || 48000
  this.channelCount = opt && opt.channelCount || 2
  this.bitDepth = opt && opt.bitDepth || 16

  this.push(getWaveHeader(this.sampleRate, this.bitDepth, this.channelCount, 0))
  this.length = 0

}

WaveStream.prototype._write = function (chunk, enc, next) {
  this.push(chunk)
  next()
}

WaveStream.prototype._flush = function (done) {
  this.emit('header', getWaveHeader(this.sampleRate, this.bitDepth, this.length))
  done()
}

function getWaveHeader(sampleRate, bitDepth, channelCount, length){
  length = length || 0
  
  var bytesPerSample = bitDepth / 8
  var blockAlign = bytesPerSample * channelCount
  var byteRate = sampleRate * blockAlign
  var sampleFormat = bitDepth === 32 ? 3 : 1

  var buffer = new Buffer(44)
  /* RIFF identifier */
  buffer.write('RIFF', 0)
  /* file length */
  buffer.writeUInt32LE(32 + length, 4);
  /* RIFF type */
  buffer.write('WAVE', 8)
  /* format chunk identifier */
  buffer.write('fmt ', 12)
  /* format chunk length */
  buffer.writeUInt32LE(16, 16);
  /* sample format */
  buffer.writeUInt16LE(sampleFormat, 20);
  /* channel count */
  buffer.writeUInt16LE(channelCount, 22);
  /* sample rate */
  buffer.writeUInt32LE(sampleRate, 24);
  /* byte rate (sample rate * block align) */
  buffer.writeUInt32LE(byteRate, 28);
  /* block align (channel count * bytes per sample) */
  buffer.writeUInt16LE(blockAlign, 32);
  /* bits per sample */
  buffer.writeUInt16LE(bitDepth, 34);
  /* data chunk identifier */
  buffer.write('data', 36)
  /* data chunk length */
  buffer.writeUInt32LE(length, 40)

  return buffer
}