import React, { Component } from 'react'
import { Text, TouchableOpacity, View, TouchableHighlight } from 'react-native'
import { Icon, Title } from 'native-base'
import { Actions } from 'react-native-router-flux'
import Menu, { MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu'
import { toggleSelectedWalletListModal, toggleScanToWalletListModal, toggleTransactionsWalletListModal} from '../../WalletListModal/action'

import {
  enableWalletListModalVisibility,
  disableWalletListModalVisibility
} from '../../WalletListModal/action'
import {WalletListModalConnect} from '../../WalletListModal/WalletListModal.ui'
import { connect } from 'react-redux'

class Body extends Component {
  render () {
    switch(this.props.routes.scene.sceneKey) {
      case 'scan':
        return <ExampleFromWalletConnect walletList={this.props.walletList}
          toggleFunction='_onPressToggleSelectedWalletModal'
               visibleFlag='selectedWalletListModalVisibility' />

      case 'request':
        return <ExampleFromWalletConnect wallets={this.props.walletList} />

      case 'transactionList':
        return <ExampleFromWalletConnect wallets={this.props.walletList}
          toggleFunction='_onPressToggleSelectedWalletModal'
               visibleFlag='selectedWalletListModalVisibility' />

      default:
        return <DefaultHeader routes={this.props.routes} />
    }
  }
}

const mapStateToProps = state => ({
  wallets:                           state.ui.wallets.byId,
  selectedWalletListModalVisibility: state.ui.scenes.scan.selectedWalletListModalVisibility,
  scanToWalletListModalVisibility:   state.ui.scenes.scan.scanToWalletListModalVisibility
})

export default connect((state) => (mapStateToProps))(Body)

class DefaultHeader extends Component {
  _renderTitle = () => {
    return this.props.routes.scene.title || 'Header'
  }

  render () {
    return <Title>{ this._renderTitle() }</Title>
  }
}

class ExampleFromWallet extends Component {

  _onPressToggleSelectedWalletModal = () => {
    console.log('inside onPressScanFromDropdownToggle')
    this.props.dispatch(toggleSelectedWalletListModal())
  }

  _onPressScanToDropdownToggle = () => {
    console.log('inside onPressScanToDropdownToggle')
    this.props.dispatch(toggleScanToWalletListModal())
  }

  render () {
    let topDisplacement =  66
    let selectionFunction = 'selectFromWallet'

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: "#FFF", fontSize: 20 }}>{this.props.selectedWallet.name}  </Text>

        <TouchableOpacity onPress={this[this.props.toggleFunction]}>
          <View>
            {!this.props.scanToWalletListModalVisibility && !this.props.addressModalVisible &&
              <Icon name="arrow-dropdown"  style={{ color: "#FFF", fontSize: 25 }} />
            }
          </View>
        </TouchableOpacity>
        {this.props[this.props.visibleFlag] && <WalletListModalConnect topDisplacement={topDisplacement} selectionFunction={selectionFunction} /> }
        {this.props.scanToWalletListModalVisibility && <WalletListModalConnect topDisplacement={topDisplacement} selectionFunction={'selectToWallet'} /> }
      </View>
    )
  }
}

export const ExampleFromWalletConnect = connect(state => ({
  walletList:        state.ui.wallets.byId,
  selectedWalletId:  state.ui.wallets.selectedWalletId,
  selectedWallet:    state.ui.wallets.byId[state.ui.wallets.selectedWalletId],
  activeWalletIds:   state.ui.wallets.activeWalletIds,
  archivedWalletIds: state.ui.wallets.archivedWalletIds,
  selectedWalletListModalVisibility: state.ui.scenes.scan.selectedWalletListModalVisibility,
  scanToWalletListModalVisibility:   state.ui.scenes.scan.scanToWalletListModalVisibility,
}))(ExampleFromWallet)
