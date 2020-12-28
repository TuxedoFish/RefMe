import { StyleSheet } from "react-native";

/* Colors */
const transparent = "#00000000" // For hidden borders
// Dark mode
// const backgroundColor = "#121212" // For the background
// const elevatedColor = "#323232" // For the cards
// const cardOutline = "#00000000" // For hidden borders
const pTextColor = "#EEEEEE"
const h1TextColor = "#FFFFFF"
// const h5TextColor = "#a1a1a1"

// Light mode
const backgroundColor = "#F5F5F6" // For the background
const elevatedColor = "#FFFFFF" // For the cards
const cardOutline = "#00000000" // For hidden borders
// const pTextColor = "#666666"
// const h1TextColor = "#0068aa"
const h5TextColor = "#000000"
const cardColor = "#2196f3"

/* Font Sizes */
const pTextSize = 12
const h5TextSize = 16
const h1TextSize = 21

/* Miscellanous */
const borderRadius = 8;

// borders - 2
// header font size: 24
// p font size: 12
// backgound color - 
export const styles_dict = {
  footer: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: transparent
  },
  card: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: cardOutline
  },
  header: {
    borderRadius: borderRadius,
    backgroundColor: elevatedColor,
    borderColor: transparent
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: backgroundColor,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    color: pTextColor,
    fontSize: pTextSize
  },
  header5Text: {
    color: h5TextColor,
    fontSize: h1TextSize,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  header1Text: {
    color: h1TextColor,
    fontSize: h1TextSize,
    fontWeight: "bold"
  },
  button: {
    backgroundColor: cardColor,
    borderRadius: borderRadius
  }
};
