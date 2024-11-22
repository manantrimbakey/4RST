/* eslint-disable no-unused-expressions */
/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';

export default class VirtualTable extends LightningElement {
    _modifiedDataCache = {};
    _selectedRows = {};
    _allRowsSelected = false;

    @api allowRowSelection = false;
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

    @api getSelectedRows() {
        return this._selectedRows;
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
        // NOTE: Below commented code is actually faster than the above code, but the data is coming from public property which cached and freezed, Lightning Framework doesnt allow you to modify the data. To solve this we are using cache to store the modified data
        this.visibleData = this.allData.slice(this.startNode, endNode).map((row, index) => {
            let key = row[this.key] || row.id || index;
            if (this._modifiedDataCache[key]) {
                console.log(`%c allRowsSelected %c=> %c${this._allRowsSelected}`, 'color: #4287f5; font-weight: bold;', 'color: black;', 'color: #42f554; font-weight: bold;');
                this._allRowsSelected && (this._modifiedDataCache[key].isSelected = true);
                return this._modifiedDataCache[key];
            }

            let modifiedRow = { ...row, isSelected: this.allowRowSelection ? row.isSelected : false };

            modifiedRow.key = key;
            modifiedRow.index = this.startNode + index + 1;
            modifiedRow.flattenedColumns = this.processedColumns?.map((column) => {
                const typeAttributes = { ...column.typeAttributes };

                // Handle dynamic field references in typeAttributes
                if (typeAttributes) {
                    Object.keys(typeAttributes).forEach((attr) => {
                        if (typeAttributes[attr]?.fieldName) {
                            typeAttributes[attr] = modifiedRow[typeAttributes[attr].fieldName];
                        }
                    });
                }

                return {
                    ...column,
                    value: modifiedRow[column.fieldName],
                    typeAttributes: typeAttributes,
                    key: `${key}-${column.fieldName}` // Unique key for each cell
                };
            });
            modifiedRow.processed = true;

            this._modifiedDataCache[key] = modifiedRow;

            return modifiedRow;
        });
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

    handleRowSelection(event) {
        const rowKey = event?.target?.dataset?.row;
        this._allRowsSelected = false;
        let currentRow = this._modifiedDataCache[rowKey];
        if (event?.target?.checked) {
            currentRow.isSelected = true;
            this._selectedRows[rowKey] = currentRow;

            console.log(
                `%c selectedRows when checked %c=> %c${JSON.stringify(this._selectedRows)}`,
                'color: #4287f5; font-weight: bold;',
                'color: black;',
                'color: #42f554; font-weight: bold;'
            );
        } else {
            currentRow.isSelected = false;
            delete this._selectedRows[rowKey];

            console.log(
                `%c selectedRows when unchecked %c=> %c${JSON.stringify(this._selectedRows)}`,
                'color: #4287f5; font-weight: bold;',
                'color: black;',
                'color: #42f554; font-weight: bold;'
            );
        }
    }

    handleAllRowSelection(event) {
        // Update Visible Data
        this._selectedRows = {};

        this._allRowsSelected = event?.target?.checked;
        console.log(`%c allRowsSelected handleChange %c=> %c${this._allRowsSelected}`, 'color: #4287f5; font-weight: bold;', 'color: black;', 'color: #42f554; font-weight: bold;');

        // if (this.scrollTimeoutAllRowSelection) {
        //     window.cancelAnimationFrame(this.scrollTimeoutAllRowSelection);
        // }

        // this.scrollTimeoutAllRowSelection = window.requestAnimationFrame(() => {
            for (let index = 0; index < this._modifiedDataCache.length; index++) {
                this._modifiedDataCache[index].isSelected = this._allRowsSelected;
                this.visibleData?.[index] && (this.visibleData[index].isSelected = this._allRowsSelected);
            }
        // });
    }
}