import { Component, OnInit } from '@angular/core';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { faQuoteLeft, faQuoteRight, faClock, faCommentSlash } from '@fortawesome/free-solid-svg-icons';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog, MatBottomSheet } from '@angular/material';
import { getAndSavePath, convertDateFromString } from 'src/app/ts/base-utils';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { ActivityCommentsBottomComponent } from './activity-comments-bottom/activity-comments-bottom.component';
import { ActivityCommentsReplyComponent } from './activity-comments-reply/activity-comments-reply.component';
import { environment } from 'src/environments/environment';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-activity-comments',
  templateUrl: './activity-comments.component.html',
  styleUrls: ['./activity-comments.component.css']
})
export class ActivityCommentsComponent implements OnInit {

  title = '评论管理';

  // http相关
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };

  comments: any[] = [];

  faQuoteLeft = faQuoteLeft;
  faQuoteRight = faQuoteRight;
  faClock = faClock;
  faCommentSlash = faCommentSlash;

  baseUrl = environment.media + '/activity/images';

  constructor(
    private userService: UserService,
    private router: Router,
    private commandService: CommandService,
    public snackBar: MatSnackBar,

    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    getAndSavePath(this.activeRoute);
    setTimeout(() => {
      this.getComments();
      this.commandService.setMessage(3);
    }, 100);
    
  }

  getComments() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityComments, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

          result.data.rows.forEach(element => {
            element.commentCreate = convertDateFromString(element.commentCreate);
            this.comments.push(element);
          });

          if (result.data.rows.length <= 0) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError1(result, () => { this.getComments(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getComments(); }); 
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

  scrollBottom(e: any) {
    //console.log(e);
    let offsetH = e.target.offsetHeight;
    let scrollT = e.target.scrollTop;
    let height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    let bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getComments();
    }
  }

  showBottom(comment: any) {
    // console.log(activity);
    const bottomSheetRef = this.bottomSheet.open(ActivityCommentsBottomComponent, { data: { para: comment } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1:
          this.delComment(comment);
          break;
        case 2:
          this.router.navigate([urlDefine.publicActivity, comment.activity.activityId]);
          break;
        case 3:
          this.showReplyComment(comment);
          break;
        default:
          break;
      }
    });
  }

  delComment(comment: any) {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityCommentDel, { commentId: comment.commentId }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          comment.commentDel = true;
        } else {
          this.userService.showError1(result, () => { this.delComment(comment); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.delComment(comment); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

  showReplyComment(comment: any) {
    const dialogRef = this.dialog.open(ActivityCommentsReplyComponent, {
      // height: '400px',
      // width: '90%',
      data: {}
    });
    dialogRef.afterClosed().subscribe((resultData: string) => {
      if (resultData) {
        this.replyComment(comment, resultData);
      }
    });
  }

  replyComment(comment, resultData) {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityCommentReplay, { commentId: comment.commentId, commentReply: resultData }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('发布成功', '', { duration: 5000 });
          comment.commentReply = resultData;
        } else {
          this.userService.showError1(result, () => {this.replyComment(comment, resultData); } );
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.replyComment(comment, resultData); } );
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

}
