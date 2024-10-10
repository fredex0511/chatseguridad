import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

export class SigninComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  error = '';
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [ '', [Validators.required, Validators.email,
        Validators.minLength(5)]],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    if (this.loginForm.invalid) {
      this.error = '¡Credenciales inválidas!';
    } else {
      this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe(async (response) => {
        const token = response.data.access_token.token
        console.log(token)
        if (token) {
          localStorage.setItem('access_token', token);
          console.log("navegando")
        this.router.navigate(['/chat']);
        } else {
          this.error = 'Acceso no autorizado';
        }
      }, (error) => {
          this.error = 'Datos incorrectos';
          this.submitted = false;
      });
    }
  }

}
