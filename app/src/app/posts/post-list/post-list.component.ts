import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit, OnDestroy {
    isLoading = false;
    posts: Post[] = [];
    private postsSub: Subscription;
    private authStatusSubs: Subscription;
    userIsAuthenticated = false;
    userType: string;
    constructor(public postsService: PostsService, private authService: AuthService) {}

    ngOnInit(){
        this.isLoading = true;
        this.postsService.getPosts();
        this.userType = this.authService.getUserType();
        this.postsSub = this.postsService.getPostUpdateListener()
        .subscribe((posts: Post[])=>{
            this.isLoading = false;
            this.posts = posts;
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
        this.postsSub.unsubscribe;
        this.authStatusSubs.unsubscribe();
    }
    
    onDelete(postId: string){
        this.isLoading = true;
        this.postsService.postDelete(postId);
    }
}