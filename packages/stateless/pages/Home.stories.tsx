import { ComponentMeta, ComponentStory } from '@storybook/react'

import { makeAppLayoutDecorator } from '@dao-dao/storybook/decorators'

import {
  DaoCard,
  LinkWrapper,
  ProfileDisconnectedCard,
  ProfileHomeCard,
  ProfileHomeCardProps,
  SidebarWallet,
} from '../components'
import { Default as FeaturedDaosStory } from '../components/dao/FeaturedDaos.stories'
import { Default as ProfileHomeCardStory } from '../components/profile/ProfileHomeCard.stories'
import { Home } from './Home'

export default {
  title: 'DAO DAO / packages / stateless / pages / Home',
  component: Home,
} as ComponentMeta<typeof Home>

const Template: ComponentStory<typeof Home> = (args) => <Home {...args} />

export const Connected = Template.bind({})
Connected.args = {
  featuredDaosProps: {
    featuredDaos: FeaturedDaosStory.args!.featuredDaos!,
    DaoCard: (props) => (
      <DaoCard
        {...props}
        LinkWrapper={LinkWrapper}
        onPin={() => alert('pin ' + props.coreAddress)}
        pinned={false}
      />
    ),
  },
  connected: true,
  pinnedDaosProps: {
    pinnedDaos: FeaturedDaosStory.args!.featuredDaos!,
    DaoCard: (props) => (
      <DaoCard
        {...props}
        LinkWrapper={LinkWrapper}
        onPin={() => alert('pin ' + props.coreAddress)}
        pinned={false}
      />
    ),
    openSearch: () => alert('search'),
  },
  rightSidebarContent: (
    <ProfileHomeCard {...(ProfileHomeCardStory.args as ProfileHomeCardProps)} />
  ),
}
Connected.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ZnQ4SMv8UUgKDZsR5YjVGH/DAO-DAO-2.0?node-id=272%3A64674',
  },
  nextRouter: {
    asPath: '/home',
  },
}
Connected.decorators = [makeAppLayoutDecorator()]

export const Disconnected = Template.bind({})
Disconnected.args = {
  ...Connected.args,
  featuredDaosProps: {
    featuredDaos: FeaturedDaosStory.args!.featuredDaos!,
    DaoCard: (props) => (
      <DaoCard
        {...props}
        LinkWrapper={LinkWrapper}
        onPin={() => alert('pin ' + props.coreAddress)}
        pinned={false}
      />
    ),
  },
  connected: false,
  rightSidebarContent: <ProfileDisconnectedCard />,
}
Disconnected.parameters = {
  ...Connected.parameters,
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ZnQ4SMv8UUgKDZsR5YjVGH/DAO-DAO-2.0?node-id=272%3A64768',
  },
}
Disconnected.decorators = [
  makeAppLayoutDecorator({
    navigationProps: {
      hideInbox: true,
    },
    rightSidebarProps: {
      wallet: (
        <SidebarWallet connectedOrConnecting={false} onConnect={() => {}} />
      ),
    },
  }),
]
