import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { PostsService } from 'src/app/services/posts.service';
import { FireService } from 'src/app/services/fire.service';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from 'src/app/services/file.service';
import * as fileSaver from 'file-saver';
import * as moment from 'moment';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { ISettingsData } from 'src/app/users/ViewModels/isettings-data';
import { ModeService } from 'src/app/services/mode.service';
import * as RecordRTC from 'recordrtc';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userName: string = "";
  picURL: any;
  coverPicURL: string = "";
  public user: User = new User();
  postList: Post[] = [];
  public post: Post = new Post();
  postMind: string = "";
  postDesc: string = "";
  postcomfields: string[] = [];
  LikesList: any[] = [];
  commentsList: any[] = [];
  notificationsNo: number = 0;
  fileUrl:any;
  BlobURL:any;
  isRecording = false;
  recorder:any;
  startTime:any;
  _recorded = new Subject<any>();
  _recordingFailed = new Subject<string>();
  _recordingTime = new Subject<string>();
  interval:any;
  stream:any;
  myBlooob:any;
  fileTo:any;
  settingsData: ISettingsData = { privateAcc: false, favColor: '', favMode: '', oldPassword: '', deactive: false };

  constructor(private postsService: PostsService, private route: Router,
    private firestore: AngularFirestore, private fileService: FileService, private storage: AngularFireStorage, private FireService: FireService,
    config: NgbModalConfig, private modalService: NgbModal, private modeService: ModeService, private domSanitizer: DomSanitizer, private firestorage: AngularFireStorage) {

    this.modalService.dismissAll();
    }
  following: number = 0;
  followers: number = 0;

  usersList: User[] = [];

  followersList: any[] = [];
  followingList: any[] = [];

  updatedUser: User = new User();
// <<<<<<< mai

  subscribtion: Subscription[] = [];

  comment: object = {};
  isRecordingVideo: boolean = false;
  urlsVideo: any[] = [];
  checkCover: boolean | undefined;
  updatedPost: object = {};
// =======

//   subscribtion: Subscription[] = [];

//   comment: object = {};
//   isRecordingVideo: boolean = false;
//   urlsVideo: any[] = [];

// >>>>>>> master
  styleObject(): Object {
    return { color: this.user.favColor }
  }
  public urls: any[] = []; //audio recorder audios
  private error: any; //audio recorder error
  



  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('userdata')!)
    if (this.user) {
      this.userName = this.user.firstName + " " + this.user.secondName;
      this.picURL = this.user.picURL;
      this.coverPicURL = this.user.coverPicURL;
// <<<<<<< mai
// =======
      this.settingsData.favMode = this.user.favMode;
// >>>>>>> master
      this.postMind = "What's on your mind, " + this.user.firstName + "?";

      if (this.user.coverPicURL === "")
        this.checkCover = false;
      else
        this.checkCover = true;
      this.getAllPosts();
      this.getnotificationsno();
      this.getFollowers();
      this.getFollowing();
      console.log(this.user);


      if (this.settingsData.favMode === "dark") { this.modeService.OnDark(); this.settingsData.favMode = "dark"; }
      else if (this.settingsData.favMode === "light") { this.modeService.defaultMode(); this.settingsData.favMode = "light"; }

    }
    else
      this.route.navigate(['/landing'])
  }


  download(url:any, blob:any): any {
    this.fileService.downloadFile(url).subscribe((response: any) => { 
      let blob2:any = new Blob([response], { type: 'audio/webm' });  
      this.myBlooob = blob2;
      

      // fileSaver.saveAs(blob2, 'test.mp3')
    }), (error: any) => console.log('Error downloading the file'), 
                 () => console.info('File downloaded successfully');
  }
  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track:any) => {console.log("track",track );track.stop()});
        
        
        this._recorded.forEach(e=>console.log("e", e.title))
  
          
        this.stream = null;
      }
    }
  }
  
