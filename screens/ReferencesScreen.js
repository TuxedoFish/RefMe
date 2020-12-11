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
    this.updateAesthetic = this.updateAesthetic.bind(this)
    this.openDocument = this.openDocument.bind(this)
    this.reference = this.reference.bind(this)

    this.DEBUGGING = true
    this.RESET_STATE = false

    this.upgradeInputRef = React.createRef()

    this.state = {
      references: [],
      loadingRefs: []
    }
  }

  updateAesthetic() {
    this.setState({
      references: [],
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
      }.bind(this), 200);
  }

  openDocument(material_id) {
    console.log("Running...")
    const { articles  } = this.state
    
    this.props.navigation.navigate('Articles', {
      material_id: material_id,
    })
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
    
    if(typeof prevProps.references === "undefined") {
      console.log("props undefined")
      return false
    }

    const isNewReferences = prevProps.references != this.props.references
    
    if(isNewReferences) {
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

        console.log(article)

        if(typeof(this.props.references_meta) !== "undefined") {
          if(id in this.props.references_meta) {
            const meta = this.props.references_meta[id]
            const newArticle = {...article, ...meta}

            console.log("NEW COMBINED")
            console.log(newArticle)
          }
        }

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

  reference(ref, index) {

    if(this.DEBUGGING) { console.log("rendering reference: " + ref) }
    const date = ref.creation_date===null ? ref.retrieved_date : ref.creation_date

    var initials = ref.provider.provider_name.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    if(this.DEBUGGING) { console.log(initials) }

    return (
      <>
        <TouchableOpacity onPress={ () => {this.openDocument(ref.material_id)} } 
          style={styles.touchableOpacity} key={index}>
          <Card style={styles.card}>
            <CardItem style={styles.header}>
              <Body>
                <Text style={styles.baseText}> {(index+1) + ": " + ref.provider.provider_name + ", " + initials + ", " + ref.title + ", " + ref.provider.provider_name + ", " + 
                  date + ". Available from: " + ref.url} 
                </Text>
              </Body>
            </CardItem>
          </Card>
        </TouchableOpacity>
        
      </>
    )
  }

  render() {
    const { references } = this.state;
    const { user } = this.props

    const isReferences = references.length > 0
    const isReferencesToLoad = Object.keys(this.props.references).length > 0

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
                References
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
const backgroundColor = "#F5F5F6" // For the background
const elevatedColor = "#FFFFFF" // For the cards
const cardOutline = "#00000000" // For hidden borders
const transparent = "#00000000" // For hidden borders
const cardColor = "#2196f3"
const pTextColor = "#fff"
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
    color: pTextColor,
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
    color: '#000',
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
    references_meta: state.references.meta,
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
