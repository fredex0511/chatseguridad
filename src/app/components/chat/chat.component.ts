import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  noResults: boolean = false; // Nueva variable para manejar el estado de no resultados
  messages: any[] = [];
  conversations: any[] = [];
  filteredConversations: any[] = [];
  selectedConversation: any = null;
  profile: any;
  user_id: any;
  newMessage: string = '';
  colores: any[] = ['#2fc7f8','#fcd131','#62d69e']
  selectedConversationIndex: number | null = null;
  pollingInterval: any;
  letras = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N','Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];


  constructor(
    public chatService : ChatService,
    public authService: AuthService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.authService.profile().subscribe(response => {
      this.profile = response.data;
      console.log(this.profile);
      
      this.user_id = this.profile.id;
  
      this.getConversations();
      
      this.filteredConversations = this.conversations.slice();
    });
  
    this.chatService.newMessage$.subscribe(conv_id => {
      this.handleNewMessage(conv_id);
    });
  
    this.chatService.newChat$.subscribe(chat => {
      this.getConversations();
    });
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo de polling cuando el componente se destruya
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  selectConversation(conversation: any, index: number): void {
    this.selectedConversation = conversation;
    this.selectedConversationIndex = index;
    this.selectedConversation.check = false;

    this.chatService.getMessages(conversation._id, this.user_id).subscribe(response => {
      this.messages = response.data.map((day:any) => ({
        date: day.date,
        messages: day.messages.map((message: any) => ({
          ...message,
          message: this.descifrarTexto(message.message),
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }))
      })) || [];
      
      setTimeout(() => {
        this.scrollToBottom();
      }, 0); 
    });

    // Iniciar el polling para verificar nuevos mensajes
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval); // Limpiar el intervalo anterior si existiera
    }

    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages(conversation._id);
    }, 5000); // Intervalo de 5 segundos (ajústalo según sea necesario)
  }

  private checkForNewMessages(conversationId: string): void {
    this.chatService.getMessages(conversationId, this.user_id).subscribe(response => {
      const newMessages = response.data.map((day: any) => ({
        date: day.date,
        messages: day.messages.map((message: any) => ({
          ...message,
          message: this.descifrarTexto(message.message),
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }))
      })) || [];

      // Comparar los mensajes existentes con los nuevos
      if (JSON.stringify(newMessages) !== JSON.stringify(this.messages)) {
        this.messages = newMessages;
        this.scrollToBottom();
      }
    });
  }
  

filterConversations(query: string): void {
  if (!query) {
    this.filteredConversations = this.conversations.slice();
    this.noResults = false; // Resetear estado de no resultados
    return;
  }

  this.filteredConversations = this.conversations.filter(conversation =>
    conversation.user_name.toLowerCase().includes(query.toLowerCase())
  );

  this.noResults = this.filteredConversations.length === 0; // Actualizar el estado si no hay resultados
}

  refreshData(): void {
    // lógica para refrescar los datos
  }

  getBackgroundColor(index: number): string {
    return this.colores[index % this.colores.length];
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '' || !this.selectedConversation) {
      return;
    }
  
    const _id = this.selectedConversation._id;
    const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato 'YYYY-MM-DD'
  
    const mensajeCifrado = this.cifrarTexto(this.newMessage);
  
    this.chatService.sendMessage(mensajeCifrado, _id, this.user_id).subscribe(response => {
      console.log(response);
  
      const newMessage = {
        user: this.user_id,
        message: mensajeCifrado,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
  
      if (!this.messages) {
        this.messages = [];
      }
  
      const existingDay = this.messages.find(day => day.date === currentDate);
      const decryptedMessage = this.descifrarTexto(newMessage.message); // Desencriptar el mensaje
  
      if (existingDay) {
        // Agrega el objeto newMessage completo con el mensaje descifrado
        existingDay.messages.push({
          ...newMessage, // Copia las propiedades de newMessage
          message: decryptedMessage // Reemplaza el mensaje cifrado con el descifrado
        });
      } else {
        this.messages.push({
          date: currentDate,
          messages: [{
            ...newMessage, // Copia las propiedades de newMessage
            message: decryptedMessage // Reemplaza el mensaje cifrado con el descifrado
          }] // Agrega el objeto newMessage completo
        });
      }
  
      this.newMessage = '';
      this.scrollToBottom();
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  
  

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scroll({
          top: this.messagesContainer.nativeElement.scrollHeight,
          behavior: 'smooth'  // Desplazamiento suave
        });
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
  
  

  handleNewMessage(conv_id: any): void {
    const conversationId = conv_id;

    if (this.selectedConversation && this.selectedConversation._id === conversationId) {
      this.chatService.getMessages(conversationId, this.user_id).subscribe(response => {
        this.messages = response.data.map((day:any) => ({
          date: day.date,
          messages: day.messages.map((message:any) => ({
            ...message,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }))
        })) || [];
        this.scrollToBottom();
      });
    } else {
      this.getConversations();
    }
  }

    getConversations() {
      this.chatService.getConversations(this.user_id).subscribe(response => {
        if (response.status) {
          this.conversations = response.data.map((conversation:any) => {
            const participant = conversation.participants.find((p:any) => p.id != this.user_id);
            const me = conversation.participants.find((p:any) => p.id === this.user_id)
            return {
              user_img: null, 
              user_name: participant && participant.name ? participant.name : 'Desconocido',
              check: participant.pending_messages,
              _id: conversation._id,
              update: conversation.updatedAt,
              pending_messages: me.pending_messages
            };
          });
          this.filteredConversations = this.conversations.slice();
        }
      }, error => {
        console.error('Error fetching conversations:', error);
      });
    }

    descifrarTexto(textoCifrado: string): string {
      return textoCifrado.split('').map(char => {
          const index = this.letras.indexOf(char.toUpperCase());
          if (index !== -1) {
              // Retroceder al carácter anterior en el alfabeto, volver a 'Z' si es 'A'
              const descifradoChar = this.letras[(index - 1 + this.letras.length) % this.letras.length];
              // Devuelve el carácter descifrado manteniendo el caso original
              return char === char.toUpperCase() ? descifradoChar : descifradoChar.toLowerCase();
          }
          return char; // Devolver el mismo carácter si no es una letra
      }).join('');
  }  

    cifrarTexto = (texto: string): string => {
      return texto.split('').map(char => {
          const index = this.letras.indexOf(char.toUpperCase()); // Encuentra el índice del carácter en mayúscula
          if (index !== -1) {
              const cifradoChar = this.letras[(index + 1) % this.letras.length]; // Cifra el carácter
              // Devuelve el carácter cifrado manteniendo el caso original
              return char === char.toUpperCase() ? cifradoChar : cifradoChar.toLowerCase();
          }
          return char; // Devolver el mismo carácter si no es una letra
      }).join('');
    };

}
