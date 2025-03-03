// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { useWallet } from '@noahsaso/cosmodal'
import cloneDeep from 'lodash.clonedeep'
import { GetStaticProps, NextPage } from 'next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { serverSideTranslations } from '@dao-dao/i18n/serverSideTranslations'
import { walletTransactionAtom } from '@dao-dao/state'
import { SuspenseLoader } from '@dao-dao/stateful'
import { ActionsProvider, useActions } from '@dao-dao/stateful/actions'
import {
  Loader,
  ProfileDisconnectedCard,
  Wallet,
  WalletProps,
} from '@dao-dao/stateless'
import { WalletTransactionForm } from '@dao-dao/types'
import {
  Action,
  ActionKey,
  ActionOptionsContextType,
  UseDefaults,
  UseTransformToCosmos,
} from '@dao-dao/types/actions'
import {
  CHAIN_BECH32_PREFIX,
  CHAIN_ID,
  cwMsgToEncodeObject,
  processError,
} from '@dao-dao/utils'

import { ProfileHomeCard } from '@/components'

const InnerWallet = () => {
  const { t } = useTranslation()

  const {
    connected,
    address: walletAddress,
    signingCosmWasmClient,
  } = useWallet()

  const actions = useActions()

  // Call relevant action hooks in the same order every time.
  const actionsWithData: Partial<
    Record<
      ActionKey,
      {
        action: Action
        transform: ReturnType<UseTransformToCosmos>
        defaults: ReturnType<UseDefaults>
      }
    >
  > = actions.reduce(
    (acc, action) => ({
      ...acc,
      [action.key]: {
        action,
        transform: action.useTransformToCosmos(),
        defaults: action.useDefaults(),
      },
    }),
    {}
  )

  const [_walletTransactionAtom, setWalletTransactionAtom] = useRecoilState(
    walletTransactionAtom
  )

  const formMethods = useForm<WalletTransactionForm>({
    mode: 'onChange',
    // Don't clone every render.
    defaultValues: useMemo(
      () => cloneDeep(_walletTransactionAtom),
      [_walletTransactionAtom]
    ),
  })
  // Trigger validation on first render, in case loaded from localStorage.
  useEffect(() => {
    formMethods.trigger()
  }, [formMethods])

  const walletTransaction = formMethods.watch()
  // Debounce saving latest data to atom and thus localStorage every 10 seconds.
  useEffect(() => {
    // Deep clone to prevent values from becoming readOnly.
    const timeout = setTimeout(
      () => setWalletTransactionAtom(cloneDeep(walletTransaction)),
      10000
    )
    return () => clearTimeout(timeout)
  }, [setWalletTransactionAtom, walletTransaction])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const execute: WalletProps['execute'] = useCallback(
    async (data) => {
      if (!signingCosmWasmClient || !walletAddress) {
        setError(t('error.connectWalletToContinue'))
        return
      }

      setLoading(true)
      setError('')
      setTxHash('')

      try {
        const encodeObjects = data.map((msg) =>
          cwMsgToEncodeObject(msg, walletAddress)
        )
        const tx = await signingCosmWasmClient.signAndBroadcast(
          walletAddress,
          encodeObjects,
          'auto'
        )

        toast.success(t('success.transactionExecuted'))
        setTxHash(tx.transactionHash)
      } catch (err) {
        const error = processError(err)
        console.error(error)
        setError(error)
      } finally {
        setLoading(false)
      }
    },
    [signingCosmWasmClient, t, walletAddress]
  )

  return (
    <Wallet
      SuspenseLoader={SuspenseLoader}
      actions={actions}
      actionsWithData={actionsWithData}
      connected={connected}
      error={error}
      execute={execute}
      formMethods={formMethods}
      loading={loading}
      rightSidebarContent={
        connected ? <ProfileHomeCard /> : <ProfileDisconnectedCard />
      }
      txHash={txHash}
    />
  )
}

const WalletPage: NextPage = () => {
  const { address: walletAddress = '' } = useWallet()

  return (
    <ActionsProvider
      // If walletAddress changes, refresh actions.
      key={walletAddress}
      options={{
        chainId: CHAIN_ID,
        bech32Prefix: CHAIN_BECH32_PREFIX,
        address: walletAddress,
        context: {
          type: ActionOptionsContextType.Wallet,
        },
      }}
    >
      {/* Suspend to prevent hydration error since we load state on first render from localStorage. */}
      <SuspenseLoader fallback={<Loader />}>
        <InnerWallet />
      </SuspenseLoader>
    </ActionsProvider>
  )
}

export default WalletPage

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['translation'])),
  },
})
