/* eslint-disable no-unused-expressions */
/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';

export default class VirtualTable extends LightningElement {
    _unreactiveProp = {
        _modifiedDataCache: {},
        _selectedRows: {},
        _allRowsSelected: false,
        _scrollTop: 0,
        _columns: [],
        allData: [],
        rowHeight: 40,
        nodePadding: 10,
        viewportHeight: 400
    };

    @api allowRowSelection = false;
    @api key;
    @api get columns() {
        return this._unreactiveProp._columns || [];
    }
    set columns(value) {
        this._unreactiveProp._columns = value;
        this.processColumns();
    }

    @api
    get rowData() {
        return this._unreactiveProp.allData;
    }

    set rowData(value) {
        this._unreactiveProp.allData = value || [];
        this.updateVisibleData();
    }

    /**
     * Get all selected rows
     * @returns {Object | String}
     */
    @api getSelectedRows() {
        if (this._unreactiveProp._allRowsSelected) {
            return 'allRows';
        }
        return this._unreactiveProp._selectedRows;
    }

    @track visibleData = [];

    processColumns() {
        if (!this._unreactiveProp._columns) return;

        this.processedColumns = this._unreactiveProp._columns.map((column) => ({
            ...column,
            key: column.fieldName || column.label,
            type: column.type || 'text'
        }));
    }

    // Computed properties for virtual scrolling
    get totalContentHeight() {
        return this._unreactiveProp.allData.length * this._unreactiveProp.rowHeight;
    }

    get scrollTop() {
        return this._unreactiveProp._scrollTop || 0;
    }

    get startNode() {
        let start = Math.floor(this.scrollTop / this._unreactiveProp.rowHeight) - this._unreactiveProp.nodePadding;
        return Math.max(0, start);
    }

    get visibleNodesCount() {
        let count =
            Math.ceil(this._unreactiveProp.viewportHeight / this._unreactiveProp.rowHeight) +
            4 * this._unreactiveProp.nodePadding;
        return Math.min(this._unreactiveProp.allData.length - this.startNode, count);
    }

    get offsetY() {
        return this.startNode * this._unreactiveProp.rowHeight;
    }

    get contentStyle() {
        return `height: ${this.totalContentHeight}px; position: relative;`;
    }

    get offsetStyle() {
        return `transform: translateY(${this.offsetY}px); position: absolute; width: 100%;`;
    }

    get rowHeightStyle() {
        return `height: ${this._unreactiveProp.rowHeight}px;`;
    }

    connectedCallback() {
        this.updateVisibleData();
    }

    handleScroll(event) {
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }
        let scrollTop = event?.target?.scrollTop;

        this.scrollTimeout = window.requestAnimationFrame(() => {
            if (
                this.scrollTop === scrollTop ||
                Math.abs((this._unreactiveProp._scrollTop || 0) - scrollTop) < 9 * this._unreactiveProp.rowHeight
            ) {
                return;
            }
            this._unreactiveProp._scrollTop = scrollTop;
            this.updateVisibleData();
        });
    }

    disconnectedCallback() {
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }
    }

    updateVisibleData() {
        const endNode = Math.min(this.startNode + this.visibleNodesCount, this._unreactiveProp.allData.length);
        this.visibleData = this._unreactiveProp.allData.slice(this.startNode, endNode).map((row, index) => {
            let key = row[this.key] || row.id || index;
            if (this._unreactiveProp._modifiedDataCache[key]) {
                this._unreactiveProp._allRowsSelected &&
                    (this._unreactiveProp._modifiedDataCache[key].isSelected = true);
                return this._unreactiveProp._modifiedDataCache[key];
            }

            let modifiedRow = { ...row, isSelected: this.allowRowSelection ? row.isSelected : false };

            modifiedRow.key = key;
            modifiedRow.index = this.startNode + index + 1;
            modifiedRow.flattenedColumns = this.processedColumns?.map((column) => {
                const typeAttributes = { ...column.typeAttributes };

                if (typeAttributes) {
                    const keys = Object.keys(typeAttributes);
                    for (let i = 0; i < keys.length; i++) {
                        const attr = keys[i];
                        if (typeAttributes[attr]?.fieldName) {
                            typeAttributes[attr] = modifiedRow[typeAttributes[attr].fieldName];
                        }
                    }
                }

                return {
                    ...column,
                    value: modifiedRow[column.fieldName],
                    typeAttributes: typeAttributes,
                    key: `${key}-${column.fieldName}` // Unique key for each cell
                };
            });
            modifiedRow.processed = true;

            this._unreactiveProp._modifiedDataCache[key] = modifiedRow;

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
        this._unreactiveProp._allRowsSelected = false;
        let currentRow = this._unreactiveProp._modifiedDataCache[rowKey];
        if (event?.target?.checked) {
            currentRow.isSelected = true;
            this._unreactiveProp._selectedRows[rowKey] = currentRow;
        } else {
            currentRow.isSelected = false;
            delete this._unreactiveProp._selectedRows[rowKey];
        }
    }

    handleAllRowSelection(event) {
        this._unreactiveProp._selectedRows = {};
        this._unreactiveProp._allRowsSelected = event?.target?.checked;

        for (let i = 0; i < this.visibleData.length; i++) {
            const row = this.visibleData[i];
            row.isSelected = this._unreactiveProp._allRowsSelected;

            if (row.key) {
                this._unreactiveProp._modifiedDataCache[row.key].isSelected = this._unreactiveProp._allRowsSelected;
                if (this._unreactiveProp._allRowsSelected) {
                    this._unreactiveProp._selectedRows[row.key] = this._unreactiveProp._modifiedDataCache[row.key];
                }
            }
        }
    }
}
