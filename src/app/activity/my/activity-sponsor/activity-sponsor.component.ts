import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator, canvasDataURL } from 'src/app/ts/base-utils';
import { regDefine, baseConfig } from 'src/app/ts/base-config';
import { UserService, Result } from 'src/app/user/user.service';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';

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
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

    this.showProgress = true;
    this.userService.post(baseConfig.sponsorGet, '').subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.sponsor = result.data;
          this.sponsorPicSrc = environment.media + '/activity/images' + this.sponsor.sponsorLogo;
          this.sponsorForm.patchValue(this.sponsor);
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
      }
    );
  }

  get sponsorName() {
    return this.sponsorForm.get('sponsorName');
  }
  get sponsorIntro() {
    return this.sponsorForm.get('sponsorIntro');
  }

  addUpdate() {

    this.showProgress = true;
    this.userService.post(baseConfig.sponsorSet, this.sponsorForm.value).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('修改成功', '', { duration: 3000 });
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => {
        this.userService.showError(error);
        this.showProgress = false;
      }
    );
  }

  sponsorPic(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const that = this;
    reader.onload = function(e) {
      // console.log(this.result);
      canvasDataURL(this.result, 120, that, that.uploadPic);  // 处理完后调用uploadPic()
    };
    reader.readAsDataURL(file);
  }

  uploadPic(bob: Blob, that) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    that.showProgress = true;
    that.userService.postFormData(baseConfig.sponsorPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          that.sponsorForm.patchValue({
            sponsorLogo: result.data
          });
          that.sponsorPicSrc = environment.media + '/activity/images' + result.data;
        } else {
          that.userService.showError(result);
        }
        that.showProgress = false;
      },
      (error: Result) => { that.userService.showError(error); that.showProgress = false; }
    );
  }

}
