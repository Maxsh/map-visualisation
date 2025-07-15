import { FileLoader, type FileLoadOptions, type FileLoadResult, type ColumnMapping } from '../utils/fileLoader';
import type { Location } from '../types';

/**
 * FileUploadComponent for handling file uploads and data loading
 */
export class FileUploadComponent {
  private container: HTMLElement;
  private onDataLoaded: (locations: Location[], result: FileLoadResult, shouldAppend?: boolean) => void;
  private dropZone: HTMLElement | null = null;
  private fileInput: HTMLInputElement | null = null;

  constructor(
    containerId: string,
    onDataLoaded: (locations: Location[], result: FileLoadResult, shouldAppend?: boolean) => void
  ) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }
    
    this.container = container;
    this.onDataLoaded = onDataLoaded;
    this.initialize();
  }

  /**
   * Initialize the file upload component
   */
  private initialize(): void {
    this.container.innerHTML = this.getHTML();
    this.setupEventListeners();
  }

  /**
   * Get the HTML structure for the component
   */
  private getHTML(): string {
    return `
      <div class="file-upload-component">
        <div class="upload-section">
          <div class="drop-zone" id="dropZone">
            <div class="drop-zone-content">
              <svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <h3>Drop files here or click to browse</h3>
              <p>Supports JSON, CSV, TSV, and GeoJSON formats</p>
            </div>
          </div>
          
          <input type="file" id="fileInput" accept=".json,.csv,.tsv,.txt,.geojson" multiple style="display: none;">
          
          <div class="file-options">
            <div class="upload-mode-section">
              <h4>Upload Mode</h4>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" name="uploadMode" value="replace" checked>
                  <span>Replace existing data</span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="uploadMode" value="append">
                  <span>Append to existing data</span>
                </label>
              </div>
            </div>
            
            <div class="format-section">
              <label for="fileFormat">File Format:</label>
              <select id="fileFormat">
                <option value="auto">Auto-detect</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="tsv">TSV</option>
                <option value="geojson">GeoJSON</option>
              </select>
            </div>
            
            <div class="csv-options" id="csvOptions" style="display: none;">
              <h4>CSV/TSV Options</h4>
              <div class="option-row">
                <label>
                  <input type="checkbox" id="hasHeader" checked> 
                  Has header row
                </label>
              </div>
              <div class="option-row">
                <label for="delimiter">Delimiter:</label>
                <select id="delimiter">
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              
              <h5>Column Mapping</h5>
              <div class="column-mapping">
                <div class="mapping-row">
                  <label for="latColumn">Latitude column:</label>
                  <input type="text" id="latColumn" value="lat" placeholder="lat, latitude">
                </div>
                <div class="mapping-row">
                  <label for="lngColumn">Longitude column:</label>
                  <input type="text" id="lngColumn" value="lng" placeholder="lng, longitude">
                </div>
                <div class="mapping-row">
                  <label for="intensityColumn">Intensity column (optional):</label>
                  <input type="text" id="intensityColumn" value="intensity" placeholder="intensity, weight">
                </div>
                <div class="mapping-row">
                  <label for="nameColumn">Name column (optional):</label>
                  <input type="text" id="nameColumn" value="name" placeholder="name, title">
                </div>
                <div class="mapping-row">
                  <label for="idColumn">ID column (optional):</label>
                  <input type="text" id="idColumn" value="id" placeholder="id">
                </div>
              </div>
            </div>
          </div>
          
          <div class="url-section">
            <h4>Or load from URL</h4>
            <div class="url-input-group">
              <input type="url" id="urlInput" placeholder="https://example.com/data.json">
              <button id="loadFromUrl">Load URL</button>
            </div>
          </div>
          
          <div class="data-management-section">
            <h4>Data Management</h4>
            <div class="management-buttons">
              <button id="clearDataBtn" class="clear-btn">Clear All Data</button>
              <button id="exportDataBtn" class="export-btn">Export Current Data</button>
            </div>
          </div>
          
          <div class="sample-section">
            <h4>Sample Data</h4>
            <div class="sample-buttons">
              <button id="downloadSampleJson" class="sample-btn">Download JSON Sample</button>
              <button id="downloadSampleCsv" class="sample-btn">Download CSV Sample</button>
              <button id="downloadSampleGeojson" class="sample-btn">Download GeoJSON Sample</button>
            </div>
          </div>
        </div>
        
        <div class="result-section" id="resultSection" style="display: none;">
          <h3>Load Results</h3>
          <div id="loadSummary"></div>
          <div id="loadErrors"></div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.dropZone = this.container.querySelector('#dropZone');
    this.fileInput = this.container.querySelector('#fileInput');
    
    if (!this.dropZone || !this.fileInput) return;

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleFiles(Array.from(target.files));
      }
    });

    // Drop zone events
    this.dropZone.addEventListener('click', () => this.fileInput?.click());
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this));

    // Format selection
    const formatSelect = this.container.querySelector('#fileFormat') as HTMLSelectElement;
    formatSelect?.addEventListener('change', this.handleFormatChange.bind(this));

    // URL loading
    const loadUrlBtn = this.container.querySelector('#loadFromUrl');
    loadUrlBtn?.addEventListener('click', this.handleLoadFromUrl.bind(this));

    // Data management
    const clearDataBtn = this.container.querySelector('#clearDataBtn');
    clearDataBtn?.addEventListener('click', this.handleClearData.bind(this));
    
    const exportDataBtn = this.container.querySelector('#exportDataBtn');
    exportDataBtn?.addEventListener('click', this.handleExportData.bind(this));

    // Sample downloads
    this.container.querySelector('#downloadSampleJson')?.addEventListener('click', () => 
      this.downloadSample('sample.json'));
    this.container.querySelector('#downloadSampleCsv')?.addEventListener('click', () => 
      this.downloadSample('sample.csv'));
    this.container.querySelector('#downloadSampleGeojson')?.addEventListener('click', () => 
      this.downloadSample('sample.geojson'));
  }

  /**
   * Handle drag over event
   */
  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dropZone?.classList.add('drag-over');
  }

  /**
   * Handle drag leave event
   */
  private handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dropZone?.classList.remove('drag-over');
  }

  /**
   * Handle drop event
   */
  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    this.dropZone?.classList.remove('drag-over');
    
    if (e.dataTransfer?.files) {
      this.handleFiles(Array.from(e.dataTransfer.files));
    }
  }

  /**
   * Handle format selection change
   */
  private handleFormatChange(): void {
    const formatSelect = this.container.querySelector('#fileFormat') as HTMLSelectElement;
    const csvOptions = this.container.querySelector('#csvOptions') as HTMLElement;
    
    if (formatSelect.value === 'csv' || formatSelect.value === 'tsv') {
      csvOptions.style.display = 'block';
    } else {
      csvOptions.style.display = 'none';
    }
  }

  /**
   * Handle loading from URL
   */
  private async handleLoadFromUrl(): Promise<void> {
    const urlInput = this.container.querySelector('#urlInput') as HTMLInputElement;
    const url = urlInput.value.trim();
    
    if (!url) {
      this.showError('Please enter a valid URL');
      return;
    }

    try {
      const options = this.getLoadOptions();
      const result = await FileLoader.loadFromUrl(url, options);
      this.handleLoadResult(result);
    } catch (error) {
      this.showError(`Failed to load from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle multiple files
   */
  private async handleFiles(files: File[]): Promise<void> {
    for (const file of files) {
      await this.handleSingleFile(file);
    }
  }

  /**
   * Handle a single file
   */
  private async handleSingleFile(file: File): Promise<void> {
    try {
      const options = this.getLoadOptions();
      const result = await FileLoader.loadFromFile(file, options);
      this.handleLoadResult(result);
    } catch (error) {
      this.showError(`Failed to load file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get load options from UI
   */
  private getLoadOptions(): FileLoadOptions {
    const formatSelect = this.container.querySelector('#fileFormat') as HTMLSelectElement;
    const hasHeaderCheck = this.container.querySelector('#hasHeader') as HTMLInputElement;
    const delimiterSelect = this.container.querySelector('#delimiter') as HTMLSelectElement;
    
    const options: FileLoadOptions = {};
    
    if (formatSelect.value !== 'auto') {
      options.format = formatSelect.value as any;
    }
    
    if (formatSelect.value === 'csv' || formatSelect.value === 'tsv') {
      options.hasHeader = hasHeaderCheck.checked;
      options.delimiter = delimiterSelect.value === '\\t' ? '\t' : delimiterSelect.value;
      
      const columnMapping: ColumnMapping = {
        lat: (this.container.querySelector('#latColumn') as HTMLInputElement).value || 'lat',
        lng: (this.container.querySelector('#lngColumn') as HTMLInputElement).value || 'lng'
      };
      
      const intensityCol = (this.container.querySelector('#intensityColumn') as HTMLInputElement).value;
      const nameCol = (this.container.querySelector('#nameColumn') as HTMLInputElement).value;
      const idCol = (this.container.querySelector('#idColumn') as HTMLInputElement).value;
      
      if (intensityCol) columnMapping.intensity = intensityCol;
      if (nameCol) columnMapping.name = nameCol;
      if (idCol) columnMapping.id = idCol;
      
      options.columnMapping = columnMapping;
    }
    
    return options;
  }

  /**
   * Handle load result
   */
  private handleLoadResult(result: FileLoadResult): void {
    const shouldAppend = this.shouldAppendData();
    this.showResults(result, shouldAppend);
    this.onDataLoaded(result.locations, result, shouldAppend);
  }

  /**
   * Check if data should be appended based on UI selection
   */
  private shouldAppendData(): boolean {
    const appendRadio = this.container.querySelector('input[name="uploadMode"][value="append"]') as HTMLInputElement;
    return appendRadio?.checked || false;
  }

  /**
   * Handle clear data action
   */
  private handleClearData(): void {
    this.onDataLoaded([], { 
      locations: [], 
      errors: [], 
      summary: { totalRows: 0, validLocations: 0, invalidRows: 0 } 
    }, false);
    
    // Clear result section
    const resultSection = this.container.querySelector('#resultSection') as HTMLElement;
    resultSection.style.display = 'none';
    
    this.showMessage('All data has been cleared.', 'success');
  }

  /**
   * Handle export data action
   */
  private handleExportData(): void {
    // This will export the current data from the main app
    // We'll trigger this via a custom event
    const exportEvent = new CustomEvent('exportData');
    window.dispatchEvent(exportEvent);
  }

  /**
   * Show load results
   */
  private showResults(result: FileLoadResult, shouldAppend: boolean = false): void {
    const resultSection = this.container.querySelector('#resultSection') as HTMLElement;
    const summaryDiv = this.container.querySelector('#loadSummary') as HTMLElement;
    const errorsDiv = this.container.querySelector('#loadErrors') as HTMLElement;
    
    resultSection.style.display = 'block';
    
    const modeText = shouldAppend ? 'appended' : 'loaded';
    
    // Summary
    summaryDiv.innerHTML = `
      <div class="load-summary">
        <div class="summary-item success">
          <strong>✓ ${result.summary.validLocations}</strong> valid locations ${modeText}
        </div>
        <div class="summary-item info">
          <strong>${result.summary.totalRows}</strong> total rows processed
        </div>
        ${result.summary.invalidRows > 0 ? `
          <div class="summary-item warning">
            <strong>⚠ ${result.summary.invalidRows}</strong> rows with errors
          </div>
        ` : ''}
        ${shouldAppend ? `
          <div class="summary-item info">
            <strong>📎</strong> Data appended to existing dataset
          </div>
        ` : ''}
      </div>
    `;
    
    // Errors
    if (result.errors.length > 0) {
      errorsDiv.innerHTML = `
        <div class="load-errors">
          <h4>Errors (${result.errors.length})</h4>
          <ul>
            ${result.errors.slice(0, 10).map(error => `<li>${this.escapeHtml(error)}</li>`).join('')}
            ${result.errors.length > 10 ? `<li><em>... and ${result.errors.length - 10} more errors</em></li>` : ''}
          </ul>
        </div>
      `;
    } else {
      errorsDiv.innerHTML = '';
    }
  }

  /**
   * Show a message to the user
   */
  private showMessage(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const resultSection = this.container.querySelector('#resultSection') as HTMLElement;
    const summaryDiv = this.container.querySelector('#loadSummary') as HTMLElement;
    const errorsDiv = this.container.querySelector('#loadErrors') as HTMLElement;
    
    resultSection.style.display = 'block';
    errorsDiv.innerHTML = '';
    
    const iconMap = {
      success: '✓',
      error: '✗', 
      warning: '⚠'
    };
    
    summaryDiv.innerHTML = `
      <div class="load-summary">
        <div class="summary-item ${type}">
          <strong>${iconMap[type]} ${message}</strong>
        </div>
      </div>
    `;
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const resultSection = this.container.querySelector('#resultSection') as HTMLElement;
    const summaryDiv = this.container.querySelector('#loadSummary') as HTMLElement;
    
    resultSection.style.display = 'block';
    summaryDiv.innerHTML = `
      <div class="load-summary">
        <div class="summary-item error">
          <strong>✗ Error:</strong> ${this.escapeHtml(message)}
        </div>
      </div>
    `;
  }

  /**
   * Download sample file
   */
  private downloadSample(filename: string): void {
    const samples = FileLoader.generateSampleFiles();
    const content = samples[filename];
    
    if (!content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Escape HTML for security
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear results
   */
  public clearResults(): void {
    const resultSection = this.container.querySelector('#resultSection') as HTMLElement;
    resultSection.style.display = 'none';
  }

  /**
   * Get CSS styles for the component
   */
  static getCSS(): string {
    return `
      .file-upload-component {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .drop-zone {
        border: 2px dashed #646cff;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
      }

      .drop-zone:hover,
      .drop-zone.drag-over {
        border-color: #535bf2;
        background-color: rgba(100, 108, 255, 0.05);
      }

      .drop-zone-content h3 {
        margin: 10px 0;
        color: #646cff;
      }

      .drop-zone-content p {
        margin: 0;
        color: #888;
      }

      .upload-icon {
        color: #646cff;
        margin-bottom: 10px;
      }

      .file-options {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .upload-mode-section {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .upload-mode-section h4 {
        margin: 0 0 10px 0;
        color: #646cff;
      }

      .radio-group {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.2s;
      }

      .radio-option:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .radio-option input[type="radio"] {
        margin: 0;
      }

      .radio-option span {
        font-size: 14px;
      }

      .format-section {
        margin-bottom: 15px;
      }

      .format-section label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .format-section select {
        width: 200px;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background: #1a1a1a;
        color: #fff;
      }

      .csv-options h4,
      .csv-options h5 {
        margin: 15px 0 10px 0;
        color: #646cff;
      }

      .option-row,
      .mapping-row {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mapping-row label {
        min-width: 150px;
        font-size: 14px;
      }

      .mapping-row input {
        flex: 1;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background: #1a1a1a;
        color: #fff;
      }

      .url-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .url-section h4 {
        margin-top: 0;
        color: #646cff;
      }

      .url-input-group {
        display: flex;
        gap: 10px;
      }

      .url-input-group input {
        flex: 1;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background: #1a1a1a;
        color: #fff;
      }

      .url-input-group button {
        padding: 10px 20px;
        white-space: nowrap;
      }

      .sample-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .sample-section h4 {
        margin-top: 0;
        color: #646cff;
      }

      .sample-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .sample-btn {
        padding: 8px 16px;
        font-size: 14px;
      }

      .data-management-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .data-management-section h4 {
        margin-top: 0;
        color: #646cff;
      }

      .management-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .clear-btn {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .clear-btn:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: translateY(-1px);
      }

      .export-btn {
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .export-btn:hover {
        background: linear-gradient(135deg, #047857, #065f46);
        transform: translateY(-1px);
      }

      .result-section {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
      }

      .result-section h3 {
        margin-top: 0;
        color: #646cff;
      }

      .load-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 15px;
      }

      .summary-item {
        padding: 10px 15px;
        border-radius: 6px;
        font-size: 14px;
      }

      .summary-item.success {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.4);
        color: #22c55e;
      }

      .summary-item.warning {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #f59e0b;
      }

      .summary-item.error {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }

      .summary-item.info {
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.4);
        color: #3b82f6;
      }

      .load-errors h4 {
        color: #ef4444;
        margin-bottom: 10px;
      }

      .load-errors ul {
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 4px;
        margin: 0;
      }

      .load-errors li {
        margin-bottom: 5px;
        font-family: monospace;
        font-size: 12px;
        color: #fca5a5;
      }

      @media (prefers-color-scheme: light) {
        .format-section select,
        .mapping-row input,
        .url-input-group input {
          background: #ffffff;
          color: #213547;
          border-color: #d1d5db;
        }

        .file-options,
        .url-section,
        .sample-section,
        .result-section {
          background: rgba(0, 0, 0, 0.05);
        }

        .load-errors ul {
          background: rgba(255, 255, 255, 0.5);
        }

        .load-errors li {
          color: #dc2626;
        }
      }
    `;
  }
}
