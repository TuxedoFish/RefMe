// Required React import
import React from 'react';

// UI Elements
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Card, Text } from 'native-base';

// Configuration for page
import { styles_dict } from './Styles.js'
const styles = StyleSheet.create(styles_dict)

export default class LoadingOverlay extends React.Component {
    constructor() {
        super()
    }

    render() {

        const { visible, title } = this.props

        if(visible) {
            return (
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <Text style={styles.text}>{title}</Text>
                        <ActivityIndicator size="large" color="#FFF" />
                    </Card>
                </View>
            );
        } else {
            return <></>;
        }

    }

}