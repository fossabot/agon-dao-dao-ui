import { useRecoilValue } from 'recoil'

import { SingleChoiceProposal } from '@dao-dao/types/contracts/CwdProposalSingle.v2'
import { Proposal } from '@dao-dao/types/contracts/CwProposalSingle.v1'

import { useProposalModuleAdapterOptions } from '../../../react'
import { proposalSelector } from '../contracts/CwdProposalSingle.common.recoil'

export const useProposal = (): Proposal | SingleChoiceProposal => {
  const {
    proposalModule: { address: proposalModuleAddress },
    proposalNumber,
  } = useProposalModuleAdapterOptions()

  const { proposal } = useRecoilValue(
    proposalSelector({
      contractAddress: proposalModuleAddress,
      params: [
        {
          proposalId: proposalNumber,
        },
      ],
    })
  )

  return proposal
}
