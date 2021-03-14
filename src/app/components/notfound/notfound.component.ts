import { Component, OnInit } from '@angular/core';
import { LocalizationService } from 'src/app/services/localization.service';


@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss']
})
export class NotfoundComponent implements OnInit {

  constructor(private locale: LocalizationService) { }

  ngOnInit(): void {
  }

}
