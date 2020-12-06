import React from 'react';
import { ScrollView, StyleSheet, StatusBar, View, 
  TouchableOpacity, Image} from 'react-native';
import axios from 'axios';
import { Container, Header, Content, Card, CardItem, 
  Text, Body, Button } from 'native-base';
import moment from 'moment';

import { connect } from 'react-redux';
import * as referenceAction from '../actions/referenceAction';

import { Toolbar } from 'react-native-material-ui';

import NetworkErrorImage from "../assets/images/network-error-image.svg";

class DocumentsScreen extends React.Component {
	
  constructor(props) {
  	super(props)
  	
    this.DEBUGGING = false

  	this.getArticles = this.getArticles.bind(this)
  	this.openDocument = this.openDocument.bind(this)
    this.search = this.search.bind(this)
    this.checkArticlesAreSafe = this.checkArticlesAreSafe.bind(this)
  	
  	this.state = {
      hasLoaded: false,
      articles: [],
      nextPage: 1,
      keyword: "machine learning",
      stillArticles: true,
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

  getArticles(keyword, page, reset=false) {
  	const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
  	const ENDPOINT = "/recommend/oer_materials"
  	const url = PLATFORM_URL + ENDPOINT
  	
    if(this.DEBUGGING) { console.log(keyword) }

  	axios.get(url, {
      params: {
        text: keyword,
        type: "text",
        page: page,
      }
    })
		.then(res => {
      var articles = this.state.articles
      res.data.rec_materials.map( (article) => {
        console.log("next")
        articles.push(article)
      })

      if(reset) { articles = res.data.rec_materials }

      const nextPage = this.state.nextPage+1
      const maxPages = res.data.metadata.max_pages

      console.log(nextPage + " / " + maxPages)

			this.setState({
				articles: articles,
        hasLoaded: true,
        hasRequestFailed: false,
        nextPage: nextPage,
        stillArticles: nextPage < maxPages 
			})

      this.checkArticlesAreSafe()
		})
		.catch(error => {
      // Unable to load the data (probably a network error)
      this.setState({
        hasLoaded: false,
        hasRequestFailed: true
      })
			console.log(error);
		})
  }

  checkArticlesAreSafe() {
    const { articles } = this.state

    for(var i=0; i<articles.length; i++) {
      const id = articles[i].material_id
      const missingArticle = { ...articles[i] }

      const providerName = articles[i].provider
      missingArticle['provider'] = {
        provider_id: -1,
        provider_name: providerName,
        provider_domain: "unknown",
      }

      console.log("Checking article: " + id)

      const PLATFORM_URL = "http://platform.x5gon.org/api/v1"
      const ENDPOINT = "/oer_materials/" + id
      const url = PLATFORM_URL + ENDPOINT

      axios.get(url, {} )
        .then(res => {
          const article = res.data.oer_materials
          
          if(typeof article === "undefined") {
            this.props.uploadMissingDocument(id, missingArticle)
          }
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  openDocument(material_id) {
    console.log("Running...")
    const { articles  } = this.state
    
  	this.props.navigation.navigate('Articles', {
  		material_id: material_id,
  	})
  }

  search(event) {
    const value = event.nativeEvent.text
    this.setState({ 
      keyword : value, 
      nextPage : 1,
    })

    this.getArticles(value, 1, true)
  }

  render() {

  	const { articles, hasLoaded, stillArticles, colors, hasRequestFailed } = this.state

    if(this.DEBUGGING) { console.log("DocumentsScreen.render: has it loaded? " + hasLoaded) }

    return (
      <>
        <Toolbar
          centerElement="MyRefs"
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
              
              <Card style={styles.card}>
                <CardItem style={styles.card}>
                  <Body>
                    <Text style={styles.header1Text}>{"Network Error"}</Text>
                  </Body>
                </CardItem>
                
                <CardItem style={styles.header}>
                  <Body style={{alignItems: 'center'}}>
                    <NetworkErrorImage width={150} height={120}/>
                  </Body>
                </CardItem>
                <CardItem style={styles.footer}>
                  <Text style={styles.baseText}>{"In order to run this app you must have a network connection. Please check your network connection and try again. If the problem persists please get in contact directly with me at harry@harrysrepairs.co.uk "}</Text>
                </CardItem>
              </Card>

              <Button
                  style={styles.button}
                  onPress={ () => {this.getArticles(this.state.keyword, this.state.nextPage)} }
                >
                <Body>
                  <Text style={styles.baseText}>Reload Articles</Text>
                </Body>
              </Button>   
            </View>
          </ScrollView>
        ) : null}
        {/* When the data hasn't loaded AND no error occurrs */}
        {(!hasLoaded && !hasRequestFailed) ? (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.centerContainer}>
              <Button
                  style={styles.button}
                  onPress={ () => {} }
                >
                <Body>
                  <Text style={styles.baseText}>Loading...</Text>
                </Body>
              </Button>   
            </View>
          </ScrollView>
        ) : null}
        {/* When the data has loaded */}
        {hasLoaded ? (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.centerContainer}>
              <Text style={{ ...styles.header5Text, paddingTop : 10, paddingBottom: 20 }}>
                {"Showing " + articles.length + " results for " + this.state.keyword + ":"}
              </Text>
            </View>

        		{ articles.map((article, i) => {
              var author = article.provider

              if(typeof author === "object") {
                author = article.provider.provider_name
              }

              const color = colors[i%5]

        		  return ( 
                <TouchableOpacity onPress={ () => {this.openDocument(article.material_id)} } 
                  style={{...styles.card, marginTop: 10, marginBottom: 10}} key={i}>
                  <Card style={styles.card}>
                		<CardItem style={styles.header}>
                			<Body>
                        <Text style={styles.header1Text}>{article.title}</Text>
                        <Text style={styles.baseText}>{author}</Text>
                      </Body>
                		</CardItem>
                    <CardItem style={styles.footer}>
                      	<Text numberOfLines={4} style={styles.baseText}>
                          {article.description==null ? "No description" : article.description}
                        </Text>    
                  	</CardItem>
                	</Card>
                </TouchableOpacity>
              );
            })}
            {stillArticles ? (
              <TouchableOpacity
                onPress={ () => {this.getArticles(this.state.keyword, this.state.nextPage)} }
              >
                <Card style={styles.button}>
                  <Body>
                    <Text style={styles.header5Text}>View more</Text>
                  </Body>
                </Card>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        ) : null}
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

/* Colors */
const transparent = "#00000000" // For hidden borders
// Dark mode
// const backgroundColor = "#121212" // For the background
// const elevatedColor = "#323232" // For the cards
// const cardOutline = "#00000000" // For hidden borders
// const pTextColor = "#000"
// Light mode
const backgroundColor = "#FFFFFF" // For the background
const elevatedColor = "#FFFFFF" // For the cards
const cardOutline = "#00000000" // For hidden borders
const pTextColor = "#666666"
const h1TextColor = "#0068aa"
const h5TextColor = "#000000"

/* Font Sizes */
const pTextSize = 12
const h5TextSize = 12
const h1TextSize = 21

/* Miscellanous */
const borderRadius = 8;

// borders - 2
// header font size: 24
// p font size: 12
// backgound color - 
const styles = StyleSheet.create({
  footer: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: transparent
  },
  card: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: cardOutline
  },
  header: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: transparent
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: backgroundColor,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    color: pTextColor,
    fontSize: pTextSize
  },
  header5Text: {
    color: h5TextColor,
    fontSize: h5TextSize
  },
  header1Text: {
    color: h1TextColor,
    fontSize: h1TextSize,
    textTransform: 'uppercase',
    fontWeight: "bold"
  },
  button: {
    backgroundColor: elevatedColor, 
    marginTop: 10,
    padding: 15,
    borderRadius: borderRadius,
    borderColor: '#000'
  }
});

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
