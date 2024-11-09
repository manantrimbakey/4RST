/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';

export default class VirtualTable extends LightningElement {
    @api key;
    @api get columns() {
        return this._columns || [];
    }
    set columns(value) {
        this._columns = JSON.parse(JSON.stringify(value));
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
    // _columns = [];
    // processedColumns = [];

    // Configuration
    rowHeight = 40;
    nodePadding = 10;
    viewportHeight = 400;
    // scrollTop = 0;

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

    get scrollTop() {
        return this._scrollTop || 0;
    }

    get startNode() {
        let start = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
        return Math.max(0, start);
    }

    get visibleNodesCount() {
        let count = Math.ceil(this.viewportHeight / this.rowHeight) + 4 * this.nodePadding;
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
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }
        let scrollTop = event?.target?.scrollTop;
        // if (scrollTop <= 0 || scrollTop + this.rowHeight + this.viewportHeight >= this.totalContentHeight) {
        //     return;
        // }
        // Cancel any pending animation frame

        // Skip processing if we're at the top or bottom of the scroll

        // Schedule the update on the next animation frame
        this.scrollTimeout = window.requestAnimationFrame(() => {
            // window.requestAnimationFrame(() => {
            // this.scrollTop = scrollTop;

            if (this.scrollTop === scrollTop || Math.abs((this.scrollTop || 0) - scrollTop) < 9 * this.rowHeight) {
                return;
            }
            this._scrollTop = scrollTop;
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
            flattenedColumns: this.processedColumns?.map((column) => {
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
        // NOTE: Below commented code is actually faster than the above code, but the data is coming from public property which cached and freezed, Lightning Framework doesnt allow you to modify the data
        // this.visibleData = this.allData.slice(this.startNode, endNode).map((row, index) => {
        //     if (row.processed) {
        //         return row;
        //     }

        //     row.key = row[this.key] || row.id || index;
        //     row.index = this.startNode + index + 1;
        //     row.flattenedColumns = this.processedColumns?.map((column) => {
        //         const typeAttributes = { ...column.typeAttributes };

        //         // Handle dynamic field references in typeAttributes
        //         if (typeAttributes) {
        //             Object.keys(typeAttributes).forEach((attr) => {
        //                 if (typeAttributes[attr]?.fieldName) {
        //                     typeAttributes[attr] = row[typeAttributes[attr].fieldName];
        //                 }
        //             });
        //         }

        //         return {
        //             ...column,
        //             value: row[column.fieldName],
        //             typeAttributes: typeAttributes,
        //             key: `${row[this.key] || row.id || index}-${column.fieldName}` // Unique key for each cell
        //         };
        //     });
        //     row.processed = true;
        //     return row;
        // });
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
