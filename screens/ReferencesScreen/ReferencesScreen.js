// Required import
import React from 'react';

// Redux items
import { connect } from 'react-redux';
import * as referenceAction from '../../actions/referenceAction';

// UI Components
import { Container, Header, Content, Card, CardItem, 
  Body, Text, Icon, Button, Left, Center, Right} from 'native-base';
import { Toolbar } from 'react-native-material-ui';
import Dialog from "react-native-dialog";
import { Clipboard, StyleSheet, StatusBar, View, ScrollView,TouchableOpacity } from 'react-native';

// Images for different situations
import NoDataFoundImage from "../../assets/images/no-data-found.svg";

// Specific page stylings & constants
import { styles_dict } from './Styles.js'
const styles = StyleSheet.create(styles_dict)
import { CITATION_STYLES } from './Constants';
import { generateTextForCitation } from '../../utils/ReferenceUtils';

class ReferencesScreen extends React.Component {
	
  constructor(props) {
    super(props)

    this.DEBUGGING = false

    this.state = {
      citationStyle: CITATION_STYLES.UNDEFINED,
    }

    this.upgradeInputRef = React.createRef()
  }

  openDocument(item) {
    
    const { id, url, title, type } = item
    
    this.props.navigation.navigate('Articles', {
      id: id,
      url: url,
      title: title,
      type: type
    })
  }

  reference(citation, index) {

    const { citationStyle } = this.state

    return (
      <>
        <TouchableOpacity onPress={ () => {this.openDocument(citation)} } 
          style={styles.touchableOpacity} key={index}>
          <Card style={styles.card}>
            <CardItem style={styles.header}>
              <Body>
                <Text style={styles.baseText}> 
                  {generateTextForCitation(citation, index, citationStyle)}
                </Text>
              </Body>
            </CardItem>
          </Card>
        </TouchableOpacity>
        
      </>
    )
  }

  render() {

    // Citations are stored entirerly in Redux now
    const { citations } = this.props;

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

            {citations.length > 0 ? (
              <View style={styles.itemsView}>
                {citations.map((reference, i) => this.reference(reference, i))}
              </View>
            ) : (
              <View style={{alignItems: 'center'}}>
                <NoDataFoundImage width={150} height={150} />
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

  // TODO: Update this and introduce sharing functionality
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

const mapStateToProps = (state) => ({
  // V2.0 Storage items
  citations: state.citations,
  history: state.history,
  // V1.0 Deprecated items
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
