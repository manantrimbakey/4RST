public without sharing class NotesManagerController {
    @AuraEnabled
    public static Object getLatestInProgressTask() {
        return [
           SELECT Id, StartTime__c, EndTime__c
            FROM DailyTask__c
            WHERE EndTime__c = NULL 
            ORDER BY StartTime__c DESC
            LIMIT 1
        ];
    }
}