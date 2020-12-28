// Required
import React from 'react';

// Redux
import { connect } from 'react-redux';
import * as referenceAction from '../../actions/referenceAction';

// UI Components
import { Toolbar } from 'react-native-material-ui';
import { Container, Header, Content, Card, CardItem, 
    Body, Text, Icon, Button, Left, Center, Right} from 'native-base';
import { Clipboard, StyleSheet, StatusBar, View, ScrollView,TouchableOpacity } from 'react-native';

// Images
import NoDataFoundImage from "../../assets/images/no-data-found.svg";

// Specific page stylings and constants
import { styles_dict } from './Styles.js'
import { compose } from 'redux';
import { convertISOString, formatDateForHistory } from '../../utils/DateUtils';
const styles = StyleSheet.create(styles_dict)

class HistoryScreen extends React.Component {
	
  constructor(props) {
    super(props)

    this.DEBUGGING = true
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

  historyItem = (item, index) => {

    const TITLE_LENGTH = 40;
    const formatted_date = formatDateForHistory(getDateFromISOString(item.lastmodified))

    return (
      <TouchableOpacity onPress={ () => {this.openDocument(item)} } 
        style={styles.touchableOpacity} key={index}>
        <Card style={styles.card}>
          <CardItem style={styles.header}>
            <Body>
              <Text style={styles.baseText}>{item.title.substring(0, TITLE_LENGTH) + "..."}</Text>
            </Body>
            <Right>
              <Text style={styles.baseText}>{formatted_date}</Text>
              <Text style={styles.baseText}>{"page " + item.currentpage + " / " + item.length}</Text>
            </Right>
          </CardItem>
        </Card>
      </TouchableOpacity>
    )
  }

  render() {
    // History is now stored in Redux - 
    // TODO: Sort these elements by date
    const { history: {byId, allIds} } = this.props

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

            {allIds.length > 0 ? (
              <View style={styles.itemsView}>
              {allIds.map((id, i) => this.historyItem(byId[id], i))}
              </View>
            ) : (
              <View style={{alignItems: 'center'}}>
                <NoDataFoundImage width={150} height={150} />
              </View>
            )}
          </View>
        </ScrollView>
      </>
    );
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

const mapStateToProps = (state) => ({
  // V2.0 Storage items
  citations: state.citations,
  history: state.history,
  // V1.0 Deprecated items
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
