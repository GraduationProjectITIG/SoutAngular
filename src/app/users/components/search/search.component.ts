import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { FireService } from 'src/app/services/fire.service';
import { SearchServiceService } from 'src/app/services/search-service.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router'
import { from } from 'rxjs';
import { LocalizationService } from 'src/app/services/localization.service';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  userArr: any[] = [];
  userID: String = '';
  arrayOfUser: User[] = [];
  user1: User = new User("1", "Heba", "Taher", "Femail", "123", "https://picsum.photos/id/237/200/300"
    , "https://picsum.photos/id/237/200/300", new Date(), false, "red", "privite", new Date(), new Date(), false);



  inputValFromService: string | null = "";

  constructor(private fireService: FireService, private serchService: SearchServiceService, private actrout: ActivatedRoute, private router: Router, private locale: LocalizationService) {


    this.inputValFromService = this.serchService.InputVal;
    console.log(this.inputValFromService)





  }

  ngOnInit(): void {
    //////////////////////////////////////////////////////////
    //trying static data

    this.arrayOfUser[0] = this.user1,






      ////////////////////////////////////////////////////////////
      console.log("serchService>>" + this.serchService.InputVal)
    this.actrout.paramMap.subscribe((param) => {
      this.inputValFromService = param.get("Sq")

    })
    this.fireService.getCollection("Users").subscribe((res) => {
      this.userArr = res.filter((user) => {
        console.log("user>>" + user.firstName)

        return (user.firstName == this.inputValFromService)
        //  || (user.secondName == this.inputValFromService)
      })




    })




  }
  goToProfile(id: string) {
    this.router.navigate(['/users/profile/', id])
  }

}