stopRecording() {
  this.isRecording = false;
  if (this.recorder) {
    this.recorder.stop((blob:any) => {
      if (this.startTime) {
        const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
        this._recorded.next({ blob: blob, title: mp3Name });
        this.BlobURL = URL.createObjectURL(blob)
        this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.BlobURL);
        var anchor = document.createElement("a");
        anchor.href = this.BlobURL;
        console.log("stop",this.BlobURL)
        this.download(this.BlobURL,blob)
        this.stopMedia();
      }
    }, () => {
      this.stopMedia();
      this._recordingFailed.next();
    });
  }

}


record() {

  this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
    type: 'audio',
    mimeType: 'audio/webm'
  });

  this.recorder.record();
  this.startTime = moment();
  this.interval = setInterval(
    () => {
      const currentTime = moment();
      const diffTime = moment.duration(currentTime.diff(this.startTime));
      const time = this.toMyString(diffTime.minutes()) + ':' + this.toMyString(diffTime.seconds());
      this._recordingTime.next(time);
    },
    1000
  );
}
private toMyString(value:any) {
let val = value;
if (!value) {
  val = '00';
}
if (value < 10) {
  val = '0' + value;
}
return val;
}


  uploadFile(event: any, type: string) {
    var filePath: any;
    var userId = this.user.id
    const file = event.target.files[0];

    if (type == "profile")
      filePath = '/Users/profile_pics/' + userId;
    else if (type == "cover")
      filePath = '/Users/cover_photos/' + userId;

    this.storage.upload(filePath, file);
    const ref = this.storage.refFromURL("gs://sout-2d0f6.appspot.com" + filePath);

    ref.getDownloadURL().toPromise().then(url => {
      if (type == "profile") {

        this.user.picURL = url;
        this.FireService.updateDocument("Users/" + userId, this.user)

        this.picURL = url;
        console.log(this.user.picURL)
      }
      else if (type == "cover") {
        this.coverPicURL = url;
        this.FireService.updateDocument("Users/" + userId, this.user)

        this.user.coverPicURL = url;
      }

      localStorage.setItem('userdata', JSON.stringify(this.user))
      this.route.navigate(['/users/profile']).then(() => {
        window.location.reload();
      });
    });

  }

  getAllPosts() {
    this.postsService.getAllUserPosts(this.user.id).subscribe(res => {
      this.postList = res
      for (let index = 0; index < this.postList.length; index++) {
        this.getComments(this.postList[index].id)
      }
      for (let index = 0; index < this.postList.length; index++) {
        this.getLikes(this.postList[index].id)
      }
    });
    // return this.postList;
    //console.log(this.postList)

  }

  async uploadaudio(event: any, type: string) {
    var filePath: any;
    const file = event
    const id = this.firestore.createId()
    if (type == "image")
      filePath = '/post/images/' + id;
    else if (type == "audio")
      filePath = '/post/audio/' + id;
    else if (type == "video")
      filePath = '/post/video/' + id;
    await this.storage.upload(filePath, file);
    await this.storage.refFromURL("gs://sout-2d0f6.appspot.com" + filePath).getDownloadURL().toPromise().then((url => {
      
      if (type == "image") {
        this.post.image = url
      } else if (type == "audio") {
        this.post.audio = url
      } else if (type == "video") {
        this.post.video = url
      }
    }));
    alert('upload done')
    // });
  }

  async addPost(desc: string) {
    this.post.description = desc;
    this.post.owner.id = this.user.id;
    this.post.owner.name = this.user.firstName + " " + this.user.secondName,
      this.post.owner.picURL = this.user.picURL,
      this.post.id = this.firestore.createId();
      if(this.myBlooob){
        console.log("inside")
        this.fileTo = new File([this.myBlooob],`audio_${this.post.id}`,{ type: 'audio/mpeg' })
        await this.uploadaudio(this.fileTo,'audio')
      }
      this.postsService.addPost(this.post).then(() => {
        console.log(this.post)
      });
      this.ngOnInit()
    }

  deletePost(id: string) {
    this.postsService.deletePost(id).then(
      (data) => {
        console.log(data);

        this.ngOnInit();

      })

  }

  addLike(postid: any) {
    this.firestore.collection('post').doc(postid.id).collection("like").add({
      userid: this.user.id
    });

    this.subscribtion.push(this.firestore.collection('post').doc(postid.id).collection('like').valueChanges().subscribe((data) => {
      this.LikesList[this.postList.findIndex((post)=>post == postid)] = data;
    }));

    this.notifyUser(postid.owner.id, `${this.user.firstName} liked on your post `)
  }

