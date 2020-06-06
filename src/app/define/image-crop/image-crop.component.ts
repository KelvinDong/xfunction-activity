import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.css']
})
export class ImageCropComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  // blob: Blob;

    imageCropped(event: ImageCroppedEvent) {
        // console.log(event);
        this.croppedImage = event.base64;
        // this.blob = event.file;
    }
    imageLoaded() {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }

  ngOnInit() {
    this.imageChangedEvent = this.data.target;
  }

  submit() {
    // console.log('submit');
    this.dialogRef.close(this.croppedImage);
  }
}
