import { Component } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Events, ToastController } from 'ionic-angular';
import { IBeaconManager, IBeaconState } from '../../providers/ibeacon-manager/ibeacon-manager';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  started: boolean = false;

  constructor(private localNotifications: LocalNotifications, private manager: IBeaconManager, private toastCtrl: ToastController, private ev: Events) {

  }

  async ionViewDidLoad() {
    await this.manager.setup();
    this.localNotifications.requestPermission();

    this.ev.subscribe('onBeaconEnter', (beacon: IBeaconState) => {
      this.localNotifications.schedule({
        id: this.getRandomInt(999999),
        title: "Enter Region Event",
        text: 'Enter region :: ' + beacon.identifier + ", " + beacon.minor,
        foreground: true,
        priority: 20
      });
    });

    this.ev.subscribe('onBeaconExit', (beacon: IBeaconState) => {
      this.localNotifications.schedule({
        id: this.getRandomInt(999999),
        title: "Exit Region Event",
        text: 'Exit region :: ' + beacon.identifier + ", " + beacon.minor,
        foreground: true,
        priority: 20
      });
    });
  }

  public onStartClicked(): void {
    this.started = true;
    this.manager.startMonitoring();
  }

  public stop(): void {
    this.started = false;
    this.manager.stopMonitoring();
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}