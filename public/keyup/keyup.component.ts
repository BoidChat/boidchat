

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
    selector: 'app-key-up',
    templateUrl: `./keyup.component.html`
  })
export class KeyUpComponent {
  
    values = [];
    onEnter(value: string) {
  
    for(var i=value.length;i>0;i--){
      this.values[i]=this.values[i-1];
    }
    this.values[0] = value; }
  }
  