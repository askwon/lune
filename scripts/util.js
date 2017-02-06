import queryString from 'query-string'

export default {

  parseAudioURI: function (playerHTML) {
    let src = playerHTML.match(/src="([^"]*)"/)[1]
    let audioKey = decodeURIComponent(src)
    console.log(`Parsing song ${audioKey}`)

    const query = queryString.parse(audioKey.substring(audioKey.indexOf('?')))
    console.log(`Audio file: ${query.audio_file}`)

    // Modify the audio file uri appropriately
    if (query.audio_file && query.audio_file.includes('tumblr.com')) {
      let uri = 'http://a.tumblr.com/'
      audioKey = audioKey.substring(audioKey.lastIndexOf('/') + 1, audioKey.lastIndexOf('&'))
      uri += (audioKey.search('o1.mp3') > 0) ? audioKey : audioKey + 'o1.mp3'
      uri = encodeURI(uri)
      console.log(`Playing song @ ${uri}`)
      return uri
    }

    let uri = query.audio_file
    uri = encodeURI(uri)
    console.log(`Playing song @ ${uri}`)
    return uri
  }

}
