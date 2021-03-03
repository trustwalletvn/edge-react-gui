// @flow

import * as React from 'react'

import { ModalCloseArrow, ModalTitle } from '../themed/ModalParts.js'
import { ThemedModal } from '../themed/ThemedModal.js'
import { WalletList } from '../themed/WalletList.js'
import { type AirshipBridge } from './modalParts.js'

export type WalletListResult = {
  walletId?: string,
  currencyCode?: string
}

type OwnProps = {
  bridge: AirshipBridge<WalletListResult>,
  headerTitle: string,
  showCreateWallet?: boolean,
  excludeWalletIds?: string[],
  allowedCurrencyCodes?: string[],
  excludeCurrencyCodes?: string[]
}

type State = {
  search: string
}

type Props = OwnProps

class WalletListMenuModalComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { search: '' }
  }

  onSearchFilterChange = (search: string) => this.setState({ search })
  handleOnPress = (walletId: string, currencyCode: string) => this.props.bridge.resolve({ walletId, currencyCode })
  render() {
    const { bridge, headerTitle } = this.props
    return (
      <ThemedModal bridge={bridge} onCancel={() => bridge.resolve({})}>
        <ModalTitle>{headerTitle}</ModalTitle>
        <WalletList onPress={this.handleOnPress} searchText="" searching={false} isModal />
        <ModalCloseArrow onPress={() => bridge.resolve({})} />
      </ThemedModal>
    )
  }
}

export const WalletListModal = WalletListMenuModalComponent
