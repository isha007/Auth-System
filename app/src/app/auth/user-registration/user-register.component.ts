import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-user-register',
    templateUrl: './user-register.component.html',
    styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent{
    isLoading = false;

    constructor(public authService: AuthService) {}
    onRegister(form: NgForm){
        if(form.invalid) {
            return;
        }

        this.isLoading = true;

        this.authService.createUser(form.value.email, form.value.password, form.value.username,
            form.value.userPhoneNumber, form.value.userAddress, form.value.userType);

        form.resetForm();
    }
}