import { WalletProfile } from '../wallet'
import { LoadingData } from './common'
import { CopyToClipboardProps } from './CopyToClipboard'

export interface ProfileDisplayProps {
  address: string
  loadingProfile: LoadingData<WalletProfile>
  imageSize?: number
  hideImage?: boolean
  copyToClipboardProps?: Partial<Omit<CopyToClipboardProps, 'label' | 'value'>>
}
