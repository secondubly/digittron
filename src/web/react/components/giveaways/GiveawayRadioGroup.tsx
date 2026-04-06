import { Radio, Group, Stack, Button } from "@mantine/core";
import classes from './GiveawayRadioGroup.module.css'
import { JSX } from "react";

interface Props {
    cards: JSX.Element[]
}

export const GiveawayRadioGroup = ({ cards }: Props) => {
    return (
        <Radio.Group label="Select the type of giveaway to run." classNames={{ label: classes.radioGroupLabel }}>
            <Stack>
                {cards}
            </Stack>
            <Group mt='12em' justify='space-between'>
                <Button disabled>Back</Button>
                <Button>Next</Button>
            </Group>
        </Radio.Group>
        // <Radio.Card className={classes.root} value={title} key={title} p='lg'>
        // <Group wrap="nowrap" align="center">
        //     <IconComponent />
        //     <div>
        //     <Text className={classes.label}>{title}</Text>
        //     <Text className={classes.description}>{description}</Text>
        //     </div>
        //     <Radio.Indicator ml='auto' />
        // </Group>
        // </Radio.Card>
    )
}