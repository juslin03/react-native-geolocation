import React, {Component} from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  ToastAndroid,
  View,
  Image,
  StatusBar
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export default class App extends Component {
  watchId = null;

  state = {
    loading: false,
    updatesEnabled: false,
    location: {},
  };

  hasLocationPermission = async () => {
    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  };

  getLocation = async () => {
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) return;

    this.setState({loading: true}, () => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({location: position, loading: false});
          console.log(position);
        },
        error => {
          this.setState({location: error, loading: false});
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 50,
          forceRequestLocation: true,
        },
      );
    });
  };

  getLocationUpdates = async () => {
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) return;

    this.setState({updatesEnabled: true}, () => {
      this.watchId = Geolocation.watchPosition(
        position => {
          this.setState({location: position});
          console.log(position);
        },
        error => {
          this.setState({location: error});
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 5000,
          fastestInterval: 2000,
        },
      );
    });
  };

  removeLocationUpdates = () => {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.setState({updatesEnabled: false});
    }
  };

  render() {
    const {loading, location, updatesEnabled} = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="blue" barStyle="light-content" />
        <Image style={styles.image} source={require('./misterjuslin.png')} />
        <TouchableOpacity
          style={styles.buttonTouch}
          onPress={this.getLocation}
          disabled={loading || updatesEnabled}>
          <Text style={styles.sectionTitle}>Trouver ma position</Text>
        </TouchableOpacity>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.buttonthenFisrt}
            onPress={this.getLocationUpdates}
            disabled={updatesEnabled}>
            <Text style={styles.buttonthenText}>Commencer à observer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonthenSecond}
            onPress={this.removeLocationUpdates}
            disabled={!updatesEnabled}>
            <Text style={styles.buttonthenText}>Arrêter d'observer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.result}>
          <Text style={styles.infoText}>Informations sur votre position</Text>
          <Text>{JSON.stringify(location, null, 4)}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: 120, 
    height: 120,
    marginBottom: 20,
    borderRadius: 7
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 12,
  },
  result: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#3578e5',
    width: '100%',
    paddingHorizontal: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  buttonthenFisrt: {
    marginHorizontal: 10,
    backgroundColor: '#02b875',
    padding: 10,
    borderRadius: 5,
  },
  buttonthenSecond: {
    marginHorizontal: 10,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonthenText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontWeight: '600',
  },
  buttonTouch: {
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#3578e5',
    padding: 5,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 25,
    padding: 10,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  infoText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#17a2b8',
    textDecorationLine: 'underline'
  }
});
