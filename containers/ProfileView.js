/*
 * Profile main container component
 */

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  NativeModules
} from 'react-native'
import _ from 'lodash'
import Dimensions from 'Dimensions'
import GiftedSpinner from 'react-native-gifted-spinner'
import ParallaxScrollView from 'react-native-parallax-scroll-view'

import colors from '../scripts/colors'
import ProfileHeader from '../components/Profile/Header'
import ProfileBackground from '../components/Profile/Background'
import ProfileForeground from '../components/Profile/Foreground'
import TrackList from '../components/Track/List'
import Track from '../components/Track'
import util from '../scripts/util'

const screen = Dimensions.get('window')
const HEADER_HEIGHT = screen.height / 4

class ProfileView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      posts: [],
      offset: 0,
      blog: null,
      loading: true,
      backgroundColor: props.blog
       ? props.blog.theme && props.blog.theme.background_color
       : colors.nightshade
    }
    this.limit = 20
    this.loadingMore = null
    this.onScroll = this.onScroll.bind(this)
    this.fetchBlog = this.fetchBlog.bind(this)
    this.fetchPosts = this.fetchPosts.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.renderTrackList = this.renderTrackList.bind(this)
  }

  componentWillMount () {
    this.props.blog
      ? this.fetchPosts(posts => NativeModules.AudioPlayer.initPlaylist(
        `profile-${this.props.blogName}`,
        this.getAudioURIs(posts)
      ))
      : this.fetchBlog()
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
    const { auth, blogName } = this.props
    const uri = `https://api.tumblr.com/v2/blog/${blogName}/posts/audio`
    const params = `?api_key=${auth.key}&limit=${this.limit}&offset=${this.state.offset}`
    const data = await (await fetch(uri + params)).json()

    console.log('Received user post data!')
    console.log(JSON.stringify(data, null, 2))

    this.setState(
      {
        loading: false,
        offset: this.state.offset + this.limit,
        posts: [ ...this.state.posts, ...data.response.posts ]
      },
      () => callback(this.state.posts, data.response.posts)
    )
  }

  async fetchBlog () {
    const uri = `https://api.tumblr.com/v2/blog/${this.props.blogName}/info?api_key=${this.props.auth.key}`
    const data = await (await fetch(uri)).json()

    console.log('Received user blog data!')
    console.log(JSON.stringify(data, null, 2))

    const blog = data.response.blog
    const backgroundColor = blog.theme ? blog.theme.background_color : colors.nightshade

    this.setState({ blog, backgroundColor })
    this.fetchPosts(posts => NativeModules.AudioPlayer.initPlaylist(
      `profile-${this.props.blogName}`,
      this.getAudioURIs(posts)
    ))
  }

  onScroll (event) {
    const listView = this.refs['track-list'].getListView()
    const { contentLength, visibleLength } = listView.scrollProperties
    const isEndReached = event.nativeEvent.contentOffset.y >= contentLength - visibleLength

    // Load more audio posts upon reaching the end
    if (!this.state.loading && isEndReached) {
      this.setState({ loading: true })
      this.fetchPosts((_, newPosts) => NativeModules.AudioPlayer.addToPlaylist(
        `profile-${this.props.blogName}`,
        this.getAudioURIs(newPosts)
      ))
    }
  }

  renderHeader () {
    const blog = this.props.blog || this.state.blog
    if (blog) {
      return <ProfileHeader {...blog} />
    }
  }

  renderRow (data) {
    if (data.type === 'loading') {
      return data.loading ? <GiftedSpinner style={styles.spinner} /> : null
    } else {
      return <Track blog={this.props.blog || this.state.blog} {...data} />
    }
  }

  renderTrackList (event) {
    const blog = this.props.blog || this.state.blog
    const avatar = `https://api.tumblr.com/v2/blog/${this.props.blogName}.tumblr.com/avatar/512`

    let backgroundImage = ''
    if (blog && blog.theme && Object.keys(blog.theme).length) {
      backgroundImage = blog.theme.header_image || ''
    }

    return (
      <ParallaxScrollView
        backgroundSpeed={10}
        stickyHeaderHeight={65}
        onScroll={this.onScroll}
        parallaxHeaderHeight={HEADER_HEIGHT}
        renderStickyHeader={() => <View />}
        contentContainerStyle={styles.contentContainer}
        contentBackgroundColor={this.state.backgroundColor}
        backgroundColor={colors.hex2rgba(this.state.backgroundColor)}
        renderForeground={() => <ProfileForeground avatar={avatar} color={this.state.backgroundColor} />}
        renderBackground={() => <ProfileBackground background={backgroundImage} height={HEADER_HEIGHT} />}
      />
    )
  }

  render () {
    return (
      <TrackList
        ref='track-list'
        auth={this.props.auth}
        tracks={this.state.posts}
        loading={this.state.loading}
        navigator={this.props.navigator}
        view={`profile-${this.props.blogName}`}
        blog={this.props.blog || this.state.blog}
        backgroundColor={this.state.backgroundColor}
        render={{
          row: this.renderRow,
          header: this.renderHeader,
          scrollComponent: this.renderTrackList
        }}
      />
    )
  }
}

ProfileView.propTypes = {
  blog: React.PropTypes.object,
  image: React.PropTypes.object.isRequired,
  blogName: React.PropTypes.string.isRequired,
  navigator: React.PropTypes.object.isRequired,
  auth: React.PropTypes.shape({
    key: React.PropTypes.string.isRequired,
    sec: React.PropTypes.string.isRequired,
    token: React.PropTypes.string.isRequired,
    tokenSecret: React.PropTypes.string.isRequired
  })
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  },
  spinner: {
    paddingTop: 50,
    paddingBottom: 50
  }
})

export default ProfileView
