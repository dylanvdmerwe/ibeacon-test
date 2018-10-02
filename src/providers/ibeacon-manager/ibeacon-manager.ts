import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events, Platform } from 'ionic-angular';

declare let cordova: any;

@Injectable()
export class IBeaconManager {

  private beacons: any[] = [];
  private httpEndpoint: string = 'https://ibeacon-test.free.beeceptor.com'; // put your own endpoint here

  constructor(private platform: Platform, private ev: Events, private http: HttpClient) {

  }

  async setup() {

    if (this.platform.is('cordova')) {
      await this.platform.ready();

      // create beacons
      this.beacons.push(this.createBeacon('699ebc80-e1f3-11e3-9a0f-0cf3ee3bc012', 'beacon-1', 6, 50201));
      this.beacons.push(this.createBeacon('699ebc80-e1f3-11e3-9a0f-0cf3ee3bc012', 'beacon-2', 6, 50098));

      // hook up events
      this.hookUpEvents();

      cordova.plugins.locationManager.requestAlwaysAuthorization();
    }
  }

  startMonitoring() {
    if (!this.platform.is('cordova'))
      return;

    // start monitoring the beacons
    for (let b of this.beacons) {
      cordova.plugins.locationManager.startMonitoringForRegion(b)
        .fail((e) => { console.error(e); })
        .done(() => { console.log('Native layer received the request to monitor :: ' + b.identifier + ',' + b.major + ',' + b.minor) });
    }


  }

  stopMonitoring() {
    if (!this.platform.is('cordova'))
      return;

    // stop monitoring beacons
    for (let b of this.beacons) {
      cordova.plugins.locationManager.stopMonitoringForRegion(b)
        .fail((e) => { console.error(e); })
        .done(() => console.log('Native layer stop monitoring :: ' + b.identifier + ',' + b.major + ',' + b.minor));
    }
  }

  private hookUpEvents(): void {

    // create a new delegate and register it with the native layer
    const delegate = new cordova.plugins.locationManager.Delegate();

    //Subscribe to some of the delegate's event handlers
    delegate.didStartMonitoringForRegion = (pluginResult) => {
      console.log('didStartMonitoringForRegion:', pluginResult);
    };

    delegate.didDetermineStateForRegion = (pluginResult) => {
      if (pluginResult.state === 'CLRegionStateInside') {
        // log to an http endpoint
        if (this.httpEndpoint) {
          this.sendHttpMessage(BeaconEvent.entry, pluginResult.region);
        }

        // publish event to anyone else listening
        this.ev.publish('onBeaconEnter', pluginResult.region);
      }
      else if (pluginResult.state === 'CLRegionStateOutside') {
        // log to an http endpoint
        if (this.httpEndpoint) {
          this.sendHttpMessage(BeaconEvent.exit, pluginResult.region);
        }

        // publish event to anyone else listening
        this.ev.publish('onBeaconExit', pluginResult.region);
      }
    };

    delegate.didRangeBeaconsInRegion = (pluginResult) => {
      console.log('didRangeBeaconsInRegion:', pluginResult);
    };

    cordova.plugins.locationManager.setDelegate(delegate);
  }

  private createBeacon(uuid: string, name: string, major: number, minor: number) {
    let beaconRegion = new cordova.plugins.locationManager.BeaconRegion(name, uuid, major, minor);

    return beaconRegion;
  }

  private sendHttpMessage(state: BeaconEvent, beacon: IBeaconState) {
    const body: HttpPostMessage = {
      uuid: beacon.uuid,
      identifier: beacon.identifier,
      major: beacon.major,
      minor: beacon.minor,
      state: state
    };

    const httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    this.http.post(this.httpEndpoint, body, { headers: httpHeaders }).subscribe(_ => { }, err => console.error(err));
  }

}

interface HttpPostMessage {
  uuid: string;
  identifier: string;
  major: number;
  minor: number;
  state: BeaconEvent;
}

enum BeaconEvent {
  entry,
  exit
}

export interface IBeaconState {
  uuid: string;
  identifier: string;
  major: number;
  minor: number;
}