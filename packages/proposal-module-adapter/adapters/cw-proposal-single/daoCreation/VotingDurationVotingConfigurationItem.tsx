import Emoji from 'a11y-react-emoji'
import { useTranslation } from 'react-i18next'

import {
  DaoCreationConfigItem,
  DaoCreationConfigItemInputProps,
  DurationUnits,
  DurationUnitsValues,
} from '@dao-dao/tstypes'
import { NumberInput, SelectInput } from '@dao-dao/ui'
import { validatePositive, validateRequired } from '@dao-dao/utils'

import { DaoCreationConfig } from '../types'

export const VotingDurationIcon = () => {
  const { t } = useTranslation()
  return <Emoji label={t('emoji.hourglass')} symbol="⏳" />
}

export const VotingDurationInput = ({
  data: { votingDuration },
  register,
  setValue,
  errors,
}: DaoCreationConfigItemInputProps<DaoCreationConfig>) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-row gap-2">
      <NumberInput
        containerClassName="grow"
        error={errors?.votingDuration?.value}
        fieldName="votingDuration.value"
        onMinus={() =>
          setValue(
            'votingDuration.value',
            Math.max(votingDuration.value - 1, 1)
          )
        }
        onPlus={() =>
          setValue(
            'votingDuration.value',
            Math.max(votingDuration.value + 1, 1)
          )
        }
        register={register}
        sizing="sm"
        step={1}
        validation={[
          validatePositive,
          validateRequired,
          // Prevent < 60 second voting duration since DAOs will brick
          // if the voting duration is shorter tahn 1 block.
          (value) =>
            votingDuration?.units !== DurationUnits.Seconds ||
            value >= 60 ||
            'Cannot be shorter than 60 seconds.',
        ]}
      />

      <SelectInput
        error={errors?.votingDuration?.units}
        fieldName="votingDuration.units"
        register={register}
        validation={[validateRequired]}
      >
        {DurationUnitsValues.map((type, idx) => (
          <option key={idx} value={type}>
            {t(`unit.${type}`, {
              count: votingDuration?.value,
            }).toLocaleLowerCase()}
          </option>
        ))}
      </SelectInput>
    </div>
  )
}

export const VotingDurationVotingConfigurationItem: DaoCreationConfigItem<DaoCreationConfig> =
  {
    accentColor: '#c3935e1a',
    Icon: VotingDurationIcon,
    nameI18nKey: 'form.votingDurationTitle',
    descriptionI18nKey: 'form.votingDurationDescription',
    Input: VotingDurationInput,
  }
