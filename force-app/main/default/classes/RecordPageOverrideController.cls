public class RecordPageOverrideController {
    @AuraEnabled
    public static String fieldData() {
        List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(
            Metadata.MetadataType.Layout,
            new List<String>{ 'Account-Account Layout' }
        );

        List<String> fieldList = new List<String>();

        Map<String, Object> resultMap = new Map<String, Object>();

        Metadata.Layout layoutMd = (Metadata.Layout) layouts.get(0);
        for (Metadata.LayoutSection section : layoutMd.layoutSections) {
            for (Metadata.LayoutColumn column : section.layoutColumns) {
                if (column.layoutItems != null) {
                    for (Metadata.LayoutItem item : column.layoutItems) {
                        fieldList.add(item.field);
                    }
                }
            }
        }

        Map<String, String> fieldVsDataType = new Map<String, String>();

        for (Schema.SObjectField eachField : Schema.SObjectType.Account.fields.getMap().values()) {
            if (fieldList.contains(eachField.getDescribe().name)) {
                fieldVsDataType.put(eachField.getDescribe().name, eachField.getDescribe().type.name());
            }
        }

        resultMap.put('fieldList', fieldList);
        resultMap.put('fieldVsDataType', fieldVsDataType);

        return JSON.serialize(resultMap);
    }
}