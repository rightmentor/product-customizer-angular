import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    api_site_url = 'https://webspeedo.com/simonstamp/api/'
    constructor(
        private http: HttpClient
    ) { }

    //   getDashboardDetails(request: DashboardDetailsRequest): Observable<DashboardDetails> {
    //     const dashboardDetailsUrl = `${environment.api}${this.constants.DashboardDetailsUrl}`;
    //     return this.http.post<DashboardDetails>(dashboardDetailsUrl, JSON.stringify(request), { headers: this.constants.getSiteBuboHeader() })
    //       .pipe(
    //         tap(res => {
    //           // console.log(res);
    //           this.dashboardDetails = res;
    //           this.dashboardDetails$.next(this.dashboardDetails);
    //         })
    //       );
    //   }


    getProductOptions(productId): Observable<any> {
        const url = this.api_site_url+`product_options.php?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductModifiers(productId): Observable<any> {
        const url = this.api_site_url+`product_modifiers.php?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductModifiersSwatch(productId, colorCode:string) {
        console.log('checl code', colorCode);
        const url = this.api_site_url+`product_modifiers_colors.php?product_id=${productId}&color_code=${colorCode}`;
        console.log('checl url', url);
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    addCurrentUserCookie(productId, guestId:string): Observable<any> {
        console.log('checl code', guestId);
        const url = this.api_site_url+`add_user_data.php?product_id=${productId}&api_token=availble&guid=${guestId}`;
        console.log('checl url', url);
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    addUserLibraryData(): Observable<any> {
        const url = this.api_site_url+`add_library_data.php`;
        
        const lastsave = localStorage.getItem('lastsave');
        const meta_value = localStorage.getItem(lastsave);
        var canvasId = localStorage.getItem('DBUSERID');

        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'api_token' : 'avlable',
            'guid' : canvasId,
            'meta_key' : lastsave,
            'meta_value' : meta_value
        };

        console.log(body);

        return this.http.post<any>(url, body, { headers: apiHeaders })
    }

    getTokens(): Observable<any> {
        const url = `https://api.bigcommerce.com/stores/xvqlnelhjw/v3/storefront/api-token`;

        const apiHeaders = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': 'j4y99byjqk5x75n7aw2uy2muzv5av26'
        });


        var sometime = new Date; // now
        sometime.setDate(sometime.getDate() + 1);

        return this.http.post(url, {
            "channel_id": 1,
            "expires_at": sometime.getTime(),
            "allowed_cors_origins": [
                "http://localhost:4200"
            ]
        }, { headers: apiHeaders })
    }
}
