import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/screens/StartScreen';
import { ProfileSetupScreen } from './components/screens/ProfileSetupScreen';
import { AdventureGameScreen } from './components/screens/AdventureGameScreen';
import { SummaryScreen } from './components/screens/SummaryScreen';
import { CoLoa3DScreen } from './components/screens/CoLoa3DScreen';
import { CodexModal } from './components/common/CodexModal';
import { CipherPuzzleModal } from './components/modals/CipherPuzzleModal';
import { DailyMissionsModal } from './components/modals/DailyMissionsModal';
import { HistoricalMissionsModal } from './components/modals/HistoricalMissionsModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { AchievementToast } from './components/common/AchievementToast';

const GameRouter: React.FC = () => {
  const { progress, newAchievementToast, clearAchievementToast, openAchievements } = useGame();

  return (
    <>
      {progress.currentScreen === 'START' && <StartScreen />}
      {progress.currentScreen === 'SETUP' && <ProfileSetupScreen />}
      {progress.currentScreen === 'GAME' && <AdventureGameScreen />}
      {progress.currentScreen === 'GAME_3D_CO_LOA' && <CoLoa3DScreen />}
      {progress.currentScreen === 'SUMMARY' && <SummaryScreen />}

      {/* Sổ tay Sử Việt & Nguồn Tham Khảo */}
      <CodexModal />
      {/* Bàn Giải Mật Mã Cổ */}
      <CipherPuzzleModal />
      {/* Nhiệm Vụ Sử Học Hằng Ngày */}
      <DailyMissionsModal />
      {/* Phòng Sa Bàn & Nhiệm Vụ Sử Học Đa Dạng */}
      <HistoricalMissionsModal />
      {/* Kho Báu Thành Tựu & Huy Hiệu Kỹ Thuật Số */}
      <AchievementsModal />
      {/* Thông Báo Mở Khóa Thành Tựu Nổi */}
      <AchievementToast
        achievement={newAchievementToast}
        onClose={clearAchievementToast}
        onOpenAchievements={openAchievements}
      />
    </>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
