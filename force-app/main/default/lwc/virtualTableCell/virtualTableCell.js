import { LightningElement, api } from 'lwc';

export default class VirtualTableCell extends LightningElement {
    @api type;
    @api value;
    @api typeAttributes;
    @api rowHeightStyle;
    @api column = {};

    _unreactiveProp = {
        rafIdConnectedCallback: null,
        rafIdFormattedTypeAttributes: null
    };

    _lowercaseType;

    connectedCallback() {
        this._lowercaseType = this.type?.toLowerCase();
    }

    get formattedTypeAttributes() {
        if (!this._formattedTypeAttributes) {
            this._formattedTypeAttributes = this.typeAttributes || {};
        }
        return this._formattedTypeAttributes;
    }

    get numberFormatStyle() {
        if (!this._numberFormatStyle) {
            this._numberFormatStyle = this._computeNumberFormatStyle();
        }
        return this._numberFormatStyle;
    }

    _computeNumberFormatStyle() {
        const attrs = this.formattedTypeAttributes;
        if (this._lowercaseType === 'currency') {
            return {
                style: 'currency',
                currencyCode: attrs.currencyCode || 'USD',
                currencyDisplayAs: attrs.currencyDisplayAs || 'symbol',
                minimumFractionDigits: attrs.minimumFractionDigits,
                maximumFractionDigits: attrs.maximumFractionDigits
            };
        }
        if (this._lowercaseType === 'percent') {
            return {
                style: 'percent',
                minimumFractionDigits: attrs.minimumFractionDigits,
                maximumFractionDigits: attrs.maximumFractionDigits
            };
        }
        return {
            minimumFractionDigits: attrs.minimumFractionDigits,
            maximumFractionDigits: attrs.maximumFractionDigits
        };
    }

    get dateFormatAttributes() {
        if (!this._dateFormatAttributes) {
            this._dateFormatAttributes = this._computeDateFormatAttributes();
        }
        return this._dateFormatAttributes;
    }

    _computeDateFormatAttributes() {
        const attrs = this.formattedTypeAttributes;
        return {
            year: attrs.year || 'numeric',
            month: attrs.month || 'numeric',
            day: attrs.day || 'numeric',
            weekday: attrs.weekday,
            era: attrs.era,
            timeZone: attrs.timeZone,
            timeZoneName: attrs.timeZoneName
        };
    }

    get dateTimeFormatAttributes() {
        if (!this._dateTimeFormatAttributes) {
            this._dateTimeFormatAttributes = {
                ...this.dateFormatAttributes,
                hour: this.formattedTypeAttributes.hour || '2-digit',
                minute: this.formattedTypeAttributes.minute || '2-digit',
                second: this.formattedTypeAttributes.second,
                hourCycle: this.formattedTypeAttributes.hourCycle
            };
        }
        return this._dateTimeFormatAttributes;
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
        return this._lowercaseType === 'text' || this._lowercaseType === 'string';
    }
}