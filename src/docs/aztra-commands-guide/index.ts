import { GuideGroupType } from '../../types/GuideIndexTypes';

import GettingStarted from './getting-started.md';
import BasicCommands from './basic-commands.md';
import GeneralCommands from './general-commands.md';
import LevelingCommands from './leveling-commands.md';
import WarnCommands from './warn-commands.md';
import ManageCommands from './manage-commands.md';
import SettingCommands from './setting-commands.md';
import TicketCommands from './ticket-commands.md';

const index: GuideGroupType = {
  id: 'aztra-commands-guide',
  name: 'Aztra 명령어 가이드',
  homePageName: 'getting-started',
  icon: '/assets/docs/aztra-command-guide/icon.png',
  pages: [
    {
      id: 'getting-started',
      title: '시작하기',
      content: GettingStarted,
    },
    {
      id: 'basic-commands',
      title: '기본 명령어',
      content: BasicCommands,
    },
    {
      id: 'general-commands',
      title: '일반 사용자 명령어',
      content: GeneralCommands,
    },
    {
      id: 'leveling-commands',
      title: '레벨 명령어',
      content: LevelingCommands,
    },
    {
      id: 'warn-commands',
      title: '경고 명령어',
      content: WarnCommands,
    },
    {
      id: 'manage-commands',
      title: '관리 명령어',
      content: ManageCommands,
    },
    {
      id: 'setting-commands',
      title: '기능설정 명령어',
      content: SettingCommands,
    },
    {
      id: 'ticket-commands',
      title: '티켓 명령어',
      content: TicketCommands,
    },
  ],
};

export default index;
