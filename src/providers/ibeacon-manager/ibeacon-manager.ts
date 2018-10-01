import { Injectable } from '@angular/core';
import { Events, Platform } from 'ionic-angular';
declare let cordova: any;

@Injectable()
export class IBeaconManager {

  private beacons: any[] = [];

  constructor(private platform: Platform, private ev: Events) {

  }

  async setup() {
    await this.platform.ready();

    // create beacons
    this.beacons.push(this.createBeacon('699ebc80-e1f3-11e3-9a0f-0cf3ee3bc012', 'beacon-1', 6, 50201));
    this.beacons.push(this.createBeacon('699ebc80-e1f3-11e3-9a0f-0cf3ee3bc012', 'beacon-2', 6, 50098));

    // hook up events
    this.hookUpEvents();

    cordova.plugins.locationManager.requestAlwaysAuthorization();
  }

  startMonitoring() {
    // start monitoring the beacons
    for (let b of this.beacons) {
      cordova.plugins.locationManager.startMonitoringForRegion(b)
        .fail((e) => { console.error(e); })
        .done(() => { console.log('Native layer received the request to monitor :: ' + b.identifier + ',' + b.major + ',' + b.minor) });
    }
  }

  stopMonitoring() {
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
        this.ev.publish('onBeaconEnter', pluginResult.region);
      }
      else if (pluginResult.state === 'CLRegionStateOutside') {
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

}

export interface IBeaconState {
  uuid: string;
  identifier: string;
  major: number;
  minor: number;
}