import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator, canvasDataURL, getBlobByBase64, getAndSavePath } from 'src/app/ts/base-utils';
import { regDefine, baseConfig } from 'src/app/ts/base-config';
import { UserService, Result } from 'src/app/user/user.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { environment } from 'src/environments/environment';
import { ImageCropComponent } from 'src/app/define/image-crop/image-crop.component';
import { ActivatedRoute } from '@angular/router';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-activity-sponsor',
  templateUrl: './activity-sponsor.component.html',
  styleUrls: ['./activity-sponsor.component.css']
})
export class ActivitySponsorComponent implements OnInit {

  title = '主办方信息';
  showProgress = false;

  sponsor: any;

  sponsorForm =
    new FormGroup({
      sponsorName: new FormControl('', [
        forbiddenRegValidator(regDefine.sponsorName)
      ]),
      sponsorLogo: new FormControl('', [Validators.required
        ]),
      sponsorIntro: new FormControl('', [
        forbiddenRegValidator(regDefine.sponsorIntro)]),

    });

  sponsorPicSrc = 'assets/images/default-head.png';

  constructor(
    private userService: UserService,
    private commandService: CommandService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    getAndSavePath(this.activeRoute);

    setTimeout(() => {
      this.commandService.setMessage(3);
      this.showProgress = true;
      this.commandService.setMessage(1);
      this.userService.post(baseConfig.sponsorGet, '').subscribe(
        (data: Result) => {
          const result = { ...data };
          if (result.success) {
            this.sponsor = result.data;
            this.sponsorPicSrc = environment.media + '/activity/images' + this.sponsor.sponsorLogo;
            this.sponsorForm.patchValue(this.sponsor);
          } else {
            this.userService.showError1(result, () => { this.ngOnInit(); });
          }
          this.showProgress = false;
          this.commandService.setMessage(0);
        },
        (error: Result) => {
          this.userService.showError1(error, () => {this.ngOnInit(); });
          this.showProgress = false;
          this.commandService.setMessage(0);
        }
      );
    }, 100);
  }

  get sponsorName() {
    return this.sponsorForm.get('sponsorName');
  }
  get sponsorIntro() {
    return this.sponsorForm.get('sponsorIntro');
  }

  addUpdate() {

    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.sponsorSet, this.sponsorForm.value).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('修改成功', '', { duration: 3000 });
        } else {
          this.userService.showError1(result, () => {this.addUpdate(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0)
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.addUpdate(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

  selectImg(e: any ) {
    const dialogRef = this.dialog.open(ImageCropComponent, {
      // height: '400px',
      width: '300px',
      data: { target: e }
    });
    dialogRef.afterClosed().subscribe((resultData: any) => {
      // console.log(resultData);
      if (resultData) {
        this.uploadPic(getBlobByBase64(resultData));
      }
    });
  }

  uploadPic(bob: Blob) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.postFormData(baseConfig.sponsorPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.sponsorForm.patchValue({
            sponsorLogo: result.data
          });
          this.sponsorPicSrc = environment.media + '/activity/images' + result.data;
        } else {
          this.userService.showError1(result, () => {this.uploadPic(bob); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.uploadPic(bob); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

}
