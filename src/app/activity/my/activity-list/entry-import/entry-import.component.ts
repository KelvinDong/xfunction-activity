import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { getUserToken, isExplorer } from 'src/app/ts/base-utils';
import { environment } from 'src/environments/environment';
import { baseConfig } from 'src/app/ts/base-config';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { UserService, Result } from 'src/app/user/user.service';

@Component({
  selector: 'app-entry-import',
  templateUrl: './entry-import.component.html',
  styleUrls: ['./entry-import.component.css']
})
export class EntryImportComponent implements OnInit {

  file: any;
  showProgress = false;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EntryImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }


  ngOnInit() {
  }

  dlTemple() {

    if (isExplorer('micromessenger')) {
      this.snackBar.open('微信生态要求，请点击右上角选择在浏览器中打开。', '', { duration: 3000 });
      return;
    }
    const userToken = getUserToken();
    const params = { activityId: this.data.activityId }; // body的参数
    this.http.post(environment.api + baseConfig.activityMyEntryTempleDl, params, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json').append('token', userToken === undefined ? '' : userToken)
    }).subscribe(resp => {
      // resp: 文件流
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([resp], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = Date.now() + 'template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  change(event: any) {
    this.file = event.target.files[0];
  }

  import() {
    // this.dialogRef.close();
    const postData: FormData = new FormData();
    postData.append('file', this.file);
    postData.append('activityId', this.data.activityId);
    postData.append('ticketId', this.data.ticketId);
    this.showProgress = true;
    this.userService.postFormData(baseConfig.activityImportEntry, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.dialogRef.close(true);
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );

  }

}
