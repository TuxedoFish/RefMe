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
import { generateCitation, generateHistoryItem } from './utils/ReferenceUtils';
 
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
            history: 0
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
                title: "Migrating (0%)"
            }
        })

        // Generate the first citation
        const citationIndex = references[0]

        generateCitation(citationIndex, {author: ''}, this.citationReceived, this.citationFailed)
    } else {
        this.runDebugScripts()
        setTimeout( () => { this.updateOverlay(false, 'None') }, 500)
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
        this.updateOverlay(false, 'None')
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
            title: `Migrating (${Math.round((loaded+1) / total * 100)}%)`
        }
    })

  }

  citationReceived = (id, citation) => {

    // Add the loaded citation to the redux store
    const { addCitationItem } = this.props
    addCitationItem(id, citation)

    // Generate the next item
    this.nextMigration()
  }

  runDebugScripts = () => { 
    const { clearCitations, clearHistory } = this.props
    const SHOULD_CLEAR = true
    if(SHOULD_CLEAR) { 
      clearHistory()
      clearCitations()
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