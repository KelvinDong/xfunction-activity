import { Component, OnInit } from '@angular/core';
import {
  faEye, faCalculator, faAddressBook, faQrcode, faMinusCircle, faHeart, faCircle, faSquare, faEnvelope,
  faMapMarkedAlt, faDoorClosed, faDoorOpen, faStar, faAward, faSpinner, faBookmark
} from '@fortawesome/free-solid-svg-icons';

import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { Region } from '../ts/region';

@Component({
  selector: 'app-teeest',
  templateUrl: './teeest.component.html',
  styleUrls: ['./teeest.component.css']
})
export class TeeestComponent implements OnInit {

  faEye = faEye;
  faCalculator = faCalculator;
  faAddressBook = faAddressBook;
  faMapMarkedAlt = faMapMarkedAlt;
  faDoorClosed = faDoorClosed;
  faDoorOpen = faDoorOpen;
  faStar = faStar;
  faQrcode = faQrcode;
  faMinusCircle = faMinusCircle;
  faHeart = faHeart;
  faAward = faAward;
  faCircle = faCircle;
  faSquare = faSquare;
  faEnvelope = faEnvelope;
  faSpinner = faSpinner;
  faBookmark = faBookmark;


  farHeart = farHeart;

  constructor(
    private region: Region
  ) { }

  ngOnInit() {

   this.region.getCity('220000');
   this.region.getName('220100');
   this.region.getName('220000');
  }

}
