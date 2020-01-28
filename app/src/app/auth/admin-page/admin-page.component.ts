import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


import { AuthData } from '../auth-data.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { UserRegisterComponent } from '../user-registration/user-register.component';


@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['admin-page.component.css']
})
export class AdminPageComponent implements OnInit{
    isLoading = false;
    users: AuthData[] = [];
    private usersSub: Subscription;
    private authStatusSubs: Subscription;
    userIsAuthenticated = false;
    userType: string;
    


    constructor(private authService: AuthService, public dialog: MatDialog) {}

    ngOnInit() {
        
        this.isLoading = true;
        this.authService.getUsers();
        this.userType = this.authService.getUserType();
        this.usersSub = this.authService.getUserUpdateListener()
        .subscribe((users: AuthData[])=>{
            this.isLoading = false;
            this.users = users;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSubs = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.userType = this.authService.getUserType();
        });

    }

    
    ngOnDestroy() {
        this.usersSub.unsubscribe();
        this.authStatusSubs.unsubscribe();
    }

    onDeleteUser(userId: string) {
        
        this.isLoading=true;
        this.authService.userDelete(userId);
    }

    // openDialog(): void {
    //     const dialogRef = this.dialog.open(UserRegisterComponent, {
    //         height: '100%',
    //         width: '50%'
          
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //         this.ngOnInit();
    //       });
        
    // }
}