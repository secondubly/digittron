import {
  IconAdjustments,
  IconConfettiFilled,
  IconGauge,
  IconLock,
  IconMusicBolt,
  IconTerminal2,
} from '@tabler/icons-react';
import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './navbar-group/NavbarLinksGroup';
import { UserButton } from './user-button/UserButton';
import { Logo } from './Logo';
import classes from './Navbar.module.css';

const mockdata = [
  // TODO: if you're logged out, dashboard should take you to login
  // otherwise dashboard should auto load when you load the page
  { label: 'Dashboard', icon: IconGauge },
  // {
  //   label: 'Dashboard',
  //   icon: IconGauge,
  //   links: [
  //     { label: 'Logs', link: '/' },
  //     { label: 'Chat Moderation', link: '/' },
  //   ],
  // },
  {
    label: 'Giveaways',
    icon: IconConfettiFilled,
  },
  { label: 'Commands', icon: IconTerminal2, link: '/commands' },
  { label: 'Song Requests', icon: IconMusicBolt },
  { label: 'Settings', icon: IconAdjustments },
  {
    label: 'Security',
    icon: IconLock,
    links: [
      { label: 'Change password', link: '/' },
    ],
  },
];

export function Navbar() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
      <>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: 120 }} />
          <Code fw={700}>v3.1.2</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton/>
      </div>
    </>
  );
}