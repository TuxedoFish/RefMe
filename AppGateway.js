// Required imports
import React, { useState } from 'react';

// UI Components
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

// Redux items
import { connect } from 'react-redux';
import * as referenceAction from './actions/referenceAction';
import * as historyAction from './actions/history/actions';
import * as citationAction from './actions/citation/actions'

// The main navigation container
import AppContainer from './navigation/AppNavigator';
import LoadingOverlay from './components/LoadingOverlay';

// Generation of data from old data
import { generateCitation, generateHistoryItem, 
  generateHistoryItemForAPI} from './utils/ReferenceUtils';
 
class AppGateway extends React.Component {
  
  constructor() {
    super()

    this.state = {
        overlay: {
            visible: true,
            title: `Starting up...`
        },
        loading: {
            loaded: 0,
            total: 0,
            citations: 0,
            history: 0,
            apiMigrations: []
        }
    }
  }

  componentDidMount() {

    // Check whether currently have old references / history
    const { references, documents } = this.props
    
    // Calculating what remains
    const oldReferences = references.length
    const oldHistory = Object.keys(documents).length
    const total = oldReferences + oldHistory
    // Whether to migrate or not
    const isMigrationRequired = total > 0

    // If migrating then setup the initial settings
    if(isMigrationRequired) {

        // Before we migrate we need to be sure the new redux stores are empty
        const { clearCitations, clearHistory } = this.props
        clearCitations()
        clearHistory()

        this.setState({
            loading: {
                loaded: 0,
                total: total,
                citations: oldReferences,
                history: oldHistory
            },
            overlay: {
                visible: true,
                title: "Migrating [Separate Pages] (0%)"
            }
        })

        // Generate the first citation
        const citationIndex = references[0]

        generateCitation(citationIndex, {author: ''}, this.citationReceived, this.citationFailed)
    } else {
        this.migrateToAPI()
        this.runDebugScripts()
    }
  }

  nextMigration = () => {

    // First we want to migrate the citations  
    const { loading: {total, loaded, citations, history}} = this.state
    const { references, documents, resetState } = this.props

    // If the amount loaded is less then the number of citations
    if(loaded < citations-1) {
        // TODO: convert creation date -> modDate format
        const citationIndex = references[loaded+1]

        generateCitation(citationIndex, {author: ''},
            this.citationReceived, this.citationFailed)
    } else if(loaded < total-1) {
        // Now load the history items
        const historyIndex = loaded-citations+1
        const historyId = Object.keys(documents)[historyIndex]
        const oldItem = documents[historyId]

        generateHistoryItem(historyId, {
            currentpage: oldItem.currentpage,
            length: oldItem.numberofpages
        }, this.historyItemReceived, this.historyItemFailed)
    } else {
        // Finished migration
        resetState()
        this.migrateToAPI()
        return
    }

    // Update the visuals
    this.setState({
        loading: {
            total: total,
            citations: citations,
            history: history,
            loaded: loaded+1
        },
        overlay: {
            visible: true,
            title: `Migrating [Separate Pages] (${Math.round((loaded+1) / total * 100)}%)`
        }
    })

  }

  migrateToAPI = () => {

    let isMigrationRequired = false
    let apiMigrations = []
    const { history: {byId: historyItems } } = this.props

    Object.keys(historyItems).map((key, index) => { 

      const item = historyItems[key]
      
      if(!("publisher" in item)) {
        isMigrationRequired = true
        apiMigrations.push(item.id)
      }

    })    

    if(isMigrationRequired) {
      this.setState({
        loading: {
            loaded: 0,
            total: apiMigrations.length,
            apiMigrations: apiMigrations
        },
        overlay: {
            visible: true,
            title: "Migrating [RefMe API] (0%)"
        }
      })

      const historyId = apiMigrations[0]
      const oldItem = historyItems[historyId]

      generateHistoryItemForAPI(historyId, {
        currentpage: oldItem.currentpage,
        length: oldItem.length,
        lastmodified: oldItem.lastmodified
      }, this.historyItemReceivedForAPI, this.historyItemFailedForAPI)
      
    } else {
      setTimeout( () => { this.updateOverlay(false, 'None') }, 500)
    }
  }

