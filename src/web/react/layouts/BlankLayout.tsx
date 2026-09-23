import { Box } from '@mantine/core';

export function BlankLayout({ children }) {
    // Purely renders children with zero layout side effects
    return <Box component="main">{children}</Box>;
}