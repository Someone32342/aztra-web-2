import { GuideGroupType } from '../../types/GuideIndexTypes'

import AddTicket from './add-ticket.md'

const index: GuideGroupType = {
  id: "ticket-guide",
  name: "티켓 가이드",
  homePageName: "add-ticket",
  icon: '/assets/docs/aztra-command-guide/icon.png',
  pages: [
    {
      id: "add-ticket",
      title: "티켓 등록하기",
      content: AddTicket
    }
  ]
}

export default index