/**
 * Dashboard view container
 */

'use strict'

import React, { Component } from 'react'
import {
  StyleSheet,
  NativeModules
} from 'react-native'
import _ from 'lodash'
import OAuthSimple from 'oauthsimple'
import GiftedSpinner from 'react-native-gifted-spinner'

import Track from '../components/Track'
import TrackList from '../components/Track/List'
import colors from '../scripts/colors'
import util from '../scripts/util'

class DashboardView extends Component {

  constructor (props) {
    super(props)
    this.state = {
      posts: [],
      offset: 0,
      loading: true
    }
    this.limit = 20
    this.auth = {
      key: props.creds.key,
      sec: props.creds.sec,
      token: props.token,
      tokenSecret: props.tokenSecret
    }
    this.loadMore = this.loadMore.bind(this)
    this.getAudioURIs = this.getAudioURIs.bind(this)
  }

  componentWillMount () {
    this.fetchPosts(posts => NativeModules.AudioPlayer.initPlaylist('dashboard', this.getAudioURIs(posts)))
  }

  getAudioURIs (posts) {
    return _.transform(posts, (urls, post) => {
      const uri = util.parseAudioURI(post.player)
      if (uri) {
        urls.push(uri)
      }
    })
  }

  async fetchPosts (callback) {
    // Retrieve user info and switch to the dashboard view
    try {
      const data = await (await fetch(this.signDashboardUrl())).json()
      this.setState(
        {
          loading: false,
          offset: this.state.offset + this.limit,
          posts: [ ...this.state.posts, ...data.response.posts ]
        },
        () => callback(this.state.posts, data.response.posts)
      )
    } catch (err) {
      console.log(err)
    }
  }

  loadMore () {
    this.setState({ loading: true })
    this.fetchPosts((_, newPosts) => NativeModules.AudioPlayer.addToPlaylist(
      'dashboard',
      this.getAudioURIs(newPosts)
    ))
  }

  signDashboardUrl () {
    // Construct oauth signed url to retrieve user dashboard data
    const oauth = new OAuthSimple(this.props.token, this.props.tokenSecret)
    const options = {
      action: 'GET',
      path: 'https://api.tumblr.com/v2/user/dashboard',
      parameters: {
        type: 'audio',
        limit: this.limit,
        reblog_info: true,
        offset: this.state.offset
      },
      signatures: {
        consumer_key: this.props.creds.key,
        shared_secret: this.props.creds.sec,
        oauth_token: this.props.token,
        oauth_secret: this.props.tokenSecret
      }
    }
    return oauth.sign(options).signed_url
  }

  renderRow (data) {
    if (data.type === 'loading') {
      return data.loading ? <GiftedSpinner style={styles.spinner} /> : null
    } else {
      return <Track {...data} />
    }
  }

  render () {
    return (
      <TrackList
        view='dashboard'
        auth={this.auth}
        loadMore={this.loadMore}
        tracks={this.state.posts}
        loading={this.state.loading}
        navigator={this.props.navigator}
        backgroundColor={colors.nightshade}
        render={{ row: this.renderRow }}
      />
    )
  }
};

const styles = StyleSheet.create({
  spinner: {
    paddingTop: 50,
    paddingBottom: 50
  }
})

DashboardView.propTypes = {
  token: React.PropTypes.string.isRequired,
  tokenSecret: React.PropTypes.string.isRequired,
  navigator: React.PropTypes.object.isRequired,
  creds: React.PropTypes.shape({
    key: React.PropTypes.string.isRequired,
    sec: React.PropTypes.string.isRequired
  })
}

export default DashboardView
