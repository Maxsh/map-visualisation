import L from 'leaflet';
import type { MarkerConfig, AlertMarker } from '../types';

/**
 * Utility class for generating custom alert icons and markers
 */
export class AlertIconGenerator {
  
  private static iconCache = new Map<string, L.DivIcon>();

  /**
   * Generate custom alert icon based on type and severity
   */
  public static createAlertIcon(
    alertType: string = 'info',
    severity: number = 1,
    config: MarkerConfig = {}
  ): L.DivIcon {
    const cacheKey = `${alertType}-${severity}-${JSON.stringify(config)}`;
    
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey)!;
    }

    const iconSize = config.iconSize || [32, 32];
    const iconHtml = this.generateIconHtml(alertType, severity, config);
    
    const icon = L.divIcon({
      html: iconHtml,
      className: `alert-marker alert-${alertType} severity-${severity}`,
      iconSize: iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1]],
      popupAnchor: [0, -iconSize[1]]
    });

    this.iconCache.set(cacheKey, icon);
    return icon;
  }

  /**
   * Generate SVG HTML for alert icons
   */
  private static generateIconHtml(
    alertType: string,
    severity: number,
    config: MarkerConfig
  ): string {
    const size = config.iconSize ? config.iconSize[0] : 32;
    const color = this.getAlertColor(alertType, severity);
    const icon = this.getAlertSymbol(alertType);
    const pulseClass = config.pulseAnimation ? 'alert-pulse' : '';
    
    return `
      <div class="alert-icon-container ${pulseClass}">
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" class="alert-icon">
          <!-- Drop shadow -->
          <defs>
            <filter id="drop-shadow-${alertType}-${severity}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          
          <!-- Main circle background -->
          <circle cx="16" cy="16" r="14" 
                  fill="${color}" 
                  stroke="#fff" 
                  stroke-width="2"
                  filter="url(#drop-shadow-${alertType}-${severity})"/>
          
          <!-- Alert symbol -->
          ${icon}
          
          <!-- Severity indicator ring -->
          ${severity > 3 ? `
            <circle cx="16" cy="16" r="13" 
                    fill="none" 
                    stroke="#ff0000" 
                    stroke-width="1" 
                    stroke-dasharray="3,2"/>
          ` : ''}
        </svg>
        
        <!-- Severity badge for high priority alerts -->
        ${severity >= 4 ? `
          <div class="severity-badge" style="
            position: absolute;
            top: -4px;
            right: -4px;
            background: #ff0000;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
          ">${severity}</div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get color based on alert type and severity
   */
  private static getAlertColor(alertType: string, severity: number): string {
    const severityMultiplier = Math.min(severity / 5, 1);
    
    switch (alertType) {
      case 'critical':
        return this.interpolateColor('#ff4444', '#aa0000', severityMultiplier);
      case 'warning':
        return this.interpolateColor('#ffaa00', '#ff6600', severityMultiplier);
      case 'danger':
        return this.interpolateColor('#ff6b6b', '#cc0000', severityMultiplier);
      case 'info':
        return this.interpolateColor('#3498db', '#2980b9', severityMultiplier);
      case 'success':
        return this.interpolateColor('#2ecc71', '#27ae60', severityMultiplier);
      default:
        return this.interpolateColor('#95a5a6', '#7f8c8d', severityMultiplier);
    }
  }

  /**
   * Get SVG symbol for alert type
   */
  private static getAlertSymbol(alertType: string): string {
    switch (alertType) {
      case 'critical':
        return `
          <path d="M16 6 L26 24 L6 24 Z" fill="#fff" stroke="none"/>
          <text x="16" y="20" text-anchor="middle" fill="#ff0000" font-size="16" font-weight="bold">!</text>
        `;
      
      case 'warning':
        return `
          <path d="M16 6 L26 24 L6 24 Z" fill="#fff" stroke="none"/>
          <text x="16" y="20" text-anchor="middle" fill="#ff6600" font-size="16" font-weight="bold">!</text>
        `;
      
      case 'danger':
        return `
          <path d="M8 8 L24 24 M24 8 L8 24" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        `;
      
      case 'info':
        return `
          <circle cx="16" cy="10" r="2" fill="#fff"/>
          <rect x="14" y="14" width="4" height="12" fill="#fff" rx="2"/>
        `;
      
      case 'success':
        return `
          <path d="M8 16 L14 22 L24 10" stroke="#fff" stroke-width="3" 
                stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        `;
      
      default:
        return `
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        `;
    }
  }

  /**
   * Interpolate between two colors based on factor (0-1)
   */
  private static interpolateColor(color1: string, color2: string, factor: number): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Create popup content for alert markers
   */
  public static createAlertPopup(alert: AlertMarker): string {
    const timestamp = alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Unknown';
    const status = alert.status || 'active';
    const severity = alert.severity || 1;
    
    // Extract custom properties from metadata for display
    const customProperties = this.extractCustomProperties(alert);
    
    return `
      <div class="alert-popup">
        <div class="alert-header">
          <h3 class="alert-title">${alert.name || 'Location'}</h3>
          <span class="alert-status status-${status}">${status.toUpperCase()}</span>
        </div>
        
        <div class="alert-details">
          <div class="alert-type">
            <strong>Type:</strong> ${(alert.alertType || 'info').toUpperCase()}
          </div>
          <div class="alert-severity">
            <strong>Severity:</strong> ${severity}/5 ${'★'.repeat(severity)}${'☆'.repeat(5-severity)}
          </div>
          <div class="alert-time">
            <strong>Time:</strong> ${timestamp}
          </div>
          ${alert.description ? `
            <div class="alert-description">
              <strong>Description:</strong><br>
              ${alert.description}
            </div>
          ` : ''}
          ${alert.coordinates ? `
            <div class="alert-coordinates">
              <strong>Coordinates:</strong> ${alert.coordinates.lat.toFixed(6)}, ${alert.coordinates.lng.toFixed(6)}
            </div>
          ` : ''}
          ${customProperties.length > 0 ? `
            <div class="custom-properties">
              <strong>Additional Information:</strong>
              <div class="properties-list">
                ${customProperties.map(prop => `
                  <div class="property-item">
                    <span class="property-key">${prop.key}:</span>
                    <span class="property-value">${prop.value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="alert-actions">
          <button class="btn-acknowledge" onclick="acknowledgeAlert('${alert.id}')">
            Acknowledge
          </button>
          <button class="btn-resolve" onclick="resolveAlert('${alert.id}')">
            Resolve
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Extract custom properties from alert metadata for display
   */
  private static extractCustomProperties(alert: AlertMarker): Array<{key: string, value: string}> {
    const customProps: Array<{key: string, value: string}> = [];
    
    if (alert.metadata && typeof alert.metadata === 'object') {
      // Define properties to exclude from custom display (already shown elsewhere)
      const excludedKeys = new Set([
        'id', 'name', 'title', 'intensity', 'weight', 'value',
        'lat', 'lng', 'coordinates', 'alertType', 'severity', 
        'status', 'timestamp', 'description'
      ]);
      
      Object.entries(alert.metadata).forEach(([key, value]) => {
        if (!excludedKeys.has(key) && value !== null && value !== undefined) {
          // Format the key to be more readable
          const formattedKey = key.replace(/_/g, ' ')
                                 .replace(/([A-Z])/g, ' $1')
                                 .trim()
                                 .split(' ')
                                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                 .join(' ');
          
          // Format the value
          let formattedValue: string;
          if (typeof value === 'object') {
            formattedValue = JSON.stringify(value, null, 2);
          } else if (typeof value === 'boolean') {
            formattedValue = value ? 'Yes' : 'No';
          } else {
            formattedValue = String(value);
          }
          
          customProps.push({
            key: formattedKey,
            value: formattedValue
          });
        }
      });
    }
    
    return customProps;
  }

  /**
   * Get CSS styles for alert markers
   */
  public static getAlertMarkerCSS(): string {
    return `
      .alert-marker {
        position: relative;
      }
      
      .alert-icon-container {
        position: relative;
        display: inline-block;
      }
      
      .alert-pulse {
        animation: alertPulse 2s infinite;
      }
      
      @keyframes alertPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .alert-popup {
        min-width: 250px;
        max-width: 350px;
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }
      
      .alert-title {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      
      .alert-status {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .status-active {
        background: #ff4444;
        color: white;
      }
      
      .status-acknowledged {
        background: #ffaa00;
        color: white;
      }
      
      .status-resolved {
        background: #2ecc71;
        color: white;
      }
      
      .alert-details {
        margin-bottom: 15px;
      }
      
      .alert-details > div {
        margin-bottom: 5px;
        font-size: 13px;
        line-height: 1.4;
      }
      
      .alert-description {
        margin-top: 8px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #007bff;
      }
      
      .custom-properties {
        margin-top: 10px;
        padding: 8px;
        background: #f1f3f4;
        border-radius: 4px;
        border-left: 3px solid #6c757d;
      }
      
      .properties-list {
        margin-top: 6px;
      }
      
      .property-item {
        display: flex;
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.3;
      }
      
      .property-key {
        font-weight: 600;
        color: #495057;
        margin-right: 6px;
        min-width: 80px;
        flex-shrink: 0;
      }
      
      .property-value {
        color: #6c757d;
        word-break: break-word;
        white-space: pre-wrap;
        flex: 1;
      }
      
      .alert-actions {
        display: flex;
        gap: 8px;
      }
      
      .alert-actions button {
        flex: 1;
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn-acknowledge {
        background: #ffc107;
        color: #000;
      }
      
      .btn-acknowledge:hover {
        background: #e0a800;
      }
      
      .btn-resolve {
        background: #28a745;
        color: white;
      }
      
      .btn-resolve:hover {
        background: #218838;
      }
    `;
  }

  /**
   * Clear icon cache
   */
  public static clearCache(): void {
    this.iconCache.clear();
  }
}
