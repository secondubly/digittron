import { Radio, Group, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import classes from './GiveawayCard.module.css'

interface Props {
    icon: typeof IconHome
    title: string
    description: string
}

export const GiveawayCard = ({ icon: IconComponent, title, description }: Props) => {
    return (
        <Radio.Card className={classes.root} value={title} key={title} p='lg'>
        <Group wrap="nowrap" align="center">
            <IconComponent />
            <div>
            <Text className={classes.label}>{title}</Text>
            <Text className={classes.description}>{description}</Text>
            </div>
            <Radio.Indicator ml='auto' />
        </Group>
        </Radio.Card>
    )
}