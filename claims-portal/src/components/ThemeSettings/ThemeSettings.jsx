import { useState } from 'react';
import {
  DxcFlex,
  DxcButton,
  DxcHeading,
  DxcTypography,
  DxcTextInput,
  DxcInset,
  DxcContainer
} from '@dxc-technology/halstack-react';

const ThemeSettings = ({ isOpen, onClose, onThemeChange }) => {
  const [customColors, setCustomColors] = useState({
    blue: '#0095FF',
    green: '#24A148',
    orange: '#FF6B00',
    red: '#D0021B',
    purple: '#7B61FF'
  });

  const predefinedThemes = [
    {
      name: 'Ocean Blue',
      colors: {
        blue: '#0095FF',
        green: '#00C9A7',
        orange: '#FF8C42',
        red: '#FF5E5E',
        purple: '#6C63FF'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        blue: '#2E7D32',
        green: '#43A047',
        orange: '#FB8C00',
        red: '#D32F2F',
        purple: '#7B1FA2'
      }
    },
    {
      name: 'Sunset Orange',
      colors: {
        blue: '#F57C00',
        green: '#FFB300',
        orange: '#FF6F00',
        red: '#D84315',
        purple: '#E65100'
      }
    },
    {
      name: 'Corporate Purple',
      colors: {
        blue: '#5E35B1',
        green: '#7E57C2',
        orange: '#FF7043',
        red: '#E53935',
        purple: '#8E24AA'
      }
    },
    {
      name: 'Modern Teal',
      colors: {
        blue: '#00897B',
        green: '#26A69A',
        orange: '#FFB74D',
        red: '#EF5350',
        purple: '#AB47BC'
      }
    }
  ];

  const handleColorChange = (colorKey, value) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyTheme = (colors) => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-blue-700', colors.blue);
    root.style.setProperty('--color-green-700', colors.green);
    root.style.setProperty('--color-orange-700', colors.orange);
    root.style.setProperty('--color-red-700', colors.red);
    root.style.setProperty('--color-purple-700', colors.purple);

    if (onThemeChange) {
      onThemeChange(colors);
    }
  };

  const handleApplyCustomTheme = () => {
    applyTheme(customColors);
    onClose();
  };

  const handleApplyPredefinedTheme = (theme) => {
    setCustomColors(theme.colors);
    applyTheme(theme.colors);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
        <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        <DxcHeading level={2} text="Theme Settings" />

        {/* Predefined Themes Section */}
        <DxcFlex direction="column" gap="var(--spacing-gap-m)">
          <DxcHeading level={4} text="Predefined Themes" />
          <DxcTypography color="var(--color-fg-neutral-strong)">
            Select a pre-configured theme to apply instantly
          </DxcTypography>

          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {predefinedThemes.map((theme, index) => (
              <DxcContainer
                key={index}
                padding="var(--spacing-padding-m)"
                style={{ backgroundColor: "var(--color-bg-neutral-lightest)", cursor: 'pointer', border: '1px solid var(--border-color-neutral-lighter)' }}
                borderRadius="var(--border-radius-m)"
                onClick={() => handleApplyPredefinedTheme(theme)}
              >
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                    <DxcTypography fontWeight="font-weight-semibold">
                      {theme.name}
                    </DxcTypography>
                    <DxcFlex gap="var(--spacing-gap-xs)">
                      {Object.values(theme.colors).map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: color,
                            border: '1px solid var(--border-color-neutral-lighter)'
                          }}
                        />
                      ))}
                    </DxcFlex>
                  </DxcFlex>
                  <DxcButton
                    label="Apply"
                    mode="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPredefinedTheme(theme);
                    }}
                  />
                </DxcFlex>
              </DxcContainer>
            ))}
          </DxcFlex>
        </DxcFlex>

        {/* Custom Theme Section */}
        <DxcFlex direction="column" gap="var(--spacing-gap-m)">
          <DxcHeading level={4} text="Custom Theme" />
          <DxcTypography color="var(--color-fg-neutral-strong)">
            Create your own theme by selecting custom colors
          </DxcTypography>

          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {Object.entries(customColors).map(([key, value]) => (
              <DxcFlex key={key} alignItems="center" gap="var(--spacing-gap-s)">
                <div style={{ flex: 1 }}>
                  <DxcTextInput
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                    onChange={({ value: newValue }) => handleColorChange(key, newValue)}
                    placeholder="#000000"
                  />
                </div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--border-radius-m)',
                    backgroundColor: value,
                    border: '2px solid var(--border-color-neutral-lighter)',
                    marginTop: '24px'
                  }}
                />
              </DxcFlex>
            ))}
          </DxcFlex>

          <DxcButton
            label="Apply Custom Theme"
            mode="primary"
            onClick={handleApplyCustomTheme}
          />
        </DxcFlex>
      </DxcFlex>
      </div>
    </div>
  );
};

export default ThemeSettings;