  nextAPIMigration = () => {
    const { loading: { total, loaded, apiMigrations } } = this.state
    const { history: { byId: historyItems } } = this.props

    if(loaded < total - 1) {
      const historyId = apiMigrations[loaded + 1]
      const oldItem = historyItems[historyId]

      generateHistoryItemForAPI(historyId, {
        currentpage: oldItem.currentpage,
        length: oldItem.length,
        lastmodified: oldItem.lastmodified
      }, this.historyItemReceivedForAPI, this.historyItemFailedForAPI)
    } else {
      setTimeout( () => { this.updateOverlay(false, 'None') }, 500)
    }

    // Update the visuals
    this.setState({
      loading: {
          loaded: loaded + 1,
          total: apiMigrations.length,
          apiMigrations: apiMigrations
      },
      overlay: {
          visible: true,
          title: `Migrating [RefMe API] (${Math.round((loaded + 1) / total * 100)}%)`
      }
    })

  }

  historyItemReceivedForAPI = (id, historyItem) => {

    // Add the loaded history item to the redux store
    const { pushToHistory } = this.props
    pushToHistory(id, historyItem)

    // Generate the next item
    this.nextAPIMigration()
  }

  historyItemFailedForAPI = (error) => {
    console.log(`Failed to generate history updating to API: ${error}`)
  }

  citationReceived = (id, citation) => {

    // Add the loaded citation to the redux store
    const { addCitationItem } = this.props
    addCitationItem(id, citation)

    // Generate the next item
    this.nextMigration()
  }

  runDebugScripts = () => { 
    const { clearCitations, clearHistory, history: { byId: historyItems } } = this.props
    const SHOULD_CLEAR = false
    const SHOULD_PRINT_HISTORY = false

    if(SHOULD_CLEAR) { 
      clearHistory()
      clearCitations()
    }

    if(SHOULD_PRINT_HISTORY) {
      console.log("HISTORY:")
      console.log(historyItems)
    }
  }

  citationFailed = (error) => {
    console.log(`Failed to generate citation: ${error}`)
  }

  historyItemReceived = (id, historyItem) => {

    // Add the loaded history item to the redux store
    const { pushToHistory } = this.props
    pushToHistory(id, historyItem)

    // Generate the next item
    this.nextMigration()
  }

  historyItemFailed = (error) => {
    console.log(`Failed to generate citation: ${error}`)
  }

  updateOverlay = (isVisible, title) => {
    this.setState({
      overlay: {
        visible: isVisible,
        title: title
      }
    })
  }

  render() {

    const { overlay: {visible: isOverlayVisible, title: overlayTitle} } = this.state

    if(!isOverlayVisible) {
        return (
            <>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <AppContainer />
            </>
        );
    } else {
        return (
            <>
                <LoadingOverlay visible={isOverlayVisible} title={overlayTitle} />
            </>
        )
    }
  }

}

const mapStateToProps = (state) => ({
  // V2.0 Storage items
  citations: state.citations,
  history: state.history,
  // V1.0 Deprecated items
  references: state.references.ids,
  documents: state.references.docs,
  missing: state.references.missing,
  meta: state.references.meta
})

const mapDispatchToProps = (dispatch) => ({
  // History actions
  pushToHistory: (id, historyItem) => dispatch(historyAction.pushToHistory(id, historyItem)),
  clearHistory: () => dispatch(historyAction.clearHistory()),
  // Citation actions
  addCitationItem: (id, citationItem) => dispatch(citationAction.addCitationItem(id, citationItem)),
  clearCitations: () => dispatch(citationAction.clearCitations()),
  // Deprecated actions
  addReference: ref => dispatch(referenceAction.addReference(ref)),
  removeReference: ref => dispatch(referenceAction.removeReference(ref)),
  updateDocument: (id, doc) => dispatch(referenceAction.updateDocument(id, doc)),
  addReferenceMeta: (id, meta) => dispatch(referenceAction.addReferenceMeta(id, meta)),
  resetState: () => dispatch(referenceAction.resetState()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppGateway)