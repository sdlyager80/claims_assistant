import {
  DxcHeading,
  DxcFlex,
  DxcTypography,
  DxcBadge,
  DxcChip,
  DxcInset,
  DxcTable
} from '@dxc-technology/halstack-react';
import './PropertyDamagePanel.css';

const PropertyDamagePanel = ({ damageData }) => {
  if (!damageData) {
    return (
      <DxcInset space="2rem">
        <DxcTypography>Property damage data not available</DxcTypography>
      </DxcInset>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'major':
      case 'high':
        return 'error';
      case 'moderate':
      case 'medium':
        return 'warning';
      case 'minor':
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'major':
      case 'high':
        return '🟠';
      case 'moderate':
      case 'medium':
        return '🟡';
      case 'minor':
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Prepare table data
  const tableColumns = [
    { label: 'Severity', isSortable: false },
    { label: 'Category', isSortable: false },
    { label: 'Description', isSortable: false },
    { label: 'Estimated Cost', isSortable: false }
  ];

  const tableRows = damageData.damageCategories?.map((damage, index) => [
    {
      displayValue: (
        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
          <span>{getSeverityIcon(damage.severity)}</span>
          <DxcBadge
            label={damage.severity}
            {...(getSeverityColor(damage.severity) && { color: getSeverityColor(damage.severity) })}
          />
        </DxcFlex>
      )
    },
    { displayValue: damage.category },
    { displayValue: damage.description || '-' },
    {
      displayValue: (
        <DxcTypography fontWeight="font-weight-semibold">
          {formatCurrency(damage.estimatedCost)}
        </DxcTypography>
      )
    }
  ]) || [];

  return (
    <div className="property-damage-panel">
      <DxcInset space="2rem">
        <DxcFlex direction="column" gap="var(--spacing-gap-l)">

          {/* Header */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcHeading level={3} text="Property Damage Assessment" />
            <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-strong)">
              Detailed breakdown of property damage and loss estimates
            </DxcTypography>
          </DxcFlex>

          {/* Affected Areas */}
          {damageData.affectedAreas && damageData.affectedAreas.length > 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontWeight="font-weight-semibold">Affected Areas:</DxcTypography>
              <DxcFlex gap="var(--spacing-gap-xs)" wrap="wrap">
                {damageData.affectedAreas.map((area, index) => (
                  <DxcChip
                    key={index}
                    label={area}
                    size="medium"
                    color="info"
                  />
                ))}
              </DxcFlex>
            </DxcFlex>
          )}

          {/* Damage Categories Table */}
          {damageData.damageCategories && damageData.damageCategories.length > 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-03">
                Damage Categories
              </DxcTypography>
              <div className="damage-table-container">
                <DxcTable>
                  <thead>
                    <tr>
                      {tableColumns.map((col, index) => (
                        <th key={index}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell.displayValue}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </DxcTable>
              </div>
            </DxcFlex>
          )}

          {/* Total Estimated Loss */}
          <div className="total-loss-box">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold">
                Total Estimated Loss:
              </DxcTypography>
              <DxcTypography
                fontSize="font-scale-05"
                fontWeight="font-weight-bold"
                color="#000000"
              >
                {formatCurrency(damageData.totalEstimatedLoss)}
              </DxcTypography>
            </DxcFlex>
          </div>

          {/* Photos */}
          {damageData.photos && damageData.photos.length > 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-03">
                Damage Documentation
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-strong)">
                {damageData.photos.length} photo(s) attached to this claim
              </DxcTypography>
            </DxcFlex>
          )}

        </DxcFlex>
      </DxcInset>
    </div>
  );
};

export default PropertyDamagePanel;
