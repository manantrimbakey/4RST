import { LightningElement, api, track } from "lwc";
import fieldData from "@salesforce/apex/RecordPageOverrideController.fieldData";
export default class RecordPageOverride extends LightningElement {
    @api objectName = null;
    @api recordId = null;

    @track fields = [];

    isLoading = true;

    connectedCallback() {
        fieldData()
            .then((r) => {
                debugger;
                let index = 0;
                let response = JSON.parse(r);
                if (response && response.fieldVsDataType) {
                    let fieldListFromMap = Object.keys(response.fieldVsDataType);
                    fieldListFromMap.forEach((element) => {
                        let dataType = response?.fieldVsDataType?.[element];
                        // if (dataType == "PICKLIST" || dataType == "STRING") {
                        //     dataType = "STRING";
                        // }
                        if (
                            element &&
                            response?.fieldVsDataType?.[element]
                            // && dataType == "STRING"
                        ) {
                            let obj = {
                                index: "" + index,
                                fieldName: element,
                                dataType: dataType
                                // isString: dataType == "STRING" ? true : false
                            };
                            index++;
                            this.fields.push(obj);
                        }
                    });
                }
                // console.log("@@Manan-->" + JSON.stringify(this.fields));s
                this.isLoading = false;
            })
            .catch((e) => {
                console.error(e);
            });
    }
}