import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthData } from '../auth-data.model';

@Component({
    selector: 'app-user-register',
    templateUrl: './user-register.component.html',
    styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit{
    isLoading = false;
    user: AuthData;
    private mode = "create";
    private userId: string;
    

    constructor(public authService: AuthService, public router: ActivatedRoute) {}

    ngOnInit() {
        this.router.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has("userId")) {
                this.mode = "edit";
                this.userId = paramMap.get("userId");
                this.authService.getUser(this.userId).subscribe(userData => {
                    this.user = {id: userData._id,
                         username: userData.username, email: userData.email, password: userData.password,
                         useraddress: userData.useraddress, userphonenumber: userData.userphonenumber, usertype: userData.usertype};
                });
            }
            else {
                this.mode = "create";
                this.userId = null;
            }
        });
    }

    onRegister(form: NgForm){
        
        if(form.invalid) {
            return;
        }
        if (this.mode === "create") {
            this.authService.createUser(form.value.email, form.value.password, form.value.username,
                form.value.userphonenumber, form.value.useraddress, form.value.usertype);
        }
        else {
            this.authService.updateUser(this.userId, form.value.email, form.value.password, form.value.username,
                form.value.userphonenumber, form.value.useraddress, form.value.usertype)
        }
        

        

        form.resetForm();
        //this.dialogRef.close();
    }
}