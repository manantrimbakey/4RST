/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';

export default class VirtualTable extends LightningElement {
    @api key;
    @api get columns() {
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

    @track visibleData = [];

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
        this.updateVisibleData();
    }

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
            key: row[this.key] || row.id || index,
            index: this.startNode + index + 1,
            flattenedColumns: this.processedColumns.map((column) => {
                const typeAttributes = { ...column.typeAttributes };

                // Handle dynamic field references in typeAttributes
                if (typeAttributes) {
                    Object.keys(typeAttributes).forEach((attr) => {
                        if (typeAttributes[attr]?.fieldName) {
                            typeAttributes[attr] = row[typeAttributes[attr].fieldName];
                        }
                    });
                }

                return {
                    ...column,
                    value: row[column.fieldName],
                    typeAttributes: typeAttributes,
                    key: `${row[this.key] || row.id || index}-${column.fieldName}` // Unique key for each cell
                };
            })
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
