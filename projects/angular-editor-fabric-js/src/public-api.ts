/*
 * Public API Surface of angular-editor-fabric-js
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

export * from './lib/angular-editor-fabric-js.component';
export * from './lib/angular-editor-fabric-js.module';

@Injectable({
    providedIn: 'root'
})
export class ApiServiceFabric {
    api_site_url = 'https://simonstamp.projectsofar.info/wp-json/simonstamp/v1/';
    constructor(
        private http: HttpClient
    ) { }

    addUserLibraryDataFabric(canvasId:string): Observable<any> {
        const url = this.api_site_url+`product_options`;

        const apiHeaders = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        });


        return this.http.post(url, {
            'api_token' : 'avlable',
            'guid' : canvasId,
            'meta_key' : 'json',
            'meta_value' : 'abc'
        }, { headers: apiHeaders })
    }
}