import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { IconMessageCircle2 } from 'twenty-ui';

// Register Chart.js components
ChartJS.register(ArcElement, Legend, Tooltip);

const StyledChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
`;

const StyledChartContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 180px;
  width: 100%;
`;

const StyledPieWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
`;

const StyledKPICardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const StyledKPICardContent = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  flex-direction: column;
  height: 50%;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
  aspect-ratio: 1 / 1;
`;

const StyledKPIValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-align: center;
`;

const StyledKPILabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  justify-content: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  overflow-y: auto;
  padding-left: ${({ theme }) => theme.spacing(2)};
  width: 40%;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledLegendColor = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 2px;
  height: 10px;
  margin-right: ${({ theme }) => theme.spacing(1)};
  width: 10px;
`;

const StyledLegendLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledEmptyStateContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

// Define color keys that match theme.tag.background properties
type ColorKey =
  | 'green'
  | 'turquoise'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow';

type StageConfig = {
  key: string;
  label: string;
  colorKey: ColorKey;
};

// Define stage configurations with consistent color mappings
const stageConfigs: StageConfig[] = [
  { key: 'FIRST_CONTACT', label: 'First Contact', colorKey: 'yellow' },
  { key: 'FOLLOW_UP', label: 'Follow Up', colorKey: 'orange' },
  { key: 'VIEWING_SCHEDULED', label: 'Viewing Scheduled', colorKey: 'sky' },
  { key: 'VIEWING_DONE', label: 'Viewing Done', colorKey: 'blue' },
  { key: 'BUYING_INTENT', label: 'Buying Intent', colorKey: 'purple' },
  { key: 'CONTRACT_SENT', label: 'Contract Sent', colorKey: 'pink' },
  { key: 'CONTRACT_SIGNED', label: 'Contract Signed', colorKey: 'turquoise' },
  { key: 'SUCCESSFUL', label: 'Successful', colorKey: 'green' },
  { key: 'UNSUCCESSFUL', label: 'Unsuccessful', colorKey: 'red' },
];

// Create a map for quick lookups
const stageConfigMap = stageConfigs.reduce<Record<string, StageConfig>>(
  (acc, config) => {
    acc[config.key] = config;
    return acc;
  },
  {},
);

type ContactsByStageChartProps = {
  contactsByStage: Record<string, number>;
};

