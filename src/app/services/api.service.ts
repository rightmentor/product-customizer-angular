import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // api_site_url = 'https://webspeedo.com/simonstamp/api/';
    // api_site_url = 'https://simonstamp.webspeedo.com/api/';
    api_site_url = 'https://simonstamp.projectsofar.info/wp-json/simonstamp/v1/';
    api_site_url_direct = 'https://simonstamp.projectsofar.info/api/';
    @Output() getLoggedInName: EventEmitter<any> = new EventEmitter();
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

    //Login function start
    userlogin(username, password) {
        const url = this.api_site_url+`login`;
        return this.http.post<any>(url, { username, password }).pipe(tap(Usermodule => {
                this.setToken(Usermodule[0].guid);
                this.getLoggedInName.emit(true);
                return Usermodule;
            }));
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
    }
       
    getToken() {
        return localStorage.getItem('token');
    }
    
    deleteToken() {
        localStorage.removeItem('token');
    }
    
    isLoggedIn() {
        const usertoken = this.getToken();
        if (usertoken != null) {
            return true
        }
        return false;
    }
    //login function end

    getProductdetails(productId): Observable<any>  {
        const url = this.api_site_url+`product_details/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    
    }

    getProductOptions(productId): Observable<any> {
        const url = this.api_site_url+`product_options/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductOptionsColor(productId): Observable<any> {
        const url = this.api_site_url+`get_all_color_swatch/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductOptionsbgColor(productId): Observable<any> {
        const url = this.api_site_url+`get_all_bg_color_swatch/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }


    getProductOptionsMountingColor(productId): Observable<any> {
        const url = this.api_site_url+`get_all_mounting_swatch/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductModifiers(productId): Observable<any> {
        const url = this.api_site_url+`product_modifiers/?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getProductModifiersSwatch(productId, colorCode:string) {
        console.log('checl code', colorCode);
        const url = this.api_site_url+`product_modifiers_colors/?product_id=${productId}&color_code=${colorCode}`;
        console.log('checl url', url);
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getSavedLibraries( id, productid ): Observable<any>  {
        console.log('user ID', id);
        if(this.isLoggedIn())
        {
            id = 1;
            console.log("loggedin");
        }
        const url = this.api_site_url+`get_library_data/?guid=${id}&product_id=${productid}&auid=1`;
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getSavedLibrariesTab( id, productid, auid ): Observable<any>  {
        console.log('user ID', id);
        if(this.isLoggedIn())
        {
            id = 1;
            console.log("loggedin");
        }
        const url = this.api_site_url+`get_library_data_tab/?guid=${id}&product_id=${productid}&auid=${auid}`;
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getSavedImageLibrariesTab( id, productid, auid ): Observable<any>  {
        console.log('user ID', id);
        if(this.isLoggedIn())
        {
            id = 1;
            console.log("loggedin");
        }
        const url = this.api_site_url+`get_image_library_data_tab/?guid=${id}&product_id=${productid}&auid=${auid}`;
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    getAllLibraries( id ): Observable<any>  {
        //console.log('search', id);

        const url = this.api_site_url+`get_all_library_data/?search=${id}`;
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    deleteCanvas( id ): Observable<any> {
        const url = this.api_site_url+`delete_canvas_data/`;
        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'auth' : 'avlabs',
            'data' : id
        };

        return this.http.post<any>(url, body, { headers: apiHeaders })
    }


    deleteImage( id ): Observable<any> {
        const url = this.api_site_url+`delete_image_data/`;
        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'auth' : 'avlabs',
            'data' : id
        };

        return this.http.post<any>(url, body, { headers: apiHeaders })
    }

    addCurrentUserCookie(productId, guestId:string): Observable<any> {
        console.log('checl code', guestId);
        const url = this.api_site_url_direct+`add_user_data.php?product_id=${productId}&api_token=availble&guid=${guestId}`;
        console.log('checl url', url);
        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })
    }

    addUserLibraryData(data: any, option_id): Observable<any> {
        const url = this.api_site_url_direct+`add_library_data.php`;
        const lastname = data.name;
        const lastdesc = data.description;
        const lastkeyw = data.keyword;
        const fabricatorImage = data.fabricatorImage;
        const lastsave = localStorage.getItem('lastsave');
        const meta_value = localStorage.getItem(lastsave);
        //console.log(meta_value);
        var canvasId = localStorage.getItem('DBUSERID');
        if(this.isLoggedIn())
        {
            canvasId = '1';
        }

        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'api_token' : 'avlable',
            'guid' : canvasId,
            'name' : lastname,
            'canvas_size' : option_id,
            'description' : lastdesc,
            'keywords' : lastkeyw,
            'meta_key' : lastsave,
            'meta_value' : meta_value,
            'fabricatorImage' : fabricatorImage
        };

        console.log(body);

        return this.http.post<any>(url, body, { headers: apiHeaders })
    }

    addUserImageLibraryData(data: any, option_id): Observable<any> {
        const url = this.api_site_url_direct+`add_image_library_data.php`;
        const lastname = data.name;
        const lastdesc = data.description;
        const lastkeyw = data.keyword;
        const lastsave = localStorage.getItem('lastsave');
        const meta_value = data.image;
        //console.log(meta_value);
        var canvasId = localStorage.getItem('DBUSERID');
        if(this.isLoggedIn())
        {
            canvasId = '1';
        }

        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'api_token' : 'avlable',
            'guid' : canvasId,
            'name' : lastname,
            'canvas_size' : option_id,
            'description' : lastdesc,
            'keywords' : lastkeyw,
            'meta_key' : 'Image',
            'meta_value' : meta_value
        };

        console.log(body);

        return this.http.post<any>(url, body, { headers: apiHeaders })
    }

    addToCartData(data: any): Observable<any> {
        const url = this.api_site_url+`get_product_variants/`;
        const apiHeaders = new HttpHeaders({
            'cache-control': 'no-cache',
            'content-type': 'application/json',
        });
        
        const body = {
            'auth' : 'avlabs',
            'data' : JSON.stringify(data)
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
