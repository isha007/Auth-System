import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';



@Injectable({providedIn: 'root'})
export class AuthService{

    private token: string;
    private authStatusListener = new Subject<boolean>();
    private isAuthenticated = false;
    private tokenTimer: any;
    private userType: string;

    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUserType() {
        return this.userType;
    }

    createUser(email: string, password: string, username: string,
         userphonenumber: number, useraddress: string, usertype: string){
             const authData: AuthData = {email: email, password: password,
                 username: username, userphonenumber: userphonenumber, useraddress: useraddress, usertype: usertype};
            this.http.post("http://localhost:3000/api/user/register", authData)
            .subscribe(response => {
                console.log(response);
            });
    }

    login(email: string, password: string) {
        const authData = {email: email, password: password};
        this.http.post<{token: string, expiresIn: number, userType: string}>("http://localhost:3000/api/user/login", authData)
        .subscribe(response => {
            const token = response.token;
            this.token = token;
            if(token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.userType = response.userType;
                console.log("usertype: " + this.userType);
                this.authStatusListener.next(true);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                console.log(expirationDate);
                this.saveAuthData(token, expirationDate, this.userType);
                this.router.navigate(['/']);
            }      
        });
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        console.log("authInformation: " + authInformation);
        if(!authInformation) {
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        console.log("expiresIn: " + expiresIn);
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userType = authInformation.userType;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userType = null;
        this.router.navigate(['/']);
        
    }

    private setAuthTimer(duration: number){
        console.log("setting timer: " + duration)
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userType: string) {
        localStorage.setItem("token", token);
        localStorage.setItem("expiration", expirationDate.toISOString());
        localStorage.setItem("usertype", userType);
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        localStorage.removeItem("usertype");
    }

    private getAuthData() {
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        const userType = localStorage.getItem("usertype");
        if(!token || !expirationDate){
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userType: userType
        }
    }
}