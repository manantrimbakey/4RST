/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';

export default class VirtualTable extends LightningElement {
    @track visibleData = [];
    @api
    get columns() {
        return this._columns || [];
    }
    set columns(value) {
        this._columns = value;
        this.processColumns();
    }

    @api
    get rowData() {
        return this.allData;
    }
    set rowData(value) {
        this.allData = value || [];
        this.updateVisibleData();
    }

    allData = [];
    _columns = [];
    processedColumns = [];

    // Configuration
    rowHeight = 40;
    nodePadding = 5;
    viewportHeight = 400;
    scrollTop = 0;

    processColumns() {
        if (!this._columns) return;

        this.processedColumns = this._columns.map((column) => ({
            ...column,
            key: column.fieldName || column.label,
            type: column.type || 'text'
        }));
    }

    // Computed properties for virtual scrolling
    get totalContentHeight() {
        return this.allData.length * this.rowHeight;
    }

    get startNode() {
        let start = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
        return Math.max(0, start);
    }

    get visibleNodesCount() {
        let count = Math.ceil(this.viewportHeight / this.rowHeight) + 2 * this.nodePadding;
        return Math.min(this.allData.length - this.startNode, count);
    }

    get offsetY() {
        return this.startNode * this.rowHeight;
    }

    get contentStyle() {
        return `height: ${this.totalContentHeight}px; position: relative;`;
    }

    get offsetStyle() {
        return `transform: translateY(${this.offsetY}px); position: absolute; width: 100%;`;
    }

    get rowHeightStyle() {
        return `height: ${this.rowHeight}px;`;
    }

    connectedCallback() {
        // this.generateData(840000); // Generate sample data
        // this.generateData(500000); // Generate sample data
        this.updateVisibleData();
    }

    // generateData(count) {
    //     for (let i = 0; i < count; i++) {
    //         this.allData.push({
    //             id: i,
    //             name: `User ${i}`,
    //             email: `user${i}@example.com`,
    //             phone: `(555) ${String(i).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    //         });
    //     }

    //     console.log(
    //         `%callData %c=> %c${this.allData.length}`,
    //         'color: #4287f5; font-weight: bold;',
    //         'color: black;',
    //         'color: #42f554; font-weight: bold;'
    //     );
    // }

    handleScroll(event) {
        // Cancel any pending animation frame
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }

        let scrollTop = event?.target?.scrollTop;
        // Schedule the update on the next animation frame
        this.scrollTimeout = window.requestAnimationFrame(() => {
            this.scrollTop = scrollTop;
            this.updateVisibleData();
        });
    }

    disconnectedCallback() {
        // Cleanup any pending animation frame when component is destroyed
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }
    }

    updateVisibleData() {
        const endNode = Math.min(this.startNode + this.visibleNodesCount, this.allData.length);
        this.visibleData = this.allData.slice(this.startNode, endNode).map((row, index) => ({
            ...row,
            key: row.id || index,
            index: this.startNode + index + 1,
            flattenedColumns: this.processedColumns.map((column) => ({
                ...column,
                value: row[column.fieldName],
                key: `${row.id || index}-${column.fieldName}` // Unique key for each cell
            }))
        }));
    }

    renderedCallback() {
        if (!this.hasInitialized) {
            const container = this.template.querySelector('.table-container');
            if (container) {
                this.viewportHeight = container.clientHeight;
                this.hasInitialized = true;
                this.updateVisibleData();
            }
        }
    }
}
