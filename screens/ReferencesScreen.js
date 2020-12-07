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

class ReferencesScreen extends React.Component {
	
  constructor(props) {
    super(props)
    
    this.writeToClipboard=this.writeToClipboard.bind(this)
    this.getReferenceObject=this.getReferenceObject.bind(this)
    this.getArticleReference=this.getArticleReference.bind(this)
    this.updateAesthetic = this.updateAesthetic.bind(this)
    this.showDialog = this.showDialog.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleUpgrade = this.handleUpgrade.bind(this)
    this.openDocument = this.openDocument.bind(this)
    this.reference = this.reference.bind(this)
    this.document = this.document.bind(this)

    this.DEBUGGING = true
    this.RESET_STATE = false

    this.upgradeInputRef = React.createRef()

    this.state = {
      references: [],
      documents: [],
      dialogVisible: false,
      loadingDocs: [],
      loadingRefs: []
    }
  }
 
  showDialog() {
    this.setState({ dialogVisible: true });
  }
 
  handleCancel() {
    this.setState({ dialogVisible: false });
  }
 
  handleUpgrade() {
    console.log("reference object")
    
    const code = this.upgradeInputRef.current._lastNativeText

    if(code==="X6H98LA") {
      console.log("ENABLED PRO")
      this.props.enableProFeatures()
    }

    this.setState({ dialogVisible: false });
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
      references: [],
      documents: [],
      loadingDocs: [],
      loadingRefs: []
    })

    setTimeout(
      function() {
        this.props.references.map( (id) => {
          const { loadingRefs } = this.state

          if(!loadingRefs.includes(id)) {
            this.getReferenceObject(id)    
            loadingRefs.push(id)
            this.setState({loadingRefs: loadingRefs})
          }
        })

        if(this.DEBUGGING) {
          console.log("Finding documents: ")
          console.log(this.props.documents)
        }

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
        console.log("ReferencesScreen in focus")
        this.updateAesthetic()
      }
    )
  }

  componentWillUnmount() {
    this.didFocusSubsription.remove()
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("ReferencesScreen.componentDidUpdate")
    
    if(typeof prevProps.documents === "undefined" ||
      typeof prevProps.references === "undefined") {
      console.log("props undefined")
      return false
    }

    const isNewDocuments = prevProps.documents != this.props.documents
    const isNewReferences = prevProps.references != this.props.references
    
    if(isNewReferences || isNewDocuments) {
      console.log("props have changed")
      this.updateAesthetic()
      return true
    }

    console.log("props are identical")
    return false
  }

  getReferenceObject(id) {
    if(id in this.props.missing) {
      this.setState({
        references: [...this.state.references, this.props.missing[id]],
      })

      return;
    }

    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT

    if(this.DEBUGGING) { console.log("Getting reference: " + id) }
    
    axios.get(url, {} )
      .then(res => {
        const article = res.data.oer_materials

        if(typeof article !== "undefined") {
          this.setState({
            references: [...this.state.references, article],
          })
        }
      })
      .catch(error => {
        console.log(error);
      })
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

  reference(ref, index) {
    if(this.DEBUGGING) { console.log("rendering reference: " + ref) }
    const date = ref.creation_date===null ? ref.retrieved_date : ref.creation_date

    var initials = ref.provider.provider_name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    if(this.DEBUGGING) { console.log(initials) }

    return (
      <>
        <Text style={styles.baseText}> {(index+1) + ": " + ref.provider.provider_name + ", " + initials + ", " + ref.title + ", " + ref.provider.provider_name + ", " + 
          date + ". Available from: " + ref.url} </Text>
        <Text> </Text>
      </>
    )
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

    const isReferences = references.length > 0
    const isDocuments = documents.length > 0

    const isDocumentsToLoad = Object.keys(this.props.documents).length > 0
    const isReferencesToLoad = Object.keys(this.props.references).length > 0

    if(user.isPro) {
      // Pro features enabled
      return (
        <>
          <Toolbar
            centerElement="MyRefs"
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

            <View style={styles.sectionContainer}>
              <Text style={styles.mainHeaderText}>
                Bibliography
              </Text>

              {isReferences ? (
                <View style={styles.itemsView}>
                 {references.map((reference, i) => this.reference(reference, i))}
                </View>
              ) : (
                <View style={styles.loadingView}>
                   {isReferencesToLoad ? (
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
            
            <Button
              style={styles.button}
              onPress={this.writeToClipboard}
            >
              <Text>Write To Clipboard</Text>
            </Button>
          </ScrollView>
        </>
      );
    } else {
      // Pro features not enabled
    	return (
        <>
          <Toolbar
            centerElement="MyRefs"
          />
          <ScrollView contentContainerStyle={styles.container}>
            <Dialog.Container visible={this.state.dialogVisible}>
              <Dialog.Title>Upgrade To Pro For Free</Dialog.Title>
              <Dialog.Description>
                We wanted to test the demand for this app. So to upgrade get in 
                touch with Harry Liversedge or Nogg Harris and we will give you
                the code for free
              </Dialog.Description>
              <Dialog.Input label="Enter code" textInputRef={this.upgradeInputRef}/>
              <Dialog.Button label="Cancel" onPress={this.handleCancel} />
              <Dialog.Button label="Upgrade" onPress={this.handleUpgrade} />
            </Dialog.Container>
            <TouchableOpacity onPress={this.showDialog} >
              <Card style={styles.upgradeCard}>
                <CardItem style={{...styles.header, backgroundColor : "#686de0"}}>
                  <Body>
                    <Text style={styles.headerText}>Enable Pro</Text>
                    <Text style={styles.baseText}>*Gain access to a bibliography</Text>
                    <Text style={styles.baseText}>*View your history</Text>
                    <Text style={styles.baseText}>*Never lose your page</Text>
                  </Body>
                </CardItem>
              </Card>
            </TouchableOpacity>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.headerText}>
                Recent Articles
              </Text>
              <Text note style={{ paddingBottom : 10 }} >Pro feature</Text>

              {isDocuments ? (
                <View style={styles.itemsView}>
                  {this.document(documents[0], 0)}
                  <View style={styles.loadingView}>
                    <Text style={{...styles.headerText, paddingTop: 20}}>Upgrade to see more</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.headerText}>
                Your bibliography
              </Text>
              <Text note>Pro feature</Text>
            </View>
          </ScrollView>
        </>
    	);
    }
  }

	async writeToClipboard(){
	  const { references } = this.state;
	  var content = []
    console.log("Outputting to clipboard")

	  references.map((ref, index) => {
      const date = ref.creation_date===null ? ref.retrieved_date : ref.creation_date

      var initials = ref.provider.provider_name.match(/\b\w/g) || [];
      initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
      
	  	content.push((index+1) + ": " + ref.provider.provider_name + ", " + initials + ", " + ref.title + ", " + ref.provider.provider_name + ", " + 
                  date + ". Available from: " + ref.url)
	  })
	  await Clipboard.setString(content.join(', '));
	}

}

ReferencesScreen.navigationOptions = {
  title: 'Refs',
  tabBarLabel: 'Refs',
  header: null,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

/* Colors */

// Light mode
const backgroundColor = "#FFFFFF" // For the background
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
)(ReferencesScreen)
