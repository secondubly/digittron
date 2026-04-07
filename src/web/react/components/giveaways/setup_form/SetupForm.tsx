import { Button, Stack, Stepper, Group, Radio } from "@mantine/core"
import { useForm } from '@mantine/form'
import { IconMessageFilled, IconNumber123, IconUserFilled } from "@tabler/icons-react"
import { GiveawayCard } from "../GiveawayCard"
import { useState } from "react"
import classes from './SetupForm.module.css'
import { SetupFormStepTwo } from "./step_two/SetupFormStepTwo"

interface GiveawayFormValues {
    giveawayType: string
    participants?: string[]
}

const BackButton: React.FC<{ disabled: boolean, back: () => void}> = ({ disabled, back }) => {
    return <Button disabled={disabled} onClick={back}>Back</Button>
}

const NextButton: React.FC<{next: () => void}> = ({ next }) => {
    return <Button onClick={next}>Next</Button>
}

const giveawayOptions = [
    {
        icon: IconUserFilled,
        label: 'Active Chatters',
        value: 'activeChatters',
        description: 'Giveaway to active chatters in chat.'
    },
    {
        icon: IconMessageFilled,
        label: 'Keywords',
        value: 'keywords',
        description: 'Giveaway to chatters who type a keyword.'
    },
    {
        icon: IconNumber123,
        label: 'Random Number',
        value: 'randomNumber',
        description: 'Giveaway to chatters who guess a number.'
    }
]

const participantOptions = [
    {
        title: 'Viewers',
        label: 'viewers'
    },
    {
        title: 'Regulars',
        label: 'regulars'
    },
    {
        title: 'VIPs',
        label: 'vips'
    },
    {
        title: 'Subscribers',
        label: 'subscribers'
    },
    {
        title: 'Moderators',
        label: 'moderators'
    }
]

export const SetupForm = () => {
    const [activePage, setActivePage] = useState(0)

    const form = useForm<GiveawayFormValues>({
        mode: 'uncontrolled',
        initialValues: {
            giveawayType: '',
            participants: participantOptions.map(({label}) => label)
        }
    })

    const cards = giveawayOptions.map((item) => (
        <GiveawayCard key={item.value} label={item.label} description={item.description} icon={item.icon} value={item.value} />
    ))

    const prevStep = () => (setActivePage((current) => (current > 0 ? current - 1 : current)))

    const nextStep = async () => {
        setActivePage((current) => (current < 3 ? current + 1 : current))
    }

    return (
        <form onSubmit={form.onSubmit(console.log)}>
            <Stepper active={activePage} styles={{'steps': { display: 'none' }}}>
                <Stepper.Step label='Giveaway Type'>
                    <Radio.Group name='giveawayType' 
                    label="Select the type of giveaway to run." 
                    classNames={{ label: classes.radioGroupLabel }}
                    {...form.getInputProps('giveawayType')}>
                        <Stack>
                            {cards}
                        </Stack>
                    </Radio.Group>
                </Stepper.Step>
                <Stepper.Step>
                    <Stack>
                        <SetupFormStepTwo participants={participantOptions} giveawayType={form.values.giveawayType} form={form} />
                    </Stack>
                </Stepper.Step>
            </Stepper>
            <Group justify='space-between' mt='xl'>
                <BackButton disabled={activePage === 0} back={prevStep} />
                <NextButton next={nextStep} />
            </Group>
        </form>
    )
}