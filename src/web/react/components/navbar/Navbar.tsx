import { useState } from 'react';
import {
  IconHome2,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Stack, Tooltip, UnstyledButton } from '@mantine/core';
import classes from './Navbar.module.css'
import * as Icons from '../icons'

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: Icons.HomeIcon, label: 'Home' },
  { icon: Icons.CommandsIcon, label: 'Commands'},
  { icon: Icons.SongRequestIcon, label: 'Song Requests'},
  { icon: Icons.ModerationIcon, label: 'Moderation'},
];

export function NavbarMinimal() {
  const [active, setActive] = useState(2);

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        {/* <NavbarLink icon={IconSwitchHorizontal} label="Change account" /> */}
        <NavbarLink icon={Icons.LogoutIcon} label="Logout" />
      </Stack>
    </nav>
  );
}