// <<<<<<< mai
  addComment(postid: any, index: number) {
    this.firestore.collection(`post`).doc(postid.id).collection('comment').add({
// =======
//   addComment(post: any, index: number) {
//     var commentId = this.firestore.createId();
//     this.comment = {
//       id: commentId,
// >>>>>>> master
      writer: {
        id: this.user.id,
        name: this.user.firstName + " " + this.user.secondName,
        picURL: this.user.picURL
      },
      description: this.postcomfields[index],
      date: new Date().toISOString(),
// <<<<<<< mai
    })
// =======
//     }
//     this.FireService.setDocument("/post/" + post.id + "/comment/" + commentId, { ...this.comment });
//     this.notifyUser(post.owner.id, `${this.user.firstName} commented on your post "${this.postcomfields[index]}"`)
//   }
// >>>>>>> master

    //this.getComments(postid)
    this.subscribtion.push(this.firestore.collection('post').doc(postid.id).collection('comment').valueChanges().subscribe((data) => {
      this.commentsList[this.postList.findIndex((post)=>post == postid)] = data;
    }));

    this.notifyUser(postid.owner.id, `${this.user.firstName} commented on your post "${this.postcomfields[index]}"`)
  }
  async getComments(postid: string) {
    // this.commentsList = []
    this.subscribtion.push(await this.firestore.collection('post').doc(postid).collection('comment').valueChanges().subscribe((data) => {
      this.commentsList.push(data);
      // console.log(data)
    }))
  }

  async getLikes(postid: string) {
    this.subscribtion.push(await this.firestore.collection('post').doc(postid).collection('like').valueChanges().subscribe((data) => {
      this.LikesList.push(data)
    }))
  }

  async notifyUser(usrId: string, msg: string) {
    await this.firestore.collection(`Users`).doc(usrId).collection('notifications').add({
      date: new Date().toISOString(),
      description: msg,
      seen: false,
      maker: {
        id: this.user.id,
        name: this.user.firstName + " " + this.user.secondName,
        picURL: this.user.picURL
      }
    })
  }

  getnotificationsno() {
    this.firestore.collection('Users').doc(this.user.id).collection('notifications').valueChanges().subscribe((data) => {
      console.log(`notifications: ${data}`)
      this.notificationsNo = data.length
    })
  }

  getFollowers() {
    this.followersList = []
    this.subscribtion.push(this.firestore.collection(`Users`).doc(this.user.id).collection('followers').valueChanges().subscribe((data) => {
      this.followers = data.length
      data.forEach(el => {
        this.followersList.push(el);
      })
    })
    )

  }

  getFollowing() {
    this.followingList = []
    this.subscribtion.push(this.firestore.collection(`Users`).doc(this.user.id).collection('following').valueChanges().subscribe((data) => {
      this.following = data.length
      data.forEach(el => {
        this.followingList.push(el);
      })

    })
    )
    console.log(this.followingList)

  }

  changeName(name: string) {
    var splittedName = name.split(" ");
    this.user.firstName = splittedName[0];
    this.user.secondName = (splittedName[1]) ? splittedName[1] : "";
    // this.user.firstName = name
    this.FireService.updateDocument("Users/" + this.user.id, this.user);

    this.postList.forEach(el => {
      el.owner.name = name;
      this.FireService.updateDocument("post/" + el.id, el);

      // this.getComments(el.id);
      // console.log(this.commentsList)
      // this.commentsList.forEach(element => {
      //   element.forEach((x:any) => {
      //     x.writer.name = name;
      //     this.FireService.updateDocument("/post/" + el.id + "/comment/" + element.id, x);
      //   })

      // })
    });


    // this.getAllUsers();

    // this.usersList.forEach(el => {
    //   this.FireService.getCollection("Users/" + el.id + "/followers/").subscribe(res => {
    //     res.forEach(element => {
    //       if (element.userid == this.user.id) {
    //         element.name = name;
    //       }
    //     })
    //   });
    // });

    console.log(this.postList)

    localStorage.setItem('userdata', JSON.stringify(this.user));
    this.ngOnInit()
  }

  getUserById(id: string) {
    this.FireService.getDocument("Users/" + id).subscribe(res => {
      this.updatedUser = res
      console.log(this.updatedUser)
    });
  }

  getAllUsers() {
    this.FireService.getCollection("Users/").subscribe(res => {
      this.usersList = res
      console.log(this.usersList)
    });
  }

  open(content: any) {
    this.modalService.open(content);
  }

  ngOnDestroy(): void {
    this.subscribtion.forEach(element => {
      element.unsubscribe();
    })
  }


  processRecording(blob: any) {
    this.urls.push(URL.createObjectURL(blob)!);
  }

  processRecordingVideo(blob: any) {
    this.urlsVideo.push(URL.createObjectURL(blob)!);
  }

  sanitize(url: string) {
    // console.log(url)
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  errorCallback(error: any) {
    this.error = 'Can not play audio in your browser';
  }

  async uploadFile2(event: any, type: string) {
    var filePath: any;
    const file = event.target.files[0];
    const id = this.firestore.createId()
    if (type == "image")
      filePath = '/post/images/' + id;
    else if (type == "audio")
      filePath = '/post/audio/' + id;
    else if (type == "video")
      filePath = '/post/video/' + id;
    await this.firestorage.upload(filePath, file);
    const ref = this.firestorage.refFromURL("gs://sout-2d0f6.appspot.com" + filePath).getDownloadURL().toPromise().then((url => {
      console.log(url);
      if (type == "image") {
        this.post.image = url
      } else if (type == "audio") {
        this.post.audio = url
      } else if (type == "video") {
        this.post.video = url
      }
      console.log(url)
    }));
    alert('upload done')
    // });
  }

  bookmarkpost(post: any) {
    this.firestore.collection("Users").doc(this.user.id).collection("bookmarks").add({
      post: this.firestore.collection("post").doc(post.id).ref,
    })
    alert(`post added`)
  }


  editInfo(bio: string, mobile: string, birthDate: Date) {
    this.user.bio = bio;
    this.user.mobile = mobile;
    this.user.birthDate = birthDate;
    this.FireService.updateDocument("Users/" + this.user.id, this.user);
    localStorage.setItem('userdata', JSON.stringify(this.user));

    // this.route.navigate(['/users/profile']).then(() => {
    //   window.location.reload();
    // });
  }

  editPostFun(desc: string, postId: string,post:Post) {
    post.description = desc;
    console.log(post)
    this.FireService.updateDocument(`post/${postId}`, post);;

    console.log(this.post)
    // this.ngOnInit()
    // this.route.navigate(['/users/profile']).then(() => {
    //       window.location.reload();
    //     });
  }

  async uploadFileEdit(event: any, type: string,post:Post) {
    var filePath: any;
    const file = event.target.files[0];
    const id = this.firestore.createId()
    if (type == "image")
      filePath = '/post/images/' + id;
    else if (type == "audio")
      filePath = '/post/audio/' + id;
    else if (type == "video")
      filePath = '/post/video/' + id;
    await this.firestorage.upload(filePath, file);
    const ref = this.firestorage.refFromURL("gs://sout-2d0f6.appspot.com" + filePath).getDownloadURL().toPromise().then((url => {
      console.log(url);
      if (type == "image") {
        post.image = url
      } else if (type == "audio") {
        post.audio = url
      } else if (type == "video") {
        post.video = url
      }
      console.log(url)
    }));
    alert('upload done')
    // });
  }

  openEdit(content: any) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }
  


}
