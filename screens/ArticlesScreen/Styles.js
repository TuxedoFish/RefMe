import { Dimensions, StyleSheet } from "react-native";

export const styles_dict = {
    header: {
      borderRadius: 20,
    },
    footer: {
      borderRadius: 20,
    },
    card: {
      margin: 20,
      borderRadius: 20,
    },
    baseText: {
      color: '#000'
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      textDecorationLine: 'underline' 
    },
    container: {
      flexGrow: 1,
      justifyContent: 'space-between',
      backgroundColor: '#fff',
    },
    centerContainer: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomCard: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    baseText: {
      color: '#000'
    },
    pdf: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
    floatingButtonsContainer: {
      position: 'absolute',
      right: 20,
      bottom: 20,
    },
    floatingButton: {
    }
  }