import { LightningElement } from "lwc";
import { createRecord, updateRecord } from "lightning/uiRecordApi";
import DAILY_TASK_OBJECT from "@salesforce/schema/DailyTask__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getLatestInProgressTask from "@salesforce/apex/NotesManagerController.getLatestInProgressTask";

export default class NotesManagementLwc extends LightningElement {
    get labelButton() {
        return this.isStarted ? "Stop" : "Start";
    }
    isStarted = false;
    displayTime = "00:00:00";
    secondsElapsed = 0;
    intervalId;
    startDateTime = null;
    endDateTime = null;
    taskEntryModal = false;
    currentTaskId = "";
    showSpinner = true;

    connectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.fetchRecords();
    }

    fetchRecords() {
        this.showSpinner = true;
        getLatestInProgressTask()
            .then((runningTask) => {
                // debugger;
                if (Array.isArray(runningTask) && runningTask?.length && runningTask?.[0]) {
                    let element = runningTask?.[0];
                    this.currentTaskId = element.Id;
                    this.isStarted = true;

                    let button = this.template.querySelector("[data-element='taskLogButton']");
                    button.classList.remove("slds-button_brand");
                    button.classList.add("slds-button_destructive");

                    const startDateTime = new Date(element.StartTime__c);
                    this.startDateTime = startDateTime;
                    const now = new Date();
                    const diffInSeconds = Math.floor((now - startDateTime) / 1000);
                    this.secondsElapsed = diffInSeconds;

                    this.intervalId = setInterval(() => {
                        try {

                        this.updateTimer();
                        } catch (e) {

                        }
                    }, 1000);

                    this.showSpinner = false;
                }
                this.showSpinner = false;
            })
            .catch((err) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: `An error occured while creating the task ${err}`,
                        variant: "success"
                    })
                );
                this.showSpinner = false;
            });
    }

    handleRefreshButtonClick() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.fetchRecords();
    }

    handleTaskLogButtonClick() {
        this.isStarted = this.isStarted ? false : true;
        this.showSpinner = true;
        if (this.isStarted) {
            let d = new Date();
            this.startDateTime = d;
            this.intervalId = setInterval(() => {
                try {
                    this.updateTimer();

                } catch (e) {

                }
            }, 1000);
            let button = this.template.querySelector("[data-element='taskLogButton']");
            button.classList.remove("slds-button_brand");
            button.classList.add("slds-button_destructive");

            this.taskEntryModalData.StartTime__c = this.startDateTime.toISOString();
            const recordInput = { apiName: DAILY_TASK_OBJECT.objectApiName, fields: this.taskEntryModalData };

            createRecord(recordInput)
                .then((task) => {
                    this.currentTaskId = task.id;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Daily Task started successfully!",
                            variant: "success"
                        })
                    );
                    this.showSpinner = false;
                })
                .catch((err) => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Error",
                            message: `An error occured while creating the task ${err}`,
                            variant: "success"
                        })
                    );
                    this.showSpinner = false;
                });
        } else {
            clearInterval(this.intervalId);
            this.displayTime = "00:00:00";
            this.secondsElapsed = 0;
            this.endDateTime = new Date();
            let button = this.template.querySelector("[data-element='taskLogButton']");
            button.classList.remove("slds-button_destructive");
            button.classList.add("slds-button_brand");
            this.taskEntryModal = true;
            this.showSpinner = false;
        }
    }

    updateTimer() {
        this.secondsElapsed++;
        const date = new Date(null);
        date.setSeconds(this.secondsElapsed);
        const timeString = date.toISOString().substring(11, 19);
        this.displayTime = timeString;
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    handleSaveTaskEntryModalClick() {
        // debugger;
        this.showSpinner = true;
        this.taskEntryModalData.StartTime__c = this.startDateTime.toISOString();
        this.taskEntryModalData.EndTime__c = this.endDateTime.toISOString();
        this.taskEntryModalData.Id = this.currentTaskId;
        const recordInput = { fields: this.taskEntryModalData };
        updateRecord(recordInput)
            .then((task) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Daily Task updated successfully!",
                        variant: "success"
                    })
                );
                this.closeTaskEntryModal();

                this.currentTaskId = "";
                this.taskEntryModalData = {};
                this.startDateTime = null;
                this.endDateTime = null;
                this.showSpinner = false;
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: `An error occured while creating the task ${error}`,
                        variant: "success"
                    })
                );
                console.error(error);
                this.closeTaskEntryModal();
                this.showSpinner = false;
            });
    }

    closeTaskEntryModal() {
        this.taskEntryModal = false;
    }

    taskEntryModalData = {};

    handleChange(evt) {
        // debugger;
        if (evt?.target) {
            let obj = this.taskEntryModalData;
            let methodsMap = {
                TaskTitle: (evt, obj) => {
                    obj.Name = evt.target.value;
                },
                TaskDescription: (evt, obj) => {
                    obj.Description__c = evt.target.value;
                }
            };
            methodsMap[evt.target.dataset.element]?.(evt, obj);
            this.taskEntryModalData = obj;
        }
    }
}