import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseURL from './helper';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  loginStatusSubject: any;

  constructor(private http:HttpClient) { }
  //add user 
  public addUser(user:any){
    return this.http.post(`${baseURL}/user/`,user);
  }

  //current-user
  public getCurrentUser(){
    return this.http.get(`${baseURL}/current-user`);
  }
  //generate token
  public generateToken(credentials:any){
    return this.http.post(`${baseURL}/generate-token`,credentials)
  }

  //set token in local storage
  public loginUser(token: string){
    localStorage.setItem('token',token);
    return true;
  }

  // user is login or not
  public isLoggedIn(){
    let tokenStr = localStorage.getItem('token')
    if(tokenStr==undefined || tokenStr=='' || tokenStr==null){
      return false;
    }
    else{
      return true;
    }
  }
   //logout
   public logout(){
    localStorage.clear();
    return true;
   }

   //get token
   public getToken(){
    return localStorage.getItem('token')
   }

   //set user detail
   public setUser(user: any){
    localStorage.setItem("user",JSON.stringify(user));
   }

   //getUser
   public getUser(){
    let userStr = localStorage.getItem('user');
    if(userStr!=null){
      return JSON.parse(userStr);
    }else{
      this.logout();
      return null;
    }
   }

   //get user role 
   public getUserRole(){
    let user = this.getUser();
    return user.authorities[0].authority;
   }
}
