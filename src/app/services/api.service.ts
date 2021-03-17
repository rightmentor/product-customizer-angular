import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

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
        const url = `https://trackstatus.net/product-customizer/api/testapi.php?product_id=${productId}`;

        const apiHeaders = new HttpHeaders({
        });
        
        return this.http.get(url, { headers: apiHeaders })

        // const url = 'https://simonstampcom.mybigcommerce.com/graphql';

        // const apiHeaders = new HttpHeaders({
        //     'Content-Type': 'application/json',
        //     'Origin': 'https://developer.bigcommerce.com',
        //     'Authorization': 'Bearer {{settings.storefront_api.token}}'
        // });
        // const query = JSON.stringify({ query: '{site {products(entityIds:[112], first: 5) {edges {node {name variants(first: 25) {   edges {     node {       sku       defaultImage {         url(width: 1000)       }     }   } } productOptions(first: 5) {   edges {     node {       entityId       displayName       isRequired       ... on CheckboxOption {         checkedByDefault       }       ... on MultipleChoiceOption {         values(first: 10) {           edges {             node {               entityId               label               isDefault               ... on SwatchOptionValue {hexColors imageUrl(width: 200)}}}}}}}}}}}}}' });
        // return this.http.post(url, query, { headers: apiHeaders })
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
