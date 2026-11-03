import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { StartScreen } from './components/screens/StartScreen';
import { ProfileSetupScreen } from './components/screens/ProfileSetupScreen';
import { AdventureGameScreen } from './components/screens/AdventureGameScreen';
import { SummaryScreen } from './components/screens/SummaryScreen';
import { CoLoa3DScreen } from './components/screens/CoLoa3DScreen';
import { CodexModal } from './components/common/CodexModal';
import { CipherPuzzleModal } from './components/modals/CipherPuzzleModal';
import { AmbientAudioPlayer } from './components/common/AmbientAudioPlayer';

const GameRouter: React.FC = () => {
  const { progress } = useGame();

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
      {/* Trình phát nhạc nền Low-Fi Sử Việt */}
      <AmbientAudioPlayer />
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
