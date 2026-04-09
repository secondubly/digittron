import { Button, Stack, Stepper, Group, Radio } from "@mantine/core"
import { useForm } from '@mantine/form'
import { IconMessageFilled, IconNumber123, IconUserFilled } from "@tabler/icons-react"
import { GiveawayCard } from "../GiveawayCard"
import { useState } from "react"
import classes from './SetupForm.module.css'
import { SetupFormStepTwo } from "./step_two/SetupFormStepTwo"
import { SetupFormStepThree } from "./step_three/SetupFormStepThree"
import type { GiveawayFormValues, ParticipantCheckbox } from "../../../lib/types"

const BackButton: React.FC<{ disabled: boolean, back: () => void}> = ({ disabled, back }) => {
    return <Button disabled={disabled} onClick={back}>Back</Button>
}

const NextButton: React.FC<{next: () => void, 
    activePage: number, 
    disabled: boolean}> = ({ next, activePage, disabled }) => {
    return <Button disabled={disabled} onClick={next}>{activePage === 2 ? 'Done' : 'Next'}</Button>
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
        label: 'Keyword',
        value: 'keyword',
        description: 'Giveaway to chatters who type a keyword.'
    },
    {
        icon: IconNumber123,
        label: 'Random Number',
        value: 'randomNumber',
        description: 'Giveaway to chatters who guess a number.'
    }
]

const participantOptions: ParticipantCheckbox[] = [
    {
        label: 'Viewers',
        value: 'viewers'
    },
    {
        label: 'Regulars',
        value: 'regulars'
    },
    {
        label: 'VIPs',
        value: 'vips'
    },
    {
        label: 'Subscribers',
        value: 'subscribers'
    },
    {
        label: 'Moderators',
        value: 'moderators'
    }
]

const validatePageThree = (giveawayType: string, keyword?: string) => {
    if (giveawayType === 'keyword' && (!keyword || keyword.trim() === "")) {
        return 'You must choose a keyword!'
    }

    return null
}

export const SetupForm = () => {
    const [activePage, setActivePage] = useState(0)

    const form = useForm<GiveawayFormValues>({
        mode: 'uncontrolled',
        initialValues: {
            giveawayType: 'activeChatters',
            participants: participantOptions.map(({ value }) => value),
            keyword: undefined,
            minRange: undefined,
            maxRange: undefined
        },
        validate: (values) => {
            switch (activePage) {
                case 0:
                    return {
                        giveawayType: !values.giveawayType ? 'Please select a giveaway type.' : null
                    }
                case 1:
                    return {
                        participants: !values.participants?.length ? 'Please select at least one participant.' : null
                    }
                case 2:
                    return {
                        keyword: validatePageThree(values.giveawayType, values.keyword)
                    }
                default:
                    return {}
            }
        }
    })

    const cards = giveawayOptions.map((item) => (
        <GiveawayCard key={item.value} label={item.label} description={item.description} icon={item.icon} value={item.value} />
    ))

    const prevStep = () => (setActivePage((current) => (current > 0 ? current - 1 : current)))

    const nextStep = async () => {
        const result = await form.validate()
        if (!result.hasErrors) {
            setActivePage((current) => (current < 3 ? current + 1 : current))
        }
    }

    return (
        <form onSubmit={form.onSubmit(console.log)} className="giveawayForm">
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
                        <SetupFormStepTwo participants={participantOptions} form={form} />
                    </Stack>
                </Stepper.Step>
                <Stepper.Step>
                    <SetupFormStepThree giveawayType={form.getValues().giveawayType} form={form} />
                </Stepper.Step>
            </Stepper>
            <Group justify='space-between' mt='xl'>
                <BackButton disabled={activePage === 0} back={prevStep} />
                <NextButton disabled={!form.isValid()} next={nextStep} activePage={activePage} />
            </Group>
        </form>
    )
}