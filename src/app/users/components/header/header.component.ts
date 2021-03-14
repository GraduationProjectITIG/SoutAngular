import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchServiceService } from 'src/app/services/search-service.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { LocalizationService } from 'src/app/services/localization.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  usr = JSON.parse(localStorage.getItem('userdata')!)

  @ViewChild("searchValue") searchValue: any = null;

  constructor(private usrInfo: UserInfoService, private route: Router, private searchServ: SearchServiceService, private locale: LocalizationService) {

  }


  ngAfterViewInit(): void {



  }

  ngOnInit(): void {

    if (this.usr.id === "") {
      this.route.navigate(['/landing'])
    }
  }
  logout() {
    console.log(`works`)
    localStorage.removeItem("userauth");
    localStorage.removeItem('userdata');
    this.usrInfo.signOut();
    this.route.navigate(['/landing'])
  }
  search(str: string) {
    console.log(str)
    this.searchServ.InputVal = this.searchValue.nativeElement.value,
      console.log(this.searchValue?.nativeElement.value);
    this.route.navigate(['/users/search/', (str)])


  }

}
