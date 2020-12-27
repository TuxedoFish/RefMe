// Required React import
import React from 'react';

// UI Elements
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Icon, Button} from 'native-base';
import { Toolbar } from 'react-native-material-ui';

// Axios - For making GET/POST requests
import axios from 'axios';

// Redux for persisting data across sessions
import { connect } from 'react-redux';
import * as referenceAction from '../actions/referenceAction';
import * as historyAction from '../actions/history/actions';

// For displaying the PDF 
import Pdf from 'react-native-pdf';

// Configuration for page
import { PAGE_TYPES } from './ArticleScreen/Constants';
import { styles } from './ArticleScreen/Styles'
import { Directions } from 'react-native-gesture-handler';

class ArticlesScreen extends React.Component {

  constructor(props) {
  	super(props)

    // TODO: Define this in redux
    this.DEBUGGING = false

    // Set the title bar to loading until pdf is loaded in
    this.props.navigation.setParams({ title: "Loading..."})
    // Get the details about the article navigating to
    // const id = this.props.navigation.getParam('material_id', {})
    const { navigation } = this.props
    const id = navigation.getParam('id', "err")
    const url = navigation.getParam('url', "err")
    const title = navigation.getParam('title', "Error: Title undefined")
    const type = navigation.getParam('type', PAGE_TYPES.UNDEFINED)

    // Assign the top navigation bar the title of the article
    navigation.setParams({ article_title: title })

    // Initial state defining the class
    this.state = {
      params: {
        id: id,
        url: url,
        title: title,
        type: type
      },
      metadata: {},
      currentpage: currentPage,
      length: 1,
      isReferenced: this.props.references.includes(id+"")
    }
  }

  /*
  From the history, looks for whether there is a current
  history item and if there is then fetches the last page
  it was left on... 
  TODO: Use new history reducer
  */
  getCurrentPage() {
    const { params: {id} } = this.state
    const { documents } = this.props
    return id in documents ? documents[id].currentpage : 1
  }

  /*
  toggleReference
    Adds or removes the reference from redux depending on whether
    it already exists.
  */
  toggleReference() {
    // DEBUGGING
    if(this.DEBUGGING) { console.log("toggling reference") }

    // TODO: Should check the isReferenced variable directly from redux
    const { id, isReferenced } = this.state
    const { removeReference, addReference }

    // Makes a call to the relevant redux action
    if(isReferenced) {
      removeReference(id)  
    } else { 
      addReference(id)
    }
    
    // Updates the local state of the component
    this.setState({ isReferenced : !this.state.isReferenced })
    
    // DEBUGGING
    if(this.DEBUGGING) { 
      console.log("References:") 
      console.log(this.props.references) 
    }
  }

  /* pushToHistory
    - Take the current state of reading and store it
    - (TODO: Pass into an API to begin recommendation engine)
    - Current page / length of document - To save place
    - Timestamp - To know how to filter / sort history
    - Title, ID, URL - To be able to identify the doc
  */
  pushToHistory = () => {
    // Get together the data to add to the history

    // id - The uid of the item (Currently from x5gon)
    // currentpage - The page that the user currently has open
    // lastpage - The length of the PDF
    const { 
      id, 
      currentpage, 
      length
    } = this.state
    // lastModified - The timestamp of when the history was updated (as a string)
    // Converted back via parseISO
    const lastmodified = new Date().toISOString();

    // Push to the redux function
    const { pushToHistory } = this.props
    pushToHistory(
      id,
      {
        id: id,
        currentpage: currentpage,
        length : length,
        lastmodified: lastmodified,
      }
    )

    // TODO: Pass into recommendation engine API
  }

  // When the PDF loads grab meta data and update history
  onPdfLoaded = (numberOfPages, filePath, extras, toc) => {

    if(this.DEBUGGING) { console.log(`number of pages: ${numberOfPages}`) }
    
    this.props.addReferenceMeta(id, extras)
    
    this.setState({ 
      length : numberOfPages,
      metadata: extras
    })

    // Fetch history and set current page
    var currentPage = this.getCurrentPage()
    this.pdf.setPage(startPage) 
  }

  // When the page has changed update the history
  onPdfPageChanged = (page, numberOfPages) => {

    if(this.DEBUGGING) { console.log(`current page: ${page}`) }
    this.pushToHistory()
    this.setState({ currentpage : page})
  }

  /* changePage - the down and up arrow keys on the side of the PDF viewer */
  changePage = (isNextPage) => {

    const { currentPage, length } = this.state

    const nextPage = currentPage + (isNextPage * 1);

    if(nextPage < length-1 && nextPage > 0) { 
      this.pdf.setPage(nextPage) 
      this.setState({ currentpage: nextPage})
    }
  }
  
  render() {

    const { currentpage, length, 
      params: {url, id, type, title } } = this.state

    const { references, documents } = this.props
    const isReferenced = references.includes(id+"")

    // Formatting for react-native-pdf
    const source = { uri:url, cache:true }

    return (
      <>
        <Toolbar
          centerElement={title}
          rightElement={{
            menu: {
              icon: "more-vert",
              labels: [isReferenced ? "Remove from Bibliography" : "Save To Bibliography"]
            }
          }}
          onRightElementPress={ (label) => {
            switch(label.index) {
              case 0:
              this.toggleReference()
              break;

              default:
              console.log("Unknown action: " + label.index)
            }
          }}
        />
        <Pdf
          ref={(pdf) => { this.pdf = pdf; }}
          source={source}
          onLoadComplete={this.onPdfLoaded}
          onPageChanged={this.onPdfPageChanged}
          onError={(error)=>{ console.log(error) }}
          onPressLink={(uri)=>{ console.log(`Link pressed: ${uri}`) }}
          style={styles.pdf}/>
        <View style={styles.floatingButtonsContainer}>
          <Button light style={styles.floatingButton} onPress={this.changePage(false)}>
            <Icon name='arrow-up' />
          </Button>
          <Button light style={styles.floatingButton} onPress={this.changePage(true)} >
            <Icon name='arrow-down' />
          </Button>
        </View>
      </>
    )
  }
}

ArticlesScreen.navigationOptions = {
  header: null,
}

const mapStateToProps = (state) => ({
  references: state.references.ids,
  documents: state.references.docs,
  missing: state.references.missing,
})

const mapDispatchToProps = (dispatch) => ({
  pushToHistory: (uid, historyItem) => dispatch(historyAction.pushToHistory(uid, historyItem)),

  addReference: ref => dispatch(referenceAction.addReference(ref)),
  removeReference: ref => dispatch(referenceAction.removeReference(ref)),
  updateDocument: (id, doc) => dispatch(referenceAction.updateDocument(id, doc)),
  addReferenceMeta: (id, meta) => dispatch(referenceAction.addReferenceMeta(id, meta)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArticlesScreen)
