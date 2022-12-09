import { EdgeCurrencyWallet } from 'edge-core-js'
import { combineReducers, Reducer } from 'redux'

import { FIO_WALLET_TYPE, SPECIAL_CURRENCY_INFO, STAKING_BALANCES } from '../../constants/WalletAndCurrencyConstants'
import { Action } from '../../types/reduxTypes'
import { GuiWallet } from '../../types/types'
import { getWalletName } from '../../util/CurrencyWalletHelpers'
import { tokenIdsToCurrencyCodes } from '../../util/utils'

export interface WalletsState {
  byId: { [walletId: string]: GuiWallet }
  selectedWalletId: string
  selectedCurrencyCode: string
  walletLoadingProgress: { [walletId: string]: number }
  fioWallets: EdgeCurrencyWallet[]
}

const byId = (state = {}, action: Action): WalletsState['byId'] => {
  switch (action.type) {
    case 'CORE/WALLETS/UPDATE_WALLETS': {
      const wallets = action.data.currencyWallets
      const out = {}
      for (const walletId of Object.keys(wallets)) {
        // @ts-expect-error
        out[walletId] = {
          // @ts-expect-error
          ...state[walletId],
          ...makeGuiWallet(wallets[walletId])
        }
      }

      return out
    }

    case 'UI/WALLETS/UPSERT_WALLETS': {
      const { wallets } = action.data
      const out = { ...state }
      for (const wallet of wallets) {
        // @ts-expect-error
        if (!state[wallet.id]) {
          continue
        }
        // @ts-expect-error
        out[wallet.id] = {
          // @ts-expect-error
          ...state[wallet.id],
          ...makeGuiWallet(wallet)
        }
      }
      return out
    }

    default:
      return state
  }
}

const walletLoadingProgress = (state = {}, action: Action): WalletsState['walletLoadingProgress'] => {
  switch (action.type) {
    case 'INSERT_WALLET_IDS_FOR_PROGRESS': {
      const activeWalletIdList = action.data.activeWalletIds
      const activeWalletIdProgress = {}
      activeWalletIdList.forEach(item => {
        // @ts-expect-error
        activeWalletIdProgress[item] = 0
      })
      return activeWalletIdProgress
    }

    case 'UPDATE_WALLET_LOADING_PROGRESS': {
      // prevent backwards progress
      // @ts-expect-error
      if (action.data.addressLoadingProgress < state[action.data.walletId]) return state
      return {
        ...state,
        [action.data.walletId]: action.data.addressLoadingProgress
      }
    }

    case 'RESET_WALLET_LOADING_PROGRESS': {
      return {
        ...state,
        [action.data.walletId]: 0.05
      }
    }

    default:
      return state
  }
}

const selectedWalletId = (state = '', action: Action): string => {
  switch (action.type) {
    case 'UI/WALLETS/SELECT_WALLET': {
      return action.data.walletId
    }

    case 'ACCOUNT_INIT_COMPLETE': {
      if (action.data == null) throw new TypeError('Invalid action')
      if (action.data.walletId === '') return state
      return action.data.walletId
    }

    default:
      return state
  }
}

const selectedCurrencyCode = (state = '', action: Action): string => {
  switch (action.type) {
    case 'UI/WALLETS/SELECT_WALLET': {
      return action.data.currencyCode
    }

    case 'ACCOUNT_INIT_COMPLETE': {
      if (action.data == null) throw new TypeError('Invalid action')
      if (action.data.currencyCode === '') return state
      return action.data.currencyCode
    }

    default:
      return state
  }
}

export function makeGuiWallet(wallet: EdgeCurrencyWallet): GuiWallet {
  const { blockHeight, currencyInfo, id, type } = wallet
  const { currencyCode, metaTokens, pluginId } = currencyInfo
  const name: string = getWalletName(wallet)

  const fiatCurrencyCode: string = wallet.fiatCurrencyCode.replace('iso:', '')
  const isoFiatCurrencyCode: string = wallet.fiatCurrencyCode
  const enabledTokens = tokenIdsToCurrencyCodes(wallet.currencyConfig, wallet.enabledTokenIds)

  const nativeBalances: { [currencyCode: string]: string } = {}
  // Add parent currency balance to balances
  nativeBalances[currencyCode] = wallet.balances[currencyCode] ?? '0'

  // Add parent currency currencyCode
  const currencyNames: { [currencyCode: string]: string } = {}
  currencyNames[currencyCode] = wallet.currencyInfo.displayName

  metaTokens.forEach(metaToken => {
    const currencyCode: string = metaToken.currencyCode
    const currencyName: string = metaToken.currencyName
    const balance: string = wallet.balances[currencyCode] ?? '0'

    // Add token balance to allBalances
    nativeBalances[currencyCode] = balance
    currencyNames[currencyCode] = currencyName
  })
  enabledTokens.forEach(customToken => {
    nativeBalances[customToken] = wallet.balances[customToken] ?? '0'
  })
  if (SPECIAL_CURRENCY_INFO[pluginId]?.isStakingSupported) {
    for (const cCodeKey in STAKING_BALANCES) {
      const stakingCurrencyCode = `${currencyCode}${STAKING_BALANCES[cCodeKey]}`
      nativeBalances[stakingCurrencyCode] = wallet.balances[stakingCurrencyCode] ?? '0'
    }
  }

  const primaryNativeBalance: string = nativeBalances[currencyCode]

  const newWallet: GuiWallet = {
    id,
    type,
    name,
    pluginId,
    primaryNativeBalance,
    nativeBalances,
    currencyNames,
    currencyCode,
    isoFiatCurrencyCode,
    fiatCurrencyCode,
    metaTokens,
    enabledTokens,
    blockHeight
  }

  return newWallet
}

const fioWallets: Reducer<WalletsState['fioWallets'], Action> = (state = [], action) => {
  switch (action.type) {
    case 'CORE/WALLETS/UPDATE_WALLETS': {
      const wallets = action.data.currencyWallets
      const fioWallets: EdgeCurrencyWallet[] = []
      for (const walletId of Object.keys(wallets)) {
        if (wallets[walletId] && wallets[walletId].type === FIO_WALLET_TYPE) {
          fioWallets.push(wallets[walletId])
        }
      }

      return fioWallets
    }

    default:
      return state
  }
}

export const wallets = combineReducers<WalletsState, Action>({
  byId,
  selectedWalletId,
  selectedCurrencyCode,
  walletLoadingProgress,
  fioWallets
})
