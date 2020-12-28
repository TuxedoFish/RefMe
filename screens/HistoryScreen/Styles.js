import { StyleSheet } from "react-native";

/* Colors */

// Light mode
const backgroundColor = "#F5F5F6" // For the background
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

export const styles_dict = {
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
}