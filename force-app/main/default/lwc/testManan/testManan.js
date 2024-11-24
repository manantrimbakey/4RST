import { LightningElement } from 'lwc';

export default class TestManan extends LightningElement {

    number1 = 10;
    number2 = 20;

    handleClick() {
        console.log(this.template.querySelector('p'));
    }
}