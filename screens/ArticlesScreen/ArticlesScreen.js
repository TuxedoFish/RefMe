// Required React import
import React from 'react';

// UI Elements
import { StyleSheet, View } from 'react-native';
import { Icon, Button} from 'native-base';
import { Toolbar } from 'react-native-material-ui';

// Axios - For making GET/POST requests
import axios from 'axios';

// Redux for persisting data across sessions
import { connect } from 'react-redux';
import * as referenceAction from '../../actions/referenceAction';
import * as historyAction from '../../actions/history/actions';
import * as citationAction from '../../actions/citation/actions'

// For displaying the PDF 
import Pdf from 'react-native-pdf';

// Configuration for page
import { PAGE_TYPES } from './Constants';
import { styles_dict } from './Styles.js'
const styles = StyleSheet.create(styles_dict)
import { generateCitation } from '../../utils/ReferenceUtils';

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
      meta: {},
      currentpage: 1,
      length: 1
    }
  }

  /*
  From the history, looks for whether there is a current
  history item and if there is then fetches the last page
  it was left on... 
  TODO: Use new history reducer
  */
  getCurrentPage = () => {
    const { params: {id} } = this.state
    const { history: {byId: historyItems} } = this.props
    return id in historyItems ? historyItems[id].currentpage : 1
  }

  /* Check whether the current document already has or not a reference */
  isDocumentCited = () => {
    const { citations } = this.props
    const { params: {id} } = this.state
    return id in citations.allIds
  }

  /*
  toggleReference
    Adds or removes the reference from redux depending on whether
    it already exists.
  */
  toggleReference = () => {

    // TODO: Should check the isReferenced variable directly from redux
    const { params: {id}, meta } = this.state
    const { deleteCitationItem, addCitationItem } = this.props
    const isReferenced = this.isDocumentCited()

    // Makes a call to the relevant redux action
    if(isReferenced) {
      // If there is already a reference then remove it (sync)
      deleteCitationItem(id)
    } else { 
      // if there is no reference then add it (async)
      generateCitation(id, meta, 
        (id, citation) => {
          addCitationItem(id, citation)
        },
        (error) => {
          console.log("Error: failed to generate citation")
          console.log(error)
        })
    }

  }

  /* pushToHistory
    - Take the current state of reading and store it
    - (TODO: Pass into an API to begin recommendation engine)
    - Current page / length of document - To save place
    - Timestamp - To know how to filter / sort history
    - Title, ID, URL - To be able to identify the doc
  */
  pushToHistory = (page) => {
    // Get together the data to add to the history

    // id/url/title/type - The uid of the item (Currently from x5gon) and identifiable information
    // currentpage - The page that the user currently has open
    // lastpage - The length of the PDF
    const { 
      params: {id, url, title, type}, 
      length
    } = this.state
    // lastModified - The timestamp of when the history was updated (as a string)
    // Converted back via parseISO
    const lastmodified = new Date().toISOString();

    // Push to the redux function
    const { pushToHistory: dispatchPushToHistory } = this.props
    dispatchPushToHistory(
      id,
      {
        id: id,
        currentpage: page,
        length : length,
        lastmodified: lastmodified,
        title: title,
        url: url,
        type: type
      }
    )

    // TODO: Pass into recommendation engine API
  }

  goToPage = (page) => {
    this.pdf.setPage(page) 
  }

  // When the PDF loads grab meta data and update history
  onPdfLoaded = (numberOfPages, filePath, extras, toc) => {

    if(this.DEBUGGING) { console.log(`number of pages: ${numberOfPages}`) }
    
    this.setState({ 
      length: numberOfPages,
      meta: extras
    })

    if(this.getCurrentPage() != this.state.currentpage) {
      this.goToPage(this.getCurrentPage())
    }
  }

  // When the page has changed update the history
  onPdfPageChanged = (page, numberOfPages) => {

    if(this.DEBUGGING) { console.log(`current page: ${page}`) }
    this.pushToHistory(page)
    this.setState({ currentpage : page})
  }

  /* changePage - the down and up arrow keys on the side of the PDF viewer */
  changePage = (isNextPage) => {

    const { currentpage, length } = this.state

    const change = isNextPage ? 1 : -1
    const nextPage = currentpage + change

    if(nextPage < length+1 && nextPage > 0) { 
      this.goToPage(nextPage)
    }
  }
  
  render() {

    const { params: {url, id, type, title } } = this.state

    const { references } = this.props
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
          <Button light style={styles.floatingButton} onPress={() => { this.changePage(false) }}>
            <Icon name='arrow-up' />
          </Button>
          <Button light style={styles.floatingButton} onPress={() => { this.changePage(true) }}>
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
  // V2.0 Storage items
  citations: state.citations,
  history: state.history,
  // V1.0 Deprecated items
  references: state.references.ids,
  documents: state.references.docs,
  missing: state.references.missing,
})

const mapDispatchToProps = (dispatch) => ({
  // History actions
  pushToHistory: (id, historyItem) => dispatch(historyAction.pushToHistory(id, historyItem)),
  // Citation actions
  addCitationItem: (id, citationItem) => dispatch(citationAction.addCitationItem(id, citationItem)),
  deleteCitationItem: (id) => dispatch(citationAction.deleteCitationItem(id)),
  // Deprecated actions
  addReference: ref => dispatch(referenceAction.addReference(ref)),
  removeReference: ref => dispatch(referenceAction.removeReference(ref)),
  updateDocument: (id, doc) => dispatch(referenceAction.updateDocument(id, doc)),
  addReferenceMeta: (id, meta) => dispatch(referenceAction.addReferenceMeta(id, meta)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArticlesScreen)
