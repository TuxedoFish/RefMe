import React from 'react';
import { Clipboard, StyleSheet, StatusBar, View, ScrollView,TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Container, Header, Content, Card, CardItem, 
    Body, Text, Icon, Button, Left, Center, Right} from 'native-base';

import { connect } from 'react-redux';
import * as referenceAction from '../actions/referenceAction';

import { Toolbar } from 'react-native-material-ui';
import Dialog from "react-native-dialog";

import NoDataFoundImage from "../assets/images/no-data-found.svg";
import LoadingImage from "../assets/images/loading.svg";

class HistoryScreen extends React.Component {
	
  constructor(props) {
    super(props)
    
    this.getArticleReference=this.getArticleReference.bind(this)
    this.updateAesthetic = this.updateAesthetic.bind(this)
    this.openDocument = this.openDocument.bind(this)
    this.document = this.document.bind(this)

    this.DEBUGGING = true
    this.RESET_STATE = false

    this.upgradeInputRef = React.createRef()

    this.state = {
      documents: [],
      dialogVisible: false,
      loadingDocs: []
    }
  }

  openDocument(material_id) {
    console.log("Running...")
    const { articles  } = this.state
    
    this.props.navigation.navigate('Articles', {
      material_id: material_id,
    })
  }

  updateAesthetic() {
    this.setState({
      documents: [],
      loadingDocs: [],
    })

    setTimeout(
      function() {
        const HISTORY_TO_LOAD = 5
        let i = 0

        for(var id in this.props.documents) {
          if(i < HISTORY_TO_LOAD) {
            const { loadingDocs } = this.state

            if(!loadingDocs.includes(id)) {
              const doc = this.props.documents[id]
              this.getArticleReference(id, doc)
              loadingDocs.push(id)
              this.setState({loadingDocs: loadingDocs})
              i++
            }
          }
        }
      }.bind(this), 200);
  }

  componentDidMount() {
    if(this.RESET_STATE) { this.props.resetState() }

    this.updateAesthetic()

    this.didFocusSubsription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        console.log("HistoryScreen in focus")
        this.updateAesthetic()
      }
    )
  }

  componentWillUnmount() {
    this.didFocusSubsription.remove()
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("HistoryScreen.componentDidUpdate")
    
    if(typeof prevProps.documents === "undefined") {
      console.log("props undefined")
      return false
    }

    const isNewDocuments = prevProps.documents != this.props.documents
    
    if(isNewDocuments) {
      console.log("props have changed")
      this.updateAesthetic()
      return true
    }

    console.log("props are identical")
    return false
  }

  getArticleReference(id, doc) {
    if(id in this.props.missing) {
      this.setState({
        documents: [...this.state.documents, {...this.props.missing[id], meta: doc}],
      })

      return;
    }

    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT
    
    if(this.DEBUGGING) { console.log("Getting document: " + id) }

    axios.get(url, {} )
      .then(res => {
        const article = res.data.oer_materials

        if(typeof article !== "undefined") {
          this.setState({
            documents: [...this.state.documents, {...article, meta: doc}],
          })
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  document(doc, index) {
    if(this.DEBUGGING) { 
      console.log("rendering document with meta: ")
      console.log(doc.meta)
    }

    console.log(this.props.documents)
    const currentpage = this.props.documents[doc.material_id].currentpage

    const TITLE_LENGTH = 40;

    return (
      <TouchableOpacity onPress={ () => {this.openDocument(doc.material_id)} } 
        style={styles.touchableOpacity} key={index}>
        <Card style={styles.card}>
          <CardItem style={styles.header}>
            <Body>
              <Text style={styles.baseText}>{doc.title.substring(0, TITLE_LENGTH) + "..."}</Text>
              {/* <Text style={styles.baseText}>{doc.provider.provider_name}</Text> */}
            </Body>
            <Right>
              <Text style={styles.baseText}>{"page " + currentpage + " / " + doc.meta.numberofpages}</Text>
            </Right>
          </CardItem>
        </Card>
      </TouchableOpacity>
    )
  }

  render() {
    const { references, documents } = this.state;
    const { user } = this.props

    const isDocuments = documents.length > 0
    const isDocumentsToLoad = Object.keys(this.props.documents).length > 0

    if(user.isPro) {
      // Pro features enabled
      return (
        <>
          <Toolbar
            centerElement="RefMe"
          />
          <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.sectionContainer}>
              <Text style={styles.mainHeaderText}>
                History
              </Text>

              {isDocuments ? (
                <View style={styles.itemsView}>
                {documents.map((document, i) => this.document(document, i))}
               </View>
              ) : (
                <View style={styles.loadingView}>
                   {isDocumentsToLoad ? (
                    <View style={{alignItems: 'center'}}>
                      <LoadingImage width={150} height={150} />
                    </View>
                  ) : (
                    <View style={{alignItems: 'center'}}>
                      <NoDataFoundImage width={150} height={150} />
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </>
      );
    } 
  }

}

HistoryScreen.navigationOptions = {
  title: 'Refs',
  tabBarLabel: 'Refs',
  header: null,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

/* Colors */

// Light mode
const backgroundColor = "#F5F5F6" // For the background
const elevatedColor = "#FFFFFF" // For the cards
const cardOutline = "#00000000" // For hidden borders
const transparent = "#00000000" // For hidden borders
const cardColor = "#2196f3"
const pTextColor = "#EEEEEE"
const h1TextColor = "#000"
const h5TextColor = "#000000"

/* Font Sizes */
const pTextSize = 12
const h5TextSize = 12
const h1TextSize = 21

/* Miscellanous */
const borderRadius = 8;

const styles = StyleSheet.create({
  touchableOpacity: {
    width: `100%`,
    borderRadius: borderRadius,
  },
  card: {
    width: `100%`,
    borderRadius: borderRadius,
    backgroundColor: cardColor,
  },
  upgradeCard: {
    width: `100%`,
    borderRadius: borderRadius,
    paddingBottom: 10,
    marginBottom: 10,
    backgroundColor: cardColor,
    borderColor: '#000'
  },
  header: {
    borderRadius: borderRadius,
    backgroundColor: cardColor,
  },
  baseText: {
    color: '#fff',
    fontSize: pTextSize,
  },
  headerText: {
    color: h1TextColor,
    fontSize: h5TextSize,
    paddingBottom: 10,
  },
  mainHeaderText: {
    color: h1TextColor,
    fontSize: h1TextSize,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: backgroundColor
  },
  sectionContainer: {
    flexGrow: 1,
    padding: 0,
    marginBottom: 20,
  },
  loadingView: {
    width: '100%',
    height: 200,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  bibliographyText: {
    color: '#fff',
    fontSize: 8,
  },
  button: {
    backgroundColor: cardColor,
    borderRadius: borderRadius
  }
});

const mapStateToProps = (state) => ({
    references: state.references.ids,
    documents: state.references.docs,
    missing: state.references.missing,
    user: state.references.user,
})

const mapDispatchToProps = (dispatch) => ({
  addReference: ref => dispatch(referenceAction.addReference(ref)),
  removeReference: ref => dispatch(referenceAction.removeReference(ref)),
  updateDocument: (id, doc) => dispatch(referenceAction.updateDocument(id, doc)),
  resetState: () => dispatch(referenceAction.resetState()),
  enableProFeatures: () => dispatch(referenceAction.enableProFeatures()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HistoryScreen)
