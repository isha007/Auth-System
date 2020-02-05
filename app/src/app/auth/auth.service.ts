import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';

import { AuthData } from './auth-data.model';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthService{

    private token: string;
    private authStatusListener = new Subject<boolean>();
    private isAuthenticated = false;
    private tokenTimer: any;
    private userType: string;
    private users: AuthData[] = [];
    private usersUpdated = new Subject<AuthData[]>();

    constructor(private http: HttpClient, private router: Router) {}

    getUsers() {
        this.http.get<{messages: string, users: any}>('http://localhost:3000/api/user')
        .pipe(map((userData) => {
            return userData.users.map(user => {
                return {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    userphonenumber: user.userphonenumber,
                    useraddress: user.useraddress,
                    usertype: user.usertype
                };
            });
        }))
        .subscribe((user)=>{
            this.users = user;
            this.usersUpdated.next([...this.users]);
        });
    }

    getUserDataSource(): Observable<AuthData[]> {
        return this.http.get<{messages: string, users: any}>('http://localhost:3000/api/user')
        .pipe(map((userData) => {
            return userData.users.map(user => {
                return {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    userphonenumber: user.userphonenumber,
                    useraddress: user.useraddress,
                    usertype: user.usertype
                };
            });
        }));
    }

    getUserUpdateListener() {
        return this.usersUpdated.asObservable();
    }

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
             const authData: AuthData = {id: null, email: email, password: password,
                 username: username, userphonenumber: userphonenumber, useraddress: useraddress, usertype: usertype};
            this.http.post("http://localhost:3000/api/user/register", authData)
            .subscribe(response => {
                console.log(response);
            }, error => {
                console.log(error);
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

  
    userDelete(userId: string){
        
        this.http.delete("http://localhost:3000/api/user/" + userId)
        .subscribe(() => {
            const updateUsers = this.users.filter(user=> user.id !== userId);
            this.users = updateUsers;
            this.usersUpdated.next([...this.users]);
        });
    }  

    getUser(id: string) {
        return this.http.get<{_id: string, username: string, email: string, password: string, useraddress: string, userphonenumber: number, usertype: string}>(
            "http://localhost:3000/api/user/" + id);
    }

    updateUser(id: string, email: string, password: string, username: string, userphonenumber: number, useraddress: string, usertype: string) {
        const user: AuthData = {
            id: id,
            email: email,
            password: password,
            username: username,
            userphonenumber: userphonenumber,
            useraddress: useraddress,
            usertype: usertype
                };
        this.http.put("http://localhost:3000/api/user/" + id, user)
        .subscribe(response => {
            const updatedUser = [...this.users];
            const oldUserIndex = updatedUser.findIndex(p => p.id === user.id);
            // console.log("user.id: " + user.id);
            // console.log("oldUserIndex: " + oldUserIndex);
            // console.log("user: " + user);
            updatedUser[oldUserIndex] = user;
            this.users = updatedUser;
            //console.log("this.users: " + this.users);
            this.usersUpdated.next([...this.users]);    
            this.router.navigate(["adminpage"]);
        });        

    }
    
}