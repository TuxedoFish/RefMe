import React from 'react';
import { ScrollView, StyleSheet, StatusBar, View, 
  TouchableOpacity, Image} from 'react-native';
import axios from 'axios';
import { Container, Header, Content, Card, CardItem, 
  Text, Body, Button } from 'native-base';
import moment from 'moment';

import { connect } from 'react-redux';
import * as referenceAction from '../../actions/referenceAction';

import { Toolbar } from 'react-native-material-ui';

import NetworkErrorImage from "../../assets/images/network-error-image.svg";
import { PAGE_TYPES } from '../ArticlesScreen/Constants';

// Styles and constants specific to page
import { styles_dict } from './Styles.js'
const styles = StyleSheet.create(styles_dict)

class DocumentsScreen extends React.Component {
	
  constructor(props) {
  	super(props)
  	
    this.DEBUGGING = false

  	this.getArticles = this.getArticles.bind(this)
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

  openDocument = (material_id, url, type, title) => {
    console.log("Running...")
    const { articles  } = this.state
    
    // Pass in parameters to the page:
    // id: the id of the page
    // url: the url to the content
    // type: type of content
    // title: title of the content
  	this.props.navigation.navigate('Articles', {
      material_id: material_id,
      id: material_id,
      url: url,
      type: type,
      title: title,
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
              
              <Card style={{...styles.card, backgroundColor: '#ff7979'}}>
                <CardItem style={{...styles.card, backgroundColor: '#ff7979'}}>
                  <Body>
                    <Text style={styles.header1Text}>{"Network Error"}</Text>
                  </Body>
                </CardItem>
                
                <CardItem style={{...styles.header, backgroundColor: '#ff7979'}}>
                  <Body style={{alignItems: 'center'}}>
                    <NetworkErrorImage width={150} height={120}/>
                  </Body>
                </CardItem>
                <CardItem style={{...styles.footer, backgroundColor: '#ff7979'}}>
                  <Text style={styles.baseText}>{"In order to run this app you must have a network connection. Please check your network connection and try again. If the problem persists please get in contact directly with me at harry@harrysrepairs.co.uk "}</Text>
                </CardItem>
              </Card>

              <Button
                  style={styles.button}
                  onPress={ () => {this.getArticles(this.state.keyword, this.state.nextPage)} }
                >
                <Text>Reload Articles</Text>
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
                <Text>Loading...</Text>
              </Button>   
            </View>
          </ScrollView>
        ) : null}
        {/* When the data has loaded */}
        {hasLoaded ? (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={{...styles.centerContainer, alignItems: "flex-start"}}>
              <Text style={{ ...styles.header5Text, paddingTop : 0, paddingBottom: 3 }}>
                {articles.length + " results for " + this.state.keyword + ":"}
              </Text>
            </View>

        		{ articles.map((article, i) => {
              var author = article.provider

              if(typeof author === "object") {
                author = article.provider.provider_name
              }

              const color = colors[i%5]

        		  return ( 
                <TouchableOpacity 
                  onPress={ () => {
                    this.openDocument(
                      article.material_id,
                      article.url,
                      PAGE_TYPES.PDF,
                      article.title
                    )
                  }} 
                  style={{...styles.card, marginTop: 5, marginBottom: 5}} key={i}>
                  <Card style={{...styles.card, backgroundColor: color}}>
                		<CardItem style={{...styles.header, backgroundColor: color}}>
                			<Body>
                        <Text style={styles.header1Text}>{article.title}</Text>
                      </Body>
                		</CardItem>
                    <CardItem style={{...styles.footer,backgroundColor: color}}>
                      	<Text numberOfLines={4} style={styles.baseText}>
                          {article.description==null ? "No description" : article.description}
                        </Text>    
                  	</CardItem>
                	</Card>
                </TouchableOpacity>
              );
            })}
            {stillArticles ? (
              <Button
                style={styles.button}
                onPress={ () => {this.getArticles(this.state.keyword, this.state.nextPage)} }
              >
                <Text>Load more...</Text>
            </Button>   
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
