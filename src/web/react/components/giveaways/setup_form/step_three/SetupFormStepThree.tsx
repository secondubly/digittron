import type { UseFormReturnType } from "@mantine/form";
import type { GiveawayFormValues } from "../../../../lib/types";
import { ActiveChatterFormStep } from "./ActiveChatterFormStep.js";
import { KeywordFormStep } from "./KeywordFormStep.js";
import { RandomNumberFormStep } from "./RandomNumberFormStep.js";

export const SetupFormStepThree: React.FC<{ giveawayType: string, form: UseFormReturnType<GiveawayFormValues> }> = ({ giveawayType, form }) => {
    switch (giveawayType) {
        case 'activeChatters':
            return <ActiveChatterFormStep form={form} />
        case 'keyword':
            return <KeywordFormStep form={form} />
        case 'randomNumber':
            return <RandomNumberFormStep form={form} />
        default:
            return null
    }
}