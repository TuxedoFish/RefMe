// Required React import
import React from 'react';

// UI Elements
import { StyleSheet, View } from 'react-native';
import { Icon, Button} from 'native-base';
import { Toolbar } from 'react-native-material-ui';
import LoadingOverlay from '../../components/LoadingOverlay'

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

// Helper for object comparisons
import _ from 'lodash'

class ArticlesScreen extends React.Component {

  constructor(props) {
  	super(props)

    // TODO: Define this in redux
    this.DEBUGGING = false

    // Get the details about the article navigating to
    const params = this.getPassedInParams()

    // Initial state defining the class
    this.state = {
      params: params,
      overlay: {
        visible: false,
        title: "Err"
      },
      currentpage: 1,
      length: 1
    }
  }

  getPassedInParams = () => {
    // Get the passed in parameters 
    const { navigation } = this.props
    let params = navigation.getParam('article', {})
    const type = navigation.getParam('type', PAGE_TYPES.UNDEFINED)
    // Also assign the top bar
    navigation.setParams({ article_title: params.title })
    return {...params, type: type}
  }

  /* For when the screen is opened to display a different doc */
  componentDidUpdate(prevProps, prevState) {
    // Checks if the component is being reloaded for a new document
    const oldParams = prevProps.navigation.getParam('article', {})
    const newParams = this.props.navigation.getParam('article', {})

    // If it is then update the state
    if(!_.isEqual(oldParams, newParams)) { 
      const params = this.getPassedInParams()
      this.setState({ params: params }) 
    }
  }

  /*
  From the history, looks for whether there is a current
  history item and if there is then fetches the last page
  it was left on... 
  TODO: Use new history reducer
  */
  getCurrentPage = () => {
    const { params: { id } } = this.state
    const { history: { byId: historyItems } } = this.props
    return id in historyItems ? historyItems[id].currentpage : 1
  }

  /* Check whether the current document already has or not a reference */
  isDocumentCited = () => {
    const { citations: { allIds } } = this.props
    const { params: { id } } = this.state
    return allIds.includes(id)
  }

  /*
  toggleReference
    Adds or removes the reference from redux depending on whether
    it already exists.
  */
  toggleReference = () => {

    // TODO: Should check the isReferenced variable directly from redux
    const { params } = this.state
    const { deleteCitationItem, addCitationItem } = this.props
    const isReferenced = this.isDocumentCited()

    // Makes a call to the relevant redux action
    if(isReferenced) {
      // If there is already a reference then remove it (sync)
      deleteCitationItem(params.id)
    } else { 
      // If there is no reference then add it (async)
      let citation = params
      citation['accessed_date'] = new Date().toISOString();
      // Add the accessed date to the params
      addCitationItem(citation.id, citation)

      // Now we set the state to loading...
      this.updateOverlay(true, "Generating Citation...")
      window.setTimeout(() => { 
        this.updateOverlay(false, "None")
      }, 500)
    }

  }

  updateOverlay = (isVisible, title) => {
    this.setState({
      overlay: {
        visible: isVisible,
        title: title
      }
    })
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
  onPdfLoaded = (numberOfPages) => {

    if(this.DEBUGGING) { console.log(`number of pages: ${numberOfPages}`) }
    
    this.setState({ 
      length: numberOfPages
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

    const { params: {url, id, type, title },
      overlay: {visible: isOverlayVisible, title: overlayTitle} } = this.state

    const isReferenced = this.isDocumentCited()

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

        <LoadingOverlay visible={isOverlayVisible} title={overlayTitle} />
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
