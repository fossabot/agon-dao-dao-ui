import {
  DepositRefundPolicy,
  DurationUnits,
  ProposalModuleAdapter,
} from '@dao-dao/types'
import { Vote } from '@dao-dao/types/contracts/CwdProposalSingle.common'

import {
  NewProposal,
  makeDepositInfoSelector,
  makeUseActions,
  makeUseProfileNewProposalCardInfoLines,
  reverseProposalInfosSelector,
} from './common'
import {
  ProposalActionDisplay,
  ProposalLine,
  ProposalStatusAndInfo,
  ProposalVoteTally,
  ProposalVotes,
  ProposalWalletVote,
} from './components'
import {
  AllowRevotingVotingConfigItem,
  ProposalDepositVotingConfigItem,
  QuorumVotingConfigItem,
  ThresholdVotingConfigItem,
  VotingDurationVotingConfigItem,
  getInstantiateInfo,
} from './daoCreation'
import { fetchPreProposeAddress, makeGetProposalInfo } from './functions'
import {
  useCastVote,
  useProfileVoteCardOptions,
  useProposalExecutionTxHash,
  useProposalRefreshers,
  useWalletVoteInfo,
} from './hooks'
import { DaoCreationConfig, NewProposalForm } from './types'

export const CwdProposalSingleAdapter: ProposalModuleAdapter<
  DaoCreationConfig,
  Vote,
  NewProposalForm
> = {
  id: 'CwdProposalSingle',
  contractNames: [
    'cw-govmod-single',
    'cw-proposal-single',
    // V2
    'cwd-proposal-single',
  ],

  // TODO: Make common accessible somehow inside components and hooks via hooks?
  // Make react provider for this common object?
  loadCommon: (options) => {
    // Make here so we can pass into common hooks and components that need it.
    const depositInfoSelector = makeDepositInfoSelector({
      chainId: options.chainId,
      proposalModuleAddress: options.proposalModule.address,
      version: options.proposalModule.version,
      preProposeAddress: options.proposalModule.preProposeAddress,
    })

    return {
      // Fields
      fields: {
        defaultNewProposalForm: {
          title: '',
          description: '',
          actionData: [],
        },
        newProposalFormTitleKey: 'title',
      },

      // Selectors
      selectors: {
        reverseProposalInfos: (props) =>
          reverseProposalInfosSelector({
            chainId: options.chainId,
            proposalModuleAddress: options.proposalModule.address,
            proposalModulePrefix: options.proposalModule.prefix,
            ...props,
          }),
        depositInfo: depositInfoSelector,
      },

      // Hooks
      hooks: {
        useActions: makeUseActions(options),
        useProfileNewProposalCardInfoLines:
          makeUseProfileNewProposalCardInfoLines({
            options,
            depositInfoSelector,
          }),
      },

      // Components
      components: {
        NewProposal: (props) => (
          <NewProposal
            depositInfoSelector={depositInfoSelector}
            options={options}
            {...props}
          />
        ),
      },
    }
  },

  load: (options) => ({
    // Selectors
    selectors: {},

    // Functions
    functions: {
      getProposalInfo: makeGetProposalInfo(options),
    },

    // Hooks
    hooks: {
      useCastVote,
      useProposalRefreshers,
      useProposalExecutionTxHash,
      useProfileVoteCardOptions,
      useWalletVoteInfo,
    },

    // Components
    components: {
      ProposalStatusAndInfo,
      ProposalActionDisplay,
      ProposalWalletVote,
      ProposalVotes,
      ProposalVoteTally,
      ProposalLine,
    },
  }),

  queries: {
    proposalCount: {
      proposal_count: {},
    },
  },

  functions: {
    fetchPreProposeAddress,
  },

  daoCreation: {
    defaultConfig: {
      threshold: {
        majority: true,
        value: 75,
      },
      quorumEnabled: true,
      quorum: {
        majority: false,
        value: 20,
      },
      votingDuration: {
        value: 1,
        units: DurationUnits.Weeks,
      },
      proposalDeposit: {
        enabled: false,
        amount: 10,
        type: 'native',
        cw20Address: '',
        cw20TokenInfo: undefined,
        refundPolicy: DepositRefundPolicy.OnlyPassed,
      },
      allowRevoting: false,
    },

    votingConfig: {
      items: [VotingDurationVotingConfigItem, ProposalDepositVotingConfigItem],
      advancedItems: [
        AllowRevotingVotingConfigItem,
        ThresholdVotingConfigItem,
        QuorumVotingConfigItem,
      ],
      advancedWarningI18nKeys: [
        'daoCreationAdapter.CwdProposalSingle.advancedWarning',
      ],
    },

    getInstantiateInfo,
  },
}
