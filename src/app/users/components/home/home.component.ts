import { ChangeDetectorRef, Component, OnInit, SecurityContext } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Post } from 'src/app/models/post.model';
import { FireService } from 'src/app/services/fire.service';
import { FileService } from 'src/app/services/file.service';
import { PostsService } from 'src/app/services/posts.service';
import { Observable, Subject, Subscription } from 'rxjs';
import * as RecordRTC from 'recordrtc';
// import { VideoRecordingService } from './video-recording.service';
import { ElectronService } from 'ngx-electron';
import * as Recorder from 'recorder-js';
import { DomSanitizer } from "@angular/platform-browser";
import * as moment from 'moment';
import { AngularFireStorage } from '@angular/fire/storage';
import { variable } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isRecordingVideo: boolean = false;
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

URL = window.URL || window.webkitURL;
 gumStream:any;
//stream from getUserMedia() 
 rec:any;
//Recorder.js object 
 input:any;
  urlsVideo: any[] = [];
  picURL: any;

  styleObject(): Object {
    return { color: this.user.favColor }
  }
  public urls: any[] = []; //audio recorder audios
  private error: any; //audio recorder error
  subscribtion: Subscription[] = [];
  postList: any[] = [];
  LikesList: any[] = [];
  commentsList: any[] = [];
  public post: Post = new Post();
  postMind: string = "";
  postDesc: string = "";
  user: any;
  postcomfields: string[] = [];
  greating: string;
  audioURL:string='';
  constructor(
    private storage: AngularFireStorage,
    private electronService: ElectronService,
    private sanitizer: DomSanitizer,
    private fileService: FileService,
    private fireService: FireService, private postsService: PostsService, private firestore: AngularFirestore, private route: Router, private domSanitizer: DomSanitizer) {

    this.user = JSON.parse(localStorage.getItem('userdata')!);
    this.greating = "What's up, " + this.user.firstName + " " + this.user.secondName + "?";
    this.subscribtion.push(this.fireService.getCollection('post').subscribe((res) => {
      this.postList = res;
      // console.log(res);
      for (let index = 0; index < this.postList.length; index++) {
        this.getComments(this.postList[index].id)
      }
      for (let index = 0; index < this.postList.length; index++) {
        this.getLikes(this.postList[index].id)
      }
    }))

  }

  ngOnInit(): void {
    if (!localStorage.getItem('userdata')) {
      this.route.navigate(['/landing'])
    }
    document.querySelector('.modal-backdrop')!.remove();
    this.postList = []
    this.subscribtion.push(this.fireService.getCollection('post').subscribe((res) => {
      this.postList = res;
      for (let index = 0; index < this.postList.length; index++) {
        this.getComments(this.postList[index].id)
      }
      for (let index = 0; index < this.postList.length; index++) {
        this.getLikes(this.postList[index].id)
      }
    }))

    // console.log(`Likes ${this.LikesList}`)
    // console.log(`Comments ${this.commentsList}`)
  }


  async notifyUser(usrId: string, msg: string) {
    let id = this.firestore.createId();
    if (this.user.id !== usrId)
      await this.firestore.collection(`Users`).doc(usrId).collection('notifications').doc(id).set({
        id: id,
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
  async uploadFile(event: any=null, type: string, mfile:any) {
    var filePath: any;
    var file = event
    if(event != null)
      file = event.target.files[0];
    else file=mfile;

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
  }

  async addPost(desc: string, audio: any = null, video: any = null, images: any[] = []) {
    this.post.description = desc;

    this.post.audio = "gs://sout-2d0f6.appspot.com/post/audio/Ouo7bBHraiMYfEO8asaBCNtKJGo23SfGXINGfvbxI1rGwvEL";
    this.post.image = images;
    this.post.video = video;

    this.post.owner.id = this.user.id;
    this.post.owner.name = this.user.firstName + " " + this.user.secondName;
    this.post.owner.picURL = this.user.picURL;
    this.post.id = this.firestore.createId();
    if(this.myBlooob){
      console.log("inside")
      this.fileTo = new File([this.myBlooob],`audio_${this.post.id}`,{ type: 'audio/mpeg' })
      await this.uploadFile(null,this.fileTo,'audio')
    }
    
    this.postsService.addPost(this.post).then(() => {
      console.log(this.post)
    });
     this.ngOnInit()
  }

  bookmarkpost(post: any) {
    this.firestore.collection("Users").doc(this.user.id).collection("bookmarks").add({
      post: this.firestore.doc(`post/${post.id}`).ref
    })
    alert(`post added`)
  }

  ngOnDestroy(): void {
    this.subscribtion.forEach(element => {
      element.unsubscribe();
    })
  }

  addLike(postid: any) {
    this.firestore.collection('post').doc(postid.id).collection("like").add({
      userid: this.user.id
    })
    this.notifyUser(postid.owner.id, `${this.user.firstName} liked on your post `)
  }

  addComment(postid: any, index: number) {
    this.firestore.collection(`post`).doc(postid.id).collection('comment').add({
      writer: {
        id: this.user.id,
        name: this.user.firstName + " " + this.user.secondName,
        picURL: this.user.picURL
      },
      description: this.postcomfields[index],
      date: new Date().toISOString(),
    })
    this.notifyUser(postid.owner.id, `${this.user.firstName} commented on your post "${this.postcomfields[index]}"`)
  }
  async getComments(postid: string) {
    this.commentsList = []
    this.subscribtion.push(await this.firestore.collection('post').doc(postid).collection('comment').valueChanges().subscribe((data) => {
      this.commentsList.push(data);
      // console.log(data)
    }))
  }

  deletepost(post:any){
    this.firestore.collection('post').doc(post.id).delete();
  }

  async getLikes(postid: string) {
    this.LikesList = []
    this.subscribtion.push(await this.firestore.collection('post').doc(postid).collection('like').valueChanges().subscribe((data) => {
      this.LikesList.push(data)
      // console.log(data)
    }))
  }

  
  startRecording() {
    this.isRecording = true;
    if (this.recorder) {
      
      // It means recording is already started or it is already recording something
      return;
    }
  
    this._recordingTime.next('00:00');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      this.stream = s;
      console.log("s",s)
      this.record();
    }).catch(error => {
      this._recordingFailed.next();
    });
  
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
stopRecording() {
  this.isRecording = false;
  if (this.recorder) {
    this.recorder.stop((blob:any) => {
      if (this.startTime) {
        const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
        this._recorded.next({ blob: blob, title: mp3Name });
        this.BlobURL = URL.createObjectURL(blob)
        this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.BlobURL);
        this.post.audio = this.BlobURL
        var anchor = document.createElement("a");
        anchor.href = this.BlobURL;
        this.download(this.BlobURL,blob)
        this.stopMedia();
      }
    }, () => {
      this.stopMedia();
      this._recordingFailed.next();
    });
  }

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
abortRecording() {
  this.stopMedia();
}
  startVideoRecording() {
    this.isRecordingVideo = true;
    let mediaConstraints = {
      video: true,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallbackVideo.bind(this), this.errorCallback.bind(this));
  }

  successCallbackVideo(stream: any) {
    var options = {
      mimeType: "video/mp4",
    };

    //Start Actuall Recording
    var MediaStreamRecorder = RecordRTC.MediaStreamRecorder;
    // this.record = new MediaStreamRecorder(stream, options);
    // this.record.record();
  }

  successCallback(stream: any) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1
    };

    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
  }

  stopRecordingVideo() {
    this.isRecordingVideo = false;
    // this.record.stop(this.processRecordingVideo.bind(this));
  }

  

  processRecordingVideo(blob: any) {
    // this.urlsVideo.push(URL.createObjectURL(blob)!);
  }

  sanitize(url: string) {
    // console.log(url)
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  errorCallback(error: any) {
    this.error = 'Can not play audio in your browser';
  }

  // async uploadFile(event: any, type: string) {
  //   var filePath: any;
  //   const file = event.target.files[0];
  //   const id = this.firestore.createId()
  //   if (type == "image")
  //     filePath = '/post/images/' + id;
  //   else if (type == "audio")
  //     filePath = '/post/audio/' + id;
  //   else if (type == "video")
  //     filePath = '/post/video/' + id;
  //   await this.firestorage.upload(filePath, file);
  //   const ref = this.firestorage.refFromURL("gs://sout-2d0f6.appspot.com" + filePath).getDownloadURL().toPromise().then((url => {
  //     console.log(url);
  //     if (type == "image") {
  //       this.post.image = url
  //     } else if (type == "audio") {
  //       this.post.audio = url
  //     } else if (type == "video") {
  //       this.post.video = url
  //     }
  //     console.log(url)
  //   }));
  //   alert('upload done')
  //   // });
  // }
}
