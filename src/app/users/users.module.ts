import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DiscoverComponent } from './components/discover/discover.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OtherProfileComponent } from './components/other-profile/other-profile.component';
import { HomeComponent } from './components/home/home.component';
import { TalentsComponent } from './components/talents/talents.component';
import { SearchComponent } from './components/search/search.component';
import { NotoficationComponent } from './components/notofication/notofication.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BookmarkComponent } from './components/bookmark/bookmark.component';
import { ChatComponent } from './components/chat/chat.component';
import { SettingComponent } from './components/setting/setting.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { FormsModule } from '@angular/forms';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';



// required for AOT compilation

export function customHttpLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "../../assets/i18n/", ".json");
}
@NgModule({
  declarations: [
    UsersComponent,
    SidebarComponent,
    HeaderComponent,
    HomeComponent,
    TalentsComponent,
    DiscoverComponent,
    ProfileComponent,
    OtherProfileComponent,
    BookmarkComponent,
    ChatComponent,
    SettingComponent,
    SearchComponent,
    NotoficationComponent,
    ReportsComponent
  ],
  imports: [
    UiSwitchModule,
    CommonModule,
    FormsModule,
    UsersRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyB34ZDbD7bLBLklSgRbyaEqdOo-ZB1V8dw",
      authDomain: "sout-2d0f6.firebaseapp.com",
      projectId: "sout-2d0f6",
      storageBucket: "sout-2d0f6.appspot.com",
      messagingSenderId: "706376997886",
      appId: "1:706376997886:web:36a3101d876f715a217eaf",
      measurementId: "G-5R8JHQGN68"
    }),
    AngularFirestoreModule,
    FormsModule,
    AngularFireStorageModule,
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: customHttpLoader,
        deps: [HttpClient],
      },
      isolate: false
    }),

  ],
  providers: [
    HttpClient,
  ],
})
export class UsersModule { }
