import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Receita } from 'src/app/model/entities/Receita';
import { AuthService } from 'src/app/model/services/auth.service';
import { FirebaseService } from 'src/app/model/services/firebase.service';

@Component({
  selector: 'app-cadastrar',
  templateUrl: './cadastrar.page.html',
  styleUrls: ['./cadastrar.page.scss'],
})
export class CadastrarPage implements OnInit {
  public nome! : string;
  public ingrediente! : string[];
  public preparo! : string;
  public criador! : string;
  public tipo!: number;
  public image! : any;
  public imagem! : any;
  public receita! : Receita;
  public historia! : string;
  public novoIngrediente: string = '';
  public ingredientes: string[] = [];
  user : any;
  constructor(private alertController: AlertController,
    private auth : AuthService,
    private router : Router, private firebase : FirebaseService) {
      this.user = this.auth.getUsuarioLogado();
    }

  ngOnInit() {
  }

  uploadFile(imagem: any){
    this.image = imagem.files;
  }

  cadastrar() {
    if (this.nome && this.ingredientes && this.preparo) {
      let novo: Receita = new Receita(this.nome, this.ingredientes, this.preparo);
      novo.historia = this.historia? this.historia : '';
      novo.tipo = this.tipo? this.tipo : 0;
      novo.criador = this.criador? this.criador : '';
      novo.uid = this.user?.uid;
  
      if(this.image){
        this.firebase.uploadImage(this.image, novo)
        ?.then(()=>{this.router.navigate(["/home"]);})
      }else{
        novo.downloadURL = null;
        this.firebase.cadastrar(novo)
        .then(() =>  this.router.navigate(["/home"]))
        .catch((error) => {
          console.log(error);
          this.presentAlert("Erro", "Erro ao Atualizar Receita!");
        })
      }
    } else {
      this.presentAlert("Erro", "Nome, Ingredientes e Preparo são campos obrigatórios!");
    }
  }

  async presentAlert(subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header: 'Lista de receitas',
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  adicioneImagem(event: any) {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagem = reader.result;
      };
      reader.readAsDataURL(file);
    }
    this.uploadFile(event.target);
  }

  adicionarIngrediente() {
    if (this.novoIngrediente.trim() !== '') {
      this.ingredientes.push(this.novoIngrediente);
      this.novoIngrediente = ''; // Limpa o campo de entrada
    }
  }

  removerIngrediente(index: number) {
    this.ingredientes.splice(index, 1);
  }
}
