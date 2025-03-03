import { ChainInfoID, useWallet } from '@noahsaso/cosmodal'
import { ComponentType, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { walletStargazeNftCardInfosSelector } from '@dao-dao/state'
import {
  Loader as DefaultLoader,
  LoaderProps,
  Modal,
  ModalProps,
  NftSelectionModal,
  useCachedLoadable,
  useDaoInfoContext,
} from '@dao-dao/stateless'
import { NftCardInfo } from '@dao-dao/types'
import { loadableToLoadingDataWithError, processError } from '@dao-dao/utils'

import { SuspenseLoader } from './SuspenseLoader'

export interface StargazeNftImportModalProps
  extends Pick<ModalProps, 'onClose'> {
  Loader?: ComponentType<LoaderProps>
}

export const InnerStargazeNftImportModal = ({
  onClose,
  Loader = DefaultLoader,
}: StargazeNftImportModalProps) => {
  const { t } = useTranslation()
  const { coreAddress, name: daoName } = useDaoInfoContext()
  const { signingCosmWasmClient, address: stargazeWalletAddress } = useWallet(
    ChainInfoID.Stargaze1
  )
  const [selected, setSelected] = useState<string[]>([])
  const getIdForNft = (nft: NftCardInfo) =>
    `${nft.collection.address}:${nft.tokenId}`

  const nfts = loadableToLoadingDataWithError(
    useCachedLoadable(
      stargazeWalletAddress
        ? walletStargazeNftCardInfosSelector(stargazeWalletAddress)
        : undefined
    )
  )

  const [loading, setLoading] = useState(false)
  const onAction = useCallback(async () => {
    if (!signingCosmWasmClient || !stargazeWalletAddress) {
      toast.error(t('error.connectWalletToContinue'))
      return
    }
    if (!selected.length || nfts.loading || nfts.errored) {
      toast.error(t('error.noNftsSelected'))
      return
    }

    setLoading(true)
    try {
      const selectedNfts = nfts.data.filter((nft) =>
        selected.includes(getIdForNft(nft))
      )
      await selectedNfts.reduce(
        (p, { collection: { address }, tokenId }) =>
          p.then(() =>
            signingCosmWasmClient
              .execute(
                stargazeWalletAddress,
                address,
                {
                  send_nft: {
                    // IBC Bridge
                    contract:
                      'stars1ns8vqlngqnv270kng0k54tlv6xm2uxg5j4797zuv5vmx96ydmzfqg8dzh5',
                    token_id: tokenId,
                    // IBC
                    msg: Buffer.from(
                      JSON.stringify({
                        receiver: coreAddress,
                        channel_id: 'channel-32',
                        // Timeout in 5 minutes.
                        timeout: {
                          // Nanoseconds.
                          timestamp: (
                            (Date.now() + 5 * 60 * 1000) *
                            1e6
                          ).toString(),
                        },
                      }),
                      'utf8'
                    ).toString('base64'),
                  },
                },
                'auto'
              )
              .then(() => undefined)
              .catch(() => undefined)
          ),
        Promise.resolve(undefined)
      )
    } catch (error) {
      console.error(error)
      toast.error(processError(error))
    } finally {
      setLoading(false)
    }
  }, [
    coreAddress,
    nfts,
    selected,
    signingCosmWasmClient,
    stargazeWalletAddress,
    t,
  ])

  return (
    <NftSelectionModal
      Loader={Loader}
      actionLabel={t('button.import')}
      actionLoading={loading}
      getIdForNft={getIdForNft}
      header={{
        title: t('title.depositNfts'),
        subtitle: t('info.depositNftsModalSubtitle', { daoName }),
      }}
      nfts={nfts}
      onAction={onAction}
      onClose={onClose}
      onDeselectAll={() => setSelected([])}
      onNftClick={(nft) => {
        const key = getIdForNft(nft)
        setSelected((current) =>
          current.includes(key)
            ? current.filter((a) => a !== key)
            : [...current, key]
        )
      }}
      onSelectAll={() =>
        nfts.loading || nfts.errored
          ? () => {}
          : setSelected(nfts.data.map((nft) => getIdForNft(nft)) ?? [])
      }
      selectedIds={selected}
    />
  )
}

export const StargazeNftImportModal = ({
  onClose,
  Loader = DefaultLoader,
}: StargazeNftImportModalProps) => (
  <SuspenseLoader
    fallback={
      <Modal containerClassName="!p-40" onClose={onClose} visible>
        <Loader />
      </Modal>
    }
  >
    <InnerStargazeNftImportModal onClose={onClose} />
  </SuspenseLoader>
)
