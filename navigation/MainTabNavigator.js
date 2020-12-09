import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import DocumentsScreen from '../screens/DocumentsScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import ReferencesScreen from '../screens/ReferencesScreen';
import HistoryScreen from '../screens/HistoryScreen';

const config = Platform.select({
  web: {},
  default: {},
});

const DocumentsStack = createStackNavigator(
  {
    Docs: DocumentsScreen,
    Articles: ArticlesScreen
  },
  config
);

DocumentsStack.navigationOptions = {
  tabBarLabel: 'Resources',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios' ? `ios-paper` : 'md-paper'
      }
    />
  ),
};

DocumentsStack.path = '';

const ReferencesStack = createStackNavigator(
  {
    Refs: ReferencesScreen,
  },
  config
);

ReferencesStack.navigationOptions = {
  tabBarLabel: 'References',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-list-box' : 'md-list-box'} />
  ),
};

const HistoryStack = createStackNavigator(
  {
    Refs: HistoryScreen
  },
  config
);

ReferencesStack.path = '';

HistoryStack.navigationOptions = {
  tabBarLabel: 'History',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-folder-open' : 'md-folder-open'} />
  ),
};

HistoryStack.path = '';

const tabNavigator = createBottomTabNavigator(
  {
    DocumentsStack: {screen: DocumentsStack},
    ReferencesStack: {screen: ReferencesStack},
    HistoryStack: {screen: HistoryStack}
  },
  {
    tabBarOptions: {
      activeTintColor: '#fff',
      activeBackgroundColor: '#2196f3',
      inactiveTintColor: '#fff',
      inactiveBackgroundColor: '#2196f3',
    }
  }
);

tabNavigator.path = '';

export default tabNavigator;