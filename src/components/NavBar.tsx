import React from 'react';
import { Shield, CheckSquare, Calendar, BarChart3, User } from 'lucide-react';
import { sound } from '../utils/audio';

export type NavTab = 'home' | 'missions' | 'heatmap' | 'stats' | 'profile';

interface NavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingMissionsCount?: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  currentTab,
  onSelectTab,
  pendingMissionsCount = 0
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Control', icon: Shield },
    { id: 'missions' as NavTab, label: 'Missions', icon: CheckSquare, badge: pendingMissionsCount },
    { id: 'heatmap' as NavTab, label: 'Heat Map', icon: Calendar },
    { id: 'stats' as NavTab, label: 'Intel', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'Batcave', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E121A]/95 backdrop-blur-md border-t border-[#242C3D] px-2 py-1.5 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-all duration-200 ${
                isActive
                  ? 'text-[#E0B34C]'
                  : 'text-[#9AA4B2] hover:text-[#F3F5F7]'
              }`}
            >
              {/* Active top notch glow */}
              {isActive && (
                <div className="absolute -top-1.5 w-6 h-0.5 bg-[#E0B34C] shadow-[0_0_8px_#E0B34C] rounded-full" />
              )}

              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E0B34C] text-[#0B0D12] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-[0_0_6px_rgba(224,179,76,0.6)]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-wider mt-1 font-tactical uppercase ${
                isActive ? 'font-bold text-[#F3F5F7]' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
