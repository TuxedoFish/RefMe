import React from 'react';
import {
  ScrollView, StyleSheet, StatusBar, View,
  TouchableOpacity, Image
} from 'react-native';
import axios from 'axios';
import {
  Container, Header, Content, Card, CardItem,
  Text, Body, Button
} from 'native-base';
import moment from 'moment';

import { connect } from 'react-redux';
import * as referenceAction from '../../actions/referenceAction';

import { Toolbar } from 'react-native-material-ui';

import NetworkErrorImage from "../../assets/images/network-error-image.svg";
import { PAGE_TYPES } from '../ArticlesScreen/Constants';

// Styles and constants specific to page
import { styles_dict } from './Styles.js'
import LoadingOverlay from '../../components/LoadingOverlay';
const styles = StyleSheet.create(styles_dict)

class DocumentsScreen extends React.Component {

  constructor(props) {
    super(props)

    this.DEBUGGING = false

    this.getArticles = this.getArticles.bind(this)
    this.search = this.search.bind(this)

    this.state = {
      articles: [],
      nextPage: 1,
      keyword: "machine learning",
      stillArticles: true,
      overlay: {
        visible: true,
        title: "Loading..."
      },
      colors: [
        "#e056fd",
        "#ffbe76",
        "#ff7979",
        "#badc58",
        "#7ed6df"
      ]
    }

    this.getArticles(this.state.keyword, this.state.nextPage);
  }

  getArticles(keyword, page, reset = false) {

    this.updateOverlay(true, "Loading...")

    // Using my API hosted on AWS
    // http://refme-env.eba-dp8b9qmx.eu-west-2.elasticbeanstalk.com/articles/?query_string=Machine%20Learning&page=1
    const URL = "https://34v4w4wx4l.execute-api.eu-west-2.amazonaws.com/default/getArticles/"
    axios.get(URL, {
      params: {
        query_string: keyword,
        page: page,
      }
    })
      .then(response => {

        const { data: { result } } = response
        let { articles, nextPage } = this.state

        let newArticles = [...articles]
        if (reset) { newArticles = [] }
        result.map((article) => { newArticles.push(article) })

        nextPage = nextPage + 1
        console.log(nextPage)

        this.setState({
          articles: newArticles,
          hasRequestFailed: false,
          nextPage: nextPage,
          stillArticles: true
        })
        this.updateOverlay(false, "None")
      })
      .catch(error => {
        // Unable to load the data (probably a network error)
        this.setState({
          hasLoaded: false,
          hasRequestFailed: true
        })
        this.updateOverlay(false, "None")
        console.log(error);
      })

    // Initial V1-2 used exclusively x5gon API:
    // https://platform.x5gon.org/api/v1/recommend/oer_materials/?text=Machin%20Learning&type=text&page=1
  }

  updateOverlay = (isVisible, title) => {
    this.setState({
      overlay: {
        visible: isVisible,
        title: title
      }
    })
  }

  openDocument = (article, type) => {
    // Pass the article and the content type to the article page
    this.props.navigation.navigate('Articles', { article: article, type: type })
  }

  search(event) {
    const value = event.nativeEvent.text
    this.setState({
      keyword: value,
      nextPage: 1,
    })

    this.getArticles(value, 1, true)
  }

  render() {

    const { articles, hasLoaded, stillArticles, colors, hasRequestFailed,
      overlay: { visible: isOverlayVisible, title: overlayTitle } } = this.state

    if (this.DEBUGGING) { console.log("DocumentsScreen.render: has it loaded? " + hasLoaded) }

    return (
      <>
        <Toolbar
          centerElement="RefMe"
          searchable={{
            autoFocus: true,
            placeholder: 'Search',
            onSubmitEditing: this.search,
          }}
        />
        {/* When an error has occurred */}
        {hasRequestFailed ? (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.centerContainer}>

              <Card style={{ ...styles.card, backgroundColor: '#ff7979' }}>
                <CardItem style={{ ...styles.card, backgroundColor: '#ff7979' }}>
                  <Body>
                    <Text style={styles.header1Text}>{"Network Error"}</Text>
                  </Body>
                </CardItem>

                <CardItem style={{ ...styles.header, backgroundColor: '#ff7979' }}>
                  <Body style={{ alignItems: 'center' }}>
                    <NetworkErrorImage width={150} height={120} />
                  </Body>
                </CardItem>
                <CardItem style={{ ...styles.footer, backgroundColor: '#ff7979' }}>
                  <Text style={styles.baseText}>{"In order to run this app you must have a network connection. Please check your network connection and try again. If the problem persists please get in contact directly with me at harry@harrysrepairs.co.uk "}</Text>
                </CardItem>
              </Card>

              <Button
                style={styles.button}
                onPress={() => { this.getArticles(this.state.keyword, this.state.nextPage) }}
              >
                <Text>Reload Articles</Text>
              </Button>
            </View>
          </ScrollView>
        ) : null}
        {/* When the data hasn't loaded AND no error occurrs */}
        {!hasRequestFailed ? (
          <ScrollView contentContainerStyle={styles.container}>

            {!isOverlayVisible ? (
              <View style={{ ...styles.centerContainer, alignItems: "flex-start" }}>
                <Text style={{ ...styles.header5Text, paddingTop: 0, paddingBottom: 3 }}>
                  {articles.length + " results for " + this.state.keyword + ":"}
                </Text>
              </View>
            ) : null}

            {articles.map((article, i) => {
              var author = article.author

              const color = colors[i % 5]

              return (
                <TouchableOpacity
                  onPress={() => {
                    this.openDocument(article, PAGE_TYPES.PDF)
                  }}
                  style={{ ...styles.card, marginTop: 5, marginBottom: 5 }} key={i}>
                  <Card style={{ ...styles.card, backgroundColor: color }}>
                    <CardItem style={{ ...styles.header, backgroundColor: color }}>
                      <Body>
                        <Text style={styles.header1Text}>{article.title}</Text>
                      </Body>
                    </CardItem>
                    <CardItem style={{ ...styles.footer, backgroundColor: color }}>
                      <Text numberOfLines={4} style={styles.baseText}>
                        {article.description == null ? "No description" : article.description}
                      </Text>
                    </CardItem>
                  </Card>
                </TouchableOpacity>
              );
            })}
            {stillArticles && !isOverlayVisible ? (
              <Button
                style={styles.button}
                onPress={() => { this.getArticles(this.state.keyword, this.state.nextPage) }}
              >
                <Text>Load more...</Text>
              </Button>
            ) : null}
          </ScrollView>
        ) : null}

        <LoadingOverlay visible={isOverlayVisible} title={overlayTitle} />
      </>
    )
  }
}

DocumentsScreen.navigationOptions = {
  title: 'Docs',
  tabBarLabel: 'Docs',
  header: null,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'} />
  ),
};

const mapStateToProps = (state, ownProps) => {
  return {
    references: state.references.ids
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    addReference: ref => dispatch(referenceAction.addReference(ref)),
    removeReference: ref => dispatch(referenceAction.removeReference(ref)),
    updateDocument: (id, doc) => dispatch(referenceAction.updateDocument(id, doc)),
    uploadMissingDocument: (id, doc) => dispatch(referenceAction.uploadMissingDocument(id, doc)),
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsScreen)