export const ContactsByStageChart = ({
  contactsByStage,
}: ContactsByStageChartProps) => {
  const theme = useTheme();

  // Clean up tooltip element when component unmounts
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById('chartjs-tooltip');
      if (tooltipEl) {
        tooltipEl.parentNode?.removeChild(tooltipEl);
      }
    };
  }, []);

  // Map theme colors for easy access
  const themeColors: Record<ColorKey, string> = {
    green: theme.tag.background.green,
    turquoise: theme.tag.background.turquoise,
    sky: theme.tag.background.sky,
    blue: theme.tag.background.blue,
    purple: theme.tag.background.purple,
    pink: theme.tag.background.pink,
    red: theme.tag.background.red,
    orange: theme.tag.background.orange,
    yellow: theme.tag.background.yellow,
  };

  const stages = Object.keys(contactsByStage);
  const totalContacts = Object.values(contactsByStage).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Sort stages by count (descending) to show most important segments first
  const sortedStages = [...stages].sort(
    (a, b) => contactsByStage[b] - contactsByStage[a],
  );

  // Get stage config (with fallback for unknown stages)
  const getStageConfig = (stage: string): StageConfig => {
    return (
      stageConfigMap[stage] || {
        key: stage,
        label: stage,
        colorKey: 'blue',
      }
    );
  };

  // Chart data preparation
  const chartData = {
    labels: sortedStages.map((stage) => getStageConfig(stage).label),
    datasets: [
      {
        data: sortedStages.map((stage) => contactsByStage[stage]),
        backgroundColor: sortedStages.map(
          (stage) => themeColors[getStageConfig(stage).colorKey],
        ),
        borderWidth: 1,
        borderColor: theme.background.primary,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    radius: '85%',
    cutout: '45%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable default tooltip
        external: ({ chart, tooltip }) => {
          // If tooltip isn't shown, hide the element
          if (tooltip.opacity === 0) {
            const existingTooltip = document.getElementById('chartjs-tooltip');
            if (existingTooltip) {
              existingTooltip.style.display = 'none';
            }
            return;
          }

          let tooltipEl = document.getElementById('chartjs-tooltip');

          // Create the tooltip element if it doesn't exist
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.style.background = theme.background.primary;
            tooltipEl.style.borderRadius = '4px';
            tooltipEl.style.color = theme.font.color.secondary;
            tooltipEl.style.opacity = '0';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'fixed'; // Use fixed instead of absolute
            tooltipEl.style.transition = 'all .1s ease';
            tooltipEl.style.zIndex = '10000'; // Very high to ensure on top
            tooltipEl.style.border = `1px solid ${theme.border.color.light}`;
            tooltipEl.style.padding = theme.spacing(1);
            tooltipEl.style.boxShadow = theme.boxShadow.light;
            tooltipEl.style.fontSize = theme.font.size.xs;
            tooltipEl.style.maxWidth = '200px';
            document.body.appendChild(tooltipEl);
          }

          // Make sure tooltip is visible
          tooltipEl.style.display = 'block';

          // Set Text
          if (tooltip.body) {
            const index = tooltip.dataPoints[0].dataIndex;
            const stage = sortedStages[index];
            const value = contactsByStage[stage];
            const stageConfig = getStageConfig(stage);
            const percentage = totalContacts
              ? ((value / totalContacts) * 100).toFixed(1)
              : '0';

            tooltipEl.innerHTML = `
              <div style="font-weight: ${theme.font.weight.medium}; margin-bottom: 4px;">
                ${stageConfig.label}
              </div>
              <div>
                ${value} contact${value !== 1 ? 's' : ''} (${percentage}%)
              </div>
            `;
          }

          // Calculate viewport-safe position for tooltip
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Get position based on mouse/touch position
          const rect = chart.canvas.getBoundingClientRect();

          // Get tooltip dimensions
          const tooltipWidth = tooltipEl.offsetWidth;
          const tooltipHeight = tooltipEl.offsetHeight;

          // Calculate tooltip coordinates - convert chart relative coords to viewport coords
          let top = rect.top + tooltip.caretY;
          let left = rect.left + tooltip.caretX;

          // Keep the tooltip within the viewport boundaries
          if (left + tooltipWidth > viewportWidth - 10) {
            left = viewportWidth - tooltipWidth - 10;
          }

          if (left < 10) {
            left = 10;
          }

          if (top + tooltipHeight > viewportHeight - 10) {
            top = viewportHeight - tooltipHeight - 10;
          }

          if (top < 10) {
            top = 10;
          }

          // Set position
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = left + 'px';
          tooltipEl.style.top = top + 'px';
        },
      },
    },
  };

  // Custom legend component
  const renderLegend = () => {
    return sortedStages.map((stage) => {
      const stageConfig = getStageConfig(stage);
      const color = themeColors[stageConfig.colorKey];
      const label = stageConfig.label;
      const count = contactsByStage[stage];
      const percentage = totalContacts
        ? ((count / totalContacts) * 100).toFixed(1)
        : '0';

      return (
        <StyledLegendItem key={stage}>
          <StyledLegendColor color={color} />
          <StyledLegendLabel>
            {label} ({count}) - {percentage}%
          </StyledLegendLabel>
        </StyledLegendItem>
      );
    });
  };

  const renderKpiCard = () => {
    return (
      <StyledKPICardContent>
        <StyledKPIValue>{totalContacts}</StyledKPIValue>
        <StyledKPILabel>
          <IconMessageCircle2 size={12} />
          <Trans>Inquiries</Trans>
        </StyledKPILabel>
      </StyledKPICardContent>
    );
  };

  if (totalContacts === 0) {
    return null;
  }

  return (
    <StyledChartContainer>
      <StyledChartContentContainer>
        <StyledPieWrapper>
          <Pie data={chartData} options={chartOptions} />
          <StyledKPICardOverlay>{renderKpiCard()}</StyledKPICardOverlay>
        </StyledPieWrapper>
        <StyledLegendContainer>{renderLegend()}</StyledLegendContainer>
      </StyledChartContentContainer>
    </StyledChartContainer>
  );
};
