import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }
  downloadFile(url:any): any {
    // alert("here2")
		return this.http.get(url, {responseType: 'blob'});
  }
}
