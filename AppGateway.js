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

class AppGateway extends React.Component {
  
  constructor() {
    super()

    this.state = {
        overlay: {
            visible: true,
            title: `Starting up...`
        },
        loading: {
            total: 0,
            citations: 0,
            history: 0
        }
    }
  }

  componentDidMount() {

    // NUKE THE NEW CITATIONS + HISTORY (LOCALLY)

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
    } else {
        setTimeout( () => { this.updateOverlay(false, 'None') }, 500)
    }
  }

  nextMigration() {

    // First migrate the citations  
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
    console.log(isOverlayVisible)

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
)(AppGateway)