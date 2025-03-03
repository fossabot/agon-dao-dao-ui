import { GasPrice } from '@cosmjs/stargate'
import {
  ChainInfoID,
  ChainInfoMap,
  WalletManagerProvider,
  WalletType,
  useWallet,
} from '@noahsaso/cosmodal'
import { isMobile } from '@walletconnect/browser-utils'
import { ComponentType, PropsWithChildren, ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { signingCosmWasmClientAtom } from '@dao-dao/state'
import { Loader as DefaultLoader, LoaderProps } from '@dao-dao/stateless'
import {
  CHAIN_ID,
  CHAIN_REST_ENDPOINT,
  CHAIN_RPC_ENDPOINT,
  SITE_URL,
  STARGAZE_REST_ENDPOINT,
  STARGAZE_RPC_ENDPOINT,
  WC_ICON_PATH,
} from '@dao-dao/utils'

// Assert environment variable CHAIN_ID is a valid chain.
if (!(Object.values(ChainInfoID) as string[]).includes(CHAIN_ID)) {
  throw new Error(`CHAIN_ID constant (${CHAIN_ID}) is an invalid chain ID.`)
}

export interface WalletProviderProps {
  children: ReactNode
  Loader?: ComponentType<LoaderProps>
}

export const WalletProvider = ({
  Loader = DefaultLoader,
  children,
}: WalletProviderProps) => {
  const { t } = useTranslation()

  return (
    <WalletManagerProvider
      // Use environment variables to determine RPC/REST nodes.
      chainInfoOverrides={[
        {
          // Typechecked above.
          ...ChainInfoMap[CHAIN_ID as ChainInfoID],
          rpc: CHAIN_RPC_ENDPOINT,
          rest: CHAIN_REST_ENDPOINT,
        },
        {
          ...ChainInfoMap[ChainInfoID.Stargaze1],
          rpc: STARGAZE_RPC_ENDPOINT,
          rest: STARGAZE_REST_ENDPOINT,
        },
      ]}
      classNames={{
        modalOverlay: '!backdrop-brightness-50 !backdrop-filter',
        modalContent:
          '!p-6 !max-w-md !bg-background-base !rounded-lg !border !border-border-interactive-focus',
        modalCloseButton:
          '!p-1 hover:!bg-background-secondary !rounded-full !transition !absolute !top-2 !right-2 ',
        modalHeader: '!header-text',
        modalSubheader: '!title-text',
        wallet: '!rounded-lg !bg-background-secondary !p-4 !shadow-none',
        walletImage: '!rounded-full',
        walletName: '!primary-text',
        walletDescription: '!caption-text',
        textContent: '!primary-text',
      }}
      defaultChainId={CHAIN_ID}
      enabledWalletTypes={[
        WalletType.Keplr,
        // Only allow WalletConnect on mainnet.
        ...(CHAIN_ID === ChainInfoID.Juno1
          ? [WalletType.WalletConnectKeplr]
          : []),
      ]}
      getSigningCosmWasmClientOptions={(chainInfo) => ({
        gasPrice: GasPrice.fromString(
          '0.0025' + chainInfo.feeCurrencies[0].coinMinimalDenom
        ),
      })}
      getSigningStargateClientOptions={(chainInfo) => ({
        gasPrice: GasPrice.fromString(
          '0.0025' + chainInfo.feeCurrencies[0].coinMinimalDenom
        ),
      })}
      localStorageKey="connectedWalletId"
      preselectedWalletType={
        // If on a mobile device, default to WalletConnect.
        isMobile() ? WalletType.WalletConnectKeplr : undefined
      }
      renderLoader={() => <Loader size={64} />}
      walletConnectClientMeta={{
        name: t('meta.title'),
        description: t('meta.description'),
        url: SITE_URL,
        icons: [
          (typeof window === 'undefined' ? SITE_URL : window.location.origin) +
            WC_ICON_PATH,
        ],
      }}
    >
      <InnerWalletProvider>{children}</InnerWalletProvider>
    </WalletManagerProvider>
  )
}

const InnerWalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const setSigningCosmWasmClient = useSetRecoilState(signingCosmWasmClientAtom)
  const { signingCosmWasmClient } = useWallet()

  // Save client in recoil atom so it can be used by selectors.
  useEffect(() => {
    setSigningCosmWasmClient(signingCosmWasmClient)
  }, [setSigningCosmWasmClient, signingCosmWasmClient])

  return <>{children}</>
}
