/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api } from 'lwc';

export default class VirtualTableCell extends LightningElement {
    @api type;
    @api value;
    @api typeAttributes;
    @api rowHeightStyle;
    @api column = {};

    _lowercaseType;

    connectedCallback() {
        requestAnimationFrame(() => {
            this._lowercaseType = this.type?.toLowerCase();
        });
    }

    get formattedTypeAttributes() {
        return this.typeAttributes || {};
    }

    get numberFormatStyle() {
        if (this._lowercaseType === 'currency') {
            return {
                style: 'currency',
                currencyCode: this.formattedTypeAttributes.currencyCode || 'USD',
                currencyDisplayAs: this.formattedTypeAttributes.currencyDisplayAs || 'symbol',
                minimumFractionDigits: this.formattedTypeAttributes.minimumFractionDigits,
                maximumFractionDigits: this.formattedTypeAttributes.maximumFractionDigits
            };
        }
        if (this._lowercaseType === 'percent') {
            return {
                style: 'percent',
                minimumFractionDigits: this.formattedTypeAttributes.minimumFractionDigits,
                maximumFractionDigits: this.formattedTypeAttributes.maximumFractionDigits
            };
        }
        return {
            minimumFractionDigits: this.formattedTypeAttributes.minimumFractionDigits,
            maximumFractionDigits: this.formattedTypeAttributes.maximumFractionDigits
        };
    }

    get dateFormatAttributes() {
        return {
            year: this.formattedTypeAttributes.year || 'numeric',
            month: this.formattedTypeAttributes.month || 'numeric',
            day: this.formattedTypeAttributes.day || 'numeric',
            weekday: this.formattedTypeAttributes.weekday,
            era: this.formattedTypeAttributes.era,
            timeZone: this.formattedTypeAttributes.timeZone,
            timeZoneName: this.formattedTypeAttributes.timeZoneName
        };
    }

    get dateTimeFormatAttributes() {
        return {
            ...this.dateFormatAttributes,
            hour: this.formattedTypeAttributes.hour || '2-digit',
            minute: this.formattedTypeAttributes.minute || '2-digit',
            second: this.formattedTypeAttributes.second,
            hourCycle: this.formattedTypeAttributes.hourCycle
        };
    }

    get urlTarget() {
        return this.formattedTypeAttributes.target || '_blank';
    }

    get urlLabel() {
        return this.formattedTypeAttributes.label || this.value;
    }

    get isBoolean() {
        return this._lowercaseType === 'boolean' || this._lowercaseType === 'checkbox';
    }

    get isNumber() {
        return (
            this._lowercaseType === 'currency' || this._lowercaseType === 'number' || this._lowercaseType === 'percent'
        );
    }

    get isDate() {
        return this._lowercaseType === 'date' || this._lowercaseType === 'date-local';
    }

    get isDateTime() {
        return this._lowercaseType === 'datetime';
    }

    get isEmail() {
        return this._lowercaseType === 'email';
    }

    get isPhone() {
        return this._lowercaseType === 'phone';
    }

    get isUrl() {
        return this._lowercaseType === 'url';
    }

    get isLocation() {
        return this._lowercaseType === 'location';
    }

    get isText() {
        return this._lowercaseType === 'text' || this._lowercaseType === 'string' || !this.type;
    }
}
