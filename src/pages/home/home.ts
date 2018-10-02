import { Component, ViewChild } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import format from 'date-fns/format';
import { Content, Events, ToastController } from 'ionic-angular';
import { IBeaconManager, IBeaconState } from '../../providers/ibeacon-manager/ibeacon-manager';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  started: boolean = false;
  logs: string[] = [];

  httpEndpoint: string = 'https://ibeacon-test.free.beeceptor.com';

  @ViewChild(Content) content: Content;

  constructor(private localNotifications: LocalNotifications, private manager: IBeaconManager, private toastCtrl: ToastController, private ev: Events) {

  }

  async ionViewDidLoad() {
    await this.manager.setup(this.httpEndpoint);
    this.localNotifications.requestPermission();

    this.ev.subscribe('onBeaconEnter', (beacon: IBeaconState) => {
      const msg: string = 'Enter region :: ' + beacon.identifier + ", " + beacon.major + ":" + beacon.minor;

      // schedule a local notification
      this.localNotifications.schedule({
        id: this.getRandomInt(999999),
        title: "Enter Region Event",
        text: msg,
        foreground: true,
        priority: 99
      });

      // show a little toast
      const toast = this.toastCtrl.create({ message: msg, duration: 3000, });
      toast.present();

      this.logs.splice(0, 0, format(new Date(), 'YYYY-MM-DD HH:mm:ss') + " : " + msg); // add into array to display on page
      this.content.scrollToTop();
    });

    this.ev.subscribe('onBeaconExit', (beacon: IBeaconState) => {
      const msg: string = 'Exit region :: ' + beacon.identifier + ", " + beacon.major + ":" + beacon.minor;

      // schedule a local notification
      this.localNotifications.schedule({
        id: this.getRandomInt(999999),
        title: "Exit Region Event",
        text: msg,
        foreground: true,
        priority: 99
      });

      // show a little toast
      const toast = this.toastCtrl.create({ message: msg, duration: 3000, });
      toast.present();

      this.logs.splice(0, 0, format(new Date(), 'YYYY-MM-DD HH:mm:ss') + " : " + msg); // add into array to display on page
      this.content.scrollToTop();
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

  private getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

}