import { Radio, Group, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import classes from './GiveawayCard.module.css'

interface Props {
    icon: typeof IconHome
    label: string
    value: string
    description: string
}

export const GiveawayCard = ({ icon: IconComponent, value, label, description }: Props) => {
    return (
        <Radio.Card className={classes.root} value={value} key={label} p='lg'>
        <Group wrap="nowrap" align="center">
            <IconComponent />
            <div>
            <Text className={classes.label}>{label}</Text>
            <Text className={classes.description}>{description}</Text>
            </div>
            <Radio.Indicator ml='auto' />
        </Group>
        </Radio.Card>
    )
}