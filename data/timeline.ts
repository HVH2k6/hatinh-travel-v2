export interface ITimelineMilestone {
  year: string;
  key: string;
  iconName: 'Map' | 'Award' | 'TrendingUp' | 'Compass' | 'Sparkles' | 'Footprints';
}

export const timelineMilestones: ITimelineMilestone[] = [
  { year: '1990 - 2000', key: 'phase_1', iconName: 'Map' },
  { year: '2001 - 2015', key: 'phase_2', iconName: 'Award' },
  { year: '2016 - 2025', key: 'phase_3', iconName: 'TrendingUp' },
  { year: '2026+', key: 'phase_4', iconName: 'Compass' },
  // Sếp muốn thêm chặng 5, chặng 6 chỉ cần ném thêm object vào đây là UI tự chạy:
  // { year: '2030+', key: 'phase_5', iconName: 'Sparkles' }
];