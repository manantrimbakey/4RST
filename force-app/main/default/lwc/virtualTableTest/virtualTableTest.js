import { LightningElement, track } from 'lwc';

export default class VirtualTableTest extends LightningElement {
    isLoading = true;
    allowRowSelection = true;

    @track rowData = [];
    @track columns = [];

    connectedCallback() {
        this.generateRowData();
        this.generateColumns();
        this.isLoading = false;
    }

    generateRowData() {
        let rowData = [];
        // Generate 100 sample rows with various data types
        for (let i = 0; i < 500000; i++) {
            rowData.push({
                id: i,
                name: `Task ${i}`,
                date: new Date(2024, 0, i + 1).toISOString(),
                amount: Math.round(Math.random() * 10000) / 100,
                status: Math.random() > 0.5 ? 'Active' : 'Inactive',
                progress: Math.floor(Math.random() * 100),
                url: `https://example.com/task/${i}`,
                email: `user${i}@example.com`,
                phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
            });
        }
        this.rowData = rowData;
    }

    generateColumns() {
        let columns = [
            { fieldName: 'name', label: 'Task Name', type: 'text' },
            {
                fieldName: 'date',
                label: 'Due Date',
                type: 'date',
                typeAttributes: {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                }
            },
            {
                fieldName: 'amount',
                label: 'Budget',
                type: 'currency',
                typeAttributes: {
                    currencyCode: 'USD',
                    minimumFractionDigits: 2
                }
            },
            { fieldName: 'status', label: 'Status', type: 'text' },
            { fieldName: 'progress', label: 'Progress', type: 'percent' },
            { fieldName: 'isSelected', label: 'Selected', type: 'boolean' },
            {
                fieldName: 'url',
                label: 'Link',
                type: 'url',
                typeAttributes: {
                    label: { fieldName: 'name' },
                    target: '_blank'
                }
            },
            { fieldName: 'email', label: 'Email', type: 'email' },
            { fieldName: 'phone', label: 'Phone', type: 'phone' }
        ];
        this.columns = columns;
    }
}