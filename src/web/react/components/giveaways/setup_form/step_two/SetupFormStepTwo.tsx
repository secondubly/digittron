import { SetupFormPanel } from "../../SetupFormPanel"
import type { UseFormReturnType } from "@mantine/form"

interface GiveawayFormValues {
    giveawayType: string
    participants?: string[]
}

interface CheckboxItem {
    title: string;
    label: string;
}

export const SetupFormStepTwo: React.FC<{ giveawayType: string, participants: CheckboxItem[], form: UseFormReturnType<GiveawayFormValues> }> = ({ giveawayType, participants, form }) => {
    return <SetupFormPanel label={"Choose who can participate:"} options={participants} form={form} />
}